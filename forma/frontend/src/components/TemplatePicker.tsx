'use client'

import { useState, useEffect } from 'react'
import {
  X, Layout, Navigation, Square, LayoutGrid, Palette, Loader2,
  FileText, Rocket, LayoutDashboard, Shield, Component
} from 'lucide-react'
import { api } from '@/lib/api'

interface Template {
  id: string
  name: string
  category: string
  subcategory?: string
  description: string
  tags: string[]
  code: string
}

interface Category {
  name: string
  count: number
}

interface Theme {
  id: string
  name: string
  description: string
  colors: Record<string, string>
}

interface TemplatePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  navbar: <Navigation className="w-4 h-4" />,
  footer: <Square className="w-4 h-4" />,
  hero: <Layout className="w-4 h-4" />,
  sidebar: <LayoutGrid className="w-4 h-4" />,
  section: <LayoutGrid className="w-4 h-4" />,
  page: <FileText className="w-4 h-4" />,
}

const PAGE_SUBCATEGORY_ICONS: Record<string, React.ReactNode> = {
  landing: <Rocket className="w-4 h-4" />,
  dashboard: <LayoutDashboard className="w-4 h-4" />,
  auth: <Shield className="w-4 h-4" />,
  component: <Component className="w-4 h-4" />,
}

export default function TemplatePicker({ isOpen, onClose, onSelectTemplate }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [pageTemplates, setPageTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pageSubcategories, setPageSubcategories] = useState<string[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'components' | 'pages' | 'themes'>('components')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [templatesData, pagesData, categoriesData, themesData] = await Promise.all([
        api.get('/api/templates/?include_pages=false'),
        api.get('/api/templates/pages'),
        api.get('/api/templates/categories?include_pages=false'),
        api.get('/api/templates/themes'),
      ])
      setTemplates(templatesData.templates || [])
      setPageTemplates(pagesData.templates || [])
      setPageSubcategories(pagesData.subcategories || [])
      setCategories(categoriesData.categories || [])
      setThemes(themesData.themes || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = selectedCategory
    ? templates.filter((t) => t.category === selectedCategory)
    : templates

  const filteredPageTemplates = selectedSubcategory
    ? pageTemplates.filter((t) => t.subcategory === selectedSubcategory)
    : pageTemplates

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-forma-950 border border-white/10 rounded-xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white">Template Library</h2>
            <p className="text-sm text-white/60">
              {activeTab === 'components' && 'UI components: navbars, heroes, sidebars, and more'}
              {activeTab === 'pages' && 'Full page templates: landing pages, dashboards, auth flows'}
              {activeTab === 'themes' && 'Color themes and design presets'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => { setActiveTab('components'); setSelectedCategory(null); }}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'components'
                ? 'text-white border-b-2 border-forma-500'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Component className="w-4 h-4" />
              Components
              <span className="px-1.5 py-0.5 text-xs rounded bg-white/10">{templates.length}</span>
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('pages'); setSelectedSubcategory(null); }}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'pages'
                ? 'text-white border-b-2 border-emerald-500'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Pages
              <span className="px-1.5 py-0.5 text-xs rounded bg-emerald-500/20 text-emerald-400">{pageTemplates.length}</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'themes'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Themes
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'components' && (
            <>
              {/* Categories sidebar */}
              <div className="w-48 border-r border-white/10 p-4 flex-shrink-0 overflow-y-auto">
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      selectedCategory === null
                        ? 'bg-forma-500/20 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    All Components
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                        selectedCategory === cat.name
                          ? 'bg-forma-500/20 text-white'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {CATEGORY_ICONS[cat.name] || <LayoutGrid className="w-4 h-4" />}
                      <span className="capitalize">{cat.name}</span>
                      <span className="ml-auto text-xs text-white/40">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Components grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-forma-500" />
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full text-red-400">
                    {error}
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-white/40">
                    No components found
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => onSelectTemplate(template)}
                        className="group text-left p-4 rounded-xl border border-white/10 hover:border-forma-500/50 bg-white/5 hover:bg-forma-500/10 transition"
                      >
                        <div className="aspect-video bg-forma-900 rounded-lg mb-3 flex items-center justify-center text-white/20 group-hover:text-forma-400 transition">
                          {CATEGORY_ICONS[template.category] || <LayoutGrid className="w-8 h-8" />}
                        </div>
                        <h3 className="font-medium text-white mb-1">{template.name}</h3>
                        <p className="text-xs text-white/60 line-clamp-2">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'pages' && (
            <>
              {/* Page subcategories sidebar */}
              <div className="w-48 border-r border-white/10 p-4 flex-shrink-0 overflow-y-auto">
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      selectedSubcategory === null
                        ? 'bg-emerald-500/20 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    All Pages
                  </button>
                  {pageSubcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                        selectedSubcategory === sub
                          ? 'bg-emerald-500/20 text-white'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {PAGE_SUBCATEGORY_ICONS[sub] || <FileText className="w-4 h-4" />}
                      <span className="capitalize">{sub}</span>
                      <span className="ml-auto text-xs text-white/40">
                        {pageTemplates.filter(t => t.subcategory === sub).length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Page type descriptions */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-medium text-white/60 mb-3 uppercase tracking-wider">Page Types</h4>
                  <div className="space-y-3 text-xs text-white/40">
                    <div className="flex items-start gap-2">
                      <Rocket className="w-3.5 h-3.5 text-emerald-400 mt-0.5" />
                      <div>
                        <span className="text-white/60">Landing</span>
                        <p>Marketing pages</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5 text-blue-400 mt-0.5" />
                      <div>
                        <span className="text-white/60">Dashboard</span>
                        <p>Admin panels</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-3.5 h-3.5 text-purple-400 mt-0.5" />
                      <div>
                        <span className="text-white/60">Auth</span>
                        <p>Login & signup</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pages grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full text-red-400">
                    {error}
                  </div>
                ) : filteredPageTemplates.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-white/40">
                    No page templates found
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredPageTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => onSelectTemplate(template)}
                        className="group text-left p-4 rounded-xl border border-white/10 hover:border-emerald-500/50 bg-white/5 hover:bg-emerald-500/10 transition"
                      >
                        <div className="aspect-[16/10] bg-gradient-to-br from-forma-900 to-forma-950 rounded-lg mb-3 flex items-center justify-center text-white/20 group-hover:text-emerald-400 transition relative overflow-hidden">
                          {PAGE_SUBCATEGORY_ICONS[template.subcategory || ''] || <FileText className="w-10 h-10" />}
                          {/* Subcategory badge */}
                          <span className="absolute top-2 right-2 px-2 py-0.5 text-xs rounded bg-black/40 text-white/80 capitalize">
                            {template.subcategory}
                          </span>
                        </div>
                        <h3 className="font-medium text-white mb-1">{template.name}</h3>
                        <p className="text-xs text-white/60 line-clamp-2">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-400/80"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'themes' && (
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/10 transition cursor-pointer"
                    >
                      <h3 className="font-medium text-white mb-1">{theme.name}</h3>
                      <p className="text-xs text-white/60 mb-3">{theme.description}</p>
                      <div className="flex gap-1">
                        {Object.entries(theme.colors).slice(0, 6).map(([name, color]) => (
                          <div
                            key={name}
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: color }}
                            title={name}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
