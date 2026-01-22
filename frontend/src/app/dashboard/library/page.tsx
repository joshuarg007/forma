'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Library, Search, Grid, List, Plus, MoreVertical, Heart,
  Download, Trash2, Eye, Code, Copy, Star, Tag, X, Clock,
  Sparkles, FileCode, Package
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import AdminLayout from '@/components/AdminLayout'

interface SavedComponent {
  id: string
  name: string
  description: string
  category: string
  code: string
  thumbnail?: string
  isFavorite: boolean
  tags: string[]
  created_at: string
  used_count: number
}

// Mock saved components
const mockSavedComponents: SavedComponent[] = [
  {
    id: '1',
    name: 'Animated Hero Section',
    description: 'A hero section with gradient background and animated text',
    category: 'Heroes',
    code: `<div className="hero">...</div>`,
    isFavorite: true,
    tags: ['hero', 'animated', 'gradient'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    used_count: 12,
  },
  {
    id: '2',
    name: 'Pricing Table',
    description: 'Three-tier pricing table with toggle for monthly/yearly',
    category: 'Pricing',
    code: `<div className="pricing">...</div>`,
    isFavorite: false,
    tags: ['pricing', 'table', 'toggle'],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    used_count: 8,
  },
  {
    id: '3',
    name: 'Feature Cards Grid',
    description: 'Responsive grid of feature cards with icons',
    category: 'Features',
    code: `<div className="features">...</div>`,
    isFavorite: true,
    tags: ['features', 'cards', 'grid'],
    created_at: new Date(Date.now() - 259200000).toISOString(),
    used_count: 15,
  },
  {
    id: '4',
    name: 'Testimonial Carousel',
    description: 'Auto-playing carousel with customer testimonials',
    category: 'Testimonials',
    code: `<div className="testimonials">...</div>`,
    isFavorite: false,
    tags: ['testimonials', 'carousel', 'slider'],
    created_at: new Date(Date.now() - 345600000).toISOString(),
    used_count: 6,
  },
]

const categories = ['All', 'Heroes', 'Features', 'Pricing', 'Testimonials', 'Forms', 'Footers']

export default function LibraryPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()

  const [components, setComponents] = useState<SavedComponent[]>(mockSavedComponents)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<SavedComponent | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth')
    }
  }, [user, initialized, router])

  const toggleFavorite = (id: string) => {
    setComponents(prev =>
      prev.map(c => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    )
  }

  const deleteComponent = (id: string) => {
    if (!confirm('Delete this component from your library?')) return
    setComponents(prev => prev.filter(c => c.id !== id))
    setActiveMenu(null)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const filteredComponents = components.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory
    const matchesFavorite = !showFavoritesOnly || c.isFavorite
    return matchesSearch && matchesCategory && matchesFavorite
  })

  if (!initialized || !user) {
    return (
      <div className="min-h-screen bg-forma-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Library className="w-6 h-6 text-forma-400" />
            My Library
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Your saved components and custom creations
          </p>
        </div>
        <button
          onClick={() => router.push('/marketplace')}
          className="px-4 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition text-sm font-medium flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          Browse Marketplace
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              selectedCategory === category
                ? 'bg-forma-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your library..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
          />
        </div>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
            showFavoritesOnly
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          <span className="text-sm">Favorites</span>
        </button>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-forma-500 text-white' : 'text-white/60 hover:text-white'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-forma-500 text-white' : 'text-white/60 hover:text-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Components */}
      {filteredComponents.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Library className="w-10 h-10 text-white/40" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            {searchQuery || showFavoritesOnly ? 'No components found' : 'Your library is empty'}
          </h3>
          <p className="text-white/60 mb-6">
            {searchQuery || showFavoritesOnly
              ? 'Try adjusting your filters'
              : 'Save components from the marketplace to build your library'}
          </p>
          {!searchQuery && !showFavoritesOnly && (
            <button
              onClick={() => router.push('/marketplace')}
              className="px-6 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Browse Marketplace
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredComponents.map((component, i) => (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group relative rounded-2xl bg-white/5 border border-white/10 hover:border-forma-500/50 transition overflow-hidden"
            >
              {/* Preview */}
              <div className="aspect-video bg-gradient-to-br from-forma-500/10 to-purple-500/10 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-12 h-12 text-white/10" />
                </div>

                {/* Favorite button */}
                <button
                  onClick={() => toggleFavorite(component.id)}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 backdrop-blur-sm transition hover:bg-black/70"
                >
                  <Heart
                    className={`w-4 h-4 transition ${
                      component.isFavorite ? 'text-red-400 fill-current' : 'text-white/60'
                    }`}
                  />
                </button>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedComponent(component)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyCode(component.code)}
                    className="p-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white truncate flex-1">{component.name}</h3>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === component.id ? null : component.id)}
                      className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {activeMenu === component.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 w-36 bg-forma-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-10"
                        >
                          <button
                            onClick={() => {
                              setSelectedComponent(component)
                              setActiveMenu(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition"
                          >
                            <Code className="w-4 h-4" /> View Code
                          </button>
                          <button
                            onClick={() => {
                              copyCode(component.code)
                              setActiveMenu(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition"
                          >
                            <Copy className="w-4 h-4" /> Copy
                          </button>
                          <hr className="border-white/10" />
                          <button
                            onClick={() => deleteComponent(component.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <p className="text-sm text-white/40 line-clamp-2 mb-3">
                  {component.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {component.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{component.category}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(component.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-white/60">Component</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden md:table-cell">Category</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden sm:table-cell">Added</th>
                <th className="text-right p-4 text-sm font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredComponents.map((component) => (
                <tr key={component.id} className="hover:bg-white/5 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-forma-500/20 to-purple-500/20 flex items-center justify-center">
                        <FileCode className="w-5 h-5 text-forma-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{component.name}</p>
                          {component.isFavorite && (
                            <Heart className="w-3 h-3 text-red-400 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-white/40 truncate max-w-[200px]">
                          {component.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-white/60 hidden md:table-cell">
                    {component.category}
                  </td>
                  <td className="p-4 text-white/60 text-sm hidden sm:table-cell">
                    {new Date(component.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleFavorite(component.id)}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            component.isFavorite ? 'text-red-400 fill-current' : 'text-white/60'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => setSelectedComponent(component)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyCode(component.code)}
                        className="p-2 rounded-lg hover:bg-forma-500/20 text-forma-400 transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteComponent(component.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Code Preview Modal */}
      <AnimatePresence>
        {selectedComponent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[80vh] bg-forma-900 rounded-2xl border border-white/10 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-forma-500/20 to-purple-500/20 flex items-center justify-center">
                    <FileCode className="w-5 h-5 text-forma-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{selectedComponent.name}</h2>
                    <p className="text-sm text-white/40">{selectedComponent.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCode(selectedComponent.code)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm flex items-center gap-2 transition"
                  >
                    <Copy className="w-4 h-4" /> Copy Code
                  </button>
                  <button
                    onClick={() => setSelectedComponent(null)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap">
                  {selectedComponent.code}
                </pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
