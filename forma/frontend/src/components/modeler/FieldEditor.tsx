'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, Info } from 'lucide-react'
import { useSchemaStore } from '@/stores/schemaStore'
import type { FieldDefinition, FieldType, RelationType } from '@/types/schema'
import { FIELD_TYPE_INFO, RELATION_TYPE_INFO } from '@/types/schema'

interface FieldEditorProps {
  collection: string
  fieldName: string
  field: FieldDefinition
  onClose: () => void
}

const FIELD_TYPES: FieldType[] = [
  'text',
  'email',
  'integer',
  'float',
  'boolean',
  'datetime',
  'date',
  'enum',
  'json',
  'richtext',
  'file',
  'relation',
]

const RELATION_TYPES: RelationType[] = [
  'many-to-one',
  'one-to-many',
  'many-to-many',
  'one-to-one',
]

export function FieldEditor({ collection, fieldName, field, onClose }: FieldEditorProps) {
  const { schema, updateField, removeField, renameField } = useSchemaStore()
  const [localName, setLocalName] = useState(fieldName)
  const [localField, setLocalField] = useState<FieldDefinition>(field)
  const [enumInput, setEnumInput] = useState(field.options?.join(', ') || '')

  useEffect(() => {
    setLocalName(fieldName)
    setLocalField(field)
    setEnumInput(field.options?.join(', ') || '')
  }, [fieldName, field])

  const handleSave = () => {
    // Rename if needed
    if (localName !== fieldName) {
      renameField(collection, fieldName, localName)
    }

    // Update field definition
    const updates: Partial<FieldDefinition> = { ...localField }

    // Parse enum options
    if (localField.type === 'enum' && enumInput) {
      updates.options = enumInput.split(',').map((s) => s.trim()).filter(Boolean)
    }

    updateField(collection, localName, updates)
  }

  const handleDelete = () => {
    if (confirm(`Delete field "${fieldName}"? This cannot be undone.`)) {
      removeField(collection, fieldName)
      onClose()
    }
  }

  const updateLocal = (updates: Partial<FieldDefinition>) => {
    setLocalField((prev) => ({ ...prev, ...updates }))
  }

  const collections = schema ? Object.keys(schema.collections) : []

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-zinc-900 border-l border-zinc-700 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 bg-zinc-800">
        <h3 className="font-medium text-white">Edit Field</h3>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Field Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Field Name
          </label>
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value.replace(/[^a-z0-9_]/gi, '_').toLowerCase())}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="field_name"
          />
        </div>

        {/* Field Type */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Type
          </label>
          <select
            value={localField.type}
            onChange={(e) => updateLocal({ type: e.target.value as FieldType })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            {FIELD_TYPES.map((type) => (
              <option key={type} value={type} className="bg-zinc-800 text-white">
                {FIELD_TYPE_INFO[type].label}
              </option>
            ))}
          </select>
        </div>

        {/* Common Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localField.required || false}
              onChange={(e) => updateLocal({ required: e.target.checked })}
              className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-zinc-300">Required</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localField.unique || false}
              onChange={(e) => updateLocal({ unique: e.target.checked })}
              className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-zinc-300">Unique</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localField.nullable !== false}
              onChange={(e) => updateLocal({ nullable: e.target.checked })}
              className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-zinc-300">Nullable</span>
          </label>
        </div>

        {/* Type-specific options */}
        {(localField.type === 'text' || localField.type === 'richtext') && (
          <div className="space-y-3 p-3 bg-zinc-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-zinc-400">Text Options</h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Min Length</label>
                <input
                  type="number"
                  value={localField.minLength || ''}
                  onChange={(e) => updateLocal({ minLength: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Max Length</label>
                <input
                  type="number"
                  value={localField.maxLength || ''}
                  onChange={(e) => updateLocal({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                  min={0}
                />
              </div>
            </div>

            {localField.type === 'text' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localField.textarea || false}
                  onChange={(e) => updateLocal({ textarea: e.target.checked })}
                  className="rounded border-zinc-600 bg-zinc-800 text-blue-500"
                />
                <span className="text-sm text-zinc-300">Textarea (multiline)</span>
              </label>
            )}
          </div>
        )}

        {(localField.type === 'integer' || localField.type === 'float') && (
          <div className="space-y-3 p-3 bg-zinc-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-zinc-400">Number Options</h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Min</label>
                <input
                  type="number"
                  value={localField.min ?? ''}
                  onChange={(e) => updateLocal({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Max</label>
                <input
                  type="number"
                  value={localField.max ?? ''}
                  onChange={(e) => updateLocal({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Default</label>
              <input
                type="number"
                value={(localField.default as number) ?? ''}
                onChange={(e) => updateLocal({ default: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
              />
            </div>
          </div>
        )}

        {localField.type === 'enum' && (
          <div className="space-y-3 p-3 bg-zinc-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-zinc-400">Enum Options</h4>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                Options (comma-separated)
              </label>
              <input
                type="text"
                value={enumInput}
                onChange={(e) => setEnumInput(e.target.value)}
                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                placeholder="draft, published, archived"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Default Value</label>
              <select
                value={(localField.default as string) || ''}
                onChange={(e) => updateLocal({ default: e.target.value || undefined })}
                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
              >
                <option value="" className="bg-zinc-800 text-white">None</option>
                {enumInput.split(',').map((opt) => opt.trim()).filter(Boolean).map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-800 text-white">{opt}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {localField.type === 'relation' && (
          <div className="space-y-3 p-3 bg-zinc-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-zinc-400">Relation Options</h4>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Target Collection</label>
              <select
                value={localField.target || ''}
                onChange={(e) => updateLocal({ target: e.target.value })}
                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
              >
                <option value="" className="bg-zinc-800 text-white">Select...</option>
                {collections.filter((c) => c !== collection).map((c) => (
                  <option key={c} value={c} className="bg-zinc-800 text-white">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Relation Type</label>
              <select
                value={localField.relation || 'many-to-one'}
                onChange={(e) => updateLocal({ relation: e.target.value as RelationType })}
                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
              >
                {RELATION_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-zinc-800 text-white">
                    {RELATION_TYPE_INFO[type].label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 mt-1">
                {RELATION_TYPE_INFO[localField.relation || 'many-to-one'].description}
              </p>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">On Delete</label>
              <select
                value={localField.onDelete || 'cascade'}
                onChange={(e) => updateLocal({ onDelete: e.target.value as 'cascade' | 'set_null' | 'restrict' })}
                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
              >
                <option value="cascade" className="bg-zinc-800 text-white">Cascade (delete related)</option>
                <option value="set_null" className="bg-zinc-800 text-white">Set Null</option>
                <option value="restrict" className="bg-zinc-800 text-white">Restrict (prevent delete)</option>
              </select>
            </div>
          </div>
        )}

        {localField.type === 'file' && (
          <div className="space-y-3 p-3 bg-zinc-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-zinc-400">File Options</h4>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                Accept (comma-separated MIME types)
              </label>
              <input
                type="text"
                value={localField.accept?.join(', ') || ''}
                onChange={(e) => updateLocal({
                  accept: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                })}
                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                placeholder="image/*, application/pdf"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Max Size (bytes)</label>
              <input
                type="number"
                value={localField.maxSize || ''}
                onChange={(e) => updateLocal({ maxSize: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                placeholder="5242880 (5MB)"
              />
            </div>
          </div>
        )}

        {/* Display options */}
        <div className="space-y-3 p-3 bg-zinc-800/50 rounded-lg">
          <h4 className="text-sm font-medium text-zinc-400">Display</h4>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Display Name</label>
            <input
              type="text"
              value={localField.displayName || ''}
              onChange={(e) => updateLocal({ displayName: e.target.value || undefined })}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
              placeholder="Optional display name"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Description</label>
            <textarea
              value={localField.description || ''}
              onChange={(e) => updateLocal({ description: e.target.value || undefined })}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white resize-none"
              rows={2}
              placeholder="Field description"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-zinc-700 bg-zinc-800">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
        >
          <Trash2 size={14} />
          Delete
        </button>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleSave()
              onClose()
            }}
            className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
