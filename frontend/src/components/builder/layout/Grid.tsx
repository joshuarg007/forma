'use client'

import { cn } from '@/lib/utils'
import type { GridProps } from '../types'

const columnClasses = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
}

export default function Grid({
  id,
  className,
  styles,
  columns = 3,
  gap = 'md',
  children,
}: GridProps) {
  return (
    <div
      id={id}
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      style={styles}
    >
      {children || (
        <>
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className="min-h-[150px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400"
            >
              Column {i + 1}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

Grid.displayName = 'Grid'

Grid.config = {
  id: 'grid',
  name: 'Grid',
  category: 'layout',
  description: 'Responsive grid layout with customizable columns',
  defaultProps: {
    columns: 3,
    gap: 'md',
  },
  editableFields: [
    {
      name: 'columns',
      label: 'Columns',
      type: 'select',
      options: ['2', '3', '4', '6'],
      defaultValue: '3',
    },
    {
      name: 'gap',
      label: 'Gap',
      type: 'select',
      options: ['sm', 'md', 'lg'],
      defaultValue: 'md',
    },
  ],
}
