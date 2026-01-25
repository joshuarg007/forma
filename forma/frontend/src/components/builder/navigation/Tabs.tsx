'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface Tab {
  label: string
  content?: string
  icon?: string
  disabled?: boolean
}

interface TabsProps extends ModuleProps {
  tabs?: Tab[]
  defaultTab?: number
  variant?: 'underline' | 'pills' | 'boxed' | 'lifted'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  centered?: boolean
}

const defaultTabs: Tab[] = [
  { label: 'Overview', content: 'This is the overview content. Add your description, features, or any introductory information here.' },
  { label: 'Features', content: 'List all the amazing features of your product or service. Make it compelling and easy to understand.' },
  { label: 'Pricing', content: 'Display your pricing options here. Be transparent and highlight the value customers will receive.' },
  { label: 'FAQ', content: 'Answer common questions your customers might have. This helps build trust and reduces support inquiries.' },
]

const variantClasses = {
  underline: {
    list: 'border-b border-gray-200',
    tab: 'py-3 px-4 -mb-px border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700',
    tabActive: 'border-indigo-600 text-indigo-600',
  },
  pills: {
    list: 'gap-2',
    tab: 'py-2 px-4 rounded-lg hover:bg-gray-100',
    tabActive: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  boxed: {
    list: 'bg-gray-100 p-1 rounded-xl gap-1',
    tab: 'py-2 px-4 rounded-lg',
    tabActive: 'bg-white shadow-sm text-gray-900',
  },
  lifted: {
    list: 'gap-1',
    tab: 'py-2 px-4 rounded-t-lg border border-transparent border-b-0 hover:bg-gray-50',
    tabActive: 'bg-white border-gray-200 border-b-white -mb-px relative z-10',
  },
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export default function Tabs({
  id,
  className,
  styles,
  tabs = defaultTabs,
  defaultTab = 0,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  centered = false,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const variantStyles = variantClasses[variant]

  return (
    <div id={id} className={cn('', className)} style={styles}>
      {/* Tab List */}
      <div
        className={cn(
          'flex',
          variantStyles.list,
          sizeClasses[size],
          centered && 'justify-center',
          variant === 'lifted' && 'border-b border-gray-200'
        )}
        role="tablist"
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${index}`}
            disabled={tab.disabled}
            onClick={() => setActiveTab(index)}
            className={cn(
              'font-medium transition-colors whitespace-nowrap',
              variantStyles.tab,
              activeTab === index && variantStyles.tabActive,
              fullWidth && 'flex-1 text-center',
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        className={cn(
          'py-6',
          variant === 'lifted' && 'border border-t-0 border-gray-200 rounded-b-lg p-6 bg-white'
        )}
      >
        {tabs[activeTab]?.content ? (
          <p className="text-gray-600 leading-relaxed">{tabs[activeTab].content}</p>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Tab content for "{tabs[activeTab]?.label}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

Tabs.displayName = 'Tabs'

Tabs.config = {
  id: 'tabs',
  name: 'Tabs',
  category: 'navigation',
  description: 'Tabbed content switcher with multiple styles',
  defaultProps: {
    tabs: defaultTabs,
    defaultTab: 0,
    variant: 'underline',
    size: 'md',
    fullWidth: false,
    centered: false,
  },
  editableFields: [
    { name: 'tabs', label: 'Tabs', type: 'array' },
    { name: 'defaultTab', label: 'Default Tab (index)', type: 'number', defaultValue: 0 },
    { name: 'variant', label: 'Variant', type: 'select', options: ['underline', 'pills', 'boxed', 'lifted'], defaultValue: 'underline' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
    { name: 'fullWidth', label: 'Full Width', type: 'boolean', defaultValue: false },
    { name: 'centered', label: 'Centered', type: 'boolean', defaultValue: false },
  ],
}
