'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface BlogCardProps extends ModuleProps {
  title?: string
  excerpt?: string
  image?: string
  category?: string
  categoryColor?: string
  author?: string
  authorImage?: string
  date?: string
  readTime?: string
  href?: string
  variant?: 'simple' | 'bordered' | 'elevated' | 'horizontal'
  showCategory?: boolean
  showAuthor?: boolean
  showReadTime?: boolean
}

export default function BlogCard({
  id,
  className,
  styles,
  title = 'Getting Started with Modern Web Development',
  excerpt = 'Learn the essential tools and techniques that every modern web developer needs to know to build amazing applications.',
  image,
  category = 'Development',
  categoryColor = 'indigo',
  author = 'Jane Smith',
  authorImage,
  date = 'Jan 15, 2025',
  readTime = '5 min read',
  href = '#',
  variant = 'elevated',
  showCategory = true,
  showAuthor = true,
  showReadTime = true,
}: BlogCardProps) {
  const isHorizontal = variant === 'horizontal'

  const categoryColors: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700',
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    pink: 'bg-pink-100 text-pink-700',
    gray: 'bg-gray-100 text-gray-700',
  }

  if (isHorizontal) {
    return (
      <article
        id={id}
        className={cn(
          'flex gap-6 p-4 rounded-2xl bg-white shadow-lg',
          className
        )}
        style={styles}
      >
        {/* Image */}
        <div className="flex-shrink-0 w-48 h-36">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0">
          {showCategory && (
            <span className={cn(
              'inline-flex self-start px-2.5 py-1 rounded-full text-xs font-medium mb-2',
              categoryColors[categoryColor] || categoryColors.indigo
            )}>
              {category}
            </span>
          )}

          <a href={href} className="group">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
              {title}
            </h3>
          </a>

          <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-1">{excerpt}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {showAuthor && (
              <div className="flex items-center gap-2">
                {authorImage ? (
                  <img src={authorImage} alt={author} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold">
                    {author.charAt(0)}
                  </div>
                )}
                <span>{author}</span>
              </div>
            )}
            {showReadTime && (
              <>
                <span>·</span>
                <span>{readTime}</span>
              </>
            )}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      id={id}
      className={cn(
        'overflow-hidden rounded-2xl',
        variant === 'simple' && 'bg-white',
        variant === 'bordered' && 'bg-white border border-gray-200',
        variant === 'elevated' && 'bg-white shadow-lg',
        className
      )}
      style={styles}
    >
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
            <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category & Meta */}
        <div className="flex items-center gap-3 mb-3">
          {showCategory && (
            <span className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              categoryColors[categoryColor] || categoryColors.indigo
            )}>
              {category}
            </span>
          )}
          <span className="text-sm text-gray-500">{date}</span>
        </div>

        {/* Title */}
        <a href={href} className="group">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-3">
            {title}
          </h3>
        </a>

        {/* Excerpt */}
        <p className="text-gray-600 line-clamp-3 mb-4">{excerpt}</p>

        {/* Author & Read Time */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {showAuthor && (
            <div className="flex items-center gap-3">
              {authorImage ? (
                <img src={authorImage} alt={author} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {author.charAt(0)}
                </div>
              )}
              <span className="font-medium text-gray-900">{author}</span>
            </div>
          )}
          {showReadTime && (
            <span className="text-sm text-gray-500">{readTime}</span>
          )}
        </div>
      </div>
    </article>
  )
}

BlogCard.displayName = 'BlogCard'

BlogCard.config = {
  id: 'blog-card',
  name: 'Blog Card',
  category: 'content',
  description: 'Blog post card with image, excerpt, and author info',
  defaultProps: {
    title: 'Getting Started with Modern Web Development',
    excerpt: 'Learn the essential tools and techniques that every modern web developer needs to know to build amazing applications.',
    category: 'Development',
    categoryColor: 'indigo',
    author: 'Jane Smith',
    date: 'Jan 15, 2025',
    readTime: '5 min read',
    href: '#',
    variant: 'elevated',
    showCategory: true,
    showAuthor: true,
    showReadTime: true,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
    { name: 'image', label: 'Image', type: 'image' },
    { name: 'category', label: 'Category', type: 'text', defaultValue: 'Development' },
    { name: 'categoryColor', label: 'Category Color', type: 'select', options: ['indigo', 'purple', 'blue', 'green', 'red', 'orange', 'pink', 'gray'], defaultValue: 'indigo' },
    { name: 'author', label: 'Author', type: 'text' },
    { name: 'authorImage', label: 'Author Image', type: 'image' },
    { name: 'date', label: 'Date', type: 'text' },
    { name: 'readTime', label: 'Read Time', type: 'text' },
    { name: 'href', label: 'Link', type: 'url' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['simple', 'bordered', 'elevated', 'horizontal'], defaultValue: 'elevated' },
    { name: 'showCategory', label: 'Show Category', type: 'boolean', defaultValue: true },
    { name: 'showAuthor', label: 'Show Author', type: 'boolean', defaultValue: true },
    { name: 'showReadTime', label: 'Show Read Time', type: 'boolean', defaultValue: true },
  ],
}
