'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  count?: number
  icon?: string
}

interface CategoryFilterProps {
  id?: string
  className?: string
  categories?: Category[]
  layout?: 'horizontal' | 'vertical' | 'dropdown'
  showCounts?: boolean
  activeCategory?: string
  onCategoryChange?: (categoryId: string) => void
}

const defaultCategories: Category[] = [
  { id: 'all', name: 'All', count: 47 },
  { id: 'react', name: 'React', count: 12 },
  { id: 'typescript', name: 'TypeScript', count: 8 },
  { id: 'css', name: 'CSS', count: 6 },
  { id: 'nextjs', name: 'Next.js', count: 9 },
  { id: 'nodejs', name: 'Node.js', count: 5 },
  { id: 'devops', name: 'DevOps', count: 4 },
  { id: 'testing', name: 'Testing', count: 3 },
]

export default function CategoryFilter({
  id,
  className,
  categories = defaultCategories,
  layout = 'horizontal',
  showCounts = true,
  activeCategory: initialActive = 'all',
  onCategoryChange,
}: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState(initialActive)
  const [isOpen, setIsOpen] = useState(false)

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    onCategoryChange?.(categoryId)
    if (layout === 'dropdown') {
      setIsOpen(false)
    }
  }

  if (layout === 'dropdown') {
    const activeItem = categories.find((c) => c.id === activeCategory) || categories[0]

    return (
      <div id={id} className={cn('relative', className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-left"
        >
          <span className="font-medium text-gray-900 dark:text-white">
            {activeItem.name}
            {showCounts && activeItem.count !== undefined && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({activeItem.count})</span>
            )}
          </span>
          <svg
            className={cn('w-5 h-5 text-gray-500 transition-transform', isOpen && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-10 overflow-hidden">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition',
                  activeCategory === category.id && 'bg-indigo-50 dark:bg-indigo-900/20'
                )}
              >
                <span className={cn(
                  'font-medium',
                  activeCategory === category.id
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-900 dark:text-white'
                )}>
                  {category.name}
                </span>
                {showCounts && category.count !== undefined && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{category.count}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (layout === 'vertical') {
    return (
      <div id={id} className={cn('space-y-2', className)}>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-2 rounded-lg text-left transition',
              activeCategory === category.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <span className="font-medium">{category.name}</span>
            {showCounts && category.count !== undefined && (
              <span className={cn(
                'text-sm',
                activeCategory === category.id
                  ? 'text-indigo-200'
                  : 'text-gray-500 dark:text-gray-400'
              )}>
                {category.count}
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  // Default horizontal layout
  return (
    <div id={id} className={cn('flex flex-wrap gap-2', className)}>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition',
            activeCategory === category.id
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          {category.name}
          {showCounts && category.count !== undefined && (
            <span className={cn(
              'ml-1.5',
              activeCategory === category.id ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
            )}>
              ({category.count})
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

CategoryFilter.displayName = 'CategoryFilter'

CategoryFilter.config = {
  id: 'category-filter',
  name: 'Category Filter',
  category: 'blog',
  description: 'Filter posts by category',
  defaultProps: {
    layout: 'horizontal',
    showCounts: true,
    activeCategory: 'all',
  },
  editableFields: [
    { name: 'categories', label: 'Categories', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['horizontal', 'vertical', 'dropdown'] },
    { name: 'showCounts', label: 'Show Counts', type: 'boolean' },
    { name: 'activeCategory', label: 'Active Category', type: 'text' },
  ],
}
