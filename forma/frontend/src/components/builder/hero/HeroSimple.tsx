'use client'

import { cn } from '@/lib/utils'
import type { HeroProps } from '../types'

const sizeClasses = {
  sm: 'py-12 lg:py-16',
  md: 'py-16 lg:py-24',
  lg: 'py-24 lg:py-32',
  xl: 'py-32 lg:py-48',
}

const textAlignClasses = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
}

export default function HeroSimple({
  id,
  className,
  styles,
  headline = 'Build something amazing',
  subheadline = 'Create beautiful, responsive websites with our intuitive page builder. No coding required.',
  ctaText = 'Get Started',
  ctaLink = '#',
  secondaryCtaText = 'Learn More',
  secondaryCtaLink = '#',
  backgroundGradient,
  textAlign = 'center',
  size = 'lg',
  editable,
  onEdit,
}: HeroProps) {
  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden',
        sizeClasses[size],
        backgroundGradient || 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500',
        className
      )}
      style={styles}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className={cn(
        'relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col',
        textAlignClasses[textAlign]
      )}>
        {/* Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium backdrop-blur-sm border border-white/20">
            ✨ Welcome to the future
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEdit('headline')}
        >
          {headline}
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg sm:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEdit('subheadline')}
        >
          {subheadline}
        </p>

        {/* CTAs */}
        <div className={cn(
          'flex flex-col sm:flex-row gap-4',
          textAlign === 'center' && 'justify-center',
          textAlign === 'right' && 'justify-end'
        )}>
          <a
            href={ctaLink}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-xl hover:bg-gray-100 transition-all shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            {ctaText}
          </a>
          {secondaryCtaText && (
            <a
              href={secondaryCtaLink}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm"
            >
              {secondaryCtaText}
            </a>
          )}
        </div>

        {/* Social proof */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 text-white/60 text-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur-sm"
              />
            ))}
          </div>
          <span>Trusted by 10,000+ creators worldwide</span>
        </div>
      </div>
    </section>
  )
}

HeroSimple.displayName = 'HeroSimple'

HeroSimple.config = {
  id: 'hero-centered',
  name: 'Hero Simple',
  category: 'hero',
  description: 'Centered hero section with gradient background',
  defaultProps: {
    headline: 'Build something amazing',
    subheadline: 'Create beautiful, responsive websites with our intuitive page builder. No coding required.',
    ctaText: 'Get Started',
    ctaLink: '#',
    secondaryCtaText: 'Learn More',
    secondaryCtaLink: '#',
    textAlign: 'center',
    size: 'lg',
  },
  editableFields: [
    { name: 'headline', label: 'Headline', type: 'text', defaultValue: 'Build something amazing' },
    { name: 'subheadline', label: 'Subheadline', type: 'textarea', defaultValue: 'Create beautiful, responsive websites...' },
    { name: 'ctaText', label: 'CTA Button Text', type: 'text', defaultValue: 'Get Started' },
    { name: 'ctaLink', label: 'CTA Button Link', type: 'url', defaultValue: '#' },
    { name: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text', defaultValue: 'Learn More' },
    { name: 'secondaryCtaLink', label: 'Secondary CTA Link', type: 'url', defaultValue: '#' },
    { name: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'], defaultValue: 'center' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg', 'xl'], defaultValue: 'lg' },
  ],
}
