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
  Rocket,
  Loader2,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
  XCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Settings2,
  LayoutTemplate,
} from 'lucide-react'
import { useSchemaStore } from '@/stores/schemaStore'
import { CollectionNode } from './CollectionNode'
import { FieldEditor } from './FieldEditor'
import { RelationConnector } from './RelationConnector'
import { SchemaCodePanel } from './SchemaCodePanel'
import { TemplateSelector } from './TemplateSelector'
import { WelcomeTour } from './WelcomeTour'
import { DataEditor } from './DataEditor'
import { DeploymentOptions } from './DeploymentOptions'
import { PublishModal } from './PublishModal'
import { useToast } from '@/components/ui/Toast'

interface ValidationIssue {
  severity: 'critical' | 'warning' | 'info'
  category: string
  message: string
  field_path?: string
  suggestion?: string
}

interface ValidationResult {
  valid: boolean
  can_deploy: boolean
  issues: ValidationIssue[]
  summary: {
    critical: number
    warnings: number
    info: number
  }
}

interface DataModelerProps {
  projectId?: string
}

export function DataModeler({ projectId }: DataModelerProps) {
  const {
    schema,
    ui,
    isDirty,
    initSchema,
    loadSchema,
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
    saveToProject,
    deployBackend,
    loadFromProject,
  } = useSchemaStore()

  const toast = useToast()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [draggedCollection, setDraggedCollection] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showCodePanel, setShowCodePanel] = useState(false)
  const [showAiDialog, setShowAiDialog] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showDataEditor, setShowDataEditor] = useState(false)
  const [showDeployOptions, setShowDeployOptions] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)

  // Deployment state
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [deployError, setDeployError] = useState<string | null>(null)

  // Validation state
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showValidationPanel, setShowValidationPanel] = useState(false)

  // Load schema from project if projectId is provided
  useEffect(() => {
    if (projectId) {
      loadFromProject(projectId)
    } else if (!schema) {
      initSchema('my-app')
    }
  }, [projectId, loadFromProject, schema, initSchema])

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

  const handleDeploy = async () => {
    if (!projectId) return

    setIsDeploying(true)
    setDeployError(null)
    setDeployedUrl(null)
    setValidationResult(null)

    try {
      const result = await deployBackend(projectId)

      // Always show validation results if available
      if (result.validation) {
        setValidationResult(result.validation)
        // Show panel if there are any issues
        if (result.validation.issues.length > 0) {
          setShowValidationPanel(true)
        }
      }

      if (result.success) {
        setDeployedUrl(result.api_url)
        toast.success('Backend deployed!', 'Your API is now live and ready to use.')
      } else {
        // Deployment blocked by validation
        const errorMsg = result.message || 'Deployment blocked due to validation issues'
        setDeployError(errorMsg)
        toast.error('Deployment failed', errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Deployment failed'
      setDeployError(errorMsg)
      toast.error('Deployment error', errorMsg)
    } finally {
      setIsDeploying(false)
    }
  }

  const handleSaveToProject = async () => {
    if (!projectId) return

    try {
      await saveToProject(projectId)
      toast.success('Schema saved', 'Your changes have been saved.')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save schema'
      toast.error('Save failed', errorMsg)
    }
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

        {/* Templates */}
        <button
          onClick={() => setShowTemplateSelector(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg border border-zinc-700"
        >
          <LayoutTemplate size={14} />
          Templates
        </button>

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

        {/* Export button */}
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

        {/* Self-Host button */}
        <button
          onClick={() => setShowDeployOptions(true)}
          disabled={!schema?.collections || Object.keys(schema.collections).length === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title="Self-host on Render, Railway, or Docker"
        >
          <ExternalLink size={14} />
          Self-Host
        </button>

        {/* One-Click Publish button */}
        {projectId && (
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 rounded-lg shadow-lg shadow-green-500/25 transition-all"
            title="Publish your app live"
          >
            <Rocket size={16} />
            Publish
          </button>
        )}

        {/* Deploy Backend button - only show if projectId is provided */}
        {projectId && (
          <div className="flex items-center gap-2">
            {/* Save to project */}
            <button
              onClick={handleSaveToProject}
              disabled={!isDirty}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${
                isDirty
                  ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
              }`}
              title="Save schema to project"
            >
              <Save size={14} />
              Save
            </button>

            {/* Deploy */}
            <button
              onClick={handleDeploy}
              disabled={isDeploying || !schema?.collections || Object.keys(schema.collections).length === 0}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${
                isDeploying
                  ? 'bg-green-700 text-white cursor-wait'
                  : deployedUrl
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed'
              }`}
              title={deployedUrl ? 'Backend deployed! Click to redeploy' : 'Deploy backend API'}
            >
              {isDeploying ? (
                <Loader2 size={14} className="animate-spin" />
              ) : deployedUrl ? (
                <CheckCircle size={14} />
              ) : (
                <Rocket size={14} />
              )}
              {isDeploying ? 'Deploying...' : deployedUrl ? 'Redeploy' : 'Deploy Backend'}
            </button>

            {/* Show deployed URL and Admin link */}
            {deployedUrl && (() => {
              // Extract runtime base URL for admin link
              let adminUrl = '/admin'
              try {
                const url = new URL(deployedUrl)
                adminUrl = `${url.origin}/admin`
              } catch {
                // If deployedUrl is a path, try to construct from window location
                if (typeof window !== 'undefined') {
                  adminUrl = deployedUrl.replace(/\/api\/p\/.*$/, '/admin')
                }
              }
              return (
                <>
                  <a
                    href={deployedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1.5 text-xs text-green-400 hover:text-green-300 bg-zinc-800 rounded border border-zinc-700"
                    title="Open API documentation"
                  >
                    <ExternalLink size={12} />
                    API
                  </a>
                  <button
                    onClick={() => setShowDataEditor(true)}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-zinc-800 rounded border border-zinc-700"
                    title="View and edit your data"
                  >
                    <Settings2 size={12} />
                    Manage Data
                  </button>
                </>
              )
            })()}

            {/* Show error */}
            {deployError && (
              <span className="text-xs text-red-400 max-w-[200px] truncate" title={deployError}>
                {deployError}
              </span>
            )}

            {/* Validation indicator */}
            {validationResult && validationResult.issues.length > 0 && (
              <button
                onClick={() => setShowValidationPanel(!showValidationPanel)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded border ${
                  validationResult.summary.critical > 0
                    ? 'bg-red-900/50 text-red-400 border-red-700'
                    : validationResult.summary.warnings > 0
                      ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700'
                      : 'bg-blue-900/50 text-blue-400 border-blue-700'
                }`}
              >
                {validationResult.summary.critical > 0 ? (
                  <XCircle size={12} />
                ) : validationResult.summary.warnings > 0 ? (
                  <AlertTriangle size={12} />
                ) : (
                  <Info size={12} />
                )}
                {validationResult.issues.length} issue{validationResult.issues.length !== 1 ? 's' : ''}
                {showValidationPanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        )}
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

      {/* Validation Results Panel */}
      {showValidationPanel && validationResult && (
        <div className="absolute bottom-16 right-4 z-30 w-96 max-h-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              {validationResult.summary.critical > 0 ? (
                <XCircle size={16} className="text-red-400" />
              ) : validationResult.summary.warnings > 0 ? (
                <AlertTriangle size={16} className="text-yellow-400" />
              ) : (
                <Info size={16} className="text-blue-400" />
              )}
              Schema Validation
            </h3>
            <button
              onClick={() => setShowValidationPanel(false)}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
            >
              <X size={14} />
            </button>
          </div>

          {/* Summary */}
          <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-700 flex items-center gap-4 text-xs">
            {validationResult.summary.critical > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <XCircle size={12} />
                {validationResult.summary.critical} critical
              </span>
            )}
            {validationResult.summary.warnings > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                <AlertTriangle size={12} />
                {validationResult.summary.warnings} warnings
              </span>
            )}
            {validationResult.summary.info > 0 && (
              <span className="flex items-center gap-1 text-blue-400">
                <Info size={12} />
                {validationResult.summary.info} info
              </span>
            )}
          </div>

          {/* Issues list */}
          <div className="overflow-y-auto max-h-64">
            {validationResult.issues.map((issue, index) => (
              <div
                key={index}
                className={`px-4 py-3 border-b border-zinc-800 ${
                  issue.severity === 'critical'
                    ? 'bg-red-900/10'
                    : issue.severity === 'warning'
                      ? 'bg-yellow-900/10'
                      : 'bg-blue-900/10'
                }`}
              >
                <div className="flex items-start gap-2">
                  {issue.severity === 'critical' ? (
                    <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  ) : issue.severity === 'warning' ? (
                    <AlertTriangle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{issue.message}</p>
                    {issue.field_path && (
                      <p className="text-xs text-zinc-500 mt-1 font-mono">
                        {issue.field_path}
                      </p>
                    )}
                    {issue.suggestion && (
                      <p className="text-xs text-zinc-400 mt-1">
                        💡 {issue.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {!validationResult.can_deploy && (
            <div className="px-4 py-3 bg-red-900/20 border-t border-red-900/50">
              <p className="text-xs text-red-300">
                Fix critical issues before deploying. These changes could break your application or cause data loss.
              </p>
            </div>
          )}
        </div>
      )}

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

      {/* Template Selector */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={(templateSchema) => {
          loadSchema(templateSchema)
          setShowTemplateSelector(false)
          toast.success(
            'Template loaded',
            `${Object.keys(templateSchema.collections).length} collections ready to customize.`
          )
        }}
      />

      {/* Welcome Tour (shows on first visit) */}
      <WelcomeTour />

      {/* Data Editor (accessible after deployment) */}
      <DataEditor
        isOpen={showDataEditor}
        onClose={() => setShowDataEditor(false)}
        apiUrl={deployedUrl || ''}
        schema={schema}
      />

      {/* Deployment Options (Render/Railway/Docker) */}
      <DeploymentOptions
        isOpen={showDeployOptions}
        onClose={() => setShowDeployOptions(false)}
        schema={schema}
        projectId={projectId}
      />

      {/* One-Click Publish Modal */}
      {projectId && (
        <PublishModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          projectId={projectId}
          projectName={schema?.name || 'My App'}
          hasSchema={!!(schema?.collections && Object.keys(schema.collections).length > 0)}
          onPublishComplete={(urls) => {
            if (urls.backend) {
              setDeployedUrl(urls.backend)
            }
          }}
        />
      )}
    </div>
  )
}
