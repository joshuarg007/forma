'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface HeroGradientProps extends ModuleProps {
  headline?: string
  subheadline?: string
  ctaText?: string
  ctaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  gradientFrom?: string
  gradientVia?: string
  gradientTo?: string
  gradientDirection?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl'
  animated?: boolean
  showBadge?: boolean
  badgeText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  textAlign?: 'left' | 'center' | 'right'
}

const sizeClasses = {
  sm: 'py-20',
  md: 'py-32',
  lg: 'py-40',
  xl: 'min-h-screen flex items-center',
}

const headlineSizes = {
  sm: 'text-3xl md:text-4xl',
  md: 'text-4xl md:text-5xl',
  lg: 'text-5xl md:text-6xl',
  xl: 'text-5xl md:text-7xl',
}

export default function HeroGradient({
  id,
  className,
  styles,
  headline = 'Build something amazing with our platform',
  subheadline = 'Create stunning websites and applications with our powerful tools and intuitive interface.',
  ctaText = 'Get Started Free',
  ctaLink = '#',
  secondaryCtaText = 'Learn More',
  secondaryCtaLink = '#',
  gradientFrom = '#667eea',
  gradientVia = '#764ba2',
  gradientTo = '#f093fb',
  gradientDirection = 'to-br',
  animated = true,
  showBadge = true,
  badgeText = 'New: Version 2.0 is here',
  size = 'lg',
  textAlign = 'center',
}: HeroGradientProps) {
  const gradientStyle = {
    background: `linear-gradient(${gradientDirection.replace('to-', 'to ')}, ${gradientFrom}, ${gradientVia}, ${gradientTo})`,
    backgroundSize: animated ? '400% 400%' : '100% 100%',
  }

  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden px-4',
        sizeClasses[size],
        animated && 'animate-gradient',
        className
      )}
      style={{ ...gradientStyle, ...styles }}
    >
      {/* Animated background elements */}
      {animated && (
        <>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500" />
          </div>
        </>
      )}

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      <div className={cn(
        'relative z-10 max-w-5xl mx-auto',
        textAlign === 'left' && 'text-left',
        textAlign === 'center' && 'text-center',
        textAlign === 'right' && 'text-right'
      )}>
        {/* Badge */}
        {showBadge && badgeText && (
          <div className={cn(
            'mb-6',
            textAlign === 'center' && 'flex justify-center',
            textAlign === 'right' && 'flex justify-end'
          )}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {badgeText}
            </span>
          </div>
        )}

        {/* Headline */}
        <h1 className={cn(
          'font-bold text-white mb-6 leading-tight',
          headlineSizes[size]
        )}>
          {headline}
        </h1>

        {/* Subheadline */}
        <p className={cn(
          'text-white/80 mb-10 leading-relaxed',
          size === 'sm' && 'text-lg max-w-2xl',
          size === 'md' && 'text-xl max-w-2xl',
          size === 'lg' && 'text-xl max-w-3xl',
          size === 'xl' && 'text-2xl max-w-3xl',
          textAlign === 'center' && 'mx-auto'
        )}>
          {subheadline}
        </p>

        {/* CTAs */}
        <div className={cn(
          'flex flex-wrap gap-4',
          textAlign === 'center' && 'justify-center',
          textAlign === 'right' && 'justify-end'
        )}>
          <a
            href={ctaLink}
            className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
          >
            {ctaText}
          </a>
          {secondaryCtaText && (
            <a
              href={secondaryCtaLink}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              {secondaryCtaText}
            </a>
          )}
        </div>
      </div>

      {/* CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </section>
  )
}

HeroGradient.displayName = 'HeroGradient'

HeroGradient.config = {
  id: 'hero-gradient',
  name: 'Hero Gradient',
  category: 'hero',
  description: 'Hero section with animated gradient background',
  defaultProps: {
    headline: 'Build something amazing with our platform',
    subheadline: 'Create stunning websites and applications with our powerful tools and intuitive interface.',
    ctaText: 'Get Started Free',
    ctaLink: '#',
    secondaryCtaText: 'Learn More',
    secondaryCtaLink: '#',
    gradientFrom: '#667eea',
    gradientVia: '#764ba2',
    gradientTo: '#f093fb',
    gradientDirection: 'to-br',
    animated: true,
    showBadge: true,
    badgeText: 'New: Version 2.0 is here',
    size: 'lg',
    textAlign: 'center',
  },
  editableFields: [
    { name: 'headline', label: 'Headline', type: 'text' },
    { name: 'subheadline', label: 'Subheadline', type: 'textarea' },
    { name: 'ctaText', label: 'CTA Text', type: 'text' },
    { name: 'ctaLink', label: 'CTA Link', type: 'url' },
    { name: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text' },
    { name: 'secondaryCtaLink', label: 'Secondary CTA Link', type: 'url' },
    { name: 'gradientFrom', label: 'Gradient From', type: 'color' },
    { name: 'gradientVia', label: 'Gradient Via', type: 'color' },
    { name: 'gradientTo', label: 'Gradient To', type: 'color' },
    { name: 'gradientDirection', label: 'Gradient Direction', type: 'select', options: ['to-r', 'to-l', 'to-t', 'to-b', 'to-br', 'to-bl', 'to-tr', 'to-tl'], defaultValue: 'to-br' },
    { name: 'animated', label: 'Animated', type: 'boolean', defaultValue: true },
    { name: 'showBadge', label: 'Show Badge', type: 'boolean', defaultValue: true },
    { name: 'badgeText', label: 'Badge Text', type: 'text' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg', 'xl'], defaultValue: 'lg' },
    { name: 'textAlign', label: 'Text Align', type: 'select', options: ['left', 'center', 'right'], defaultValue: 'center' },
  ],
}
