'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Layout, Search, Grid, List, Filter, ChevronDown, Eye, Plus,
  Star, Download, Globe, BarChart3, Package, Layers, Sparkles,
  ShoppingBag, Users, FileCode
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'

interface Template {
  id: string
  name: string
  category: string
  description: string
  preview_url: string
  uses: number
  rating: number
  isPremium: boolean
}

const categories = [
  { id: 'all', label: 'All Templates', icon: <Grid className="w-4 h-4" /> },
  { id: 'landing', label: 'Landing Pages', icon: <Globe className="w-4 h-4" /> },
  { id: 'dashboard', label: 'Dashboards', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'ecommerce', label: 'E-commerce', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'portfolio', label: 'Portfolios', icon: <Layers className="w-4 h-4" /> },
  { id: 'saas', label: 'SaaS', icon: <Package className="w-4 h-4" /> },
]

// Mock templates data
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'SaaS Landing Pro',
    category: 'saas',
    description: 'Modern SaaS landing page with hero, features, pricing, and testimonials.',
    preview_url: '/templates/saas-landing.png',
    uses: 2450,
    rating: 4.9,
    isPremium: false,
  },
  {
    id: '2',
    name: 'Admin Dashboard',
    category: 'dashboard',
    description: 'Complete admin dashboard with charts, tables, and widgets.',
    preview_url: '/templates/admin-dashboard.png',
    uses: 1890,
    rating: 4.8,
    isPremium: true,
  },
  {
    id: '3',
    name: 'E-commerce Store',
    category: 'ecommerce',
    description: 'Full e-commerce template with product grid, cart, and checkout.',
    preview_url: '/templates/ecommerce.png',
    uses: 1560,
    rating: 4.7,
    isPremium: true,
  },
  {
    id: '4',
    name: 'Developer Portfolio',
    category: 'portfolio',
    description: 'Clean portfolio template for developers and designers.',
    preview_url: '/templates/portfolio.png',
    uses: 1230,
    rating: 4.9,
    isPremium: false,
  },
  {
    id: '5',
    name: 'Startup Landing',
    category: 'landing',
    description: 'Conversion-focused landing page for startups.',
    preview_url: '/templates/startup.png',
    uses: 980,
    rating: 4.6,
    isPremium: false,
  },
  {
    id: '6',
    name: 'Agency Website',
    category: 'landing',
    description: 'Professional agency website with case studies and team sections.',
    preview_url: '/templates/agency.png',
    uses: 870,
    rating: 4.8,
    isPremium: true,
  },
]

export default function TemplatesPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { createProject } = useProjectStore()

  const [templates] = useState<Template[]>(mockTemplates)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth')
    }
  }, [user, initialized, router])

  const handleUseTemplate = async (template: Template) => {
    try {
      const project = await createProject(`${template.name} Copy`)
      router.push(`/builder/${project.id}`)
    } catch (error) {
      console.error('Failed to create project from template:', error)
    }
  }

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    return matchesSearch && matchesCategory
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
            <Layout className="w-6 h-6 text-forma-400" />
            Templates
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Start with a professionally designed template
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition ${
              selectedCategory === category.id
                ? 'bg-forma-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {category.icon}
            <span className="text-sm font-medium">{category.label}</span>
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
            placeholder="Search templates..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
          />
        </div>

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

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Layout className="w-10 h-10 text-white/40" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No templates found</h3>
          <p className="text-white/60">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-2xl bg-white/5 border border-white/10 hover:border-forma-500/50 transition overflow-hidden"
            >
              {/* Preview */}
              <div className="aspect-[16/10] bg-gradient-to-br from-forma-500/10 to-purple-500/10 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileCode className="w-16 h-16 text-white/10" />
                </div>

                {template.isPremium && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" /> Pro
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="px-4 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white text-sm font-medium flex items-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" /> Use Template
                  </button>
                  <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white">{template.name}</h3>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs">{template.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-white/40 line-clamp-2 mb-3">
                  {template.description}
                </p>

                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className="capitalize">{template.category}</span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {template.uses.toLocaleString()} uses
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
                <th className="text-left p-4 text-sm font-medium text-white/60">Template</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden md:table-cell">Category</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden sm:table-cell">Rating</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden lg:table-cell">Uses</th>
                <th className="text-right p-4 text-sm font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-white/5 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-forma-500/20 to-purple-500/20 flex items-center justify-center">
                        <Layout className="w-6 h-6 text-forma-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{template.name}</p>
                          {template.isPremium && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Pro
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/40 truncate max-w-[200px]">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-white/60 capitalize hidden md:table-cell">
                    {template.category}
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-sm">{template.rating}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white/60 hidden lg:table-cell">
                    {template.uses.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="px-3 py-1.5 rounded-lg bg-forma-500 hover:bg-forma-600 text-white text-sm transition"
                      >
                        Use
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
