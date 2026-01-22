'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Minus,
  Maximize,
  Code,
  Database,
  Undo,
  Redo,
  Wand2,
  Download,
  Save,
  Key,
  Layers,
} from 'lucide-react'
import { useSchemaStore } from '@/stores/schemaStore'
import { CollectionNode } from './CollectionNode'
import { FieldEditor } from './FieldEditor'
import { RelationConnector } from './RelationConnector'
import { SchemaCodePanel } from './SchemaCodePanel'

export function DataModeler() {
  const {
    schema,
    ui,
    isDirty,
    initSchema,
    addCollection,
    addAuthCollection,
    selectCollection,
    selectField,
    setCollectionPosition,
    setZoom,
    setPan,
    resetView,
    undo,
    redo,
    history,
    historyIndex,
    exportSchema,
  } = useSchemaStore()

  const canvasRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [draggedCollection, setDraggedCollection] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showCodePanel, setShowCodePanel] = useState(false)
  const [showAiDialog, setShowAiDialog] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  // Initialize schema if none exists
  useEffect(() => {
    if (!schema) {
      initSchema('my-app')
    }
  }, [schema, initSchema])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          undo()
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault()
          redo()
        } else if (e.key === 's') {
          e.preventDefault()
          handleSave()
        }
      }
      if (e.key === 'Escape') {
        selectCollection(null)
        selectField(null, null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, selectCollection, selectField])

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom(ui.zoom + delta)
      }
    },
    [ui.zoom, setZoom]
  )

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - ui.pan.x, y: e.clientY - ui.pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    } else if (draggedCollection) {
      const pos = ui.positions[draggedCollection]
      if (pos) {
        setCollectionPosition(draggedCollection, {
          x: (e.clientX - dragOffset.x - ui.pan.x) / ui.zoom,
          y: (e.clientY - dragOffset.y - ui.pan.y) / ui.zoom,
        })
      }
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setDraggedCollection(null)
  }

  const handleCollectionDragStart = (name: string, e: React.MouseEvent) => {
    const pos = ui.positions[name]
    if (pos) {
      setDraggedCollection(name)
      setDragOffset({
        x: e.clientX - pos.x * ui.zoom - ui.pan.x,
        y: e.clientY - pos.y * ui.zoom - ui.pan.y,
      })
    }
  }

  const handleAddCollection = () => {
    if (!schema) return
    let name = 'new_collection'
    let counter = 1
    while (schema.collections[name]) {
      name = `new_collection_${counter++}`
    }
    addCollection(name)
  }

  const handleSave = () => {
    const json = exportSchema()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${schema?.name || 'schema'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAiGenerate = async () => {
    // TODO: Call formabase describe API
    console.log('AI Generate:', aiPrompt)
    setShowAiDialog(false)
    setAiPrompt('')
  }

  const selectedCollection = ui.selectedCollection
  const selectedField = ui.selectedField
  const selectedFieldData =
    selectedCollection && selectedField
      ? schema?.collections[selectedCollection]?.fields[selectedField]
      : null

  return (
    <div className="relative h-full bg-zinc-950 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {/* Add buttons */}
        <div className="flex items-center bg-zinc-800 rounded-lg border border-zinc-700 p-1">
          <button
            onClick={handleAddCollection}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 rounded"
            title="Add collection"
          >
            <Database size={14} />
            <Plus size={12} />
          </button>

          {!schema?.collections.user && (
            <button
              onClick={addAuthCollection}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-400 hover:bg-zinc-700 rounded"
              title="Add user collection with auth"
            >
              <Key size={14} />
              Add Auth
            </button>
          )}
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center bg-zinc-800 rounded-lg border border-zinc-700 p-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={14} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo size={14} />
          </button>
        </div>

        {/* AI Generate */}
        <button
          onClick={() => setShowAiDialog(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-lg"
        >
          <Wand2 size={14} />
          AI Generate
        </button>
      </div>

      {/* Right toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* View controls */}
        <div className="flex items-center bg-zinc-800 rounded-lg border border-zinc-700 p-1">
          <button
            onClick={() => setZoom(ui.zoom - 0.1)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
            title="Zoom out"
          >
            <Minus size={14} />
          </button>
          <span className="px-2 text-xs text-zinc-400 min-w-[50px] text-center">
            {Math.round(ui.zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(ui.zoom + 0.1)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
            title="Zoom in"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
            title="Reset view"
          >
            <Maximize size={14} />
          </button>
        </div>

        {/* Code panel toggle */}
        <button
          onClick={() => setShowCodePanel(!showCodePanel)}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border ${
            showCodePanel
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
          }`}
        >
          <Code size={14} />
          JSON
        </button>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${
            isDirty
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => {
          selectCollection(null)
          selectField(null, null)
        }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle, #333 1px, transparent 1px)
            `,
            backgroundSize: `${20 * ui.zoom}px ${20 * ui.zoom}px`,
            backgroundPosition: `${ui.pan.x}px ${ui.pan.y}px`,
          }}
        />

        {/* Transformed content */}
        <div
          className="absolute"
          style={{
            transform: `translate(${ui.pan.x}px, ${ui.pan.y}px) scale(${ui.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Relation lines */}
          {schema && (
            <RelationConnector schema={schema} positions={ui.positions} />
          )}

          {/* Collection nodes */}
          {schema &&
            Object.entries(schema.collections).map(([name, collection]) => (
              <CollectionNode
                key={name}
                name={name}
                collection={collection}
                position={ui.positions[name] || { x: 50, y: 50 }}
                isSelected={selectedCollection === name}
                onSelect={() => selectCollection(name)}
                onDragStart={(e) => handleCollectionDragStart(name, e)}
                onFieldClick={(fieldName) => selectField(name, fieldName)}
                selectedField={selectedCollection === name ? selectedField : null}
              />
            ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <Layers size={12} />
          {schema ? Object.keys(schema.collections).length : 0} collections
        </span>
        <span>Alt+Drag or Middle-click to pan</span>
        <span>Ctrl+Scroll to zoom</span>
      </div>

      {/* Field editor panel */}
      {selectedCollection && selectedField && selectedFieldData && (
        <FieldEditor
          collection={selectedCollection}
          fieldName={selectedField}
          field={selectedFieldData}
          onClose={() => selectField(null, null)}
        />
      )}

      {/* Code panel */}
      <SchemaCodePanel isOpen={showCodePanel} onClose={() => setShowCodePanel(false)} />

      {/* AI Generate Dialog */}
      {showAiDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Wand2 className="text-purple-400" />
              AI Schema Generator
            </h3>

            <p className="text-sm text-zinc-400 mb-4">
              Describe your app and we&apos;ll generate a schema for you.
            </p>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Example: A blog with users, posts, categories, and comments. Users can have multiple posts. Posts belong to categories and can have multiple comments."
              className="w-full h-32 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm resize-none focus:border-purple-500 focus:outline-none"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAiDialog(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAiGenerate}
                disabled={!aiPrompt.trim()}
                className="px-4 py-2 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Schema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
