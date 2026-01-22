'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  id?: string
  className?: string
  label?: string
  value?: number
  max?: number
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'custom'
  customColor?: string
  variant?: 'default' | 'striped' | 'gradient'
}

export default function ProgressBar({
  id,
  className,
  label = 'Progress',
  value = 65,
  max = 100,
  showValue = true,
  size = 'md',
  color = 'primary',
  customColor,
  variant = 'default',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  }

  const colors = {
    primary: 'bg-indigo-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    custom: '',
  }

  const gradients = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    success: 'bg-gradient-to-r from-green-400 to-emerald-500',
    warning: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    danger: 'bg-gradient-to-r from-red-400 to-pink-500',
    custom: '',
  }

  return (
    <div id={id} className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {value}/{max} ({Math.round(percentage)}%)
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            variant === 'gradient' ? gradients[color] : colors[color],
            variant === 'striped' && 'bg-stripes'
          )}
          style={{
            width: `${percentage}%`,
            backgroundColor: color === 'custom' ? customColor : undefined,
          }}
        />
      </div>
      <style jsx>{`
        .bg-stripes {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%,
            transparent
          );
          background-size: 1rem 1rem;
          animation: stripes 1s linear infinite;
        }
        @keyframes stripes {
          from { background-position: 1rem 0; }
          to { background-position: 0 0; }
        }
      `}</style>
    </div>
  )
}

ProgressBar.displayName = 'ProgressBar'

ProgressBar.config = {
  id: 'progress-bar',
  name: 'Progress Bar',
  category: 'dashboard',
  description: 'Progress tracking bar',
  defaultProps: { value: 65, max: 100, showValue: true, size: 'md', color: 'primary', variant: 'default' },
  editableFields: [
    { name: 'label', label: 'Label', type: 'text' },
    { name: 'value', label: 'Value', type: 'number' },
    { name: 'max', label: 'Max', type: 'number' },
    { name: 'showValue', label: 'Show Value', type: 'boolean' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'] },
    { name: 'color', label: 'Color', type: 'select', options: ['primary', 'success', 'warning', 'danger', 'custom'] },
    { name: 'customColor', label: 'Custom Color', type: 'color' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'striped', 'gradient'] },
  ],
}
