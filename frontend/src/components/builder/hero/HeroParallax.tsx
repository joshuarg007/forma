'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface HeroParallaxProps extends ModuleProps {
  headline?: string
  subheadline?: string
  ctaText?: string
  ctaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  backgroundImage?: string
  overlayOpacity?: number
  overlayColor?: 'black' | 'gradient'
  parallaxSpeed?: number
  size?: 'md' | 'lg' | 'xl' | 'full'
  textAlign?: 'left' | 'center' | 'right'
  showScrollIndicator?: boolean
}

const sizeClasses = {
  md: 'min-h-[60vh]',
  lg: 'min-h-[80vh]',
  xl: 'min-h-[90vh]',
  full: 'min-h-screen',
}

export default function HeroParallax({
  id,
  className,
  styles,
  headline = 'Experience the future of web design',
  subheadline = 'Create immersive experiences with stunning parallax effects and modern design patterns.',
  ctaText = 'Start Building',
  ctaLink = '#',
  secondaryCtaText = 'Watch Demo',
  secondaryCtaLink = '#',
  backgroundImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920',
  overlayOpacity = 60,
  overlayColor = 'gradient',
  parallaxSpeed = 0.5,
  size = 'full',
  textAlign = 'center',
  showScrollIndicator = true,
}: HeroParallaxProps) {
  const [scrollY, setScrollY] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          setScrollY(window.scrollY)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const parallaxOffset = scrollY * parallaxSpeed

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn(
        'relative overflow-hidden flex items-center',
        sizeClasses[size],
        className
      )}
      style={styles}
    >
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 w-full h-[120%] -top-[10%] bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          transform: `translateY(${parallaxOffset}px)`,
          willChange: 'transform',
        }}
      />

      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0',
          overlayColor === 'black' && 'bg-black',
          overlayColor === 'gradient' && 'bg-gradient-to-b from-black/80 via-black/50 to-black/80'
        )}
        style={{ opacity: overlayColor === 'black' ? overlayOpacity / 100 : 1 }}
      />

      {/* Content */}
      <div className={cn(
        'relative z-10 w-full px-4',
        textAlign === 'left' && 'text-left',
        textAlign === 'center' && 'text-center',
        textAlign === 'right' && 'text-right'
      )}>
        <div className={cn(
          'max-w-5xl',
          textAlign === 'center' && 'mx-auto',
          textAlign === 'right' && 'ml-auto'
        )}>
          {/* Headline */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            style={{
              transform: `translateY(${parallaxOffset * 0.3}px)`,
            }}
          >
            {headline}
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              'text-xl md:text-2xl text-white/80 mb-10 max-w-3xl leading-relaxed',
              textAlign === 'center' && 'mx-auto'
            )}
            style={{
              transform: `translateY(${parallaxOffset * 0.2}px)`,
            }}
          >
            {subheadline}
          </p>

          {/* CTAs */}
          <div
            className={cn(
              'flex flex-wrap gap-4',
              textAlign === 'center' && 'justify-center',
              textAlign === 'right' && 'justify-end'
            )}
            style={{
              transform: `translateY(${parallaxOffset * 0.1}px)`,
            }}
          >
            <a
              href={ctaLink}
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
            >
              {ctaText}
            </a>
            {secondaryCtaText && (
              <a
                href={secondaryCtaLink}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                {secondaryCtaText}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 text-white/60 animate-bounce">
            <span className="text-sm font-medium">Scroll</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}
    </section>
  )
}

HeroParallax.displayName = 'HeroParallax'

HeroParallax.config = {
  id: 'hero-parallax',
  name: 'Hero Parallax',
  category: 'hero',
  description: 'Hero section with parallax scrolling effect',
  defaultProps: {
    headline: 'Experience the future of web design',
    subheadline: 'Create immersive experiences with stunning parallax effects and modern design patterns.',
    ctaText: 'Start Building',
    ctaLink: '#',
    secondaryCtaText: 'Watch Demo',
    secondaryCtaLink: '#',
    backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920',
    overlayOpacity: 60,
    overlayColor: 'gradient',
    parallaxSpeed: 0.5,
    size: 'full',
    textAlign: 'center',
    showScrollIndicator: true,
  },
  editableFields: [
    { name: 'headline', label: 'Headline', type: 'text' },
    { name: 'subheadline', label: 'Subheadline', type: 'textarea' },
    { name: 'ctaText', label: 'CTA Text', type: 'text' },
    { name: 'ctaLink', label: 'CTA Link', type: 'url' },
    { name: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text' },
    { name: 'secondaryCtaLink', label: 'Secondary CTA Link', type: 'url' },
    { name: 'backgroundImage', label: 'Background Image', type: 'image' },
    { name: 'overlayOpacity', label: 'Overlay Opacity (%)', type: 'number', defaultValue: 60 },
    { name: 'overlayColor', label: 'Overlay Color', type: 'select', options: ['black', 'gradient'], defaultValue: 'gradient' },
    { name: 'parallaxSpeed', label: 'Parallax Speed', type: 'number', defaultValue: 0.5 },
    { name: 'size', label: 'Size', type: 'select', options: ['md', 'lg', 'xl', 'full'], defaultValue: 'full' },
    { name: 'textAlign', label: 'Text Align', type: 'select', options: ['left', 'center', 'right'], defaultValue: 'center' },
    { name: 'showScrollIndicator', label: 'Show Scroll Indicator', type: 'boolean', defaultValue: true },
  ],
}
