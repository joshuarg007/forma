'use client'

import { cn } from '@/lib/utils'
import type { FeatureGridProps } from '../types'

const defaultFeatures = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Built for speed with optimized performance. Your pages load in milliseconds.',
  },
  {
    icon: '🎨',
    title: 'Beautiful Design',
    description: 'Stunning templates designed by professionals. Make your brand shine.',
  },
  {
    icon: '🔒',
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee.',
  },
  {
    icon: '📱',
    title: 'Mobile Responsive',
    description: 'Looks perfect on every device. From desktop to mobile.',
  },
  {
    icon: '🔧',
    title: 'Easy to Customize',
    description: 'No coding required. Point, click, and customize everything.',
  },
  {
    icon: '📊',
    title: 'Analytics Built-in',
    description: 'Track visitors, conversions, and grow your business.',
  },
]

const columnClasses = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

export default function FeatureGrid({
  id,
  className,
  styles,
  title = 'Everything you need to succeed',
  subtitle = 'Our platform provides all the tools and features you need to build, launch, and grow your online presence.',
  features = defaultFeatures,
  columns = 3,
  editable,
  onEdit,
}: FeatureGridProps) {
  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  return (
    <div id={id} className={cn('py-16 lg:py-24', className)} style={styles}>
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 px-4">
        <h2
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEdit('title')}
        >
          {title}
        </h2>
        <p
          className="text-lg text-gray-600"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEdit('subtitle')}
        >
          {subtitle}
        </p>
      </div>

      {/* Feature Grid */}
      <div className={cn('grid gap-8', columnClasses[columns], 'px-4')}>
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative p-8 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
          >
            {/* Icon */}
            <div className="w-14 h-14 mb-6 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl group-hover:bg-indigo-100 transition-colors">
              {feature.icon}
            </div>

            {/* Content */}
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  )
}

FeatureGrid.displayName = 'FeatureGrid'

FeatureGrid.config = {
  id: 'section-features',
  name: 'Feature Grid',
  category: 'content',
  description: 'Grid of features with icons, titles, and descriptions',
  defaultProps: {
    title: 'Everything you need to succeed',
    subtitle: 'Our platform provides all the tools and features you need.',
    features: defaultFeatures,
    columns: 3,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text', defaultValue: 'Everything you need to succeed' },
    { name: 'subtitle', label: 'Subtitle', type: 'textarea', defaultValue: 'Our platform provides...' },
    { name: 'features', label: 'Features', type: 'array' },
    { name: 'columns', label: 'Columns', type: 'select', options: ['2', '3', '4'], defaultValue: '3' },
  ],
}
