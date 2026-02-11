// Collaboration components
export {
  CollaboratorPresence,
  CollaboratorCursors,
  CollaboratorSelections,
  CollaboratorTypingIndicator,
  PagePresenceIndicator,
} from '../CollaboratorPresence'

export { CollaborationChat, ChatIndicator } from '../CollaborationChat'

export {
  CollaborationProvider,
  useCollaborationContext,
  useOptionalCollaboration,
} from '../CollaborationProvider'

// Re-export store
export { useCollaborationStore } from '@/stores/collaborationStore'
export type { Collaborator, ChatMessage } from '@/stores/collaborationStore'

// Re-export hook
export { useCollaboration } from '@/hooks/useCollaboration'
export type {
  CollaboratorCursor,
  CollaborationMessage,
} from '@/hooks/useCollaboration'
