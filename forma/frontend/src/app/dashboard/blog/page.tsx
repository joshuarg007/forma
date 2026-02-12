'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus, Trash2, Search, PenSquare, Edit2, Eye, Clock, CheckCircle,
  FileText, ChevronDown, Tag, X, Archive
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import { api } from '@/lib/api'

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-500/20 text-yellow-400',
  published: 'bg-green-500/20 text-green-400',
  archived: 'bg-white/10 text-white/40',
}

const statusIcons: Record<string, any> = {
  draft: Clock,
  published: CheckCircle,
  archived: Archive,
}

export default function BlogPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()

  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')

  useEffect(() => { checkAuth() }, [checkAuth])
  useEffect(() => {
    if (initialized && !user) router.push('/auth')
  }, [user, initialized, router])
  useEffect(() => {
    if (user) fetchProjects()
  }, [user, fetchProjects])
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) setSelectedProject(projects[0].id)
  }, [projects, selectedProject])

  useEffect(() => {
    if (selectedProject) loadPosts()
  }, [selectedProject, filterStatus, filterCategory, searchQuery])

  useEffect(() => {
    if (selectedProject) loadCategories()
  }, [selectedProject])

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await api.getBlogPosts(selectedProject, {
        status: filterStatus || undefined,
        category_id: filterCategory || undefined,
        search: searchQuery || undefined,
      })
      setPosts(res.posts || res || [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const res = await api.getBlogCategories(selectedProject)
      setCategories(res.categories || res || [])
    } catch {
      setCategories([])
    }
  }

  async function handleCreatePost() {
    try {
      const post = await api.createBlogPost(selectedProject, {
        title: 'Untitled Post',
        slug: `untitled-${Date.now()}`,
        status: 'draft',
        content: '',
      })
      loadPosts()
    } catch (err: any) {
      alert(err.message || 'Failed to create post')
    }
  }

  async function handleDeletePost(postId: string) {
    if (!confirm('Delete this post?')) return
    try {
      await api.deleteBlogPost(selectedProject, postId)
      setPosts(posts.filter(p => p.id !== postId))
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
    }
  }

  async function handleToggleStatus(post: any) {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    try {
      await api.updateBlogPost(selectedProject, post.id, { status: newStatus })
      loadPosts()
    } catch (err: any) {
      alert(err.message || 'Failed to update')
    }
  }

  if (!user) return null

  const counts = {
    all: posts.length,
    draft: posts.filter(p => p.status === 'draft').length,
    published: posts.filter(p => p.status === 'published').length,
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Blog</h1>
            <p className="text-white/60 mt-1">Create and manage blog posts for your projects</p>
          </div>
          <button
            onClick={handleCreatePost}
            className="flex items-center gap-2 px-4 py-2.5 bg-forma-500 hover:bg-forma-600 text-white rounded-xl font-medium transition"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Posts', value: counts.all, color: 'from-forma-500/20 to-purple-500/20 border-forma-500/30' },
            { label: 'Published', value: counts.published, color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
            { label: 'Drafts', value: counts.draft, color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' },
          ].map((stat) => (
            <div key={stat.label} className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} border`}>
              <p className="text-xs text-white/60 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-forma-500"
            />
          </div>
          <div className="relative">
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-forma-500" style={{ colorScheme: 'dark' }}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-forma-500" style={{ colorScheme: 'dark' }}>
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <PenSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No blog posts yet</h3>
            <p className="text-white/60 mb-6">Start writing your first blog post.</p>
            <button onClick={handleCreatePost} className="inline-flex items-center gap-2 px-4 py-2.5 bg-forma-500 hover:bg-forma-600 text-white rounded-xl font-medium transition">
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post: any) => {
              const StatusIcon = statusIcons[post.status] || Clock
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-medium truncate">{post.title || 'Untitled'}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${statusColors[post.status] || statusColors.draft}`}>
                        <StatusIcon className="w-3 h-3" />
                        {post.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>/{post.slug}</span>
                      {post.category_name && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{post.category_name}</span>}
                      {post.reading_time && <span>{post.reading_time} min read</span>}
                      {post.created_at && <span>{new Date(post.created_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleToggleStatus(post)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
                      title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                      {post.status === 'published' ? <Archive className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
