'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Users, Circle, Eye } from 'lucide-react'

interface Collaborator {
  user_id: string
  username: string
  cursor_position?: { x: number; y: number } | null
  selected_component_id?: string | null
  current_page_id?: string | null
  color?: string
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
              style={{ backgroundColor: collaborator.color || getUserColor(collaborator.user_id) }}
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

        const color = collaborator.color || getUserColor(collaborator.user_id)

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

// Selection highlight overlay for components being edited by others
export function CollaboratorSelections({
  collaborators,
  currentUserId,
  getComponentElement,
}: {
  collaborators: Collaborator[]
  currentUserId?: string
  getComponentElement: (componentId: string) => HTMLElement | null
}) {
  const selectingOthers = collaborators.filter(
    (c) => c.user_id !== currentUserId && c.selected_component_id
  )

  return (
    <AnimatePresence>
      {selectingOthers.map((collaborator) => {
        if (!collaborator.selected_component_id) return null

        const element = getComponentElement(collaborator.selected_component_id)
        if (!element) return null

        const rect = element.getBoundingClientRect()
        const color = collaborator.color || getUserColor(collaborator.user_id)

        return (
          <motion.div
            key={`selection-${collaborator.user_id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed z-40"
            style={{
              left: rect.left - 2,
              top: rect.top - 2,
              width: rect.width + 4,
              height: rect.height + 4,
              border: `2px solid ${color}`,
              borderRadius: '4px',
            }}
          >
            {/* User label */}
            <div
              className="absolute -top-6 left-0 px-2 py-0.5 rounded text-xs text-white font-medium whitespace-nowrap flex items-center gap-1"
              style={{ backgroundColor: color }}
            >
              <Eye className="w-3 h-3" />
              {collaborator.username}
            </div>
          </motion.div>
        )
      })}
    </AnimatePresence>
  )
}

// Typing indicator for when someone is editing text
export function CollaboratorTypingIndicator({
  collaborators,
  currentUserId,
  currentPageId,
}: {
  collaborators: Collaborator[]
  currentUserId?: string
  currentPageId?: string
}) {
  const othersOnPage = collaborators.filter(
    (c) =>
      c.user_id !== currentUserId &&
      c.current_page_id === currentPageId &&
      c.selected_component_id
  )

  if (othersOnPage.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-forma-800/90 rounded-lg">
      <div className="flex -space-x-1">
        {othersOnPage.slice(0, 3).map((c) => (
          <div
            key={c.user_id}
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium ring-1 ring-forma-900"
            style={{ backgroundColor: c.color || getUserColor(c.user_id) }}
          >
            {c.username[0].toUpperCase()}
          </div>
        ))}
      </div>
      <span className="text-xs text-white/60">
        {othersOnPage.length === 1
          ? `${othersOnPage[0].username} is editing`
          : `${othersOnPage.length} people editing`}
      </span>
      <span className="flex gap-0.5">
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: 0 }}
          className="w-1 h-1 bg-white/60 rounded-full"
        />
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}
          className="w-1 h-1 bg-white/60 rounded-full"
        />
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }}
          className="w-1 h-1 bg-white/60 rounded-full"
        />
      </span>
    </div>
  )
}

// Page presence - who's on which page
export function PagePresenceIndicator({
  collaborators,
  currentUserId,
  pageId,
}: {
  collaborators: Collaborator[]
  currentUserId?: string
  pageId: string
}) {
  const othersOnPage = collaborators.filter(
    (c) => c.user_id !== currentUserId && c.current_page_id === pageId
  )

  if (othersOnPage.length === 0) return null

  return (
    <div className="flex -space-x-1.5">
      {othersOnPage.slice(0, 3).map((c) => (
        <div
          key={c.user_id}
          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-medium ring-1 ring-forma-800"
          style={{ backgroundColor: c.color || getUserColor(c.user_id) }}
          title={c.username}
        >
          {c.username[0].toUpperCase()}
        </div>
      ))}
      {othersOnPage.length > 3 && (
        <div className="w-4 h-4 rounded-full bg-forma-600 flex items-center justify-center text-white text-[8px] font-medium ring-1 ring-forma-800">
          +{othersOnPage.length - 3}
        </div>
      )}
    </div>
  )
}
