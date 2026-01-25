'use client'

import { cn } from '@/lib/utils'
import type { DividerProps } from '../types'

const variantClasses = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
}

const thicknessClasses = {
  thin: 'border-t',
  medium: 'border-t-2',
  thick: 'border-t-4',
}

const widthClasses = {
  full: 'w-full',
  half: 'w-1/2',
  third: 'w-1/3',
}

const marginClasses = {
  sm: 'my-4',
  md: 'my-8',
  lg: 'my-12',
}

export default function Divider({
  id,
  className,
  styles,
  variant = 'solid',
  color = '#e5e7eb',
  thickness = 'thin',
  width = 'full',
  margin = 'md',
}: DividerProps) {
  return (
    <div
      id={id}
      className={cn(
        'flex justify-center',
        marginClasses[margin],
        className
      )}
      style={styles}
    >
      <hr
        className={cn(
          variantClasses[variant],
          thicknessClasses[thickness],
          widthClasses[width],
          'border-0'
        )}
        style={{ borderTopColor: color, borderTopStyle: variant, borderTopWidth: thickness === 'thin' ? '1px' : thickness === 'medium' ? '2px' : '4px' }}
      />
    </div>
  )
}

Divider.displayName = 'Divider'

Divider.config = {
  id: 'divider',
  name: 'Divider',
  category: 'utility',
  description: 'Horizontal divider line',
  defaultProps: {
    variant: 'solid',
    color: '#e5e7eb',
    thickness: 'thin',
    width: 'full',
    margin: 'md',
  },
  editableFields: [
    { name: 'variant', label: 'Style', type: 'select', options: ['solid', 'dashed', 'dotted'], defaultValue: 'solid' },
    { name: 'color', label: 'Color', type: 'color', defaultValue: '#e5e7eb' },
    { name: 'thickness', label: 'Thickness', type: 'select', options: ['thin', 'medium', 'thick'], defaultValue: 'thin' },
    { name: 'width', label: 'Width', type: 'select', options: ['full', 'half', 'third'], defaultValue: 'full' },
    { name: 'margin', label: 'Margin', type: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
  ],
}
