'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface ModalProps extends ModuleProps {
  isOpen?: boolean
  title?: string
  description?: string
  content?: string
  showCloseButton?: boolean
  showFooter?: boolean
  primaryButtonText?: string
  secondaryButtonText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered?: boolean
  closeOnOverlayClick?: boolean
  showTrigger?: boolean
  triggerText?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
}

export default function Modal({
  id,
  className,
  styles,
  isOpen: initialOpen = false,
  title = 'Modal Title',
  description = 'This is a description for the modal.',
  content = 'Add your modal content here. This can include forms, information, or any other components you need.',
  showCloseButton = true,
  showFooter = true,
  primaryButtonText = 'Confirm',
  secondaryButtonText = 'Cancel',
  size = 'md',
  centered = true,
  closeOnOverlayClick = true,
  showTrigger = true,
  triggerText = 'Open Modal',
}: ModalProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <div id={id} className={className} style={styles}>
      {/* Trigger Button */}
      {showTrigger && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {triggerText}
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => closeOnOverlayClick && setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className={cn(
            'flex min-h-full p-4',
            centered ? 'items-center justify-center' : 'items-start justify-center pt-20'
          )}>
            {/* Modal Content */}
            <div
              className={cn(
                'relative w-full bg-white rounded-2xl shadow-2xl transform transition-all',
                sizeClasses[size]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                  {description && (
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 -mt-1 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">{content}</p>
              </div>

              {/* Footer */}
              {showFooter && (
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {secondaryButtonText}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {primaryButtonText}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

Modal.displayName = 'Modal'

Modal.config = {
  id: 'modal',
  name: 'Modal',
  category: 'feedback',
  description: 'Modal dialog for displaying content or actions',
  defaultProps: {
    title: 'Modal Title',
    description: 'This is a description for the modal.',
    content: 'Add your modal content here. This can include forms, information, or any other components you need.',
    showCloseButton: true,
    showFooter: true,
    primaryButtonText: 'Confirm',
    secondaryButtonText: 'Cancel',
    size: 'md',
    centered: true,
    closeOnOverlayClick: true,
    showTrigger: true,
    triggerText: 'Open Modal',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text', defaultValue: 'Modal Title' },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'content', label: 'Content', type: 'textarea' },
    { name: 'showCloseButton', label: 'Show Close Button', type: 'boolean', defaultValue: true },
    { name: 'showFooter', label: 'Show Footer', type: 'boolean', defaultValue: true },
    { name: 'primaryButtonText', label: 'Primary Button Text', type: 'text', defaultValue: 'Confirm' },
    { name: 'secondaryButtonText', label: 'Secondary Button Text', type: 'text', defaultValue: 'Cancel' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'], defaultValue: 'md' },
    { name: 'centered', label: 'Centered', type: 'boolean', defaultValue: true },
    { name: 'closeOnOverlayClick', label: 'Close on Overlay Click', type: 'boolean', defaultValue: true },
    { name: 'showTrigger', label: 'Show Trigger Button', type: 'boolean', defaultValue: true },
    { name: 'triggerText', label: 'Trigger Button Text', type: 'text', defaultValue: 'Open Modal' },
  ],
}
