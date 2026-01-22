'use client'

import { cn } from '@/lib/utils'
import type { CTABannerProps } from '../types'

const backgroundClasses = {
  gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600',
  solid: '',
  image: 'bg-cover bg-center bg-no-repeat',
}

export default function CTABanner({
  id,
  className,
  styles,
  headline = 'Ready to get started?',
  subheadline = 'Join thousands of satisfied customers and take your business to the next level.',
  ctaText = 'Get Started Free',
  ctaLink = '#',
  secondaryCtaText = 'Learn More',
  secondaryCtaLink = '#',
  background = 'gradient',
  backgroundColor = '#4f46e5',
  backgroundImage,
  layout = 'centered',
  editable,
  onEdit,
}: CTABannerProps) {
  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  const bgStyle: React.CSSProperties = {
    ...styles,
    ...(background === 'solid' && { backgroundColor }),
    ...(background === 'image' && backgroundImage && { backgroundImage: `url(${backgroundImage})` }),
  }

  return (
    <section
      id={id}
      className={cn(
        'relative py-16 lg:py-24 overflow-hidden',
        backgroundClasses[background],
        className
      )}
      style={bgStyle}
    >
      {/* Overlay for image background */}
      {background === 'image' && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      {/* Decorative elements */}
      {background === 'gradient' && (
        <>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        </>
      )}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {layout === 'centered' ? (
          <div className="text-center">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={handleEdit('headline')}
            >
              {headline}
            </h2>
            <p
              className="text-lg text-white/80 max-w-2xl mx-auto mb-8"
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={handleEdit('subheadline')}
            >
              {subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={ctaLink}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {ctaText}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              {secondaryCtaText && (
                <a
                  href={secondaryCtaLink}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all"
                >
                  {secondaryCtaText}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 lg:max-w-xl">
              <h2
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={handleEdit('headline')}
              >
                {headline}
              </h2>
              <p
                className="text-lg text-white/80"
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={handleEdit('subheadline')}
              >
                {subheadline}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href={ctaLink}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
              >
                {ctaText}
              </a>
              {secondaryCtaText && (
                <a
                  href={secondaryCtaLink}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all whitespace-nowrap"
                >
                  {secondaryCtaText}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

CTABanner.displayName = 'CTABanner'

CTABanner.config = {
  id: 'section-cta',
  name: 'CTA Banner',
  category: 'cta',
  description: 'Call-to-action banner with customizable background',
  defaultProps: {
    headline: 'Ready to get started?',
    subheadline: 'Join thousands of satisfied customers.',
    ctaText: 'Get Started Free',
    ctaLink: '#',
    secondaryCtaText: 'Learn More',
    secondaryCtaLink: '#',
    background: 'gradient',
    layout: 'centered',
  },
  editableFields: [
    { name: 'headline', label: 'Headline', type: 'text', defaultValue: 'Ready to get started?' },
    { name: 'subheadline', label: 'Subheadline', type: 'textarea', defaultValue: 'Join thousands of satisfied customers.' },
    { name: 'ctaText', label: 'CTA Button Text', type: 'text', defaultValue: 'Get Started Free' },
    { name: 'ctaLink', label: 'CTA Button Link', type: 'url', defaultValue: '#' },
    { name: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text', defaultValue: 'Learn More' },
    { name: 'secondaryCtaLink', label: 'Secondary CTA Link', type: 'url', defaultValue: '#' },
    { name: 'background', label: 'Background Type', type: 'select', options: ['gradient', 'solid', 'image'], defaultValue: 'gradient' },
    { name: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#4f46e5' },
    { name: 'backgroundImage', label: 'Background Image', type: 'image' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['centered', 'split'], defaultValue: 'centered' },
  ],
}
