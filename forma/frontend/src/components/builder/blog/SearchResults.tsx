'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  type: 'post' | 'page' | 'author' | 'category'
  title: string
  excerpt?: string
  image?: string
  url?: string
  date?: string
  category?: string
}

interface SearchResultsProps {
  id?: string
  className?: string
  query?: string
  results?: SearchResult[]
  showFilters?: boolean
  showResultCount?: boolean
  noResultsMessage?: string
  isLoading?: boolean
}

const defaultResults: SearchResult[] = [
  {
    id: '1',
    type: 'post',
    title: 'Getting Started with React Server Components',
    excerpt: 'Learn how React Server Components can improve your application performance and developer experience.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    date: 'Jan 15, 2024',
    category: 'React',
  },
  {
    id: '2',
    type: 'post',
    title: 'Understanding React Hooks in Depth',
    excerpt: 'A comprehensive guide to React Hooks and how they changed the way we write React components.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    date: 'Jan 12, 2024',
    category: 'React',
  },
  {
    id: '3',
    type: 'post',
    title: 'React State Management in 2024',
    excerpt: 'Comparing different state management solutions for modern React applications.',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
    date: 'Jan 10, 2024',
    category: 'React',
  },
  {
    id: '4',
    type: 'category',
    title: 'React',
    excerpt: '12 articles about React development',
  },
  {
    id: '5',
    type: 'author',
    title: 'Sarah Chen',
    excerpt: 'Developer Advocate specializing in React',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  },
]

export default function SearchResults({
  id,
  className,
  query = 'React',
  results = defaultResults,
  showFilters = true,
  showResultCount = true,
  noResultsMessage = 'No results found. Try adjusting your search terms.',
  isLoading = false,
}: SearchResultsProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const filters = [
    { id: 'all', label: 'All Results' },
    { id: 'post', label: 'Posts' },
    { id: 'page', label: 'Pages' },
    { id: 'author', label: 'Authors' },
    { id: 'category', label: 'Categories' },
  ]

  const filteredResults = activeFilter === 'all'
    ? results
    : results.filter((r) => r.type === activeFilter)

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        )
      case 'page':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'author':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      case 'category':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div id={id} className={cn('py-8', className)}>
      {/* Search Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Search results for &ldquo;{query}&rdquo;
        </h2>
        {showResultCount && (
          <p className="text-gray-600 dark:text-gray-400">
            {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
          </p>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          {filters.map((filter) => {
            const count = filter.id === 'all' ? results.length : results.filter((r) => r.type === filter.id).length
            if (count === 0 && filter.id !== 'all') return null
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition',
                  activeFilter === filter.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {filter.label}
                <span className={cn(
                  'ml-1.5',
                  activeFilter === filter.id ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                )}>
                  ({count})
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!isLoading && filteredResults.length > 0 && (
        <div className="space-y-6">
          {filteredResults.map((result) => (
            <a
              key={result.id}
              href="#"
              className="group flex gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              {/* Image or Icon */}
              {result.image ? (
                <img
                  src={result.image}
                  alt={result.title}
                  className={cn(
                    'flex-shrink-0 object-cover',
                    result.type === 'author' ? 'w-16 h-16 rounded-full' : 'w-24 h-24 rounded-xl'
                  )}
                />
              ) : (
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
                  {getResultIcon(result.type)}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase">
                    {result.type}
                  </span>
                  {result.category && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{result.category}</span>
                    </>
                  )}
                  {result.date && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{result.date}</span>
                    </>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {result.title}
                </h3>
                {result.excerpt && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {result.excerpt}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && filteredResults.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">{noResultsMessage}</p>
        </div>
      )}
    </div>
  )
}

SearchResults.displayName = 'SearchResults'

SearchResults.config = {
  id: 'search-results',
  name: 'Search Results',
  category: 'blog',
  description: 'Search results page with filters',
  defaultProps: {
    query: 'React',
    showFilters: true,
    showResultCount: true,
    noResultsMessage: 'No results found. Try adjusting your search terms.',
    isLoading: false,
  },
  editableFields: [
    { name: 'query', label: 'Search Query', type: 'text' },
    { name: 'results', label: 'Results', type: 'array' },
    { name: 'showFilters', label: 'Show Filters', type: 'boolean' },
    { name: 'showResultCount', label: 'Show Result Count', type: 'boolean' },
    { name: 'noResultsMessage', label: 'No Results Message', type: 'text' },
    { name: 'isLoading', label: 'Is Loading', type: 'boolean' },
  ],
}
