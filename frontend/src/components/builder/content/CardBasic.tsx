'use client'

import { cn } from '@/lib/utils'
import type { CardProps } from '../types'

const variantClasses = {
  default: 'bg-white border border-gray-100 shadow-sm hover:shadow-md',
  bordered: 'bg-white border-2 border-gray-200 hover:border-indigo-300',
  elevated: 'bg-white shadow-lg hover:shadow-xl',
  gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white',
}

export default function CardBasic({
  id,
  className,
  styles,
  title = 'Card Title',
  description = 'This is a description for your card. Add some details about the feature, product, or content.',
  image,
  link,
  linkText = 'Learn more',
  variant = 'default',
  editable,
  onEdit,
}: CardProps) {
  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  const isGradient = variant === 'gradient'

  return (
    <div
      id={id}
      className={cn(
        'rounded-2xl overflow-hidden transition-all duration-300',
        variantClasses[variant],
        className
      )}
      style={styles}
    >
      {/* Image */}
      {image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <h3
          className={cn(
            'text-xl font-semibold mb-3',
            isGradient ? 'text-white' : 'text-gray-900'
          )}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEdit('title')}
        >
          {title}
        </h3>

        <p
          className={cn(
            'leading-relaxed mb-4',
            isGradient ? 'text-white/80' : 'text-gray-600'
          )}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEdit('description')}
        >
          {description}
        </p>

        {link && (
          <a
            href={link}
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
              isGradient ? 'text-white hover:text-white/80' : 'text-indigo-600 hover:text-indigo-700'
            )}
          >
            {linkText}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

CardBasic.displayName = 'CardBasic'

CardBasic.config = {
  id: 'card-basic',
  name: 'Card Basic',
  category: 'content',
  description: 'Simple content card with title, description, and optional image',
  defaultProps: {
    title: 'Card Title',
    description: 'This is a description for your card.',
    variant: 'default',
    linkText: 'Learn more',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text', defaultValue: 'Card Title' },
    { name: 'description', label: 'Description', type: 'textarea', defaultValue: 'This is a description...' },
    { name: 'image', label: 'Image URL', type: 'image' },
    { name: 'link', label: 'Link URL', type: 'url' },
    { name: 'linkText', label: 'Link Text', type: 'text', defaultValue: 'Learn more' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'bordered', 'elevated', 'gradient'], defaultValue: 'default' },
  ],
}
