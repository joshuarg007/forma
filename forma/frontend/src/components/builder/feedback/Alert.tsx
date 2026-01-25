'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface AlertProps extends ModuleProps {
  title?: string
  message?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  variant?: 'filled' | 'outlined' | 'soft'
  showIcon?: boolean
  dismissible?: boolean
  showAction?: boolean
  actionText?: string
  actionLink?: string
}

const typeConfig = {
  info: {
    filled: 'bg-blue-600 text-white',
    outlined: 'border-2 border-blue-600 text-blue-600 bg-white',
    soft: 'bg-blue-50 text-blue-800 border border-blue-200',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  success: {
    filled: 'bg-green-600 text-white',
    outlined: 'border-2 border-green-600 text-green-600 bg-white',
    soft: 'bg-green-50 text-green-800 border border-green-200',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    filled: 'bg-yellow-500 text-white',
    outlined: 'border-2 border-yellow-500 text-yellow-600 bg-white',
    soft: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  error: {
    filled: 'bg-red-600 text-white',
    outlined: 'border-2 border-red-600 text-red-600 bg-white',
    soft: 'bg-red-50 text-red-800 border border-red-200',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

export default function Alert({
  id,
  className,
  styles,
  title,
  message = 'This is an alert message. You can customize the content and style.',
  type = 'info',
  variant = 'soft',
  showIcon = true,
  dismissible = true,
  showAction = false,
  actionText = 'Learn more',
  actionLink = '#',
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const config = typeConfig[type]

  return (
    <div
      id={id}
      role="alert"
      className={cn(
        'p-4 rounded-lg flex items-start gap-3',
        config[variant],
        className
      )}
      style={styles}
    >
      {/* Icon */}
      {showIcon && (
        <div className="flex-shrink-0">{config.icon}</div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <p className={cn(title ? 'text-sm opacity-90' : '')}>{message}</p>
        {showAction && (
          <a
            href={actionLink}
            className={cn(
              'inline-block mt-2 text-sm font-medium underline underline-offset-2',
              variant === 'filled' ? 'hover:opacity-80' : 'hover:opacity-70'
            )}
          >
            {actionText}
          </a>
        )}
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className={cn(
            'flex-shrink-0 p-1 rounded-lg transition-colors',
            variant === 'filled' ? 'hover:bg-white/20' : 'hover:bg-black/5'
          )}
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

Alert.displayName = 'Alert'

Alert.config = {
  id: 'alert',
  name: 'Alert',
  category: 'feedback',
  description: 'Alert message for notifications and feedback',
  defaultProps: {
    message: 'This is an alert message. You can customize the content and style.',
    type: 'info',
    variant: 'soft',
    showIcon: true,
    dismissible: true,
    showAction: false,
    actionText: 'Learn more',
    actionLink: '#',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'message', label: 'Message', type: 'textarea' },
    { name: 'type', label: 'Type', type: 'select', options: ['info', 'success', 'warning', 'error'], defaultValue: 'info' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['filled', 'outlined', 'soft'], defaultValue: 'soft' },
    { name: 'showIcon', label: 'Show Icon', type: 'boolean', defaultValue: true },
    { name: 'dismissible', label: 'Dismissible', type: 'boolean', defaultValue: true },
    { name: 'showAction', label: 'Show Action', type: 'boolean', defaultValue: false },
    { name: 'actionText', label: 'Action Text', type: 'text', defaultValue: 'Learn more' },
    { name: 'actionLink', label: 'Action Link', type: 'url' },
  ],
}
