'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface Logo {
  name: string
  image?: string
  href?: string
}

interface LogoCloudProps extends ModuleProps {
  title?: string
  logos?: Logo[]
  variant?: 'simple' | 'grid' | 'marquee'
  grayscale?: boolean
  size?: 'sm' | 'md' | 'lg'
  columns?: 4 | 5 | 6
}

const defaultLogos: Logo[] = [
  { name: 'Vercel', href: '#' },
  { name: 'Next.js', href: '#' },
  { name: 'React', href: '#' },
  { name: 'Tailwind', href: '#' },
  { name: 'TypeScript', href: '#' },
  { name: 'Prisma', href: '#' },
]

const sizeClasses = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
}

// Placeholder logo component when no image provided
const PlaceholderLogo = ({ name, size }: { name: string; size: 'sm' | 'md' | 'lg' }) => {
  const heights = { sm: 'h-6', md: 'h-8', lg: 'h-10' }
  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg',
      heights[size]
    )}>
      <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-gray-600 text-xs font-bold">
        {name.charAt(0)}
      </div>
      <span className="font-semibold text-gray-600">{name}</span>
    </div>
  )
}

export default function LogoCloud({
  id,
  className,
  styles,
  title = 'Trusted by leading companies',
  logos = defaultLogos,
  variant = 'simple',
  grayscale = true,
  size = 'md',
  columns = 6,
}: LogoCloudProps) {
  const columnClasses = {
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }

  const renderLogo = (logo: Logo, index: number) => {
    const logoContent = logo.image ? (
      <img
        src={logo.image}
        alt={logo.name}
        className={cn(
          sizeClasses[size],
          'object-contain transition-all duration-300',
          grayscale && 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
        )}
      />
    ) : (
      <PlaceholderLogo name={logo.name} size={size} />
    )

    if (logo.href) {
      return (
        <a
          key={index}
          href={logo.href}
          className="flex items-center justify-center p-4 transition-transform hover:scale-110"
          title={logo.name}
        >
          {logoContent}
        </a>
      )
    }

    return (
      <div
        key={index}
        className="flex items-center justify-center p-4"
        title={logo.name}
      >
        {logoContent}
      </div>
    )
  }

  if (variant === 'marquee') {
    return (
      <div id={id} className={cn('overflow-hidden py-8', className)} style={styles}>
        {title && (
          <p className="text-center text-sm font-medium text-gray-500 mb-8">{title}</p>
        )}
        <div className="relative">
          <div className="flex animate-marquee">
            {[...logos, ...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-8"
              >
                {logo.image ? (
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className={cn(
                      sizeClasses[size],
                      'object-contain',
                      grayscale && 'grayscale opacity-60'
                    )}
                  />
                ) : (
                  <PlaceholderLogo name={logo.name} size={size} />
                )}
              </div>
            ))}
          </div>
          {/* Gradient overlays */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>

        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.333%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `}</style>
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div id={id} className={cn('py-8', className)} style={styles}>
        {title && (
          <p className="text-center text-sm font-medium text-gray-500 mb-8">{title}</p>
        )}
        <div className={cn('grid gap-8 items-center', columnClasses[columns])}>
          {logos.map((logo, index) => (
            <div key={index} className="flex justify-center">
              {renderLogo(logo, index)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Simple variant (default)
  return (
    <div id={id} className={cn('py-8', className)} style={styles}>
      {title && (
        <p className="text-center text-sm font-medium text-gray-500 mb-8">{title}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {logos.map((logo, index) => renderLogo(logo, index))}
      </div>
    </div>
  )
}

LogoCloud.displayName = 'LogoCloud'

LogoCloud.config = {
  id: 'logo-cloud',
  name: 'Logo Cloud',
  category: 'content',
  description: 'Display partner or client logos',
  defaultProps: {
    title: 'Trusted by leading companies',
    logos: defaultLogos,
    variant: 'simple',
    grayscale: true,
    size: 'md',
    columns: 6,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'logos', label: 'Logos', type: 'array' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['simple', 'grid', 'marquee'], defaultValue: 'simple' },
    { name: 'grayscale', label: 'Grayscale', type: 'boolean', defaultValue: true },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
    { name: 'columns', label: 'Columns (Grid)', type: 'select', options: ['4', '5', '6'], defaultValue: '6' },
  ],
}
