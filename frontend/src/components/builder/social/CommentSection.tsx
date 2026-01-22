'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  author: {
    name: string
    avatar?: string
  }
  content: string
  timestamp: string
  likes: number
  liked?: boolean
  replies?: Comment[]
}

interface CommentSectionProps {
  id?: string
  className?: string
  title?: string
  comments?: Comment[]
  allowReplies?: boolean
  showCommentCount?: boolean
  variant?: 'default' | 'minimal' | 'threaded'
  sortOptions?: boolean
}

const defaultComments: Comment[] = [
  {
    id: '1',
    author: { name: 'Sarah Chen' },
    content: 'This is such a great post! Really helpful information here.',
    timestamp: '2 hours ago',
    likes: 12,
    liked: false,
    replies: [
      {
        id: '1-1',
        author: { name: 'Mike Johnson' },
        content: 'Totally agree! Very insightful.',
        timestamp: '1 hour ago',
        likes: 3,
      },
    ],
  },
  {
    id: '2',
    author: { name: 'Emily Davis' },
    content: 'Thanks for sharing this! I\'ve been looking for exactly this kind of content.',
    timestamp: '5 hours ago',
    likes: 8,
    liked: true,
  },
  {
    id: '3',
    author: { name: 'Alex Thompson' },
    content: 'Great work! Would love to see more content like this in the future.',
    timestamp: '1 day ago',
    likes: 25,
  },
]

export default function CommentSection({
  id,
  className,
  title = 'Comments',
  comments = defaultComments,
  allowReplies = true,
  showCommentCount = true,
  variant = 'default',
  sortOptions = true,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={cn('flex gap-3', isReply && 'ml-12')}>
      <div className={cn(
        'rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0',
        isReply ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
      )}>
        {comment.author.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 dark:text-white">{comment.author.name}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{comment.timestamp}</span>
        </div>
        <p className="mt-1 text-gray-700 dark:text-gray-300">{comment.content}</p>
        <div className="mt-2 flex items-center gap-4">
          <button className={cn(
            'flex items-center gap-1 text-sm transition',
            comment.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          )}>
            <svg className="w-4 h-4" fill={comment.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{comment.likes}</span>
          </button>
          {allowReplies && !isReply && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="text-sm text-gray-500 hover:text-indigo-500 transition"
            >
              Reply
            </button>
          )}
        </div>

        {replyTo === comment.id && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
              Reply
            </button>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (variant === 'minimal') {
    return (
      <div id={id} className={cn('', className)}>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {comment.author.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.author.name}</span>
                  <span className="text-xs text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div id={id} className={cn('bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            {showCommentCount && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                {totalComments}
              </span>
            )}
          </div>
          {sortOptions && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Most Popular</option>
            </select>
          )}
        </div>

        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {comments.length > 3 && (
        <div className="px-5 pb-5">
          <button className="w-full py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Load more comments
          </button>
        </div>
      )}
    </div>
  )
}

CommentSection.displayName = 'CommentSection'

CommentSection.config = {
  id: 'comment-section',
  name: 'Comment Section',
  category: 'social',
  description: 'Threaded comment section',
  defaultProps: { allowReplies: true, showCommentCount: true, variant: 'default', sortOptions: true },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'comments', label: 'Comments', type: 'array' },
    { name: 'allowReplies', label: 'Allow Replies', type: 'boolean' },
    { name: 'showCommentCount', label: 'Show Comment Count', type: 'boolean' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'minimal', 'threaded'] },
    { name: 'sortOptions', label: 'Show Sort Options', type: 'boolean' },
  ],
}
