'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface TeamMember {
  name: string
  role: string
  bio?: string
  image?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
}

interface TeamSectionProps extends ModuleProps {
  title?: string
  subtitle?: string
  description?: string
  members?: TeamMember[]
  layout?: 'grid' | 'featured' | 'compact'
  columns?: 3 | 4 | 5
  showBio?: boolean
  showSocial?: boolean
  background?: 'white' | 'gray' | 'gradient'
}

const defaultMembers: TeamMember[] = [
  {
    name: 'Alex Thompson',
    role: 'CEO & Founder',
    bio: 'Visionary leader with 15+ years of experience in tech.',
    socialLinks: { twitter: '#', linkedin: '#' },
  },
  {
    name: 'Sarah Chen',
    role: 'CTO',
    bio: 'Engineering expert passionate about scalable systems.',
    socialLinks: { twitter: '#', linkedin: '#', github: '#' },
  },
  {
    name: 'Michael Rodriguez',
    role: 'Head of Design',
    bio: 'Award-winning designer focused on user experience.',
    socialLinks: { twitter: '#', linkedin: '#' },
  },
  {
    name: 'Emily Watson',
    role: 'VP of Marketing',
    bio: 'Growth strategist with a data-driven approach.',
    socialLinks: { twitter: '#', linkedin: '#' },
  },
  {
    name: 'David Kim',
    role: 'Lead Engineer',
    bio: 'Full-stack developer building the future.',
    socialLinks: { linkedin: '#', github: '#' },
  },
  {
    name: 'Lisa Anderson',
    role: 'Head of Customer Success',
    bio: 'Dedicated to making customers successful.',
    socialLinks: { twitter: '#', linkedin: '#' },
  },
]

const socialIcons = {
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  github: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
}

export default function TeamSection({
  id,
  className,
  styles,
  title = 'Meet our team',
  subtitle = 'The Team',
  description = 'The passionate people behind our success',
  members = defaultMembers,
  layout = 'grid',
  columns = 3,
  showBio = true,
  showSocial = true,
  background = 'white',
}: TeamSectionProps) {
  const gridCols = {
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    5: 'md:grid-cols-2 lg:grid-cols-5',
  }

  return (
    <section
      id={id}
      className={cn(
        'py-20 px-4',
        background === 'white' && 'bg-white',
        background === 'gray' && 'bg-gray-50',
        background === 'gradient' && 'bg-gradient-to-br from-indigo-50 to-purple-50',
        className
      )}
      style={styles}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {subtitle && (
            <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              {subtitle}
            </span>
          )}
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600">{description}</p>
        </div>

        {/* Team Grid */}
        {layout === 'featured' ? (
          <div className="space-y-12">
            {/* Featured members (first 2) */}
            <div className="grid md:grid-cols-2 gap-8">
              {members.slice(0, 2).map((member, index) => (
                <div key={index} className="flex gap-6 p-6 bg-white rounded-2xl shadow-lg">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-2xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                    {showBio && member.bio && (
                      <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                    )}
                    {showSocial && member.socialLinks && (
                      <div className="flex gap-3">
                        {Object.entries(member.socialLinks).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            {socialIcons[platform as keyof typeof socialIcons]}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Rest of team */}
            <div className={cn('grid gap-8', gridCols[columns])}>
              {members.slice(2).map((member, index) => (
                <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  <p className="text-indigo-600 text-sm font-medium mb-2">{member.role}</p>
                  {showSocial && member.socialLinks && (
                    <div className="flex justify-center gap-3">
                      {Object.entries(member.socialLinks).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          className="text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          {socialIcons[platform as keyof typeof socialIcons]}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : layout === 'compact' ? (
          <div className={cn('grid gap-6', gridCols[columns])}>
            {members.map((member, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {member.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn('grid gap-8', gridCols[columns])}>
            {members.map((member, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                    {member.name.charAt(0)}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-indigo-600 font-medium text-sm mb-3">{member.role}</p>
                {showBio && member.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{member.bio}</p>
                )}
                {showSocial && member.socialLinks && (
                  <div className="flex justify-center gap-4">
                    {Object.entries(member.socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        {socialIcons[platform as keyof typeof socialIcons]}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

TeamSection.displayName = 'TeamSection'

TeamSection.config = {
  id: 'team-section',
  name: 'Team Section',
  category: 'sections',
  description: 'Full team section with multiple layout options',
  defaultProps: {
    title: 'Meet our team',
    subtitle: 'The Team',
    description: 'The passionate people behind our success',
    members: defaultMembers,
    layout: 'grid',
    columns: 3,
    showBio: true,
    showSocial: true,
    background: 'white',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'members', label: 'Team Members', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['grid', 'featured', 'compact'], defaultValue: 'grid' },
    { name: 'columns', label: 'Columns', type: 'select', options: ['3', '4', '5'], defaultValue: '3' },
    { name: 'showBio', label: 'Show Bio', type: 'boolean', defaultValue: true },
    { name: 'showSocial', label: 'Show Social Links', type: 'boolean', defaultValue: true },
    { name: 'background', label: 'Background', type: 'select', options: ['white', 'gray', 'gradient'], defaultValue: 'white' },
  ],
}
