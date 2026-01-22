'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface Testimonial {
  quote: string
  authorName: string
  authorTitle: string
  authorCompany: string
  authorImage?: string
  rating?: number
}

interface TestimonialsSectionProps extends ModuleProps {
  title?: string
  subtitle?: string
  description?: string
  testimonials?: Testimonial[]
  layout?: 'grid' | 'carousel' | 'masonry'
  showRating?: boolean
  background?: 'white' | 'gray' | 'gradient' | 'dark'
}

const defaultTestimonials: Testimonial[] = [
  {
    quote: "This product has completely transformed how we work. The team is incredibly responsive and the features are exactly what we needed.",
    authorName: 'Sarah Johnson',
    authorTitle: 'Product Manager',
    authorCompany: 'TechCorp',
    rating: 5,
  },
  {
    quote: "I've tried many similar tools, but this one stands out for its simplicity and power. Highly recommended for any team.",
    authorName: 'Michael Chen',
    authorTitle: 'CTO',
    authorCompany: 'StartupXYZ',
    rating: 5,
  },
  {
    quote: "The customer support is outstanding. They helped us migrate our entire workflow in just a few days.",
    authorName: 'Emily Brown',
    authorTitle: 'Operations Director',
    authorCompany: 'Enterprise Inc',
    rating: 5,
  },
  {
    quote: "We've seen a 40% increase in productivity since implementing this solution. It's been a game-changer for our team.",
    authorName: 'David Wilson',
    authorTitle: 'Engineering Lead',
    authorCompany: 'DevStudio',
    rating: 5,
  },
  {
    quote: "The best investment we've made this year. The ROI was evident within the first month of use.",
    authorName: 'Lisa Anderson',
    authorTitle: 'CEO',
    authorCompany: 'GrowthCo',
    rating: 5,
  },
  {
    quote: "Intuitive, powerful, and beautiful. Everything a modern team needs in one package.",
    authorName: 'James Taylor',
    authorTitle: 'Design Director',
    authorCompany: 'Creative Agency',
    rating: 5,
  },
]

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={cn('w-4 h-4', filled ? 'text-yellow-400' : 'text-gray-300')}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const QuoteIcon = () => (
  <svg className="w-8 h-8 text-indigo-200" fill="currentColor" viewBox="0 0 32 32">
    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
  </svg>
)

export default function TestimonialsSection({
  id,
  className,
  styles,
  title = 'What our customers say',
  subtitle = 'Testimonials',
  description = 'Trusted by thousands of teams around the world',
  testimonials = defaultTestimonials,
  layout = 'grid',
  showRating = true,
  background = 'white',
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const isDark = background === 'dark'

  return (
    <section
      id={id}
      className={cn(
        'py-20 px-4',
        background === 'white' && 'bg-white',
        background === 'gray' && 'bg-gray-50',
        background === 'gradient' && 'bg-gradient-to-br from-indigo-50 to-purple-50',
        background === 'dark' && 'bg-gray-900',
        className
      )}
      style={styles}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {subtitle && (
            <span className={cn(
              'inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4',
              isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
            )}>
              {subtitle}
            </span>
          )}
          <h2 className={cn(
            'text-4xl font-bold mb-4',
            isDark ? 'text-white' : 'text-gray-900'
          )}>
            {title}
          </h2>
          <p className={cn(
            'text-xl',
            isDark ? 'text-gray-400' : 'text-gray-600'
          )}>
            {description}
          </p>
        </div>

        {/* Testimonials */}
        {layout === 'carousel' ? (
          <div className="relative max-w-4xl mx-auto">
            <div className={cn(
              'p-8 rounded-2xl text-center',
              isDark ? 'bg-gray-800' : 'bg-white shadow-lg'
            )}>
              <QuoteIcon />
              {showRating && testimonials[currentIndex].rating && (
                <div className="flex justify-center gap-1 mt-4 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={star <= (testimonials[currentIndex].rating || 0)} />
                  ))}
                </div>
              )}
              <blockquote className={cn(
                'text-xl leading-relaxed mb-8',
                isDark ? 'text-gray-300' : 'text-gray-700'
              )}>
                "{testimonials[currentIndex].quote}"
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                {testimonials[currentIndex].authorImage ? (
                  <img
                    src={testimonials[currentIndex].authorImage}
                    alt={testimonials[currentIndex].authorName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    {testimonials[currentIndex].authorName.charAt(0)}
                  </div>
                )}
                <div className="text-left">
                  <p className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                    {testimonials[currentIndex].authorName}
                  </p>
                  <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                    {testimonials[currentIndex].authorTitle} at {testimonials[currentIndex].authorCompany}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-all',
                    index === currentIndex
                      ? 'bg-indigo-600 w-8'
                      : isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
                  )}
                />
              ))}
            </div>
          </div>
        ) : layout === 'masonry' ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={cn(
                  'break-inside-avoid p-6 rounded-2xl',
                  isDark ? 'bg-gray-800' : 'bg-white shadow-lg'
                )}
              >
                {showRating && testimonial.rating && (
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} filled={star <= (testimonial.rating || 0)} />
                    ))}
                  </div>
                )}
                <blockquote className={cn(
                  'leading-relaxed mb-4',
                  isDark ? 'text-gray-300' : 'text-gray-700'
                )}>
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  {testimonial.authorImage ? (
                    <img
                      src={testimonial.authorImage}
                      alt={testimonial.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-gray-900')}>
                      {testimonial.authorName}
                    </p>
                    <p className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>
                      {testimonial.authorTitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={cn(
                  'p-6 rounded-2xl',
                  isDark ? 'bg-gray-800' : 'bg-white shadow-lg'
                )}
              >
                <QuoteIcon />
                {showRating && testimonial.rating && (
                  <div className="flex gap-1 mt-4 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} filled={star <= (testimonial.rating || 0)} />
                    ))}
                  </div>
                )}
                <blockquote className={cn(
                  'leading-relaxed mb-6',
                  isDark ? 'text-gray-300' : 'text-gray-700'
                )}>
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  {testimonial.authorImage ? (
                    <img
                      src={testimonial.authorImage}
                      alt={testimonial.authorName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {testimonial.authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                      {testimonial.authorName}
                    </p>
                    <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                      {testimonial.authorTitle} at {testimonial.authorCompany}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

TestimonialsSection.displayName = 'TestimonialsSection'

TestimonialsSection.config = {
  id: 'testimonials-section',
  name: 'Testimonials Section',
  category: 'sections',
  description: 'Full testimonials section with multiple layout options',
  defaultProps: {
    title: 'What our customers say',
    subtitle: 'Testimonials',
    description: 'Trusted by thousands of teams around the world',
    testimonials: defaultTestimonials,
    layout: 'grid',
    showRating: true,
    background: 'white',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'testimonials', label: 'Testimonials', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['grid', 'carousel', 'masonry'], defaultValue: 'grid' },
    { name: 'showRating', label: 'Show Rating', type: 'boolean', defaultValue: true },
    { name: 'background', label: 'Background', type: 'select', options: ['white', 'gray', 'gradient', 'dark'], defaultValue: 'white' },
  ],
}
