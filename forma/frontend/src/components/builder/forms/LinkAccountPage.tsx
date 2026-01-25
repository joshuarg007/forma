'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface LinkAccountPageProps extends ModuleProps {
  title?: string
  subtitle?: string
  linkTitle?: string
  linkSubtitle?: string
  createTitle?: string
  createSubtitle?: string
  apiEndpoint?: string
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  redirectUrl?: string
  variant?: 'card' | 'simple'
}

// Provider icons
const providerIcons: Record<string, React.ReactNode> = {
  google: (
    <svg className="w-8 h-8" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  ),
  github: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-8 h-8" fill="#0A66C2" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  twitter: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
}

export default function LinkAccountPage({
  id,
  className,
  styles,
  title = 'Link Your Account',
  subtitle = 'Connect your social account to your existing profile',
  linkTitle = 'Link to Existing Account',
  linkSubtitle = 'Sign in with your email and password to link this account',
  createTitle = 'Create New Account',
  createSubtitle = 'Create a new account using your social profile',
  apiEndpoint = '/api/auth/oauth',
  onSuccess,
  onError,
  redirectUrl = '/app',
  variant = 'card',
}: LinkAccountPageProps) {
  const [mode, setMode] = useState<'choice' | 'link' | 'create'>('choice')
  const [pendingData, setPendingData] = useState<{
    provider: string
    email: string | null
    name: string | null
    avatar_url: string | null
  } | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState<string | null>(null)

  // Get token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')

    if (urlToken) {
      setToken(urlToken)
      fetchPendingOAuth(urlToken)
    }
  }, [])

  const fetchPendingOAuth = async (pendingToken: string) => {
    try {
      const response = await fetch(`${apiEndpoint}/pending/${pendingToken}`)

      if (!response.ok) {
        throw new Error('OAuth session expired or invalid')
      }

      const data = await response.json()
      setPendingData(data)

      // Pre-fill email if available
      if (data.email) {
        setEmail(data.email)
      }
    } catch (err) {
      setError('This link has expired. Please try logging in again.')
      onError?.(err as Error)
    }
  }

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${apiEndpoint}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to link account')
      }

      // Store tokens if returned
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }

      onSuccess?.(data)
      window.location.href = redirectUrl
    } catch (err) {
      setError((err as Error).message)
      onError?.(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${apiEndpoint}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create account')
      }

      // Store tokens if returned
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }

      onSuccess?.(data)
      window.location.href = redirectUrl
    } catch (err) {
      setError((err as Error).message)
      onError?.(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <div className="w-full max-w-md mx-auto">
      {/* Header with provider info */}
      {pendingData && (
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              {pendingData.avatar_url ? (
                <img
                  src={pendingData.avatar_url}
                  alt={pendingData.name || 'User'}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                providerIcons[pendingData.provider] || (
                  <div className="w-8 h-8 bg-gray-400 rounded-full" />
                )
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
          {pendingData.name && (
            <p className="mt-2 text-lg font-medium text-gray-800">
              {pendingData.name}
            </p>
          )}
          {pendingData.email && (
            <p className="text-sm text-gray-500">{pendingData.email}</p>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Choice Mode */}
      {mode === 'choice' && pendingData && (
        <div className="space-y-4">
          <button
            onClick={() => setMode('link')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{linkTitle}</h3>
                <p className="text-sm text-gray-500">{linkSubtitle}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode('create')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{createTitle}</h3>
                <p className="text-sm text-gray-500">{createSubtitle}</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Link Mode */}
      {mode === 'link' && (
        <div>
          <button
            onClick={() => setMode('choice')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">{linkTitle}</h2>
          <p className="text-gray-600 mb-6">{linkSubtitle}</p>

          <form onSubmit={handleLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Linking...' : 'Link Account'}
            </button>
          </form>
        </div>
      )}

      {/* Create Mode */}
      {mode === 'create' && pendingData && (
        <div>
          <button
            onClick={() => setMode('choice')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">{createTitle}</h2>
          <p className="text-gray-600 mb-6">{createSubtitle}</p>

          <div className="p-4 rounded-lg bg-gray-50 mb-6">
            <p className="text-sm text-gray-600 mb-2">Creating account with:</p>
            <div className="flex items-center gap-3">
              {providerIcons[pendingData.provider]}
              <div>
                <p className="font-medium text-gray-900">{pendingData.name}</p>
                <p className="text-sm text-gray-500">
                  {pendingData.email || `via ${pendingData.provider}`}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      )}

      {/* Loading state */}
      {!pendingData && !error && (
        <div className="text-center py-12">
          <svg className="w-8 h-8 animate-spin mx-auto text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      )}
    </div>
  )

  if (variant === 'simple') {
    return (
      <div id={id} className={cn('py-12 px-4', className)} style={styles}>
        {content}
      </div>
    )
  }

  return (
    <div
      id={id}
      className={cn('min-h-screen flex items-center justify-center p-4 bg-gray-50', className)}
      style={styles}
    >
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        {content}
      </div>
    </div>
  )
}

LinkAccountPage.displayName = 'LinkAccountPage'

LinkAccountPage.config = {
  id: 'link-account-page',
  name: 'Link Account Page',
  category: 'forms',
  description: 'Page for linking OAuth accounts to existing profiles or creating new accounts',
  defaultProps: {
    title: 'Link Your Account',
    subtitle: 'Connect your social account to your existing profile',
    linkTitle: 'Link to Existing Account',
    linkSubtitle: 'Sign in with your email and password to link this account',
    createTitle: 'Create New Account',
    createSubtitle: 'Create a new account using your social profile',
    apiEndpoint: '/api/auth/oauth',
    redirectUrl: '/app',
    variant: 'card',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text', defaultValue: 'Link Your Account' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'linkTitle', label: 'Link Option Title', type: 'text' },
    { name: 'linkSubtitle', label: 'Link Option Subtitle', type: 'text' },
    { name: 'createTitle', label: 'Create Option Title', type: 'text' },
    { name: 'createSubtitle', label: 'Create Option Subtitle', type: 'text' },
    { name: 'apiEndpoint', label: 'API Endpoint', type: 'text', defaultValue: '/api/auth/oauth' },
    { name: 'redirectUrl', label: 'Success Redirect URL', type: 'url', defaultValue: '/app' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['card', 'simple'], defaultValue: 'card' },
  ],
}
