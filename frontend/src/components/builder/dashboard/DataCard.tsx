'use client'

import { cn } from '@/lib/utils'

interface DataItem {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
}

interface DataCardProps {
  id?: string
  className?: string
  title?: string
  subtitle?: string
  data?: DataItem[]
  layout?: 'vertical' | 'horizontal' | 'grid'
  showDividers?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

const defaultData: DataItem[] = [
  { label: 'Total Users', value: '12,456', change: 8.2, trend: 'up' },
  { label: 'Active Sessions', value: '3,241', change: -2.4, trend: 'down' },
  { label: 'Conversion Rate', value: '4.32%', change: 0.8, trend: 'up' },
  { label: 'Avg. Session', value: '4m 23s', trend: 'neutral' },
]

export default function DataCard({
  id,
  className,
  title = 'Analytics Overview',
  subtitle,
  data = defaultData,
  layout = 'vertical',
  showDividers = true,
  variant = 'default',
}: DataCardProps) {
  const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      )
    }
    if (trend === 'down') {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    )
  }

  const layoutClasses = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row flex-wrap',
    grid: 'grid grid-cols-2',
  }

  const dividerClasses = {
    vertical: 'divide-y divide-gray-200 dark:divide-gray-700',
    horizontal: '',
    grid: '',
  }

  if (variant === 'compact') {
    return (
      <div id={id} className={cn('p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
        {title && <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{title}</h4>}
        <div className="flex flex-wrap gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{item.value}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
              {item.trend && <TrendIcon trend={item.trend} />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div id={id} className={cn('bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden', className)}>
        {(title || subtitle) && (
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            {title && <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
        )}
        <div className={cn(layoutClasses[layout], showDividers && dividerClasses[layout])}>
          {data.map((item, index) => (
            <div
              key={index}
              className={cn(
                'px-5 py-4',
                layout === 'horizontal' && 'flex-1 min-w-[150px]',
                layout === 'grid' && 'border-b border-r border-gray-200 dark:border-gray-800 last:border-r-0 [&:nth-last-child(-n+2)]:border-b-0'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                {item.change !== undefined && (
                  <span className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    item.trend === 'up' && 'text-green-600 dark:text-green-400',
                    item.trend === 'down' && 'text-red-600 dark:text-red-400',
                    item.trend === 'neutral' && 'text-gray-500'
                  )}>
                    <TrendIcon trend={item.trend} />
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      {title && <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>}
      <div className={cn(layoutClasses[layout], showDividers && dividerClasses[layout], 'gap-4')}>
        {data.map((item, index) => (
          <div
            key={index}
            className={cn(
              layout === 'vertical' && 'py-3 first:pt-0 last:pb-0',
              layout === 'horizontal' && 'flex-1 min-w-[120px]',
              layout === 'grid' && 'p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
              {item.trend && <TrendIcon trend={item.trend} />}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-semibold text-gray-900 dark:text-white">{item.value}</span>
              {item.change !== undefined && (
                <span className={cn(
                  'text-xs font-medium',
                  item.trend === 'up' && 'text-green-600',
                  item.trend === 'down' && 'text-red-600',
                  item.trend === 'neutral' && 'text-gray-500'
                )}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

DataCard.displayName = 'DataCard'

DataCard.config = {
  id: 'data-card',
  name: 'Data Card',
  category: 'dashboard',
  description: 'Multi-metric data summary card',
  defaultProps: { layout: 'vertical', showDividers: true, variant: 'default' },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'data', label: 'Data', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['vertical', 'horizontal', 'grid'] },
    { name: 'showDividers', label: 'Show Dividers', type: 'boolean' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'compact', 'detailed'] },
  ],
}
