'use client'

import { cn } from '@/lib/utils'
import type { FlexProps } from '../types'

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

export default function FlexColumn({
  id,
  className,
  styles,
  justify = 'start',
  align = 'stretch',
  gap = 'md',
  children,
}: FlexProps) {
  return (
    <div
      id={id}
      className={cn(
        'flex flex-col',
        justifyClasses[justify],
        alignClasses[align],
        gapClasses[gap],
        className
      )}
      style={styles}
    >
      {children || (
        <>
          <div className="w-full min-h-[80px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
            Item 1
          </div>
          <div className="w-full min-h-[80px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
            Item 2
          </div>
          <div className="w-full min-h-[80px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
            Item 3
          </div>
        </>
      )}
    </div>
  )
}

FlexColumn.displayName = 'FlexColumn'

FlexColumn.config = {
  id: 'flex-col',
  name: 'Flex Column',
  category: 'layout',
  description: 'Vertical flex container for column layouts',
  defaultProps: {
    justify: 'start',
    align: 'stretch',
    gap: 'md',
  },
  editableFields: [
    {
      name: 'justify',
      label: 'Justify Content',
      type: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
      defaultValue: 'start',
    },
    {
      name: 'align',
      label: 'Align Items',
      type: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      defaultValue: 'stretch',
    },
    {
      name: 'gap',
      label: 'Gap',
      type: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      defaultValue: 'md',
    },
  ],
}
