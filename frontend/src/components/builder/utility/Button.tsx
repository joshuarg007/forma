'use client'

import { cn } from '@/lib/utils'
import type { ButtonProps } from '../types'

const variantClasses = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  outline: 'border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50',
  ghost: 'text-gray-700 hover:bg-gray-100',
  link: 'text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Button({
  id,
  className,
  styles,
  text = 'Button',
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled = false,
  editable,
  onEdit,
}: ButtonProps) {
  const handleEdit = (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit('text', e.currentTarget.textContent || '')
    }
  }

  const buttonClasses = cn(
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    disabled && 'opacity-50 cursor-not-allowed',
    variant !== 'link' && 'focus:ring-4 focus:ring-indigo-500/20',
    className
  )

  const iconElement = icon && (
    <span className="flex-shrink-0">
      {icon === 'arrow-right' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      )}
      {icon === 'arrow-left' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
      )}
      {icon === 'download' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      {icon === 'external' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
      {icon === 'plus' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
      {icon === 'check' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>
  )

  const content = (
    <>
      {icon && iconPosition === 'left' && iconElement}
      <span
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={handleEdit}
      >
        {text}
      </span>
      {icon && iconPosition === 'right' && iconElement}
    </>
  )

  if (href) {
    return (
      <a
        id={id}
        href={disabled ? undefined : href}
        className={buttonClasses}
        style={styles}
        aria-disabled={disabled}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      id={id}
      type="button"
      disabled={disabled}
      className={buttonClasses}
      style={styles}
    >
      {content}
    </button>
  )
}

Button.displayName = 'Button'

Button.config = {
  id: 'button-primary',
  name: 'Button',
  category: 'utility',
  description: 'Customizable button with multiple variants',
  defaultProps: {
    text: 'Button',
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    disabled: false,
  },
  editableFields: [
    { name: 'text', label: 'Button Text', type: 'text', defaultValue: 'Button' },
    { name: 'href', label: 'Link URL', type: 'url' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'link'], defaultValue: 'primary' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
    { name: 'icon', label: 'Icon', type: 'select', options: ['', 'arrow-right', 'arrow-left', 'download', 'external', 'plus', 'check'] },
    { name: 'iconPosition', label: 'Icon Position', type: 'select', options: ['left', 'right'], defaultValue: 'left' },
    { name: 'fullWidth', label: 'Full Width', type: 'boolean', defaultValue: false },
    { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
  ],
}
