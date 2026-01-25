'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface GalleryImage {
  src: string
  alt?: string
  caption?: string
}

interface GalleryProps extends ModuleProps {
  images?: GalleryImage[]
  layout?: 'grid' | 'masonry' | 'carousel'
  columns?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  showLightbox?: boolean
  showCaptions?: boolean
}

const defaultImages: GalleryImage[] = [
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: 'Mountain landscape', caption: 'Beautiful mountain scenery' },
  { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', alt: 'Nature', caption: 'Peaceful nature view' },
  { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800', alt: 'Forest', caption: 'Dense forest path' },
  { src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800', alt: 'Valley', caption: 'Green valley vista' },
  { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', alt: 'Foggy mountains', caption: 'Misty morning mountains' },
  { src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800', alt: 'Woods', caption: 'Sunlit woodland' },
]

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

const columnClasses = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
}

export default function Gallery({
  id,
  className,
  styles,
  images = defaultImages,
  layout = 'grid',
  columns = 3,
  gap = 'md',
  rounded = 'lg',
  showLightbox = true,
  showCaptions = true,
}: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    if (showLightbox) {
      setLightboxIndex(index)
    }
  }

  const closeLightbox = () => setLightboxIndex(null)

  const goToPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
    }
  }

  const goToNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length)
    }
  }

  // Masonry layout
  if (layout === 'masonry') {
    return (
      <div id={id} className={className} style={styles}>
        <div className={cn('columns-1 sm:columns-2 lg:columns-3', gapClasses[gap])}>
          {images.map((image, index) => (
            <div
              key={index}
              className={cn('break-inside-avoid mb-4 cursor-pointer group')}
              onClick={() => openLightbox(index)}
            >
              <div className={cn('overflow-hidden', roundedClasses[rounded])}>
                <img
                  src={image.src}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {showCaptions && image.caption && (
                <p className="mt-2 text-sm text-gray-600">{image.caption}</p>
              )}
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {showLightbox && lightboxIndex !== null && (
          <Lightbox
            images={images}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onPrev={goToPrev}
            onNext={goToNext}
          />
        )}
      </div>
    )
  }

  // Grid layout (default)
  return (
    <div id={id} className={className} style={styles}>
      <div className={cn('grid', columnClasses[columns], gapClasses[gap])}>
        {images.map((image, index) => (
          <div
            key={index}
            className="cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <div className={cn('overflow-hidden aspect-square', roundedClasses[rounded])}>
              <img
                src={image.src}
                alt={image.alt || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {showCaptions && image.caption && (
              <p className="mt-2 text-sm text-gray-600">{image.caption}</p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {showLightbox && lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}
    </div>
  )
}

// Lightbox component
function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation buttons */}
      <button
        onClick={onPrev}
        className="absolute left-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Image */}
      <div className="relative z-10 max-w-5xl max-h-[80vh] mx-4">
        <img
          src={currentImage.src}
          alt={currentImage.alt || ''}
          className="max-w-full max-h-[80vh] object-contain"
        />
        {currentImage.caption && (
          <p className="text-center text-white/80 mt-4">{currentImage.caption}</p>
        )}
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}

Gallery.displayName = 'Gallery'

Gallery.config = {
  id: 'gallery',
  name: 'Gallery',
  category: 'media',
  description: 'Image gallery with lightbox',
  defaultProps: {
    images: defaultImages,
    layout: 'grid',
    columns: 3,
    gap: 'md',
    rounded: 'lg',
    showLightbox: true,
    showCaptions: true,
  },
  editableFields: [
    { name: 'images', label: 'Images', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['grid', 'masonry'], defaultValue: 'grid' },
    { name: 'columns', label: 'Columns', type: 'select', options: ['2', '3', '4'], defaultValue: '3' },
    { name: 'gap', label: 'Gap', type: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
    { name: 'rounded', label: 'Rounded', type: 'select', options: ['none', 'sm', 'md', 'lg', 'xl'], defaultValue: 'lg' },
    { name: 'showLightbox', label: 'Show Lightbox', type: 'boolean', defaultValue: true },
    { name: 'showCaptions', label: 'Show Captions', type: 'boolean', defaultValue: true },
  ],
}
