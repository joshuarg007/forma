'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ChevronLeft, Download, Code, Settings,
  Trash2, Loader2, Zap, Copy, Check, FolderTree, Wand2,
  Monitor, Tablet, Smartphone, Users, ChevronRight, Box,
  Undo, Redo, Save, Layers, PanelRight, X, ExternalLink,
  AlignLeft, AlignCenter, AlignRight, PanelLeftClose, PanelRightClose,
  ArrowLeft, ArrowRight, Maximize2, ZoomIn, ZoomOut, RotateCcw,
  Palette, Gauge, FileImage, HelpCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/lib/api'
import ComponentLibrary from '@/components/ComponentLibrary'
import VisualCanvas, { CanvasComponent } from '@/components/VisualCanvas'
import PropertiesPanel from '@/components/PropertiesPanel'
import ThemePanel from '@/components/ThemePanel'
import PerformanceScore from '@/components/PerformanceScore'
import FigmaImportModal from '@/components/FigmaImportModal'
import TutorialModal from '@/components/TutorialModal'
import PagesSidebar from '@/components/PagesSidebar'

// Helper: Find component by ID in nested tree
function findComponentById(
  components: CanvasComponent[],
  id: string
): CanvasComponent | null {
  for (const component of components) {
    if (component.id === id) return component
    if (component.children) {
      const found = findComponentById(component.children, id)
      if (found) return found
    }
  }
  return null
}

// Helper: Update component in nested tree
function updateComponentInTree(
  components: CanvasComponent[],
  targetId: string,
  updater: (component: CanvasComponent) => CanvasComponent
): CanvasComponent[] {
  return components.map(component => {
    if (component.id === targetId) {
      return updater(component)
    }
    if (component.children) {
      return {
        ...component,
        children: updateComponentInTree(component.children, targetId, updater)
      }
    }
    return component
  })
}

// Helper: Remove component from nested tree
function removeComponentFromTree(
  components: CanvasComponent[],
  id: string
): CanvasComponent[] {
  return components
    .filter(component => component.id !== id)
    .map(component => {
      if (component.children) {
        return {
          ...component,
          children: removeComponentFromTree(component.children, id)
        }
      }
      return component
    })
}

export default function BuilderPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const { user, checkAuth } = useAuthStore()
  const { currentProject, currentPage, pages, selectProject, selectPage, saveCanvasState, generating, generationError, generateComponent, usage, fetchUsage } = useProjectStore()

  // Canvas state
  const [canvasComponents, setCanvasComponents] = useState<CanvasComponent[]>([])
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'code'>('edit')
  const [copiedCode, setCopiedCode] = useState(false)
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [zoom, setZoom] = useState(100)
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [rightPanelWidth, setRightPanelWidth] = useState(380)
  const [isResizing, setIsResizing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiStatus, setAiStatus] = useState<string>('')
  const [aiLogs, setAiLogs] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // New feature panels
  const [showThemePanel, setShowThemePanel] = useState(false)
  const [showPerformanceScore, setShowPerformanceScore] = useState(false)
  const [showFigmaImport, setShowFigmaImport] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  // History for undo/redo
  const [history, setHistory] = useState<CanvasComponent[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const selectedComponent = selectedComponentId ? findComponentById(canvasComponents, selectedComponentId) : null

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

  // Update a single component (supports nested components)
  const handleUpdateComponent = useCallback((updatedComponent: CanvasComponent) => {
    console.log('handleUpdateComponent called with:', updatedComponent)
    console.log('Current canvasComponents:', canvasComponents)

    // Check if it's a root component
    const isRoot = canvasComponents.some(c => c.id === updatedComponent.id)
    console.log('Is root component:', isRoot)

    if (isRoot) {
      const newComponents = canvasComponents.map(c =>
        c.id === updatedComponent.id ? updatedComponent : c
      )
      console.log('Updating root, new components:', newComponents)
      handleComponentsChange(newComponents)
    } else {
      // Update nested component
      const newComponents = updateComponentInTree(
        canvasComponents,
        updatedComponent.id,
        () => updatedComponent
      )
      console.log('Updating nested, new components:', newComponents)
      handleComponentsChange(newComponents)
    }
  }, [canvasComponents, handleComponentsChange])

  // Delete a component (supports nested components)
  const handleDeleteComponent = useCallback((id: string) => {
    // Check if it's a root component
    const isRoot = canvasComponents.some(c => c.id === id)

    if (isRoot) {
      const newComponents = canvasComponents.filter(c => c.id !== id)
      handleComponentsChange(newComponents)
    } else {
      // Remove from nested tree
      const newComponents = removeComponentFromTree(canvasComponents, id)
      handleComponentsChange(newComponents)
    }

    if (selectedComponentId === id) setSelectedComponentId(null)
  }, [canvasComponents, handleComponentsChange, selectedComponentId])

  // Duplicate a component (supports nested components)
  const handleDuplicateComponent = useCallback((id: string) => {
    // Check if it's a root component
    const rootIndex = canvasComponents.findIndex(c => c.id === id)

    if (rootIndex !== -1) {
      const component = canvasComponents[rootIndex]
      const newComponent: CanvasComponent = {
        ...component,
        id: `${component.type}-${Date.now()}`,
        children: component.children?.map(c => ({
          ...c,
          id: `${c.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        }))
      }
      const newComponents = [...canvasComponents]
      newComponents.splice(rootIndex + 1, 0, newComponent)
      handleComponentsChange(newComponents)
      setSelectedComponentId(newComponent.id)
    } else {
      // Handle nested component duplication
      const found = findComponentById(canvasComponents, id)
      if (!found || !found.parentId) return

      const newComponent: CanvasComponent = {
        ...found,
        id: `${found.type}-${Date.now()}`
      }

      // Find parent and add duplicate after original
      const newComponents = updateComponentInTree(canvasComponents, found.parentId, (parent) => {
        const children = parent.children || []
        const childIndex = children.findIndex(c => c.id === id)
        if (childIndex === -1) return parent
        const newChildren = [...children]
        newChildren.splice(childIndex + 1, 0, newComponent)
        return { ...parent, children: newChildren }
      })

      handleComponentsChange(newComponents)
      setSelectedComponentId(newComponent.id)
    }
  }, [canvasComponents, handleComponentsChange])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setAiLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`])
  }

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim() || isGenerating) return

    const prompt = aiPrompt
    setAiPrompt('')
    setIsGenerating(true)
    setAiStatus('Sending request...')
    addLog(`Generating: "${prompt}"`)

    try {
      setAiStatus('AI is thinking...')
      const response = await api.generateComponent(prompt, projectId, currentProject?.design_system)

      if (response.success && response.result) {
        setAiStatus('Adding to canvas...')
        addLog(`Created: ${response.result.name}`)

        // Add to canvas
        const newComponent: CanvasComponent = {
          id: `ai-${Date.now()}`,
          type: 'ai-generated',
          name: response.result.name,
          props: {},
          code: response.result.code,
        }
        const newComponents = [...canvasComponents, newComponent]
        setCanvasComponents(newComponents)
        setSelectedComponentId(newComponent.id)

        // Add to history
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(newComponents)
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)

        setAiStatus('Done!')
        addLog('Component added to canvas')
      } else {
        const errorMsg = response.error || 'Generation failed'
        setAiStatus(`Error: ${errorMsg}`)
        addLog(`Error: ${errorMsg}`)
      }

      fetchUsage()
    } catch (error) {
      const errorMsg = (error as Error).message
      setAiStatus(`Error: ${errorMsg}`)
      addLog(`Error: ${errorMsg}`)
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
      setTimeout(() => setAiStatus(''), 3000)
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
    // Save all pages to localStorage for preview page to read
    const previewData = {
      pages: pages.map(p => ({
        ...p,
        // Use current canvas for current page (may have unsaved changes)
        canvas_components: p.id === currentPage?.id ? canvasComponents : p.canvas_components
      })),
      currentPageSlug: currentPage?.slug || 'home'
    }
    localStorage.setItem(`forma-preview-${projectId}`, JSON.stringify(previewData))
    // Open preview in new tab
    window.open(`/preview/${projectId}`, '_blank')
  }

  // Handle Figma import
  const handleFigmaImport = useCallback((importedComponents: CanvasComponent[]) => {
    const newComponents = [...canvasComponents, ...importedComponents]
    handleComponentsChange(newComponents)
    if (importedComponents.length > 0) {
      setSelectedComponentId(importedComponents[0].id)
    }
  }, [canvasComponents, handleComponentsChange])

  // Generate HTML from canvas components
  const generateHtml = useCallback(() => {
    const componentToHtml: Record<string, string> = {
      'hero-centered': `<section class="bg-gradient-to-br from-indigo-600 to-purple-700 py-20 px-8 text-center text-white">
  <h1 class="text-4xl md:text-5xl font-bold mb-4">Hero Section</h1>
  <p class="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Your compelling tagline goes here</p>
  <div class="flex gap-4 justify-center flex-wrap">
    <a href="#" class="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition">Get Started</a>
    <a href="#" class="px-8 py-3 border border-white/50 rounded-lg hover:bg-white/10 transition">Learn More</a>
  </div>
</section>`,
      'hero-split': `<section class="bg-gray-900 py-20 px-8">
  <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
    <div class="flex-1 text-white">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">Split Hero</h1>
      <p class="text-gray-400 text-lg mb-8">Content on the left, image on the right</p>
      <a href="#" class="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">Get Started</a>
    </div>
    <div class="flex-1">
      <img src="https://placehold.co/600x400" alt="Hero image" class="rounded-xl shadow-2xl w-full" />
    </div>
  </div>
</section>`,
      'navbar': `<nav class="bg-white border-b border-gray-200 px-6 py-4">
  <div class="max-w-6xl mx-auto flex items-center justify-between">
    <a href="/" class="font-bold text-xl text-gray-900">Logo</a>
    <div class="hidden md:flex gap-8 text-gray-600">
      <a href="#" class="hover:text-gray-900 transition">Home</a>
      <a href="#" class="hover:text-gray-900 transition">Features</a>
      <a href="#" class="hover:text-gray-900 transition">Pricing</a>
      <a href="#" class="hover:text-gray-900 transition">Contact</a>
    </div>
    <a href="#" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Sign Up</a>
  </div>
</nav>`,
      'section-features': `<section class="bg-gray-50 py-20 px-8">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Features</h2>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-white p-8 rounded-xl shadow-sm">
        <div class="w-12 h-12 bg-indigo-100 rounded-lg mb-6 flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Feature 1</h3>
        <p class="text-gray-500">Description of this amazing feature that helps your users.</p>
      </div>
      <div class="bg-white p-8 rounded-xl shadow-sm">
        <div class="w-12 h-12 bg-indigo-100 rounded-lg mb-6 flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        </div>
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Feature 2</h3>
        <p class="text-gray-500">Description of this amazing feature that helps your users.</p>
      </div>
      <div class="bg-white p-8 rounded-xl shadow-sm">
        <div class="w-12 h-12 bg-indigo-100 rounded-lg mb-6 flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Feature 3</h3>
        <p class="text-gray-500">Description of this amazing feature that helps your users.</p>
      </div>
    </div>
  </div>
</section>`,
      'section-pricing': `<section class="bg-white py-20 px-8">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Pricing</h2>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="p-8 rounded-xl border-2 border-gray-200">
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Basic</h3>
        <div class="text-4xl font-bold text-gray-900 mb-6">$29<span class="text-lg text-gray-500 font-normal">/mo</span></div>
        <ul class="space-y-3 mb-8 text-gray-600">
          <li>✓ Feature one</li>
          <li>✓ Feature two</li>
          <li>✓ Feature three</li>
        </ul>
        <a href="#" class="block w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-center hover:bg-gray-200 transition">Choose Plan</a>
      </div>
      <div class="p-8 rounded-xl border-2 border-indigo-600 bg-indigo-50 relative">
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-full">Popular</span>
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Pro</h3>
        <div class="text-4xl font-bold text-gray-900 mb-6">$59<span class="text-lg text-gray-500 font-normal">/mo</span></div>
        <ul class="space-y-3 mb-8 text-gray-600">
          <li>✓ Everything in Basic</li>
          <li>✓ Advanced features</li>
          <li>✓ Priority support</li>
        </ul>
        <a href="#" class="block w-full py-3 bg-indigo-600 text-white rounded-lg font-medium text-center hover:bg-indigo-700 transition">Choose Plan</a>
      </div>
      <div class="p-8 rounded-xl border-2 border-gray-200">
        <h3 class="font-semibold text-gray-900 text-lg mb-2">Enterprise</h3>
        <div class="text-4xl font-bold text-gray-900 mb-6">$99<span class="text-lg text-gray-500 font-normal">/mo</span></div>
        <ul class="space-y-3 mb-8 text-gray-600">
          <li>✓ Everything in Pro</li>
          <li>✓ Custom integrations</li>
          <li>✓ Dedicated support</li>
        </ul>
        <a href="#" class="block w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-center hover:bg-gray-200 transition">Contact Sales</a>
      </div>
    </div>
  </div>
</section>`,
      'section-testimonials': `<section class="bg-gray-900 py-20 px-8">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-white mb-12">What People Say</h2>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-gray-800 p-8 rounded-xl">
        <p class="text-gray-300 mb-6">"This product changed my life completely! I can't imagine going back."</p>
        <div class="flex items-center gap-4">
          <img src="https://placehold.co/48" alt="User" class="w-12 h-12 rounded-full" />
          <div>
            <div class="font-medium text-white">Sarah Johnson</div>
            <div class="text-sm text-gray-500">CEO, TechCorp</div>
          </div>
        </div>
      </div>
      <div class="bg-gray-800 p-8 rounded-xl">
        <p class="text-gray-300 mb-6">"Incredible tool that saved us countless hours of development time."</p>
        <div class="flex items-center gap-4">
          <img src="https://placehold.co/48" alt="User" class="w-12 h-12 rounded-full" />
          <div>
            <div class="font-medium text-white">Mike Chen</div>
            <div class="text-sm text-gray-500">CTO, StartupXYZ</div>
          </div>
        </div>
      </div>
      <div class="bg-gray-800 p-8 rounded-xl">
        <p class="text-gray-300 mb-6">"The best investment we've made for our team's productivity."</p>
        <div class="flex items-center gap-4">
          <img src="https://placehold.co/48" alt="User" class="w-12 h-12 rounded-full" />
          <div>
            <div class="font-medium text-white">Emily Davis</div>
            <div class="text-sm text-gray-500">Founder, DesignCo</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
      'section-faq': `<section class="bg-white py-20 px-8">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
    <div class="space-y-4">
      <details class="border border-gray-200 rounded-lg">
        <summary class="px-6 py-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">What is your refund policy?</summary>
        <div class="px-6 pb-4 text-gray-600">We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.</div>
      </details>
      <details class="border border-gray-200 rounded-lg">
        <summary class="px-6 py-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">How do I get started?</summary>
        <div class="px-6 pb-4 text-gray-600">Simply sign up for an account and follow our quick-start guide. You'll be up and running in minutes.</div>
      </details>
      <details class="border border-gray-200 rounded-lg">
        <summary class="px-6 py-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">Do you offer custom plans?</summary>
        <div class="px-6 pb-4 text-gray-600">Yes! Contact our sales team for custom enterprise solutions tailored to your needs.</div>
      </details>
    </div>
  </div>
</section>`,
      'section-cta': `<section class="bg-indigo-600 py-20 px-8 text-center">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
    <p class="text-indigo-100 text-lg mb-8">Join thousands of happy customers today</p>
    <a href="#" class="inline-block px-10 py-4 bg-white text-indigo-600 rounded-lg font-medium text-lg hover:bg-gray-100 transition">Start Free Trial</a>
  </div>
</section>`,
      'sidebar': `<div class="flex min-h-screen">
  <!-- Sidebar -->
  <aside class="w-64 bg-gray-900 text-white flex flex-col">
    <!-- Logo -->
    <div class="p-4 border-b border-gray-800">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">A</div>
        <span class="font-semibold">AppName</span>
      </div>
    </div>
    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-1">
      <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600 text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        Dashboard
      </a>
      <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        Users
      </a>
      <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        Analytics
      </a>
      <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
        Projects
      </a>
      <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        Settings
      </a>
    </nav>
    <!-- User -->
    <div class="p-4 border-t border-gray-800">
      <div class="flex items-center gap-3">
        <img src="https://placehold.co/32" alt="User" class="w-8 h-8 rounded-full" />
        <div class="flex-1">
          <div class="text-sm font-medium">John Doe</div>
          <div class="text-xs text-gray-500">Admin</div>
        </div>
      </div>
    </div>
  </aside>
  <!-- Main Content -->
  <main class="flex-1 bg-gray-100 p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
    <p class="text-gray-600">Your main content goes here.</p>
  </main>
</div>`,
      'sidebar-minimal': `<div class="flex min-h-screen">
  <!-- Collapsed Sidebar -->
  <aside class="w-16 bg-gray-900 text-white flex flex-col items-center py-4">
    <div class="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm mb-6">A</div>
    <nav class="flex-1 flex flex-col gap-2">
      <a href="#" class="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center" title="Dashboard">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      </a>
      <a href="#" class="w-10 h-10 rounded-lg text-gray-400 hover:bg-gray-800 flex items-center justify-center transition" title="Users">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      </a>
      <a href="#" class="w-10 h-10 rounded-lg text-gray-400 hover:bg-gray-800 flex items-center justify-center transition" title="Analytics">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
      </a>
      <a href="#" class="w-10 h-10 rounded-lg text-gray-400 hover:bg-gray-800 flex items-center justify-center transition" title="Settings">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      </a>
    </nav>
    <img src="https://placehold.co/40" alt="User" class="w-10 h-10 rounded-full" />
  </aside>
  <!-- Main Content -->
  <main class="flex-1 bg-gray-100 p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
    <p class="text-gray-600">Your main content goes here.</p>
  </main>
</div>`,
      'dashboard-layout': `<div class="min-h-screen bg-gray-100">
  <!-- Top Navigation -->
  <header class="bg-white border-b border-gray-200 px-6 py-3">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-8">
        <h1 class="font-bold text-xl text-gray-900">Dashboard</h1>
        <nav class="hidden md:flex gap-6 text-gray-500 text-sm">
          <a href="#" class="text-indigo-600 font-medium">Overview</a>
          <a href="#" class="hover:text-gray-900 transition">Analytics</a>
          <a href="#" class="hover:text-gray-900 transition">Reports</a>
          <a href="#" class="hover:text-gray-900 transition">Notifications</a>
        </nav>
      </div>
      <div class="flex items-center gap-4">
        <button class="p-2 text-gray-400 hover:text-gray-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </button>
        <img src="https://placehold.co/32" alt="User" class="w-8 h-8 rounded-full" />
      </div>
    </div>
  </header>
  <!-- Stats Grid -->
  <main class="max-w-7xl mx-auto p-6">
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="text-sm text-gray-500 mb-1">Total Users</div>
        <div class="text-3xl font-bold text-gray-900">12,345</div>
        <div class="text-sm text-green-600 mt-2">↑ 12% from last month</div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="text-sm text-gray-500 mb-1">Revenue</div>
        <div class="text-3xl font-bold text-gray-900">$54,321</div>
        <div class="text-sm text-green-600 mt-2">↑ 8% from last month</div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="text-sm text-gray-500 mb-1">Active Projects</div>
        <div class="text-3xl font-bold text-gray-900">48</div>
        <div class="text-sm text-red-600 mt-2">↓ 3% from last month</div>
      </div>
    </div>
    <!-- Placeholder for more content -->
    <div class="bg-white rounded-xl p-8 shadow-sm text-center text-gray-400">
      Additional dashboard content goes here
    </div>
  </main>
</div>`,
      'footer': `<footer class="bg-gray-900 py-16 px-8 text-white">
  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-4 gap-12 mb-12">
      <div>
        <div class="font-bold text-xl mb-4">Logo</div>
        <p class="text-gray-400">Building the future, one line of code at a time.</p>
      </div>
      <div>
        <div class="font-medium mb-4">Product</div>
        <ul class="space-y-2 text-gray-400">
          <li><a href="#" class="hover:text-white transition">Features</a></li>
          <li><a href="#" class="hover:text-white transition">Pricing</a></li>
          <li><a href="#" class="hover:text-white transition">Docs</a></li>
        </ul>
      </div>
      <div>
        <div class="font-medium mb-4">Company</div>
        <ul class="space-y-2 text-gray-400">
          <li><a href="#" class="hover:text-white transition">About</a></li>
          <li><a href="#" class="hover:text-white transition">Blog</a></li>
          <li><a href="#" class="hover:text-white transition">Careers</a></li>
        </ul>
      </div>
      <div>
        <div class="font-medium mb-4">Legal</div>
        <ul class="space-y-2 text-gray-400">
          <li><a href="#" class="hover:text-white transition">Privacy</a></li>
          <li><a href="#" class="hover:text-white transition">Terms</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-gray-800 pt-8 text-center text-gray-500">
      <p>&copy; 2024 Your Company. All rights reserved.</p>
    </div>
  </div>
</footer>`,
      'container': `<div class="max-w-6xl mx-auto px-6 py-12">
  <!-- Add your content here -->
</div>`,
      'grid-2col': `<div class="grid md:grid-cols-2 gap-8 px-6 py-12 max-w-6xl mx-auto">
  <div class="bg-white p-6 rounded-xl shadow-sm">
    <!-- Column 1 content -->
  </div>
  <div class="bg-white p-6 rounded-xl shadow-sm">
    <!-- Column 2 content -->
  </div>
</div>`,
      'grid-3col': `<div class="grid md:grid-cols-3 gap-8 px-6 py-12 max-w-6xl mx-auto">
  <div class="bg-white p-6 rounded-xl shadow-sm">
    <!-- Column 1 content -->
  </div>
  <div class="bg-white p-6 rounded-xl shadow-sm">
    <!-- Column 2 content -->
  </div>
  <div class="bg-white p-6 rounded-xl shadow-sm">
    <!-- Column 3 content -->
  </div>
</div>`,
      'grid-4col': `<div class="grid md:grid-cols-4 gap-6 px-6 py-12 max-w-6xl mx-auto">
  <div class="bg-white p-6 rounded-xl shadow-sm">
    <!-- Column 1 content -->
  </div>
  <div class="bg-white p-6 rounded-xl shadow-sm">
    <!-- Column 2 content -->
  </div>
  <div class="bg-white p-6 rounded-xl shadow-sm">
    <!-- Column 3 content -->
  </div>
  <div class="bg-white p-6 rounded-xl shadow-sm">
    <!-- Column 4 content -->
  </div>
</div>`,
      'grid-sidebar': `<div class="grid md:grid-cols-4 gap-8 px-6 py-12 max-w-6xl mx-auto">
  <aside class="bg-white p-6 rounded-xl shadow-sm">
    <!-- Sidebar content -->
  </aside>
  <main class="md:col-span-3 bg-white p-6 rounded-xl shadow-sm">
    <!-- Main content -->
  </main>
</div>`,
      'flexbox': `<div class="flex flex-wrap gap-6 px-6 py-12 max-w-6xl mx-auto">
  <div class="flex-1 min-w-[200px] bg-white p-6 rounded-xl shadow-sm">
    <!-- Flex item 1 -->
  </div>
  <div class="flex-1 min-w-[200px] bg-white p-6 rounded-xl shadow-sm">
    <!-- Flex item 2 -->
  </div>
  <div class="flex-1 min-w-[200px] bg-white p-6 rounded-xl shadow-sm">
    <!-- Flex item 3 -->
  </div>
</div>`,
      'section': `<section class="py-16 px-6 bg-white">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">Section Title</h2>
    <p class="text-gray-600">Add your content here. This is a flexible section container.</p>
  </div>
</section>`,
      'spacer': `<div class="h-16"></div>`,
      'divider': `<div class="max-w-6xl mx-auto px-6">
  <hr class="border-gray-200" />
</div>`,
    }

    const componentsHtml = canvasComponents.map(comp => {
      // If it's an AI-generated component with code, use that
      if (comp.code) {
        return `<!-- AI Generated: ${comp.name} -->\n${comp.code}`
      }
      // Otherwise use the template
      return componentToHtml[comp.type] || `<!-- Unknown component: ${comp.type} -->`
    }).join('\n\n')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentProject?.name || 'My Website'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen">
${componentsHtml}
</body>
</html>`
  }, [canvasComponents, currentProject?.name])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateHtml())
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
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

  // Load canvas components from current page
  useEffect(() => {
    if (currentPage) {
      setCanvasComponents(currentPage.canvas_components || [])
      setSelectedComponentId(null)
      // Reset history for new page
      setHistory([currentPage.canvas_components || []])
      setHistoryIndex(0)
    }
  }, [currentPage?.id])

  // Auto-save canvas to current page (debounced)
  useEffect(() => {
    if (!currentPage || !currentProject) return

    const timeoutId = setTimeout(() => {
      // Only save if components have actually changed
      const currentJson = JSON.stringify(canvasComponents)
      const savedJson = JSON.stringify(currentPage.canvas_components || [])
      if (currentJson !== savedJson && canvasComponents.length > 0) {
        saveCanvasState(canvasComponents).catch(console.error)
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [canvasComponents, currentPage?.id, currentProject?.id])

  // Handle sidebar resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = window.innerWidth - e.clientX
      setRightPanelWidth(Math.max(300, Math.min(600, newWidth)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    if (isResizing) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  if (!user || !currentProject || !currentPage) {
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
            <span className="text-white/30">/</span>
            <span className="text-white/60">{currentPage.name}</span>
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

        {/* Zoom controls */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/60 w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition"
            title="Reset zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* New Feature Buttons */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
          <button
            onClick={() => setShowThemePanel(true)}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition"
            title="Design Tokens & Themes"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPerformanceScore(true)}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition"
            title="Performance Score"
          >
            <Gauge className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFigmaImport(true)}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition"
            title="Import from Figma"
          >
            <FileImage className="w-4 h-4" />
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
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition ${
                viewMode === 'code' ? 'bg-forma-500 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4" />
              Code
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

          {/* Tutorial button */}
          <button
            onClick={() => setShowTutorial(true)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition"
            title="Show tutorial"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

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
        {/* Left sidebar - Pages */}
        <PagesSidebar
          canvasComponents={canvasComponents}
          selectedComponentId={selectedComponentId}
          onSelectComponent={setSelectedComponentId}
        />

        {/* Component Library */}
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

        {/* Center - Visual Canvas or Code View */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1a1a2e]">
          {viewMode === 'code' ? (
            /* Code View */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Code toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-forma-950/50">
                <div className="flex items-center gap-2 text-white/60">
                  <Code className="w-4 h-4" />
                  <span className="text-sm font-medium">HTML Output</span>
                  <span className="text-xs text-white/40">with Tailwind CSS</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              {/* Code content */}
              <div className="flex-1 overflow-auto p-4">
                <pre className="bg-gray-900 rounded-xl p-4 overflow-auto h-full">
                  <code className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    {generateHtml()}
                  </code>
                </pre>
              </div>
            </div>
          ) : (
            /* Canvas View */
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
                    device={device}
                    zoom={zoom}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar - Properties & AI */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: rightPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/10 flex flex-col flex-shrink-0 bg-forma-950 overflow-hidden relative"
            >
              {/* Resize handle */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-forma-500 transition-colors z-50"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setIsResizing(true)
                }}
              />
              {/* AI Assistant */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-white mb-3">
                  <Wand2 className="w-4 h-4 text-forma-400" />
                  <span className="text-sm font-medium">AI Assistant</span>
                  {isGenerating && <Loader2 className="w-3 h-3 animate-spin text-forma-400" />}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe what you want..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerateWithAI()}
                    disabled={isGenerating}
                  />
                  <button
                    onClick={handleGenerateWithAI}
                    disabled={!aiPrompt.trim() || isGenerating}
                    className="px-3 py-2 rounded-lg bg-forma-500 hover:bg-forma-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </button>
                </div>

                {/* Status */}
                {aiStatus && (
                  <div className={`mt-2 text-xs px-2 py-1 rounded ${
                    aiStatus.startsWith('Error') ? 'bg-red-500/20 text-red-400' :
                    aiStatus === 'Done!' ? 'bg-green-500/20 text-green-400' :
                    'bg-forma-500/20 text-forma-400'
                  }`}>
                    {aiStatus}
                  </div>
                )}

                {/* Mini Terminal */}
                {aiLogs.length > 0 && (
                  <div className="mt-3 bg-black/40 rounded-lg p-2 max-h-24 overflow-y-auto font-mono text-[10px]">
                    {aiLogs.map((log, i) => (
                      <div key={i} className={`${
                        log.includes('Error') ? 'text-red-400' :
                        log.includes('Created') ? 'text-green-400' :
                        'text-white/60'
                      }`}>
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Properties Panel */}
              <div className="flex-1 overflow-hidden">
                <PropertiesPanel
                  component={selectedComponent || null}
                  onUpdate={handleUpdateComponent}
                  onDelete={handleDeleteComponent}
                  onDuplicate={handleDuplicateComponent}
                  device={device}
                />
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Panels */}
      <ThemePanel
        isOpen={showThemePanel}
        onClose={() => setShowThemePanel(false)}
      />

      <PerformanceScore
        components={canvasComponents}
        isOpen={showPerformanceScore}
        onClose={() => setShowPerformanceScore(false)}
      />

      <FigmaImportModal
        isOpen={showFigmaImport}
        onClose={() => setShowFigmaImport(false)}
        onImport={handleFigmaImport}
      />

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  )
}
