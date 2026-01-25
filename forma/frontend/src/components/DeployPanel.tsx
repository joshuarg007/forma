'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Rocket, Globe, Check, AlertCircle, Loader2,
  Clock, ExternalLink, RotateCcw, Plus, Trash2,
  Copy, RefreshCw, Settings, ChevronDown, ChevronRight
} from 'lucide-react'
import { useHostingStore } from '@/stores/hostingStore'
import { Deployment, CustomDomain } from '@/lib/api'

interface DeployPanelProps {
  projectId: string
  projectName: string
  isOpen: boolean
  onClose: () => void
}

export default function DeployPanel({ projectId, projectName, isOpen, onClose }: DeployPanelProps) {
  const [activeTab, setActiveTab] = useState<'deploy' | 'domains' | 'settings'>('deploy')
  const [subdomain, setSubdomain] = useState('')
  const [commitMessage, setCommitMessage] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [showSetup, setShowSetup] = useState(false)
  const [expandedDeployment, setExpandedDeployment] = useState<string | null>(null)

  const {
    hostingConfig,
    loading,
    error,
    deployments,
    currentDeployment,
    deploying,
    deployError,
    buildLogs,
    customDomains,
    subdomainAvailable,
    subdomainSuggested,
    checkingSubdomain,
    fetchHostingConfig,
    setupHosting,
    deploy,
    fetchDeployments,
    fetchBuildLogs,
    rollback,
    addCustomDomain,
    verifyDomain,
    removeCustomDomain,
    checkSubdomain,
    clearSubdomainCheck,
  } = useHostingStore()

  // Load hosting config on mount
  useEffect(() => {
    if (isOpen && projectId) {
      fetchHostingConfig(projectId)
      fetchDeployments(projectId)
    }
  }, [isOpen, projectId])

  // Generate default subdomain from project name
  useEffect(() => {
    if (!subdomain && projectName) {
      const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      setSubdomain(slug)
    }
  }, [projectName])

  // Check subdomain availability with debounce
  useEffect(() => {
    if (subdomain.length >= 3 && showSetup) {
      const timer = setTimeout(() => {
        checkSubdomain(subdomain)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [subdomain, showSetup])

  // Poll for deployment status updates
  useEffect(() => {
    if (currentDeployment && ['pending', 'building', 'uploading'].includes(currentDeployment.status)) {
      const interval = setInterval(() => {
        fetchBuildLogs(projectId, currentDeployment.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [currentDeployment?.status, projectId])

  const handleSetupHosting = async () => {
    try {
      await setupHosting(projectId, subdomain)
      setShowSetup(false)
      clearSubdomainCheck()
    } catch (e: any) {
      // Error handled by store
    }
  }

  const handleDeploy = async () => {
    try {
      await deploy(projectId, commitMessage || undefined)
      setCommitMessage('')
    } catch (e: any) {
      // Error handled by store
    }
  }

  const handleAddDomain = async () => {
    if (!newDomain) return
    try {
      await addCustomDomain(projectId, newDomain)
      setNewDomain('')
    } catch (e: any) {
      // Error handled by store
    }
  }

  const handleRollback = async (deploymentId: string) => {
    try {
      await rollback(projectId, deploymentId)
    } catch (e: any) {
      // Error handled by store
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-400'
      case 'building':
      case 'uploading':
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <Check className="w-4 h-4" />
      case 'building':
      case 'uploading':
      case 'pending': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'failed': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#1a1d24] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forma-500 to-purple-500 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Publish</h2>
                <p className="text-sm text-white/50">
                  {hostingConfig ? hostingConfig.production_url : 'Set up hosting to publish'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-forma-400 animate-spin" />
              </div>
            ) : !hostingConfig ? (
              /* Setup Hosting */
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-forma-500/20 flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-forma-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Set Up Hosting</h3>
                  <p className="text-white/60 max-w-md mx-auto">
                    Publish your project to the web with a free forma.app subdomain
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Choose your subdomain
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={subdomain}
                          onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="my-project"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-forma-500 focus:outline-none"
                        />
                        {checkingSubdomain && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
                        )}
                        {!checkingSubdomain && subdomainAvailable === true && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                        )}
                        {!checkingSubdomain && subdomainAvailable === false && (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <span className="text-white/40">.forma.app</span>
                    </div>
                    {subdomainAvailable === false && subdomainSuggested && (
                      <p className="mt-2 text-sm text-yellow-400">
                        Subdomain taken. Try: <button onClick={() => setSubdomain(subdomainSuggested)} className="underline">{subdomainSuggested}</button>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleSetupHosting}
                    disabled={!subdomain || subdomain.length < 3 || subdomainAvailable === false || loading}
                    className="w-full py-3 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        Set Up Hosting
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Hosting Configured */
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
                  {(['deploy', 'domains', 'settings'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        activeTab === tab
                          ? 'bg-forma-500 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Deploy Tab */}
                {activeTab === 'deploy' && (
                  <div className="space-y-6">
                    {/* Quick Deploy */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white">Deploy to Production</h3>
                        {currentDeployment && (
                          <span className={`text-sm ${getStatusColor(currentDeployment.status)}`}>
                            {currentDeployment.status}
                          </span>
                        )}
                      </div>

                      <input
                        type="text"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        placeholder="Deployment message (optional)"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-forma-500 focus:outline-none text-sm"
                      />

                      <button
                        onClick={handleDeploy}
                        disabled={deploying}
                        className="w-full py-3 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {deploying ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-5 h-5" />
                            Deploy Now
                          </>
                        )}
                      </button>

                      {deployError && (
                        <p className="text-sm text-red-400">{deployError}</p>
                      )}
                    </div>

                    {/* Build Logs (if deploying) */}
                    {currentDeployment && ['pending', 'building', 'uploading'].includes(currentDeployment.status) && buildLogs.length > 0 && (
                      <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                        <h4 className="text-sm font-medium text-white/70 mb-3">Build Logs</h4>
                        <div className="space-y-1 font-mono text-xs max-h-40 overflow-y-auto">
                          {buildLogs.map((log) => (
                            <div
                              key={log.id}
                              className={`${
                                log.level === 'error' ? 'text-red-400' :
                                log.level === 'warn' ? 'text-yellow-400' :
                                'text-white/60'
                              }`}
                            >
                              [{log.step}] {log.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live URL */}
                    {hostingConfig.current_deployment?.status === 'deployed' && (
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-green-400 font-medium">Live</span>
                          </div>
                          <a
                            href={hostingConfig.production_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-green-400 hover:text-green-300 transition text-sm"
                          >
                            {hostingConfig.production_url}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Deployment History */}
                    <div>
                      <h4 className="text-sm font-medium text-white/70 mb-3">Deployment History</h4>
                      <div className="space-y-2">
                        {deployments.length === 0 ? (
                          <p className="text-sm text-white/40 py-4 text-center">No deployments yet</p>
                        ) : (
                          deployments.slice(0, 5).map((deployment) => (
                            <div
                              key={deployment.id}
                              className="p-3 rounded-xl bg-white/5 border border-white/10"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={getStatusColor(deployment.status)}>
                                    {getStatusIcon(deployment.status)}
                                  </span>
                                  <div>
                                    <span className="text-white text-sm">v{deployment.version}</span>
                                    {deployment.commit_message && (
                                      <span className="text-white/40 text-sm ml-2">- {deployment.commit_message}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white/40 text-xs">
                                    {new Date(deployment.created_at).toLocaleDateString()}
                                  </span>
                                  {deployment.status === 'deployed' && !deployment.is_production && (
                                    <button
                                      onClick={() => handleRollback(deployment.id)}
                                      className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/60 hover:text-white"
                                      title="Rollback to this version"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Domains Tab */}
                {activeTab === 'domains' && (
                  <div className="space-y-6">
                    {/* Default Domain */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-white/40 uppercase tracking-wider">Default Domain</span>
                          <p className="text-white font-medium">{hostingConfig.production_url}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(hostingConfig.production_url)}
                          className="p-2 rounded-lg hover:bg-white/10 transition"
                        >
                          <Copy className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                    </div>

                    {/* Add Custom Domain */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <h4 className="font-medium text-white">Add Custom Domain</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                          placeholder="example.com"
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-forma-500 focus:outline-none text-sm"
                        />
                        <button
                          onClick={handleAddDomain}
                          disabled={!newDomain}
                          className="px-4 py-2 rounded-lg bg-forma-500 hover:bg-forma-600 text-white transition disabled:opacity-50"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Custom Domains List */}
                    {customDomains.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-white/70">Custom Domains</h4>
                        {customDomains.map((domain) => (
                          <div
                            key={domain.id}
                            className="p-4 rounded-xl bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-white/60" />
                                <span className="text-white font-medium">{domain.domain}</span>
                                {domain.is_primary && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-forma-500/20 text-forma-400">Primary</span>
                                )}
                              </div>
                              <span className={`text-xs ${
                                domain.status === 'active' ? 'text-green-400' :
                                domain.status === 'validating' ? 'text-yellow-400' :
                                'text-white/40'
                              }`}>
                                {domain.status.replace('_', ' ')}
                              </span>
                            </div>

                            {domain.status === 'pending_validation' && (
                              <div className="mt-3 p-3 rounded-lg bg-black/20 text-sm">
                                <p className="text-white/70 mb-2">Add this DNS record to verify:</p>
                                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                                  <div>
                                    <span className="text-white/40">Type</span>
                                    <p className="text-white">{domain.dns_record_type}</p>
                                  </div>
                                  <div>
                                    <span className="text-white/40">Name</span>
                                    <p className="text-white">{domain.dns_record_name}</p>
                                  </div>
                                  <div>
                                    <span className="text-white/40">Value</span>
                                    <p className="text-white truncate">{domain.dns_record_value}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => verifyDomain(projectId, domain.id)}
                                  className="mt-3 px-3 py-1.5 rounded-lg bg-forma-500 hover:bg-forma-600 text-white text-xs transition"
                                >
                                  Verify DNS
                                </button>
                              </div>
                            )}

                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => removeCustomDomain(projectId, domain.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <h4 className="font-medium text-white mb-3">Build Settings</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Build Command</span>
                          <span className="text-white font-mono">{hostingConfig.build_command}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Output Directory</span>
                          <span className="text-white font-mono">{hostingConfig.output_directory}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Node Version</span>
                          <span className="text-white font-mono">{hostingConfig.node_version}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Auto-Deploy</h4>
                          <p className="text-sm text-white/50">Automatically deploy when you save changes</p>
                        </div>
                        <button
                          className={`w-12 h-6 rounded-full transition ${
                            hostingConfig.auto_deploy_enabled ? 'bg-forma-500' : 'bg-white/20'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition ${
                            hostingConfig.auto_deploy_enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <h4 className="font-medium text-red-400 mb-2">Danger Zone</h4>
                      <p className="text-sm text-white/60 mb-3">
                        Disabling hosting will remove your site from the web.
                      </p>
                      <button
                        className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/20 transition text-sm"
                      >
                        Disable Hosting
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
