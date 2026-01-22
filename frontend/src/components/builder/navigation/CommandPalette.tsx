'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: 'page' | 'action' | 'user' | 'settings' | 'search' | 'file' | 'folder'
  shortcut?: string
  href?: string
  category?: string
}

interface CommandPaletteProps extends ModuleProps {
  placeholder?: string
  items?: CommandItem[]
  showTrigger?: boolean
  triggerText?: string
  recentLabel?: string
  showRecent?: boolean
  maxResults?: number
}

const defaultItems: CommandItem[] = [
  { id: '1', label: 'Home', description: 'Go to homepage', icon: 'page', shortcut: 'G H', href: '/', category: 'Pages' },
  { id: '2', label: 'Dashboard', description: 'View your dashboard', icon: 'page', href: '/dashboard', category: 'Pages' },
  { id: '3', label: 'Settings', description: 'Manage your preferences', icon: 'settings', shortcut: 'G S', href: '/settings', category: 'Pages' },
  { id: '4', label: 'Profile', description: 'View your profile', icon: 'user', href: '/profile', category: 'Pages' },
  { id: '5', label: 'New Project', description: 'Create a new project', icon: 'action', shortcut: 'N P', category: 'Actions' },
  { id: '6', label: 'New Document', description: 'Create a new document', icon: 'file', shortcut: 'N D', category: 'Actions' },
  { id: '7', label: 'Search Files', description: 'Search all files', icon: 'search', shortcut: '/', category: 'Actions' },
  { id: '8', label: 'Open Folder', description: 'Browse folders', icon: 'folder', category: 'Actions' },
]

const icons: Record<string, React.ReactNode> = {
  page: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  action: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  file: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  folder: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
}

export default function CommandPalette({
  id,
  className,
  styles,
  placeholder = 'Search commands...',
  items = defaultItems,
  showTrigger = true,
  triggerText = 'Search',
  recentLabel = 'Recent',
  showRecent = true,
  maxResults = 8,
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter items based on query
  const filteredItems = query
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, maxResults)
    : showRecent ? items.slice(0, 4) : []

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || 'Results'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as Record<string, CommandItem[]>)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Navigation
  const handleKeyNav = (e: React.KeyboardEvent) => {
    const totalItems = filteredItems.length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems)
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      const item = filteredItems[selectedIndex]
      if (item.href) {
        window.location.href = item.href
      }
      setIsOpen(false)
    }
  }

  return (
    <div id={id} className={className} style={styles}>
      {/* Trigger Button */}
      {showTrigger && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 w-full max-w-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1 text-left text-sm">{triggerText}</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 rounded text-xs font-medium text-gray-500">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      )}

      {/* Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog */}
          <div className="relative min-h-screen flex items-start justify-center pt-[15vh] px-4">
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b border-gray-200">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  onKeyDown={handleKeyNav}
                  placeholder={placeholder}
                  className="flex-1 py-4 text-lg outline-none placeholder:text-gray-400"
                />
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-500">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {filteredItems.length > 0 ? (
                  <div className="py-2">
                    {Object.entries(groupedItems).map(([category, categoryItems]) => (
                      <div key={category}>
                        <div className="px-4 py-2">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {query ? category : recentLabel}
                          </span>
                        </div>
                        {categoryItems.map((item) => {
                          const itemIndex = filteredItems.indexOf(item)
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (item.href) window.location.href = item.href
                                setIsOpen(false)
                              }}
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                                selectedIndex === itemIndex ? 'bg-indigo-50' : 'hover:bg-gray-50'
                              )}
                            >
                              <div className={cn(
                                'p-2 rounded-lg',
                                selectedIndex === itemIndex ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                              )}>
                                {item.icon && icons[item.icon]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={cn(
                                  'font-medium',
                                  selectedIndex === itemIndex ? 'text-indigo-600' : 'text-gray-900'
                                )}>
                                  {item.label}
                                </div>
                                {item.description && (
                                  <div className="text-sm text-gray-500 truncate">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                              {item.shortcut && (
                                <div className="flex items-center gap-1">
                                  {item.shortcut.split(' ').map((key, i) => (
                                    <kbd
                                      key={i}
                                      className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-500"
                                    >
                                      {key}
                                    </kbd>
                                  ))}
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                ) : query ? (
                  <div className="py-12 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">No results found for "{query}"</p>
                    <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">↵</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">ESC</kbd>
                  <span>Close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

CommandPalette.displayName = 'CommandPalette'

CommandPalette.config = {
  id: 'command-palette',
  name: 'Command Palette',
  category: 'navigation',
  description: 'Cmd+K style search and command palette',
  defaultProps: {
    placeholder: 'Search commands...',
    items: defaultItems,
    showTrigger: true,
    triggerText: 'Search',
    recentLabel: 'Recent',
    showRecent: true,
    maxResults: 8,
  },
  editableFields: [
    { name: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Search commands...' },
    { name: 'items', label: 'Command Items', type: 'array' },
    { name: 'showTrigger', label: 'Show Trigger', type: 'boolean', defaultValue: true },
    { name: 'triggerText', label: 'Trigger Text', type: 'text', defaultValue: 'Search' },
    { name: 'recentLabel', label: 'Recent Label', type: 'text', defaultValue: 'Recent' },
    { name: 'showRecent', label: 'Show Recent', type: 'boolean', defaultValue: true },
    { name: 'maxResults', label: 'Max Results', type: 'number', defaultValue: 8 },
  ],
}
