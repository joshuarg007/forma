'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Search, MoreVertical, Clock, Edit2, X,
  List, GripVertical, Link, FileText, ExternalLink, ChevronDown
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import { api } from '@/lib/api'

interface MenuItem {
  id: string
  label: string
  type: 'page' | 'url'
  page_id?: string
  page_slug?: string
  url?: string
  open_new_tab?: boolean
  children?: MenuItem[]
}

interface MenuData {
  id: string
  project_id: string
  name: string
  slug: string
  description: string | null
  items: MenuItem[]
  created_at: string
  updated_at: string
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-')
}

export default function MenusPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()

  const [menus, setMenus] = useState<MenuData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuData | null>(null)
  const [menuName, setMenuName] = useState('')
  const [menuSlug, setMenuSlug] = useState('')
  const [menuDescription, setMenuDescription] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [modalProjectId, setModalProjectId] = useState<string>('')
  const [saving, setSaving] = useState(false)

  // Pages for the selected project (for page link type)
  const [projectPages, setProjectPages] = useState<any[]>([])

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

  useEffect(() => {
    if (projects.length > 0) {
      loadAllMenus()
    } else {
      setLoading(false)
    }
  }, [projects])

  async function loadAllMenus() {
    setLoading(true)
    try {
      const allMenus: MenuData[] = []
      for (const project of projects) {
        try {
          const res = await api.getMenus(project.id)
          allMenus.push(...res.menus)
        } catch {
          // project may not have menus yet
        }
      }
      setMenus(allMenus)
    } catch (err) {
      console.error('Failed to load menus:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadProjectPages(projectId: string) {
    try {
      const res = await api.getPages(projectId)
      setProjectPages(res.pages || [])
    } catch {
      setProjectPages([])
    }
  }

  function openCreateModal() {
    setEditingMenu(null)
    setMenuName('')
    setMenuSlug('')
    setMenuDescription('')
    setMenuItems([])
    setModalProjectId(projects[0]?.id || '')
    setProjectPages([])
    if (projects[0]) loadProjectPages(projects[0].id)
    setShowModal(true)
  }

  function openEditModal(menu: MenuData) {
    setEditingMenu(menu)
    setMenuName(menu.name)
    setMenuSlug(menu.slug)
    setMenuDescription(menu.description || '')
    setMenuItems(menu.items || [])
    setModalProjectId(menu.project_id)
    loadProjectPages(menu.project_id)
    setShowModal(true)
  }

  function addItem() {
    setMenuItems([...menuItems, {
      id: generateId(),
      label: '',
      type: 'url',
      url: '',
      open_new_tab: false,
    }])
  }

  function updateItem(index: number, updates: Partial<MenuItem>) {
    const newItems = [...menuItems]
    newItems[index] = { ...newItems[index], ...updates }
    setMenuItems(newItems)
  }

  function removeItem(index: number) {
    setMenuItems(menuItems.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!menuName.trim() || !modalProjectId) return
    setSaving(true)
    try {
      const slug = menuSlug.trim() || slugify(menuName)
      const payload = {
        name: menuName.trim(),
        slug,
        description: menuDescription.trim() || undefined,
        items: menuItems,
      }
      if (editingMenu) {
        await api.updateMenu(modalProjectId, editingMenu.id, payload)
      } else {
        await api.createMenu(modalProjectId, payload)
      }
      setShowModal(false)
      loadAllMenus()
    } catch (err: any) {
      alert(err.message || 'Failed to save menu')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(menu: MenuData) {
    if (!confirm(`Delete menu "${menu.name}"?`)) return
    try {
      await api.deleteMenu(menu.project_id, menu.id)
      setMenus(menus.filter(m => m.id !== menu.id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete menu')
    }
  }

  const filteredMenus = menus.filter(m => {
    const matchesSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProject = !selectedProject || m.project_id === selectedProject
    return matchesSearch && matchesProject
  })

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown'
  }

  if (!user) return null

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Menus</h1>
            <p className="text-white/60 mt-1">Manage navigation menus for your projects</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-forma-500 hover:bg-forma-600 text-white rounded-xl font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Create Menu
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search menus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-forma-500"
            />
          </div>
          <div className="relative">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || null)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-forma-500 cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Menu list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-20">
            <List className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery || selectedProject ? 'No menus found' : 'No menus yet'}
            </h3>
            <p className="text-white/60 mb-6">
              {searchQuery || selectedProject
                ? 'Try adjusting your search or filter.'
                : 'Create your first navigation menu to get started.'}
            </p>
            {!searchQuery && !selectedProject && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-forma-500 hover:bg-forma-600 text-white rounded-xl font-medium transition"
              >
                <Plus className="w-4 h-4" />
                Create Menu
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMenus.map((menu) => (
              <motion.div
                key={menu.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <List className="w-5 h-5 text-forma-400 flex-shrink-0" />
                      <h3 className="text-white font-medium truncate">{menu.name}</h3>
                      <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full flex-shrink-0">
                        {menu.items?.length || 0} items
                      </span>
                    </div>
                    <div className="flex items-center gap-4 ml-8 text-xs text-white/40">
                      <span>/{menu.slug}</span>
                      <span>{getProjectName(menu.project_id)}</span>
                      {menu.description && <span className="truncate max-w-xs">{menu.description}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEditModal(menu)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(menu)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-forma-900 border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">
                  {editingMenu ? 'Edit Menu' : 'Create Menu'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Project selector (only for create) */}
                {!editingMenu && (
                  <div>
                    <label className="text-sm text-white/60 block mb-1.5">Project</label>
                    <select
                      value={modalProjectId}
                      onChange={(e) => {
                        setModalProjectId(e.target.value)
                        loadProjectPages(e.target.value)
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-forma-500"
                      style={{ colorScheme: 'dark' }}
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="text-sm text-white/60 block mb-1.5">Name</label>
                  <input
                    type="text"
                    value={menuName}
                    onChange={(e) => {
                      setMenuName(e.target.value)
                      if (!editingMenu) setMenuSlug(slugify(e.target.value))
                    }}
                    placeholder="Main Navigation"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-forma-500"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="text-sm text-white/60 block mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={menuSlug}
                    onChange={(e) => setMenuSlug(e.target.value)}
                    placeholder="main-navigation"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-forma-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-white/60 block mb-1.5">Description</label>
                  <input
                    type="text"
                    value={menuDescription}
                    onChange={(e) => setMenuDescription(e.target.value)}
                    placeholder="Primary site navigation"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-forma-500"
                  />
                </div>

                {/* Menu Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-white/60">Menu Items</label>
                    <button
                      onClick={addItem}
                      className="flex items-center gap-1 text-xs text-forma-400 hover:text-forma-300 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Item
                    </button>
                  </div>

                  {menuItems.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                      <p className="text-sm text-white/40">No items yet. Click "Add Item" to start.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {menuItems.map((item, index) => (
                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-white/30 flex-shrink-0" />
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => updateItem(index, { label: e.target.value })}
                              placeholder="Label"
                              className="flex-1 bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-forma-500"
                            />
                            <select
                              value={item.type}
                              onChange={(e) => updateItem(index, { type: e.target.value as 'page' | 'url' })}
                              className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-forma-500"
                              style={{ colorScheme: 'dark' }}
                            >
                              <option value="url">URL</option>
                              <option value="page">Page</option>
                            </select>
                            <button
                              onClick={() => removeItem(index)}
                              className="p-1.5 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 ml-6">
                            {item.type === 'url' ? (
                              <input
                                type="url"
                                value={item.url || ''}
                                onChange={(e) => updateItem(index, { url: e.target.value })}
                                placeholder="https://example.com"
                                className="flex-1 bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-forma-500"
                              />
                            ) : (
                              <select
                                value={item.page_slug || ''}
                                onChange={(e) => {
                                  const page = projectPages.find((p: any) => p.slug === e.target.value)
                                  updateItem(index, {
                                    page_slug: e.target.value,
                                    page_id: page?.id || undefined,
                                  })
                                }}
                                className="flex-1 bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:border-forma-500"
                                style={{ colorScheme: 'dark' }}
                              >
                                <option value="">Select a page...</option>
                                {projectPages.map((p: any) => (
                                  <option key={p.id} value={p.slug}>{p.name} (/{p.slug})</option>
                                ))}
                              </select>
                            )}
                            <label className="flex items-center gap-1.5 text-xs text-white/40 flex-shrink-0">
                              <input
                                type="checkbox"
                                checked={item.open_new_tab || false}
                                onChange={(e) => updateItem(index, { open_new_tab: e.target.checked })}
                                className="rounded border-white/20"
                              />
                              New tab
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !menuName.trim() || !modalProjectId}
                  className="px-5 py-2 bg-forma-500 hover:bg-forma-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
                >
                  {saving ? 'Saving...' : editingMenu ? 'Update Menu' : 'Create Menu'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
