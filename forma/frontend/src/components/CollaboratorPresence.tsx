'use client'

import { motion } from 'framer-motion'
import { Users, Circle } from 'lucide-react'

interface Collaborator {
  user_id: string
  username: string
  cursor_position?: { x: number; y: number } | null
}

interface CollaboratorPresenceProps {
  collaborators: Collaborator[]
  currentUserId?: string
}

// Generate consistent color from user ID
function getUserColor(userId: string): string {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#ec4899', // pink
  ]

  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

export function CollaboratorPresence({
  collaborators,
  currentUserId,
}: CollaboratorPresenceProps) {
  // Filter out current user
  const others = collaborators.filter((c) => c.user_id !== currentUserId)

  if (others.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-white/60">
        <Users className="w-4 h-4" />
        <span className="text-xs">{others.length}</span>
      </div>

      <div className="flex -space-x-2">
        {others.slice(0, 5).map((collaborator) => (
          <motion.div
            key={collaborator.user_id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="relative group"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-forma-900"
              style={{ backgroundColor: getUserColor(collaborator.user_id) }}
            >
              {collaborator.username[0].toUpperCase()}
            </div>

            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-forma-900" />

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-forma-800 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition z-50">
              {collaborator.username}
            </div>
          </motion.div>
        ))}

        {others.length > 5 && (
          <div className="w-7 h-7 rounded-full bg-forma-700 flex items-center justify-center text-white text-xs font-medium ring-2 ring-forma-900">
            +{others.length - 5}
          </div>
        )}
      </div>
    </div>
  )
}

// Cursor overlay component for showing other users' cursors on canvas
export function CollaboratorCursors({
  collaborators,
  currentUserId,
  canvasRef,
}: {
  collaborators: Collaborator[]
  currentUserId?: string
  canvasRef: React.RefObject<HTMLElement>
}) {
  const others = collaborators.filter(
    (c) => c.user_id !== currentUserId && c.cursor_position
  )

  if (others.length === 0 || !canvasRef.current) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {others.map((collaborator) => {
        if (!collaborator.cursor_position) return null

        const color = getUserColor(collaborator.user_id)

        return (
          <motion.div
            key={collaborator.user_id}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              x: collaborator.cursor_position.x,
              y: collaborator.cursor_position.y,
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 500 }}
            className="absolute"
            style={{ left: 0, top: 0 }}
          >
            {/* Cursor SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color }}
            >
              <path
                d="M5.5 3.21V20.79a1 1 0 001.64.77l4.18-3.5 2.73 5.47a1 1 0 001.79 0l.9-1.8a1 1 0 000-.9l-2.73-5.47h5.49a1 1 0 00.77-1.64l-13-14a1 1 0 00-1.77.63z"
                fill="currentColor"
              />
              <path
                d="M5.5 3.21V20.79a1 1 0 001.64.77l4.18-3.5 2.73 5.47a1 1 0 001.79 0l.9-1.8a1 1 0 000-.9l-2.73-5.47h5.49a1 1 0 00.77-1.64l-13-14a1 1 0 00-1.77.63z"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>

            {/* Name label */}
            <div
              className="absolute left-5 top-4 px-2 py-0.5 rounded text-xs text-white font-medium whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {collaborator.username}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
