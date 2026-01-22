'use client'

import { cn } from '@/lib/utils'

interface SocialLink {
  platform: 'twitter' | 'linkedin' | 'github' | 'instagram' | 'website'
  url: string
}

interface UserCardProps {
  id?: string
  className?: string
  name?: string
  title?: string
  company?: string
  email?: string
  phone?: string
  location?: string
  avatar?: string
  socialLinks?: SocialLink[]
  variant?: 'default' | 'compact' | 'horizontal' | 'detailed'
  showContact?: boolean
  showSocial?: boolean
}

const defaultSocialLinks: SocialLink[] = [
  { platform: 'twitter', url: 'https://twitter.com/sarahchen' },
  { platform: 'linkedin', url: 'https://linkedin.com/in/sarahchen' },
  { platform: 'github', url: 'https://github.com/sarahchen' },
]

export default function UserCard({
  id,
  className,
  name = 'Sarah Chen',
  title = 'Product Designer',
  company = 'Acme Inc.',
  email = 'sarah@acme.com',
  phone = '+1 (555) 123-4567',
  location = 'San Francisco, CA',
  avatar,
  socialLinks = defaultSocialLinks,
  variant = 'default',
  showContact = true,
  showSocial = true,
}: UserCardProps) {
  const socialIcons = {
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    website: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  }

  if (variant === 'compact') {
    return (
      <div id={id} className={cn('flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800', className)}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0">
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">{name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
        </div>
        {showSocial && socialLinks.length > 0 && (
          <div className="flex items-center gap-1">
            {socialLinks.slice(0, 3).map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-indigo-500 transition"
              >
                {socialIcons[link.platform]}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'horizontal') {
    return (
      <div id={id} className={cn('flex items-center gap-5 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
          <p className="text-gray-600 dark:text-gray-400">{title} at {company}</p>
          {showContact && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {email && (
                <a href={`mailto:${email}`} className="hover:text-indigo-500 transition">{email}</a>
              )}
              {location && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {location}
                </span>
              )}
            </div>
          )}
        </div>
        {showSocial && socialLinks.length > 0 && (
          <div className="flex items-center gap-2">
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                {socialIcons[link.platform]}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div id={id} className={cn('bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden', className)}>
        <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <div className="px-5 pb-5">
          <div className="-mt-10 mb-4">
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {name.charAt(0)}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h3>
          <p className="text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">{company}</p>

          {showContact && (
            <div className="mt-4 space-y-2">
              {email && (
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${email}`} className="text-gray-600 dark:text-gray-400 hover:text-indigo-500">{email}</a>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${phone}`} className="text-gray-600 dark:text-gray-400 hover:text-indigo-500">{phone}</a>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">{location}</span>
                </div>
              )}
            </div>
          )}

          {showSocial && socialLinks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    {socialIcons[link.platform]}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-center', className)}>
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
        {name.charAt(0)}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
      <p className="text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-500">{company}</p>

      {showContact && email && (
        <a href={`mailto:${email}`} className="block mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          {email}
        </a>
      )}

      {showSocial && socialLinks.length > 0 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {socialLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-indigo-500 transition"
            >
              {socialIcons[link.platform]}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

UserCard.displayName = 'UserCard'

UserCard.config = {
  id: 'user-card',
  name: 'User Card',
  category: 'social',
  description: 'User profile card with contact info',
  defaultProps: { variant: 'default', showContact: true, showSocial: true },
  editableFields: [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'company', label: 'Company', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'socialLinks', label: 'Social Links', type: 'array' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'compact', 'horizontal', 'detailed'] },
    { name: 'showContact', label: 'Show Contact', type: 'boolean' },
    { name: 'showSocial', label: 'Show Social Links', type: 'boolean' },
  ],
}
