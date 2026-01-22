'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { NavbarProps } from '../types'

const themeClasses = {
  light: {
    nav: 'bg-white border-b border-gray-100',
    logo: 'text-gray-900',
    link: 'text-gray-600 hover:text-gray-900',
    cta: 'bg-indigo-600 text-white hover:bg-indigo-700',
    mobileMenu: 'bg-white',
    mobileLink: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
  },
  dark: {
    nav: 'bg-gray-900 border-b border-gray-800',
    logo: 'text-white',
    link: 'text-gray-300 hover:text-white',
    cta: 'bg-white text-gray-900 hover:bg-gray-100',
    mobileMenu: 'bg-gray-900',
    mobileLink: 'text-gray-300 hover:text-white hover:bg-gray-800',
  },
}

export default function NavbarSimple({
  id,
  className,
  styles,
  logo,
  logoText = 'Brand',
  links = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  ctaText = 'Get Started',
  ctaLink = '#',
  sticky = true,
  transparent = false,
  theme = 'light',
  editable,
  onEdit,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const themeStyles = themeClasses[theme]

  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  return (
    <nav
      id={id}
      className={cn(
        'w-full z-50 transition-all',
        sticky && 'sticky top-0',
        transparent ? 'bg-transparent' : themeStyles.nav,
        className
      )}
      style={styles}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt={logoText} className="h-8 w-auto" />
            ) : (
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {logoText.charAt(0)}
              </div>
            )}
            <span
              className={cn('font-semibold text-xl', themeStyles.logo)}
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={handleEdit('logoText')}
            >
              {logoText}
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={cn('text-sm font-medium transition-colors', themeStyles.link)}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={ctaLink}
              className={cn(
                'px-5 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md',
                themeStyles.cta
              )}
            >
              {ctaText}
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn('lg:hidden p-2 rounded-lg', themeStyles.link)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className={cn('lg:hidden border-t', theme === 'dark' ? 'border-gray-800' : 'border-gray-100', themeStyles.mobileMenu)}>
          <div className="px-4 py-4 space-y-1">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn('block px-4 py-3 rounded-lg text-sm font-medium transition-colors', themeStyles.mobileLink)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <a
                href={ctaLink}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold transition-all',
                  themeStyles.cta
                )}
              >
                {ctaText}
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

NavbarSimple.displayName = 'NavbarSimple'

NavbarSimple.config = {
  id: 'navbar',
  name: 'Navbar Simple',
  category: 'navigation',
  description: 'Simple responsive navigation bar with logo, links, and CTA',
  defaultProps: {
    logoText: 'Brand',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaText: 'Get Started',
    ctaLink: '#',
    sticky: true,
    transparent: false,
    theme: 'light',
  },
  editableFields: [
    { name: 'logo', label: 'Logo Image URL', type: 'image' },
    { name: 'logoText', label: 'Logo Text', type: 'text', defaultValue: 'Brand' },
    { name: 'links', label: 'Navigation Links', type: 'array' },
    { name: 'ctaText', label: 'CTA Button Text', type: 'text', defaultValue: 'Get Started' },
    { name: 'ctaLink', label: 'CTA Button Link', type: 'url', defaultValue: '#' },
    { name: 'sticky', label: 'Sticky', type: 'boolean', defaultValue: true },
    { name: 'transparent', label: 'Transparent', type: 'boolean', defaultValue: false },
    { name: 'theme', label: 'Theme', type: 'select', options: ['light', 'dark'], defaultValue: 'light' },
  ],
}
