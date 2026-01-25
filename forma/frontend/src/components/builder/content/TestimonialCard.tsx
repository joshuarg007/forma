'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface TestimonialCardProps extends ModuleProps {
  quote?: string
  authorName?: string
  authorTitle?: string
  authorCompany?: string
  authorImage?: string
  rating?: number
  variant?: 'simple' | 'bordered' | 'elevated' | 'gradient'
  showQuoteIcon?: boolean
  showRating?: boolean
}

const variantClasses = {
  simple: 'bg-white',
  bordered: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-lg',
  gradient: 'bg-gradient-to-br from-indigo-50 to-purple-50',
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={cn('w-5 h-5', filled ? 'text-yellow-400' : 'text-gray-300')}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const QuoteIcon = () => (
  <svg className="w-10 h-10 text-indigo-200" fill="currentColor" viewBox="0 0 32 32">
    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
  </svg>
)

export default function TestimonialCard({
  id,
  className,
  styles,
  quote = "This product has completely transformed how we work. The team is incredibly responsive and the features are exactly what we needed. Highly recommended!",
  authorName = 'Sarah Johnson',
  authorTitle = 'Product Manager',
  authorCompany = 'TechCorp Inc.',
  authorImage,
  rating = 5,
  variant = 'elevated',
  showQuoteIcon = true,
  showRating = true,
}: TestimonialCardProps) {
  return (
    <div
      id={id}
      className={cn(
        'p-8 rounded-2xl',
        variantClasses[variant],
        className
      )}
      style={styles}
    >
      {/* Quote Icon */}
      {showQuoteIcon && (
        <div className="mb-4">
          <QuoteIcon />
        </div>
      )}

      {/* Rating */}
      {showRating && rating > 0 && (
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} filled={star <= rating} />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
        "{quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        {authorImage ? (
          <img
            src={authorImage}
            alt={authorName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {authorName.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{authorName}</p>
          <p className="text-sm text-gray-500">
            {authorTitle}
            {authorCompany && ` at ${authorCompany}`}
          </p>
        </div>
      </div>
    </div>
  )
}

TestimonialCard.displayName = 'TestimonialCard'

TestimonialCard.config = {
  id: 'testimonial-card',
  name: 'Testimonial Card',
  category: 'content',
  description: 'Customer testimonial with quote, rating, and author info',
  defaultProps: {
    quote: "This product has completely transformed how we work. The team is incredibly responsive and the features are exactly what we needed. Highly recommended!",
    authorName: 'Sarah Johnson',
    authorTitle: 'Product Manager',
    authorCompany: 'TechCorp Inc.',
    rating: 5,
    variant: 'elevated',
    showQuoteIcon: true,
    showRating: true,
  },
  editableFields: [
    { name: 'quote', label: 'Quote', type: 'textarea' },
    { name: 'authorName', label: 'Author Name', type: 'text' },
    { name: 'authorTitle', label: 'Author Title', type: 'text' },
    { name: 'authorCompany', label: 'Author Company', type: 'text' },
    { name: 'authorImage', label: 'Author Image', type: 'image' },
    { name: 'rating', label: 'Rating (1-5)', type: 'number', defaultValue: 5 },
    { name: 'variant', label: 'Variant', type: 'select', options: ['simple', 'bordered', 'elevated', 'gradient'], defaultValue: 'elevated' },
    { name: 'showQuoteIcon', label: 'Show Quote Icon', type: 'boolean', defaultValue: true },
    { name: 'showRating', label: 'Show Rating', type: 'boolean', defaultValue: true },
  ],
}
