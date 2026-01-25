'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

export type OAuthProvider = 'google' | 'github' | 'linkedin' | 'twitter'

interface OAuthButtonsProps extends ModuleProps {
  providers?: OAuthProvider[]
  layout?: 'horizontal' | 'vertical' | 'grid'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'filled' | 'ghost'
  showLabels?: boolean
  labelStyle?: 'name' | 'continue'
  spacing?: 'tight' | 'normal' | 'relaxed'
  apiEndpoint?: string
  onSuccess?: (provider: OAuthProvider, data: any) => void
  onError?: (provider: OAuthProvider, error: Error) => void
  dividerText?: string
  showDivider?: boolean
}

// Provider configurations
const providerConfig: Record<OAuthProvider, {
  name: string
  bgColor: string
  hoverBgColor: string
  textColor: string
  borderColor: string
  icon: React.ReactNode
}> = {
  google: {
    name: 'Google',
    bgColor: 'bg-white',
    hoverBgColor: 'hover:bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  github: {
    name: 'GitHub',
    bgColor: 'bg-[#24292e]',
    hoverBgColor: 'hover:bg-[#2f363d]',
    textColor: 'text-white',
    borderColor: 'border-transparent',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  linkedin: {
    name: 'LinkedIn',
    bgColor: 'bg-[#0A66C2]',
    hoverBgColor: 'hover:bg-[#004182]',
    textColor: 'text-white',
    borderColor: 'border-transparent',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  twitter: {
    name: 'X',
    bgColor: 'bg-black',
    hoverBgColor: 'hover:bg-gray-900',
    textColor: 'text-white',
    borderColor: 'border-transparent',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
}

const sizeClasses = {
  sm: 'py-2 px-3 text-sm',
  md: 'py-2.5 px-4 text-sm',
  lg: 'py-3 px-5 text-base',
}

const spacingClasses = {
  tight: 'gap-2',
  normal: 'gap-3',
  relaxed: 'gap-4',
}

export default function OAuthButtons({
  id,
  className,
  styles,
  providers = ['google', 'github'],
  layout = 'vertical',
  size = 'md',
  variant = 'outline',
  showLabels = true,
  labelStyle = 'continue',
  spacing = 'normal',
  apiEndpoint = '/api/auth/oauth',
  onSuccess,
  onError,
  dividerText = 'or',
  showDivider = false,
}: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null)

  const handleOAuthClick = async (provider: OAuthProvider) => {
    setLoadingProvider(provider)

    try {
      // Call the OAuth login endpoint to get the authorization URL
      const response = await fetch(`${apiEndpoint}/${provider}/login`)

      if (!response.ok) {
        throw new Error(`Failed to initiate ${provider} login`)
      }

      const data = await response.json()

      if (data.url) {
        // Redirect to OAuth provider
        window.location.href = data.url
      } else {
        throw new Error('No authorization URL returned')
      }
    } catch (error) {
      console.error(`OAuth error for ${provider}:`, error)
      onError?.(provider, error as Error)
      setLoadingProvider(null)
    }
  }

  const getButtonClasses = (provider: OAuthProvider) => {
    const config = providerConfig[provider]
    const baseClasses = 'flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    if (variant === 'filled') {
      return cn(baseClasses, config.bgColor, config.hoverBgColor, config.textColor, sizeClasses[size])
    }

    if (variant === 'ghost') {
      return cn(baseClasses, 'bg-transparent hover:bg-gray-100', 'text-gray-700', sizeClasses[size])
    }

    // outline (default)
    return cn(baseClasses, 'bg-white hover:bg-gray-50 border', config.borderColor, 'text-gray-700', sizeClasses[size])
  }

  const getLabel = (provider: OAuthProvider) => {
    if (!showLabels) return null
    const name = providerConfig[provider].name
    return labelStyle === 'continue' ? `Continue with ${name}` : name
  }

  const layoutClasses = {
    horizontal: `flex flex-wrap ${spacingClasses[spacing]}`,
    vertical: `flex flex-col ${spacingClasses[spacing]}`,
    grid: `grid grid-cols-2 ${spacingClasses[spacing]}`,
  }

  return (
    <div id={id} className={cn('w-full', className)} style={styles}>
      <div className={layoutClasses[layout]}>
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() => handleOAuthClick(provider)}
            disabled={loadingProvider !== null}
            className={cn(
              getButtonClasses(provider),
              layout === 'horizontal' && 'flex-1',
              !showLabels && 'w-12 h-12 p-0'
            )}
          >
            {loadingProvider === provider ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                {providerConfig[provider].icon}
                {showLabels && <span className="ml-2">{getLabel(provider)}</span>}
              </>
            )}
          </button>
        ))}
      </div>

      {showDivider && (
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">{dividerText}</span>
          </div>
        </div>
      )}
    </div>
  )
}

OAuthButtons.displayName = 'OAuthButtons'

OAuthButtons.config = {
  id: 'oauth-buttons',
  name: 'OAuth Buttons',
  category: 'forms',
  description: 'Social login buttons for OAuth authentication (Google, GitHub, LinkedIn, X)',
  defaultProps: {
    providers: ['google', 'github'],
    layout: 'vertical',
    size: 'md',
    variant: 'outline',
    showLabels: true,
    labelStyle: 'continue',
    spacing: 'normal',
    apiEndpoint: '/api/auth/oauth',
    showDivider: false,
    dividerText: 'or',
  },
  editableFields: [
    {
      name: 'providers',
      label: 'Providers',
      type: 'multiselect',
      options: ['google', 'github', 'linkedin', 'twitter'],
      defaultValue: ['google', 'github'],
    },
    {
      name: 'layout',
      label: 'Layout',
      type: 'select',
      options: ['horizontal', 'vertical', 'grid'],
      defaultValue: 'vertical',
    },
    {
      name: 'size',
      label: 'Size',
      type: 'select',
      options: ['sm', 'md', 'lg'],
      defaultValue: 'md',
    },
    {
      name: 'variant',
      label: 'Variant',
      type: 'select',
      options: ['outline', 'filled', 'ghost'],
      defaultValue: 'outline',
    },
    {
      name: 'showLabels',
      label: 'Show Labels',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'labelStyle',
      label: 'Label Style',
      type: 'select',
      options: ['name', 'continue'],
      defaultValue: 'continue',
    },
    {
      name: 'spacing',
      label: 'Spacing',
      type: 'select',
      options: ['tight', 'normal', 'relaxed'],
      defaultValue: 'normal',
    },
    {
      name: 'apiEndpoint',
      label: 'API Endpoint',
      type: 'text',
      defaultValue: '/api/auth/oauth',
    },
    {
      name: 'showDivider',
      label: 'Show Divider',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'dividerText',
      label: 'Divider Text',
      type: 'text',
      defaultValue: 'or',
    },
  ],
}
