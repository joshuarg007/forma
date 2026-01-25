'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, FileText, Trash2, Search, MoreVertical,
  Clock, Inbox, Eye, Edit2, Copy, Archive, Mail,
  Filter, ChevronDown, X, ExternalLink, CheckCircle,
  AlertCircle, XCircle, MessagesSquare
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import ConfirmDialog from '@/components/ConfirmDialog'
import api from '@/lib/api'

interface Form {
  id: string
  project_id: string
  name: string
  slug: string
  description: string | null
  status: 'draft' | 'published' | 'archived'
  fields: any[]
  submission_count: number
  last_submission_at: string | null
  created_at: string
  updated_at: string
}

interface Submission {
  id: string
  form_id: string
  data: Record<string, any>
  status: 'new' | 'read' | 'archived' | 'spam'
  ip_address: string | null
  page_url: string | null
  created_at: string
  read_at: string | null
}

export default function FormsPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()

  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Submissions modal
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [submissionsNewCount, setSubmissionsNewCount] = useState(0)

  // Selected submission detail
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formToDelete, setFormToDelete] = useState<Form | null>(null)
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
      fetchAllForms()
    }
  }, [user, fetchProjects])

  const fetchAllForms = async () => {
    setLoading(true)
    try {
      // Fetch forms for each project
      const projectsRes = await api.get('/api/projects')
      const allForms: Form[] = []

      for (const project of projectsRes.data.projects) {
        try {
          const formsRes = await api.get(`/api/forms/project/${project.id}`)
          allForms.push(...formsRes.data.forms.map((f: Form) => ({ ...f, project_id: project.id })))
        } catch (e) {
          // No forms for this project
        }
      }

      setForms(allForms)
    } catch (error) {
      console.error('Failed to fetch forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async (form: Form) => {
    setSelectedForm(form)
    setLoadingSubmissions(true)
    setSelectedSubmission(null)
    try {
      const res = await api.get(`/api/forms/${form.id}/submissions`)
      setSubmissions(res.data.submissions)
      setSubmissionsNewCount(res.data.new_count)
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const handleMarkRead = async (submission: Submission) => {
    try {
      await api.post(`/api/forms/${selectedForm?.id}/submissions/${submission.id}/mark-read`)
      setSubmissions(submissions.map(s =>
        s.id === submission.id ? { ...s, status: 'read' as const, read_at: new Date().toISOString() } : s
      ))
      setSubmissionsNewCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleArchiveSubmission = async (submission: Submission) => {
    try {
      await api.post(`/api/forms/${selectedForm?.id}/submissions/${submission.id}/archive`)
      setSubmissions(submissions.filter(s => s.id !== submission.id))
    } catch (error) {
      console.error('Failed to archive:', error)
    }
  }

  const handleMarkSpam = async (submission: Submission) => {
    try {
      await api.post(`/api/forms/${selectedForm?.id}/submissions/${submission.id}/spam`)
      setSubmissions(submissions.filter(s => s.id !== submission.id))
    } catch (error) {
      console.error('Failed to mark as spam:', error)
    }
  }

  const handleDeleteForm = async () => {
    if (!formToDelete) return
    setIsDeleting(true)
    try {
      await api.delete(`/api/forms/${formToDelete.id}`)
      setForms(forms.filter(f => f.id !== formToDelete.id))
      setDeleteDialogOpen(false)
      setFormToDelete(null)
    } catch (error) {
      console.error('Failed to delete form:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredForms = forms
    .filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesProject = !selectedProject || f.project_id === selectedProject
      return matchesSearch && matchesProject
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
            <CheckCircle className="w-3 h-3" /> Live
          </span>
        )
      case 'draft':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
            <AlertCircle className="w-3 h-3" /> Draft
          </span>
        )
      case 'archived':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/40 text-xs">
            <Archive className="w-3 h-3" /> Archived
          </span>
        )
      default:
        return null
    }
  }

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
            <MessagesSquare className="w-6 h-6 text-forma-400" />
            Forms & Submissions
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {forms.length} form{forms.length !== 1 ? 's' : ''} across all projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forms..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
          />
        </div>

        {/* Project Filter */}
        <select
          value={selectedProject || ''}
          onChange={(e) => setSelectedProject(e.target.value || null)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-forma-500 transition"
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Forms List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-white/40" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No forms yet</h3>
          <p className="text-white/60 mb-6">
            Forms will appear here when you add Contact Form or other form components to your pages.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-white/60">Form</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden md:table-cell">Project</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden sm:table-cell">Status</th>
                <th className="text-center p-4 text-sm font-medium text-white/60">Submissions</th>
                <th className="text-right p-4 text-sm font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredForms.map((form, i) => (
                <motion.tr
                  key={form.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/5 transition"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-forma-500/20 to-purple-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-forma-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{form.name}</p>
                        <p className="text-sm text-white/40">/{form.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-white/60">{getProjectName(form.project_id)}</span>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    {getStatusBadge(form.status)}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => fetchSubmissions(form)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-forma-500/20 hover:bg-forma-500/30 text-forma-400 transition"
                    >
                      <Inbox className="w-4 h-4" />
                      <span className="font-medium">{form.submission_count}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => fetchSubmissions(form)}
                        className="p-2 rounded-lg hover:bg-forma-500/20 text-forma-400 transition"
                        title="View Submissions"
                      >
                        <Inbox className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setFormToDelete(form)
                          setDeleteDialogOpen(true)
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                        title="Delete Form"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submissions Modal */}
      <AnimatePresence>
        {selectedForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl max-h-[90vh] bg-forma-900 rounded-2xl border border-white/10 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-forma-400" />
                    {selectedForm.name} Submissions
                  </h2>
                  <p className="text-sm text-white/60 mt-1">
                    {submissionsNewCount} new, {submissions.length} total
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedForm(null)
                    setSubmissions([])
                    setSelectedSubmission(null)
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden flex">
                {/* Submissions List */}
                <div className="w-1/2 border-r border-white/10 overflow-y-auto">
                  {loadingSubmissions ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin w-6 h-6 border-2 border-forma-500 border-t-transparent rounded-full" />
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-20">
                      <Inbox className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">No submissions yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {submissions.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => {
                            setSelectedSubmission(sub)
                            if (sub.status === 'new') {
                              handleMarkRead(sub)
                            }
                          }}
                          className={`p-4 cursor-pointer transition ${
                            selectedSubmission?.id === sub.id
                              ? 'bg-forma-500/20'
                              : 'hover:bg-white/5'
                          } ${sub.status === 'new' ? 'bg-forma-500/10' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {sub.status === 'new' && (
                                  <span className="w-2 h-2 rounded-full bg-forma-500" />
                                )}
                                <p className="font-medium text-white truncate">
                                  {sub.data.email || sub.data.name || 'Anonymous'}
                                </p>
                              </div>
                              <p className="text-sm text-white/40 truncate">
                                {Object.entries(sub.data)
                                  .filter(([k]) => k !== 'email' && k !== 'name' && !k.startsWith('_'))
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(', ')
                                  .slice(0, 100)}
                              </p>
                            </div>
                            <span className="text-xs text-white/40 whitespace-nowrap">
                              {new Date(sub.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submission Detail */}
                <div className="w-1/2 overflow-y-auto">
                  {selectedSubmission ? (
                    <div className="p-6">
                      {/* Actions */}
                      <div className="flex items-center gap-2 mb-6">
                        <button
                          onClick={() => handleArchiveSubmission(selectedSubmission)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition"
                        >
                          <Archive className="w-4 h-4" /> Archive
                        </button>
                        <button
                          onClick={() => handleMarkSpam(selectedSubmission)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition"
                        >
                          <XCircle className="w-4 h-4" /> Spam
                        </button>
                        {selectedSubmission.data.email && (
                          <a
                            href={`mailto:${selectedSubmission.data.email}`}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-forma-500/20 hover:bg-forma-500/30 text-forma-400 text-sm transition ml-auto"
                          >
                            <Mail className="w-4 h-4" /> Reply
                          </a>
                        )}
                      </div>

                      {/* Submission Data */}
                      <div className="space-y-4">
                        {Object.entries(selectedSubmission.data)
                          .filter(([k]) => !k.startsWith('_'))
                          .map(([key, value]) => (
                            <div key={key} className="bg-white/5 rounded-xl p-4">
                              <label className="block text-xs text-white/40 uppercase tracking-wide mb-1">
                                {key.replace(/_/g, ' ')}
                              </label>
                              <p className="text-white whitespace-pre-wrap">
                                {String(value)}
                              </p>
                            </div>
                          ))}
                      </div>

                      {/* Metadata */}
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <h4 className="text-sm font-medium text-white/60 mb-3">Submission Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-white/40">Submitted</span>
                            <span className="text-white">
                              {new Date(selectedSubmission.created_at).toLocaleString()}
                            </span>
                          </div>
                          {selectedSubmission.ip_address && (
                            <div className="flex items-center justify-between">
                              <span className="text-white/40">IP Address</span>
                              <span className="text-white">{selectedSubmission.ip_address}</span>
                            </div>
                          )}
                          {selectedSubmission.page_url && (
                            <div className="flex items-center justify-between">
                              <span className="text-white/40">Page</span>
                              <span className="text-white truncate max-w-[200px]">{selectedSubmission.page_url}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/40">
                      Select a submission to view details
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setFormToDelete(null)
        }}
        onConfirm={handleDeleteForm}
        title="Delete Form"
        description={`Are you sure you want to delete "${formToDelete?.name}"? This will permanently delete all ${formToDelete?.submission_count || 0} submissions.`}
        confirmText="Delete Form"
        cancelText="Keep Form"
        variant="danger"
        isLoading={isDeleting}
      />
    </AdminLayout>
  )
}
