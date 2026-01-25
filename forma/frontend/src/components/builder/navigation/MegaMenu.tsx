'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface MenuLink {
  label: string
  href: string
  description?: string
  icon?: string
}

interface MenuSection {
  title?: string
  links: MenuLink[]
}

interface MenuItem {
  label: string
  href?: string
  sections?: MenuSection[]
  featured?: {
    title: string
    description: string
    image?: string
    href: string
  }
}

interface MegaMenuProps extends ModuleProps {
  logo?: string
  logoText?: string
  items?: MenuItem[]
  ctaText?: string
  ctaLink?: string
  theme?: 'light' | 'dark'
  sticky?: boolean
}

const defaultItems: MenuItem[] = [
  {
    label: 'Products',
    sections: [
      {
        title: 'Platform',
        links: [
          { label: 'Analytics', href: '#', description: 'Get insights into your data' },
          { label: 'Automation', href: '#', description: 'Streamline your workflows' },
          { label: 'Integrations', href: '#', description: 'Connect your favorite tools' },
        ],
      },
      {
        title: 'Solutions',
        links: [
          { label: 'For Startups', href: '#', description: 'Scale your business' },
          { label: 'For Enterprise', href: '#', description: 'Enterprise-grade solutions' },
          { label: 'For Developers', href: '#', description: 'APIs and SDKs' },
        ],
      },
    ],
    featured: {
      title: 'New: AI Assistant',
      description: 'Supercharge your productivity with our new AI-powered features.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      href: '#',
    },
  },
  {
    label: 'Resources',
    sections: [
      {
        title: 'Learn',
        links: [
          { label: 'Documentation', href: '#', description: 'Guides and tutorials' },
          { label: 'Blog', href: '#', description: 'Latest news and updates' },
          { label: 'Case Studies', href: '#', description: 'Success stories' },
        ],
      },
      {
        title: 'Support',
        links: [
          { label: 'Help Center', href: '#', description: 'Find answers fast' },
          { label: 'Community', href: '#', description: 'Join the conversation' },
          { label: 'Contact', href: '#', description: 'Get in touch' },
        ],
      },
    ],
  },
  { label: 'Pricing', href: '#' },
  { label: 'About', href: '#' },
]

export default function MegaMenu({
  id,
  className,
  styles,
  logo,
  logoText = 'Forma',
  items = defaultItems,
  ctaText = 'Get Started',
  ctaLink = '#',
  theme = 'light',
  sticky = true,
}: MegaMenuProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isDark = theme === 'dark'

  return (
    <nav
      id={id}
      className={cn(
        'w-full z-50',
        sticky && 'sticky top-0',
        isDark ? 'bg-gray-900' : 'bg-white',
        'border-b',
        isDark ? 'border-gray-800' : 'border-gray-200',
        className
      )}
      style={styles}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt={logoText} className="h-8" />
            ) : (
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                {logoText.charAt(0)}
              </div>
            )}
            <span className={cn('font-semibold text-lg', isDark ? 'text-white' : 'text-gray-900')}>
              {logoText}
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {items.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.sections && setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                {item.sections ? (
                  <button
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors',
                      isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                      openMenu === item.label && (isDark ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100')
                    )}
                  >
                    {item.label}
                    <svg
                      className={cn('w-4 h-4 transition-transform', openMenu === item.label && 'rotate-180')}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <a
                    href={item.href}
                    className={cn(
                      'px-4 py-2 rounded-lg font-medium transition-colors',
                      isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {item.label}
                  </a>
                )}

                {/* Mega Dropdown */}
                {item.sections && openMenu === item.label && (
                  <div
                    className={cn(
                      'absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-2xl shadow-2xl border overflow-hidden',
                      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
                      item.featured ? 'w-[800px]' : 'w-[500px]'
                    )}
                  >
                    <div className={cn('flex', item.featured && 'divide-x', isDark ? 'divide-gray-800' : 'divide-gray-200')}>
                      {/* Sections */}
                      <div className={cn('p-6 flex gap-8', item.featured ? 'flex-1' : 'w-full')}>
                        {item.sections.map((section, idx) => (
                          <div key={idx} className="flex-1">
                            {section.title && (
                              <h4 className={cn(
                                'text-xs font-semibold uppercase tracking-wider mb-3',
                                isDark ? 'text-gray-500' : 'text-gray-400'
                              )}>
                                {section.title}
                              </h4>
                            )}
                            <ul className="space-y-1">
                              {section.links.map((link) => (
                                <li key={link.label}>
                                  <a
                                    href={link.href}
                                    className={cn(
                                      'block p-2 -mx-2 rounded-lg transition-colors',
                                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                    )}
                                  >
                                    <span className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>
                                      {link.label}
                                    </span>
                                    {link.description && (
                                      <p className={cn('text-sm mt-0.5', isDark ? 'text-gray-400' : 'text-gray-500')}>
                                        {link.description}
                                      </p>
                                    )}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Featured */}
                      {item.featured && (
                        <div className={cn('w-72 p-6', isDark ? 'bg-gray-800/50' : 'bg-gray-50')}>
                          <a href={item.featured.href} className="block group">
                            {item.featured.image && (
                              <img
                                src={item.featured.image}
                                alt={item.featured.title}
                                className="w-full h-32 object-cover rounded-lg mb-4"
                              />
                            )}
                            <h4 className={cn(
                              'font-semibold mb-1 group-hover:text-indigo-600 transition-colors',
                              isDark ? 'text-white' : 'text-gray-900'
                            )}>
                              {item.featured.title}
                            </h4>
                            <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                              {item.featured.description}
                            </p>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={ctaLink}
              className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {ctaText}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn('lg:hidden p-2 rounded-lg', isDark ? 'text-white' : 'text-gray-900')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className={cn('lg:hidden py-4 border-t', isDark ? 'border-gray-800' : 'border-gray-200')}>
            {items.map((item) => (
              <div key={item.label}>
                {item.sections ? (
                  <div className="py-2">
                    <button
                      onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-2 font-medium',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}
                    >
                      {item.label}
                      <svg
                        className={cn('w-4 h-4 transition-transform', openMenu === item.label && 'rotate-180')}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openMenu === item.label && (
                      <div className="pl-4 mt-2 space-y-4">
                        {item.sections.map((section, idx) => (
                          <div key={idx}>
                            {section.title && (
                              <h4 className={cn('text-xs font-semibold uppercase tracking-wider mb-2 px-4', isDark ? 'text-gray-500' : 'text-gray-400')}>
                                {section.title}
                              </h4>
                            )}
                            {section.links.map((link) => (
                              <a
                                key={link.label}
                                href={link.href}
                                className={cn('block px-4 py-2', isDark ? 'text-gray-300' : 'text-gray-600')}
                              >
                                {link.label}
                              </a>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className={cn('block px-4 py-2 font-medium', isDark ? 'text-white' : 'text-gray-900')}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
            <div className="px-4 pt-4">
              <a
                href={ctaLink}
                className="block w-full py-3 bg-indigo-600 text-white font-medium rounded-lg text-center"
              >
                {ctaText}
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

MegaMenu.displayName = 'MegaMenu'

MegaMenu.config = {
  id: 'mega-menu',
  name: 'Mega Menu',
  category: 'navigation',
  description: 'Navigation with dropdown mega menus',
  defaultProps: {
    logoText: 'Forma',
    items: defaultItems,
    ctaText: 'Get Started',
    ctaLink: '#',
    theme: 'light',
    sticky: true,
  },
  editableFields: [
    { name: 'logo', label: 'Logo Image', type: 'image' },
    { name: 'logoText', label: 'Logo Text', type: 'text', defaultValue: 'Forma' },
    { name: 'items', label: 'Menu Items', type: 'array' },
    { name: 'ctaText', label: 'CTA Text', type: 'text', defaultValue: 'Get Started' },
    { name: 'ctaLink', label: 'CTA Link', type: 'url' },
    { name: 'theme', label: 'Theme', type: 'select', options: ['light', 'dark'], defaultValue: 'light' },
    { name: 'sticky', label: 'Sticky', type: 'boolean', defaultValue: true },
  ],
}
