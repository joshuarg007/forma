'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface RatingInputProps {
  id?: string
  className?: string
  label?: string
  description?: string
  maxRating?: number
  initialValue?: number
  variant?: 'stars' | 'hearts' | 'thumbs' | 'numbers' | 'emoji'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  readonly?: boolean
  onChange?: (value: number) => void
}

export default function RatingInput({
  id,
  className,
  label = 'Rate your experience',
  description,
  maxRating = 5,
  initialValue = 0,
  variant = 'stars',
  size = 'md',
  showLabel = true,
  readonly = false,
  onChange,
}: RatingInputProps) {
  const [rating, setRating] = useState(initialValue)
  const [hoverRating, setHoverRating] = useState(0)

  const displayRating = hoverRating || rating

  const handleClick = (value: number) => {
    if (readonly) return
    setRating(value)
    onChange?.(value)
  }

  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  }

  const emojiLabels: Record<number, string> = {
    1: '😞',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😄',
  }

  const renderIcon = (index: number, filled: boolean) => {
    const iconClass = cn(
      sizes[size],
      'transition-all cursor-pointer',
      !readonly && 'hover:scale-110',
      readonly && 'cursor-default'
    )

    if (variant === 'stars') {
      return (
        <svg
          className={cn(iconClass, filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600')}
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )
    }

    if (variant === 'hearts') {
      return (
        <svg
          className={cn(iconClass, filled ? 'text-red-500' : 'text-gray-300 dark:text-gray-600')}
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )
    }

    if (variant === 'thumbs') {
      return (
        <svg
          className={cn(iconClass, filled ? 'text-indigo-500' : 'text-gray-300 dark:text-gray-600')}
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
      )
    }

    if (variant === 'numbers') {
      return (
        <span
          className={cn(
            sizes[size],
            'flex items-center justify-center rounded-full font-bold transition-all',
            filled
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400',
            !readonly && 'hover:scale-110 cursor-pointer'
          )}
        >
          {index}
        </span>
      )
    }

    if (variant === 'emoji') {
      return (
        <span
          className={cn(
            'text-2xl transition-all',
            size === 'sm' && 'text-xl',
            size === 'lg' && 'text-4xl',
            !filled && 'opacity-30 grayscale',
            !readonly && 'hover:scale-110 cursor-pointer'
          )}
        >
          {emojiLabels[index] || '🙂'}
        </span>
      )
    }

    return null
  }

  return (
    <div id={id} className={cn('', className)}>
      {label && (
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</p>
      )}

      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoverRating(value)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            className="focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
          >
            {renderIcon(value, value <= displayRating)}
          </button>
        ))}
      </div>

      {showLabel && rating > 0 && variant !== 'emoji' && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {ratingLabels[rating] || `${rating} out of ${maxRating}`}
        </p>
      )}
    </div>
  )
}

RatingInput.displayName = 'RatingInput'

RatingInput.config = {
  id: 'rating-input',
  name: 'Rating Input',
  category: 'interactive',
  description: 'Star/heart rating input',
  defaultProps: { maxRating: 5, initialValue: 0, variant: 'stars', size: 'md', showLabel: true, readonly: false },
  editableFields: [
    { name: 'label', label: 'Label', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'maxRating', label: 'Max Rating', type: 'number' },
    { name: 'initialValue', label: 'Initial Value', type: 'number' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['stars', 'hearts', 'thumbs', 'numbers', 'emoji'] },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'] },
    { name: 'showLabel', label: 'Show Label', type: 'boolean' },
    { name: 'readonly', label: 'Read Only', type: 'boolean' },
  ],
}
