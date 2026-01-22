'use client'

import { cn } from '@/lib/utils'

interface BlogPostProps {
  id?: string
  className?: string
  title?: string
  content?: string
  heroImage?: string
  category?: string
  author?: {
    name: string
    avatar?: string
    bio?: string
    role?: string
  }
  date?: string
  readTime?: string
  tags?: string[]
  showTableOfContents?: boolean
  showShareButtons?: boolean
  showAuthorBio?: boolean
}

export default function BlogPost({
  id,
  className,
  title = 'Getting Started with React Server Components',
  content = `
    <p>React Server Components represent a fundamental shift in how we think about building React applications. They allow us to render components on the server, reducing the amount of JavaScript sent to the client.</p>

    <h2>What are Server Components?</h2>
    <p>Server Components are a new type of component that runs exclusively on the server. They can directly access backend resources like databases and file systems without exposing sensitive data to the client.</p>

    <h2>Benefits of Server Components</h2>
    <ul>
      <li>Reduced bundle size - Server Components don't add to your JavaScript bundle</li>
      <li>Direct backend access - Query databases directly without API layers</li>
      <li>Automatic code splitting - Only client components are sent to the browser</li>
      <li>Improved SEO - Content is rendered on the server</li>
    </ul>

    <h2>When to Use Server Components</h2>
    <p>Use Server Components when you need to fetch data, access backend resources, or render static content. Use Client Components when you need interactivity, browser APIs, or state management.</p>

    <pre><code>// Example Server Component
async function BlogPosts() {
  const posts = await db.posts.findMany()
  return (
    &lt;ul&gt;
      {posts.map(post =&gt; (
        &lt;li key={post.id}&gt;{post.title}&lt;/li&gt;
      ))}
    &lt;/ul&gt;
  )
}</code></pre>

    <h2>Conclusion</h2>
    <p>Server Components are a powerful addition to React that can significantly improve your application's performance. Start experimenting with them today to see the benefits for yourself.</p>
  `,
  heroImage = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200',
  category = 'React',
  author = {
    name: 'Sarah Chen',
    bio: 'Senior Developer Advocate with 10+ years of experience in web development.',
    role: 'Developer Advocate',
  },
  date = 'January 15, 2024',
  readTime = '8 min read',
  tags = ['React', 'Server Components', 'Performance', 'Next.js'],
  showTableOfContents = true,
  showShareButtons = true,
  showAuthorBio = true,
}: BlogPostProps) {
  return (
    <article id={id} className={cn('py-12', className)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium">
              {category}
            </span>
            <span className="text-gray-500 dark:text-gray-400">{date}</span>
            <span className="text-gray-500 dark:text-gray-400">{readTime}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {author.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{author.name}</div>
              {author.role && (
                <div className="text-sm text-gray-500 dark:text-gray-400">{author.role}</div>
              )}
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className="mb-10 rounded-2xl overflow-hidden">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-[400px] object-cover"
          />
        </div>

        {/* Share Buttons */}
        {showShareButtons && (
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">Share:</span>
            <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </button>
            <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </button>
            <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-600 dark:prose-p:text-gray-300
            prose-a:text-indigo-600 dark:prose-a:text-indigo-400
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100
            prose-ul:text-gray-600 dark:prose-ul:text-gray-300
            prose-li:text-gray-600 dark:prose-li:text-gray-300"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Tags */}
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        {showAuthorBio && author.bio && (
          <div className="mt-10 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {author.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-lg">{author.name}</div>
                {author.role && (
                  <div className="text-indigo-600 dark:text-indigo-400 text-sm mb-2">{author.role}</div>
                )}
                <p className="text-gray-600 dark:text-gray-400">{author.bio}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

BlogPost.displayName = 'BlogPost'

BlogPost.config = {
  id: 'blog-post',
  name: 'Blog Post',
  category: 'blog',
  description: 'Full article layout with hero, content, and author bio',
  defaultProps: {
    showTableOfContents: true,
    showShareButtons: true,
    showAuthorBio: true,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'content', label: 'Content', type: 'richtext' },
    { name: 'heroImage', label: 'Hero Image', type: 'image' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'author', label: 'Author', type: 'object' },
    { name: 'date', label: 'Date', type: 'text' },
    { name: 'readTime', label: 'Read Time', type: 'text' },
    { name: 'tags', label: 'Tags', type: 'array' },
    { name: 'showTableOfContents', label: 'Show Table of Contents', type: 'boolean' },
    { name: 'showShareButtons', label: 'Show Share Buttons', type: 'boolean' },
    { name: 'showAuthorBio', label: 'Show Author Bio', type: 'boolean' },
  ],
}
