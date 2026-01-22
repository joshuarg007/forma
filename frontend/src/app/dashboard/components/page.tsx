'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Search, Grid, List, MoreVertical, Code, Eye, Copy,
  Trash2, Filter, ChevronDown, Clock, Layers, Plus, X, Download,
  FileCode, Zap, RefreshCw
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import { api } from '@/lib/api'

interface AIComponent {
  id: string
  name: string
  code: string
  intent: string
  project_id: string
  project_name?: string
  created_at: string
  updated_at: string
}

export default function ComponentsPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()

  const [components, setComponents] = useState<AIComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedComponent, setSelectedComponent] = useState<AIComponent | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth')
    }
  }, [user, initialized, router])

  useEffect(() => {
    if (user) {
      fetchProjects()
      loadAllComponents()
    }
  }, [user, fetchProjects])

  const loadAllComponents = async () => {
    setLoading(true)
    try {
      const { projects: allProjects } = await api.getProjects()
      const allComponents: AIComponent[] = []

      for (const project of allProjects) {
        try {
          const projectComponents = await api.getComponents(project.id)
          allComponents.push(
            ...projectComponents.map((c: any) => ({
              ...c,
              project_id: project.id,
              project_name: project.name,
            }))
          )
        } catch (e) {
          // Project might not have components
        }
      }

      setComponents(allComponents)
    } catch (error) {
      console.error('Failed to load components:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (component: AIComponent) => {
    if (!confirm('Delete this component?')) return

    try {
      await api.deleteComponent(component.project_id, component.id)
      setComponents(prev => prev.filter(c => c.id !== component.id))
      setActiveMenu(null)
    } catch (error) {
      console.error('Failed to delete component:', error)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const filteredComponents = components.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.intent?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <Sparkles className="w-6 h-6 text-forma-400" />
            AI Components
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {components.length} component{components.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        <button
          onClick={loadAllComponents}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white transition text-sm font-medium flex items-center gap-2 w-fit"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
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

      {/* Components */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredComponents.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white/40" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            {searchQuery ? 'No components found' : 'No AI components yet'}
          </h3>
          <p className="text-white/60 mb-6">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Use the AI Assistant in the builder to generate components'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map((component, i) => (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group relative rounded-2xl bg-white/5 border border-white/10 hover:border-forma-500/50 transition overflow-hidden"
            >
              {/* Code preview */}
              <div className="p-4 h-32 bg-forma-950/50 overflow-hidden relative">
                <pre className="text-xs text-white/40 font-mono overflow-hidden">
                  {component.code?.slice(0, 300) || 'No code preview'}...
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-forma-950 to-transparent" />
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forma-500/20 to-purple-500/20 flex items-center justify-center">
                      <FileCode className="w-4 h-4 text-forma-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white truncate">{component.name}</h3>
                      <p className="text-xs text-white/40">{component.project_name}</p>
                    </div>
                  </div>
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
                          className="absolute right-0 top-full mt-1 w-40 bg-forma-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-10"
                        >
                          <button
                            onClick={() => {
                              setSelectedComponent(component)
                              setActiveMenu(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition"
                          >
                            <Eye className="w-4 h-4" /> View Code
                          </button>
                          <button
                            onClick={() => {
                              handleCopyCode(component.code)
                              setActiveMenu(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition"
                          >
                            <Copy className="w-4 h-4" /> Copy Code
                          </button>
                          <hr className="border-white/10" />
                          <button
                            onClick={() => handleDelete(component)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {component.intent && (
                  <p className="text-sm text-white/40 line-clamp-2 mb-3">
                    "{component.intent}"
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-white/40">
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
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden md:table-cell">Project</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden sm:table-cell">Created</th>
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
                        <p className="font-medium text-white">{component.name}</p>
                        <p className="text-sm text-white/40 truncate max-w-[200px]">
                          {component.intent || 'No intent'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-white/60 hidden md:table-cell">
                    {component.project_name}
                  </td>
                  <td className="p-4 text-white/60 text-sm hidden sm:table-cell">
                    {new Date(component.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedComponent(component)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyCode(component.code)}
                        className="p-2 rounded-lg hover:bg-forma-500/20 text-forma-400 transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(component)}
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
                    <p className="text-sm text-white/40">{selectedComponent.project_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(selectedComponent.code)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm flex items-center gap-2 transition"
                  >
                    <Copy className="w-4 h-4" /> Copy
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
