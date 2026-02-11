'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { api } from '@/lib/api'

export interface CollaboratorCursor {
  user_id: string
  username: string
  position: { x: number; y: number } | null
  selected_component_id: string | null
  current_page_id: string | null
  color: string
}

export interface CollaborationMessage {
  type: string
  payload: any
  sender_id?: string
  timestamp?: string
}

interface UseCollaborationOptions {
  projectId: string
  onComponentUpdate?: (payload: any) => void
  onComponentAdd?: (payload: any) => void
  onComponentDelete?: (payload: any) => void
  onComponentReorder?: (payload: any) => void
  onChatMessage?: (payload: any) => void
  onSelection?: (payload: { user_id: string; component_id: string | null; color: string; username: string }) => void
  onPageChange?: (payload: { user_id: string; page_id: string; color: string; username: string }) => void
  onTyping?: (payload: { user_id: string; component_id: string; color: string; username: string }) => void
  enabled?: boolean
}

export function useCollaboration({
  projectId,
  onComponentUpdate,
  onComponentAdd,
  onComponentDelete,
  onComponentReorder,
  onChatMessage,
  onSelection,
  onPageChange,
  onTyping,
  enabled = true,
}: UseCollaborationOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [connected, setConnected] = useState(false)
  const [collaborators, setCollaborators] = useState<CollaboratorCursor[]>([])
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(() => {
    if (!enabled || !projectId) return

    try {
      const wsUrl = api.getWebSocketUrl(projectId)
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)
        setError(null)
      }

      ws.onmessage = (event) => {
        try {
          const message: CollaborationMessage = JSON.parse(event.data)

          switch (message.type) {
            case 'presence':
              if (message.payload.users) {
                setCollaborators(message.payload.users)
              }
              break

            case 'cursor_move':
              setCollaborators((prev) =>
                prev.map((c) =>
                  c.user_id === message.sender_id
                    ? { ...c, cursor_position: message.payload.position }
                    : c
                )
              )
              break

            case 'component_update':
              onComponentUpdate?.(message.payload)
              break

            case 'component_add':
              onComponentAdd?.(message.payload)
              break

            case 'component_delete':
              onComponentDelete?.(message.payload)
              break

            case 'component_reorder':
              onComponentReorder?.(message.payload)
              break

            case 'chat':
              onChatMessage?.(message.payload)
              break

            case 'selection':
              // Update collaborator's selection
              setCollaborators((prev) =>
                prev.map((c) =>
                  c.user_id === message.sender_id
                    ? { ...c, selected_component_id: message.payload.component_id }
                    : c
                )
              )
              onSelection?.(message.payload)
              break

            case 'page_change':
              // Update collaborator's current page
              setCollaborators((prev) =>
                prev.map((c) =>
                  c.user_id === message.sender_id
                    ? { ...c, current_page_id: message.payload.page_id }
                    : c
                )
              )
              onPageChange?.(message.payload)
              break

            case 'typing':
              onTyping?.(message.payload)
              break

            case 'pong':
              // Keep-alive response
              break

            case 'error':
              setError(message.payload.message)
              break
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setConnected(false)
        wsRef.current = null

        // Reconnect after delay (unless intentionally closed)
        if (event.code !== 1000 && enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, 3000)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Connection error')
      }

      wsRef.current = ws
    } catch (e) {
      console.error('Failed to create WebSocket:', e)
      setError('Failed to connect')
    }
  }, [projectId, enabled, onComponentUpdate, onComponentAdd, onComponentDelete, onComponentReorder, onChatMessage, onSelection, onPageChange, onTyping])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }

    setConnected(false)
    setCollaborators([])
  }, [])

  const sendMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }))
    }
  }, [])

  const sendCursorMove = useCallback((position: { x: number; y: number }) => {
    sendMessage('cursor_move', { position })
  }, [sendMessage])

  const sendComponentUpdate = useCallback((componentId: string, changes: any) => {
    sendMessage('component_update', { componentId, changes })
  }, [sendMessage])

  const sendComponentAdd = useCallback((component: any) => {
    sendMessage('component_add', { component })
  }, [sendMessage])

  const sendComponentDelete = useCallback((componentId: string) => {
    sendMessage('component_delete', { componentId })
  }, [sendMessage])

  const sendComponentReorder = useCallback((componentIds: string[]) => {
    sendMessage('component_reorder', { componentIds })
  }, [sendMessage])

  const sendChat = useCallback((message: string) => {
    sendMessage('chat', { message })
  }, [sendMessage])

  const sendSelection = useCallback((componentId: string | null) => {
    sendMessage('selection', { component_id: componentId })
  }, [sendMessage])

  const sendPageChange = useCallback((pageId: string) => {
    sendMessage('page_change', { page_id: pageId })
  }, [sendMessage])

  const sendTyping = useCallback((componentId: string) => {
    sendMessage('typing', { component_id: componentId })
  }, [sendMessage])

  // Connect on mount
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  // Keep-alive ping
  useEffect(() => {
    if (!connected) return

    const pingInterval = setInterval(() => {
      sendMessage('ping', {})
    }, 30000)

    return () => clearInterval(pingInterval)
  }, [connected, sendMessage])

  return {
    connected,
    collaborators,
    error,
    sendCursorMove,
    sendComponentUpdate,
    sendComponentAdd,
    sendComponentDelete,
    sendComponentReorder,
    sendChat,
    sendSelection,
    sendPageChange,
    sendTyping,
    disconnect,
    reconnect: connect,
  }
}
