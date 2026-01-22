'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface Logo {
  name: string
  image?: string
  href?: string
}

interface LogoCloudSectionProps extends ModuleProps {
  title?: string
  subtitle?: string
  logos?: Logo[]
  variant?: 'simple' | 'grid' | 'marquee' | 'featured'
  grayscale?: boolean
  background?: 'white' | 'gray' | 'dark'
  columns?: 4 | 5 | 6
}

const defaultLogos: Logo[] = [
  { name: 'Vercel' },
  { name: 'Next.js' },
  { name: 'React' },
  { name: 'Tailwind' },
  { name: 'TypeScript' },
  { name: 'Prisma' },
]

const PlaceholderLogo = ({ name, isDark }: { name: string; isDark: boolean }) => (
  <div className={cn(
    'flex items-center gap-2 px-4 py-2 rounded-lg',
    isDark ? 'bg-white/10' : 'bg-gray-100'
  )}>
    <div className={cn(
      'w-8 h-8 rounded flex items-center justify-center font-bold',
      isDark ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-600'
    )}>
      {name.charAt(0)}
    </div>
    <span className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-700')}>{name}</span>
  </div>
)

export default function LogoCloudSection({
  id,
  className,
  styles,
  title = 'Trusted by the best teams',
  subtitle,
  logos = defaultLogos,
  variant = 'simple',
  grayscale = true,
  background = 'white',
  columns = 6,
}: LogoCloudSectionProps) {
  const isDark = background === 'dark'

  const columnClasses = {
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }

  const renderLogo = (logo: Logo, index: number) => {
    const content = logo.image ? (
      <img
        src={logo.image}
        alt={logo.name}
        className={cn(
          'h-8 object-contain transition-all duration-300',
          grayscale && !isDark && 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100',
          isDark && 'opacity-70 hover:opacity-100'
        )}
      />
    ) : (
      <PlaceholderLogo name={logo.name} isDark={isDark} />
    )

    return logo.href ? (
      <a key={index} href={logo.href} className="flex items-center justify-center p-4">
        {content}
      </a>
    ) : (
      <div key={index} className="flex items-center justify-center p-4">
        {content}
      </div>
    )
  }

  if (variant === 'marquee') {
    return (
      <section
        id={id}
        className={cn(
          'py-12 overflow-hidden',
          background === 'white' && 'bg-white',
          background === 'gray' && 'bg-gray-50',
          background === 'dark' && 'bg-gray-900',
          className
        )}
        style={styles}
      >
        <div className="max-w-7xl mx-auto px-4 mb-8">
          {title && (
            <p className={cn(
              'text-center text-sm font-medium',
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}>
              {title}
            </p>
          )}
        </div>

        <div className="relative">
          <div className="flex animate-marquee">
            {[...logos, ...logos, ...logos].map((logo, index) => (
              <div key={index} className="flex-shrink-0 px-8">
                {logo.image ? (
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className={cn(
                      'h-8 object-contain',
                      grayscale && !isDark && 'grayscale opacity-60',
                      isDark && 'opacity-70'
                    )}
                  />
                ) : (
                  <PlaceholderLogo name={logo.name} isDark={isDark} />
                )}
              </div>
            ))}
          </div>
          <div className={cn(
            'absolute inset-y-0 left-0 w-20 bg-gradient-to-r pointer-events-none',
            isDark ? 'from-gray-900' : background === 'gray' ? 'from-gray-50' : 'from-white'
          )} />
          <div className={cn(
            'absolute inset-y-0 right-0 w-20 bg-gradient-to-l pointer-events-none',
            isDark ? 'from-gray-900' : background === 'gray' ? 'from-gray-50' : 'from-white'
          )} />
        </div>

        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.333%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
          }
        `}</style>
      </section>
    )
  }

  if (variant === 'featured') {
    return (
      <section
        id={id}
        className={cn(
          'py-16 px-4',
          background === 'white' && 'bg-white',
          background === 'gray' && 'bg-gray-50',
          background === 'dark' && 'bg-gray-900',
          className
        )}
        style={styles}
      >
        <div className="max-w-5xl mx-auto">
          <div className={cn(
            'rounded-2xl p-12',
            isDark ? 'bg-white/5' : 'bg-gray-100'
          )}>
            {title && (
              <h3 className={cn(
                'text-center text-2xl font-bold mb-8',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={cn(
                'text-center mb-8',
                isDark ? 'text-gray-400' : 'text-gray-600'
              )}>
                {subtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {logos.map((logo, index) => renderLogo(logo, index))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'grid') {
    return (
      <section
        id={id}
        className={cn(
          'py-12 px-4',
          background === 'white' && 'bg-white',
          background === 'gray' && 'bg-gray-50',
          background === 'dark' && 'bg-gray-900',
          className
        )}
        style={styles}
      >
        <div className="max-w-7xl mx-auto">
          {title && (
            <p className={cn(
              'text-center text-sm font-medium mb-8',
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}>
              {title}
            </p>
          )}
          <div className={cn('grid gap-8 items-center', columnClasses[columns])}>
            {logos.map((logo, index) => (
              <div key={index} className="flex justify-center">
                {renderLogo(logo, index)}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Simple variant (default)
  return (
    <section
      id={id}
      className={cn(
        'py-12 px-4',
        background === 'white' && 'bg-white',
        background === 'gray' && 'bg-gray-50',
        background === 'dark' && 'bg-gray-900',
        className
      )}
      style={styles}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <p className={cn(
            'text-center text-sm font-medium mb-8',
            isDark ? 'text-gray-400' : 'text-gray-500'
          )}>
            {title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo, index) => renderLogo(logo, index))}
        </div>
      </div>
    </section>
  )
}

LogoCloudSection.displayName = 'LogoCloudSection'

LogoCloudSection.config = {
  id: 'logo-cloud-section',
  name: 'Logo Cloud Section',
  category: 'sections',
  description: 'Partner/client logos section',
  defaultProps: {
    title: 'Trusted by the best teams',
    logos: defaultLogos,
    variant: 'simple',
    grayscale: true,
    background: 'white',
    columns: 6,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'logos', label: 'Logos', type: 'array' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['simple', 'grid', 'marquee', 'featured'], defaultValue: 'simple' },
    { name: 'grayscale', label: 'Grayscale', type: 'boolean', defaultValue: true },
    { name: 'background', label: 'Background', type: 'select', options: ['white', 'gray', 'dark'], defaultValue: 'white' },
    { name: 'columns', label: 'Columns (Grid)', type: 'select', options: ['4', '5', '6'], defaultValue: '6' },
  ],
}
