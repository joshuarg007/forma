'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus, Trash2, Search, Plug, ChevronDown, CheckCircle, XCircle,
  Zap, MessageSquare, Globe, Bell, RefreshCw, Settings, ToggleLeft, ToggleRight
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import { api } from '@/lib/api'

const integrationIcons: Record<string, { icon: any; color: string }> = {
  slack: { icon: MessageSquare, color: 'text-[#4A154B]' },
  discord: { icon: MessageSquare, color: 'text-[#5865F2]' },
  zapier: { icon: Zap, color: 'text-[#FF4A00]' },
  webhook: { icon: Globe, color: 'text-forma-400' },
}

export default function IntegrationsPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()

  const [integrations, setIntegrations] = useState<any[]>([])
  const [integrationTypes, setIntegrationTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)

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
    if (selectedProject) loadIntegrations()
  }, [selectedProject])

  async function loadIntegrations() {
    setLoading(true)
    try {
      const [intRes, typesRes] = await Promise.all([
        api.getIntegrations(selectedProject),
        api.getIntegrationTypes(selectedProject),
      ])
      setIntegrations(intRes.integrations || intRes || [])
      setIntegrationTypes(typesRes.types || typesRes || [])
    } catch {
      setIntegrations([])
      setIntegrationTypes([])
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(integration: any) {
    try {
      await api.toggleIntegration(selectedProject, integration.id, !integration.enabled)
      loadIntegrations()
    } catch (err: any) {
      alert(err.message || 'Failed to toggle')
    }
  }

  async function handleTest(integrationId: string) {
    try {
      const result = await api.testIntegration(selectedProject, integrationId)
      alert(result.success ? 'Connection successful!' : `Test failed: ${result.error || 'Unknown error'}`)
    } catch (err: any) {
      alert(err.message || 'Test failed')
    }
  }

  async function handleDelete(integrationId: string) {
    if (!confirm('Remove this integration?')) return
    try {
      await api.deleteIntegration(selectedProject, integrationId)
      setIntegrations(integrations.filter(i => i.id !== integrationId))
    } catch (err: any) {
      alert(err.message || 'Failed to remove')
    }
  }

  async function handleAddIntegration(type: string) {
    try {
      await api.createIntegration(selectedProject, {
        type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Integration`,
        config: {},
      })
      setShowAddModal(false)
      loadIntegrations()
    } catch (err: any) {
      alert(err.message || 'Failed to add integration')
    }
  }

  if (!user) return null

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Integrations</h1>
            <p className="text-white/60 mt-1">Connect third-party services to your projects</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-forma-500" style={{ colorScheme: 'dark' }}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-forma-500 hover:bg-forma-600 text-white rounded-xl font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Add Integration
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : integrations.length === 0 ? (
          <div className="text-center py-20">
            <Plug className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No integrations yet</h3>
            <p className="text-white/60 mb-6">Connect Slack, Discord, Zapier, webhooks, and more.</p>
            <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-forma-500 hover:bg-forma-600 text-white rounded-xl font-medium transition">
              <Plus className="w-4 h-4" />
              Add Integration
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {integrations.map((integration: any) => {
              const typeInfo = integrationIcons[integration.type] || { icon: Plug, color: 'text-white/40' }
              const TypeIcon = typeInfo.icon
              return (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center`}>
                        <TypeIcon className={`w-6 h-6 ${typeInfo.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium">{integration.name}</h3>
                          {integration.enabled ? (
                            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" />Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" />Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">{integration.type} &middot; {integration.last_triggered_at ? `Last triggered ${new Date(integration.last_triggered_at).toLocaleDateString()}` : 'Never triggered'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleTest(integration.id)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition" title="Test connection">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggle(integration)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition" title={integration.enabled ? 'Disable' : 'Enable'}>
                        {integration.enabled ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button onClick={() => handleDelete(integration.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition" title="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <>
          <div onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-forma-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Add Integration</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid gap-3">
              {[
                { type: 'slack', name: 'Slack', desc: 'Send notifications to Slack channels' },
                { type: 'discord', name: 'Discord', desc: 'Post updates to Discord servers' },
                { type: 'zapier', name: 'Zapier', desc: 'Connect to 5,000+ apps via Zapier' },
                { type: 'webhook', name: 'Custom Webhook', desc: 'Send events to any URL endpoint' },
              ].map((item) => {
                const typeInfo = integrationIcons[item.type] || { icon: Plug, color: 'text-white/40' }
                const TypeIcon = typeInfo.icon
                return (
                  <button
                    key={item.type}
                    onClick={() => handleAddIntegration(item.type)}
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-forma-500/50 hover:bg-white/10 transition text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{item.name}</h3>
                      <p className="text-xs text-white/40">{item.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AdminLayout>
  )
}
