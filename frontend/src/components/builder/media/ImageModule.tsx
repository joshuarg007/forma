'use client'

import { cn } from '@/lib/utils'
import type { ImageProps } from '../types'

const aspectRatioClasses = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '21:9': 'aspect-[21/9]',
  'auto': '',
}

const objectFitClasses = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
}

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}

export default function ImageModule({
  id,
  className,
  styles,
  src,
  alt = 'Image',
  aspectRatio = 'auto',
  objectFit = 'cover',
  rounded = 'md',
  shadow = 'none',
  caption,
  editable,
  onEdit,
}: ImageProps) {
  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  if (!src) {
    return (
      <div
        id={id}
        className={cn(
          'bg-gray-100 flex items-center justify-center text-gray-400',
          aspectRatioClasses[aspectRatio] || 'min-h-[200px]',
          roundedClasses[rounded],
          shadowClasses[shadow],
          className
        )}
        style={styles}
      >
        <div className="text-center p-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium">Add Image</p>
          <p className="text-xs mt-1">Click to upload or drag and drop</p>
        </div>
      </div>
    )
  }

  return (
    <figure id={id} className={cn('', className)} style={styles}>
      <div
        className={cn(
          'overflow-hidden',
          aspectRatioClasses[aspectRatio],
          roundedClasses[rounded],
          shadowClasses[shadow]
        )}
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full transition-transform duration-300 hover:scale-105',
            objectFitClasses[objectFit]
          )}
        />
      </div>
      {caption && (
        <figcaption
          className="mt-3 text-sm text-gray-500 text-center"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEdit('caption')}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

ImageModule.displayName = 'ImageModule'

ImageModule.config = {
  id: 'image',
  name: 'Image',
  category: 'media',
  description: 'Responsive image with customizable styling',
  defaultProps: {
    alt: 'Image',
    aspectRatio: 'auto',
    objectFit: 'cover',
    rounded: 'md',
    shadow: 'none',
  },
  editableFields: [
    { name: 'src', label: 'Image URL', type: 'image' },
    { name: 'alt', label: 'Alt Text', type: 'text', defaultValue: 'Image' },
    { name: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '4:3', '16:9', '21:9', 'auto'], defaultValue: 'auto' },
    { name: 'objectFit', label: 'Object Fit', type: 'select', options: ['cover', 'contain', 'fill'], defaultValue: 'cover' },
    { name: 'rounded', label: 'Rounded', type: 'select', options: ['none', 'sm', 'md', 'lg', 'full'], defaultValue: 'md' },
    { name: 'shadow', label: 'Shadow', type: 'select', options: ['none', 'sm', 'md', 'lg', 'xl'], defaultValue: 'none' },
    { name: 'caption', label: 'Caption', type: 'text' },
  ],
}
