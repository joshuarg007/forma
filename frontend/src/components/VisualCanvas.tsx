'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion'
import {
  Trash2, Copy, GripVertical, ChevronUp, ChevronDown,
  Plus, Sparkles, Move, ChevronDown as ChevronDownIcon,
  AlignLeft, AlignCenter, AlignRight, MoreHorizontal,
  Lock, Unlock, Eye, EyeOff, Layers, Box, Type,
  Palette, Zap, Settings, ArrowUp, ArrowDown, Maximize2,
  CornerDownRight, FolderOpen, Folder
} from 'lucide-react'
import { CanvasComponent, ComponentStyles, AnimationConfig } from '@/types/components'
import QuickAddMenu from './QuickAddMenu'
import {
  getSmartSuggestions,
  recordInteraction,
  COMPONENT_REGISTRY,
  ComponentType,
  PredictionContext,
} from '@/lib/componentAI'

interface VisualCanvasProps {
  components: CanvasComponent[]
  onComponentsChange: (components: CanvasComponent[]) => void
  selectedId: string | null
  onSelect: (id: string | null) => void
  onGenerateComponent: (type: string, name: string) => Promise<void>
  generating: boolean
  device: 'desktop' | 'tablet' | 'mobile'
  zoom: number
}

// Container types that can hold children
const containerTypes = ['grid-2col', 'grid-3col', 'grid-4col', 'section', 'container', 'flexbox', 'flex-row', 'flex-col', 'grid-sidebar']

// Number of slots for each container type
const containerSlots: Record<string, number> = {
  'grid-2col': 2,
  'grid-3col': 3,
  'grid-4col': 4,
  'grid-sidebar': 2,
  'section': 1,
  'container': 1,
  'flexbox': 3,
  'flex-row': 1,
  'flex-col': 1,
}

// Smart suggestions based on parent component type
const smartSuggestions: Record<string, Array<{ id: string; name: string; icon: string }>> = {
  // Grid layouts
  'grid-2col': [
    { id: 'card-basic', name: 'Card', icon: '🃏' },
    { id: 'card-image', name: 'Image Card', icon: '🖼️' },
    { id: 'stats', name: 'Stats', icon: '📊' },
    { id: 'text', name: 'Text Block', icon: '📝' },
    { id: 'image', name: 'Image', icon: '🖼️' },
    { id: 'form-contact', name: 'Contact Form', icon: '📧' },
  ],
  'grid-3col': [
    { id: 'card-basic', name: 'Card', icon: '🃏' },
    { id: 'card-image', name: 'Image Card', icon: '🖼️' },
    { id: 'stats', name: 'Stats', icon: '📊' },
    { id: 'text', name: 'Text Block', icon: '📝' },
    { id: 'team-member', name: 'Team Member', icon: '👤' },
    { id: 'pricing-card', name: 'Pricing Card', icon: '💰' },
  ],
  'grid-4col': [
    { id: 'card-basic', name: 'Card', icon: '🃏' },
    { id: 'stats', name: 'Stat', icon: '📊' },
    { id: 'image', name: 'Image', icon: '🖼️' },
    { id: 'logo', name: 'Logo', icon: '🏷️' },
    { id: 'avatar', name: 'Avatar', icon: '👤' },
  ],
  'grid-sidebar': [
    { id: 'navbar-vertical', name: 'Sidebar Nav', icon: '📋' },
    { id: 'card-basic', name: 'Card', icon: '🃏' },
    { id: 'text', name: 'Content', icon: '📝' },
    { id: 'form-contact', name: 'Form', icon: '📧' },
  ],
  // Sections and containers
  'section': [
    { id: 'hero-centered', name: 'Hero', icon: '🎯' },
    { id: 'section-features', name: 'Features', icon: '✨' },
    { id: 'section-testimonials', name: 'Testimonials', icon: '💬' },
    { id: 'section-pricing', name: 'Pricing', icon: '💰' },
    { id: 'section-cta', name: 'CTA', icon: '📢' },
    { id: 'grid-3col', name: '3 Columns', icon: '▤' },
  ],
  'container': [
    { id: 'card-basic', name: 'Card', icon: '🃏' },
    { id: 'text', name: 'Text', icon: '📝' },
    { id: 'image', name: 'Image', icon: '🖼️' },
    { id: 'button', name: 'Button', icon: '🔘' },
    { id: 'form-contact', name: 'Form', icon: '📧' },
  ],
  // Flexbox
  'flexbox': [
    { id: 'card-basic', name: 'Card', icon: '🃏' },
    { id: 'button', name: 'Button', icon: '🔘' },
    { id: 'avatar', name: 'Avatar', icon: '👤' },
    { id: 'image', name: 'Image', icon: '🖼️' },
    { id: 'text', name: 'Text', icon: '📝' },
  ],
  'flex-row': [
    { id: 'card-basic', name: 'Card', icon: '🃏' },
    { id: 'button', name: 'Button', icon: '🔘' },
    { id: 'avatar', name: 'Avatar', icon: '👤' },
    { id: 'image', name: 'Image', icon: '🖼️' },
  ],
  'flex-col': [
    { id: 'text', name: 'Text', icon: '📝' },
    { id: 'heading', name: 'Heading', icon: '📰' },
    { id: 'image', name: 'Image', icon: '🖼️' },
    { id: 'button', name: 'Button', icon: '🔘' },
    { id: 'form-newsletter', name: 'Newsletter', icon: '📧' },
  ],
  // Default for any container
  'default': [
    { id: 'card-basic', name: 'Card', icon: '🃏' },
    { id: 'text', name: 'Text', icon: '📝' },
    { id: 'image', name: 'Image', icon: '🖼️' },
    { id: 'button', name: 'Button', icon: '🔘' },
  ],
}

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

// Helper: Add component to parent's children at specific slot
function addToParentSlot(
  components: CanvasComponent[],
  parentId: string,
  slotIndex: number,
  newComponent: CanvasComponent
): CanvasComponent[] {
  return components.map(component => {
    if (component.id === parentId) {
      const children = component.children || []
      // Group children by slot index
      const childrenBySlot: Record<number, CanvasComponent[]> = {}
      children.forEach(child => {
        const slot = child.props?.slotIndex ?? 0
        if (!childrenBySlot[slot]) childrenBySlot[slot] = []
        childrenBySlot[slot].push(child)
      })
      // Add new component to the correct slot
      if (!childrenBySlot[slotIndex]) childrenBySlot[slotIndex] = []
      childrenBySlot[slotIndex].push({ ...newComponent, props: { ...newComponent.props, slotIndex } })
      // Flatten back to array
      const newChildren = Object.values(childrenBySlot).flat()
      return { ...component, children: newChildren }
    }
    if (component.children) {
      return {
        ...component,
        children: addToParentSlot(component.children, parentId, slotIndex, newComponent)
      }
    }
    return component
  })
}

// Animation variants for entrance animations
const entranceAnimations = {
  none: { initial: {}, animate: {} },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  'slide-up': { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 } },
  'slide-down': { initial: { opacity: 0, y: -50 }, animate: { opacity: 1, y: 0 } },
  'slide-left': { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 } },
  'slide-right': { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 } },
  zoom: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
  bounce: { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.5 } } },
  flip: { initial: { opacity: 0, rotateX: 90 }, animate: { opacity: 1, rotateX: 0 } },
  rotate: { initial: { opacity: 0, rotate: -180 }, animate: { opacity: 1, rotate: 0 } },
}

// Loop animations
const loopAnimations = {
  none: {},
  pulse: { animate: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } } },
  bounce: { animate: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 1 } } },
  shake: { animate: { x: [0, -5, 5, -5, 5, 0], transition: { repeat: Infinity, duration: 0.5 } } },
  swing: { animate: { rotate: [0, 5, -5, 5, -5, 0], transition: { repeat: Infinity, duration: 1 } } },
  float: { animate: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' } } },
  spin: { animate: { rotate: 360, transition: { repeat: Infinity, duration: 2, ease: 'linear' } } },
}

// Inline editable text component
function EditableText({
  value,
  defaultValue,
  onChange,
  className,
  as: Component = 'span',
  multiline = false,
}: {
  value?: string
  defaultValue: string
  onChange?: (value: string) => void
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  multiline?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || defaultValue)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditValue(value || defaultValue)
  }, [value, defaultValue])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleClick = (e: React.MouseEvent) => {
    if (onChange) {
      e.stopPropagation()
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (onChange && editValue !== (value || defaultValue)) {
      onChange(editValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === 'Escape') {
      setEditValue(value || defaultValue)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    const inputClass = `bg-transparent border-none outline-none w-full text-inherit font-inherit ${className || ''}`

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`${inputClass} resize-none`}
          rows={3}
          onClick={(e) => e.stopPropagation()}
        />
      )
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={inputClass}
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  return (
    <Component
      className={`${className || ''} ${onChange ? 'cursor-text hover:outline hover:outline-2 hover:outline-dashed hover:outline-white/30 hover:outline-offset-2 rounded' : ''}`}
      onClick={handleClick}
      title={onChange ? 'Click to edit' : undefined}
    >
      {value || defaultValue}
    </Component>
  )
}

// Smart Add Dropdown component with TensorFlow.js AI
function SmartAddDropdown({
  parentType,
  onSelect,
  existingChildren = [],
  siblingComponents = [],
  pageComponents = [],
  className,
}: {
  parentType: string
  onSelect: (item: { id: string; name: string }) => void
  existingChildren?: string[]
  siblingComponents?: string[]
  pageComponents?: string[]
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; icon: string; reason?: string }>>([])
  const [aiReady, setAiReady] = useState(false)

  // Fetch AI suggestions when dropdown opens
  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    async function fetchSuggestions() {
      setLoading(true)

      try {
        // Build context for AI
        const context: PredictionContext = {
          parentType: parentType as ComponentType,
          existingChildren: existingChildren as ComponentType[],
          siblingComponents: siblingComponents as ComponentType[],
          pageComponents: pageComponents as ComponentType[],
        }

        // Get AI predictions (TensorFlow.js - runs in browser)
        const predictions = await getSmartSuggestions(context, 6)

        if (cancelled) return

        // Map to display format
        const mapped = predictions.map(p => {
          const meta = COMPONENT_REGISTRY[p.componentType]
          return {
            id: p.componentType,
            name: meta?.name || p.componentType,
            icon: meta?.icon || '📦',
            reason: p.reason,
          }
        })

        setSuggestions(mapped)
        setAiReady(true)
      } catch (e) {
        console.warn('[ComponentAI] Suggestions failed:', e)
        // Fallback to static suggestions
        const fallback = smartSuggestions[parentType] || smartSuggestions['default']
        setSuggestions(fallback.map(s => ({ ...s, reason: undefined })))
      }

      setLoading(false)
    }

    fetchSuggestions()

    return () => { cancelled = true }
  }, [isOpen, parentType, existingChildren, siblingComponents, pageComponents])

  // Handle selection - record for learning
  const handleSelect = (item: { id: string; name: string }) => {
    // Record this interaction for personalization
    recordInteraction(
      {
        parentType: parentType as ComponentType,
        existingChildren: existingChildren as ComponentType[],
        siblingComponents: siblingComponents as ComponentType[],
        pageComponents: pageComponents as ComponentType[],
      },
      item.id as ComponentType
    )

    onSelect(item)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className || ''}`}>
      <motion.button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
        className="w-10 h-10 rounded-xl bg-white shadow-lg border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:shadow-xl flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-all group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with AI status */}
              <div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-100 mb-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Add Component
                </span>
                {loading ? (
                  <span className="flex items-center gap-1 text-xs text-purple-500">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="inline-block"
                    >
                      🧠
                    </motion.span>
                    Learning...
                  </span>
                ) : aiReady ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    AI
                  </span>
                ) : null}
              </div>

              <div className="max-h-64 overflow-y-auto">
                {suggestions.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect({ id: item.id, name: item.name })
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition group"
                  >
                    <span className="text-base">{item.icon}</span>
                    <div className="flex-1 text-left">
                      <span className="block">{item.name}</span>
                      {item.reason && (
                        <span className="text-xs text-gray-400 group-hover:text-indigo-400 truncate block">
                          {item.reason}
                        </span>
                      )}
                    </div>
                    {aiReady && index < 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600">
                        AI
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Footer - personalization hint */}
              <div className="px-3 py-2 border-t border-gray-100 mt-1">
                <p className="text-[10px] text-gray-400 text-center">
                  ✨ Learns from your choices
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Component previews - visual representations of each component type
// Props include: name, content, onContentChange, and any other component props
const componentPreviews: Record<string, (props: any) => JSX.Element> = {
  'hero-centered': ({ content, onContentChange }: { content?: Record<string, any>; onContentChange?: (key: string, value: any) => void }) => {
    const buttons = content?.buttons || [
      { id: '1', text: 'Get Started', link: '', style: 'primary' },
      { id: '2', text: 'Learn More', link: '', style: 'outline' },
    ]
    const buttonStyleClasses: Record<string, string> = {
      primary: 'bg-white text-indigo-600',
      secondary: 'bg-indigo-500 text-white',
      outline: 'border border-white/50 text-white',
      ghost: 'text-white hover:bg-white/10',
    }
    const updateButtonText = (btnId: string, newText: string) => {
      if (!onContentChange) return
      const updatedButtons = buttons.map((b: any) => b.id === btnId ? { ...b, text: newText } : b)
      onContentChange('buttons', updatedButtons)
    }
    return (
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center text-white">
        <EditableText
          as="h1"
          value={content?.title}
          defaultValue="Hero Section"
          onChange={onContentChange ? (v) => onContentChange('title', v) : undefined}
          className="text-3xl font-bold mb-4"
        />
        <EditableText
          as="p"
          value={content?.subtitle}
          defaultValue="Your compelling tagline goes here"
          onChange={onContentChange ? (v) => onContentChange('subtitle', v) : undefined}
          className="text-white/80 mb-6"
          multiline
        />
        <div className="flex gap-3 justify-center flex-wrap">
          {buttons.map((btn: { id: string; text: string; style: string }) => (
            <button
              key={btn.id}
              className={`px-6 py-2 rounded-lg font-medium transition ${buttonStyleClasses[btn.style] || buttonStyleClasses.primary}`}
            >
              <EditableText
                value={btn.text}
                defaultValue="Button"
                onChange={onContentChange ? (v) => updateButtonText(btn.id, v) : undefined}
              />
            </button>
          ))}
        </div>
      </div>
    )
  },
  'hero-split': ({ content, onContentChange }: { content?: Record<string, any>; onContentChange?: (key: string, value: any) => void }) => {
    const buttons = content?.buttons || [{ id: '1', text: 'Get Started', link: '', style: 'primary' }]
    const buttonStyleClasses: Record<string, string> = {
      primary: 'bg-indigo-600 text-white',
      secondary: 'bg-white text-indigo-600',
      outline: 'border border-white/50 text-white',
      ghost: 'text-white hover:bg-white/10',
    }
    const updateButtonText = (btnId: string, newText: string) => {
      if (!onContentChange) return
      const updatedButtons = buttons.map((b: any) => b.id === btnId ? { ...b, text: newText } : b)
      onContentChange('buttons', updatedButtons)
    }
    return (
      <div className="bg-gray-900 p-8 flex items-center gap-8">
        <div className="flex-1 text-white">
          <EditableText
            as="h1"
            value={content?.title}
            defaultValue="Split Hero"
            onChange={onContentChange ? (v) => onContentChange('title', v) : undefined}
            className="text-3xl font-bold mb-4"
          />
          <EditableText
            as="p"
            value={content?.subtitle}
            defaultValue="Content on the left, image on the right"
            onChange={onContentChange ? (v) => onContentChange('subtitle', v) : undefined}
            className="text-gray-400 mb-6"
            multiline
          />
          <div className="flex gap-3 flex-wrap">
            {buttons.map((btn: { id: string; text: string; style: string }) => (
              <button
                key={btn.id}
                className={`px-6 py-2 rounded-lg font-medium transition ${buttonStyleClasses[btn.style] || buttonStyleClasses.primary}`}
              >
                <EditableText
                  value={btn.text}
                  defaultValue="Button"
                  onChange={onContentChange ? (v) => updateButtonText(btn.id, v) : undefined}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-gray-800 rounded-xl h-48 flex items-center justify-center text-gray-500 overflow-hidden">
          {content?.imageUrl ? (
            <img src={content.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            'Image Placeholder'
          )}
        </div>
      </div>
    )
  },
  'navbar': ({ content }: { content?: Record<string, string> }) => {
    const links = content?.links?.split(',').map(s => s.trim()) || ['Home', 'Features', 'Pricing', 'Contact']
    return (
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-xl text-gray-900">{content?.brand || 'Logo'}</div>
        <nav className="flex gap-6 text-gray-600">
          {links.map((link, i) => <span key={i}>{link}</span>)}
        </nav>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Sign Up</button>
      </div>
    )
  },
  'navbar-vertical': () => (
    <div className="h-full min-h-[100vh] w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">F</div>
          <span className="font-semibold">Forma</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600 text-white">
          <span>🏠</span> Home
        </a>
        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800">
          <span>✨</span> Features
        </a>
        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800">
          <span>💰</span> Pricing
        </a>
        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800">
          <span>📧</span> Contact
        </a>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full" />
          <div className="text-sm font-medium">User</div>
        </div>
      </div>
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
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  'section-cta': ({ content, onContentChange }: { content?: Record<string, any>; onContentChange?: (key: string, value: any) => void }) => {
    const buttons = content?.buttons || [{ id: '1', text: 'Start Free Trial', link: '', style: 'primary' }]
    const buttonStyleClasses: Record<string, string> = {
      primary: 'bg-white text-indigo-600',
      secondary: 'bg-indigo-500 text-white border border-white',
      outline: 'border border-white text-white',
      ghost: 'text-white hover:bg-white/10',
    }
    const updateButtonText = (btnId: string, newText: string) => {
      if (!onContentChange) return
      const updatedButtons = buttons.map((b: any) => b.id === btnId ? { ...b, text: newText } : b)
      onContentChange('buttons', updatedButtons)
    }
    return (
      <div className="bg-indigo-600 p-8 text-center text-white">
        <EditableText
          as="h2"
          value={content?.title}
          defaultValue="Ready to get started?"
          onChange={onContentChange ? (v) => onContentChange('title', v) : undefined}
          className="text-2xl font-bold mb-4"
        />
        <EditableText
          as="p"
          value={content?.subtitle}
          defaultValue="Join thousands of happy customers today"
          onChange={onContentChange ? (v) => onContentChange('subtitle', v) : undefined}
          className="text-indigo-100 mb-6"
        />
        <div className="flex gap-3 justify-center flex-wrap">
          {buttons.map((btn: { id: string; text: string; style: string }) => (
            <button
              key={btn.id}
              className={`px-8 py-3 rounded-lg font-medium transition ${buttonStyleClasses[btn.style] || buttonStyleClasses.primary}`}
            >
              <EditableText
                value={btn.text}
                defaultValue="Button"
                onChange={onContentChange ? (v) => updateButtonText(btn.id, v) : undefined}
              />
            </button>
          ))}
        </div>
      </div>
    )
  },
  'footer': ({ content }: { content?: Record<string, string> }) => (
    <div className="bg-gray-900 p-8 text-white">
      <div className="grid grid-cols-4 gap-8 mb-8">
        <div>
          <div className="font-bold text-xl mb-4">{content?.brand || 'Logo'}</div>
          <p className="text-gray-400 text-sm">{content?.tagline || 'Building the future'}</p>
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
        {content?.copyright || '© 2024 Company. All rights reserved.'}
      </div>
    </div>
  ),
  'sidebar': () => (
    <div className="flex min-h-[400px]">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">A</div>
            <span className="font-semibold">AppName</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600 text-white">Dashboard</a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800">Users</a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800">Analytics</a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800">Settings</a>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full" />
            <div className="text-sm font-medium">John Doe</div>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gray-100 p-6 text-gray-500 text-center">Main Content Area</div>
    </div>
  ),
  'sidebar-minimal': () => (
    <div className="flex min-h-[300px]">
      <div className="w-16 bg-gray-900 text-white flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm mb-6">A</div>
        <nav className="flex-1 flex flex-col gap-2">
          <a href="#" className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">🏠</a>
          <a href="#" className="w-10 h-10 rounded-lg text-gray-400 hover:bg-gray-800 flex items-center justify-center">👥</a>
          <a href="#" className="w-10 h-10 rounded-lg text-gray-400 hover:bg-gray-800 flex items-center justify-center">📊</a>
        </nav>
      </div>
      <div className="flex-1 bg-gray-100 p-6 text-gray-500 text-center">Main Content</div>
    </div>
  ),
  'dashboard-layout': () => (
    <div className="min-h-[400px] bg-gray-100">
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="font-bold text-gray-900">Dashboard</div>
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <span className="text-indigo-600 font-medium">Overview</span>
          <span>Analytics</span>
          <span>Reports</span>
        </div>
        <div className="w-8 h-8 bg-indigo-500 rounded-full" />
      </div>
      <div className="p-6 grid grid-cols-3 gap-6">
        {[['Users', '12,345', '+12%'], ['Revenue', '$54,321', '+8%'], ['Projects', '48', '-3%']].map(([label, value, change]) => (
          <div key={label} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">{label}</div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className={`text-xs mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{change}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  'card-basic': ({ content, onContentChange }: { content?: Record<string, string>; onContentChange?: (key: string, value: any) => void }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm mx-auto">
      <EditableText
        as="h3"
        value={content?.title}
        defaultValue="Card Title"
        onChange={onContentChange ? (v) => onContentChange('title', v) : undefined}
        className="font-semibold text-gray-900 mb-2"
      />
      <EditableText
        as="p"
        value={content?.description}
        defaultValue="Card description goes here with some content."
        onChange={onContentChange ? (v) => onContentChange('description', v) : undefined}
        className="text-gray-500 text-sm"
        multiline
      />
    </div>
  ),
  'card-image': ({ content, onContentChange }: { content?: Record<string, string>; onContentChange?: (key: string, value: any) => void }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto">
      <div className="h-40 bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden">
        {content?.imageUrl && <img src={content.imageUrl} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="p-6">
        <EditableText
          as="h3"
          value={content?.title}
          defaultValue="Image Card"
          onChange={onContentChange ? (v) => onContentChange('title', v) : undefined}
          className="font-semibold text-gray-900 mb-2"
        />
        <EditableText
          as="p"
          value={content?.description}
          defaultValue="Card with image header"
          onChange={onContentChange ? (v) => onContentChange('description', v) : undefined}
          className="text-gray-500 text-sm"
          multiline
        />
      </div>
    </div>
  ),
  'form-contact': ({ content, onContentChange }: { content?: Record<string, string>; onContentChange?: (key: string, value: any) => void }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
      <EditableText
        as="h3"
        value={content?.title}
        defaultValue="Contact Us"
        onChange={onContentChange ? (v) => onContentChange('title', v) : undefined}
        className="font-semibold text-gray-900 mb-4"
      />
      <div className="space-y-4">
        <input className="w-full px-4 py-2 border rounded-lg" placeholder="Name" />
        <input className="w-full px-4 py-2 border rounded-lg" placeholder="Email" />
        <textarea className="w-full px-4 py-2 border rounded-lg" placeholder="Message" rows={3} />
        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg">
          <EditableText
            value={content?.buttonText}
            defaultValue="Send"
            onChange={onContentChange ? (v) => onContentChange('buttonText', v) : undefined}
          />
        </button>
      </div>
    </div>
  ),
  'container': () => (
    <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg bg-gray-50 text-center text-gray-400 min-h-[200px] flex items-center justify-center">
      <div>
        <Box className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <span>Container - Drop components here</span>
      </div>
    </div>
  ),
  'grid-2col': () => (
    <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50">
      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400 min-h-[100px]">Column 1</div>
      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400 min-h-[100px]">Column 2</div>
    </div>
  ),
  'grid-3col': () => (
    <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50">
      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400">Column 1</div>
      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400">Column 2</div>
      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400">Column 3</div>
    </div>
  ),
  'grid-4col': () => (
    <div className="grid grid-cols-4 gap-6 p-6 bg-gray-50">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400">Col {i}</div>
      ))}
    </div>
  ),
  'grid-sidebar': () => (
    <div className="grid grid-cols-4 gap-6 p-6 bg-gray-50">
      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400">Sidebar</div>
      <div className="col-span-3 bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400">Main Content</div>
    </div>
  ),
  'flexbox': () => (
    <div className="flex gap-4 p-6 bg-gray-50">
      <div className="flex-1 bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400">Flex 1</div>
      <div className="flex-1 bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400">Flex 2</div>
      <div className="flex-1 bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center text-gray-400">Flex 3</div>
    </div>
  ),
  'section': () => (
    <div className="py-16 px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Section Title</h2>
        <p className="text-gray-600">Add your content here. This is a flexible section container.</p>
      </div>
    </div>
  ),
  'spacer': () => (
    <div className="h-16 bg-gray-100 flex items-center justify-center text-gray-400 text-sm border-y border-dashed border-gray-300">
      ↕ Spacer
    </div>
  ),
  'divider': () => (
    <div className="py-4 px-8">
      <hr className="border-gray-200" />
    </div>
  ),
  'ai-generated': (props: { name: string }) => (
    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-8 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5" />
        <span className="text-sm font-medium opacity-80">AI Generated</span>
      </div>
      <h2 className="text-2xl font-bold mb-2">{props.name}</h2>
      <p className="text-white/70 text-sm">This component was generated by AI.</p>
    </div>
  ),
  'default': (props: { name: string }) => (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-lg text-center">
      <div className="text-gray-600 font-medium">{props.name}</div>
      <div className="text-gray-400 text-sm mt-1">Component Preview</div>
    </div>
  ),
}

// Context menu component
function ContextMenu({
  x,
  y,
  onClose,
  onAction
}: {
  x: number
  y: number
  onClose: () => void
  onAction: (action: string) => void
}) {
  useEffect(() => {
    const handleClick = () => onClose()
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  const menuItems = [
    { label: 'Cut', shortcut: '⌘X', action: 'cut', icon: '✂️' },
    { label: 'Copy', shortcut: '⌘C', action: 'copy', icon: '📋' },
    { label: 'Paste', shortcut: '⌘V', action: 'paste', icon: '📄' },
    { label: 'Duplicate', shortcut: '⌘D', action: 'duplicate', icon: '⊕' },
    { divider: true },
    { label: 'Move Up', shortcut: '↑', action: 'move-up', icon: '⬆️' },
    { label: 'Move Down', shortcut: '↓', action: 'move-down', icon: '⬇️' },
    { label: 'Bring to Front', action: 'bring-front', icon: '⤴️' },
    { label: 'Send to Back', action: 'send-back', icon: '⤵️' },
    { divider: true },
    { label: 'Pin as Sidebar', action: 'pin-sidebar', icon: '📌' },
    { label: 'Lock', shortcut: '⌘L', action: 'lock', icon: '🔒' },
    { label: 'Hide', shortcut: '⌘H', action: 'hide', icon: '👁️' },
    { divider: true },
    { label: 'Delete', shortcut: '⌫', action: 'delete', icon: '🗑️', danger: true },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-[100] bg-gray-900 rounded-xl shadow-2xl border border-white/10 py-2 min-w-[200px] overflow-hidden"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, i) =>
        item.divider ? (
          <div key={i} className="my-2 border-t border-white/10" />
        ) : (
          <button
            key={item.action}
            onClick={() => onAction(item.action!)}
            className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-white/10 transition ${
              item.danger ? 'text-red-400 hover:text-red-300' : 'text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </span>
            {item.shortcut && (
              <span className="text-xs text-white/40">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </motion.div>
  )
}

// Animated component wrapper
function AnimatedComponent({
  component,
  children,
  isSelected
}: {
  component: CanvasComponent
  children: React.ReactNode
  isSelected: boolean
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const controls = useAnimation()

  const animation = component.animation || {}
  const entrance = animation.entrance || { type: 'none' as const, duration: 500, delay: 0, easing: 'ease-out' as const }
  const loop = animation.loop || { type: 'none' as const, duration: 1000 }
  const hover = animation.hover || { duration: 200 }

  // Get entrance animation
  const entranceVariant = entranceAnimations[entrance.type as keyof typeof entranceAnimations] || entranceAnimations.none

  // Get loop animation
  const loopVariant = loopAnimations[loop.type as keyof typeof loopAnimations] || loopAnimations.none

  // Trigger entrance animation when in view
  useEffect(() => {
    if (isInView && entrance.type !== 'none') {
      controls.start('animate')
    }
  }, [isInView, entrance.type, controls])

  // Build hover animation
  const hoverAnimation = hover.scale || hover.translateY || hover.rotate ? {
    scale: hover.scale || 1,
    y: hover.translateY || 0,
    rotate: hover.rotate || 0,
    transition: { duration: (hover.duration || 200) / 1000 }
  } : {}

  return (
    <motion.div
      ref={ref}
      initial={entranceVariant.initial}
      animate={controls}
      variants={{
        animate: {
          ...entranceVariant.animate,
          transition: {
            duration: (entrance.duration || 500) / 1000,
            delay: (entrance.delay || 0) / 1000,
            ease: entrance.easing === 'spring' ? undefined : entrance.easing || 'easeOut',
            type: entrance.easing === 'spring' ? 'spring' : 'tween'
          }
        }
      }}
      whileHover={!isSelected ? hoverAnimation : {}}
      {...(loop.type !== 'none' ? loopVariant : {})}
    >
      {children}
    </motion.div>
  )
}

// Convert component styles to CSS
function stylesToCSS(styles?: ComponentStyles): React.CSSProperties {
  if (!styles) return {}

  const css: React.CSSProperties = {}

  // Typography
  if (styles.fontFamily) css.fontFamily = styles.fontFamily
  if (styles.fontSize) css.fontSize = styles.fontSize
  if (styles.fontWeight) css.fontWeight = styles.fontWeight as any
  if (styles.lineHeight) css.lineHeight = styles.lineHeight
  if (styles.letterSpacing) css.letterSpacing = styles.letterSpacing
  if (styles.textAlign) css.textAlign = styles.textAlign
  if (styles.textColor) css.color = styles.textColor
  if (styles.textTransform) css.textTransform = styles.textTransform

  // Background
  if (styles.backgroundColor) css.backgroundColor = styles.backgroundColor
  if (styles.backgroundGradient) {
    const { type, angle, colors } = styles.backgroundGradient
    const colorStops = colors.map(c => `${c.color} ${c.position}%`).join(', ')
    css.background = type === 'linear'
      ? `linear-gradient(${angle || 135}deg, ${colorStops})`
      : `radial-gradient(circle, ${colorStops})`
  }
  if (styles.backgroundImage) css.backgroundImage = `url(${styles.backgroundImage})`
  if (styles.backgroundSize) css.backgroundSize = styles.backgroundSize
  if (styles.backgroundPosition) css.backgroundPosition = styles.backgroundPosition

  // Spacing
  if (styles.padding) {
    const { top, right, bottom, left } = styles.padding
    css.padding = `${top}px ${right}px ${bottom}px ${left}px`
  }
  if (styles.margin) {
    const { top, right, bottom, left } = styles.margin
    css.margin = `${top}px ${right}px ${bottom}px ${left}px`
  }

  // Size
  if (styles.width) css.width = styles.width
  if (styles.maxWidth) css.maxWidth = styles.maxWidth
  if (styles.minWidth) css.minWidth = styles.minWidth
  if (styles.height) css.height = styles.height
  if (styles.maxHeight) css.maxHeight = styles.maxHeight
  if (styles.minHeight) css.minHeight = styles.minHeight

  // Border
  if (styles.borderRadius) {
    const { topLeft, topRight, bottomRight, bottomLeft } = styles.borderRadius
    css.borderRadius = `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`
  }
  if (styles.borderWidth) {
    const { top, right, bottom, left } = styles.borderWidth
    css.borderWidth = `${top}px ${right}px ${bottom}px ${left}px`
  }
  if (styles.borderColor) css.borderColor = styles.borderColor
  if (styles.borderStyle) css.borderStyle = styles.borderStyle

  // Shadow
  if (styles.boxShadow && styles.boxShadow.length > 0) {
    css.boxShadow = styles.boxShadow
      .map(s => `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`)
      .join(', ')
  }

  // Layout
  if (styles.display) css.display = styles.display
  if (styles.flexDirection) css.flexDirection = styles.flexDirection
  if (styles.justifyContent) {
    const map: Record<string, string> = {
      start: 'flex-start', center: 'center', end: 'flex-end',
      between: 'space-between', around: 'space-around', evenly: 'space-evenly'
    }
    css.justifyContent = map[styles.justifyContent] || styles.justifyContent
  }
  if (styles.alignItems) {
    const map: Record<string, string> = {
      start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline'
    }
    css.alignItems = map[styles.alignItems] || styles.alignItems
  }
  if (styles.gap) css.gap = `${styles.gap}px`
  if (styles.gridColumns) css.gridTemplateColumns = `repeat(${styles.gridColumns}, 1fr)`

  // Position
  if (styles.position) css.position = styles.position
  if (styles.top) css.top = styles.top
  if (styles.right) css.right = styles.right
  if (styles.bottom) css.bottom = styles.bottom
  if (styles.left) css.left = styles.left
  if (styles.zIndex) css.zIndex = styles.zIndex

  // Visibility
  if (styles.opacity !== undefined) css.opacity = styles.opacity
  if (styles.overflow) css.overflow = styles.overflow
  if (styles.visibility) css.visibility = styles.visibility

  // Filters
  if (styles.filter) {
    const filters: string[] = []
    if (styles.filter.blur) filters.push(`blur(${styles.filter.blur}px)`)
    if (styles.filter.brightness !== undefined && styles.filter.brightness !== 100) filters.push(`brightness(${styles.filter.brightness}%)`)
    if (styles.filter.contrast !== undefined && styles.filter.contrast !== 100) filters.push(`contrast(${styles.filter.contrast}%)`)
    if (styles.filter.grayscale) filters.push(`grayscale(${styles.filter.grayscale}%)`)
    if (styles.filter.hueRotate) filters.push(`hue-rotate(${styles.filter.hueRotate}deg)`)
    if (styles.filter.invert) filters.push(`invert(${styles.filter.invert}%)`)
    if (styles.filter.saturate !== undefined && styles.filter.saturate !== 100) filters.push(`saturate(${styles.filter.saturate}%)`)
    if (styles.filter.sepia) filters.push(`sepia(${styles.filter.sepia}%)`)
    if (filters.length > 0) css.filter = filters.join(' ')
  }

  // Backdrop Filter (glassmorphism)
  if (styles.backdropFilter) {
    const filters: string[] = []
    if (styles.backdropFilter.blur) filters.push(`blur(${styles.backdropFilter.blur}px)`)
    if (styles.backdropFilter.brightness !== undefined && styles.backdropFilter.brightness !== 100) filters.push(`brightness(${styles.backdropFilter.brightness}%)`)
    if (styles.backdropFilter.contrast !== undefined && styles.backdropFilter.contrast !== 100) filters.push(`contrast(${styles.backdropFilter.contrast}%)`)
    if (styles.backdropFilter.grayscale) filters.push(`grayscale(${styles.backdropFilter.grayscale}%)`)
    if (styles.backdropFilter.saturate !== undefined && styles.backdropFilter.saturate !== 100) filters.push(`saturate(${styles.backdropFilter.saturate}%)`)
    if (filters.length > 0) css.backdropFilter = filters.join(' ')
  }

  // Blend mode
  if (styles.mixBlendMode) css.mixBlendMode = styles.mixBlendMode

  // Cursor
  if (styles.cursor) css.cursor = styles.cursor

  return css
}

export default function VisualCanvas({
  components,
  onComponentsChange,
  selectedId,
  onSelect,
  onGenerateComponent,
  generating,
  device = 'desktop',
  zoom = 100
}: VisualCanvasProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; componentId: string } | null>(null)
  const [clipboard, setClipboard] = useState<CanvasComponent | null>(null)
  const [isDraggingComponent, setIsDraggingComponent] = useState<string | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddPosition, setQuickAddPosition] = useState<{ x: number; y: number } | undefined>()
  const [dragOverSlot, setDragOverSlot] = useState<{ parentId: string; slotIndex: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragCounterRef = useRef(0)

  // Compute layout sections
  const headerComponents = useMemo(() =>
    components.filter(c => c.layoutRole === 'header'),
    [components]
  )
  const sidebarComponent = useMemo(() =>
    components.find(c => c.layoutRole === 'sidebar'),
    [components]
  )
  const footerComponents = useMemo(() =>
    components.filter(c => c.layoutRole === 'footer'),
    [components]
  )
  const mainComponents = useMemo(() =>
    components.filter(c => !c.layoutRole || c.layoutRole === 'main'),
    [components]
  )
  const hasLayoutMode = useMemo(() =>
    headerComponents.length > 0 || sidebarComponent || footerComponents.length > 0,
    [headerComponents, sidebarComponent, footerComponents]
  )

  // Device widths for responsive preview
  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return

      const isCmd = e.metaKey || e.ctrlKey

      if (isCmd && e.key === 'c') {
        e.preventDefault()
        handleCopy()
      } else if (isCmd && e.key === 'v') {
        e.preventDefault()
        handlePaste()
      } else if (isCmd && e.key === 'd') {
        e.preventDefault()
        duplicateComponent(selectedId)
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement === document.body) {
          e.preventDefault()
          deleteComponent(selectedId)
        }
      } else if (e.key === 'ArrowUp' && !e.shiftKey) {
        e.preventDefault()
        moveComponent(selectedId, 'up')
      } else if (e.key === 'ArrowDown' && !e.shiftKey) {
        e.preventDefault()
        moveComponent(selectedId, 'down')
      } else if (e.key === 'Escape') {
        onSelect(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, clipboard])

  const handleCopy = useCallback(() => {
    if (!selectedId) return
    // Search in root and nested components
    const component = findComponentById(components, selectedId)
    if (component) {
      setClipboard({ ...component })
    }
  }, [components, selectedId])

  const handlePaste = useCallback(() => {
    if (!clipboard) return
    const newComponent: CanvasComponent = {
      ...clipboard,
      id: `${clipboard.type}-${Date.now()}`
    }
    onComponentsChange([...components, newComponent])
    onSelect(newComponent.id)
  }, [clipboard, components, onComponentsChange, onSelect])

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
    setIsDraggingOver(false)
    dragCounterRef.current = 0

    // Check if it's an internal reorder
    if (isDraggingComponent) {
      const currentIndex = components.findIndex(c => c.id === isDraggingComponent)
      if (currentIndex !== -1 && currentIndex !== index) {
        const newComponents = [...components]
        const [removed] = newComponents.splice(currentIndex, 1)
        const adjustedIndex = currentIndex < index ? index - 1 : index
        newComponents.splice(adjustedIndex, 0, removed)
        onComponentsChange(newComponents)
      }
      setIsDraggingComponent(null)
      return
    }

    // External component drop
    let data = e.dataTransfer.getData('text/plain')
    if (!data) data = e.dataTransfer.getData('application/json')
    if (!data) data = e.dataTransfer.getData('component')
    if (!data) return

    try {
      const item = JSON.parse(data) as { id: string; name: string }
      const newComponent: CanvasComponent = {
        id: `${item.id}-${Date.now()}`,
        type: item.id,
        name: item.name,
        props: {},
      }
      const newComponents = [...components]
      newComponents.splice(index, 0, newComponent)
      onComponentsChange(newComponents)
      onSelect(newComponent.id)
    } catch (error) {
      console.error('Drop failed:', error)
    }
  }, [components, onComponentsChange, onSelect, isDraggingComponent])

  const handleDropAtEnd = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverIndex(null)
    setIsDraggingOver(false)
    dragCounterRef.current = 0

    if (isDraggingComponent) {
      setIsDraggingComponent(null)
      return
    }

    let data = e.dataTransfer.getData('text/plain')
    if (!data) data = e.dataTransfer.getData('application/json')
    if (!data) data = e.dataTransfer.getData('component')
    if (!data) return

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
  }, [components, onComponentsChange, onSelect, isDraggingComponent])

  const deleteComponent = useCallback((id: string) => {
    // Try to find in root first
    const rootIndex = components.findIndex(c => c.id === id)
    if (rootIndex !== -1) {
      onComponentsChange(components.filter(c => c.id !== id))
    } else {
      // Must be a nested component, use tree removal
      onComponentsChange(removeComponentFromTree(components, id))
    }
    if (selectedId === id) onSelect(null)
  }, [components, onComponentsChange, selectedId, onSelect])

  const duplicateComponent = useCallback((id: string) => {
    // Check if it's a root component
    const rootIndex = components.findIndex(c => c.id === id)
    if (rootIndex !== -1) {
      const component = components[rootIndex]
      const newComponent: CanvasComponent = {
        ...component,
        id: `${component.type}-${Date.now()}`,
        children: component.children ? component.children.map(c => ({
          ...c,
          id: `${c.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        })) : undefined,
      }
      const newComponents = [...components]
      newComponents.splice(rootIndex + 1, 0, newComponent)
      onComponentsChange(newComponents)
      onSelect(newComponent.id)
      return
    }

    // Handle nested component duplication
    const found = findComponentById(components, id)
    if (!found) return

    const newComponent: CanvasComponent = {
      ...found,
      id: `${found.type}-${Date.now()}`,
    }

    // Find parent and add duplicate after original
    const newComponents = updateComponentInTree(components, found.parentId!, (parent) => {
      const children = parent.children || []
      const childIndex = children.findIndex(c => c.id === id)
      if (childIndex === -1) return parent
      const newChildren = [...children]
      newChildren.splice(childIndex + 1, 0, newComponent)
      return { ...parent, children: newChildren }
    })

    onComponentsChange(newComponents)
    onSelect(newComponent.id)
  }, [components, onComponentsChange, onSelect])

  const handleQuickAddSelect = useCallback((item: { id: string; name: string }) => {
    const newComponent: CanvasComponent = {
      id: `${item.id}-${Date.now()}`,
      type: item.id,
      name: item.name,
      props: {},
      styles: {},
    }
    onComponentsChange([...components, newComponent])
    onSelect(newComponent.id)
    setShowQuickAdd(false)
  }, [components, onComponentsChange, onSelect])

  const openQuickAdd = useCallback((e?: React.MouseEvent) => {
    if (e) {
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setQuickAddPosition({ x: rect.left + rect.width / 2, y: rect.bottom + 10 })
    } else {
      setQuickAddPosition(undefined)
    }
    setShowQuickAdd(true)
  }, [])

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

  const toggleLock = useCallback((id: string) => {
    // Check if root component
    if (components.some(c => c.id === id)) {
      const newComponents = components.map(c =>
        c.id === id ? { ...c, locked: !c.locked } : c
      )
      onComponentsChange(newComponents)
    } else {
      // Nested component
      const newComponents = updateComponentInTree(components, id, c => ({ ...c, locked: !c.locked }))
      onComponentsChange(newComponents)
    }
  }, [components, onComponentsChange])

  const toggleHide = useCallback((id: string) => {
    // Check if root component
    if (components.some(c => c.id === id)) {
      const newComponents = components.map(c =>
        c.id === id ? { ...c, hidden: !c.hidden } : c
      )
      onComponentsChange(newComponents)
    } else {
      // Nested component
      const newComponents = updateComponentInTree(components, id, c => ({ ...c, hidden: !c.hidden }))
      onComponentsChange(newComponents)
    }
  }, [components, onComponentsChange])

  const handleContextMenu = useCallback((e: React.MouseEvent, componentId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, componentId })
    onSelect(componentId)
  }, [onSelect])

  const handleContextMenuAction = useCallback((action: string) => {
    if (!contextMenu) return
    const { componentId } = contextMenu

    switch (action) {
      case 'cut':
        handleCopy()
        deleteComponent(componentId)
        break
      case 'copy':
        handleCopy()
        break
      case 'paste':
        handlePaste()
        break
      case 'duplicate':
        duplicateComponent(componentId)
        break
      case 'move-up':
        moveComponent(componentId, 'up')
        break
      case 'move-down':
        moveComponent(componentId, 'down')
        break
      case 'bring-front':
        const comp = components.find(c => c.id === componentId)
        if (comp) {
          onComponentsChange([...components.filter(c => c.id !== componentId), comp])
        }
        break
      case 'send-back':
        const comp2 = components.find(c => c.id === componentId)
        if (comp2) {
          onComponentsChange([comp2, ...components.filter(c => c.id !== componentId)])
        }
        break
      case 'pin-sidebar':
        // Toggle sidebar role - remove from other components first
        const updatedComps = components.map(c => {
          if (c.id === componentId) {
            return { ...c, layoutRole: c.layoutRole === 'sidebar' ? undefined : 'sidebar' as const }
          }
          // Remove sidebar role from other components (only one sidebar at a time)
          if (c.layoutRole === 'sidebar') {
            return { ...c, layoutRole: undefined }
          }
          return c
        })
        onComponentsChange(updatedComps)
        break
      case 'lock':
        toggleLock(componentId)
        break
      case 'hide':
        toggleHide(componentId)
        break
      case 'delete':
        deleteComponent(componentId)
        break
    }

    setContextMenu(null)
  }, [contextMenu, components, onComponentsChange, handleCopy, handlePaste, deleteComponent, duplicateComponent, moveComponent, toggleLock, toggleHide])

  // Handle drop into a container slot
  const handleSlotDrop = useCallback((e: React.DragEvent, parentId: string, slotIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverSlot(null)
    setIsDraggingOver(false)

    let data = e.dataTransfer.getData('text/plain')
    if (!data) data = e.dataTransfer.getData('application/json')
    if (!data) data = e.dataTransfer.getData('component')
    if (!data) return

    try {
      const item = JSON.parse(data) as { id: string; name: string }
      const newComponent: CanvasComponent = {
        id: `${item.id}-${Date.now()}`,
        type: item.id,
        name: item.name,
        props: { slotIndex },
        parentId: parentId,
      }
      const newComponents = addToParentSlot(components, parentId, slotIndex, newComponent)
      onComponentsChange(newComponents)
      onSelect(newComponent.id)
    } catch (error) {
      console.error('Slot drop failed:', error)
    }
  }, [components, onComponentsChange, onSelect])

  const handleSlotDragOver = useCallback((e: React.DragEvent, parentId: string, slotIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setDragOverSlot({ parentId, slotIndex })
  }, [])

  const handleSlotDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverSlot(null)
  }, [])

  // Render a nested child component
  const renderNestedComponent = (child: CanvasComponent) => {
    const Preview = componentPreviews[child.type] || componentPreviews['default']
    const isSelected = selectedId === child.id

    // Create content change handler for nested component
    const onNestedContentChange = (key: string, value: any) => {
      handleContentChange(child.id, key, value)
    }

    return (
      <motion.div
        key={child.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`relative group/nested cursor-pointer transition-all ${
          isSelected
            ? 'ring-2 ring-indigo-500 ring-offset-2 z-10'
            : 'hover:ring-2 hover:ring-indigo-300'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(child.id)
        }}
      >
        {/* Nested component toolbar */}
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-gray-900 rounded-lg shadow-xl z-30"
          >
            <span className="text-white text-xs px-1 truncate max-w-[80px]">{child.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); duplicateComponent(child.id) }}
              className="p-1 text-gray-400 hover:text-white rounded"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteComponent(child.id) }}
              className="p-1 text-gray-400 hover:text-red-400 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </motion.div>
        )}
        <div style={stylesToCSS(child.styles)}>
          <Preview name={child.name} content={child.content} onContentChange={onNestedContentChange} {...child.props} />
        </div>
      </motion.div>
    )
  }

  // Handle smart add selection
  const handleSmartAdd = useCallback((parentId: string, slotIndex: number, item: { id: string; name: string }) => {
    const newComponent: CanvasComponent = {
      id: `${item.id}-${Date.now()}`,
      type: item.id,
      name: item.name,
      props: { slotIndex },
      parentId: parentId,
    }
    const newComponents = addToParentSlot(components, parentId, slotIndex, newComponent)
    onComponentsChange(newComponents)
    onSelect(newComponent.id)
  }, [components, onComponentsChange, onSelect])

  // Render a droppable slot for container components
  const renderDroppableSlot = (parentId: string, slotIndex: number, slotChildren: CanvasComponent[], label: string, parentType: string, className?: string, allSlotsChildren?: CanvasComponent[][]) => {
    const isOver = dragOverSlot?.parentId === parentId && dragOverSlot?.slotIndex === slotIndex
    const hasChildren = slotChildren.length > 0

    // Get existing children types for AI context
    const existingChildTypes = slotChildren.map(c => c.type)
    // Get sibling components (in other slots) for AI context
    const siblingTypes = allSlotsChildren
      ? allSlotsChildren.filter((_, i) => i !== slotIndex).flat().map(c => c.type)
      : []
    // Get page-level components for AI context
    const pageComponentTypes = components.map(c => c.type)

    return (
      <div
        key={slotIndex}
        className={`${className || ''} min-h-[100px] transition-all duration-200 ${
          isOver
            ? 'bg-indigo-100 border-2 border-dashed border-indigo-500 ring-2 ring-indigo-300'
            : hasChildren
              ? 'bg-white'
              : 'bg-white/50 border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
        } rounded-lg`}
        onDragOver={(e) => handleSlotDragOver(e, parentId, slotIndex)}
        onDragLeave={handleSlotDragLeave}
        onDrop={(e) => handleSlotDrop(e, parentId, slotIndex)}
      >
        {hasChildren ? (
          <div className="p-2 space-y-2">
            {slotChildren.map(child => renderNestedComponent(child))}
          </div>
        ) : (
          <div className="h-full min-h-[100px] flex flex-col items-center justify-center text-gray-400 p-4 gap-2">
            {isOver ? (
              <span className="text-indigo-600 text-sm font-medium flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Drop here
              </span>
            ) : (
              <>
                <SmartAddDropdown
                  parentType={parentType}
                  existingChildren={existingChildTypes}
                  siblingComponents={siblingTypes}
                  pageComponents={pageComponentTypes}
                  onSelect={(item) => handleSmartAdd(parentId, slotIndex, item)}
                />
                <span className="text-xs text-gray-400">{label}</span>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // Handle inline content change
  const handleContentChange = useCallback((componentId: string, key: string, value: any) => {
    const updateComponent = (comps: CanvasComponent[]): CanvasComponent[] => {
      return comps.map(c => {
        if (c.id === componentId) {
          return {
            ...c,
            content: { ...c.content, [key]: value }
          }
        }
        if (c.children) {
          return { ...c, children: updateComponent(c.children) }
        }
        return c
      })
    }
    onComponentsChange(updateComponent(components))
  }, [components, onComponentsChange])

  // Render preview with container support
  const renderPreview = (component: CanvasComponent) => {
    const isContainer = containerTypes.includes(component.type)

    // Create content change handler for this component
    const onContentChange = (key: string, value: any) => {
      handleContentChange(component.id, key, value)
    }

    if (isContainer) {
      const numSlots = containerSlots[component.type] || 1
      const children = component.children || []

      // Group children by slot index
      const childrenBySlot: Record<number, CanvasComponent[]> = {}
      for (let i = 0; i < numSlots; i++) {
        childrenBySlot[i] = []
      }
      children.forEach(child => {
        const slot = child.props?.slotIndex ?? 0
        if (childrenBySlot[slot]) {
          childrenBySlot[slot].push(child)
        }
      })

      // Get all slots as array for AI context
      const allSlots = Object.values(childrenBySlot)

      // Render container with droppable slots
      switch (component.type) {
        case 'grid-2col':
          return (
            <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50">
              {renderDroppableSlot(component.id, 0, childrenBySlot[0], 'Column 1', 'grid-2col', undefined, allSlots)}
              {renderDroppableSlot(component.id, 1, childrenBySlot[1], 'Column 2', 'grid-2col', undefined, allSlots)}
            </div>
          )
        case 'grid-3col':
          return (
            <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50">
              {renderDroppableSlot(component.id, 0, childrenBySlot[0], 'Column 1', 'grid-3col', undefined, allSlots)}
              {renderDroppableSlot(component.id, 1, childrenBySlot[1], 'Column 2', 'grid-3col', undefined, allSlots)}
              {renderDroppableSlot(component.id, 2, childrenBySlot[2], 'Column 3', 'grid-3col', undefined, allSlots)}
            </div>
          )
        case 'grid-4col':
          return (
            <div className="grid grid-cols-4 gap-6 p-6 bg-gray-50">
              {[0, 1, 2, 3].map(i => renderDroppableSlot(component.id, i, childrenBySlot[i], `Col ${i + 1}`, 'grid-4col', undefined, allSlots))}
            </div>
          )
        case 'grid-sidebar':
          return (
            <div className="grid grid-cols-4 gap-6 p-6 bg-gray-50">
              {renderDroppableSlot(component.id, 0, childrenBySlot[0], 'Sidebar', 'grid-sidebar', undefined, allSlots)}
              {renderDroppableSlot(component.id, 1, childrenBySlot[1], 'Main Content', 'grid-sidebar', 'col-span-3', allSlots)}
            </div>
          )
        case 'section':
        case 'container':
          return (
            <div className={`p-6 ${component.type === 'section' ? 'py-16 px-8' : ''} bg-gray-50`}>
              {renderDroppableSlot(component.id, 0, childrenBySlot[0], 'Drop content here', component.type, 'min-h-[150px]', allSlots)}
            </div>
          )
        case 'flexbox':
        case 'flex-row':
          return (
            <div className="flex gap-4 p-6 bg-gray-50">
              {[0, 1, 2].map(i => renderDroppableSlot(component.id, i, childrenBySlot[i] || [], `Flex ${i + 1}`, 'flexbox', 'flex-1', allSlots))}
            </div>
          )
        case 'flex-col':
          return (
            <div className="flex flex-col gap-4 p-6 bg-gray-50">
              {renderDroppableSlot(component.id, 0, childrenBySlot[0], 'Drop content here', 'flex-col', 'min-h-[150px]', allSlots)}
            </div>
          )
        default:
          break
      }
    }

    // Non-container components use the static preview
    const Preview = componentPreviews[component.type] || componentPreviews['default']
    return <Preview name={component.name} content={component.content} onContentChange={onContentChange} {...component.props} />
  }

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
    if (dragOverIndex === null || dragOverIndex === components.length) {
      handleDropAtEnd(e)
    }
  }, [dragOverIndex, components.length, handleDropAtEnd])

  const handleComponentDragStart = useCallback((e: React.DragEvent, componentId: string) => {
    const component = findComponentById(components, componentId)
    if (component?.locked) {
      e.preventDefault()
      return
    }
    setIsDraggingComponent(componentId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: component?.type, name: component?.name }))
  }, [components])

  return (
    <div
      ref={canvasRef}
      className={`h-full overflow-auto transition-colors ${
        isDraggingOver ? 'bg-indigo-50/50' : 'bg-gray-100'
      }`}
      onDragEnter={handleCanvasDragEnter}
      onDragLeave={handleCanvasDragLeave}
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
      onClick={() => onSelect(null)}
    >
      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onAction={handleContextMenuAction}
          />
        )}
      </AnimatePresence>

      {/* Canvas wrapper with device preview */}
      <div
        className="mx-auto min-h-full transition-all duration-300"
        style={{
          maxWidth: deviceWidths[device],
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center'
        }}
      >
        {components.length === 0 ? (
          <div
            className={`h-full min-h-[600px] flex items-center justify-center transition-all ${
              dragOverIndex === 0 ? 'bg-indigo-50 ring-4 ring-inset ring-indigo-500 ring-offset-4' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, 0)}
            onDragLeave={handleDragLeave}
            onDrop={handleDropAtEnd}
          >
            <div className="text-center">
              <motion.button
                onClick={openQuickAdd}
                className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white shadow-xl flex items-center justify-center cursor-pointer hover:shadow-2xl hover:scale-105 transition-all group"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-12 h-12 text-indigo-500 group-hover:text-indigo-600" />
              </motion.button>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building</h3>
              <p className="text-gray-500 mb-4">Click the + button or drag components from the library</p>
              <button
                onClick={openQuickAdd}
                className="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
              >
                Quick Add Component →
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white min-h-full shadow-2xl flex flex-col">
            {/* Layout Mode: Header → Sidebar+Main → Footer */}
            {hasLayoutMode ? (
              <>
                {/* Header Section */}
                {headerComponents.map((component) => (
                  <div
                    key={component.id}
                    className={`relative group cursor-pointer transition-all ${
                      selectedId === component.id
                        ? 'ring-2 ring-indigo-500 ring-offset-2 z-10'
                        : 'hover:ring-2 hover:ring-indigo-300'
                    }`}
                    onClick={(e) => { e.stopPropagation(); onSelect(component.id) }}
                    onContextMenu={(e) => handleContextMenu(e, component.id)}
                  >
                    {selectedId === component.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 bg-gray-900 rounded-xl shadow-2xl z-20"
                      >
                        <span className="text-white text-xs px-2">{component.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); duplicateComponent(component.id) }} className="p-1 text-gray-400 hover:text-white rounded"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteComponent(component.id) }} className="p-1 text-gray-400 hover:text-red-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                      </motion.div>
                    )}
                    <AnimatedComponent component={component} isSelected={selectedId === component.id}>
                      <div style={stylesToCSS(component.styles)}>{renderPreview(component)}</div>
                    </AnimatedComponent>
                  </div>
                ))}

                {/* Middle Section: Sidebar + Main Content */}
                <div className="flex flex-1 min-h-0">
                  {/* Sidebar */}
                  {sidebarComponent && (
                    <div
                      className={`flex-shrink-0 h-full relative group cursor-pointer transition-all ${
                        selectedId === sidebarComponent.id
                          ? 'ring-2 ring-indigo-500 ring-offset-2 z-10'
                          : 'hover:ring-2 hover:ring-indigo-300'
                      }`}
                      onClick={(e) => { e.stopPropagation(); onSelect(sidebarComponent.id) }}
                      onContextMenu={(e) => handleContextMenu(e, sidebarComponent.id)}
                    >
                      {selectedId === sidebarComponent.id && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute -left-12 top-4 flex flex-col gap-1 p-2 bg-gray-900 rounded-xl shadow-2xl z-20"
                        >
                          <button onClick={(e) => { e.stopPropagation(); deleteComponent(sidebarComponent.id) }} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); duplicateComponent(sidebarComponent.id) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition" title="Duplicate"><Copy className="w-4 h-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); const updated = components.map(c => c.id === sidebarComponent.id ? { ...c, layoutRole: undefined } : c); onComponentsChange(updated) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition" title="Unpin"><Maximize2 className="w-4 h-4" /></button>
                        </motion.div>
                      )}
                      <div className="h-full" style={stylesToCSS(sidebarComponent.styles)}>
                        <AnimatedComponent component={sidebarComponent} isSelected={selectedId === sidebarComponent.id}>
                          {renderPreview(sidebarComponent)}
                        </AnimatedComponent>
                      </div>
                    </div>
                  )}

                  {/* Main Content Area */}
                  <div className="flex-1 overflow-auto">
                    {mainComponents.length === 0 ? (
                      <div
                        className="min-h-[400px] flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 m-4 rounded-lg"
                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(0) }}
                        onDrop={handleDropAtEnd}
                      >
                        <div className="text-center">
                          <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Drop main content here</p>
                        </div>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {mainComponents.map((component, index) => (
                          <div key={component.id}>
                            {!component.hidden && (
                              <motion.div
                                layout
                                layoutId={component.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                draggable={!component.locked}
                                onDragStart={(e: any) => handleComponentDragStart(e, component.id)}
                                onDragEnd={() => setIsDraggingComponent(null)}
                                className={`relative group cursor-pointer transition-all ${isDraggingComponent === component.id ? 'opacity-50' : ''} ${selectedId === component.id ? 'ring-2 ring-indigo-500 ring-offset-4 z-10' : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-2'}`}
                                onClick={(e) => { e.stopPropagation(); onSelect(component.id) }}
                                onContextMenu={(e) => handleContextMenu(e, component.id)}
                              >
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: selectedId === component.id ? 1 : 0 }} className={`absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 bg-gray-900 rounded-xl shadow-2xl z-20 ${selectedId === component.id ? '' : 'group-hover:opacity-100'}`}>
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  <span className="text-white text-xs px-2">{component.name}</span>
                                  <button onClick={(e) => { e.stopPropagation(); moveComponent(component.id, 'up') }} className="p-1 text-gray-400 hover:text-white rounded"><ArrowUp className="w-3.5 h-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); moveComponent(component.id, 'down') }} className="p-1 text-gray-400 hover:text-white rounded"><ArrowDown className="w-3.5 h-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); duplicateComponent(component.id) }} className="p-1 text-gray-400 hover:text-white rounded"><Copy className="w-3.5 h-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); deleteComponent(component.id) }} className="p-1 text-gray-400 hover:text-red-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                </motion.div>
                                <AnimatedComponent component={component} isSelected={selectedId === component.id}>
                                  <div style={stylesToCSS(component.styles)}>{renderPreview(component)}</div>
                                </AnimatedComponent>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>

                {/* Footer Section */}
                {footerComponents.map((component) => (
                  <div
                    key={component.id}
                    className={`relative group cursor-pointer transition-all ${
                      selectedId === component.id
                        ? 'ring-2 ring-indigo-500 ring-offset-2 z-10'
                        : 'hover:ring-2 hover:ring-indigo-300'
                    }`}
                    onClick={(e) => { e.stopPropagation(); onSelect(component.id) }}
                    onContextMenu={(e) => handleContextMenu(e, component.id)}
                  >
                    {selectedId === component.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 bg-gray-900 rounded-xl shadow-2xl z-20"
                      >
                        <span className="text-white text-xs px-2">{component.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); duplicateComponent(component.id) }} className="p-1 text-gray-400 hover:text-white rounded"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteComponent(component.id) }} className="p-1 text-gray-400 hover:text-red-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                      </motion.div>
                    )}
                    <AnimatedComponent component={component} isSelected={selectedId === component.id}>
                      <div style={stylesToCSS(component.styles)}>{renderPreview(component)}</div>
                    </AnimatedComponent>
                  </div>
                ))}
              </>
            ) : (
              <>
              <AnimatePresence mode="popLayout">
                {components.map((component, index) => (
                <div key={component.id}>
                  {/* Drop zone before component */}
                  <motion.div
                    layout
                    className={`transition-all duration-200 ${
                      isDraggingOver
                        ? dragOverIndex === index
                          ? 'h-24 bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-dashed border-indigo-500 flex items-center justify-center rounded-lg mx-4 my-2'
                          : 'h-3'
                        : 'h-0'
                    }`}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {isDraggingOver && dragOverIndex === index && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-indigo-600 text-sm font-medium flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Drop here to insert
                      </motion.span>
                    )}
                  </motion.div>

                  {/* Component */}
                  {!component.hidden && (
                    <motion.div
                      layout
                      layoutId={component.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      draggable={!component.locked}
                      onDragStart={(e: any) => handleComponentDragStart(e, component.id)}
                      onDragEnd={() => setIsDraggingComponent(null)}
                      className={`relative group cursor-pointer transition-all ${
                        isDraggingComponent === component.id ? 'opacity-50' : ''
                      } ${
                        selectedId === component.id
                          ? 'ring-2 ring-indigo-500 ring-offset-4 z-10'
                          : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-2'
                      } ${
                        component.locked ? 'cursor-not-allowed' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(component.id)
                      }}
                      onContextMenu={(e) => handleContextMenu(e, component.id)}
                    >
                      {/* Component toolbar */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: selectedId === component.id ? 1 : 0 }}
                        className={`absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-2 bg-gray-900 rounded-xl shadow-2xl z-20 ${
                          selectedId === component.id ? '' : 'group-hover:opacity-100'
                        }`}
                      >
                        {/* Drag handle */}
                        <div
                          className={`p-1.5 rounded cursor-grab active:cursor-grabbing ${
                            component.locked ? 'text-gray-600' : 'text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <div className="w-px h-6 bg-gray-700" />

                        <span className="text-white text-xs font-medium px-2 whitespace-nowrap max-w-[120px] truncate">
                          {component.name}
                        </span>

                        <div className="w-px h-6 bg-gray-700" />

                        {/* Quick actions */}
                        <button
                          onClick={(e) => { e.stopPropagation(); moveComponent(component.id, 'up') }}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"
                          title="Move up (↑)"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveComponent(component.id, 'down') }}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"
                          title="Move down (↓)"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        <div className="w-px h-6 bg-gray-700" />

                        {/* Alignment */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setAlignment(component.id, 'left') }}
                          className={`p-1.5 rounded transition ${component.alignment === 'left' ? 'text-indigo-400 bg-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setAlignment(component.id, 'center') }}
                          className={`p-1.5 rounded transition ${!component.alignment || component.alignment === 'center' ? 'text-indigo-400 bg-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setAlignment(component.id, 'right') }}
                          className={`p-1.5 rounded transition ${component.alignment === 'right' ? 'text-indigo-400 bg-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>

                        <div className="w-px h-6 bg-gray-700" />

                        {/* Lock */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleLock(component.id) }}
                          className={`p-1.5 rounded transition ${component.locked ? 'text-amber-400 bg-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                          title={component.locked ? 'Unlock (⌘L)' : 'Lock (⌘L)'}
                        >
                          {component.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateComponent(component.id) }}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"
                          title="Duplicate (⌘D)"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteComponent(component.id) }}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                          title="Delete (⌫)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* More options */}
                        <button
                          onClick={(e) => handleContextMenu(e, component.id)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"
                          title="More options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </motion.div>

                      {/* Locked indicator */}
                      {component.locked && (
                        <div className="absolute top-2 right-2 z-10 p-1.5 bg-amber-500 rounded-lg shadow-lg">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      )}

                      {/* Component preview with styles and animations */}
                      <AnimatedComponent
                        component={component}
                        isSelected={selectedId === component.id}
                      >
                        <div
                          className={`relative ${
                            component.alignment === 'left' ? 'flex justify-start' :
                            component.alignment === 'right' ? 'flex justify-end' :
                            ''
                          }`}
                          style={stylesToCSS(component.styles)}
                        >
                          <div className={
                            component.alignment === 'left' || component.alignment === 'right'
                              ? 'w-3/4'
                              : 'w-full'
                          }>
                            {renderPreview(component)}
                          </div>
                        </div>
                      </AnimatedComponent>
                    </motion.div>
                  )}

                  {/* Hidden indicator */}
                  {component.hidden && (
                    <motion.div
                      layout
                      className="mx-4 my-2 p-3 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-between text-gray-400"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <EyeOff className="w-4 h-4" />
                        {component.name} (hidden)
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleHide(component.id) }}
                        className="text-xs text-indigo-500 hover:text-indigo-600"
                      >
                        Show
                      </button>
                    </motion.div>
                  )}
                </div>
              ))}
            </AnimatePresence>

            {/* Drop zone at end */}
            <motion.div
              layout
              className={`transition-all duration-200 ${
                isDraggingOver
                  ? dragOverIndex === components.length
                    ? 'h-32 bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-dashed border-indigo-500 flex items-center justify-center rounded-lg mx-4 my-4'
                    : 'h-16'
                  : 'h-8'
              }`}
              onDragOver={(e) => handleDragOver(e, components.length)}
              onDragLeave={handleDragLeave}
              onDrop={handleDropAtEnd}
            >
              {isDraggingOver && dragOverIndex === components.length && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-indigo-600 text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Drop to add at end
                </motion.span>
              )}
            </motion.div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Menu */}
      <AnimatePresence>
        {showQuickAdd && (
          <QuickAddMenu
            isOpen={showQuickAdd}
            onClose={() => setShowQuickAdd(false)}
            onSelect={handleQuickAddSelect}
            existingComponents={components.map(c => c.type)}
            position={quickAddPosition}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export { componentPreviews }
export type { CanvasComponent }
