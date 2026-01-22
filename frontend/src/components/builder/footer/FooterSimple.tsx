'use client'

import { cn } from '@/lib/utils'
import type { FooterProps } from '../types'

const themeClasses = {
  light: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    link: 'text-gray-600 hover:text-gray-900',
    border: 'border-gray-200',
    logo: 'text-gray-900',
  },
  dark: {
    bg: 'bg-gray-900',
    text: 'text-gray-400',
    link: 'text-gray-400 hover:text-white',
    border: 'border-gray-800',
    logo: 'text-white',
  },
}

const socialIcons: Record<string, React.ReactNode> = {
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  facebook: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  github: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
}

export default function FooterSimple({
  id,
  className,
  styles,
  logo,
  logoText = 'Brand',
  tagline = 'Building something amazing.',
  copyright = '© 2024 Brand. All rights reserved.',
  socialLinks = [
    { platform: 'twitter', url: '#' },
    { platform: 'github', url: '#' },
    { platform: 'linkedin', url: '#' },
  ],
  theme = 'dark',
  editable,
  onEdit,
}: FooterProps) {
  const themeStyles = themeClasses[theme]

  const handleEdit = (field: string) => (e: React.FocusEvent<HTMLElement>) => {
    if (editable && onEdit) {
      onEdit(field, e.currentTarget.textContent || '')
    }
  }

  return (
    <footer
      id={id}
      className={cn(themeStyles.bg, 'py-12', className)}
      style={styles}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start">
            <a href="/" className="flex items-center gap-3 mb-2">
              {logo ? (
                <img src={logo} alt={logoText} className="h-8 w-auto" />
              ) : (
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {logoText.charAt(0)}
                </div>
              )}
              <span
                className={cn('font-semibold text-lg', themeStyles.logo)}
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={handleEdit('logoText')}
              >
                {logoText}
              </span>
            </a>
            <p
              className={cn('text-sm', themeStyles.text)}
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={handleEdit('tagline')}
            >
              {tagline}
            </p>
          </div>

          {/* Social Links */}
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className={cn('transition-colors', themeStyles.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                >
                  {socialIcons[social.platform]}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className={cn('mt-8 pt-8 border-t text-center', themeStyles.border)}>
          <p
            className={cn('text-sm', themeStyles.text)}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={handleEdit('copyright')}
          >
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}

FooterSimple.displayName = 'FooterSimple'

FooterSimple.config = {
  id: 'footer-simple',
  name: 'Footer Simple',
  category: 'footer',
  description: 'Simple footer with logo, tagline, and social links',
  defaultProps: {
    logoText: 'Brand',
    tagline: 'Building something amazing.',
    copyright: '© 2024 Brand. All rights reserved.',
    socialLinks: [
      { platform: 'twitter', url: '#' },
      { platform: 'github', url: '#' },
      { platform: 'linkedin', url: '#' },
    ],
    theme: 'dark',
  },
  editableFields: [
    { name: 'logo', label: 'Logo Image', type: 'image' },
    { name: 'logoText', label: 'Logo Text', type: 'text', defaultValue: 'Brand' },
    { name: 'tagline', label: 'Tagline', type: 'text', defaultValue: 'Building something amazing.' },
    { name: 'copyright', label: 'Copyright', type: 'text', defaultValue: '© 2024 Brand. All rights reserved.' },
    { name: 'socialLinks', label: 'Social Links', type: 'array' },
    { name: 'theme', label: 'Theme', type: 'select', options: ['light', 'dark'], defaultValue: 'dark' },
  ],
}
