import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  SchemaDefinition,
  CollectionDefinition,
  FieldDefinition,
  FieldType,
  RelationType,
  CollectionPosition,
  SchemaUIState,
} from '@/types/schema'

interface SchemaState {
  // Schema data
  schema: SchemaDefinition | null
  isDirty: boolean

  // UI state
  ui: SchemaUIState

  // History for undo/redo
  history: SchemaDefinition[]
  historyIndex: number

  // Actions - Schema
  initSchema: (name?: string) => void
  loadSchema: (schema: SchemaDefinition) => void
  exportSchema: () => string
  importSchema: (json: string) => void

  // Actions - Collections
  addCollection: (name: string, definition?: Partial<CollectionDefinition>) => void
  updateCollection: (name: string, updates: Partial<CollectionDefinition>) => void
  removeCollection: (name: string) => void
  renameCollection: (oldName: string, newName: string) => void
  duplicateCollection: (name: string) => void

  // Actions - Fields
  addField: (collection: string, fieldName: string, definition: FieldDefinition) => void
  updateField: (collection: string, fieldName: string, updates: Partial<FieldDefinition>) => void
  removeField: (collection: string, fieldName: string) => void
  renameField: (collection: string, oldName: string, newName: string) => void

  // Actions - Relations
  addRelation: (
    fromCollection: string,
    fieldName: string,
    toCollection: string,
    relationType: RelationType
  ) => void

  // Actions - UI
  selectCollection: (name: string | null) => void
  selectField: (collection: string | null, field: string | null) => void
  setCollectionPosition: (name: string, position: CollectionPosition) => void
  setZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
  resetView: () => void

  // Actions - History
  undo: () => void
  redo: () => void
  saveToHistory: () => void

  // Actions - Templates
  addAuthCollection: () => void
  addCommonFields: (collection: string) => void
}

const DEFAULT_SCHEMA: SchemaDefinition = {
  version: '1.0',
  name: 'my-app',
  collections: {},
}

const DEFAULT_UI: SchemaUIState = {
  positions: {},
  selectedCollection: null,
  selectedField: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
}

export const useSchemaStore = create<SchemaState>()(
  persist(
    (set, get) => ({
      // Initial state
      schema: null,
      isDirty: false,
      ui: DEFAULT_UI,
      history: [],
      historyIndex: -1,

      // Schema actions
      initSchema: (name = 'my-app') => {
        const schema: SchemaDefinition = {
          ...DEFAULT_SCHEMA,
          name,
        }
        set({ schema, isDirty: false, history: [schema], historyIndex: 0 })
      },

      loadSchema: (schema) => {
        set({ schema, isDirty: false, history: [schema], historyIndex: 0 })
      },

      exportSchema: () => {
        const { schema } = get()
        if (!schema) return '{}'
        return JSON.stringify(schema, null, 2)
      },

      importSchema: (json) => {
        try {
          const schema = JSON.parse(json) as SchemaDefinition
          if (!schema.version || !schema.name || !schema.collections) {
            throw new Error('Invalid schema format')
          }
          set({ schema, isDirty: false, history: [schema], historyIndex: 0 })
        } catch (e) {
          throw new Error(`Failed to parse schema: ${e}`)
        }
      },

      // Collection actions
      addCollection: (name, definition = {}) => {
        const { schema, saveToHistory } = get()
        if (!schema) return

        const newCollection: CollectionDefinition = {
          timestamps: true,
          fields: {},
          ...definition,
        }

        const updatedSchema = {
          ...schema,
          collections: {
            ...schema.collections,
            [name]: newCollection,
          },
        }

        // Auto-position new collection
        const positions = get().ui.positions
        const existingCount = Object.keys(positions).length
        const newPosition = {
          x: 50 + (existingCount % 3) * 320,
          y: 50 + Math.floor(existingCount / 3) * 250,
        }

        set({
          schema: updatedSchema,
          isDirty: true,
          ui: {
            ...get().ui,
            positions: { ...positions, [name]: newPosition },
            selectedCollection: name,
          },
        })
        saveToHistory()
      },

      updateCollection: (name, updates) => {
        const { schema, saveToHistory } = get()
        if (!schema || !schema.collections[name]) return

        const updatedSchema = {
          ...schema,
          collections: {
            ...schema.collections,
            [name]: {
              ...schema.collections[name],
              ...updates,
            },
          },
        }

        set({ schema: updatedSchema, isDirty: true })
        saveToHistory()
      },

      removeCollection: (name) => {
        const { schema, saveToHistory, ui } = get()
        if (!schema) return

        const { [name]: removed, ...remainingCollections } = schema.collections
        const { [name]: removedPos, ...remainingPositions } = ui.positions

        set({
          schema: { ...schema, collections: remainingCollections },
          isDirty: true,
          ui: {
            ...ui,
            positions: remainingPositions,
            selectedCollection: ui.selectedCollection === name ? null : ui.selectedCollection,
          },
        })
        saveToHistory()
      },

      renameCollection: (oldName, newName) => {
        const { schema, saveToHistory, ui } = get()
        if (!schema || !schema.collections[oldName] || oldName === newName) return

        const { [oldName]: collection, ...rest } = schema.collections
        const { [oldName]: position, ...restPositions } = ui.positions

        // Update any relations pointing to this collection
        const updatedCollections: Record<string, CollectionDefinition> = {}
        for (const [collName, coll] of Object.entries({ ...rest, [newName]: collection })) {
          const updatedFields: Record<string, FieldDefinition> = {}
          for (const [fieldName, field] of Object.entries(coll.fields)) {
            if (field.type === 'relation' && field.target === oldName) {
              updatedFields[fieldName] = { ...field, target: newName }
            } else {
              updatedFields[fieldName] = field
            }
          }
          updatedCollections[collName] = { ...coll, fields: updatedFields }
        }

        set({
          schema: { ...schema, collections: updatedCollections },
          isDirty: true,
          ui: {
            ...ui,
            positions: { ...restPositions, [newName]: position },
            selectedCollection: ui.selectedCollection === oldName ? newName : ui.selectedCollection,
          },
        })
        saveToHistory()
      },

      duplicateCollection: (name) => {
        const { schema, addCollection } = get()
        if (!schema || !schema.collections[name]) return

        const original = schema.collections[name]
        let newName = `${name}_copy`
        let counter = 1
        while (schema.collections[newName]) {
          newName = `${name}_copy_${counter++}`
        }

        addCollection(newName, { ...original })
      },

      // Field actions
      addField: (collection, fieldName, definition) => {
        const { schema, saveToHistory } = get()
        if (!schema || !schema.collections[collection]) return

        const updatedSchema = {
          ...schema,
          collections: {
            ...schema.collections,
            [collection]: {
              ...schema.collections[collection],
              fields: {
                ...schema.collections[collection].fields,
                [fieldName]: definition,
              },
            },
          },
        }

        set({ schema: updatedSchema, isDirty: true })
        saveToHistory()
      },

      updateField: (collection, fieldName, updates) => {
        const { schema, saveToHistory } = get()
        if (!schema || !schema.collections[collection]?.fields[fieldName]) return

        const updatedSchema = {
          ...schema,
          collections: {
            ...schema.collections,
            [collection]: {
              ...schema.collections[collection],
              fields: {
                ...schema.collections[collection].fields,
                [fieldName]: {
                  ...schema.collections[collection].fields[fieldName],
                  ...updates,
                },
              },
            },
          },
        }

        set({ schema: updatedSchema, isDirty: true })
        saveToHistory()
      },

      removeField: (collection, fieldName) => {
        const { schema, saveToHistory, ui } = get()
        if (!schema || !schema.collections[collection]) return

        const { [fieldName]: removed, ...remainingFields } = schema.collections[collection].fields

        const updatedSchema = {
          ...schema,
          collections: {
            ...schema.collections,
            [collection]: {
              ...schema.collections[collection],
              fields: remainingFields,
            },
          },
        }

        set({
          schema: updatedSchema,
          isDirty: true,
          ui: {
            ...ui,
            selectedField:
              ui.selectedCollection === collection && ui.selectedField === fieldName
                ? null
                : ui.selectedField,
          },
        })
        saveToHistory()
      },

      renameField: (collection, oldName, newName) => {
        const { schema, saveToHistory, ui } = get()
        if (!schema || !schema.collections[collection]?.fields[oldName] || oldName === newName)
          return

        const { [oldName]: field, ...rest } = schema.collections[collection].fields

        const updatedSchema = {
          ...schema,
          collections: {
            ...schema.collections,
            [collection]: {
              ...schema.collections[collection],
              fields: { ...rest, [newName]: field },
            },
          },
        }

        set({
          schema: updatedSchema,
          isDirty: true,
          ui: {
            ...ui,
            selectedField:
              ui.selectedCollection === collection && ui.selectedField === oldName
                ? newName
                : ui.selectedField,
          },
        })
        saveToHistory()
      },

      // Relation actions
      addRelation: (fromCollection, fieldName, toCollection, relationType) => {
        const { addField } = get()
        addField(fromCollection, fieldName, {
          type: 'relation',
          target: toCollection,
          relation: relationType,
        })
      },

      // UI actions
      selectCollection: (name) => {
        set((state) => ({
          ui: {
            ...state.ui,
            selectedCollection: name,
            selectedField: null,
          },
        }))
      },

      selectField: (collection, field) => {
        set((state) => ({
          ui: {
            ...state.ui,
            selectedCollection: collection,
            selectedField: field,
          },
        }))
      },

      setCollectionPosition: (name, position) => {
        set((state) => ({
          ui: {
            ...state.ui,
            positions: {
              ...state.ui.positions,
              [name]: position,
            },
          },
        }))
      },

      setZoom: (zoom) => {
        set((state) => ({
          ui: { ...state.ui, zoom: Math.max(0.25, Math.min(2, zoom)) },
        }))
      },

      setPan: (pan) => {
        set((state) => ({
          ui: { ...state.ui, pan },
        }))
      },

      resetView: () => {
        set((state) => ({
          ui: { ...state.ui, zoom: 1, pan: { x: 0, y: 0 } },
        }))
      },

      // History actions
      undo: () => {
        const { history, historyIndex } = get()
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          set({
            schema: history[newIndex],
            historyIndex: newIndex,
            isDirty: true,
          })
        }
      },

      redo: () => {
        const { history, historyIndex } = get()
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1
          set({
            schema: history[newIndex],
            historyIndex: newIndex,
            isDirty: true,
          })
        }
      },

      saveToHistory: () => {
        const { schema, history, historyIndex } = get()
        if (!schema) return

        // Remove any future history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(JSON.parse(JSON.stringify(schema)))

        // Limit history size
        if (newHistory.length > 50) {
          newHistory.shift()
        }

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        })
      },

      // Template actions
      addAuthCollection: () => {
        const { addCollection, addField } = get()

        addCollection('user', {
          auth: true,
          timestamps: true,
          displayName: 'User',
        })

        addField('user', 'email', {
          type: 'email',
          required: true,
          unique: true,
        })

        addField('user', 'name', {
          type: 'text',
          required: true,
        })

        addField('user', 'role', {
          type: 'enum',
          options: ['admin', 'user'],
          default: 'user',
        })
      },

      addCommonFields: (collection) => {
        const { schema, addField } = get()
        if (!schema || !schema.collections[collection]) return

        // Add common fields that don't already exist
        const fields = schema.collections[collection].fields

        if (!fields.name) {
          addField(collection, 'name', { type: 'text', required: true })
        }
        if (!fields.slug) {
          addField(collection, 'slug', { type: 'text', unique: true })
        }
        if (!fields.status) {
          addField(collection, 'status', {
            type: 'enum',
            options: ['draft', 'active', 'archived'],
            default: 'draft',
          })
        }
      },
    }),
    {
      name: 'formabase-schema',
      partialize: (state) => ({
        schema: state.schema,
        ui: state.ui,
      }),
    }
  )
)
