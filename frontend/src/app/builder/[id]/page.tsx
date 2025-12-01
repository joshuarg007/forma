'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ChevronLeft, Download, Code, Eye, Settings,
  Trash2, Loader2, Zap, Copy, Check, FolderTree, Wand2,
  Monitor, Tablet, Smartphone, Users, ChevronRight, Box,
  Undo, Redo, Save, Layers, PanelRight, X, ExternalLink,
  AlignLeft, AlignCenter, AlignRight, PanelLeftClose, PanelRightClose,
  ArrowLeft, ArrowRight, Maximize2
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/lib/api'
import ComponentLibrary from '@/components/ComponentLibrary'
import VisualCanvas, { CanvasComponent } from '@/components/VisualCanvas'

export default function BuilderPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const { user, checkAuth } = useAuthStore()
  const { currentProject, selectProject, generating, generationError, generateComponent, usage, fetchUsage } = useProjectStore()

  // Canvas state
  const [canvasComponents, setCanvasComponents] = useState<CanvasComponent[]>([])
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  // History for undo/redo
  const [history, setHistory] = useState<CanvasComponent[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const selectedComponent = canvasComponents.find(c => c.id === selectedComponentId)

  const handleDragStart = (e: React.DragEvent, item: { id: string; name: string }) => {
    console.log('Drag started:', item)
    // Use text/plain for better browser compatibility
    e.dataTransfer.setData('text/plain', JSON.stringify(item))
    e.dataTransfer.setData('application/json', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'copy'

    // Set a drag image
    const dragEl = e.currentTarget as HTMLElement
    if (dragEl) {
      e.dataTransfer.setDragImage(dragEl, 20, 20)
    }
  }

  const handleLibraryItemClick = useCallback((item: { id: string; name: string }) => {
    console.log('Library item clicked:', item)
    // Add component to canvas on click
    const newComponent: CanvasComponent = {
      id: `${item.id}-${Date.now()}`,
      type: item.id,
      name: item.name,
      props: {},
    }
    console.log('Creating new component:', newComponent)
    const newComponents = [...canvasComponents, newComponent]
    console.log('New components array:', newComponents)
    setCanvasComponents(newComponents)
    setSelectedComponentId(newComponent.id)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newComponents)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [canvasComponents, history, historyIndex])

  const handleComponentsChange = useCallback((components: CanvasComponent[]) => {
    setCanvasComponents(components)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(components)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCanvasComponents(history[historyIndex - 1])
    }
  }, [history, historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCanvasComponents(history[historyIndex + 1])
    }
  }, [history, historyIndex])

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim() || generating) return
    try {
      await generateComponent(aiPrompt)
      setAiPrompt('')
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  const handleExport = async (format: 'nextjs' | 'vite') => {
    setExporting(true)
    try {
      const blob = format === 'nextjs'
        ? await api.exportNextjs(projectId)
        : await api.exportVite(projectId)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentProject?.name || 'project'}-${format}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  const handlePreviewInNewTab = () => {
    // Save canvas components to localStorage for preview page to read
    localStorage.setItem(`forma-preview-${projectId}`, JSON.stringify(canvasComponents))
    // Open preview in new tab
    window.open(`/preview/${projectId}`, '_blank')
  }

  const updateComponentAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedComponentId) return
    const newComponents = canvasComponents.map(c =>
      c.id === selectedComponentId ? { ...c, alignment } : c
    )
    handleComponentsChange(newComponents)
  }

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  }

  // Auth check
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user === null) {
      router.push('/auth')
    }
  }, [user, router])

  // Load project
  useEffect(() => {
    if (projectId && user) {
      selectProject(projectId)
      fetchUsage()
    }
  }, [projectId, user, selectProject, fetchUsage])

  if (!user || !currentProject) {
    return (
      <div className="min-h-screen bg-forma-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-forma-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-white/10 bg-forma-950/80 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1 text-white/60 hover:text-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-forma-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-white">{currentProject.name}</span>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center - Device selector */}
        <div className="flex items-center gap-1 px-1 py-1 rounded-lg bg-white/5 border border-white/10">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded transition ${
              device === 'desktop' ? 'bg-forma-500 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Desktop"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-2 rounded transition ${
              device === 'tablet' ? 'bg-forma-500 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-2 rounded transition ${
              device === 'mobile' ? 'bg-forma-500 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview in New Tab button */}
          <button
            onClick={handlePreviewInNewTab}
            disabled={canvasComponents.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Preview in new tab"
          >
            <ExternalLink className="w-4 h-4" />
            Preview Site
          </button>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 px-1 py-1 rounded-lg bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition ${
                viewMode === 'edit' ? 'bg-forma-500 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition ${
                viewMode === 'preview' ? 'bg-forma-500 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          {/* Usage */}
          {usage && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Zap className="w-4 h-4 text-forma-400" />
              <span className="text-sm text-white/60">
                {usage.operations_used}/{usage.operations_limit}
              </span>
            </div>
          )}

          {/* Export dropdown */}
          <div className="relative group">
            <button
              disabled={exporting || canvasComponents.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm transition disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-forma-900 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => handleExport('nextjs')}
                className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 transition"
              >
                Next.js
              </button>
              <button
                onClick={() => handleExport('vite')}
                className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 transition"
              >
                Vite + React
              </button>
            </div>
          </div>

          {/* Toggle right panel */}
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className={`p-2 rounded-lg border border-white/10 transition ${
              showRightPanel ? 'bg-forma-500 text-white' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
            title="Toggle panel"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Component Library */}
        <div className="w-64 border-r border-white/10 flex flex-col flex-shrink-0 bg-forma-950">
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-white/60">
              <Box className="w-4 h-4" />
              <span className="text-sm font-medium">Components</span>
            </div>
          </div>
          <ComponentLibrary
            onSelectComponent={handleLibraryItemClick}
            onDragStart={handleDragStart}
          />
        </div>

        {/* Center - Visual Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1a1a2e]">
          {/* Canvas container with device frame */}
          <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
            <div
              className="transition-all duration-300"
              style={{
                width: deviceWidths[device],
                maxWidth: '100%',
                minHeight: device === 'mobile' ? '667px' : '100%',
              }}
            >
              {/* Device frame */}
              {device !== 'desktop' && (
                <div className="bg-gray-800 rounded-t-xl px-4 py-2 flex items-center justify-center gap-2">
                  <div className="w-16 h-1 bg-gray-600 rounded-full" />
                </div>
              )}

              {/* Canvas */}
              <div className={`bg-white ${device !== 'desktop' ? 'rounded-b-xl' : 'rounded-xl'} shadow-2xl overflow-hidden`}>
                <VisualCanvas
                  components={canvasComponents}
                  onComponentsChange={handleComponentsChange}
                  selectedId={selectedComponentId}
                  onSelect={setSelectedComponentId}
                  onGenerateComponent={generateComponent}
                  generating={generating}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - Properties & AI */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/10 flex flex-col flex-shrink-0 bg-forma-950 overflow-hidden"
            >
              {/* AI Assistant */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-white mb-3">
                  <Wand2 className="w-4 h-4 text-forma-400" />
                  <span className="text-sm font-medium">AI Assistant</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe what you want..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateWithAI()}
                  />
                  <button
                    onClick={handleGenerateWithAI}
                    disabled={!aiPrompt.trim() || generating}
                    className="px-3 py-2 rounded-lg bg-forma-500 hover:bg-forma-600 text-white transition disabled:opacity-50"
                  >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </button>
                </div>
                {generationError && (
                  <p className="mt-2 text-xs text-red-400">{generationError}</p>
                )}
              </div>

              {/* Selected component properties */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedComponent ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-white">{selectedComponent.name}</h3>
                      <button
                        onClick={() => setSelectedComponentId(null)}
                        className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Component type */}
                      <div>
                        <label className="text-xs text-white/40 block mb-1">Type</label>
                        <div className="px-3 py-2 bg-white/5 rounded-lg text-sm text-white/80">
                          {selectedComponent.type}
                        </div>
                      </div>

                      {/* Position / Alignment */}
                      <div>
                        <label className="text-xs text-white/40 block mb-2">Position</label>
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateComponentAlignment('left')}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition ${
                              selectedComponent.alignment === 'left'
                                ? 'bg-forma-500 text-white'
                                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                            }`}
                            title="Stick to left (sidebar)"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Left
                          </button>
                          <button
                            onClick={() => updateComponentAlignment('center')}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition ${
                              !selectedComponent.alignment || selectedComponent.alignment === 'center'
                                ? 'bg-forma-500 text-white'
                                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                            }`}
                            title="Full width"
                          >
                            <Maximize2 className="w-4 h-4" />
                            Full
                          </button>
                          <button
                            onClick={() => updateComponentAlignment('right')}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition ${
                              selectedComponent.alignment === 'right'
                                ? 'bg-forma-500 text-white'
                                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                            }`}
                            title="Stick to right (sidebar)"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Right
                          </button>
                        </div>
                        <p className="text-xs text-white/30 mt-1.5">
                          Left/Right makes component 75% width, positioned to that side
                        </p>
                      </div>

                      {/* Quick actions */}
                      <div>
                        <label className="text-xs text-white/40 block mb-2">Actions</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newComponents = canvasComponents.filter(c => c.id !== selectedComponentId)
                              handleComponentsChange(newComponents)
                              setSelectedComponentId(null)
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                          <button
                            onClick={() => {
                              const index = canvasComponents.findIndex(c => c.id === selectedComponentId)
                              if (index !== -1) {
                                const newComponent = {
                                  ...selectedComponent,
                                  id: `${selectedComponent.type}-${Date.now()}`
                                }
                                const newComponents = [...canvasComponents]
                                newComponents.splice(index + 1, 0, newComponent)
                                handleComponentsChange(newComponents)
                                setSelectedComponentId(newComponent.id)
                              }
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-sm transition"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                        </div>
                      </div>

                      {/* AI customization */}
                      <div>
                        <label className="text-xs text-white/40 block mb-2">Customize with AI</label>
                        <textarea
                          placeholder="e.g., Make it darker, add more padding, change the button color..."
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 resize-none focus:outline-none focus:border-forma-500 transition"
                          rows={3}
                        />
                        <button className="mt-2 w-full px-3 py-2 bg-forma-500/20 hover:bg-forma-500/30 text-forma-400 rounded-lg text-sm transition flex items-center justify-center gap-2">
                          <Wand2 className="w-4 h-4" />
                          Apply Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/40">
                    <Settings className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select a component to edit its properties</p>
                  </div>
                )}
              </div>

              {/* Page structure */}
              <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-2 text-white/60 mb-3">
                  <FolderTree className="w-4 h-4" />
                  <span className="text-sm font-medium">Page Structure</span>
                  <span className="ml-auto text-xs text-white/40">{canvasComponents.length} items</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {canvasComponents.map((comp, index) => (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedComponentId(comp.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition ${
                        selectedComponentId === comp.id
                          ? 'bg-forma-500/20 text-forma-400'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-xs text-white/30">{index + 1}</span>
                      <span className="truncate">{comp.name}</span>
                    </button>
                  ))}
                  {canvasComponents.length === 0 && (
                    <p className="text-xs text-white/30 text-center py-2">No components yet</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
