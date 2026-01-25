'use client'

import { cn } from '@/lib/utils'
import type { TextBlockProps } from '../types'

const variantClasses = {
  h1: 'text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight',
  h2: 'text-3xl sm:text-4xl font-bold leading-tight',
  h3: 'text-2xl sm:text-3xl font-semibold leading-snug',
  h4: 'text-xl sm:text-2xl font-semibold leading-snug',
  body: 'text-base leading-relaxed',
  lead: 'text-lg sm:text-xl leading-relaxed',
  small: 'text-sm leading-relaxed',
}

const alignmentClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export default function TextBlock({
  id,
  className,
  styles,
  content = 'Add your text here. Click to edit and customize your content.',
  variant = 'body',
  alignment = 'left',
  color,
  editable,
  onEdit,
}: TextBlockProps) {
  const handleEdit = (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit('content', e.currentTarget.textContent || '')
    }
  }

  const Tag = variant.startsWith('h') ? variant as 'h1' | 'h2' | 'h3' | 'h4' : 'p'

  return (
    <Tag
      id={id}
      className={cn(
        variantClasses[variant],
        alignmentClasses[alignment],
        color ? '' : 'text-gray-900',
        className
      )}
      style={{ color, ...styles }}
      contentEditable={editable}
      suppressContentEditableWarning
      onBlur={handleEdit}
    >
      {content}
    </Tag>
  )
}

TextBlock.displayName = 'TextBlock'

TextBlock.config = {
  id: 'heading',
  name: 'Text Block',
  category: 'content',
  description: 'Flexible text block for headings and paragraphs',
  defaultProps: {
    content: 'Add your text here. Click to edit and customize your content.',
    variant: 'body',
    alignment: 'left',
  },
  editableFields: [
    { name: 'content', label: 'Content', type: 'textarea', defaultValue: 'Add your text here...' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['h1', 'h2', 'h3', 'h4', 'body', 'lead', 'small'], defaultValue: 'body' },
    { name: 'alignment', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'], defaultValue: 'left' },
    { name: 'color', label: 'Text Color', type: 'color' },
  ],
}
