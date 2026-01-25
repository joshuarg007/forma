'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ContactFormProps } from '../types'

const defaultFields = [
  { name: 'name', label: 'Full Name', type: 'text' as const, required: true },
  { name: 'email', label: 'Email Address', type: 'email' as const, required: true },
  { name: 'phone', label: 'Phone Number', type: 'phone' as const, required: false },
  { name: 'message', label: 'Your Message', type: 'textarea' as const, required: true },
]

export default function ContactForm({
  id,
  className,
  styles,
  title = 'Get in Touch',
  subtitle = 'Have a question or want to work together? Fill out the form below and we\'ll get back to you soon.',
  fields = defaultFields,
  submitText = 'Send Message',
  successMessage = 'Thank you! Your message has been sent successfully.',
  editable,
  onEdit,
}: ContactFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div id={id} className={cn('p-8 rounded-2xl bg-green-50 text-center', className)} style={styles}>
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-medium text-green-800">{successMessage}</p>
        <button
          onClick={() => {
            setSubmitted(false)
            setFormData({})
          }}
          className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <div
      id={id}
      className={cn('max-w-xl mx-auto', className)}
      style={styles}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className="text-3xl font-bold text-gray-900 mb-3"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEdit('title')}
        >
          {title}
        </h2>
        <p
          className="text-gray-600"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEdit('subtitle')}
        >
          {subtitle}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                rows={4}
                required={field.required}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                placeholder={`Enter your ${field.label.toLowerCase()}`}
              />
            ) : field.type === 'select' && field.options ? (
              <select
                id={field.name}
                name={field.name}
                required={field.required}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white"
              >
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                required={field.required}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder={`Enter your ${field.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              {submitText}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

ContactForm.displayName = 'ContactForm'

ContactForm.config = {
  id: 'form-contact',
  name: 'Contact Form',
  category: 'forms',
  description: 'Complete contact form with validation and success state',
  defaultProps: {
    title: 'Get in Touch',
    subtitle: 'Have a question or want to work together?',
    fields: defaultFields,
    submitText: 'Send Message',
    successMessage: 'Thank you! Your message has been sent.',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text', defaultValue: 'Get in Touch' },
    { name: 'subtitle', label: 'Subtitle', type: 'textarea', defaultValue: 'Have a question...' },
    { name: 'fields', label: 'Form Fields', type: 'array' },
    { name: 'submitText', label: 'Submit Button Text', type: 'text', defaultValue: 'Send Message' },
    { name: 'successMessage', label: 'Success Message', type: 'text', defaultValue: 'Thank you!' },
  ],
}
