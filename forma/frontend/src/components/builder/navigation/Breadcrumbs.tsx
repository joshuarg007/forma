'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps extends ModuleProps {
  items?: BreadcrumbItem[]
  separator?: 'chevron' | 'slash' | 'arrow' | 'dot'
  size?: 'sm' | 'md' | 'lg'
  showHomeIcon?: boolean
}

const defaultItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Category', href: '/products/category' },
  { label: 'Current Page' },
]

const separatorIcons = {
  chevron: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  slash: <span>/</span>,
  arrow: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  dot: <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />,
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export default function Breadcrumbs({
  id,
  className,
  styles,
  items = defaultItems,
  separator = 'chevron',
  size = 'md',
  showHomeIcon = true,
}: BreadcrumbsProps) {
  return (
    <nav
      id={id}
      aria-label="Breadcrumb"
      className={cn(sizeClasses[size], className)}
      style={styles}
    >
      <ol className="flex items-center flex-wrap gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isFirst = index === 0

          return (
            <li key={index} className="flex items-center gap-2">
              {/* Separator (not on first item) */}
              {index > 0 && (
                <span className="text-gray-400 flex-shrink-0">
                  {separatorIcons[separator]}
                </span>
              )}

              {/* Breadcrumb item */}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    'font-medium',
                    isLast ? 'text-gray-900' : 'text-gray-500'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isFirst && showHomeIcon ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="sr-only sm:not-sr-only">{item.label}</span>
                    </span>
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isFirst && showHomeIcon ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="sr-only sm:not-sr-only">{item.label}</span>
                    </span>
                  ) : (
                    item.label
                  )}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

Breadcrumbs.displayName = 'Breadcrumbs'

Breadcrumbs.config = {
  id: 'breadcrumbs',
  name: 'Breadcrumbs',
  category: 'navigation',
  description: 'Navigation trail showing page hierarchy',
  defaultProps: {
    items: defaultItems,
    separator: 'chevron',
    size: 'md',
    showHomeIcon: true,
  },
  editableFields: [
    { name: 'items', label: 'Breadcrumb Items', type: 'array' },
    { name: 'separator', label: 'Separator', type: 'select', options: ['chevron', 'slash', 'arrow', 'dot'], defaultValue: 'chevron' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
    { name: 'showHomeIcon', label: 'Show Home Icon', type: 'boolean', defaultValue: true },
  ],
}
