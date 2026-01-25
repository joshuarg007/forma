'use client'

import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: 'user' | 'order' | 'comment' | 'payment' | 'system'
  title: string
  description?: string
  timestamp: string
  user?: { name: string; avatar?: string }
}

interface ActivityFeedProps {
  id?: string
  className?: string
  title?: string
  activities?: Activity[]
  showHeader?: boolean
  maxItems?: number
}

const defaultActivities: Activity[] = [
  { id: '1', type: 'order', title: 'New order received', description: 'Order #1234 for $99.99', timestamp: '2 minutes ago', user: { name: 'John Doe' } },
  { id: '2', type: 'user', title: 'New user registered', description: 'sarah@example.com', timestamp: '15 minutes ago', user: { name: 'Sarah Chen' } },
  { id: '3', type: 'payment', title: 'Payment received', description: '$450.00 via Stripe', timestamp: '1 hour ago', user: { name: 'Mike Wilson' } },
  { id: '4', type: 'comment', title: 'New review posted', description: '5 stars on Product A', timestamp: '2 hours ago', user: { name: 'Emily Brown' } },
  { id: '5', type: 'system', title: 'System backup completed', description: 'All data backed up successfully', timestamp: '3 hours ago' },
]

export default function ActivityFeed({
  id,
  className,
  title = 'Recent Activity',
  activities = defaultActivities,
  showHeader = true,
  maxItems = 5,
}: ActivityFeedProps) {
  const typeIcons = {
    user: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    order: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    comment: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    payment: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    system: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  }

  const typeColors = {
    user: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    order: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    comment: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    payment: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    system: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  }

  const displayActivities = activities.slice(0, maxItems)

  return (
    <div id={id} className={cn('bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      {showHeader && (
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
            <div className={cn('p-2 rounded-lg flex-shrink-0', typeColors[activity.type])}>
              {typeIcons[activity.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
              {activity.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
            {activity.user && (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                {activity.user.name.charAt(0)}
              </div>
            )}
          </div>
        ))}
      </div>
      {activities.length > maxItems && (
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800">
          <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            View all activity
          </button>
        </div>
      )}
    </div>
  )
}

ActivityFeed.displayName = 'ActivityFeed'

ActivityFeed.config = {
  id: 'activity-feed',
  name: 'Activity Feed',
  category: 'dashboard',
  description: 'Recent activity list',
  defaultProps: { showHeader: true, maxItems: 5 },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'activities', label: 'Activities', type: 'array' },
    { name: 'showHeader', label: 'Show Header', type: 'boolean' },
    { name: 'maxItems', label: 'Max Items', type: 'number' },
  ],
}
