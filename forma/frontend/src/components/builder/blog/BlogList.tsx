'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  image: string
  category: string
  author: {
    name: string
    avatar?: string
  }
  date: string
  readTime?: string
  slug?: string
}

interface BlogListProps {
  id?: string
  className?: string
  posts?: BlogPost[]
  layout?: 'grid' | 'list' | 'masonry'
  columns?: 2 | 3 | 4
  showPagination?: boolean
  postsPerPage?: number
  showCategory?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showReadTime?: boolean
}

const defaultPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with React Server Components',
    excerpt: 'Learn how React Server Components can improve your application performance and developer experience.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    category: 'React',
    author: { name: 'Sarah Chen' },
    date: 'Jan 15, 2024',
    readTime: '8 min read',
    slug: 'react-server-components',
  },
  {
    id: '2',
    title: 'Building Accessible Web Applications',
    excerpt: 'A comprehensive guide to making your web apps accessible to everyone.',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
    category: 'Accessibility',
    author: { name: 'Michael Rodriguez' },
    date: 'Jan 12, 2024',
    readTime: '6 min read',
    slug: 'accessible-web-apps',
  },
  {
    id: '3',
    title: 'The Future of CSS: What to Expect',
    excerpt: 'Exploring the new CSS features that will change how we style the web.',
    image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
    category: 'CSS',
    author: { name: 'Emily Watson' },
    date: 'Jan 10, 2024',
    readTime: '5 min read',
    slug: 'future-of-css',
  },
  {
    id: '4',
    title: 'TypeScript Best Practices for Large Codebases',
    excerpt: 'Tips and patterns for maintaining type safety in enterprise applications.',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    category: 'TypeScript',
    author: { name: 'David Kim' },
    date: 'Jan 8, 2024',
    readTime: '10 min read',
    slug: 'typescript-best-practices',
  },
  {
    id: '5',
    title: 'Introduction to Edge Computing',
    excerpt: 'Understanding how edge computing is changing the way we build web applications.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    category: 'Infrastructure',
    author: { name: 'Lisa Park' },
    date: 'Jan 5, 2024',
    readTime: '7 min read',
    slug: 'edge-computing-intro',
  },
  {
    id: '6',
    title: 'State Management in 2024',
    excerpt: 'Comparing different state management solutions for modern React applications.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    category: 'React',
    author: { name: 'James Wilson' },
    date: 'Jan 3, 2024',
    readTime: '9 min read',
    slug: 'state-management-guide',
  },
]

export default function BlogList({
  id,
  className,
  posts = defaultPosts,
  layout = 'grid',
  columns = 3,
  showPagination = true,
  postsPerPage = 6,
  showCategory = true,
  showAuthor = true,
  showDate = true,
  showReadTime = true,
}: BlogListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(posts.length / postsPerPage)

  const paginatedPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div id={id} className={cn('py-12', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {layout === 'list' ? (
          <div className="space-y-8">
            {paginatedPosts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col md:flex-row gap-6 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition"
              >
                <div className="md:w-80 flex-shrink-0">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-center">
                  {showCategory && (
                    <span className="inline-block w-fit px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-3">
                      {post.category}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                    {showAuthor && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                          {post.author.name.charAt(0)}
                        </div>
                        <span>{post.author.name}</span>
                      </div>
                    )}
                    {showDate && <span>{post.date}</span>}
                    {showReadTime && post.readTime && <span>{post.readTime}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={cn('grid gap-8', gridCols[columns])}>
            {paginatedPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                  />
                  {showCategory && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    {showAuthor && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                          {post.author.name.charAt(0)}
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">{post.author.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                      {showDate && <span>{post.date}</span>}
                      {showReadTime && post.readTime && (
                        <>
                          <span>·</span>
                          <span>{post.readTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {showPagination && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-10 h-10 rounded-lg font-medium transition',
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

BlogList.displayName = 'BlogList'

BlogList.config = {
  id: 'blog-list',
  name: 'Blog List',
  category: 'blog',
  description: 'Paginated grid or list of blog posts',
  defaultProps: {
    layout: 'grid',
    columns: 3,
    showPagination: true,
    postsPerPage: 6,
  },
  editableFields: [
    { name: 'posts', label: 'Posts', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['grid', 'list', 'masonry'] },
    { name: 'columns', label: 'Columns', type: 'select', options: [2, 3, 4] },
    { name: 'showPagination', label: 'Show Pagination', type: 'boolean' },
    { name: 'postsPerPage', label: 'Posts Per Page', type: 'number' },
    { name: 'showCategory', label: 'Show Category', type: 'boolean' },
    { name: 'showAuthor', label: 'Show Author', type: 'boolean' },
    { name: 'showDate', label: 'Show Date', type: 'boolean' },
    { name: 'showReadTime', label: 'Show Read Time', type: 'boolean' },
  ],
}
