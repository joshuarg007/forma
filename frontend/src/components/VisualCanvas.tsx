'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Trash2, Copy, Settings, GripVertical, ChevronUp, ChevronDown,
  Plus, Eye, Code, Sparkles, Move, Maximize2, Minimize2,
  AlignLeft, AlignCenter, AlignRight
} from 'lucide-react'

export interface CanvasComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>
  children?: CanvasComponent[]
  alignment?: 'left' | 'center' | 'right'
}

interface VisualCanvasProps {
  components: CanvasComponent[]
  onComponentsChange: (components: CanvasComponent[]) => void
  selectedId: string | null
  onSelect: (id: string | null) => void
  onGenerateComponent: (type: string, name: string) => Promise<void>
  generating: boolean
}

// Component previews - visual representations of each component type
const componentPreviews: Record<string, (props: any) => JSX.Element> = {
  'hero-centered': () => (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center text-white">
      <h1 className="text-3xl font-bold mb-4">Hero Section</h1>
      <p className="text-white/80 mb-6">Your compelling tagline goes here</p>
      <div className="flex gap-3 justify-center">
        <button className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-medium">Get Started</button>
        <button className="px-6 py-2 border border-white/50 rounded-lg">Learn More</button>
      </div>
    </div>
  ),
  'hero-split': () => (
    <div className="bg-gray-900 p-8 flex items-center gap-8">
      <div className="flex-1 text-white">
        <h1 className="text-3xl font-bold mb-4">Split Hero</h1>
        <p className="text-gray-400 mb-6">Content on the left, image on the right</p>
        <button className="px-6 py-2 bg-indigo-600 rounded-lg font-medium">Get Started</button>
      </div>
      <div className="flex-1 bg-gray-800 rounded-xl h-48 flex items-center justify-center text-gray-500">
        Image Placeholder
      </div>
    </div>
  ),
  'navbar': () => (
    <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="font-bold text-xl text-gray-900">Logo</div>
      <nav className="flex gap-6 text-gray-600">
        <span>Home</span>
        <span>Features</span>
        <span>Pricing</span>
        <span>Contact</span>
      </nav>
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Sign Up</button>
    </div>
  ),
  'section-features': () => (
    <div className="bg-gray-50 p-8">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Features</h2>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Feature {i}</h3>
            <p className="text-gray-500 text-sm">Description of this amazing feature</p>
          </div>
        ))}
      </div>
    </div>
  ),
  'section-pricing': () => (
    <div className="bg-white p-8">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Pricing</h2>
      <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
        {['Basic', 'Pro', 'Enterprise'].map((plan, i) => (
          <div key={plan} className={`p-6 rounded-xl border-2 ${i === 1 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
            <h3 className="font-semibold text-gray-900 mb-2">{plan}</h3>
            <div className="text-3xl font-bold text-gray-900 mb-4">${(i + 1) * 29}</div>
            <button className={`w-full py-2 rounded-lg ${i === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  ),
  'section-testimonials': () => (
    <div className="bg-gray-900 p-8 text-white">
      <h2 className="text-2xl font-bold text-center mb-8">What People Say</h2>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-800 p-6 rounded-xl">
            <p className="text-gray-300 mb-4">"This product changed my life completely!"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full" />
              <div>
                <div className="font-medium">User {i}</div>
                <div className="text-sm text-gray-500">Company {i}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  'section-faq': () => (
    <div className="bg-white p-8">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">FAQ</h2>
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Question {i}?</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  'section-cta': () => (
    <div className="bg-indigo-600 p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
      <p className="text-indigo-100 mb-6">Join thousands of happy customers today</p>
      <button className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium">
        Start Free Trial
      </button>
    </div>
  ),
  'footer': () => (
    <div className="bg-gray-900 p-8 text-white">
      <div className="grid grid-cols-4 gap-8 mb-8">
        <div>
          <div className="font-bold text-xl mb-4">Logo</div>
          <p className="text-gray-400 text-sm">Building the future</p>
        </div>
        {['Product', 'Company', 'Resources'].map(col => (
          <div key={col}>
            <div className="font-medium mb-4">{col}</div>
            <div className="space-y-2 text-gray-400 text-sm">
              <div>Link 1</div>
              <div>Link 2</div>
              <div>Link 3</div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
        © 2024 Company. All rights reserved.
      </div>
    </div>
  ),
  'card-basic': () => (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm mx-auto">
      <h3 className="font-semibold text-gray-900 mb-2">Card Title</h3>
      <p className="text-gray-500 text-sm">Card description goes here with some content.</p>
    </div>
  ),
  'card-image': () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto">
      <div className="h-40 bg-gray-200" />
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Image Card</h3>
        <p className="text-gray-500 text-sm">Card with image header</p>
      </div>
    </div>
  ),
  'form-contact': () => (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
      <h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
      <div className="space-y-4">
        <input className="w-full px-4 py-2 border rounded-lg" placeholder="Name" />
        <input className="w-full px-4 py-2 border rounded-lg" placeholder="Email" />
        <textarea className="w-full px-4 py-2 border rounded-lg" placeholder="Message" rows={3} />
        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg">Send</button>
      </div>
    </div>
  ),
  'container': () => (
    <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg bg-gray-50 text-center text-gray-400">
      Container - Drop components here
    </div>
  ),
  'default': (props: { name: string }) => (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-lg text-center">
      <div className="text-gray-600 font-medium">{props.name}</div>
      <div className="text-gray-400 text-sm mt-1">Component Preview</div>
    </div>
  ),
}

export default function VisualCanvas({
  components,
  onComponentsChange,
  selectedId,
  onSelect,
  onGenerateComponent,
  generating
}: VisualCanvasProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragCounterRef = useRef(0)

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverIndex(null)

    // Try multiple data formats for browser compatibility
    let data = e.dataTransfer.getData('text/plain')
    if (!data) data = e.dataTransfer.getData('application/json')
    if (!data) data = e.dataTransfer.getData('component')
    if (!data) {
      console.log('No drag data found')
      return
    }

    try {
      const item = JSON.parse(data) as { id: string; name: string }

      // Create new component
      const newComponent: CanvasComponent = {
        id: `${item.id}-${Date.now()}`,
        type: item.id,
        name: item.name,
        props: {},
      }

      // Insert at position
      const newComponents = [...components]
      newComponents.splice(index, 0, newComponent)
      onComponentsChange(newComponents)

      // Select the new component
      onSelect(newComponent.id)

      // Optionally generate AI code for this component
      // await onGenerateComponent(item.id, item.name)
    } catch (error) {
      console.error('Drop failed:', error)
    }
  }, [components, onComponentsChange, onSelect])

  const handleDropAtEnd = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverIndex(null)

    // Try multiple data formats for browser compatibility
    let data = e.dataTransfer.getData('text/plain')
    if (!data) data = e.dataTransfer.getData('application/json')
    if (!data) data = e.dataTransfer.getData('component')
    if (!data) {
      console.log('No drag data found')
      return
    }

    try {
      const item = JSON.parse(data) as { id: string; name: string }

      const newComponent: CanvasComponent = {
        id: `${item.id}-${Date.now()}`,
        type: item.id,
        name: item.name,
        props: {},
      }

      onComponentsChange([...components, newComponent])
      onSelect(newComponent.id)
    } catch (error) {
      console.error('Drop failed:', error)
    }
  }, [components, onComponentsChange, onSelect])

  const deleteComponent = useCallback((id: string) => {
    onComponentsChange(components.filter(c => c.id !== id))
    if (selectedId === id) onSelect(null)
  }, [components, onComponentsChange, selectedId, onSelect])

  const duplicateComponent = useCallback((id: string) => {
    const index = components.findIndex(c => c.id === id)
    if (index === -1) return

    const component = components[index]
    const newComponent: CanvasComponent = {
      ...component,
      id: `${component.type}-${Date.now()}`,
    }

    const newComponents = [...components]
    newComponents.splice(index + 1, 0, newComponent)
    onComponentsChange(newComponents)
    onSelect(newComponent.id)
  }, [components, onComponentsChange, onSelect])

  const moveComponent = useCallback((id: string, direction: 'up' | 'down') => {
    const index = components.findIndex(c => c.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === components.length - 1) return

    const newComponents = [...components]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newComponents[index], newComponents[targetIndex]] = [newComponents[targetIndex], newComponents[index]]
    onComponentsChange(newComponents)
  }, [components, onComponentsChange])

  const setAlignment = useCallback((id: string, alignment: 'left' | 'center' | 'right') => {
    const newComponents = components.map(c =>
      c.id === id ? { ...c, alignment } : c
    )
    onComponentsChange(newComponents)
  }, [components, onComponentsChange])

  const renderPreview = (component: CanvasComponent) => {
    const Preview = componentPreviews[component.type] || componentPreviews['default']
    return <Preview name={component.name} {...component.props} />
  }

  // Handle canvas-level drag events with counter to prevent flickering
  const handleCanvasDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current++
    setIsDraggingOver(true)
  }, [])

  const handleCanvasDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDraggingOver(false)
      setDragOverIndex(null)
    }
  }, [])

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    // If no specific drop zone is targeted, set to end
    if (dragOverIndex === null && components.length > 0) {
      setDragOverIndex(components.length)
    } else if (components.length === 0) {
      setDragOverIndex(0)
    }
  }, [dragOverIndex, components.length])

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDraggingOver(false)
    // If dropping on canvas (not a specific zone), add to end
    if (dragOverIndex === null || dragOverIndex === components.length) {
      handleDropAtEnd(e)
    }
  }, [dragOverIndex, components.length, handleDropAtEnd])

  return (
    <div
      ref={canvasRef}
      className={`h-full overflow-auto transition-colors ${
        isDraggingOver ? 'bg-indigo-50' : 'bg-gray-100'
      }`}
      onDragEnter={handleCanvasDragEnter}
      onDragLeave={handleCanvasDragLeave}
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
    >
      {/* Canvas content */}
      <div className="min-h-full">
        {components.length === 0 ? (
          <div
            className={`h-full min-h-[600px] flex items-center justify-center transition-all ${
              dragOverIndex === 0 ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, 0)}
            onDragLeave={handleDragLeave}
            onDrop={handleDropAtEnd}
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                <Plus className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building</h3>
              <p className="text-gray-500 mb-4">Drag components from the library to start</p>
              <p className="text-sm text-gray-400">or click a component to add it</p>
            </div>
          </div>
        ) : (
          <div className="bg-white min-h-full shadow-xl">
            {components.map((component, index) => (
              <div key={component.id}>
                {/* Drop zone before component */}
                <div
                  className={`transition-all ${
                    isDraggingOver
                      ? dragOverIndex === index
                        ? 'h-20 bg-indigo-100 border-2 border-dashed border-indigo-500 flex items-center justify-center'
                        : 'h-8 bg-indigo-50/50'
                      : 'h-1'
                  }`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {isDraggingOver && dragOverIndex === index && (
                    <span className="text-indigo-500 text-sm font-medium">Drop here</span>
                  )}
                </div>

                {/* Component */}
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`relative group cursor-pointer transition-all ${
                    selectedId === component.id
                      ? 'ring-2 ring-indigo-500 ring-offset-2'
                      : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-2'
                  }`}
                  onClick={() => onSelect(component.id)}
                >
                  {/* Component toolbar */}
                  <div className={`absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 bg-gray-900 rounded-lg shadow-lg transition-opacity z-10 ${
                    selectedId === component.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <span className="text-white text-xs font-medium px-2 whitespace-nowrap">{component.name}</span>
                    <div className="w-px h-4 bg-gray-700" />

                    {/* Order controls */}
                    <button
                      onClick={(e) => { e.stopPropagation(); moveComponent(component.id, 'up') }}
                      className="p-1 text-gray-400 hover:text-white transition"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveComponent(component.id, 'down') }}
                      className="p-1 text-gray-400 hover:text-white transition"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <div className="w-px h-4 bg-gray-700" />

                    {/* Alignment controls */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setAlignment(component.id, 'left') }}
                      className={`p-1 transition ${component.alignment === 'left' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                      title="Align left"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAlignment(component.id, 'center') }}
                      className={`p-1 transition ${!component.alignment || component.alignment === 'center' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                      title="Align center"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAlignment(component.id, 'right') }}
                      className={`p-1 transition ${component.alignment === 'right' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                      title="Align right"
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>

                    <div className="w-px h-4 bg-gray-700" />

                    {/* Actions */}
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateComponent(component.id) }}
                      className="p-1 text-gray-400 hover:text-white transition"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteComponent(component.id) }}
                      className="p-1 text-gray-400 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Component preview with alignment */}
                  <div className={`relative ${
                    component.alignment === 'left' ? 'flex justify-start' :
                    component.alignment === 'right' ? 'flex justify-end' :
                    ''
                  }`}>
                    <div className={
                      component.alignment === 'left' || component.alignment === 'right'
                        ? 'w-3/4'
                        : 'w-full'
                    }>
                      {renderPreview(component)}
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}

            {/* Drop zone at end */}
            <div
              className={`transition-all ${
                isDraggingOver
                  ? dragOverIndex === components.length
                    ? 'h-24 bg-indigo-100 border-2 border-dashed border-indigo-500 flex items-center justify-center'
                    : 'h-12 bg-indigo-50/50'
                  : 'h-4'
              }`}
              onDragOver={(e) => handleDragOver(e, components.length)}
              onDragLeave={handleDragLeave}
              onDrop={handleDropAtEnd}
            >
              {isDraggingOver && dragOverIndex === components.length && (
                <span className="text-indigo-500 text-sm font-medium">Drop to add at end</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
