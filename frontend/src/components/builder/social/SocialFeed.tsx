'use client'

import { cn } from '@/lib/utils'

interface FeedPost {
  id: string
  author: {
    name: string
    username: string
    avatar?: string
    verified?: boolean
  }
  content: string
  image?: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  liked?: boolean
}

interface SocialFeedProps {
  id?: string
  className?: string
  posts?: FeedPost[]
  variant?: 'default' | 'compact' | 'card'
  showActions?: boolean
  showStats?: boolean
}

const defaultPosts: FeedPost[] = [
  {
    id: '1',
    author: { name: 'Sarah Chen', username: 'sarahchen', verified: true },
    content: 'Just launched our new product! So excited to share this with everyone. Check it out at the link in my bio.',
    timestamp: '2h ago',
    likes: 234,
    comments: 45,
    shares: 12,
    liked: false,
  },
  {
    id: '2',
    author: { name: 'Mike Johnson', username: 'mikej' },
    content: 'Beautiful day for coding! Working on some exciting new features today.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
    timestamp: '5h ago',
    likes: 89,
    comments: 12,
    shares: 3,
    liked: true,
  },
  {
    id: '3',
    author: { name: 'Emily Davis', username: 'emilyd', verified: true },
    content: 'Great meeting with the team today. Big things coming soon!',
    timestamp: '1d ago',
    likes: 567,
    comments: 78,
    shares: 34,
    liked: false,
  },
]

export default function SocialFeed({
  id,
  className,
  posts = defaultPosts,
  variant = 'default',
  showActions = true,
  showStats = true,
}: SocialFeedProps) {
  const ActionButtons = ({ post }: { post: FeedPost }) => (
    <div className="flex items-center gap-6">
      <button className={cn('flex items-center gap-2 text-gray-500 hover:text-red-500 transition', post.liked && 'text-red-500')}>
        <svg className="w-5 h-5" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {showStats && <span className="text-sm">{post.likes}</span>}
      </button>
      <button className="flex items-center gap-2 text-gray-500 hover:text-indigo-500 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {showStats && <span className="text-sm">{post.comments}</span>}
      </button>
      <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {showStats && <span className="text-sm">{post.shares}</span>}
      </button>
    </div>
  )

  if (variant === 'compact') {
    return (
      <div id={id} className={cn('space-y-3', className)}>
        {posts.map((post) => (
          <div key={post.id} className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {post.author.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{post.author.name}</span>
                  {post.author.verified && (
                    <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-xs text-gray-500">· {post.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{post.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div id={id} className={cn('grid gap-4 sm:grid-cols-2', className)}>
        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {post.image && (
              <img src={post.image} alt="" className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900 dark:text-white">{post.author.name}</span>
                    {post.author.verified && (
                      <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">@{post.author.username}</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">{post.content}</p>
              {showActions && <ActionButtons post={post} />}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Default variant
  return (
    <div id={id} className={cn('divide-y divide-gray-200 dark:divide-gray-800', className)}>
      {posts.map((post) => (
        <div key={post.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {post.author.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 dark:text-white">{post.author.name}</span>
                {post.author.verified && (
                  <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-gray-500 dark:text-gray-400">@{post.author.username}</span>
                <span className="text-gray-500 dark:text-gray-400">·</span>
                <span className="text-gray-500 dark:text-gray-400">{post.timestamp}</span>
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">{post.content}</p>
              {post.image && (
                <img src={post.image} alt="" className="mt-3 rounded-xl max-h-80 w-full object-cover" />
              )}
              {showActions && (
                <div className="mt-4">
                  <ActionButtons post={post} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

SocialFeed.displayName = 'SocialFeed'

SocialFeed.config = {
  id: 'social-feed',
  name: 'Social Feed',
  category: 'social',
  description: 'Social media style feed',
  defaultProps: { variant: 'default', showActions: true, showStats: true },
  editableFields: [
    { name: 'posts', label: 'Posts', type: 'array' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'compact', 'card'] },
    { name: 'showActions', label: 'Show Actions', type: 'boolean' },
    { name: 'showStats', label: 'Show Stats', type: 'boolean' },
  ],
}
