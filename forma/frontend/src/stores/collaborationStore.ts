'use client'

import { create } from 'zustand'

export interface Collaborator {
  user_id: string
  username: string
  cursor_position: { x: number; y: number } | null
  selected_component_id: string | null
  current_page_id: string | null
  color: string
}

export interface ChatMessage {
  id: string
  user_id: string
  username: string
  message: string
  timestamp: string
  color: string
}

interface CollaborationState {
  // Connection state
  connected: boolean
  projectId: string | null
  currentUserId: string | null

  // Collaborators
  collaborators: Collaborator[]

  // Chat
  chatMessages: ChatMessage[]
  chatOpen: boolean
  unreadCount: number

  // Actions
  setConnected: (connected: boolean) => void
  setProjectId: (projectId: string | null) => void
  setCurrentUserId: (userId: string | null) => void
  setCollaborators: (collaborators: Collaborator[]) => void
  updateCollaborator: (userId: string, updates: Partial<Collaborator>) => void
  addCollaborator: (collaborator: Collaborator) => void
  removeCollaborator: (userId: string) => void

  // Chat actions
  addChatMessage: (message: ChatMessage) => void
  setChatOpen: (open: boolean) => void
  clearUnreadCount: () => void
  clearChat: () => void

  // Helpers
  getCollaboratorsOnPage: (pageId: string) => Collaborator[]
  getCollaboratorSelection: (componentId: string) => Collaborator | undefined
  reset: () => void
}

const initialState = {
  connected: false,
  projectId: null,
  currentUserId: null,
  collaborators: [],
  chatMessages: [],
  chatOpen: false,
  unreadCount: 0,
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  ...initialState,

  setConnected: (connected) => set({ connected }),

  setProjectId: (projectId) => set({ projectId }),

  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  setCollaborators: (collaborators) => set({ collaborators }),

  updateCollaborator: (userId, updates) =>
    set((state) => ({
      collaborators: state.collaborators.map((c) =>
        c.user_id === userId ? { ...c, ...updates } : c
      ),
    })),

  addCollaborator: (collaborator) =>
    set((state) => {
      // Check if already exists
      const exists = state.collaborators.some(
        (c) => c.user_id === collaborator.user_id
      )
      if (exists) {
        return {
          collaborators: state.collaborators.map((c) =>
            c.user_id === collaborator.user_id ? collaborator : c
          ),
        }
      }
      return { collaborators: [...state.collaborators, collaborator] }
    }),

  removeCollaborator: (userId) =>
    set((state) => ({
      collaborators: state.collaborators.filter((c) => c.user_id !== userId),
    })),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
      unreadCount: state.chatOpen ? 0 : state.unreadCount + 1,
    })),

  setChatOpen: (open) =>
    set({ chatOpen: open, unreadCount: open ? 0 : get().unreadCount }),

  clearUnreadCount: () => set({ unreadCount: 0 }),

  clearChat: () => set({ chatMessages: [] }),

  getCollaboratorsOnPage: (pageId) => {
    const state = get()
    return state.collaborators.filter(
      (c) =>
        c.user_id !== state.currentUserId && c.current_page_id === pageId
    )
  },

  getCollaboratorSelection: (componentId) => {
    const state = get()
    return state.collaborators.find(
      (c) =>
        c.user_id !== state.currentUserId &&
        c.selected_component_id === componentId
    )
  },

  reset: () => set(initialState),
}))
