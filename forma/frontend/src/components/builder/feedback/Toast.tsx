'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface ToastProps extends ModuleProps {
  message?: string
  title?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  duration?: number
  showIcon?: boolean
  showProgress?: boolean
  dismissible?: boolean
  showTrigger?: boolean
  triggerText?: string
}

const typeConfig = {
  info: {
    bg: 'bg-white border-l-4 border-l-blue-500',
    icon: 'text-blue-500',
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    progress: 'bg-blue-500',
  },
  success: {
    bg: 'bg-white border-l-4 border-l-green-500',
    icon: 'text-green-500',
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    progress: 'bg-green-500',
  },
  warning: {
    bg: 'bg-white border-l-4 border-l-yellow-500',
    icon: 'text-yellow-500',
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    progress: 'bg-yellow-500',
  },
  error: {
    bg: 'bg-white border-l-4 border-l-red-500',
    icon: 'text-red-500',
    iconPath: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    progress: 'bg-red-500',
  },
}

const positionClasses = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
}

export default function Toast({
  id,
  className,
  styles,
  message = 'This is a toast notification message.',
  title,
  type = 'success',
  position = 'top-right',
  duration = 5000,
  showIcon = true,
  showProgress = true,
  dismissible = true,
  showTrigger = true,
  triggerText = 'Show Toast',
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (isVisible && duration > 0) {
      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
        setProgress(remaining)
        if (remaining === 0) {
          clearInterval(interval)
          setIsVisible(false)
        }
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isVisible, duration])

  const config = typeConfig[type]

  const showToast = () => {
    setIsVisible(true)
    setProgress(100)
  }

  return (
    <div id={id} className={className} style={styles}>
      {/* Trigger Button */}
      {showTrigger && (
        <button
          onClick={showToast}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {triggerText}
        </button>
      )}

      {/* Toast */}
      {isVisible && (
        <div
          className={cn(
            'fixed z-50 min-w-[320px] max-w-md',
            positionClasses[position]
          )}
        >
          <div
            className={cn(
              'rounded-lg shadow-lg overflow-hidden',
              config.bg
            )}
          >
            <div className="p-4 flex items-start gap-3">
              {/* Icon */}
              {showIcon && (
                <div className={cn('flex-shrink-0', config.icon)}>
                  {config.iconPath}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
                )}
                <p className={cn(
                  'text-gray-600',
                  title ? 'text-sm mt-1' : 'text-sm'
                )}>
                  {message}
                </p>
              </div>

              {/* Dismiss Button */}
              {dismissible && (
                <button
                  onClick={() => setIsVisible(false)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {showProgress && duration > 0 && (
              <div className="h-1 bg-gray-100">
                <div
                  className={cn('h-full transition-all duration-100', config.progress)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

Toast.displayName = 'Toast'

Toast.config = {
  id: 'toast',
  name: 'Toast',
  category: 'feedback',
  description: 'Toast notification for temporary messages',
  defaultProps: {
    message: 'This is a toast notification message.',
    type: 'success',
    position: 'top-right',
    duration: 5000,
    showIcon: true,
    showProgress: true,
    dismissible: true,
    showTrigger: true,
    triggerText: 'Show Toast',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'message', label: 'Message', type: 'textarea' },
    { name: 'type', label: 'Type', type: 'select', options: ['info', 'success', 'warning', 'error'], defaultValue: 'success' },
    { name: 'position', label: 'Position', type: 'select', options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'], defaultValue: 'top-right' },
    { name: 'duration', label: 'Duration (ms)', type: 'number', defaultValue: 5000 },
    { name: 'showIcon', label: 'Show Icon', type: 'boolean', defaultValue: true },
    { name: 'showProgress', label: 'Show Progress', type: 'boolean', defaultValue: true },
    { name: 'dismissible', label: 'Dismissible', type: 'boolean', defaultValue: true },
    { name: 'showTrigger', label: 'Show Trigger Button', type: 'boolean', defaultValue: true },
    { name: 'triggerText', label: 'Trigger Button Text', type: 'text', defaultValue: 'Show Toast' },
  ],
}
