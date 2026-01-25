'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Rocket,
  Globe,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Server,
  Layout,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
  hasSchema: boolean
  onPublishComplete?: (urls: { frontend?: string; backend?: string }) => void
}

interface HostingConfig {
  subdomain: string
  production_url: string
  current_deployment_id: string | null
}

interface DeploymentStatus {
  id: string
  status: 'pending' | 'building' | 'uploading' | 'deployed' | 'failed'
  production_url?: string
  error_message?: string
}

type PublishStep = 'setup' | 'publishing' | 'complete' | 'error'

export function PublishModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  hasSchema,
  onPublishComplete,
}: PublishModalProps) {
  const toast = useToast()
  const [step, setStep] = useState<PublishStep>('setup')
  const [subdomain, setSubdomain] = useState('')
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [subdomainSuggestion, setSubdomainSuggestion] = useState<string | null>(null)
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false)
  const [hostingConfig, setHostingConfig] = useState<HostingConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Publishing state
  const [frontendStatus, setFrontendStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle')
  const [backendStatus, setBackendStatus] = useState<'idle' | 'publishing' | 'success' | 'error' | 'skipped'>('idle')
  const [frontendUrl, setFrontendUrl] = useState<string | null>(null)
  const [backendUrl, setBackendUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Generate a subdomain from project name
  const generateSubdomain = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 63) || 'my-project'
  }

  // Check subdomain availability
  const checkSubdomain = useCallback(async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainAvailable(null)
      return
    }

    setIsCheckingSubdomain(true)
    try {
      const response = await fetch('/api/hosting/check-subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subdomain }),
      })

      if (response.ok) {
        const data = await response.json()
        setSubdomainAvailable(data.available)
        setSubdomainSuggestion(data.suggested || null)
      }
    } catch (error) {
      console.error('Failed to check subdomain:', error)
    } finally {
      setIsCheckingSubdomain(false)
    }
  }, [])

  // Load existing hosting config or generate subdomain
  useEffect(() => {
    if (!isOpen) return

    const loadHostingConfig = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/projects/${projectId}/hosting`, {
          credentials: 'include',
        })

        if (response.ok) {
          const config = await response.json()
          setHostingConfig(config)
          setSubdomain(config.subdomain)
          setSubdomainAvailable(true)
        } else if (response.status === 404) {
          // No hosting config yet, generate subdomain
          const suggested = generateSubdomain(projectName)
          setSubdomain(suggested)
          await checkSubdomain(suggested)
        }
      } catch (error) {
        console.error('Failed to load hosting config:', error)
        const suggested = generateSubdomain(projectName)
        setSubdomain(suggested)
      } finally {
        setIsLoading(false)
      }
    }

    loadHostingConfig()
  }, [isOpen, projectId, projectName, checkSubdomain])

  // Debounced subdomain check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (subdomain && !hostingConfig) {
        checkSubdomain(subdomain)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [subdomain, hostingConfig, checkSubdomain])

  // Handle publish
  const handlePublish = async () => {
    setStep('publishing')
    setFrontendStatus('publishing')
    setBackendStatus(hasSchema ? 'idle' : 'skipped')
    setErrorMessage(null)

    try {
      // Step 1: Set up hosting if not configured
      if (!hostingConfig) {
        const setupResponse = await fetch(`/api/projects/${projectId}/hosting/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ subdomain }),
        })

        if (!setupResponse.ok) {
          const error = await setupResponse.json()
          throw new Error(error.detail || 'Failed to set up hosting')
        }

        const config = await setupResponse.json()
        setHostingConfig(config)
      }

      // Step 2: Deploy frontend
      const deployResponse = await fetch(`/api/projects/${projectId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          commit_message: 'Published from Forma Builder',
          is_preview: false,
        }),
      })

      if (!deployResponse.ok) {
        const error = await deployResponse.json()
        throw new Error(error.detail || 'Failed to deploy frontend')
      }

      const deployment = await deployResponse.json()
      setFrontendUrl(deployment.production_url)
      setFrontendStatus('success')

      // Step 3: Deploy backend if schema exists
      if (hasSchema) {
        setBackendStatus('publishing')

        const backendResponse = await fetch(`/api/projects/${projectId}/deploy-backend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })

        if (!backendResponse.ok) {
          const error = await backendResponse.json()
          setBackendStatus('error')
          setErrorMessage(`Backend: ${error.detail || 'Failed to deploy'}`)
        } else {
          const backendResult = await backendResponse.json()
          if (backendResult.success) {
            setBackendUrl(backendResult.api_url)
            setBackendStatus('success')
          } else {
            setBackendStatus('error')
            setErrorMessage(backendResult.message || 'Backend deployment failed')
          }
        }
      }

      setStep('complete')
      onPublishComplete?.({ frontend: deployment.production_url, backend: backendUrl || undefined })
      toast.success('Published successfully!')
    } catch (error) {
      setStep('error')
      setFrontendStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
      toast.error('Failed to publish')
    }
  }

  // Copy URL to clipboard
  const copyToClipboard = async (url: string, label: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(label)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  // Reset and close
  const handleClose = () => {
    setStep('setup')
    setFrontendStatus('idle')
    setBackendStatus('idle')
    setFrontendUrl(null)
    setBackendUrl(null)
    setErrorMessage(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {step === 'complete' ? 'Published!' : 'Publish Your App'}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      {step === 'complete'
                        ? 'Your app is now live'
                        : 'Make your app live in seconds'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                  </div>
                ) : step === 'setup' ? (
                  <div className="space-y-6">
                    {/* Subdomain input */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Choose your URL
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={subdomain}
                            onChange={(e) => {
                              const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                              setSubdomain(value)
                              setSubdomainAvailable(null)
                            }}
                            disabled={!!hostingConfig}
                            placeholder="my-project"
                            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50"
                          />
                          {isCheckingSubdomain && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
                          )}
                          {!isCheckingSubdomain && subdomainAvailable === true && (
                            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                          )}
                          {!isCheckingSubdomain && subdomainAvailable === false && (
                            <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <span className="text-zinc-400">.forma.app</span>
                      </div>
                      {subdomainAvailable === false && subdomainSuggestion && (
                        <button
                          onClick={() => {
                            setSubdomain(subdomainSuggestion)
                            setSubdomainAvailable(null)
                          }}
                          className="mt-2 text-sm text-violet-400 hover:text-violet-300"
                        >
                          Try: {subdomainSuggestion}.forma.app
                        </button>
                      )}
                    </div>

                    {/* What will be published */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-zinc-300">What will be published:</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                          <Layout className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-sm font-medium text-white">Frontend</p>
                            <p className="text-xs text-zinc-500">Your React pages and components</p>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />
                        </div>
                        <div className={`flex items-center gap-3 p-3 rounded-lg ${hasSchema ? 'bg-zinc-800/50' : 'bg-zinc-800/25 opacity-50'}`}>
                          <Server className="w-5 h-5 text-violet-400" />
                          <div>
                            <p className="text-sm font-medium text-white">Backend API</p>
                            <p className="text-xs text-zinc-500">
                              {hasSchema ? 'Your data collections and API' : 'No schema defined yet'}
                            </p>
                          </div>
                          {hasSchema ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />
                          ) : (
                            <span className="text-xs text-zinc-500 ml-auto">Skipped</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : step === 'publishing' ? (
                  <div className="space-y-4 py-4">
                    {/* Publishing progress */}
                    <div className="space-y-3">
                      <PublishStepIndicator
                        icon={<Layout className="w-4 h-4" />}
                        label="Frontend"
                        status={frontendStatus}
                      />
                      {hasSchema && (
                        <PublishStepIndicator
                          icon={<Server className="w-4 h-4" />}
                          label="Backend API"
                          status={backendStatus}
                        />
                      )}
                    </div>
                    {frontendStatus === 'publishing' && (
                      <p className="text-sm text-zinc-400 text-center">
                        Building and deploying your app...
                      </p>
                    )}
                  </div>
                ) : step === 'complete' ? (
                  <div className="space-y-6 py-2">
                    {/* Success message */}
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      </div>
                      <p className="text-zinc-300">Your app is now live at:</p>
                    </div>

                    {/* URLs */}
                    <div className="space-y-3">
                      {frontendUrl && (
                        <UrlCard
                          label="Frontend"
                          url={frontendUrl}
                          icon={<Layout className="w-4 h-4" />}
                          onCopy={() => copyToClipboard(frontendUrl, 'frontend')}
                          copied={copiedUrl === 'frontend'}
                        />
                      )}
                      {backendUrl && (
                        <UrlCard
                          label="Backend API"
                          url={backendUrl}
                          icon={<Server className="w-4 h-4" />}
                          onCopy={() => copyToClipboard(backendUrl, 'backend')}
                          copied={copiedUrl === 'backend'}
                        />
                      )}
                    </div>
                  </div>
                ) : step === 'error' ? (
                  <div className="space-y-4 py-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                        <XCircle className="w-8 h-8 text-red-400" />
                      </div>
                      <p className="text-zinc-300 mb-2">Failed to publish</p>
                      <p className="text-sm text-red-400">{errorMessage}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-zinc-700 bg-zinc-800/50">
                {step === 'setup' ? (
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePublish}
                      disabled={!subdomain || subdomainAvailable === false || isCheckingSubdomain}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Rocket className="w-4 h-4" />
                      Publish Now
                    </button>
                  </div>
                ) : step === 'publishing' ? (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </div>
                  </div>
                ) : step === 'complete' ? (
                  <div className="flex justify-between">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                      Done
                    </button>
                    {frontendUrl && (
                      <a
                        href={frontendUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Live Site
                      </a>
                    )}
                  </div>
                ) : step === 'error' ? (
                  <div className="flex justify-between">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setStep('setup')
                        setErrorMessage(null)
                        setFrontendStatus('idle')
                        setBackendStatus('idle')
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Helper components
function PublishStepIndicator({
  icon,
  label,
  status,
}: {
  icon: React.ReactNode
  label: string
  status: 'idle' | 'publishing' | 'success' | 'error' | 'skipped'
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
      <div className={`p-2 rounded-lg ${
        status === 'success' ? 'bg-green-500/20 text-green-400' :
        status === 'error' ? 'bg-red-500/20 text-red-400' :
        status === 'publishing' ? 'bg-violet-500/20 text-violet-400' :
        'bg-zinc-700 text-zinc-400'
      }`}>
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-white">{label}</span>
      {status === 'publishing' && (
        <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
      )}
      {status === 'success' && (
        <CheckCircle2 className="w-4 h-4 text-green-400" />
      )}
      {status === 'error' && (
        <XCircle className="w-4 h-4 text-red-400" />
      )}
      {status === 'skipped' && (
        <span className="text-xs text-zinc-500">Skipped</span>
      )}
    </div>
  )
}

function UrlCard({
  label,
  url,
  icon,
  onCopy,
  copied,
}: {
  label: string
  url: string
  icon: React.ReactNode
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
      <div className="p-2 rounded-lg bg-zinc-700 text-zinc-300">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-violet-400 hover:text-violet-300 truncate block"
        >
          {url}
        </a>
      </div>
      <button
        onClick={onCopy}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
        title="Copy URL"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
        title="Open in new tab"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  )
}
