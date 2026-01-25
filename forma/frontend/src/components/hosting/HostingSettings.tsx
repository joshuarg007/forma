'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Globe,
  Server,
  Rocket,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Settings,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Zap,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { DomainsManager } from './DomainsManager'

interface HostingConfig {
  id: string
  project_id: string
  subdomain: string
  production_url: string
  current_deployment_id: string | null
  auto_deploy_enabled: boolean
  analytics_enabled: boolean
  created_at: string
  updated_at: string
  current_deployment?: Deployment | null
}

interface Deployment {
  id: string
  version: number
  status: string
  production_url: string
  created_at: string
  deploy_completed_at: string | null
}

interface HostingSettingsProps {
  projectId: string
  projectName: string
  hasSchema: boolean
}

export function HostingSettings({ projectId, projectName, hasSchema }: HostingSettingsProps) {
  const toast = useToast()
  const [config, setConfig] = useState<HostingConfig | null>(null)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'domains' | 'deployments' | 'settings'>('overview')
  const [copiedUrl, setCopiedUrl] = useState(false)

  // Generate subdomain from project name
  const generateSubdomain = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 63) || 'my-project'
  }

  // Load hosting config
  const loadConfig = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/hosting`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      } else if (response.status === 404) {
        setConfig(null)
      }
    } catch (error) {
      console.error('Failed to load hosting config:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  // Load deployments
  const loadDeployments = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/deployments?limit=10`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setDeployments(data.deployments)
      }
    } catch (error) {
      console.error('Failed to load deployments:', error)
    }
  }, [projectId])

  useEffect(() => {
    loadConfig()
    loadDeployments()
  }, [loadConfig, loadDeployments])

  // Set up hosting
  const handleSetupHosting = async () => {
    setIsSettingUp(true)
    try {
      const subdomain = generateSubdomain(projectName)
      const response = await fetch(`/api/projects/${projectId}/hosting/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subdomain }),
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        toast.success('Hosting enabled!', 'Your app is ready to be published.')
      } else {
        const error = await response.json()
        toast.error('Setup failed', error.detail || 'Please try again.')
      }
    } catch (error) {
      toast.error('Error', 'Failed to set up hosting')
    } finally {
      setIsSettingUp(false)
    }
  }

  // Deploy
  const handleDeploy = async () => {
    setIsDeploying(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          commit_message: 'Manual deployment',
          is_preview: false,
        }),
      })

      if (response.ok) {
        toast.success('Deployment started!', 'Your changes will be live shortly.')
        // Reload config and deployments
        await Promise.all([loadConfig(), loadDeployments()])
      } else {
        const error = await response.json()
        toast.error('Deployment failed', error.detail || 'Please try again.')
      }
    } catch (error) {
      toast.error('Error', 'Failed to deploy')
    } finally {
      setIsDeploying(false)
    }
  }

  // Toggle auto-deploy
  const handleToggleAutoDeploy = async () => {
    if (!config) return

    try {
      const response = await fetch(`/api/projects/${projectId}/hosting`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          auto_deploy_enabled: !config.auto_deploy_enabled,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setConfig(updated)
        toast.success(
          updated.auto_deploy_enabled ? 'Auto-deploy enabled' : 'Auto-deploy disabled'
        )
      }
    } catch (error) {
      toast.error('Error', 'Failed to update settings')
    }
  }

  // Copy URL
  const copyUrl = async () => {
    if (!config) return
    await navigator.clipboard.writeText(config.production_url)
    setCopiedUrl(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  // Not set up yet
  if (!config) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 mb-6">
            <Rocket className="w-10 h-10 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Go Live in Seconds
          </h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Enable managed hosting to publish your app with one click. Get a free
            forma.app subdomain and connect your own custom domain.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
            <div className="p-4 bg-zinc-800/50 rounded-xl">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Instant Deploy</p>
              <p className="text-xs text-zinc-500">Live in seconds</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-xl">
              <Globe className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Custom Domains</p>
              <p className="text-xs text-zinc-500">Your brand, your URL</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-xl">
              <Server className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Auto SSL</p>
              <p className="text-xs text-zinc-500">HTTPS included</p>
            </div>
          </div>

          <button
            onClick={handleSetupHosting}
            disabled={isSettingUp}
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/25"
          >
            {isSettingUp ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Rocket className="w-5 h-5" />
            )}
            Enable Hosting
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status card */}
      <div className="p-6 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 rounded-2xl border border-zinc-700">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Your App is Live</h3>
              <div className="flex items-center gap-2 mt-1">
                <a
                  href={config.production_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 text-sm"
                >
                  {config.production_url}
                </a>
                <button
                  onClick={copyUrl}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  {copiedUrl ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={config.production_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Site
            </a>
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {isDeploying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Redeploy
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Status</p>
            <p className="text-sm font-medium text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Online
            </p>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Deployments</p>
            <p className="text-sm font-medium text-white">{deployments.length}</p>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Last Deploy</p>
            <p className="text-sm font-medium text-white">
              {config.current_deployment?.deploy_completed_at
                ? new Date(config.current_deployment.deploy_completed_at).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Auto Deploy</p>
            <p className="text-sm font-medium text-white">
              {config.auto_deploy_enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'domains', label: 'Domains', icon: Globe },
          { id: 'deployments', label: 'Deployments', icon: Clock },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700">
              <h4 className="text-lg font-semibold text-white mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="w-full flex items-center gap-3 p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Redeploy</p>
                    <p className="text-xs text-zinc-500">Push latest changes live</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('domains')}
                  className="w-full flex items-center gap-3 p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                >
                  <Globe className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Add Custom Domain</p>
                    <p className="text-xs text-zinc-500">Connect your own domain</p>
                  </div>
                </button>
                {hasSchema && (
                  <a
                    href={`${config.production_url.replace('.forma.app', '')}.api.forma.app`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                  >
                    <Server className="w-5 h-5 text-violet-400" />
                    <div>
                      <p className="text-sm font-medium text-white">API Documentation</p>
                      <p className="text-xs text-zinc-500">View your backend API</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700">
              <h4 className="text-lg font-semibold text-white mb-4">Recent Deployments</h4>
              {deployments.length === 0 ? (
                <p className="text-sm text-zinc-500">No deployments yet</p>
              ) : (
                <div className="space-y-2">
                  {deployments.slice(0, 5).map((deployment) => (
                    <div
                      key={deployment.id}
                      className="flex items-center justify-between p-2 bg-zinc-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            deployment.status === 'deployed'
                              ? 'bg-green-400'
                              : deployment.status === 'failed'
                              ? 'bg-red-400'
                              : 'bg-yellow-400'
                          }`}
                        />
                        <span className="text-sm text-white">v{deployment.version}</span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {new Date(deployment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'domains' && (
          <DomainsManager projectId={projectId} subdomain={config.subdomain} />
        )}

        {activeTab === 'deployments' && (
          <div className="space-y-3">
            {deployments.length === 0 ? (
              <div className="text-center py-12 bg-zinc-800/30 rounded-xl">
                <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No deployments yet</p>
              </div>
            ) : (
              deployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        deployment.status === 'deployed'
                          ? 'bg-green-500/20'
                          : deployment.status === 'failed'
                          ? 'bg-red-500/20'
                          : 'bg-yellow-500/20'
                      }`}
                    >
                      {deployment.status === 'deployed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : deployment.status === 'failed' ? (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Version {deployment.version}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(deployment.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        deployment.status === 'deployed'
                          ? 'bg-green-500/10 text-green-400'
                          : deployment.status === 'failed'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}
                    >
                      {deployment.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl">
            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">Auto Deploy</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Automatically deploy when you save changes
                  </p>
                </div>
                <button
                  onClick={handleToggleAutoDeploy}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.auto_deploy_enabled ? 'bg-violet-600' : 'bg-zinc-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      config.auto_deploy_enabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
              <h4 className="text-sm font-medium text-white mb-2">Subdomain</h4>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={config.subdomain}
                  disabled
                  className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-400 text-sm"
                />
                <span className="text-sm text-zinc-400">.forma.app</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Subdomain cannot be changed after setup
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
