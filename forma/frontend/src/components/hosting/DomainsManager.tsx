'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Star,
  StarOff,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface CustomDomain {
  id: string
  domain: string
  status: 'pending_validation' | 'validating' | 'active' | 'failed' | 'expired'
  dns_record_type: string
  dns_record_name: string
  dns_record_value: string
  dns_verified_at: string | null
  ssl_status: string
  ssl_expires_at: string | null
  is_primary: boolean
  created_at: string
}

interface DomainsManagerProps {
  projectId: string
  subdomain?: string
}

const STATUS_CONFIG = {
  pending_validation: {
    label: 'Pending',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    icon: Clock,
  },
  validating: {
    label: 'Verifying...',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    icon: Loader2,
  },
  active: {
    label: 'Active',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    icon: XCircle,
  },
  expired: {
    label: 'Expired',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    icon: AlertCircle,
  },
}

const SSL_STATUS_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  pending: { label: 'Pending', icon: Shield, color: 'text-yellow-400' },
  active: { label: 'Secured', icon: ShieldCheck, color: 'text-green-400' },
  expired: { label: 'Expired', icon: ShieldAlert, color: 'text-red-400' },
}

export function DomainsManager({ projectId, subdomain }: DomainsManagerProps) {
  const toast = useToast()
  const [domains, setDomains] = useState<CustomDomain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Load domains
  const loadDomains = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/domains`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setDomains(data.domains)
      }
    } catch (error) {
      console.error('Failed to load domains:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadDomains()
  }, [loadDomains])

  // Add domain
  const handleAddDomain = async () => {
    if (!newDomain.trim()) return

    setIsAdding(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ domain: newDomain.toLowerCase().trim() }),
      })

      if (response.ok) {
        const domain = await response.json()
        setDomains((prev) => [...prev, domain])
        setNewDomain('')
        setShowAddModal(false)
        toast.success('Domain added', 'Configure your DNS records to connect it.')
      } else {
        const error = await response.json()
        toast.error('Failed to add domain', error.detail || 'Please try again.')
      }
    } catch (error) {
      toast.error('Error', 'Failed to add domain')
    } finally {
      setIsAdding(false)
    }
  }

  // Verify domain
  const handleVerify = async (domainId: string) => {
    setVerifyingId(domainId)
    try {
      const response = await fetch(`/api/projects/${projectId}/domains/${domainId}/verify`, {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        const updated = await response.json()
        setDomains((prev) => prev.map((d) => (d.id === domainId ? updated : d)))

        if (updated.status === 'active') {
          toast.success('Domain verified!', 'Your domain is now connected.')
        } else {
          toast.warning('DNS not ready', 'Please check your DNS settings and try again.')
        }
      } else {
        toast.error('Verification failed', 'Please try again later.')
      }
    } catch (error) {
      toast.error('Error', 'Failed to verify domain')
    } finally {
      setVerifyingId(null)
    }
  }

  // Delete domain
  const handleDelete = async (domainId: string) => {
    if (!confirm('Are you sure you want to remove this domain?')) return

    setDeletingId(domainId)
    try {
      const response = await fetch(`/api/projects/${projectId}/domains/${domainId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setDomains((prev) => prev.filter((d) => d.id !== domainId))
        toast.success('Domain removed')
      } else {
        toast.error('Failed to remove domain')
      }
    } catch (error) {
      toast.error('Error', 'Failed to remove domain')
    } finally {
      setDeletingId(null)
    }
  }

  // Set primary domain
  const handleSetPrimary = async (domainId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/domains/${domainId}/primary`, {
        method: 'PUT',
        credentials: 'include',
      })

      if (response.ok) {
        setDomains((prev) =>
          prev.map((d) => ({
            ...d,
            is_primary: d.id === domainId,
          }))
        )
        toast.success('Primary domain updated')
      }
    } catch (error) {
      toast.error('Error', 'Failed to update primary domain')
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedField(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Custom Domains</h3>
          <p className="text-sm text-zinc-400">
            Connect your own domain to your app
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Domain
        </button>
      </div>

      {/* Default subdomain */}
      {subdomain && (
        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Globe className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {subdomain}.forma.app
                </p>
                <p className="text-xs text-zinc-500">Default subdomain (always active)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded">
                Active
              </span>
              <a
                href={`https://${subdomain}.forma.app`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Custom domains list */}
      {domains.length === 0 ? (
        <div className="text-center py-12 bg-zinc-800/30 rounded-xl border border-zinc-700/50 border-dashed">
          <Globe className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-zinc-300 mb-2">No custom domains</h4>
          <p className="text-sm text-zinc-500 mb-4">
            Add your own domain to give your app a professional look
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Domain
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => {
            const status = STATUS_CONFIG[domain.status]
            const StatusIcon = status.icon
            const sslConfig = SSL_STATUS_CONFIG[domain.ssl_status] || SSL_STATUS_CONFIG.pending
            const SslIcon = sslConfig.icon

            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${status.bg}`}>
                      <Globe className={`w-5 h-5 ${status.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{domain.domain}</p>
                        {domain.is_primary && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-violet-500/20 text-violet-400 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`flex items-center gap-1 text-xs ${status.color}`}>
                          <StatusIcon className={`w-3 h-3 ${domain.status === 'validating' ? 'animate-spin' : ''}`} />
                          {status.label}
                        </span>
                        {domain.status === 'active' && (
                          <span className={`flex items-center gap-1 text-xs ${sslConfig.color}`}>
                            <SslIcon className="w-3 h-3" />
                            SSL {sslConfig.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {domain.status === 'active' && (
                      <>
                        <a
                          href={`https://${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                          title="Visit site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {!domain.is_primary && (
                          <button
                            onClick={() => handleSetPrimary(domain.id)}
                            className="p-2 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-700 rounded-lg transition-colors"
                            title="Set as primary"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    {domain.status !== 'active' && (
                      <button
                        onClick={() => handleVerify(domain.id)}
                        disabled={verifyingId === domain.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {verifyingId === domain.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(domain.id)}
                      disabled={deletingId === domain.id}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove domain"
                    >
                      {deletingId === domain.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* DNS Instructions (show when pending) */}
                {domain.status !== 'active' && (
                  <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
                    <p className="text-xs font-medium text-zinc-300 mb-3">
                      Add this DNS record at your domain registrar:
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-zinc-500 mb-1">Type</p>
                        <p className="font-mono text-white bg-zinc-800 px-2 py-1 rounded">
                          {domain.dns_record_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 mb-1">Name</p>
                        <div className="flex items-center gap-1">
                          <p className="font-mono text-white bg-zinc-800 px-2 py-1 rounded flex-1 truncate">
                            {domain.dns_record_name}
                          </p>
                          <button
                            onClick={() => copyToClipboard(domain.dns_record_name, `name-${domain.id}`)}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            {copiedField === `name-${domain.id}` ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-500 mb-1">Value</p>
                        <div className="flex items-center gap-1">
                          <p className="font-mono text-white bg-zinc-800 px-2 py-1 rounded flex-1 truncate">
                            {domain.dns_record_value}
                          </p>
                          <button
                            onClick={() => copyToClipboard(domain.dns_record_value, `value-${domain.id}`)}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            {copiedField === `value-${domain.id}` ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-3">
                      DNS changes can take up to 48 hours to propagate, but usually complete within minutes.
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add Domain Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                      <Globe className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Add Custom Domain</h3>
                      <p className="text-sm text-zinc-400">Connect your own domain</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Domain Name
                    </label>
                    <input
                      type="text"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="example.com or www.example.com"
                      className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                      Enter your domain without http:// or https://
                    </p>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-2">How it works:</h4>
                    <ol className="space-y-2 text-xs text-zinc-400">
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">1</span>
                        Add your domain here
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">2</span>
                        Copy the DNS record we provide
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">3</span>
                        Add it at your domain registrar (GoDaddy, Namecheap, etc.)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">4</span>
                        Click verify and you're live!
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-zinc-700 bg-zinc-800/50 flex justify-end gap-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDomain}
                    disabled={!newDomain.trim() || isAdding}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                    Add Domain
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
