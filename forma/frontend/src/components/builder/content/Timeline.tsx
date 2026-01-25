'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface TimelineItem {
  title: string
  description: string
  date?: string
  icon?: 'check' | 'star' | 'rocket' | 'flag' | 'heart' | 'lightning'
  status?: 'completed' | 'current' | 'upcoming'
}

interface TimelineProps extends ModuleProps {
  items?: TimelineItem[]
  layout?: 'vertical' | 'horizontal' | 'alternating'
  lineStyle?: 'solid' | 'dashed' | 'dotted'
  showIcons?: boolean
  animated?: boolean
}

const defaultItems: TimelineItem[] = [
  { title: 'Project Started', description: 'Initial project kickoff and planning phase completed.', date: 'Jan 2024', icon: 'flag', status: 'completed' },
  { title: 'Design Phase', description: 'UI/UX design and prototyping finished successfully.', date: 'Feb 2024', icon: 'star', status: 'completed' },
  { title: 'Development', description: 'Core features implementation is currently in progress.', date: 'Mar 2024', icon: 'rocket', status: 'current' },
  { title: 'Testing', description: 'Comprehensive testing and quality assurance.', date: 'Apr 2024', icon: 'check', status: 'upcoming' },
  { title: 'Launch', description: 'Public release and go-to-market execution.', date: 'May 2024', icon: 'lightning', status: 'upcoming' },
]

const icons: Record<string, React.ReactNode> = {
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  star: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  rocket: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  flag: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  heart: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ),
  lightning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
  ),
}

const statusColors = {
  completed: 'bg-green-500 text-white',
  current: 'bg-indigo-600 text-white ring-4 ring-indigo-100',
  upcoming: 'bg-gray-200 text-gray-500',
}

const lineColors = {
  completed: 'bg-green-500',
  current: 'bg-indigo-600',
  upcoming: 'bg-gray-200',
}

export default function Timeline({
  id,
  className,
  styles,
  items = defaultItems,
  layout = 'vertical',
  lineStyle = 'solid',
  showIcons = true,
  animated = true,
}: TimelineProps) {
  if (layout === 'horizontal') {
    return (
      <div id={id} className={cn('overflow-x-auto py-8', className)} style={styles}>
        <div className="flex items-start min-w-max px-4">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                'relative flex flex-col items-center',
                animated && 'animate-fade-in',
                index < items.length - 1 && 'flex-1 min-w-[200px]'
              )}
              style={animated ? { animationDelay: `${index * 150}ms` } : undefined}
            >
              {/* Line */}
              {index < items.length - 1 && (
                <div
                  className={cn(
                    'absolute top-5 left-1/2 w-full h-0.5',
                    lineColors[item.status || 'upcoming'],
                    lineStyle === 'dashed' && 'border-t-2 border-dashed bg-transparent',
                    lineStyle === 'dotted' && 'border-t-2 border-dotted bg-transparent'
                  )}
                  style={lineStyle !== 'solid' ? { borderColor: item.status === 'completed' ? '#22c55e' : item.status === 'current' ? '#4f46e5' : '#e5e7eb' } : undefined}
                />
              )}

              {/* Icon/Dot */}
              <div className={cn(
                'relative z-10 w-10 h-10 rounded-full flex items-center justify-center',
                statusColors[item.status || 'upcoming']
              )}>
                {showIcons && item.icon ? icons[item.icon] : (
                  <span className="w-3 h-3 bg-current rounded-full" />
                )}
              </div>

              {/* Content */}
              <div className="mt-4 text-center max-w-[180px]">
                {item.date && (
                  <span className="text-sm font-medium text-indigo-600 mb-1 block">{item.date}</span>
                )}
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (layout === 'alternating') {
    return (
      <div id={id} className={cn('relative', className)} style={styles}>
        {/* Center line */}
        <div className={cn(
          'absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2',
          lineStyle === 'solid' && 'bg-gray-200',
          lineStyle === 'dashed' && 'border-l-2 border-dashed border-gray-300',
          lineStyle === 'dotted' && 'border-l-2 border-dotted border-gray-300'
        )} />

        {items.map((item, index) => {
          const isLeft = index % 2 === 0
          return (
            <div
              key={index}
              className={cn(
                'relative flex items-center mb-8 last:mb-0',
                animated && 'animate-fade-in'
              )}
              style={animated ? { animationDelay: `${index * 150}ms` } : undefined}
            >
              {/* Left content */}
              <div className={cn('w-1/2 pr-8', !isLeft && 'invisible')}>
                <div className="text-right">
                  {item.date && (
                    <span className="text-sm font-medium text-indigo-600 mb-1 block">{item.date}</span>
                  )}
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>

              {/* Center icon */}
              <div className={cn(
                'absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10',
                statusColors[item.status || 'upcoming']
              )}>
                {showIcons && item.icon ? icons[item.icon] : (
                  <span className="w-3 h-3 bg-current rounded-full" />
                )}
              </div>

              {/* Right content */}
              <div className={cn('w-1/2 pl-8', isLeft && 'invisible')}>
                <div>
                  {item.date && (
                    <span className="text-sm font-medium text-indigo-600 mb-1 block">{item.date}</span>
                  )}
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Vertical layout (default)
  return (
    <div id={id} className={cn('relative pl-8', className)} style={styles}>
      {/* Vertical line */}
      <div className={cn(
        'absolute left-[15px] top-0 bottom-0 w-0.5',
        lineStyle === 'solid' && 'bg-gray-200',
        lineStyle === 'dashed' && 'border-l-2 border-dashed border-gray-300',
        lineStyle === 'dotted' && 'border-l-2 border-dotted border-gray-300'
      )} />

      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            'relative pb-8 last:pb-0',
            animated && 'animate-fade-in'
          )}
          style={animated ? { animationDelay: `${index * 150}ms` } : undefined}
        >
          {/* Icon/Dot */}
          <div className={cn(
            'absolute -left-8 w-8 h-8 rounded-full flex items-center justify-center',
            statusColors[item.status || 'upcoming']
          )}>
            {showIcons && item.icon ? icons[item.icon] : (
              <span className="w-2.5 h-2.5 bg-current rounded-full" />
            )}
          </div>

          {/* Content */}
          <div className="ml-4">
            {item.date && (
              <span className="text-sm font-medium text-indigo-600 mb-1 block">{item.date}</span>
            )}
            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
            <p className="text-gray-500">{item.description}</p>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}

Timeline.displayName = 'Timeline'

Timeline.config = {
  id: 'timeline',
  name: 'Timeline',
  category: 'content',
  description: 'Timeline for displaying chronological events',
  defaultProps: {
    items: defaultItems,
    layout: 'vertical',
    lineStyle: 'solid',
    showIcons: true,
    animated: true,
  },
  editableFields: [
    { name: 'items', label: 'Timeline Items', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['vertical', 'horizontal', 'alternating'], defaultValue: 'vertical' },
    { name: 'lineStyle', label: 'Line Style', type: 'select', options: ['solid', 'dashed', 'dotted'], defaultValue: 'solid' },
    { name: 'showIcons', label: 'Show Icons', type: 'boolean', defaultValue: true },
    { name: 'animated', label: 'Animated', type: 'boolean', defaultValue: true },
  ],
}
