'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface StatsCardProps extends ModuleProps {
  value?: string
  label?: string
  description?: string
  icon?: 'users' | 'chart' | 'dollar' | 'growth' | 'cart' | 'heart' | 'star' | 'clock'
  trend?: number
  trendLabel?: string
  variant?: 'simple' | 'bordered' | 'elevated' | 'gradient'
  iconPosition?: 'left' | 'top'
  showTrend?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const icons: Record<string, React.ReactNode> = {
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  dollar: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  growth: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  cart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  heart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  star: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const sizeClasses = {
  sm: { value: 'text-2xl', label: 'text-xs', icon: 'p-2' },
  md: { value: 'text-3xl', label: 'text-sm', icon: 'p-3' },
  lg: { value: 'text-4xl', label: 'text-base', icon: 'p-4' },
}

export default function StatsCard({
  id,
  className,
  styles,
  value = '24,589',
  label = 'Total Users',
  description,
  icon = 'users',
  trend = 12.5,
  trendLabel = 'vs last month',
  variant = 'elevated',
  iconPosition = 'left',
  showTrend = true,
  size = 'md',
}: StatsCardProps) {
  const isGradient = variant === 'gradient'
  const isPositiveTrend = trend >= 0

  return (
    <div
      id={id}
      className={cn(
        'p-6 rounded-2xl',
        variant === 'simple' && 'bg-white',
        variant === 'bordered' && 'bg-white border border-gray-200',
        variant === 'elevated' && 'bg-white shadow-lg',
        variant === 'gradient' && 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white',
        className
      )}
      style={styles}
    >
      <div className={cn(
        'flex',
        iconPosition === 'top' ? 'flex-col gap-4' : 'items-start gap-4'
      )}>
        {/* Icon */}
        <div className={cn(
          'rounded-xl flex-shrink-0',
          sizeClasses[size].icon,
          isGradient
            ? 'bg-white/20 text-white'
            : 'bg-indigo-100 text-indigo-600'
        )}>
          {icons[icon]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-bold mb-1',
            sizeClasses[size].value,
            isGradient ? 'text-white' : 'text-gray-900'
          )}>
            {value}
          </p>
          <p className={cn(
            'font-medium',
            sizeClasses[size].label,
            isGradient ? 'text-indigo-100' : 'text-gray-500'
          )}>
            {label}
          </p>
          {description && (
            <p className={cn(
              'text-xs mt-1',
              isGradient ? 'text-indigo-200' : 'text-gray-400'
            )}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Trend */}
      {showTrend && trend !== undefined && (
        <div className={cn(
          'flex items-center gap-1.5 mt-4 pt-4',
          isGradient ? 'border-t border-white/20' : 'border-t border-gray-100'
        )}>
          <div className={cn(
            'flex items-center gap-0.5 text-sm font-medium',
            isGradient
              ? isPositiveTrend ? 'text-green-300' : 'text-red-300'
              : isPositiveTrend ? 'text-green-600' : 'text-red-600'
          )}>
            {isPositiveTrend ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
          <span className={cn(
            'text-sm',
            isGradient ? 'text-indigo-200' : 'text-gray-500'
          )}>
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  )
}

StatsCard.displayName = 'StatsCard'

StatsCard.config = {
  id: 'stats-card',
  name: 'Stats Card',
  category: 'data-display',
  description: 'Statistics card with icon, value, and trend indicator',
  defaultProps: {
    value: '24,589',
    label: 'Total Users',
    icon: 'users',
    trend: 12.5,
    trendLabel: 'vs last month',
    variant: 'elevated',
    iconPosition: 'left',
    showTrend: true,
    size: 'md',
  },
  editableFields: [
    { name: 'value', label: 'Value', type: 'text', defaultValue: '24,589' },
    { name: 'label', label: 'Label', type: 'text', defaultValue: 'Total Users' },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'icon', label: 'Icon', type: 'select', options: ['users', 'chart', 'dollar', 'growth', 'cart', 'heart', 'star', 'clock'], defaultValue: 'users' },
    { name: 'trend', label: 'Trend (%)', type: 'number', defaultValue: 12.5 },
    { name: 'trendLabel', label: 'Trend Label', type: 'text', defaultValue: 'vs last month' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['simple', 'bordered', 'elevated', 'gradient'], defaultValue: 'elevated' },
    { name: 'iconPosition', label: 'Icon Position', type: 'select', options: ['left', 'top'], defaultValue: 'left' },
    { name: 'showTrend', label: 'Show Trend', type: 'boolean', defaultValue: true },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
  ],
}
