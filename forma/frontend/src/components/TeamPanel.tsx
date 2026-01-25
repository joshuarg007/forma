'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Mail, X, Crown, Shield, Edit3, Eye,
  MoreVertical, Trash2, Clock, Check, AlertCircle, Copy
} from 'lucide-react'
import { api } from '@/lib/api'

interface Member {
  id: string
  user_id: string
  email: string
  name: string | null
  role: string
  avatar_url: string | null
  joined_at: string | null
}

interface Invite {
  id: string
  email: string
  role: string
  status: string
  invited_by_name: string | null
  created_at: string
  expires_at: string
}

interface TeamPanelProps {
  projectId: string
  isOwner: boolean
  onClose: () => void
}

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Crown className="w-4 h-4 text-yellow-400" />,
  admin: <Shield className="w-4 h-4 text-blue-400" />,
  editor: <Edit3 className="w-4 h-4 text-green-400" />,
  viewer: <Eye className="w-4 h-4 text-gray-400" />,
}

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
}

export default function TeamPanel({ projectId, isOwner, onClose }: TeamPanelProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    loadTeamData()
  }, [projectId])

  const loadTeamData = async () => {
    setLoading(true)
    try {
      const [membersRes, invitesRes] = await Promise.all([
        api.get<Member[]>(`/api/projects/${projectId}/team/members`),
        api.get<Invite[]>(`/api/projects/${projectId}/team/invites`),
      ])
      setMembers(membersRes)
      setInvites(invitesRes)
    } catch (err) {
      console.error('Failed to load team data:', err)
      setError('Failed to load team data')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviting(true)
    setError('')
    try {
      await api.post(`/api/projects/${projectId}/team/invite`, {
        email: inviteEmail,
        role: inviteRole,
        message: inviteMessage || undefined,
      })
      setSuccess(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      setInviteMessage('')
      setShowInviteForm(false)
      loadTeamData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await api.post(`/api/projects/${projectId}/team/members/${memberId}`, {}, 'DELETE')
      loadTeamData()
      setSuccess('Member removed')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to remove member')
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await api.post(`/api/projects/${projectId}/team/invites/${inviteId}`, {}, 'DELETE')
      loadTeamData()
    } catch (err: any) {
      setError(err.message || 'Failed to cancel invitation')
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await api.post(`/api/projects/${projectId}/team/members/${memberId}`, {
        role: newRole,
      }, 'PUT')
      loadTeamData()
    } catch (err: any) {
      setError(err.message || 'Failed to update role')
    }
  }

  const copyInviteLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invites/accept/${token}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-forma-900 rounded-2xl border border-white/10 w-full max-w-lg max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forma-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-forma-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Team</h2>
              <p className="text-sm text-white/60">{members.length} members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
                <button onClick={() => setError('')} className="ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-400"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Invite Button */}
          {isOwner && !showInviteForm && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="w-full mb-4 p-3 rounded-xl border border-dashed border-white/20 hover:border-forma-500 text-white/60 hover:text-forma-400 flex items-center justify-center gap-2 transition"
            >
              <UserPlus className="w-5 h-5" />
              Invite Team Member
            </button>
          )}

          {/* Invite Form */}
          <AnimatePresence>
            {showInviteForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleInvite}
                className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">Invite Member</h3>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="text-white/40 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Email</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-forma-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-1">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:border-forma-500 focus:outline-none"
                    >
                      <option value="admin" className="bg-zinc-900 text-white">Admin - Full access</option>
                      <option value="editor" className="bg-zinc-900 text-white">Editor - Edit components</option>
                      <option value="viewer" className="bg-zinc-900 text-white">Viewer - View only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-1">Message (optional)</label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder="Add a personal message..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-forma-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inviting || !inviteEmail}
                    className="w-full py-2 rounded-lg bg-forma-500 hover:bg-forma-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {inviting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Members List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-forma-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-white/60 mb-2">Members</h3>
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-forma-500/20 flex items-center justify-center overflow-hidden">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-forma-400 font-medium">
                        {(member.name || member.email)[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">
                        {member.name || member.email.split('@')[0]}
                      </span>
                      {roleIcons[member.role]}
                    </div>
                    <span className="text-sm text-white/40 truncate block">{member.email}</span>
                  </div>

                  {/* Role badge */}
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                    {roleLabels[member.role]}
                  </span>

                  {/* Actions */}
                  {isOwner && member.role !== 'owner' && (
                    <div className="relative group">
                      <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 py-1 bg-forma-800 rounded-lg border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition z-10 min-w-[120px]">
                        <button
                          onClick={() => handleUpdateRole(member.id, 'admin')}
                          className="w-full px-3 py-1.5 text-left text-sm text-white/80 hover:bg-white/10"
                        >
                          Make Admin
                        </button>
                        <button
                          onClick={() => handleUpdateRole(member.id, 'editor')}
                          className="w-full px-3 py-1.5 text-left text-sm text-white/80 hover:bg-white/10"
                        >
                          Make Editor
                        </button>
                        <button
                          onClick={() => handleUpdateRole(member.id, 'viewer')}
                          className="w-full px-3 py-1.5 text-left text-sm text-white/80 hover:bg-white/10"
                        >
                          Make Viewer
                        </button>
                        <hr className="my-1 border-white/10" />
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-red-500/10"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-white/60 mb-2">Pending Invites</h3>
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium truncate block">{invite.email}</span>
                    <span className="text-sm text-white/40">
                      {roleLabels[invite.role]} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Cancel invite"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
