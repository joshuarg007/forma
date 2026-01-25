'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, FolderOpen, Trash2, Search, Grid, List, MoreVertical,
  Clock, Users, Layers, Play, Eye, Edit2, Copy, Download, Star,
  Filter, SortAsc, ChevronDown, X
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import ConfirmDialog from '@/components/ConfirmDialog'

type ViewMode = 'grid' | 'list'
type SortOption = 'updated' | 'created' | 'name'

export default function ProjectsPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, loadingProjects, fetchProjects, createProject, deleteProject } = useProjectStore()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('updated')
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    }
  }, [user, fetchProjects])

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    setCreating(true)
    try {
      const project = await createProject(newProjectName.trim(), newProjectDesc.trim() || undefined)
      setShowNewProject(false)
      setNewProjectName('')
      setNewProjectDesc('')
      router.push(`/builder/${project.id}`)
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    setIsDeleting(true)
    try {
      await deleteProject(projectToDelete.id)
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      setActiveMenu(null)
    } catch (error) {
      console.error('Failed to delete project:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
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
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-white/60 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="px-4 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition text-sm font-medium flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:border-white/20 transition">
            <SortAsc className="w-4 h-4" />
            <span className="text-sm">
              {sortBy === 'updated' ? 'Last Updated' : sortBy === 'created' ? 'Date Created' : 'Name'}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* View Toggle */}
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

      {/* Projects */}
      {loadingProjects ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-10 h-10 text-white/40" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            {searchQuery ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-white/60 mb-6">
            {searchQuery ? 'Try adjusting your search' : 'Create your first project to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowNewProject(true)}
              className="px-6 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group relative rounded-2xl bg-white/5 border border-white/10 hover:border-forma-500/50 transition overflow-hidden"
            >
              {/* Preview thumbnail */}
              <div
                onClick={() => router.push(`/builder/${project.id}`)}
                className="aspect-video bg-gradient-to-br from-forma-500/10 to-purple-500/10 flex items-center justify-center cursor-pointer"
              >
                <FolderOpen className="w-12 h-12 text-white/20" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white truncate flex-1">{project.name}</h3>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveMenu(activeMenu === project.id ? null : project.id)
                      }}
                      className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {activeMenu === project.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 w-40 bg-forma-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-10"
                        >
                          <button
                            onClick={() => router.push(`/builder/${project.id}`)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition">
                            <Copy className="w-4 h-4" /> Duplicate
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition">
                            <Download className="w-4 h-4" /> Export
                          </button>
                          <hr className="border-white/10" />
                          <button
                            onClick={() => {
                              setProjectToDelete({ id: project.id, name: project.name })
                              setDeleteDialogOpen(true)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <p className="text-sm text-white/40 truncate mb-3">
                  {project.description || 'No description'}
                </p>

                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {project.pages_count || 1} page{(project.pages_count || 1) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none group-hover:pointer-events-auto">
                <button
                  onClick={() => router.push(`/builder/${project.id}`)}
                  className="p-3 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition"
                >
                  <Play className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.open(`/preview/${project.id}`, '_blank')}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-white/60">Name</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden md:table-cell">Pages</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden sm:table-cell">Updated</th>
                <th className="text-right p-4 text-sm font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-white/5 transition cursor-pointer"
                  onClick={() => router.push(`/builder/${project.id}`)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-forma-500/20 to-purple-500/20 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-forma-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{project.name}</p>
                        <p className="text-sm text-white/40 truncate max-w-[200px]">
                          {project.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-white/60 hidden md:table-cell">
                    {project.pages_count || 1}
                  </td>
                  <td className="p-4 text-white/60 text-sm hidden sm:table-cell">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/builder/${project.id}`)
                        }}
                        className="p-2 rounded-lg hover:bg-forma-500/20 text-forma-400 transition"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setProjectToDelete({ id: project.id, name: project.name })
                          setDeleteDialogOpen(true)
                        }}
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

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-forma-900 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">New Project</h2>
                <button
                  onClick={() => setShowNewProject(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My Awesome Project"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Description (optional)</label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="A brief description of your project"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowNewProject(false)
                    setNewProjectName('')
                    setNewProjectDesc('')
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || creating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setProjectToDelete(null)
        }}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone and all pages, components, and settings will be permanently removed.`}
        confirmText="Delete Project"
        cancelText="Keep Project"
        variant="danger"
        isLoading={isDeleting}
      />
    </AdminLayout>
  )
}
