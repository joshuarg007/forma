'use client'

import { cn } from '@/lib/utils'

interface AuthorBioProps {
  id?: string
  className?: string
  name?: string
  avatar?: string
  role?: string
  bio?: string
  location?: string
  socials?: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  }
  stats?: {
    posts?: number
    followers?: number
    following?: number
  }
  variant?: 'card' | 'inline' | 'sidebar'
  showStats?: boolean
  showSocials?: boolean
}

export default function AuthorBio({
  id,
  className,
  name = 'Sarah Chen',
  role = 'Senior Developer Advocate',
  bio = 'Passionate about building great developer experiences and sharing knowledge with the community. 10+ years of experience in web development.',
  location = 'San Francisco, CA',
  socials = {
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    website: 'https://example.com',
  },
  stats = {
    posts: 47,
    followers: 12500,
    following: 230,
  },
  variant = 'card',
  showStats = true,
  showSocials = true,
}: AuthorBioProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  if (variant === 'inline') {
    return (
      <div id={id} className={cn('flex items-center gap-4', className)}>
        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{role}</div>
        </div>
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div id={id} className={cn('p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800', className)}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-3xl mb-4">
            {name.charAt(0)}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h3>
          <p className="text-indigo-600 dark:text-indigo-400 text-sm mb-2">{role}</p>
          {location && (
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </p>
          )}
        </div>

        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm text-center">{bio}</p>

        {showStats && stats && (
          <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.posts}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.followers || 0)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.following}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
            </div>
          </div>
        )}

        {showSocials && socials && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {socials.twitter && (
              <a href={socials.twitter} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
            )}
            {socials.linkedin && (
              <a href={socials.linkedin} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            )}
            {socials.github && (
              <a href={socials.github} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            )}
            {socials.website && (
              <a href={socials.website} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
              </a>
            )}
          </div>
        )}

        <button className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">
          Follow
        </button>
      </div>
    )
  }

  // Default card variant
  return (
    <div id={id} className={cn('p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800', className)}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{name}</h3>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm">{role}</p>
            </div>
            {showSocials && socials && (
              <div className="flex items-center gap-2">
                {socials.twitter && (
                  <a href={socials.twitter} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                )}
                {socials.github && (
                  <a href={socials.github} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">{bio}</p>
          {showStats && stats && (
            <div className="mt-4 flex items-center gap-6 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{stats.posts}</span> posts
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(stats.followers || 0)}</span> followers
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

AuthorBio.displayName = 'AuthorBio'

AuthorBio.config = {
  id: 'author-bio',
  name: 'Author Bio',
  category: 'blog',
  description: 'Author card with bio, stats, and social links',
  defaultProps: {
    variant: 'card',
    showStats: true,
    showSocials: true,
  },
  editableFields: [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'role', label: 'Role', type: 'text' },
    { name: 'bio', label: 'Bio', type: 'textarea' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'socials', label: 'Social Links', type: 'object' },
    { name: 'stats', label: 'Stats', type: 'object' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['card', 'inline', 'sidebar'] },
    { name: 'showStats', label: 'Show Stats', type: 'boolean' },
    { name: 'showSocials', label: 'Show Socials', type: 'boolean' },
  ],
}
