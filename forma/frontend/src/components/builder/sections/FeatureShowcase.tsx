'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface Feature {
  title: string
  description: string
  image?: string
  badge?: string
  ctaText?: string
  ctaLink?: string
}

interface FeatureShowcaseProps extends ModuleProps {
  title?: string
  subtitle?: string
  features?: Feature[]
  layout?: 'alternating' | 'stacked' | 'grid'
  imagePosition?: 'left' | 'right'
  background?: 'white' | 'gray' | 'gradient'
  showNumbers?: boolean
}

const defaultFeatures: Feature[] = [
  {
    title: 'Lightning Fast Performance',
    description: 'Our platform is optimized for speed. Pages load instantly, and operations complete in milliseconds. Experience the difference that performance makes.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    badge: 'Performance',
    ctaText: 'Learn more',
    ctaLink: '#',
  },
  {
    title: 'Enterprise-Grade Security',
    description: 'Bank-level encryption protects your data. SOC 2 Type II certified infrastructure ensures your information stays secure at all times.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
    badge: 'Security',
    ctaText: 'Learn more',
    ctaLink: '#',
  },
  {
    title: 'Seamless Integrations',
    description: 'Connect with your favorite tools effortlessly. Our API and pre-built integrations make it easy to fit into your existing workflow.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    badge: 'Integrations',
    ctaText: 'Learn more',
    ctaLink: '#',
  },
]

export default function FeatureShowcase({
  id,
  className,
  styles,
  title = 'Why choose us',
  subtitle = 'Features',
  features = defaultFeatures,
  layout = 'alternating',
  imagePosition = 'left',
  background = 'white',
  showNumbers = false,
}: FeatureShowcaseProps) {
  if (layout === 'grid') {
    return (
      <section
        id={id}
        className={cn(
          'py-20 px-4',
          background === 'white' && 'bg-white',
          background === 'gray' && 'bg-gray-50',
          background === 'gradient' && 'bg-gradient-to-br from-indigo-50 to-purple-50',
          className
        )}
        style={styles}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            {subtitle && (
              <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                {subtitle}
              </span>
            )}
            <h2 className="text-4xl font-bold text-gray-900">{title}</h2>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {feature.image && (
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  {feature.badge && (
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium mb-3">
                      {feature.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  {feature.ctaText && (
                    <a
                      href={feature.ctaLink || '#'}
                      className="text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center gap-1"
                    >
                      {feature.ctaText}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (layout === 'stacked') {
    return (
      <section
        id={id}
        className={cn(
          'py-20 px-4',
          background === 'white' && 'bg-white',
          background === 'gray' && 'bg-gray-50',
          background === 'gradient' && 'bg-gradient-to-br from-indigo-50 to-purple-50',
          className
        )}
        style={styles}
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            {subtitle && (
              <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                {subtitle}
              </span>
            )}
            <h2 className="text-4xl font-bold text-gray-900">{title}</h2>
          </div>

          {/* Stacked Features */}
          <div className="space-y-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  'flex flex-col gap-8',
                  imagePosition === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'
                )}
              >
                {/* Image */}
                {feature.image && (
                  <div className="md:w-1/2">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-80 object-cover rounded-2xl shadow-lg"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="md:w-1/2 flex flex-col justify-center">
                  <div className="flex items-start gap-4">
                    {showNumbers && (
                      <span className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                    )}
                    <div>
                      {feature.badge && (
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium mb-3">
                          {feature.badge}
                        </span>
                      )}
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 text-lg mb-4">{feature.description}</p>
                      {feature.ctaText && (
                        <a
                          href={feature.ctaLink || '#'}
                          className="text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center gap-1"
                        >
                          {feature.ctaText}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Alternating layout (default)
  return (
    <section
      id={id}
      className={cn(
        'py-20 px-4',
        background === 'white' && 'bg-white',
        background === 'gray' && 'bg-gray-50',
        background === 'gradient' && 'bg-gradient-to-br from-indigo-50 to-purple-50',
        className
      )}
      style={styles}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          {subtitle && (
            <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              {subtitle}
            </span>
          )}
          <h2 className="text-4xl font-bold text-gray-900">{title}</h2>
        </div>

        {/* Alternating Features */}
        <div className="space-y-24">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0
            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col gap-12 items-center',
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                )}
              >
                {/* Image */}
                {feature.image && (
                  <div className="lg:w-1/2">
                    <div className="relative">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full rounded-2xl shadow-2xl"
                      />
                      {showNumbers && (
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                          {index + 1}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="lg:w-1/2">
                  {feature.badge && (
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                      {feature.badge}
                    </span>
                  )}
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  {feature.ctaText && (
                    <a
                      href={feature.ctaLink || '#'}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {feature.ctaText}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

FeatureShowcase.displayName = 'FeatureShowcase'

FeatureShowcase.config = {
  id: 'feature-showcase',
  name: 'Feature Showcase',
  category: 'sections',
  description: 'Alternating feature showcase section',
  defaultProps: {
    title: 'Why choose us',
    subtitle: 'Features',
    features: defaultFeatures,
    layout: 'alternating',
    imagePosition: 'left',
    background: 'white',
    showNumbers: false,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'features', label: 'Features', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['alternating', 'stacked', 'grid'], defaultValue: 'alternating' },
    { name: 'imagePosition', label: 'Image Position (Stacked)', type: 'select', options: ['left', 'right'], defaultValue: 'left' },
    { name: 'background', label: 'Background', type: 'select', options: ['white', 'gray', 'gradient'], defaultValue: 'white' },
    { name: 'showNumbers', label: 'Show Numbers', type: 'boolean', defaultValue: false },
  ],
}
