'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface CarouselSlide {
  image?: string
  title?: string
  description?: string
  ctaText?: string
  ctaLink?: string
}

interface CarouselProps extends ModuleProps {
  slides?: CarouselSlide[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showArrows?: boolean
  showDots?: boolean
  showContent?: boolean
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9'
  rounded?: 'none' | 'md' | 'lg' | 'xl' | '2xl'
  effect?: 'slide' | 'fade'
}

const defaultSlides: CarouselSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
    title: 'Discover Amazing Places',
    description: 'Explore breathtaking destinations around the world.',
    ctaText: 'Explore Now',
    ctaLink: '#',
  },
  {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    title: 'Adventure Awaits',
    description: 'Begin your journey to unforgettable experiences.',
    ctaText: 'Start Journey',
    ctaLink: '#',
  },
  {
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
    title: 'Nature\'s Beauty',
    description: 'Immerse yourself in the wonders of nature.',
    ctaText: 'Learn More',
    ctaLink: '#',
  },
]

const aspectRatioClasses = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '21:9': 'aspect-[21/9]',
}

const roundedClasses = {
  none: 'rounded-none',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
}

export default function Carousel({
  id,
  className,
  styles,
  slides = defaultSlides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  showContent = true,
  aspectRatio = '16:9',
  rounded = 'xl',
  effect = 'slide',
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning])

  const goToPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + slides.length) % slides.length)
  }, [currentIndex, slides.length, goToSlide])

  const goToNext = useCallback(() => {
    goToSlide((currentIndex + 1) % slides.length)
  }, [currentIndex, slides.length, goToSlide])

  // Auto play
  useEffect(() => {
    if (!autoPlay) return
    const interval = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, goToNext])

  return (
    <div
      id={id}
      className={cn('relative overflow-hidden', roundedClasses[rounded], className)}
      style={styles}
    >
      {/* Slides container */}
      <div className={cn('relative', aspectRatioClasses[aspectRatio])}>
        {effect === 'slide' ? (
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 relative">
                {slide.image && (
                  <img
                    src={slide.image}
                    alt={slide.title || `Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlay */}
                {showContent && (slide.title || slide.description) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                )}

                {/* Content */}
                {showContent && (slide.title || slide.description) && (
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    {slide.title && (
                      <h3 className="text-3xl font-bold text-white mb-2">{slide.title}</h3>
                    )}
                    {slide.description && (
                      <p className="text-white/80 text-lg mb-4 max-w-xl">{slide.description}</p>
                    )}
                    {slide.ctaText && (
                      <a
                        href={slide.ctaLink || '#'}
                        className="inline-block px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-white/90 transition-colors"
                      >
                        {slide.ctaText}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Fade effect
          <div className="relative h-full">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={cn(
                  'absolute inset-0 transition-opacity duration-500',
                  index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
              >
                {slide.image && (
                  <img
                    src={slide.image}
                    alt={slide.title || `Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlay */}
                {showContent && (slide.title || slide.description) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                )}

                {/* Content */}
                {showContent && (slide.title || slide.description) && (
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    {slide.title && (
                      <h3 className="text-3xl font-bold text-white mb-2">{slide.title}</h3>
                    )}
                    {slide.description && (
                      <p className="text-white/80 text-lg mb-4 max-w-xl">{slide.description}</p>
                    )}
                    {slide.ctaText && (
                      <a
                        href={slide.ctaLink || '#'}
                        className="inline-block px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-white/90 transition-colors"
                      >
                        {slide.ctaText}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

Carousel.displayName = 'Carousel'

Carousel.config = {
  id: 'carousel',
  name: 'Carousel',
  category: 'media',
  description: 'Image/content carousel with autoplay',
  defaultProps: {
    slides: defaultSlides,
    autoPlay: true,
    autoPlayInterval: 5000,
    showArrows: true,
    showDots: true,
    showContent: true,
    aspectRatio: '16:9',
    rounded: 'xl',
    effect: 'slide',
  },
  editableFields: [
    { name: 'slides', label: 'Slides', type: 'array' },
    { name: 'autoPlay', label: 'Auto Play', type: 'boolean', defaultValue: true },
    { name: 'autoPlayInterval', label: 'Auto Play Interval (ms)', type: 'number', defaultValue: 5000 },
    { name: 'showArrows', label: 'Show Arrows', type: 'boolean', defaultValue: true },
    { name: 'showDots', label: 'Show Dots', type: 'boolean', defaultValue: true },
    { name: 'showContent', label: 'Show Content', type: 'boolean', defaultValue: true },
    { name: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '4:3', '1:1', '21:9'], defaultValue: '16:9' },
    { name: 'rounded', label: 'Rounded', type: 'select', options: ['none', 'md', 'lg', 'xl', '2xl'], defaultValue: 'xl' },
    { name: 'effect', label: 'Effect', type: 'select', options: ['slide', 'fade'], defaultValue: 'slide' },
  ],
}
