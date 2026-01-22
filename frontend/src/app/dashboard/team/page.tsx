'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, Plus, MoreVertical, Mail, Shield, Trash2,
  Clock, ChevronDown, X, UserPlus, Crown, Edit2, Check, AlertCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import { api } from '@/lib/api'

interface TeamMember {
  id: string
  user_id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  avatar?: string
  joined_at: string
}

interface Invite {
  id: string
  email: string
  role: string
  created_at: string
  expires_at: string
}

const roleColors = {
  owner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  editor: 'bg-forma-500/20 text-forma-400 border-forma-500/30',
  viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const roleIcons = {
  owner: <Crown className="w-3 h-3" />,
  admin: <Shield className="w-3 h-3" />,
  editor: <Edit2 className="w-3 h-3" />,
  viewer: <Users className="w-3 h-3" />,
}

export default function TeamPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()

  const [selectedProject, setSelectedProject] = useState<string>('')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
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
    }
  }, [user, fetchProjects])

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id)
    }
  }, [projects, selectedProject])

  useEffect(() => {
    if (selectedProject) {
      loadTeamData()
    }
  }, [selectedProject])

  const loadTeamData = async () => {
    if (!selectedProject) return
    setLoading(true)
    try {
      const [membersData, invitesData] = await Promise.all([
        api.getTeamMembers(selectedProject),
        api.getTeamInvites(selectedProject),
      ])
      setMembers(membersData)
      setInvites(invitesData)
    } catch (error) {
      console.error('Failed to load team data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setError('')
    setInviting(true)

    try {
      await api.inviteTeamMember(selectedProject, inviteEmail, inviteRole, inviteMessage || undefined)
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('editor')
      setInviteMessage('')
      loadTeamData()
    } catch (error: any) {
      setError(error.message || 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this team member?')) return

    try {
      await api.removeMember(selectedProject, memberId)
      setMembers(prev => prev.filter(m => m.id !== memberId))
      setActiveMenu(null)
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await api.cancelInvite(selectedProject, inviteId)
      setInvites(prev => prev.filter(i => i.id !== inviteId))
    } catch (error) {
      console.error('Failed to cancel invite:', error)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await api.updateMemberRole(selectedProject, memberId, newRole)
      setMembers(prev =>
        prev.map(m => (m.id === memberId ? { ...m, role: newRole as any } : m))
      )
      setActiveMenu(null)
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const filteredMembers = members.filter(
    m =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Users className="w-6 h-6 text-forma-400" />
            Team
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Manage team members and permissions
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          disabled={!selectedProject}
          className="px-4 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition text-sm font-medium flex items-center gap-2 w-fit disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Project Selector */}
      <div className="mb-6">
        <label className="block text-sm text-white/60 mb-2">Select Project</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-forma-500 transition"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id} className="bg-forma-900">
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search team members..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
        />
      </div>

      {/* Team Members */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Members List */}
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-white">
                Team Members ({filteredMembers.length})
              </h2>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No team members yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-forma-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {member.name?.[0] || member.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{member.name || 'No name'}</p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs border flex items-center gap-1 ${roleColors[member.role]}`}
                          >
                            {roleIcons[member.role]}
                            {member.role}
                          </span>
                        </div>
                        <p className="text-sm text-white/40">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/40 hidden sm:block">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </span>

                      {member.role !== 'owner' && (
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === member.id ? null : member.id)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          <AnimatePresence>
                            {activeMenu === member.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-forma-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-10"
                              >
                                <div className="p-2">
                                  <p className="text-xs text-white/40 px-2 py-1">Change Role</p>
                                  {(['admin', 'editor', 'viewer'] as const).map((role) => (
                                    <button
                                      key={role}
                                      onClick={() => handleUpdateRole(member.id, role)}
                                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                                        member.role === role
                                          ? 'bg-forma-500/20 text-forma-400'
                                          : 'text-white/80 hover:bg-white/5'
                                      }`}
                                    >
                                      <span className="capitalize">{role}</span>
                                      {member.role === role && <Check className="w-4 h-4" />}
                                    </button>
                                  ))}
                                </div>
                                <hr className="border-white/10" />
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
                                >
                                  <Trash2 className="w-4 h-4" /> Remove
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-forma-400" />
                  Pending Invites ({invites.length})
                </h2>
              </div>

              <div className="divide-y divide-white/5">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{invite.email}</p>
                        <p className="text-sm text-white/40">
                          Invited as {invite.role} • Expires{' '}
                          {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-forma-900 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Invite Team Member</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-forma-500 transition"
                  >
                    <option value="admin" className="bg-forma-900">Admin - Full access</option>
                    <option value="editor" className="bg-forma-900">Editor - Can edit</option>
                    <option value="viewer" className="bg-forma-900">Viewer - Read only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Message (optional)</label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || inviting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {inviting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Invite
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
