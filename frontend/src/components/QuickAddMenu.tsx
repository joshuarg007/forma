'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Sparkles, Layout, Columns, Grid3X3, Menu, FormInput,
  CreditCard, Users, MessageSquare, BarChart3, Image, Video,
  Star, Clock, Zap, ChevronRight, X, Loader2, Brain, Cpu
} from 'lucide-react'
import { checkOllamaStatus, getSmartPredictions } from '@/lib/ollama'

interface QuickAddItem {
  id: string
  name: string
  icon: React.ReactNode
  category: string
  description: string
  score?: number // AI prediction score
  aiReason?: string // Why AI suggested this
}

interface QuickAddMenuProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (item: QuickAddItem) => void
  existingComponents: string[] // IDs of components already on canvas
  position?: { x: number; y: number }
}

// Default components with categories
const allComponents: QuickAddItem[] = [
  // Heroes - most common first
  { id: 'hero-centered', name: 'Centered Hero', icon: <Layout className="w-4 h-4" />, category: 'Hero', description: 'Centered text with CTA buttons' },
  { id: 'hero-split', name: 'Split Hero', icon: <Columns className="w-4 h-4" />, category: 'Hero', description: 'Text on left, image on right' },

  // Navigation
  { id: 'navbar', name: 'Navbar', icon: <Menu className="w-4 h-4" />, category: 'Navigation', description: 'Responsive navigation bar' },

  // Layout
  { id: 'section', name: 'Section', icon: <Layout className="w-4 h-4" />, category: 'Layout', description: 'Full-width section with padding' },
  { id: 'grid-3col', name: '3 Column Grid', icon: <Grid3X3 className="w-4 h-4" />, category: 'Layout', description: 'Three equal columns' },
  { id: 'card', name: 'Card', icon: <CreditCard className="w-4 h-4" />, category: 'Layout', description: 'Content card with shadow' },

  // Features
  { id: 'features-grid', name: 'Features Grid', icon: <Grid3X3 className="w-4 h-4" />, category: 'Features', description: 'Icon feature cards in grid' },
  { id: 'features-list', name: 'Features List', icon: <Zap className="w-4 h-4" />, category: 'Features', description: 'Vertical feature list' },

  // Social Proof
  { id: 'testimonials', name: 'Testimonials', icon: <MessageSquare className="w-4 h-4" />, category: 'Social Proof', description: 'Customer testimonial cards' },
  { id: 'logos', name: 'Logo Cloud', icon: <Star className="w-4 h-4" />, category: 'Social Proof', description: 'Partner/client logos' },
  { id: 'stats', name: 'Stats Section', icon: <BarChart3 className="w-4 h-4" />, category: 'Social Proof', description: 'Key metrics display' },

  // Pricing
  { id: 'pricing-table', name: 'Pricing Table', icon: <CreditCard className="w-4 h-4" />, category: 'Pricing', description: 'Pricing tiers comparison' },

  // CTA
  { id: 'cta-simple', name: 'Simple CTA', icon: <Zap className="w-4 h-4" />, category: 'CTA', description: 'Call-to-action banner' },
  { id: 'cta-newsletter', name: 'Newsletter', icon: <FormInput className="w-4 h-4" />, category: 'CTA', description: 'Email signup form' },

  // Team
  { id: 'team-grid', name: 'Team Grid', icon: <Users className="w-4 h-4" />, category: 'Team', description: 'Team member cards' },

  // Media
  { id: 'gallery', name: 'Image Gallery', icon: <Image className="w-4 h-4" />, category: 'Media', description: 'Image grid with lightbox' },
  { id: 'video-embed', name: 'Video Embed', icon: <Video className="w-4 h-4" />, category: 'Media', description: 'Embedded video player' },

  // Footer
  { id: 'footer', name: 'Footer', icon: <Layout className="w-4 h-4" />, category: 'Footer', description: 'Site footer with links' },
]

// Smart prediction based on what's already on the page
function predictNextComponents(existingIds: string[]): QuickAddItem[] {
  const scored = allComponents.map(item => {
    let score = 50 // Base score

    // Already have it? Lower score significantly
    if (existingIds.includes(item.id)) {
      score -= 100
    }

    // Empty page? Suggest navbar and hero first
    if (existingIds.length === 0) {
      if (item.id === 'navbar') score += 50
      if (item.category === 'Hero') score += 40
    }

    // Have navbar but no hero? Suggest hero
    if (existingIds.includes('navbar') && !existingIds.some(id => id.startsWith('hero'))) {
      if (item.category === 'Hero') score += 45
    }

    // Have hero? Suggest features, social proof
    if (existingIds.some(id => id.startsWith('hero'))) {
      if (item.category === 'Features') score += 35
      if (item.category === 'Social Proof') score += 30
    }

    // Have features? Suggest testimonials, pricing
    if (existingIds.some(id => id.startsWith('features'))) {
      if (item.category === 'Social Proof') score += 30
      if (item.category === 'Pricing') score += 25
    }

    // Have pricing? Suggest CTA, FAQ
    if (existingIds.some(id => id.startsWith('pricing'))) {
      if (item.category === 'CTA') score += 35
    }

    // Don't have footer yet? Boost it if page has content
    if (existingIds.length >= 3 && !existingIds.includes('footer')) {
      if (item.id === 'footer') score += 20
    }

    return { ...item, score }
  })

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
}

export default function QuickAddMenu({ isOpen, onClose, onSelect, existingComponents, position }: QuickAddMenuProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<QuickAddItem[]>([])
  const [loading, setLoading] = useState(false)
  const [ollamaAvailable, setOllamaAvailable] = useState(false)
  const [usingAI, setUsingAI] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setLoading(true)

      // Start with rule-based predictions immediately
      const ruleBased = predictNextComponents(existingComponents)
      setSuggestions(ruleBased)

      // Then try Ollama for smarter predictions
      checkOllamaStatus().then(async (available) => {
        setOllamaAvailable(available)

        if (available) {
          try {
            setUsingAI(true)
            const aiPredictions = await getSmartPredictions({ existingComponents })

            if (aiPredictions.length > 0) {
              // Merge AI predictions with our component data
              const enhanced = aiPredictions.map(pred => {
                const base = allComponents.find(c => c.id === pred.id)
                if (base) {
                  return {
                    ...base,
                    score: pred.confidence * 100,
                    aiReason: pred.reason,
                  }
                }
                return null
              }).filter(Boolean) as QuickAddItem[]

              // Add remaining rule-based suggestions
              const aiIds = new Set(enhanced.map(e => e.id))
              const remaining = ruleBased.filter(r => !aiIds.has(r.id)).slice(0, 3)

              setSuggestions([...enhanced, ...remaining])
            }
          } catch (e) {
            console.warn('AI prediction failed:', e)
          }
        }

        setLoading(false)
        setUsingAI(false)
      })

      // Focus search input
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, existingComponents])

  const filteredItems = searchQuery
    ? allComponents.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : suggestions.slice(0, 8) // Show top 8 predictions

  const handleSelect = (item: QuickAddItem) => {
    onSelect(item)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
      />

      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="fixed z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{
          left: position?.x ? `${position.x}px` : '50%',
          top: position?.y ? `${position.y}px` : '50%',
          transform: position ? 'translate(-50%, 0)' : 'translate(-50%, -50%)',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                usingAI
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse'
                  : ollamaAvailable
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-500'
              }`}>
                {usingAI ? (
                  <Brain className="w-4 h-4 text-white animate-pulse" />
                ) : ollamaAvailable ? (
                  <Cpu className="w-4 h-4 text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick Add</h3>
                <p className="text-xs text-gray-500">
                  {usingAI ? (
                    <span className="text-purple-500">Ollama thinking...</span>
                  ) : ollamaAvailable ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      AI-powered suggestions
                    </span>
                  ) : (
                    'Smart suggestions'
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Suggestions */}
        <div className="max-h-80 overflow-y-auto p-2">
          {!searchQuery && suggestions.length > 0 && (
            <div className="px-2 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
              {ollamaAvailable ? (
                <>
                  <Brain className="w-3 h-3" />
                  AI Recommendations
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Suggested for you
                </>
              )}
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No components found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 group-hover:from-indigo-100 group-hover:to-purple-50 group-hover:border-indigo-200 group-hover:text-indigo-600 transition">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      {!searchQuery && index < 3 && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          item.aiReason
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-indigo-100 text-indigo-600'
                        }`}>
                          {item.aiReason ? 'AI Pick' : 'Recommended'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {item.aiReason || item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-mono text-[10px]">↵</kbd> to add first suggestion
          </p>
        </div>
      </motion.div>
    </>
  )
}
