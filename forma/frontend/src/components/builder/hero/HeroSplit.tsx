'use client'

import { cn } from '@/lib/utils'
import type { HeroProps } from '../types'

const sizeClasses = {
  sm: 'py-12 lg:py-16',
  md: 'py-16 lg:py-24',
  lg: 'py-24 lg:py-32',
  xl: 'py-32 lg:py-48',
}

export default function HeroSplit({
  id,
  className,
  styles,
  headline = 'Build your dream product faster',
  subheadline = 'Our platform gives you the tools to create stunning websites without writing a single line of code. Perfect for startups, creators, and agencies.',
  ctaText = 'Start Building',
  ctaLink = '#',
  secondaryCtaText = 'Watch Demo',
  secondaryCtaLink = '#',
  imageUrl,
  imageAlt = 'Hero image',
  imagePosition = 'right',
  size = 'lg',
  editable,
  onEdit,
}: HeroProps) {
  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  const ContentSection = () => (
    <div className="flex-1 flex flex-col justify-center">
      {/* Badge */}
      <div className="mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
          🚀 Now in Beta
        </span>
      </div>

      {/* Headline */}
      <h1
        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={handleEdit('headline')}
      >
        {headline}
      </h1>

      {/* Subheadline */}
      <p
        className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg"
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={handleEdit('subheadline')}
      >
        {subheadline}
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href={ctaLink}
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5"
        >
          {ctaText}
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
        {secondaryCtaText && (
          <a
            href={secondaryCtaLink}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {secondaryCtaText}
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-3 gap-8 max-w-md">
        <div>
          <div className="text-3xl font-bold text-gray-900">50K+</div>
          <div className="text-sm text-gray-500">Active Users</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">99.9%</div>
          <div className="text-sm text-gray-500">Uptime</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">4.9★</div>
          <div className="text-sm text-gray-500">Rating</div>
        </div>
      </div>
    </div>
  )

  const ImageSection = () => (
    <div className="flex-1 relative">
      <div className="relative">
        {/* Decorative background */}
        <div className="absolute -inset-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl transform rotate-2" />

        {/* Image container */}
        <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">Add your image</p>
                <p className="text-xs">Drag & drop or click to upload</p>
              </div>
            </div>
          )}
        </div>

        {/* Floating elements */}
        <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Easy Setup</div>
            <div className="text-xs text-gray-500">Ready in 5 minutes</div>
          </div>
        </div>

        <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white" />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">+2.5k online</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section
      id={id}
      className={cn(
        'bg-white',
        sizeClasses[size],
        className
      )}
      style={styles}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          'flex flex-col lg:flex-row items-center gap-12 lg:gap-20',
          imagePosition === 'left' && 'lg:flex-row-reverse'
        )}>
          <ContentSection />
          <ImageSection />
        </div>
      </div>
    </section>
  )
}

HeroSplit.displayName = 'HeroSplit'

HeroSplit.config = {
  id: 'hero-split',
  name: 'Hero Split',
  category: 'hero',
  description: 'Split hero with content on one side and image on the other',
  defaultProps: {
    headline: 'Build your dream product faster',
    subheadline: 'Our platform gives you the tools to create stunning websites without writing a single line of code.',
    ctaText: 'Start Building',
    ctaLink: '#',
    secondaryCtaText: 'Watch Demo',
    secondaryCtaLink: '#',
    imagePosition: 'right',
    size: 'lg',
  },
  editableFields: [
    { name: 'headline', label: 'Headline', type: 'text', defaultValue: 'Build your dream product faster' },
    { name: 'subheadline', label: 'Subheadline', type: 'textarea', defaultValue: 'Our platform gives you the tools...' },
    { name: 'ctaText', label: 'CTA Button Text', type: 'text', defaultValue: 'Start Building' },
    { name: 'ctaLink', label: 'CTA Button Link', type: 'url', defaultValue: '#' },
    { name: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text', defaultValue: 'Watch Demo' },
    { name: 'secondaryCtaLink', label: 'Secondary CTA Link', type: 'url', defaultValue: '#' },
    { name: 'imageUrl', label: 'Image URL', type: 'image' },
    { name: 'imageAlt', label: 'Image Alt Text', type: 'text', defaultValue: 'Hero image' },
    { name: 'imagePosition', label: 'Image Position', type: 'select', options: ['left', 'right'], defaultValue: 'right' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg', 'xl'], defaultValue: 'lg' },
  ],
}
