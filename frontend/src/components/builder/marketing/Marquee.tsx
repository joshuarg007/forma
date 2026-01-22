'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface MarqueeItem {
  text?: string
  image?: string
  href?: string
}

interface MarqueeProps extends ModuleProps {
  items?: MarqueeItem[]
  speed?: 'slow' | 'normal' | 'fast'
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  variant?: 'text' | 'logos' | 'mixed'
  size?: 'sm' | 'md' | 'lg'
  separator?: string
  background?: 'none' | 'light' | 'dark' | 'gradient'
}

const defaultTextItems: MarqueeItem[] = [
  { text: 'Free Shipping on Orders $50+' },
  { text: 'New Arrivals Just Dropped' },
  { text: '20% Off First Order' },
  { text: 'Join Our Newsletter' },
]

const defaultLogoItems: MarqueeItem[] = [
  { text: 'Vercel', href: '#' },
  { text: 'Next.js', href: '#' },
  { text: 'React', href: '#' },
  { text: 'Tailwind', href: '#' },
  { text: 'TypeScript', href: '#' },
  { text: 'Prisma', href: '#' },
]

const speedClasses = {
  slow: 'animate-marquee-slow',
  normal: 'animate-marquee',
  fast: 'animate-marquee-fast',
}

const sizeClasses = {
  sm: 'text-sm py-2',
  md: 'text-base py-3',
  lg: 'text-lg py-4',
}

const backgroundClasses = {
  none: 'bg-transparent',
  light: 'bg-gray-100',
  dark: 'bg-gray-900 text-white',
  gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
}

export default function Marquee({
  id,
  className,
  styles,
  items,
  speed = 'normal',
  direction = 'left',
  pauseOnHover = true,
  variant = 'text',
  size = 'md',
  separator = '•',
  background = 'light',
}: MarqueeProps) {
  const defaultItems = variant === 'logos' ? defaultLogoItems : defaultTextItems
  const displayItems = items || defaultItems

  const renderItem = (item: MarqueeItem, index: number) => {
    if (variant === 'logos') {
      const content = item.image ? (
        <img
          src={item.image}
          alt={item.text || `Logo ${index + 1}`}
          className={cn(
            'h-6 w-auto object-contain',
            size === 'sm' && 'h-5',
            size === 'lg' && 'h-8',
            background === 'none' || background === 'light' ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100' : 'opacity-70 hover:opacity-100',
            'transition-all duration-300'
          )}
        />
      ) : (
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg',
          background === 'none' || background === 'light' ? 'bg-gray-200' : 'bg-white/20'
        )}>
          <div className={cn(
            'w-6 h-6 rounded flex items-center justify-center text-xs font-bold',
            background === 'none' || background === 'light' ? 'bg-gray-400 text-white' : 'bg-white/30'
          )}>
            {item.text?.charAt(0)}
          </div>
          <span className="font-medium">{item.text}</span>
        </div>
      )

      return item.href ? (
        <a key={index} href={item.href} className="mx-8 flex-shrink-0">
          {content}
        </a>
      ) : (
        <div key={index} className="mx-8 flex-shrink-0">
          {content}
        </div>
      )
    }

    // Text variant
    return (
      <div key={index} className="flex items-center mx-4 flex-shrink-0">
        {item.href ? (
          <a href={item.href} className="hover:underline">
            {item.text}
          </a>
        ) : (
          <span>{item.text}</span>
        )}
        <span className="mx-4 opacity-50">{separator}</span>
      </div>
    )
  }

  return (
    <div
      id={id}
      className={cn(
        'overflow-hidden',
        backgroundClasses[background],
        sizeClasses[size],
        className
      )}
      style={styles}
    >
      <div
        className={cn(
          'flex',
          direction === 'right' && 'flex-row-reverse',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        <div
          className={cn(
            'flex items-center whitespace-nowrap',
            speedClasses[speed],
            direction === 'right' && '[animation-direction:reverse]'
          )}
        >
          {displayItems.map((item, index) => renderItem(item, index))}
        </div>
        <div
          className={cn(
            'flex items-center whitespace-nowrap',
            speedClasses[speed],
            direction === 'right' && '[animation-direction:reverse]'
          )}
          aria-hidden
        >
          {displayItems.map((item, index) => renderItem(item, index))}
        </div>
        <div
          className={cn(
            'flex items-center whitespace-nowrap',
            speedClasses[speed],
            direction === 'right' && '[animation-direction:reverse]'
          )}
          aria-hidden
        >
          {displayItems.map((item, index) => renderItem(item, index))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee-slow {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee-fast {
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  )
}

Marquee.displayName = 'Marquee'

Marquee.config = {
  id: 'marquee',
  name: 'Marquee',
  category: 'marketing',
  description: 'Scrolling text or logo marquee',
  defaultProps: {
    speed: 'normal',
    direction: 'left',
    pauseOnHover: true,
    variant: 'text',
    size: 'md',
    separator: '•',
    background: 'light',
  },
  editableFields: [
    { name: 'items', label: 'Items', type: 'array' },
    { name: 'speed', label: 'Speed', type: 'select', options: ['slow', 'normal', 'fast'], defaultValue: 'normal' },
    { name: 'direction', label: 'Direction', type: 'select', options: ['left', 'right'], defaultValue: 'left' },
    { name: 'pauseOnHover', label: 'Pause on Hover', type: 'boolean', defaultValue: true },
    { name: 'variant', label: 'Variant', type: 'select', options: ['text', 'logos', 'mixed'], defaultValue: 'text' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
    { name: 'separator', label: 'Separator', type: 'text', defaultValue: '•' },
    { name: 'background', label: 'Background', type: 'select', options: ['none', 'light', 'dark', 'gradient'], defaultValue: 'light' },
  ],
}
