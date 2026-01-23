'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Type, Palette, Box, Layout, Sparkles, Move, RotateCcw,
  ChevronDown, ChevronRight, Lock, Unlock, Eye, EyeOff,
  Copy, Trash2, Layers, Zap, MousePointer, Scroll,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Grid, Maximize2, Minimize2,
  CornerUpLeft, Sun, Moon, Monitor, Tablet, Smartphone,
  Play, Square, RefreshCw, Wand2, Blend, SlidersHorizontal,
  Crosshair, MousePointer2, Focus, Contrast, CircleDot,
  FileText, Link, Image, Plus, GripVertical
} from 'lucide-react'

// Component types that support buttons
const componentsWithButtons = [
  'hero-centered', 'hero-split', 'hero-video', 'section-cta',
  'card-basic', 'card-image', 'form-contact', 'form-newsletter'
]

// Button style options
const buttonStyles = [
  { id: 'primary', label: 'Primary', className: 'bg-indigo-600 text-white' },
  { id: 'secondary', label: 'Secondary', className: 'bg-white text-indigo-600 border border-indigo-600' },
  { id: 'outline', label: 'Outline', className: 'border border-white/50 text-white' },
  { id: 'ghost', label: 'Ghost', className: 'text-white hover:bg-white/10' },
]

// Content field definitions for each component type
const componentContentFields: Record<string, Array<{
  key: string
  label: string
  type: 'text' | 'textarea' | 'url' | 'image'
  placeholder?: string
}>> = {
  'hero-centered': [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Enter headline...' },
    { key: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter description...' },
  ],
  'hero-split': [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Enter headline...' },
    { key: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter description...' },
    { key: 'imageUrl', label: 'Image URL', type: 'image', placeholder: 'https://...' },
  ],
  'hero-video': [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Enter headline...' },
    { key: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter description...' },
    { key: 'videoUrl', label: 'Video URL', type: 'url', placeholder: 'https://youtube.com/...' },
  ],
  'navbar': [
    { key: 'brand', label: 'Brand Name', type: 'text', placeholder: 'Company' },
    { key: 'links', label: 'Nav Links (comma separated)', type: 'text', placeholder: 'Home, About, Contact' },
  ],
  'navbar-centered': [
    { key: 'brand', label: 'Brand Name', type: 'text', placeholder: 'Company' },
    { key: 'links', label: 'Nav Links (comma separated)', type: 'text', placeholder: 'Home, About, Contact' },
  ],
  'footer': [
    { key: 'brand', label: 'Brand Name', type: 'text', placeholder: 'Company' },
    { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Building the future' },
    { key: 'copyright', label: 'Copyright', type: 'text', placeholder: '© 2024 Company' },
  ],
  'card-basic': [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Card Title' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Card description...' },
  ],
  'card-image': [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Card Title' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Card description...' },
    { key: 'imageUrl', label: 'Image URL', type: 'image', placeholder: 'https://...' },
  ],
  'section-cta': [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Ready to get started?' },
    { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Join thousands today' },
    { key: 'buttonText', label: 'Button Text', type: 'text', placeholder: 'Start Free Trial' },
  ],
  'section-features': [
    { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Features' },
    { key: 'subtitle', label: 'Section Subtitle', type: 'textarea', placeholder: 'Everything you need...' },
  ],
  'section-pricing': [
    { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Pricing' },
    { key: 'subtitle', label: 'Section Subtitle', type: 'text', placeholder: 'Choose your plan' },
  ],
  'section-testimonials': [
    { key: 'title', label: 'Section Title', type: 'text', placeholder: 'What people say' },
  ],
  'section-faq': [
    { key: 'title', label: 'Section Title', type: 'text', placeholder: 'FAQ' },
  ],
  'form-contact': [
    { key: 'title', label: 'Form Title', type: 'text', placeholder: 'Contact Us' },
    { key: 'buttonText', label: 'Submit Button', type: 'text', placeholder: 'Send Message' },
  ],
  'form-newsletter': [
    { key: 'title', label: 'Title', type: 'text', placeholder: 'Subscribe' },
    { key: 'placeholder', label: 'Input Placeholder', type: 'text', placeholder: 'Enter your email' },
    { key: 'buttonText', label: 'Button Text', type: 'text', placeholder: 'Subscribe' },
  ],
  'button': [
    { key: 'text', label: 'Button Text', type: 'text', placeholder: 'Click me' },
    { key: 'link', label: 'Link URL', type: 'url', placeholder: 'https://...' },
  ],
  'text': [
    { key: 'content', label: 'Text Content', type: 'textarea', placeholder: 'Enter text...' },
  ],
  'heading': [
    { key: 'text', label: 'Heading Text', type: 'text', placeholder: 'Heading' },
  ],
  'image': [
    { key: 'src', label: 'Image URL', type: 'image', placeholder: 'https://...' },
    { key: 'alt', label: 'Alt Text', type: 'text', placeholder: 'Image description' },
  ],
  'video': [
    { key: 'src', label: 'Video URL', type: 'url', placeholder: 'https://youtube.com/...' },
  ],
  'stats': [
    { key: 'stat1Label', label: 'Stat 1 Label', type: 'text', placeholder: 'Users' },
    { key: 'stat1Value', label: 'Stat 1 Value', type: 'text', placeholder: '10,000+' },
    { key: 'stat2Label', label: 'Stat 2 Label', type: 'text', placeholder: 'Revenue' },
    { key: 'stat2Value', label: 'Stat 2 Value', type: 'text', placeholder: '$1M+' },
  ],
}
import {
  CanvasComponent,
  ComponentStyles,
  AnimationConfig,
  colorPalettes,
  fontOptions,
  defaultPresets,
  easingOptions
} from '@/types/components'
import DataBindingPanel from './DataBindingPanel'
import CodeInjectionPanel from './CodeInjectionPanel'
import Transform3DPanel from './Transform3DPanel'

interface PropertiesPanelProps {
  component: CanvasComponent | null
  onUpdate: (component: CanvasComponent) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  device: 'desktop' | 'tablet' | 'mobile'
}

// Collapsible section component
function Section({
  title,
  icon: Icon,
  defaultOpen = false,
  children
}: {
  title: string
  icon: any
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition"
      >
        <Icon className="w-4 h-4 text-forma-400" />
        <span className="text-sm font-medium text-white flex-1 text-left">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/40" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Color picker component
function ColorPicker({
  label,
  value,
  onChange
}: {
  label: string
  value?: string
  onChange: (color: string) => void
}) {
  const [showPalette, setShowPalette] = useState(false)

  return (
    <div className="space-y-2">
      <label className="text-xs text-white/60">{label}</label>
      <div className="flex gap-2">
        <div
          className="relative w-10 h-10 rounded-lg border border-white/20 cursor-pointer overflow-hidden"
          style={{ backgroundColor: value || 'transparent' }}
          onClick={() => setShowPalette(!showPalette)}
        >
          {!value && (
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:8px_8px] bg-[position:0_0,4px_4px]" />
          )}
        </div>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-forma-500"
        />
      </div>
      <AnimatePresence>
        {showPalette && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-forma-900 border border-white/10 rounded-lg p-3 space-y-2"
          >
            {Object.entries(colorPalettes).slice(0, 6).map(([name, colors]) => (
              <div key={name} className="flex gap-1">
                {colors.map((color, i) => (
                  <button
                    key={i}
                    className="w-5 h-5 rounded hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onChange(color)
                      setShowPalette(false)
                    }}
                  />
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Slider component
function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = ''
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-xs text-white/60">{label}</label>
        <span className="text-xs text-white/40">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-forma-500"
      />
    </div>
  )
}

// Spacing editor (padding/margin)
function SpacingEditor({
  label,
  value,
  onChange
}: {
  label: string
  value: { top: number; right: number; bottom: number; left: number }
  onChange: (value: { top: number; right: number; bottom: number; left: number }) => void
}) {
  const [linked, setLinked] = useState(true)

  const handleChange = (side: 'top' | 'right' | 'bottom' | 'left', val: number) => {
    if (linked) {
      onChange({ top: val, right: val, bottom: val, left: val })
    } else {
      onChange({ ...value, [side]: val })
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-white/60">{label}</label>
        <button
          onClick={() => setLinked(!linked)}
          className={`p-1 rounded transition ${linked ? 'text-forma-400' : 'text-white/40'}`}
        >
          {linked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <div key={side} className="text-center">
            <input
              type="number"
              value={value[side]}
              onChange={(e) => handleChange(side, Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-xs text-center focus:outline-none focus:border-forma-500"
            />
            <span className="text-[10px] text-white/40 mt-1">{side[0].toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Border radius editor
function BorderRadiusEditor({
  value,
  onChange
}: {
  value: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }
  onChange: (value: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }) => void
}) {
  const [linked, setLinked] = useState(true)

  const handleChange = (corner: keyof typeof value, val: number) => {
    if (linked) {
      onChange({ topLeft: val, topRight: val, bottomRight: val, bottomLeft: val })
    } else {
      onChange({ ...value, [corner]: val })
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-white/60">Border Radius</label>
        <button
          onClick={() => setLinked(!linked)}
          className={`p-1 rounded transition ${linked ? 'text-forma-400' : 'text-white/40'}`}
        >
          {linked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1">
          <CornerUpLeft className="w-3 h-3 text-white/40" />
          <input
            type="number"
            value={value.topLeft}
            onChange={(e) => handleChange('topLeft', Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-forma-500"
          />
        </div>
        <div className="flex items-center gap-1">
          <CornerUpLeft className="w-3 h-3 text-white/40 rotate-90" />
          <input
            type="number"
            value={value.topRight}
            onChange={(e) => handleChange('topRight', Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-forma-500"
          />
        </div>
        <div className="flex items-center gap-1">
          <CornerUpLeft className="w-3 h-3 text-white/40 -rotate-90" />
          <input
            type="number"
            value={value.bottomLeft}
            onChange={(e) => handleChange('bottomLeft', Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-forma-500"
          />
        </div>
        <div className="flex items-center gap-1">
          <CornerUpLeft className="w-3 h-3 text-white/40 rotate-180" />
          <input
            type="number"
            value={value.bottomRight}
            onChange={(e) => handleChange('bottomRight', Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-forma-500"
          />
        </div>
      </div>
    </div>
  )
}

// Select dropdown
function Select({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-white/60">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-forma-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-forma-500 appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-forma-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// Button group
function ButtonGroup({
  options,
  value,
  onChange
}: {
  options: { value: string; icon: any; label?: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex bg-white/5 rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs transition ${
            value === opt.value ? 'bg-forma-500 text-white' : 'text-white/60 hover:text-white'
          }`}
          title={opt.label}
        >
          <opt.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}

export default function PropertiesPanel({
  component,
  onUpdate,
  onDelete,
  onDuplicate,
  device
}: PropertiesPanelProps) {
  const updateStyles = useCallback((updates: Partial<ComponentStyles>) => {
    if (!component) return
    console.log('updateStyles called with:', updates)
    console.log('Current component:', component)
    const updated = {
      ...component,
      styles: { ...component.styles, ...updates }
    }
    console.log('Calling onUpdate with:', updated)
    onUpdate(updated)
  }, [component, onUpdate])

  const updateAnimation = useCallback((updates: Partial<AnimationConfig>) => {
    if (!component) return
    onUpdate({
      ...component,
      animation: { ...component.animation, ...updates }
    })
  }, [component, onUpdate])

  const updateContent = useCallback((key: string, value: string) => {
    if (!component) return
    console.log('updateContent called:', key, value)
    onUpdate({
      ...component,
      content: { ...component.content, [key]: value }
    })
  }, [component, onUpdate])

  // Get buttons array from content (with defaults)
  const getButtons = useCallback((): Array<{ id: string; text: string; link: string; style: string }> => {
    const buttons = (component?.content as any)?.buttons
    if (!buttons || !Array.isArray(buttons)) {
      // Return default buttons based on component type
      if (component?.type === 'hero-centered') {
        return [
          { id: '1', text: 'Get Started', link: '', style: 'primary' },
          { id: '2', text: 'Learn More', link: '', style: 'outline' },
        ]
      }
      if (component?.type === 'hero-split' || component?.type === 'section-cta') {
        return [{ id: '1', text: 'Get Started', link: '', style: 'primary' }]
      }
      return []
    }
    return buttons
  }, [component])

  const updateButtons = useCallback((buttons: Array<{ id: string; text: string; link: string; style: string }>) => {
    if (!component) return
    onUpdate({
      ...component,
      content: { ...component.content, buttons } as any
    })
  }, [component, onUpdate])

  const addButton = useCallback(() => {
    const buttons = getButtons()
    const newButton = {
      id: Date.now().toString(),
      text: 'New Button',
      link: '',
      style: 'primary'
    }
    updateButtons([...buttons, newButton])
  }, [getButtons, updateButtons])

  const removeButton = useCallback((id: string) => {
    const buttons = getButtons()
    updateButtons(buttons.filter(b => b.id !== id))
  }, [getButtons, updateButtons])

  const updateButton = useCallback((id: string, field: string, value: string) => {
    const buttons = getButtons()
    updateButtons(buttons.map(b => b.id === id ? { ...b, [field]: value } : b))
  }, [getButtons, updateButtons])

  if (!component) {
    return (
      <div className="h-full flex items-center justify-center text-white/40 text-sm p-6 text-center">
        <div>
          <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    )
  }

  const styles = component.styles || {}
  const animation = component.animation || {}

  return (
    <div className="h-full overflow-auto">
      {/* Component header */}
      <div className="sticky top-0 bg-forma-950 border-b border-white/10 p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white font-medium">{component.name}</h3>
            <p className="text-xs text-white/40">{component.type}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDuplicate(component.id)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(component.id)}
              className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Device responsive toggle */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
          {[
            { value: 'desktop', icon: Monitor },
            { value: 'tablet', icon: Tablet },
            { value: 'mobile', icon: Smartphone }
          ].map((d) => (
            <div
              key={d.value}
              className={`flex-1 flex items-center justify-center py-1.5 rounded text-xs ${
                device === d.value ? 'bg-forma-500 text-white' : 'text-white/40'
              }`}
            >
              <d.icon className="w-4 h-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="p-4 border-b border-white/10 grid grid-cols-4 gap-2">
        <button
          onClick={() => onUpdate({ ...component, locked: !component.locked })}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
            component.locked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          {component.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span className="text-[10px]">Lock</span>
        </button>
        <button
          onClick={() => onUpdate({ ...component, hidden: !component.hidden })}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
            component.hidden ? 'bg-white/5 text-white/40' : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          {component.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="text-[10px]">Visible</span>
        </button>
        <button
          onClick={() => onUpdate({ ...component, styles: {} })}
          className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 text-white/60 hover:text-white transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-[10px]">Reset</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 text-white/60 hover:text-white transition">
          <Wand2 className="w-4 h-4" />
          <span className="text-[10px]">AI Edit</span>
        </button>
      </div>

      {/* Content Editing - Show first for easy access */}
      {(componentContentFields[component.type] || componentsWithButtons.includes(component.type)) && (
        <Section title="Content" icon={FileText}>
          <div className="space-y-4">
            {/* Text fields */}
            {componentContentFields[component.type]?.map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-xs text-white/60 flex items-center gap-1">
                  {field.type === 'url' && <Link className="w-3 h-3" />}
                  {field.type === 'image' && <Image className="w-3 h-3" />}
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={(component.content?.[field.key] as string) || ''}
                    onChange={(e) => updateContent(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-forma-500 resize-none"
                  />
                ) : (
                  <input
                    type={field.type === 'url' || field.type === 'image' ? 'url' : 'text'}
                    value={(component.content?.[field.key] as string) || ''}
                    onChange={(e) => updateContent(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-forma-500"
                  />
                )}
              </div>
            ))}

            {/* Buttons subsection */}
            {componentsWithButtons.includes(component.type) && (
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-white/60 font-medium">Buttons</label>
                  <button
                    onClick={addButton}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-forma-500/20 text-forma-400 rounded hover:bg-forma-500/30 transition"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {getButtons().map((btn, index) => (
                    <div key={btn.id} className="bg-white/5 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3 h-3 text-white/30" />
                          <span className="text-xs text-white/60">Button {index + 1}</span>
                        </div>
                        <button
                          onClick={() => removeButton(btn.id)}
                          className="p-1 text-white/40 hover:text-red-400 transition"
                          title="Remove button"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={btn.text}
                        onChange={(e) => updateButton(btn.id, 'text', e.target.value)}
                        placeholder="Button text"
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-xs placeholder-white/30 focus:outline-none focus:border-forma-500"
                      />
                      <input
                        type="url"
                        value={btn.link}
                        onChange={(e) => updateButton(btn.id, 'link', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-xs placeholder-white/30 focus:outline-none focus:border-forma-500"
                      />
                      <div className="flex gap-1">
                        {buttonStyles.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => updateButton(btn.id, 'style', style.id)}
                            className={`flex-1 py-1 text-[10px] rounded transition ${
                              btn.style === style.id
                                ? 'bg-forma-500 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                            title={style.label}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {getButtons().length === 0 && (
                    <p className="text-xs text-white/30 text-center py-2">No buttons yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Style presets */}
      <Section title="Style Presets" icon={Sparkles}>
        <div className="grid grid-cols-2 gap-2">
          {defaultPresets.slice(0, 6).map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                updateStyles(preset.styles)
                if (preset.animation) updateAnimation(preset.animation)
              }}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition group"
            >
              <span className="text-xs text-white group-hover:text-forma-400 transition">{preset.name}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography" icon={Type}>
        <Select
          label="Font Family"
          value={styles.fontFamily || 'Inter'}
          options={fontOptions}
          onChange={(v) => updateStyles({ fontFamily: v })}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-white/60">Size</label>
            <input
              type="text"
              value={styles.fontSize || '16px'}
              onChange={(e) => updateStyles({ fontSize: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-forma-500"
            />
          </div>
          <Select
            label="Weight"
            value={styles.fontWeight || '400'}
            options={[
              { value: '300', label: 'Light' },
              { value: '400', label: 'Regular' },
              { value: '500', label: 'Medium' },
              { value: '600', label: 'Semibold' },
              { value: '700', label: 'Bold' },
              { value: '800', label: 'Extra Bold' },
            ]}
            onChange={(v) => updateStyles({ fontWeight: v })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-white/60">Line Height</label>
            <input
              type="text"
              value={styles.lineHeight || '1.5'}
              onChange={(e) => updateStyles({ lineHeight: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-forma-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/60">Letter Spacing</label>
            <input
              type="text"
              value={styles.letterSpacing || '0'}
              onChange={(e) => updateStyles({ letterSpacing: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-forma-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/60">Text Align</label>
          <ButtonGroup
            options={[
              { value: 'left', icon: AlignLeft, label: 'Left' },
              { value: 'center', icon: AlignCenter, label: 'Center' },
              { value: 'right', icon: AlignRight, label: 'Right' },
              { value: 'justify', icon: AlignJustify, label: 'Justify' },
            ]}
            value={styles.textAlign || 'left'}
            onChange={(v) => updateStyles({ textAlign: v as ComponentStyles['textAlign'] })}
          />
        </div>

        <ColorPicker
          label="Text Color"
          value={styles.textColor}
          onChange={(v) => updateStyles({ textColor: v })}
        />

        <Select
          label="Text Transform"
          value={styles.textTransform || 'none'}
          options={[
            { value: 'none', label: 'None' },
            { value: 'uppercase', label: 'UPPERCASE' },
            { value: 'lowercase', label: 'lowercase' },
            { value: 'capitalize', label: 'Capitalize' },
          ]}
          onChange={(v) => updateStyles({ textTransform: v as ComponentStyles['textTransform'] })}
        />
      </Section>

      {/* Background */}
      <Section title="Background" icon={Palette}>
        <ColorPicker
          label="Background Color"
          value={styles.backgroundColor}
          onChange={(v) => updateStyles({ backgroundColor: v })}
        />

        <div className="space-y-2">
          <label className="text-xs text-white/60">Gradient</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { colors: ['#667eea', '#764ba2'], label: 'Ocean' },
              { colors: ['#f093fb', '#f5576c'], label: 'Sunset' },
              { colors: ['#4facfe', '#00f2fe'], label: 'Sky' },
              { colors: ['#43e97b', '#38f9d7'], label: 'Mint' },
            ].map((gradient, i) => (
              <button
                key={i}
                onClick={() => updateStyles({
                  backgroundGradient: {
                    type: 'linear',
                    angle: 135,
                    colors: gradient.colors.map((c, i) => ({ color: c, position: i * 100 }))
                  }
                })}
                className="h-10 rounded-lg border border-white/10 hover:border-white/30 transition"
                style={{
                  background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`
                }}
              />
            ))}
          </div>
          <button
            onClick={() => updateStyles({ backgroundGradient: undefined })}
            className="w-full py-2 text-xs text-white/40 hover:text-white transition"
          >
            Clear Gradient
          </button>
        </div>

        <Slider
          label="Opacity"
          value={(styles.opacity ?? 1) * 100}
          onChange={(v) => updateStyles({ opacity: v / 100 })}
          min={0}
          max={100}
          unit="%"
        />
      </Section>

      {/* Spacing */}
      <Section title="Spacing" icon={Box}>
        <SpacingEditor
          label="Padding"
          value={styles.padding || { top: 0, right: 0, bottom: 0, left: 0 }}
          onChange={(v) => updateStyles({ padding: v })}
        />
        <SpacingEditor
          label="Margin"
          value={styles.margin || { top: 0, right: 0, bottom: 0, left: 0 }}
          onChange={(v) => updateStyles({ margin: v })}
        />
      </Section>

      {/* Size */}
      <Section title="Size" icon={Maximize2} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-white/60">Width</label>
            <input
              type="text"
              value={styles.width || 'auto'}
              onChange={(e) => updateStyles({ width: e.target.value })}
              placeholder="auto"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-forma-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/60">Height</label>
            <input
              type="text"
              value={styles.height || 'auto'}
              onChange={(e) => updateStyles({ height: e.target.value })}
              placeholder="auto"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-forma-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-white/60">Max Width</label>
            <input
              type="text"
              value={styles.maxWidth || ''}
              onChange={(e) => updateStyles({ maxWidth: e.target.value })}
              placeholder="none"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-forma-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/60">Min Height</label>
            <input
              type="text"
              value={styles.minHeight || ''}
              onChange={(e) => updateStyles({ minHeight: e.target.value })}
              placeholder="none"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-forma-500"
            />
          </div>
        </div>
      </Section>

      {/* Border */}
      <Section title="Border" icon={Square} defaultOpen={false}>
        <BorderRadiusEditor
          value={styles.borderRadius || { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 }}
          onChange={(v) => updateStyles({ borderRadius: v })}
        />

        <SpacingEditor
          label="Border Width"
          value={styles.borderWidth || { top: 0, right: 0, bottom: 0, left: 0 }}
          onChange={(v) => updateStyles({ borderWidth: v })}
        />

        <ColorPicker
          label="Border Color"
          value={styles.borderColor}
          onChange={(v) => updateStyles({ borderColor: v })}
        />

        <Select
          label="Border Style"
          value={styles.borderStyle || 'solid'}
          options={[
            { value: 'none', label: 'None' },
            { value: 'solid', label: 'Solid' },
            { value: 'dashed', label: 'Dashed' },
            { value: 'dotted', label: 'Dotted' },
          ]}
          onChange={(v) => updateStyles({ borderStyle: v as ComponentStyles['borderStyle'] })}
        />
      </Section>

      {/* Layout */}
      <Section title="Layout" icon={Layout} defaultOpen={false}>
        {/* Layout Role */}
        <div className="space-y-2">
          <label className="text-xs text-white/60">Page Layout Role</label>
          <div className="grid grid-cols-5 gap-1">
            <button
              onClick={() => onUpdate({ ...component, layoutRole: undefined })}
              className={`py-2 px-1 rounded-lg text-[10px] transition ${
                !component.layoutRole
                  ? 'bg-forma-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => onUpdate({ ...component, layoutRole: 'header' })}
              className={`py-2 px-1 rounded-lg text-[10px] transition ${
                component.layoutRole === 'header'
                  ? 'bg-forma-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              Header
            </button>
            <button
              onClick={() => onUpdate({ ...component, layoutRole: 'sidebar' })}
              className={`py-2 px-1 rounded-lg text-[10px] transition ${
                component.layoutRole === 'sidebar'
                  ? 'bg-forma-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              Sidebar
            </button>
            <button
              onClick={() => onUpdate({ ...component, layoutRole: 'main' })}
              className={`py-2 px-1 rounded-lg text-[10px] transition ${
                component.layoutRole === 'main'
                  ? 'bg-forma-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              Main
            </button>
            <button
              onClick={() => onUpdate({ ...component, layoutRole: 'footer' })}
              className={`py-2 px-1 rounded-lg text-[10px] transition ${
                component.layoutRole === 'footer'
                  ? 'bg-forma-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              Footer
            </button>
          </div>
          <p className="text-[10px] text-white/40">
            Header/Footer: full width. Sidebar: left column. Main: beside sidebar.
          </p>
        </div>

        <Select
          label="Display"
          value={styles.display || 'block'}
          options={[
            { value: 'block', label: 'Block' },
            { value: 'flex', label: 'Flex' },
            { value: 'grid', label: 'Grid' },
            { value: 'inline', label: 'Inline' },
            { value: 'inline-block', label: 'Inline Block' },
          ]}
          onChange={(v) => updateStyles({ display: v as ComponentStyles['display'] })}
        />

        {styles.display === 'flex' && (
          <>
            <Select
              label="Direction"
              value={styles.flexDirection || 'row'}
              options={[
                { value: 'row', label: 'Row' },
                { value: 'column', label: 'Column' },
                { value: 'row-reverse', label: 'Row Reverse' },
                { value: 'column-reverse', label: 'Column Reverse' },
              ]}
              onChange={(v) => updateStyles({ flexDirection: v as ComponentStyles['flexDirection'] })}
            />

            <Select
              label="Justify Content"
              value={styles.justifyContent || 'start'}
              options={[
                { value: 'start', label: 'Start' },
                { value: 'center', label: 'Center' },
                { value: 'end', label: 'End' },
                { value: 'between', label: 'Space Between' },
                { value: 'around', label: 'Space Around' },
                { value: 'evenly', label: 'Space Evenly' },
              ]}
              onChange={(v) => updateStyles({ justifyContent: v as ComponentStyles['justifyContent'] })}
            />

            <Select
              label="Align Items"
              value={styles.alignItems || 'stretch'}
              options={[
                { value: 'start', label: 'Start' },
                { value: 'center', label: 'Center' },
                { value: 'end', label: 'End' },
                { value: 'stretch', label: 'Stretch' },
                { value: 'baseline', label: 'Baseline' },
              ]}
              onChange={(v) => updateStyles({ alignItems: v as ComponentStyles['alignItems'] })}
            />

            <Slider
              label="Gap"
              value={styles.gap || 0}
              onChange={(v) => updateStyles({ gap: v })}
              min={0}
              max={64}
              unit="px"
            />
          </>
        )}

        {styles.display === 'grid' && (
          <Slider
            label="Columns"
            value={styles.gridColumns || 2}
            onChange={(v) => updateStyles({ gridColumns: v })}
            min={1}
            max={12}
          />
        )}
      </Section>

      {/* Animations */}
      <Section title="Animations" icon={Zap}>
        {/* Entrance animation */}
        <div className="space-y-3 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-white/60">
            <Play className="w-4 h-4" />
            <span className="text-xs font-medium">Entrance</span>
          </div>

          <Select
            label="Type"
            value={animation.entrance?.type || 'none'}
            options={[
              { value: 'none', label: 'None' },
              { value: 'fade', label: 'Fade' },
              { value: 'slide-up', label: 'Slide Up' },
              { value: 'slide-down', label: 'Slide Down' },
              { value: 'slide-left', label: 'Slide Left' },
              { value: 'slide-right', label: 'Slide Right' },
              { value: 'zoom', label: 'Zoom' },
              { value: 'bounce', label: 'Bounce' },
              { value: 'flip', label: 'Flip' },
              { value: 'rotate', label: 'Rotate' },
            ]}
            onChange={(v) => updateAnimation({
              entrance: {
                ...animation.entrance,
                type: v as any,
                duration: animation.entrance?.duration || 500,
                delay: animation.entrance?.delay || 0,
                easing: animation.entrance?.easing || 'ease-out'
              }
            })}
          />

          {animation.entrance?.type && animation.entrance.type !== 'none' && (
            <>
              <Slider
                label="Duration"
                value={animation.entrance?.duration || 500}
                onChange={(v) => updateAnimation({
                  entrance: { ...animation.entrance!, duration: v }
                })}
                min={100}
                max={2000}
                step={50}
                unit="ms"
              />

              <Slider
                label="Delay"
                value={animation.entrance?.delay || 0}
                onChange={(v) => updateAnimation({
                  entrance: { ...animation.entrance!, delay: v }
                })}
                min={0}
                max={2000}
                step={50}
                unit="ms"
              />

              <Select
                label="Easing"
                value={animation.entrance?.easing || 'ease-out'}
                options={easingOptions}
                onChange={(v) => updateAnimation({
                  entrance: { ...animation.entrance!, easing: v as any }
                })}
              />
            </>
          )}
        </div>

        {/* Hover animation */}
        <div className="space-y-3 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-white/60">
            <MousePointer className="w-4 h-4" />
            <span className="text-xs font-medium">Hover Effects</span>
          </div>

          <Slider
            label="Scale"
            value={(animation.hover?.scale || 1) * 100}
            onChange={(v) => updateAnimation({
              hover: { ...animation.hover, scale: v / 100, duration: animation.hover?.duration || 200 }
            })}
            min={80}
            max={130}
            unit="%"
          />

          <Slider
            label="Move Y"
            value={animation.hover?.translateY || 0}
            onChange={(v) => updateAnimation({
              hover: { ...animation.hover, translateY: v, duration: animation.hover?.duration || 200 }
            })}
            min={-20}
            max={20}
            unit="px"
          />

          <Slider
            label="Rotate"
            value={animation.hover?.rotate || 0}
            onChange={(v) => updateAnimation({
              hover: { ...animation.hover, rotate: v, duration: animation.hover?.duration || 200 }
            })}
            min={-15}
            max={15}
            unit="deg"
          />
        </div>

        {/* Loop animation */}
        <div className="space-y-3 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-white/60">
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs font-medium">Continuous</span>
          </div>

          <Select
            label="Animation"
            value={animation.loop?.type || 'none'}
            options={[
              { value: 'none', label: 'None' },
              { value: 'pulse', label: 'Pulse' },
              { value: 'bounce', label: 'Bounce' },
              { value: 'shake', label: 'Shake' },
              { value: 'swing', label: 'Swing' },
              { value: 'float', label: 'Float' },
              { value: 'spin', label: 'Spin' },
            ]}
            onChange={(v) => updateAnimation({
              loop: { type: v as any, duration: animation.loop?.duration || 1000 }
            })}
          />

          {animation.loop?.type && animation.loop.type !== 'none' && (
            <Slider
              label="Duration"
              value={animation.loop?.duration || 1000}
              onChange={(v) => updateAnimation({
                loop: { ...animation.loop!, duration: v }
              })}
              min={200}
              max={5000}
              step={100}
              unit="ms"
            />
          )}
        </div>

        {/* Scroll animation */}
        <div className="space-y-3 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-white/60">
            <Scroll className="w-4 h-4" />
            <span className="text-xs font-medium">Scroll Effects</span>
          </div>

          <Select
            label="Type"
            value={animation.scroll?.type || 'none'}
            options={[
              { value: 'none', label: 'None' },
              { value: 'fade', label: 'Fade In' },
              { value: 'slide', label: 'Slide In' },
              { value: 'parallax', label: 'Parallax' },
              { value: 'scale', label: 'Scale' },
              { value: 'rotate', label: 'Rotate' },
            ]}
            onChange={(v) => updateAnimation({
              scroll: { type: v as any, trigger: animation.scroll?.trigger || 'center' }
            })}
          />

          {animation.scroll?.type && animation.scroll.type !== 'none' && (
            <Select
              label="Trigger"
              value={animation.scroll?.trigger || 'center'}
              options={[
                { value: 'top', label: 'Top of viewport' },
                { value: 'center', label: 'Center of viewport' },
                { value: 'bottom', label: 'Bottom of viewport' },
              ]}
              onChange={(v) => updateAnimation({
                scroll: { ...animation.scroll!, trigger: v as any }
              })}
            />
          )}
        </div>
      </Section>

      {/* Shadow */}
      <Section title="Shadow" icon={Sun} defaultOpen={false}>
        <div className="space-y-3">
          <label className="text-xs text-white/60">Presets</label>
          <div className="flex gap-2">
            {[
              { label: 'None', shadow: [] },
              { label: 'SM', shadow: [{ x: 0, y: 1, blur: 3, spread: 0, color: 'rgba(0,0,0,0.1)' }] },
              { label: 'MD', shadow: [{ x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)' }] },
              { label: 'LG', shadow: [{ x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)' }] },
              { label: 'XL', shadow: [{ x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0,0,0,0.1)' }] },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => updateStyles({ boxShadow: preset.shadow as any })}
                className="flex-1 py-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition"
              >
                {preset.label}
              </button>
            ))}
          </div>
          {/* Custom shadow controls */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-xs text-white/60">Custom Shadow</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-white/40">X Offset</label>
                <input
                  type="number"
                  value={styles.boxShadow?.[0]?.x ?? 0}
                  onChange={(e) => {
                    const shadow = styles.boxShadow?.[0] || { x: 0, y: 4, blur: 10, spread: 0, color: 'rgba(0,0,0,0.15)' }
                    updateStyles({ boxShadow: [{ ...shadow, x: parseInt(e.target.value) || 0 }] })
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40">Y Offset</label>
                <input
                  type="number"
                  value={styles.boxShadow?.[0]?.y ?? 4}
                  onChange={(e) => {
                    const shadow = styles.boxShadow?.[0] || { x: 0, y: 4, blur: 10, spread: 0, color: 'rgba(0,0,0,0.15)' }
                    updateStyles({ boxShadow: [{ ...shadow, y: parseInt(e.target.value) || 0 }] })
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40">Blur</label>
                <input
                  type="number"
                  min={0}
                  value={styles.boxShadow?.[0]?.blur ?? 10}
                  onChange={(e) => {
                    const shadow = styles.boxShadow?.[0] || { x: 0, y: 4, blur: 10, spread: 0, color: 'rgba(0,0,0,0.15)' }
                    updateStyles({ boxShadow: [{ ...shadow, blur: parseInt(e.target.value) || 0 }] })
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40">Spread</label>
                <input
                  type="number"
                  value={styles.boxShadow?.[0]?.spread ?? 0}
                  onChange={(e) => {
                    const shadow = styles.boxShadow?.[0] || { x: 0, y: 4, blur: 10, spread: 0, color: 'rgba(0,0,0,0.15)' }
                    updateStyles({ boxShadow: [{ ...shadow, spread: parseInt(e.target.value) || 0 }] })
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
            </div>
            <ColorPicker
              label="Shadow Color"
              value={styles.boxShadow?.[0]?.color}
              onChange={(color) => {
                const shadow = styles.boxShadow?.[0] || { x: 0, y: 4, blur: 10, spread: 0, color: 'rgba(0,0,0,0.15)' }
                updateStyles({ boxShadow: [{ ...shadow, color }] })
              }}
            />
            <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={styles.boxShadow?.[0]?.inset ?? false}
                onChange={(e) => {
                  const shadow = styles.boxShadow?.[0] || { x: 0, y: 4, blur: 10, spread: 0, color: 'rgba(0,0,0,0.15)' }
                  updateStyles({ boxShadow: [{ ...shadow, inset: e.target.checked }] })
                }}
                className="rounded bg-white/10 border-white/20"
              />
              Inset Shadow
            </label>
          </div>
        </div>
      </Section>

      {/* Filters */}
      <Section title="Filters" icon={SlidersHorizontal} defaultOpen={false}>
        <div className="space-y-3">
          <Slider
            label="Blur"
            value={styles.filter?.blur ?? 0}
            onChange={(v) => updateStyles({ filter: { ...styles.filter, blur: v } })}
            min={0}
            max={20}
            unit="px"
          />
          <Slider
            label="Brightness"
            value={styles.filter?.brightness ?? 100}
            onChange={(v) => updateStyles({ filter: { ...styles.filter, brightness: v } })}
            min={0}
            max={200}
            unit="%"
          />
          <Slider
            label="Contrast"
            value={styles.filter?.contrast ?? 100}
            onChange={(v) => updateStyles({ filter: { ...styles.filter, contrast: v } })}
            min={0}
            max={200}
            unit="%"
          />
          <Slider
            label="Saturate"
            value={styles.filter?.saturate ?? 100}
            onChange={(v) => updateStyles({ filter: { ...styles.filter, saturate: v } })}
            min={0}
            max={200}
            unit="%"
          />
          <Slider
            label="Grayscale"
            value={styles.filter?.grayscale ?? 0}
            onChange={(v) => updateStyles({ filter: { ...styles.filter, grayscale: v } })}
            min={0}
            max={100}
            unit="%"
          />
          <Slider
            label="Sepia"
            value={styles.filter?.sepia ?? 0}
            onChange={(v) => updateStyles({ filter: { ...styles.filter, sepia: v } })}
            min={0}
            max={100}
            unit="%"
          />
          <Slider
            label="Hue Rotate"
            value={styles.filter?.hueRotate ?? 0}
            onChange={(v) => updateStyles({ filter: { ...styles.filter, hueRotate: v } })}
            min={0}
            max={360}
            unit="°"
          />
          <Slider
            label="Invert"
            value={styles.filter?.invert ?? 0}
            onChange={(v) => updateStyles({ filter: { ...styles.filter, invert: v } })}
            min={0}
            max={100}
            unit="%"
          />
          <button
            onClick={() => updateStyles({ filter: undefined })}
            className="w-full py-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition"
          >
            Reset Filters
          </button>
        </div>
      </Section>

      {/* Effects */}
      <Section title="Effects" icon={Blend} defaultOpen={false}>
        <div className="space-y-3">
          <Slider
            label="Opacity"
            value={(styles.opacity ?? 1) * 100}
            onChange={(v) => updateStyles({ opacity: v / 100 })}
            min={0}
            max={100}
            unit="%"
          />
          <div className="space-y-2">
            <label className="text-xs text-white/60">Blend Mode</label>
            <select
              value={styles.mixBlendMode || 'normal'}
              onChange={(e) => updateStyles({ mixBlendMode: e.target.value as any })}
              className="w-full bg-forma-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm [&>option]:bg-forma-900 [&>option]:text-white"
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="darken">Darken</option>
              <option value="lighten">Lighten</option>
              <option value="color-dodge">Color Dodge</option>
              <option value="color-burn">Color Burn</option>
              <option value="hard-light">Hard Light</option>
              <option value="soft-light">Soft Light</option>
              <option value="difference">Difference</option>
              <option value="exclusion">Exclusion</option>
              <option value="hue">Hue</option>
              <option value="saturation">Saturation</option>
              <option value="color">Color</option>
              <option value="luminosity">Luminosity</option>
            </select>
          </div>
          <div className="pt-2 border-t border-white/10 space-y-3">
            <label className="text-xs text-white/60">Backdrop Blur (Glass Effect)</label>
            <Slider
              label="Backdrop Blur"
              value={styles.backdropFilter?.blur ?? 0}
              onChange={(v) => updateStyles({ backdropFilter: { ...styles.backdropFilter, blur: v } })}
              min={0}
              max={30}
              unit="px"
            />
            <Slider
              label="Backdrop Brightness"
              value={styles.backdropFilter?.brightness ?? 100}
              onChange={(v) => updateStyles({ backdropFilter: { ...styles.backdropFilter, brightness: v } })}
              min={0}
              max={200}
              unit="%"
            />
          </div>
        </div>
      </Section>

      {/* Position */}
      <Section title="Position" icon={Crosshair} defaultOpen={false}>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-white/60">Position Type</label>
            <div className="grid grid-cols-4 gap-1">
              {(['relative', 'absolute', 'fixed', 'sticky'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => updateStyles({ position: pos })}
                  className={`py-2 text-[10px] rounded-lg transition ${
                    styles.position === pos
                      ? 'bg-forma-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {(styles.position === 'absolute' || styles.position === 'fixed' || styles.position === 'sticky') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-white/40">Top</label>
                <input
                  type="text"
                  value={styles.top || ''}
                  onChange={(e) => updateStyles({ top: e.target.value || undefined })}
                  placeholder="auto"
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40">Right</label>
                <input
                  type="text"
                  value={styles.right || ''}
                  onChange={(e) => updateStyles({ right: e.target.value || undefined })}
                  placeholder="auto"
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40">Bottom</label>
                <input
                  type="text"
                  value={styles.bottom || ''}
                  onChange={(e) => updateStyles({ bottom: e.target.value || undefined })}
                  placeholder="auto"
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40">Left</label>
                <input
                  type="text"
                  value={styles.left || ''}
                  onChange={(e) => updateStyles({ left: e.target.value || undefined })}
                  placeholder="auto"
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
            </div>
          )}
          <div>
            <label className="text-[10px] text-white/40">Z-Index</label>
            <input
              type="number"
              value={styles.zIndex ?? ''}
              onChange={(e) => updateStyles({ zIndex: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="auto"
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
            />
          </div>
        </div>
      </Section>

      {/* Overflow & Cursor */}
      <Section title="Overflow & Cursor" icon={MousePointer2} defaultOpen={false}>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-white/60">Overflow</label>
            <div className="grid grid-cols-4 gap-1">
              {(['visible', 'hidden', 'scroll', 'auto'] as const).map((overflow) => (
                <button
                  key={overflow}
                  onClick={() => updateStyles({ overflow })}
                  className={`py-2 text-[10px] rounded-lg transition ${
                    styles.overflow === overflow
                      ? 'bg-forma-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {overflow.charAt(0).toUpperCase() + overflow.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/60">Cursor</label>
            <select
              value={styles.cursor || 'auto'}
              onChange={(e) => updateStyles({ cursor: e.target.value as any })}
              className="w-full bg-forma-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm [&>option]:bg-forma-900 [&>option]:text-white"
            >
              <optgroup label="Standard">
                <option value="auto">Auto</option>
                <option value="default">Default</option>
                <option value="pointer">Pointer</option>
                <option value="wait">Wait</option>
                <option value="text">Text</option>
                <option value="move">Move</option>
                <option value="not-allowed">Not Allowed</option>
                <option value="grab">Grab</option>
                <option value="grabbing">Grabbing</option>
                <option value="zoom-in">Zoom In</option>
                <option value="zoom-out">Zoom Out</option>
              </optgroup>
              <optgroup label="Custom Effects">
                <option value="rgb-glow">✨ RGB Glow</option>
              </optgroup>
            </select>
            {styles.cursor === 'rgb-glow' && (
              <p className="text-xs text-forma-400 mt-1">
                Animated cursor with color-cycling glow effect
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/60">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateStyles({ visibility: 'visible' })}
                className={`py-2 text-xs rounded-lg transition ${
                  styles.visibility !== 'hidden'
                    ? 'bg-forma-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Visible
              </button>
              <button
                onClick={() => updateStyles({ visibility: 'hidden' })}
                className={`py-2 text-xs rounded-lg transition ${
                  styles.visibility === 'hidden'
                    ? 'bg-forma-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Hidden
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Advanced Features */}
      <Section title="Advanced" icon={Layers} defaultOpen={false}>
        <div className="space-y-3">
          <Transform3DPanel
            component={component}
            onUpdate={onUpdate}
          />
          <DataBindingPanel
            component={component}
            onUpdate={onUpdate}
          />
          <CodeInjectionPanel
            component={component}
            onUpdate={onUpdate}
          />
        </div>
      </Section>
    </div>
  )
}
