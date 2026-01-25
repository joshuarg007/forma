'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { HeroProps } from '../types'

interface HeroAnimatedProps extends HeroProps {
  particleCount?: number
  particleColor?: string
  animationStyle?: 'particles' | 'waves' | 'gradient' | 'mesh'
}

const sizeClasses = {
  sm: 'py-16 lg:py-24',
  md: 'py-24 lg:py-32',
  lg: 'py-32 lg:py-40',
  xl: 'py-40 lg:py-56',
}

export default function HeroAnimated({
  id,
  className,
  styles,
  headline = 'Innovation meets design',
  subheadline = 'Create stunning experiences with animated backgrounds that bring your content to life.',
  ctaText = 'Start Creating',
  ctaLink = '#',
  secondaryCtaText = 'See Examples',
  secondaryCtaLink = '#',
  particleCount = 50,
  particleColor = '#6366f1',
  animationStyle = 'particles',
  textAlign = 'center',
  size = 'lg',
  editable,
  onEdit,
}: HeroAnimatedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  // Particle animation
  useEffect(() => {
    if (animationStyle !== 'particles') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, i) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particleColor + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')
        ctx.fill()

        // Draw connections
        particles.slice(i + 1).forEach((other) => {
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = particleColor + Math.floor((1 - distance / 150) * 50).toString(16).padStart(2, '0')
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [animationStyle, particleCount, particleColor])

  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden bg-gray-950',
        sizeClasses[size],
        className
      )}
      style={styles}
    >
      {/* Animated Background */}
      {animationStyle === 'particles' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      )}

      {animationStyle === 'waves' && (
        <div className="absolute inset-0">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path
              fill={particleColor}
              fillOpacity="0.2"
              className="animate-[wave_10s_ease-in-out_infinite]"
              d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
            <path
              fill={particleColor}
              fillOpacity="0.3"
              className="animate-[wave_8s_ease-in-out_infinite_reverse]"
              d="M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,197.3C672,203,768,181,864,181.3C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      )}

      {animationStyle === 'gradient' && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 animate-[gradient_15s_ease_infinite]"
            style={{
              background: `linear-gradient(-45deg, ${particleColor}, #ec4899, #8b5cf6, ${particleColor})`,
              backgroundSize: '400% 400%',
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {animationStyle === 'mesh' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 80%, ${particleColor} 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, #ec4899 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, #8b5cf6 0%, transparent 40%)
              `,
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className={cn(
        'relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
        textAlign === 'center' && 'text-center',
        textAlign === 'left' && 'text-left',
        textAlign === 'right' && 'text-right'
      )}>
        {/* Floating badge */}
        <div className={cn(
          'mb-8',
          textAlign === 'center' && 'flex justify-center',
          textAlign === 'right' && 'flex justify-end'
        )}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/90 text-sm font-medium backdrop-blur-xl border border-white/10 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            Powered by AI
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
            'text-lg sm:text-xl text-white/70 mb-10 leading-relaxed',
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
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            {ctaText}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          {secondaryCtaText && (
            <a
              href={secondaryCtaLink}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white/90 border border-white/20 rounded-xl hover:bg-white/5 hover:border-white/30 transition-all backdrop-blur-sm"
            >
              {secondaryCtaText}
            </a>
          )}
        </div>

        {/* Tech stack */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-50">
          {['React', 'Next.js', 'TypeScript', 'Tailwind'].map((tech) => (
            <span key={tech} className="text-white/60 text-sm font-medium">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25px) translateY(10px); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  )
}

HeroAnimated.displayName = 'HeroAnimated'

HeroAnimated.config = {
  id: 'hero-animated',
  name: 'Hero Animated',
  category: 'hero',
  description: 'Hero with animated particle/wave/gradient backgrounds',
  defaultProps: {
    headline: 'Innovation meets design',
    subheadline: 'Create stunning experiences with animated backgrounds.',
    ctaText: 'Start Creating',
    ctaLink: '#',
    secondaryCtaText: 'See Examples',
    particleCount: 50,
    particleColor: '#6366f1',
    animationStyle: 'particles',
    textAlign: 'center',
    size: 'lg',
  },
  editableFields: [
    { name: 'headline', label: 'Headline', type: 'text' },
    { name: 'subheadline', label: 'Subheadline', type: 'textarea' },
    { name: 'ctaText', label: 'CTA Text', type: 'text' },
    { name: 'ctaLink', label: 'CTA Link', type: 'url' },
    { name: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text' },
    { name: 'animationStyle', label: 'Animation Style', type: 'select', options: ['particles', 'waves', 'gradient', 'mesh'] },
    { name: 'particleColor', label: 'Accent Color', type: 'color', defaultValue: '#6366f1' },
    { name: 'particleCount', label: 'Particle Count', type: 'number', defaultValue: 50 },
    { name: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  ],
}
