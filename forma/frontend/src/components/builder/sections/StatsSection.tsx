'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface Stat {
  value: string
  label: string
  description?: string
}

interface StatsSectionProps extends ModuleProps {
  title?: string
  subtitle?: string
  description?: string
  stats?: Stat[]
  layout?: 'row' | 'grid' | 'cards'
  columns?: 2 | 3 | 4
  background?: 'white' | 'gray' | 'dark' | 'gradient'
  showDividers?: boolean
}

const defaultStats: Stat[] = [
  { value: '10M+', label: 'Active Users', description: 'People using our platform' },
  { value: '99.9%', label: 'Uptime', description: 'Industry-leading reliability' },
  { value: '150+', label: 'Countries', description: 'Global reach' },
  { value: '24/7', label: 'Support', description: 'Always here to help' },
]

export default function StatsSection({
  id,
  className,
  styles,
  title,
  subtitle = 'By the Numbers',
  description,
  stats = defaultStats,
  layout = 'row',
  columns = 4,
  background = 'dark',
  showDividers = true,
}: StatsSectionProps) {
  const isDark = background === 'dark' || background === 'gradient'

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }

  return (
    <section
      id={id}
      className={cn(
        'py-16 px-4',
        background === 'white' && 'bg-white',
        background === 'gray' && 'bg-gray-50',
        background === 'dark' && 'bg-gray-900',
        background === 'gradient' && 'bg-gradient-to-r from-indigo-600 to-purple-600',
        className
      )}
      style={styles}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(title || subtitle || description) && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            {subtitle && (
              <span className={cn(
                'inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4',
                isDark ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
              )}>
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className={cn(
                'text-3xl font-bold mb-4',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                {title}
              </h2>
            )}
            {description && (
              <p className={cn(
                'text-lg',
                isDark ? 'text-white/80' : 'text-gray-600'
              )}>
                {description}
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        {layout === 'cards' ? (
          <div className={cn('grid gap-6', columnClasses[columns])}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  'p-6 rounded-2xl text-center',
                  isDark ? 'bg-white/10 backdrop-blur-sm' : 'bg-white shadow-lg'
                )}
              >
                <div className={cn(
                  'text-4xl font-bold mb-2',
                  isDark ? 'text-white' : 'text-indigo-600'
                )}>
                  {stat.value}
                </div>
                <div className={cn(
                  'font-semibold mb-1',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  {stat.label}
                </div>
                {stat.description && (
                  <div className={cn(
                    'text-sm',
                    isDark ? 'text-white/70' : 'text-gray-500'
                  )}>
                    {stat.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : layout === 'grid' ? (
          <div className={cn('grid gap-8', columnClasses[columns])}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={cn(
                  'text-5xl font-bold mb-2',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  {stat.value}
                </div>
                <div className={cn(
                  'font-medium',
                  isDark ? 'text-white/80' : 'text-gray-600'
                )}>
                  {stat.label}
                </div>
                {stat.description && (
                  <div className={cn(
                    'text-sm mt-1',
                    isDark ? 'text-white/60' : 'text-gray-500'
                  )}>
                    {stat.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Row layout (default)
          <div className={cn(
            'flex flex-wrap justify-center',
            showDividers && 'divide-y md:divide-y-0 md:divide-x',
            isDark ? 'divide-white/20' : 'divide-gray-200'
          )}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  'flex-1 min-w-[200px] py-6 md:py-0 px-8 text-center',
                  index === 0 && 'md:pl-0',
                  index === stats.length - 1 && 'md:pr-0'
                )}
              >
                <div className={cn(
                  'text-4xl md:text-5xl font-bold mb-2',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  {stat.value}
                </div>
                <div className={cn(
                  'font-medium',
                  isDark ? 'text-white/80' : 'text-gray-600'
                )}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

StatsSection.displayName = 'StatsSection'

StatsSection.config = {
  id: 'stats-section',
  name: 'Stats Section',
  category: 'sections',
  description: 'Statistics showcase section',
  defaultProps: {
    subtitle: 'By the Numbers',
    stats: defaultStats,
    layout: 'row',
    columns: 4,
    background: 'dark',
    showDividers: true,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'stats', label: 'Stats', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['row', 'grid', 'cards'], defaultValue: 'row' },
    { name: 'columns', label: 'Columns', type: 'select', options: ['2', '3', '4'], defaultValue: '4' },
    { name: 'background', label: 'Background', type: 'select', options: ['white', 'gray', 'dark', 'gradient'], defaultValue: 'dark' },
    { name: 'showDividers', label: 'Show Dividers (Row)', type: 'boolean', defaultValue: true },
  ],
}
