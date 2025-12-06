'use client'

import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import {
  FileText,
  Plus,
  MoreVertical,
  Home,
  Trash2,
  Copy,
  Edit2,
  GripVertical,
  ChevronRight,
  Globe,
  Layout,
  Component,
} from 'lucide-react'
import type { Page } from '@/types'

interface PagesSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export default function PagesSidebar({ collapsed = false, onToggle }: PagesSidebarProps) {
  const {
    pages,
    currentPage,
    selectPage,
    createPage,
    updatePage,
    deletePage,
    duplicatePage,
  } = useProjectStore()

  const [showNewPageModal, setShowNewPageModal] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [newPageData, setNewPageData] = useState({ name: '', slug: '' })

  const handleCreatePage = async () => {
    if (!newPageData.name || !newPageData.slug) return

    try {
      const page = await createPage({
        name: newPageData.name,
        slug: newPageData.slug.toLowerCase().replace(/\s+/g, '-'),
      })
      setShowNewPageModal(false)
      setNewPageData({ name: '', slug: '' })
      selectPage(page.id)
    } catch (error) {
      console.error('Failed to create page:', error)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (pages.length <= 1) {
      alert('Cannot delete the last page')
      return
    }
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      await deletePage(pageId)
      setMenuOpenId(null)
    } catch (error) {
      console.error('Failed to delete page:', error)
    }
  }

  const handleDuplicatePage = async (pageId: string) => {
    try {
      const newPage = await duplicatePage(pageId)
      setMenuOpenId(null)
      selectPage(newPage.id)
    } catch (error) {
      console.error('Failed to duplicate page:', error)
    }
  }

  const handleSetHomepage = async (pageId: string) => {
    try {
      await updatePage(pageId, { is_homepage: true })
      setMenuOpenId(null)
    } catch (error) {
      console.error('Failed to set homepage:', error)
    }
  }

  const getPageIcon = (page: Page) => {
    if (page.page_type === 'layout') return <Layout className="w-4 h-4" />
    if (page.page_type === 'component') return <Component className="w-4 h-4" />
    if (page.is_homepage) return <Home className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  if (collapsed) {
    return (
      <div className="w-12 bg-[#1a1d24] border-r border-white/10 flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
          title="Expand pages"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="mt-4 space-y-2">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => selectPage(page.id)}
              className={`p-2 rounded-lg transition ${
                currentPage?.id === page.id
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
              title={page.name}
            >
              {getPageIcon(page)}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-56 bg-[#1a1d24] border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-sm font-medium text-white">Pages</span>
        <button
          onClick={() => setShowNewPageModal(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
          title="Add page"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Page List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition ${
              currentPage?.id === page.id
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => selectPage(page.id)}
          >
            <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-50 cursor-grab" />
            {getPageIcon(page)}
            <span className="flex-1 text-sm truncate">{page.name}</span>
            {page.is_homepage && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                Home
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpenId(menuOpenId === page.id ? null : page.id)
              }}
              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {menuOpenId === page.id && (
              <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-[#252830] rounded-lg border border-white/10 shadow-xl py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingPage(page)
                    setMenuOpenId(null)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDuplicatePage(page.id)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>
                {!page.is_homepage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetHomepage(page.id)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                  >
                    <Home className="w-3.5 h-3.5" />
                    Set as Home
                  </button>
                )}
                <hr className="my-1 border-white/10" />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePage(page.id)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  disabled={pages.length <= 1}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Page Info */}
      {currentPage && (
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Globe className="w-3 h-3" />
            <span className="truncate">/{currentPage.slug}</span>
          </div>
        </div>
      )}

      {/* New Page Modal */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1d24] rounded-xl w-full max-w-md border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Page</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Page Name</label>
                <input
                  type="text"
                  value={newPageData.name}
                  onChange={(e) => {
                    setNewPageData({
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }}
                  placeholder="About Us"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">/</span>
                  <input
                    type="text"
                    value={newPageData.slug}
                    onChange={(e) =>
                      setNewPageData({ ...newPageData, slug: e.target.value })
                    }
                    placeholder="about-us"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewPageModal(false)
                  setNewPageData({ name: '', slug: '' })
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                disabled={!newPageData.name || !newPageData.slug}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1d24] rounded-xl w-full max-w-md border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Rename Page</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Page Name</label>
                <input
                  type="text"
                  defaultValue={editingPage.name}
                  id="rename-input"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingPage(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const input = document.getElementById('rename-input') as HTMLInputElement
                  if (input?.value) {
                    await updatePage(editingPage.id, { name: input.value })
                    setEditingPage(null)
                  }
                }}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {menuOpenId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpenId(null)}
        />
      )}
    </div>
  )
}
