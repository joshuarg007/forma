'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { NewsletterProps } from '../types'

const layoutClasses = {
  inline: 'flex flex-col sm:flex-row gap-3',
  stacked: 'flex flex-col gap-3',
}

export default function NewsletterSignup({
  id,
  className,
  styles,
  title = 'Stay in the loop',
  subtitle = 'Subscribe to our newsletter for the latest updates, tips, and exclusive offers.',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  successMessage = 'Thanks for subscribing! Check your email for confirmation.',
  layout = 'inline',
  editable,
  onEdit,
}: NewsletterProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div id={id} className={cn('text-center p-6 rounded-2xl bg-green-50', className)} style={styles}>
        <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-green-800 font-medium">{successMessage}</p>
      </div>
    )
  }

  return (
    <div id={id} className={cn('', className)} style={styles}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {title && (
            <h3
              className="text-2xl font-bold text-gray-900 mb-2"
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={handleEdit('title')}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              className="text-gray-600"
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={handleEdit('subtitle')}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className={layoutClasses[layout]}>
          <div className="flex-1 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder={placeholder}
              className={cn(
                'w-full px-5 py-3.5 rounded-xl border outline-none transition-all',
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              )}
            />
            {layout === 'inline' && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap',
              layout === 'stacked' && 'w-full'
            )}
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Subscribing...
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        {/* Privacy note */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          By subscribing, you agree to our{' '}
          <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
          {' '}and consent to receive updates.
        </p>
      </form>
    </div>
  )
}

NewsletterSignup.displayName = 'NewsletterSignup'

NewsletterSignup.config = {
  id: 'section-newsletter',
  name: 'Newsletter Signup',
  category: 'forms',
  description: 'Email newsletter signup form with validation',
  defaultProps: {
    title: 'Stay in the loop',
    subtitle: 'Subscribe to our newsletter for the latest updates.',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
    successMessage: 'Thanks for subscribing!',
    layout: 'inline',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text', defaultValue: 'Stay in the loop' },
    { name: 'subtitle', label: 'Subtitle', type: 'textarea', defaultValue: 'Subscribe to our newsletter...' },
    { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Enter your email' },
    { name: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Subscribe' },
    { name: 'successMessage', label: 'Success Message', type: 'text', defaultValue: 'Thanks for subscribing!' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['inline', 'stacked'], defaultValue: 'inline' },
  ],
}
