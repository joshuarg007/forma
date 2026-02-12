'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Search, Image, Film, FileText, Music,
  FolderPlus, Folder, Grid, List, Upload, X, ChevronDown,
  Eye, Copy, Download, MoreVertical, HardDrive
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import { api } from '@/lib/api'

const mediaTypeIcons: Record<string, any> = {
  image: Image,
  video: Film,
  audio: Music,
  document: FileText,
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()

  const [files, setFiles] = useState<any[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<string>('')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => { checkAuth() }, [checkAuth])
  useEffect(() => {
    if (initialized && !user) router.push('/auth')
  }, [user, initialized, router])
  useEffect(() => {
    if (user) fetchProjects()
  }, [user, fetchProjects])
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id)
    }
  }, [projects, selectedProject])

  useEffect(() => {
    if (selectedProject) loadMedia()
  }, [selectedProject, currentFolder, filterType, searchQuery])

  async function loadMedia() {
    setLoading(true)
    try {
      const [filesRes, foldersRes, statsRes] = await Promise.all([
        api.getMediaFiles(selectedProject, {
          folder_id: currentFolder || undefined,
          media_type: filterType || undefined,
          search: searchQuery || undefined,
        }),
        api.getMediaFolders(selectedProject, currentFolder || undefined),
        api.getMediaStats(selectedProject),
      ])
      setFiles(filesRes.files || filesRes || [])
      setFolders(foldersRes.folders || foldersRes || [])
      setStats(statsRes)
    } catch {
      setFiles([])
      setFolders([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(fileId: string) {
    if (!confirm('Delete this file?')) return
    try {
      await api.deleteMediaFile(selectedProject, fileId)
      setFiles(files.filter(f => f.id !== fileId))
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
    }
  }

  async function handleCreateFolder() {
    const name = prompt('Folder name:')
    if (!name) return
    try {
      await api.createMediaFolder(selectedProject, { name, parent_id: currentFolder || undefined })
      loadMedia()
    } catch (err: any) {
      alert(err.message || 'Failed to create folder')
    }
  }

  if (!user) return null

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Media Library</h1>
            <p className="text-white/60 mt-1">
              Manage images, videos, and files across your projects
              {stats && <span className="ml-2 text-white/40">({stats.total_files || 0} files, {formatFileSize(stats.total_size || 0)})</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateFolder}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 bg-forma-500 hover:bg-forma-600 text-white rounded-xl font-medium transition"
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-forma-500"
            />
          </div>
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => { setSelectedProject(e.target.value); setCurrentFolder(null) }}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-forma-500"
              style={{ colorScheme: 'dark' }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-forma-500"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition ${viewMode === 'grid' ? 'bg-forma-500/20 text-forma-400' : 'text-white/40 hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition ${viewMode === 'list' ? 'bg-forma-500/20 text-forma-400' : 'text-white/40 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        {currentFolder && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <button onClick={() => setCurrentFolder(null)} className="text-forma-400 hover:text-forma-300 transition">
              Media
            </button>
            <span className="text-white/30">/</span>
            <span className="text-white/60">Folder</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : folders.length === 0 && files.length === 0 ? (
          <div className="text-center py-20">
            <HardDrive className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No media files yet</h3>
            <p className="text-white/60 mb-6">Upload images, videos, and documents to your media library.</p>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-forma-500 hover:bg-forma-600 text-white rounded-xl font-medium transition">
              <Upload className="w-4 h-4" />
              Upload Files
            </button>
          </div>
        ) : (
          <>
            {/* Folders */}
            {folders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-white/40 mb-3">Folders</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {folders.map((folder: any) => (
                    <button
                      key={folder.id}
                      onClick={() => setCurrentFolder(folder.id)}
                      className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition"
                    >
                      <Folder className="w-10 h-10 text-forma-400" />
                      <span className="text-sm text-white truncate w-full text-center">{folder.name}</span>
                      <span className="text-xs text-white/40">{folder.file_count || 0} files</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {files.length > 0 && (
              <div>
                <h3 className="text-sm text-white/40 mb-3">Files</h3>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {files.map((file: any) => {
                      const TypeIcon = mediaTypeIcons[file.media_type] || FileText
                      return (
                        <div key={file.id} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition">
                          <div className="aspect-square bg-white/5 flex items-center justify-center relative">
                            {file.media_type === 'image' && file.url ? (
                              <img src={file.url} alt={file.alt_text || file.filename} className="w-full h-full object-cover" />
                            ) : (
                              <TypeIcon className="w-12 h-12 text-white/20" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                              <button className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(file.id)}
                                className="p-2 rounded-lg bg-red-500/40 text-white hover:bg-red-500/60 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-sm text-white truncate">{file.filename}</p>
                            <p className="text-xs text-white/40 mt-1">{formatFileSize(file.file_size || 0)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file: any) => {
                      const TypeIcon = mediaTypeIcons[file.media_type] || FileText
                      return (
                        <div key={file.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-3 hover:border-white/20 transition group">
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {file.media_type === 'image' && file.url ? (
                              <img src={file.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <TypeIcon className="w-6 h-6 text-white/30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{file.filename}</p>
                            <p className="text-xs text-white/40">{file.media_type} &middot; {formatFileSize(file.file_size || 0)}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
