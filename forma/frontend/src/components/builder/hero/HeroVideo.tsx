'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { HeroProps } from '../types'

interface HeroVideoProps extends HeroProps {
  videoUrl?: string
  videoPoster?: string
  overlayOpacity?: number
}

const sizeClasses = {
  sm: 'min-h-[400px]',
  md: 'min-h-[500px]',
  lg: 'min-h-[600px]',
  xl: 'min-h-screen',
}

export default function HeroVideo({
  id,
  className,
  styles,
  headline = 'Experience the future',
  subheadline = 'Immersive video backgrounds that captivate your audience and tell your story.',
  ctaText = 'Get Started',
  ctaLink = '#',
  secondaryCtaText = 'Watch Demo',
  secondaryCtaLink = '#',
  videoUrl,
  videoPoster,
  overlayOpacity = 50,
  textAlign = 'center',
  size = 'lg',
  editable,
  onEdit,
}: HeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true)

  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      style={styles}
    >
      {/* Video Background */}
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={videoPoster}
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
            {/* Animated placeholder */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className={cn(
        'relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
        textAlign === 'center' && 'text-center',
        textAlign === 'left' && 'text-left',
        textAlign === 'right' && 'text-right'
      )}>
        {/* Badge */}
        <div className={cn(
          'mb-6',
          textAlign === 'center' && 'flex justify-center',
          textAlign === 'right' && 'flex justify-end'
        )}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Now Streaming
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6"
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEdit('headline')}
        >
          {headline}
        </h1>

        {/* Subheadline */}
        <p
          className={cn(
            'text-lg sm:text-xl text-white/80 mb-10 leading-relaxed',
            textAlign === 'center' && 'max-w-2xl mx-auto'
          )}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEdit('subheadline')}
        >
          {subheadline}
        </p>

        {/* CTAs */}
        <div className={cn(
          'flex flex-col sm:flex-row gap-4',
          textAlign === 'center' && 'justify-center',
          textAlign === 'right' && 'justify-end'
        )}>
          <a
            href={ctaLink}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {ctaText}
          </a>
          {secondaryCtaText && (
            <a
              href={secondaryCtaLink}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {secondaryCtaText}
            </a>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}

HeroVideo.displayName = 'HeroVideo'

HeroVideo.config = {
  id: 'hero-video',
  name: 'Hero Video',
  category: 'hero',
  description: 'Full-screen hero with video background',
  defaultProps: {
    headline: 'Experience the future',
    subheadline: 'Immersive video backgrounds that captivate your audience.',
    ctaText: 'Get Started',
    ctaLink: '#',
    secondaryCtaText: 'Watch Demo',
    secondaryCtaLink: '#',
    overlayOpacity: 50,
    textAlign: 'center',
    size: 'lg',
  },
  editableFields: [
    { name: 'headline', label: 'Headline', type: 'text', defaultValue: 'Experience the future' },
    { name: 'subheadline', label: 'Subheadline', type: 'textarea' },
    { name: 'videoUrl', label: 'Video URL', type: 'url' },
    { name: 'videoPoster', label: 'Video Poster', type: 'image' },
    { name: 'overlayOpacity', label: 'Overlay Opacity (%)', type: 'number', defaultValue: 50 },
    { name: 'ctaText', label: 'CTA Text', type: 'text', defaultValue: 'Get Started' },
    { name: 'ctaLink', label: 'CTA Link', type: 'url' },
    { name: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text' },
    { name: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  ],
}
