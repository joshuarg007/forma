'use client'

import { cn } from '@/lib/utils'

interface MetricCardProps {
  id?: string
  className?: string
  title?: string
  value?: string | number
  change?: number
  changeLabel?: string
  icon?: 'users' | 'revenue' | 'orders' | 'views' | 'growth' | 'custom'
  trend?: 'up' | 'down' | 'neutral'
  variant?: 'default' | 'compact' | 'large'
}

export default function MetricCard({
  id,
  className,
  title = 'Total Revenue',
  value = '$45,231',
  change = 12.5,
  changeLabel = 'from last month',
  icon = 'revenue',
  trend = 'up',
  variant = 'default',
}: MetricCardProps) {
  const icons = {
    users: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    revenue: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    orders: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    views: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    growth: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    custom: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  }

  const trendColors = {
    up: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    down: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
    neutral: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800',
  }

  if (variant === 'compact') {
    return (
      <div id={id} className={cn('p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={cn('p-2 rounded-lg', trendColors[trend])}>
            {icons[icon]}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'large') {
    return (
      <div id={id} className={cn('p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800', className)}>
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-3 rounded-xl', trendColors[trend])}>
            {icons[icon]}
          </div>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium', trendColors[trend])}>
              {trend === 'up' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : trend === 'down' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : null}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
        {changeLabel && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{changeLabel}</p>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className={cn('p-2 rounded-lg', trendColors[trend])}>
          {icons[icon]}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <span className={cn('flex items-center gap-1 text-sm font-medium', trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600')}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{Math.abs(change)}%
          </span>
          {changeLabel && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

MetricCard.displayName = 'MetricCard'

MetricCard.config = {
  id: 'metric-card',
  name: 'Metric Card',
  category: 'dashboard',
  description: 'KPI display with trend indicator',
  defaultProps: {
    icon: 'revenue',
    trend: 'up',
    variant: 'default',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'value', label: 'Value', type: 'text' },
    { name: 'change', label: 'Change %', type: 'number' },
    { name: 'changeLabel', label: 'Change Label', type: 'text' },
    { name: 'icon', label: 'Icon', type: 'select', options: ['users', 'revenue', 'orders', 'views', 'growth', 'custom'] },
    { name: 'trend', label: 'Trend', type: 'select', options: ['up', 'down', 'neutral'] },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'compact', 'large'] },
  ],
}
