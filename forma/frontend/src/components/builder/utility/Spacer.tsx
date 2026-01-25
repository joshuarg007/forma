'use client'

import { cn } from '@/lib/utils'
import type { SpacerProps } from '../types'

const heightClasses = {
  xs: 'h-4',
  sm: 'h-8',
  md: 'h-16',
  lg: 'h-24',
  xl: 'h-32',
  '2xl': 'h-48',
}

const responsiveClasses = {
  xs: 'h-2 md:h-4',
  sm: 'h-4 md:h-8',
  md: 'h-8 md:h-16',
  lg: 'h-12 md:h-24',
  xl: 'h-16 md:h-32',
  '2xl': 'h-24 md:h-48',
}

export default function Spacer({
  id,
  className,
  styles,
  height = 'md',
  responsive = false,
}: SpacerProps) {
  const heightClass = responsive ? responsiveClasses[height] : heightClasses[height]

  return (
    <div
      id={id}
      className={cn(
        'w-full',
        heightClass,
        // Show visual indicator in builder mode
        'relative group',
        className
      )}
      style={styles}
      aria-hidden="true"
    >
      {/* Visual indicator for builder */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span>Spacer ({height})</span>
        </div>
      </div>
    </div>
  )
}

Spacer.displayName = 'Spacer'

Spacer.config = {
  id: 'spacer',
  name: 'Spacer',
  category: 'utility',
  description: 'Adjustable vertical spacing',
  defaultProps: {
    height: 'md',
    responsive: false,
  },
  editableFields: [
    { name: 'height', label: 'Height', type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'], defaultValue: 'md' },
    { name: 'responsive', label: 'Responsive (smaller on mobile)', type: 'boolean', defaultValue: false },
  ],
}
