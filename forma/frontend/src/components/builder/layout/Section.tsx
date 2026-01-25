'use client'

import { cn } from '@/lib/utils'
import type { SectionProps } from '../types'

const backgroundClasses = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  dark: 'bg-gray-900 text-white',
  gradient: 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white',
  transparent: 'bg-transparent',
}

const paddingClasses = {
  sm: 'py-8 lg:py-12',
  md: 'py-12 lg:py-16',
  lg: 'py-16 lg:py-24',
  xl: 'py-24 lg:py-32',
}

export default function Section({
  id,
  className,
  styles,
  background = 'white',
  padding = 'lg',
  fullWidth = false,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        backgroundClasses[background],
        paddingClasses[padding],
        fullWidth ? 'w-full' : 'w-full px-4 sm:px-6 lg:px-8',
        className
      )}
      style={styles}
    >
      <div className={cn(!fullWidth && 'max-w-7xl mx-auto')}>
        {children || (
          <div className="min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="font-medium">Section</p>
              <p className="text-sm">Drop content here</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

Section.displayName = 'Section'

Section.config = {
  id: 'section',
  name: 'Section',
  category: 'layout',
  description: 'Full-width section with customizable background and padding',
  defaultProps: {
    background: 'white',
    padding: 'lg',
    fullWidth: false,
  },
  editableFields: [
    {
      name: 'background',
      label: 'Background',
      type: 'select',
      options: ['white', 'gray', 'dark', 'gradient', 'transparent'],
      defaultValue: 'white',
    },
    {
      name: 'padding',
      label: 'Vertical Padding',
      type: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      defaultValue: 'lg',
    },
    {
      name: 'fullWidth',
      label: 'Full Width',
      type: 'boolean',
      defaultValue: false,
    },
  ],
}
