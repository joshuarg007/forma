'use client'

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { useCollaboration } from '@/hooks/useCollaboration'
import {
  useCollaborationStore,
  Collaborator,
  ChatMessage,
} from '@/stores/collaborationStore'
import { v4 as uuidv4 } from 'uuid'

interface CollaborationContextValue {
  // Connection
  connected: boolean
  collaborators: Collaborator[]

  // Actions
  sendCursorMove: (position: { x: number; y: number }) => void
  sendSelection: (componentId: string | null) => void
  sendPageChange: (pageId: string) => void
  sendComponentUpdate: (componentId: string, changes: any) => void
  sendComponentAdd: (component: any) => void
  sendComponentDelete: (componentId: string) => void
  sendComponentReorder: (componentIds: string[]) => void
  sendChat: (message: string) => void
  sendTyping: (componentId: string) => void

  // Helpers
  getCollaboratorsOnPage: (pageId: string) => Collaborator[]
  getCollaboratorSelection: (componentId: string) => Collaborator | undefined
  isComponentSelectedByOther: (componentId: string) => boolean
}

const CollaborationContext = createContext<CollaborationContextValue | null>(
  null
)

interface CollaborationProviderProps {
  projectId: string
  userId: string
  username: string
  children: ReactNode
  enabled?: boolean
  onRemoteComponentUpdate?: (payload: any) => void
  onRemoteComponentAdd?: (payload: any) => void
  onRemoteComponentDelete?: (payload: any) => void
  onRemoteComponentReorder?: (payload: any) => void
}

export function CollaborationProvider({
  projectId,
  userId,
  username,
  children,
  enabled = true,
  onRemoteComponentUpdate,
  onRemoteComponentAdd,
  onRemoteComponentDelete,
  onRemoteComponentReorder,
}: CollaborationProviderProps) {
  const store = useCollaborationStore()
  const throttleRef = useRef<NodeJS.Timeout | null>(null)

  // Handle incoming messages
  const handleComponentUpdate = useCallback(
    (payload: any) => {
      onRemoteComponentUpdate?.(payload)
    },
    [onRemoteComponentUpdate]
  )

  const handleComponentAdd = useCallback(
    (payload: any) => {
      onRemoteComponentAdd?.(payload)
    },
    [onRemoteComponentAdd]
  )

  const handleComponentDelete = useCallback(
    (payload: any) => {
      onRemoteComponentDelete?.(payload)
    },
    [onRemoteComponentDelete]
  )

  const handleComponentReorder = useCallback(
    (payload: any) => {
      onRemoteComponentReorder?.(payload)
    },
    [onRemoteComponentReorder]
  )

  const handleChatMessage = useCallback(
    (payload: any) => {
      const message: ChatMessage = {
        id: uuidv4(),
        user_id: payload.user_id || payload.sender_id,
        username: payload.username,
        message: payload.message,
        timestamp: payload.timestamp || new Date().toISOString(),
        color: payload.color || '#3b82f6',
      }
      store.addChatMessage(message)
    },
    [store]
  )

  const handleSelection = useCallback(
    (payload: { user_id: string; component_id: string | null }) => {
      store.updateCollaborator(payload.user_id, {
        selected_component_id: payload.component_id,
      })
    },
    [store]
  )

  const handlePageChange = useCallback(
    (payload: { user_id: string; page_id: string }) => {
      store.updateCollaborator(payload.user_id, {
        current_page_id: payload.page_id,
      })
    },
    [store]
  )

  const {
    connected,
    collaborators: rawCollaborators,
    sendCursorMove: rawSendCursorMove,
    sendComponentUpdate,
    sendComponentAdd,
    sendComponentDelete,
    sendComponentReorder,
    sendChat: rawSendChat,
    sendSelection: rawSendSelection,
    sendPageChange: rawSendPageChange,
    sendTyping,
  } = useCollaboration({
    projectId,
    enabled,
    onComponentUpdate: handleComponentUpdate,
    onComponentAdd: handleComponentAdd,
    onComponentDelete: handleComponentDelete,
    onComponentReorder: handleComponentReorder,
    onChatMessage: handleChatMessage,
    onSelection: handleSelection,
    onPageChange: handlePageChange,
  })

  // Sync collaborators to store
  useEffect(() => {
    const collaborators: Collaborator[] = rawCollaborators.map((c) => ({
      user_id: c.user_id,
      username: c.username,
      cursor_position: c.position,
      selected_component_id: c.selected_component_id || null,
      current_page_id: c.current_page_id || null,
      color: c.color || '#3b82f6',
    }))
    store.setCollaborators(collaborators)
  }, [rawCollaborators, store])

  // Update connection state
  useEffect(() => {
    store.setConnected(connected)
    store.setProjectId(projectId)
    store.setCurrentUserId(userId)
  }, [connected, projectId, userId, store])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      store.reset()
    }
  }, [store])

  // Throttled cursor move (16ms = ~60fps)
  const sendCursorMove = useCallback(
    (position: { x: number; y: number }) => {
      if (throttleRef.current) return

      rawSendCursorMove(position)

      throttleRef.current = setTimeout(() => {
        throttleRef.current = null
      }, 16)
    },
    [rawSendCursorMove]
  )

  // Enhanced send functions that also update local state
  const sendSelection = useCallback(
    (componentId: string | null) => {
      rawSendSelection(componentId)
    },
    [rawSendSelection]
  )

  const sendPageChange = useCallback(
    (pageId: string) => {
      rawSendPageChange(pageId)
    },
    [rawSendPageChange]
  )

  const sendChat = useCallback(
    (message: string) => {
      // Add to local store immediately for instant feedback
      const chatMessage: ChatMessage = {
        id: uuidv4(),
        user_id: userId,
        username: username,
        message: message,
        timestamp: new Date().toISOString(),
        color: '#3b82f6',
      }
      store.addChatMessage(chatMessage)

      // Send to server
      rawSendChat(message)
    },
    [rawSendChat, userId, username, store]
  )

  // Helper functions
  const getCollaboratorsOnPage = useCallback(
    (pageId: string) => {
      return store.collaborators.filter(
        (c) => c.user_id !== userId && c.current_page_id === pageId
      )
    },
    [store.collaborators, userId]
  )

  const getCollaboratorSelection = useCallback(
    (componentId: string) => {
      return store.collaborators.find(
        (c) => c.user_id !== userId && c.selected_component_id === componentId
      )
    },
    [store.collaborators, userId]
  )

  const isComponentSelectedByOther = useCallback(
    (componentId: string) => {
      return store.collaborators.some(
        (c) => c.user_id !== userId && c.selected_component_id === componentId
      )
    },
    [store.collaborators, userId]
  )

  const value: CollaborationContextValue = {
    connected,
    collaborators: store.collaborators,
    sendCursorMove,
    sendSelection,
    sendPageChange,
    sendComponentUpdate,
    sendComponentAdd,
    sendComponentDelete,
    sendComponentReorder,
    sendChat,
    sendTyping,
    getCollaboratorsOnPage,
    getCollaboratorSelection,
    isComponentSelectedByOther,
  }

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  )
}

export function useCollaborationContext() {
  const context = useContext(CollaborationContext)
  if (!context) {
    throw new Error(
      'useCollaborationContext must be used within CollaborationProvider'
    )
  }
  return context
}

// Optional hook that doesn't throw if not in provider
export function useOptionalCollaboration() {
  return useContext(CollaborationContext)
}
