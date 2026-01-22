'use client'

import { cn } from '@/lib/utils'
import type { ContainerProps } from '../types'

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
}

const paddingClasses = {
  none: 'px-0',
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-8',
  xl: 'px-12',
}

export default function Container({
  id,
  className,
  styles,
  maxWidth = 'xl',
  centered = true,
  padding = 'md',
  children,
}: ContainerProps) {
  return (
    <div
      id={id}
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        centered && 'mx-auto',
        className
      )}
      style={styles}
    >
      {children || (
        <div className="min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
          <span>Drop content here</span>
        </div>
      )}
    </div>
  )
}

Container.displayName = 'Container'

Container.config = {
  id: 'container',
  name: 'Container',
  category: 'layout',
  description: 'Responsive container wrapper with max-width constraints',
  defaultProps: {
    maxWidth: 'xl',
    centered: true,
    padding: 'md',
  },
  editableFields: [
    {
      name: 'maxWidth',
      label: 'Max Width',
      type: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
      defaultValue: 'xl',
    },
    {
      name: 'centered',
      label: 'Centered',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'padding',
      label: 'Horizontal Padding',
      type: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      defaultValue: 'md',
    },
  ],
}
