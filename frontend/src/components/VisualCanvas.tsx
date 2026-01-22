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
  'card-basic': () => (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm mx-auto">
      <h3 className="font-semibold text-gray-900 mb-2">Card Title</h3>
      <p className="text-gray-500 text-sm">Card description goes here with some content.</p>
    </div>
  ),
  'card-image': () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto">
      <div className="h-40 bg-gradient-to-br from-indigo-400 to-purple-500" />
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
    const component = components.find(c => c.id === selectedId)
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
    const newComponents = components.map(c =>
      c.id === id ? { ...c, locked: !c.locked } : c
    )
    onComponentsChange(newComponents)
  }, [components, onComponentsChange])

  const toggleHide = useCallback((id: string) => {
    const newComponents = components.map(c =>
      c.id === id ? { ...c, hidden: !c.hidden } : c
    )
    onComponentsChange(newComponents)
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

  const renderPreview = (component: CanvasComponent) => {
    const Preview = componentPreviews[component.type] || componentPreviews['default']
    return <Preview name={component.name} {...component.props} />
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
    const component = components.find(c => c.id === componentId)
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
