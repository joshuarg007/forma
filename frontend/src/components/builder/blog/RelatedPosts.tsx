'use client'

import { cn } from '@/lib/utils'

interface RelatedPost {
  id: string
  title: string
  excerpt?: string
  image: string
  category: string
  date: string
  slug?: string
}

interface RelatedPostsProps {
  id?: string
  className?: string
  title?: string
  posts?: RelatedPost[]
  layout?: 'grid' | 'list' | 'compact'
  columns?: 2 | 3 | 4
  showCategory?: boolean
  showDate?: boolean
  showExcerpt?: boolean
}

const defaultPosts: RelatedPost[] = [
  {
    id: '1',
    title: 'Understanding React Hooks',
    excerpt: 'A deep dive into React Hooks and how they simplify state management.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
    category: 'React',
    date: 'Jan 10, 2024',
  },
  {
    id: '2',
    title: 'Next.js 14 Features',
    excerpt: 'Exploring the new features and improvements in Next.js 14.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
    category: 'Next.js',
    date: 'Jan 8, 2024',
  },
  {
    id: '3',
    title: 'Building Performant APIs',
    excerpt: 'Best practices for building fast and scalable APIs.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
    category: 'Backend',
    date: 'Jan 5, 2024',
  },
]

export default function RelatedPosts({
  id,
  className,
  title = 'Related Articles',
  posts = defaultPosts,
  layout = 'grid',
  columns = 3,
  showCategory = true,
  showDate = true,
  showExcerpt = true,
}: RelatedPostsProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  if (layout === 'compact') {
    return (
      <div id={id} className={cn('py-8', className)}>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{title}</h3>
        <div className="space-y-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href="#"
              className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                  {post.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  {showCategory && <span>{post.category}</span>}
                  {showCategory && showDate && <span>·</span>}
                  {showDate && <span>{post.date}</span>}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  if (layout === 'list') {
    return (
      <div id={id} className={cn('py-8', className)}>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{title}</h3>
        <div className="space-y-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href="#"
              className="group flex flex-col md:flex-row gap-4"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full md:w-48 h-32 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1">
                {showCategory && (
                  <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded text-xs font-medium mb-2">
                    {post.category}
                  </span>
                )}
                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-1">
                  {post.title}
                </h4>
                {showExcerpt && post.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
                )}
                {showDate && (
                  <span className="text-sm text-gray-500 dark:text-gray-500 mt-2 block">{post.date}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  // Default grid layout
  return (
    <div id={id} className={cn('py-8', className)}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{title}</h3>
      <div className={cn('grid gap-6', gridCols[columns])}>
        {posts.map((post) => (
          <a
            key={post.id}
            href="#"
            className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition"
          >
            <div className="relative overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
              />
              {showCategory && (
                <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-gray-900/90 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                  {post.category}
                </span>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2 mb-2">
                {post.title}
              </h4>
              {showExcerpt && post.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{post.excerpt}</p>
              )}
              {showDate && (
                <span className="text-sm text-gray-500 dark:text-gray-500">{post.date}</span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

RelatedPosts.displayName = 'RelatedPosts'

RelatedPosts.config = {
  id: 'related-posts',
  name: 'Related Posts',
  category: 'blog',
  description: 'Related content grid or list',
  defaultProps: {
    title: 'Related Articles',
    layout: 'grid',
    columns: 3,
    showCategory: true,
    showDate: true,
    showExcerpt: true,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'posts', label: 'Posts', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['grid', 'list', 'compact'] },
    { name: 'columns', label: 'Columns', type: 'select', options: [2, 3, 4] },
    { name: 'showCategory', label: 'Show Category', type: 'boolean' },
    { name: 'showDate', label: 'Show Date', type: 'boolean' },
    { name: 'showExcerpt', label: 'Show Excerpt', type: 'boolean' },
  ],
}
