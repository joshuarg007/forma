'use client'

import { cn } from '@/lib/utils'

interface ProjectCardProps {
  id?: string
  className?: string
  title?: string
  description?: string
  image?: string
  category?: string
  tags?: string[]
  link?: string
  year?: string
  featured?: boolean
  variant?: 'default' | 'minimal' | 'detailed'
}

export default function ProjectCard({
  id,
  className,
  title = 'E-Commerce Platform',
  description = 'A modern e-commerce solution with real-time inventory and AI recommendations.',
  image = 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800',
  category = 'Web App',
  tags = ['React', 'Node.js', 'PostgreSQL'],
  link,
  year = '2024',
  featured = false,
  variant = 'default',
}: ProjectCardProps) {
  if (variant === 'minimal') {
    return (
      <a
        id={id}
        href={link || '#'}
        className={cn(
          'group block rounded-xl overflow-hidden',
          className
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition text-white font-medium">
              View Project
            </span>
          </div>
        </div>
        <div className="pt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{category}</p>
        </div>
      </a>
    )
  }

  if (variant === 'detailed') {
    return (
      <a
        id={id}
        href={link || '#'}
        className={cn(
          'group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl transition',
          featured && 'md:flex',
          className
        )}
      >
        <div className={cn(
          'relative overflow-hidden',
          featured ? 'md:w-1/2' : 'aspect-[16/10]'
        )}>
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          {featured && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-full">
                Featured
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-6',
          featured && 'md:w-1/2 md:flex md:flex-col md:justify-center md:p-8'
        )}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
              {category}
            </span>
            {year && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{year}</span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-3">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {description}
          </p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <span className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
            View Case Study
            <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </a>
    )
  }

  // Default variant
  return (
    <a
      id={id}
      href={link || '#'}
      className={cn(
        'group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
          <div className="absolute bottom-4 left-4 right-4">
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/20 text-white text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            {category}
          </span>
          {year && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{year}</span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
          {title}
        </h3>
      </div>
    </a>
  )
}

ProjectCard.displayName = 'ProjectCard'

ProjectCard.config = {
  id: 'project-card',
  name: 'Project Card',
  category: 'portfolio',
  description: 'Project preview card',
  defaultProps: {
    variant: 'default',
    featured: false,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'image', label: 'Image', type: 'image' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'tags', label: 'Tags', type: 'array' },
    { name: 'link', label: 'Link', type: 'text' },
    { name: 'year', label: 'Year', type: 'text' },
    { name: 'featured', label: 'Featured', type: 'boolean' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'minimal', 'detailed'] },
  ],
}
