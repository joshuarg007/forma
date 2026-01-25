'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface SidebarLink {
  label: string
  href: string
  icon?: string
  badge?: string
  children?: SidebarLink[]
}

interface SidebarProps extends ModuleProps {
  logo?: string
  logoText?: string
  links?: SidebarLink[]
  theme?: 'light' | 'dark'
  collapsed?: boolean
  showUserProfile?: boolean
  userName?: string
  userEmail?: string
  userAvatar?: string
}

const defaultLinks: SidebarLink[] = [
  { label: 'Dashboard', href: '#', icon: 'home' },
  { label: 'Projects', href: '#', icon: 'folder', badge: '12' },
  { label: 'Team', href: '#', icon: 'users' },
  { label: 'Analytics', href: '#', icon: 'chart' },
  { label: 'Settings', href: '#', icon: 'settings' },
]

const icons: Record<string, React.ReactNode> = {
  home: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  folder: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  settings: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
}

const themeClasses = {
  light: {
    bg: 'bg-white border-r border-gray-200',
    logo: 'text-gray-900',
    link: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    linkActive: 'text-indigo-600 bg-indigo-50',
    divider: 'border-gray-200',
    user: 'border-gray-200',
  },
  dark: {
    bg: 'bg-gray-900 border-r border-gray-800',
    logo: 'text-white',
    link: 'text-gray-400 hover:text-white hover:bg-gray-800',
    linkActive: 'text-white bg-indigo-600',
    divider: 'border-gray-800',
    user: 'border-gray-800',
  },
}

export default function Sidebar({
  id,
  className,
  styles,
  logo,
  logoText = 'Forma',
  links = defaultLinks,
  theme = 'dark',
  collapsed = false,
  showUserProfile = true,
  userName = 'John Doe',
  userEmail = 'john@example.com',
  userAvatar,
}: SidebarProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(collapsed)
  const themeStyles = themeClasses[theme]

  return (
    <aside
      id={id}
      className={cn(
        'h-screen flex flex-col transition-all duration-300',
        themeStyles.bg,
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
      style={styles}
    >
      {/* Header */}
      <div className={cn('p-4 border-b', themeStyles.divider)}>
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt={logoText} className="h-8 w-8 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {logoText.charAt(0)}
              </div>
            )}
            {!isCollapsed && (
              <span className={cn('font-semibold text-lg', themeStyles.logo)}>
                {logoText}
              </span>
            )}
          </a>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn('p-1.5 rounded-lg transition-colors', themeStyles.link)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors',
              activeIndex === index ? themeStyles.linkActive : themeStyles.link
            )}
            title={isCollapsed ? link.label : undefined}
          >
            <span className="flex-shrink-0">
              {link.icon && icons[link.icon]}
            </span>
            {!isCollapsed && (
              <>
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-600 rounded-full">
                    {link.badge}
                  </span>
                )}
              </>
            )}
          </a>
        ))}
      </nav>

      {/* User Profile */}
      {showUserProfile && (
        <div className={cn('p-4 border-t', themeStyles.user)}>
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {userName.charAt(0)}
              </div>
            )}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium truncate', themeStyles.logo)}>{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

Sidebar.displayName = 'Sidebar'

Sidebar.config = {
  id: 'sidebar',
  name: 'Sidebar',
  category: 'navigation',
  description: 'Collapsible sidebar navigation with icons and user profile',
  defaultProps: {
    logoText: 'Forma',
    links: defaultLinks,
    theme: 'dark',
    collapsed: false,
    showUserProfile: true,
    userName: 'John Doe',
    userEmail: 'john@example.com',
  },
  editableFields: [
    { name: 'logo', label: 'Logo Image', type: 'image' },
    { name: 'logoText', label: 'Logo Text', type: 'text', defaultValue: 'Forma' },
    { name: 'links', label: 'Navigation Links', type: 'array' },
    { name: 'theme', label: 'Theme', type: 'select', options: ['light', 'dark'], defaultValue: 'dark' },
    { name: 'collapsed', label: 'Start Collapsed', type: 'boolean', defaultValue: false },
    { name: 'showUserProfile', label: 'Show User Profile', type: 'boolean', defaultValue: true },
    { name: 'userName', label: 'User Name', type: 'text' },
    { name: 'userEmail', label: 'User Email', type: 'text' },
    { name: 'userAvatar', label: 'User Avatar', type: 'image' },
  ],
}
