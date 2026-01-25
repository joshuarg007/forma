'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FollowCardProps {
  id?: string
  className?: string
  name?: string
  username?: string
  bio?: string
  avatar?: string
  coverImage?: string
  followers?: number
  following?: number
  posts?: number
  isFollowing?: boolean
  isVerified?: boolean
  variant?: 'default' | 'compact' | 'horizontal' | 'banner'
  showStats?: boolean
  showBio?: boolean
}

export default function FollowCard({
  id,
  className,
  name = 'Sarah Chen',
  username = 'sarahchen',
  bio = 'Product Designer at Acme Inc. Passionate about creating beautiful and functional interfaces.',
  avatar,
  coverImage = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=200&fit=crop',
  followers = 12500,
  following = 892,
  posts = 234,
  isFollowing: initialFollowing = false,
  isVerified = true,
  variant = 'default',
  showStats = true,
  showBio = true,
}: FollowCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (variant === 'compact') {
    return (
      <div id={id} className={cn('flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800', className)}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-900 dark:text-white truncate">{name}</span>
            {isVerified && (
              <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{username}</p>
        </div>
        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium transition',
            isFollowing
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          )}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    )
  }

  if (variant === 'horizontal') {
    return (
      <div id={id} className={cn('flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900 dark:text-white">{name}</span>
            {isVerified && (
              <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{username}</p>
          {showBio && bio && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{bio}</p>
          )}
          {showStats && (
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span><strong className="text-gray-900 dark:text-white">{formatNumber(followers)}</strong> <span className="text-gray-500">followers</span></span>
              <span><strong className="text-gray-900 dark:text-white">{formatNumber(following)}</strong> <span className="text-gray-500">following</span></span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={cn(
            'px-5 py-2 rounded-full font-medium transition',
            isFollowing
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          )}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div id={id} className={cn('bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden', className)}>
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500" style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />
        <div className="px-5 pb-5">
          <div className="-mt-12 flex items-end justify-between">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {name.charAt(0)}
            </div>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={cn(
                'px-5 py-2 rounded-full font-medium transition mb-2',
                isFollowing
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              )}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h3>
              {isVerified && (
                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400">@{username}</p>
            {showBio && bio && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{bio}</p>
            )}
            {showStats && (
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="text-center">
                  <p className="font-bold text-gray-900 dark:text-white">{formatNumber(posts)}</p>
                  <p className="text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 dark:text-white">{formatNumber(followers)}</p>
                  <p className="text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 dark:text-white">{formatNumber(following)}</p>
                  <p className="text-gray-500">Following</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-center', className)}>
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
        {name.charAt(0)}
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-center gap-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
          {isVerified && (
            <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">@{username}</p>
      </div>
      {showBio && bio && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{bio}</p>
      )}
      {showStats && (
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{formatNumber(followers)}</p>
            <p className="text-gray-500">Followers</p>
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{formatNumber(following)}</p>
            <p className="text-gray-500">Following</p>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsFollowing(!isFollowing)}
        className={cn(
          'w-full mt-4 py-2 rounded-lg font-medium transition',
          isFollowing
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        )}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

FollowCard.displayName = 'FollowCard'

FollowCard.config = {
  id: 'follow-card',
  name: 'Follow Card',
  category: 'social',
  description: 'User profile follow card',
  defaultProps: { isFollowing: false, isVerified: true, variant: 'default', showStats: true, showBio: true },
  editableFields: [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'bio', label: 'Bio', type: 'text' },
    { name: 'coverImage', label: 'Cover Image URL', type: 'text' },
    { name: 'followers', label: 'Followers', type: 'number' },
    { name: 'following', label: 'Following', type: 'number' },
    { name: 'posts', label: 'Posts', type: 'number' },
    { name: 'isFollowing', label: 'Is Following', type: 'boolean' },
    { name: 'isVerified', label: 'Is Verified', type: 'boolean' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'compact', 'horizontal', 'banner'] },
    { name: 'showStats', label: 'Show Stats', type: 'boolean' },
    { name: 'showBio', label: 'Show Bio', type: 'boolean' },
  ],
}
