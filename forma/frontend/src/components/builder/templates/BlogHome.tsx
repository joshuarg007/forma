'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface BlogHomeProps {
  id?: string
  className?: string
  // Branding
  blogName?: string
  tagline?: string
  // Posts
  posts?: Array<{
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
  }>
  // Categories
  categories?: string[]
  // Featured post
  featuredPost?: {
    title: string
    excerpt: string
    image: string
    category: string
    author: {
      name: string
      avatar?: string
    }
    date: string
    slug?: string
  }
  // Newsletter
  showNewsletter?: boolean
  newsletterTitle?: string
  newsletterDescription?: string
}

const defaultPosts = [
  {
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
    title: 'The Future of CSS: What to Expect in 2024',
    excerpt: 'Exploring the new CSS features that will change how we style the web.',
    image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
    category: 'CSS',
    author: { name: 'Emily Watson' },
    date: 'Jan 10, 2024',
    readTime: '5 min read',
    slug: 'future-of-css',
  },
  {
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
    title: 'State Management in 2024: A Complete Guide',
    excerpt: 'Comparing different state management solutions for modern React applications.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    category: 'React',
    author: { name: 'James Wilson' },
    date: 'Jan 3, 2024',
    readTime: '9 min read',
    slug: 'state-management-guide',
  },
]

const defaultFeaturedPost = {
  title: 'The Complete Guide to Building Modern Web Applications',
  excerpt: 'Everything you need to know about building fast, scalable, and maintainable web applications in 2024. From architecture decisions to deployment strategies.',
  image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200',
  category: 'Tutorial',
  author: { name: 'Sarah Chen' },
  date: 'Jan 18, 2024',
  slug: 'complete-guide-modern-web-apps',
}

const defaultCategories = ['All', 'React', 'TypeScript', 'CSS', 'Accessibility', 'Infrastructure', 'Tutorial']

export default function BlogHome({
  id,
  className,
  blogName = 'DevBlog',
  tagline = 'Insights and tutorials for modern web development',
  posts = defaultPosts,
  categories = defaultCategories,
  featuredPost = defaultFeaturedPost,
  showNewsletter = true,
  newsletterTitle = 'Stay up to date',
  newsletterDescription = 'Get the latest articles and resources sent straight to your inbox.',
}: BlogHomeProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [email, setEmail] = useState('')

  const filteredPosts = activeCategory === 'All'
    ? posts
    : posts.filter((post) => post.category === activeCategory)

  return (
    <div id={id} className={cn('min-h-screen bg-white dark:bg-gray-950', className)}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                {blogName.charAt(0)}
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{blogName}</span>
            </a>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6">
                {categories.slice(1, 5).map((category) => (
                  <a
                    key={category}
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
                  >
                    {category}
                  </a>
                ))}
              </div>
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {blogName}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {tagline}
          </p>
        </div>
      </header>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <span className="inline-block px-3 py-1 bg-indigo-600 rounded-full text-sm font-medium mb-4">
                  {featuredPost.category}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 max-w-3xl">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-200 text-lg mb-6 max-w-2xl">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-semibold">
                    {featuredPost.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{featuredPost.author.name}</div>
                    <div className="text-sm text-gray-300">{featuredPost.date}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition',
                  activeCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <article
                key={index}
                className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition"
              >
                <a href="#" className="block">
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
                          {post.author.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {post.author.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                        <span>{post.date}</span>
                        {post.readTime && (
                          <>
                            <span>·</span>
                            <span>{post.readTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      {showNewsletter && (
        <section className="py-16 bg-indigo-600">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {newsletterTitle}
            </h2>
            <p className="text-indigo-100 mb-8">
              {newsletterDescription}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                alert(`Subscribed: ${email}`)
                setEmail('')
              }}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white hover:bg-gray-100 text-indigo-600 rounded-xl font-semibold transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                {blogName.charAt(0)}
              </div>
              <span className="text-xl font-bold text-white">{blogName}</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">GitHub</a>
              <a href="#" className="hover:text-white transition">RSS</a>
            </div>
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} {blogName}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

BlogHome.displayName = 'BlogHome'

BlogHome.config = {
  id: 'blog-home-template',
  name: 'Blog Home',
  category: 'templates',
  description: 'Blog homepage with featured post, categories, and newsletter',
  defaultProps: {
    blogName: 'DevBlog',
    tagline: 'Insights and tutorials for modern web development',
    showNewsletter: true,
  },
  editableFields: [
    { name: 'blogName', label: 'Blog Name', type: 'text' },
    { name: 'tagline', label: 'Tagline', type: 'text' },
    { name: 'posts', label: 'Posts', type: 'array' },
    { name: 'categories', label: 'Categories', type: 'array' },
    { name: 'featuredPost', label: 'Featured Post', type: 'object' },
    { name: 'showNewsletter', label: 'Show Newsletter', type: 'boolean' },
    { name: 'newsletterTitle', label: 'Newsletter Title', type: 'text' },
    { name: 'newsletterDescription', label: 'Newsletter Description', type: 'textarea' },
  ],
}
