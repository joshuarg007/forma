'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface RecentActivity {
  name: string
  action: string
  location?: string
  time?: string
  image?: string
}

interface SocialProofProps extends ModuleProps {
  variant?: 'visitor-count' | 'recent-activity' | 'trust-badges' | 'combined'
  visitorCount?: number
  visitorLabel?: string
  activities?: RecentActivity[]
  badges?: { icon: string; label: string }[]
  position?: 'bottom-left' | 'bottom-right'
  autoRotate?: boolean
  rotateInterval?: number
}

const defaultActivities: RecentActivity[] = [
  { name: 'Sarah', action: 'just purchased', location: 'New York', time: '2 minutes ago' },
  { name: 'John', action: 'signed up', location: 'London', time: '5 minutes ago' },
  { name: 'Emily', action: 'just purchased', location: 'Sydney', time: '8 minutes ago' },
  { name: 'Michael', action: 'left a review', location: 'Toronto', time: '12 minutes ago' },
  { name: 'Lisa', action: 'just purchased', location: 'Berlin', time: '15 minutes ago' },
]

const defaultBadges = [
  { icon: 'shield', label: 'Secure Checkout' },
  { icon: 'truck', label: 'Free Shipping' },
  { icon: 'refresh', label: '30-Day Returns' },
  { icon: 'star', label: '4.9/5 Rating' },
]

const badgeIcons: Record<string, React.ReactNode> = {
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  truck: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  star: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
}

export default function SocialProof({
  id,
  className,
  styles,
  variant = 'recent-activity',
  visitorCount = 127,
  visitorLabel = 'people viewing this page',
  activities = defaultActivities,
  badges = defaultBadges,
  position = 'bottom-left',
  autoRotate = true,
  rotateInterval = 4000,
}: SocialProofProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!autoRotate || variant !== 'recent-activity') return

    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length)
        setIsVisible(true)
      }, 300)
    }, rotateInterval)

    return () => clearInterval(interval)
  }, [autoRotate, rotateInterval, activities.length, variant])

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  if (variant === 'visitor-count') {
    return (
      <div
        id={id}
        className={cn(
          'fixed z-40',
          positionClasses[position],
          className
        )}
        style={styles}
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-bold text-gray-900">{visitorCount}</span>
            </div>
            <p className="text-sm text-gray-500">{visitorLabel}</p>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'trust-badges') {
    return (
      <div
        id={id}
        className={cn('py-6 px-4', className)}
        style={styles}
      >
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-600">
              <span className="text-indigo-600">{badgeIcons[badge.icon]}</span>
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'combined') {
    return (
      <div
        id={id}
        className={cn('py-8 px-4 bg-gray-50', className)}
        style={styles}
      >
        {/* Visitor count */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-gray-600">
            <span className="font-bold text-gray-900">{visitorCount}</span> {visitorLabel}
          </span>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-600">
              <span className="text-indigo-600">{badgeIcons[badge.icon]}</span>
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Recent activity variant (default)
  const activity = activities[currentIndex]

  return (
    <div
      id={id}
      className={cn(
        'fixed z-40',
        positionClasses[position],
        className
      )}
      style={styles}
    >
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-200 max-w-xs transition-all duration-300',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        )}
      >
        {activity.image ? (
          <img
            src={activity.image}
            alt={activity.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {activity.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{activity.name}</span>{' '}
            <span className="text-gray-600">{activity.action}</span>
          </p>
          <p className="text-xs text-gray-500">
            {activity.location && `${activity.location} • `}
            {activity.time}
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

SocialProof.displayName = 'SocialProof'

SocialProof.config = {
  id: 'social-proof',
  name: 'Social Proof',
  category: 'marketing',
  description: 'Social proof notifications and badges',
  defaultProps: {
    variant: 'recent-activity',
    visitorCount: 127,
    visitorLabel: 'people viewing this page',
    activities: defaultActivities,
    badges: defaultBadges,
    position: 'bottom-left',
    autoRotate: true,
    rotateInterval: 4000,
  },
  editableFields: [
    { name: 'variant', label: 'Variant', type: 'select', options: ['visitor-count', 'recent-activity', 'trust-badges', 'combined'], defaultValue: 'recent-activity' },
    { name: 'visitorCount', label: 'Visitor Count', type: 'number', defaultValue: 127 },
    { name: 'visitorLabel', label: 'Visitor Label', type: 'text' },
    { name: 'activities', label: 'Activities', type: 'array' },
    { name: 'badges', label: 'Badges', type: 'array' },
    { name: 'position', label: 'Position', type: 'select', options: ['bottom-left', 'bottom-right'], defaultValue: 'bottom-left' },
    { name: 'autoRotate', label: 'Auto Rotate', type: 'boolean', defaultValue: true },
    { name: 'rotateInterval', label: 'Rotate Interval (ms)', type: 'number', defaultValue: 4000 },
  ],
}
