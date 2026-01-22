'use client'

import { cn } from '@/lib/utils'

interface Step {
  id: string
  title: string
  description?: string
  status: 'completed' | 'current' | 'upcoming'
}

interface ProgressTrackerProps {
  id?: string
  className?: string
  title?: string
  steps?: Step[]
  layout?: 'horizontal' | 'vertical'
  variant?: 'default' | 'numbered' | 'dots'
  showConnector?: boolean
}

const defaultSteps: Step[] = [
  { id: '1', title: 'Account Setup', description: 'Create your account', status: 'completed' },
  { id: '2', title: 'Profile Info', description: 'Add your details', status: 'completed' },
  { id: '3', title: 'Preferences', description: 'Set your preferences', status: 'current' },
  { id: '4', title: 'Confirmation', description: 'Review and confirm', status: 'upcoming' },
]

export default function ProgressTracker({
  id,
  className,
  title,
  steps = defaultSteps,
  layout = 'horizontal',
  variant = 'default',
  showConnector = true,
}: ProgressTrackerProps) {
  const completedCount = steps.filter((s) => s.status === 'completed').length
  const currentIndex = steps.findIndex((s) => s.status === 'current')
  const progress = ((completedCount + (currentIndex >= 0 ? 0.5 : 0)) / steps.length) * 100

  const StatusIcon = ({ status, index }: { status: string; index: number }) => {
    if (variant === 'numbered') {
      return (
        <span className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
          status === 'completed' && 'bg-green-500 text-white',
          status === 'current' && 'bg-indigo-600 text-white',
          status === 'upcoming' && 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        )}>
          {status === 'completed' ? '✓' : index + 1}
        </span>
      )
    }

    if (variant === 'dots') {
      return (
        <span className={cn(
          'w-4 h-4 rounded-full',
          status === 'completed' && 'bg-green-500',
          status === 'current' && 'bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/50',
          status === 'upcoming' && 'bg-gray-300 dark:bg-gray-600'
        )} />
      )
    }

    // Default variant
    return (
      <span className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        status === 'completed' && 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        status === 'current' && 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        status === 'upcoming' && 'bg-gray-100 dark:bg-gray-800 text-gray-400'
      )}>
        {status === 'completed' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : status === 'current' ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="6" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" strokeWidth={2} />
          </svg>
        )}
      </span>
    )
  }

  if (layout === 'vertical') {
    return (
      <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
        {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>}

        <div className="relative">
          {showConnector && (
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 dark:bg-gray-700">
              <div
                className="absolute top-0 left-0 w-full bg-indigo-500 transition-all duration-500"
                style={{ height: `${progress}%` }}
              />
            </div>
          )}

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex items-start gap-4">
                <StatusIcon status={step.status} index={index} />
                <div className="flex-1 pt-1">
                  <p className={cn(
                    'font-medium',
                    step.status === 'completed' && 'text-green-600 dark:text-green-400',
                    step.status === 'current' && 'text-gray-900 dark:text-white',
                    step.status === 'upcoming' && 'text-gray-400 dark:text-gray-500'
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Horizontal layout
  return (
    <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">{title}</h3>}

      <div className="relative">
        {showConnector && (
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 mx-12">
            <div
              className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center text-center">
              <StatusIcon status={step.status} index={index} />
              <p className={cn(
                'mt-2 text-sm font-medium max-w-[100px]',
                step.status === 'completed' && 'text-green-600 dark:text-green-400',
                step.status === 'current' && 'text-gray-900 dark:text-white',
                step.status === 'upcoming' && 'text-gray-400 dark:text-gray-500'
              )}>
                {step.title}
              </p>
              {variant !== 'dots' && step.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[100px] hidden sm:block">
                  {step.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

ProgressTracker.displayName = 'ProgressTracker'

ProgressTracker.config = {
  id: 'progress-tracker',
  name: 'Progress Tracker',
  category: 'interactive',
  description: 'Multi-step progress indicator',
  defaultProps: { layout: 'horizontal', variant: 'default', showConnector: true },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'steps', label: 'Steps', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['horizontal', 'vertical'] },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'numbered', 'dots'] },
    { name: 'showConnector', label: 'Show Connector', type: 'boolean' },
  ],
}
