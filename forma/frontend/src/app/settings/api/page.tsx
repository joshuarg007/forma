'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Key, Plus, Copy, Trash2, Eye, EyeOff, Clock, AlertCircle,
  Check, Shield, Code, ExternalLink, RefreshCw, X
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import AdminLayout from '@/components/AdminLayout'

interface APIKey {
  id: string
  name: string
  key: string
  lastUsed: string | null
  createdAt: string
  expiresAt: string | null
  permissions: string[]
}

export default function APIKeysPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'fma_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      lastUsed: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      expiresAt: null,
      permissions: ['read', 'write'],
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'fma_dev_yyyyyyyyyyyyyyyyyyyyyyyyyyyy',
      lastUsed: null,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      permissions: ['read'],
    },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showNewKey, setShowNewKey] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read'])
  const [newKeyExpiry, setNewKeyExpiry] = useState('never')
  const [creating, setCreating] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth')
    }
  }, [user, initialized, router])

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '••••••••••••••••••••••••'
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return

    setCreating(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newKey: APIKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `fma_${newKeyExpiry === 'never' ? 'prod' : 'dev'}_${Math.random().toString(36).substring(2)}`,
        lastUsed: null,
        createdAt: new Date().toISOString(),
        expiresAt: newKeyExpiry === 'never' ? null : new Date(Date.now() + parseInt(newKeyExpiry) * 86400000).toISOString(),
        permissions: newKeyPermissions,
      }

      setApiKeys(prev => [...prev, newKey])
      setShowNewKey(newKey.key)
      setShowCreateModal(false)
      setNewKeyName('')
      setNewKeyPermissions(['read'])
      setNewKeyExpiry('never')
    } catch (error) {
      console.error('Failed to create API key:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteKey = (id: string) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return
    setApiKeys(prev => prev.filter(k => k.id !== id))
  }

  const togglePermission = (permission: string) => {
    setNewKeyPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission)
      }
      return [...prev, permission]
    })
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
            <Key className="w-6 h-6 text-forma-400" />
            API Keys
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Manage your API keys for programmatic access
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition text-sm font-medium flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </button>
      </div>

      {/* New Key Alert */}
      <AnimatePresence>
        {showNewKey && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">API Key Created</h3>
                <p className="text-sm text-white/60 mb-3">
                  Copy your API key now. You won't be able to see it again!
                </p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-forma-950 border border-white/10">
                  <code className="flex-1 text-sm text-forma-400 font-mono">{showNewKey}</code>
                  <button
                    onClick={() => copyKey(showNewKey, 'new')}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
                  >
                    {copiedKey === 'new' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowNewKey(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Keys List */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden mb-6">
        {apiKeys.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative w-48 h-36 mx-auto mb-4">
              <Image
                src="/empty-states/empty-no-api-keys.webp"
                alt="FORMA AI-Powered React App Builder - No API Keys"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No API keys yet</h3>
            <p className="text-white/60 mb-4">Create your first API key to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create API Key
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="p-4 hover:bg-white/5 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forma-500/20 to-purple-500/20 flex items-center justify-center">
                      <Key className="w-6 h-6 text-forma-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{apiKey.name}</h3>
                        {apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date() && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                            Expired
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm text-white/40 font-mono">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition"
                        >
                          {visibleKeys.has(apiKey.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => copyKey(apiKey.key, apiKey.id)}
                          className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition"
                        >
                          {copiedKey === apiKey.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/60 capitalize"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>

                    <div className="text-right text-sm text-white/40 hidden sm:block">
                      <p>Created {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {apiKey.lastUsed
                          ? `Last used ${new Date(apiKey.lastUsed).toLocaleDateString()}`
                          : 'Never used'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Documentation */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-forma-400" />
          Quick Start
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-white/60 mb-2">Include your API key in the Authorization header:</p>
            <div className="p-4 rounded-xl bg-forma-950 border border-white/10 overflow-x-auto">
              <pre className="text-sm text-white/80 font-mono">
{`curl -X GET "https://api.forma.app/v1/projects" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <a
              href="#"
              className="text-sm text-forma-400 hover:text-forma-300 flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              View API Documentation
            </a>
            <a
              href="#"
              className="text-sm text-forma-400 hover:text-forma-300 flex items-center gap-1"
            >
              <Code className="w-4 h-4" />
              API Reference
            </a>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-white mb-1">Keep your API keys secure</h3>
            <p className="text-sm text-white/60">
              Never share your API keys in public repositories or client-side code. Use environment variables to store keys securely.
            </p>
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-forma-900 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Create API Key</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API Key"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Permissions</label>
                  <div className="flex gap-3">
                    {['read', 'write', 'delete'].map((perm) => (
                      <button
                        key={perm}
                        onClick={() => togglePermission(perm)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
                          newKeyPermissions.includes(perm)
                            ? 'bg-forma-500 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {perm}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Expiration</label>
                  <select
                    value={newKeyExpiry}
                    onChange={(e) => setNewKeyExpiry(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-forma-500 transition"
                  >
                    <option value="never" className="bg-zinc-900 text-white">Never expires</option>
                    <option value="30" className="bg-zinc-900 text-white">30 days</option>
                    <option value="60" className="bg-zinc-900 text-white">60 days</option>
                    <option value="90" className="bg-zinc-900 text-white">90 days</option>
                    <option value="365" className="bg-zinc-900 text-white">1 year</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim() || creating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Create Key
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
