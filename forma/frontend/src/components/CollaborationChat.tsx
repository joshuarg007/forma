'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react'
import { useCollaborationStore, ChatMessage } from '@/stores/collaborationStore'

// Generate consistent color from user ID
function getUserColor(userId: string): string {
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899',
  ]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

interface CollaborationChatProps {
  onSendMessage: (message: string) => void
  currentUserId?: string
}

export function CollaborationChat({
  onSendMessage,
  currentUserId,
}: CollaborationChatProps) {
  const { chatMessages, chatOpen, unreadCount, setChatOpen } =
    useCollaborationStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, chatOpen])

  // Focus input when opened
  useEffect(() => {
    if (chatOpen) {
      inputRef.current?.focus()
    }
  }, [chatOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-forma-700 hover:bg-forma-600 text-white flex items-center justify-center shadow-lg transition-colors"
      >
        {chatOpen ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-20 right-4 z-50 w-80 h-96 bg-forma-800 rounded-lg shadow-2xl border border-forma-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-forma-700">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-forma-400" />
                <span className="font-medium text-white">Team Chat</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-forma-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-forma-400 text-sm py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.user_id === currentUserId}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-forma-700"
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-forma-900 border border-forma-700 rounded-lg px-3 py-2 text-sm text-white placeholder-forma-400 focus:outline-none focus:border-forma-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-forma-700 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: ChatMessage
  isOwn: boolean
}) {
  const color = message.color || getUserColor(message.user_id)

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      {!isOwn && (
        <div className="flex items-center gap-1.5 mb-1">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-medium"
            style={{ backgroundColor: color }}
          >
            {message.username[0].toUpperCase()}
          </div>
          <span className="text-xs text-forma-400">{message.username}</span>
        </div>
      )}
      <div
        className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-forma-700 text-white rounded-bl-sm'
        }`}
      >
        {message.message}
      </div>
      <span className="text-[10px] text-forma-500 mt-0.5">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  )
}

// Compact chat indicator for toolbar
export function ChatIndicator({
  onClick,
  unreadCount,
}: {
  onClick: () => void
  unreadCount: number
}) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-forma-700 rounded-lg transition-colors"
      title="Team Chat"
    >
      <MessageCircle className="w-5 h-5 text-forma-300" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-medium text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
