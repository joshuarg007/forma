'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Database,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { SchemaDefinition, CollectionDefinition } from '@/types/schema'
import { useToast } from '@/components/ui/Toast'

interface DataEditorProps {
  isOpen: boolean
  onClose: () => void
  apiUrl: string
  schema: SchemaDefinition | null
}

interface Record {
  id: number
  [key: string]: unknown
}

interface PaginatedResponse {
  items: Record[]
  total: number
  page: number
  per_page: number
  pages: number
}

export function DataEditor({ isOpen, onClose, apiUrl, schema }: DataEditorProps) {
  const toast = useToast()
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [records, setRecords] = useState<Record[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Edit modal state
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const collections = schema ? Object.keys(schema.collections) : []

  // Auto-select first collection
  useEffect(() => {
    if (isOpen && collections.length > 0 && !selectedCollection) {
      setSelectedCollection(collections[0])
    }
  }, [isOpen, collections, selectedCollection])

  // Fetch records when collection or page changes
  const fetchRecords = useCallback(async () => {
    if (!selectedCollection || !apiUrl) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
      })
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      const response = await fetch(`${apiUrl}/${selectedCollection}?${params}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const data = await response.json() as PaginatedResponse
      setRecords(data.items || [])
      setTotalRecords(data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedCollection, apiUrl, currentPage, perPage, searchQuery])

  useEffect(() => {
    if (isOpen && selectedCollection) {
      fetchRecords()
    }
  }, [isOpen, selectedCollection, fetchRecords])

  // Get field columns for the table
  const getFieldColumns = () => {
    if (!schema || !selectedCollection) return ['id']
    const collection = schema.collections[selectedCollection]
    if (!collection) return ['id']

    const fields = Object.keys(collection.fields)
    return ['id', ...fields.slice(0, 5)] // Limit to 5 fields + id
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      const response = await fetch(`${apiUrl}/${selectedCollection}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      toast.success('Record deleted')
      fetchRecords()
    } catch (err) {
      toast.error('Delete failed', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleSave = async (data: Record) => {
    setIsSaving(true)

    try {
      const isNew = !data.id
      const url = isNew
        ? `${apiUrl}/${selectedCollection}`
        : `${apiUrl}/${selectedCollection}/${data.id}`

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to save')
      }

      toast.success(isNew ? 'Record created' : 'Record updated')
      setIsEditorOpen(false)
      setEditingRecord(null)
      fetchRecords()
    } catch (err) {
      toast.error('Save failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSaving(false)
    }
  }

  const totalPages = Math.ceil(totalRecords / perPage)

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-zinc-900 border-l border-zinc-700 shadow-2xl z-50 flex"
          >
            {/* Sidebar - Collection List */}
            <div className="w-48 border-r border-zinc-800 flex flex-col">
              <div className="p-3 border-b border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-400">Collections</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {collections.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setSelectedCollection(name)
                      setCurrentPage(1)
                      setSearchQuery('')
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedCollection === name
                        ? 'bg-violet-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Database size={14} />
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">
                    {selectedCollection || 'Select a collection'}
                  </h2>
                  {totalRecords > 0 && (
                    <span className="text-sm text-zinc-500">
                      {totalRecords} record{totalRecords !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchRecords}
                    disabled={isLoading}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="pl-9 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none w-64"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingRecord({} as Record)
                    setIsEditorOpen(true)
                  }}
                  disabled={!selectedCollection}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                  Add Record
                </button>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 size={32} className="animate-spin text-zinc-500" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-48 text-red-400">
                    <AlertCircle size={32} className="mb-2" />
                    <p>{error}</p>
                    <button
                      onClick={fetchRecords}
                      className="mt-2 text-sm text-violet-400 hover:text-violet-300"
                    >
                      Try again
                    </button>
                  </div>
                ) : records.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
                    <Database size={32} className="mb-2" />
                    <p>No records found</p>
                    <button
                      onClick={() => {
                        setEditingRecord({} as Record)
                        setIsEditorOpen(true)
                      }}
                      className="mt-2 text-sm text-violet-400 hover:text-violet-300"
                    >
                      Add your first record
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {getFieldColumns().map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {records.map((record) => (
                        <tr key={record.id} className="hover:bg-zinc-800/50">
                          {getFieldColumns().map((col) => (
                            <td
                              key={col}
                              className="px-3 py-2 text-sm text-zinc-300 max-w-[200px] truncate"
                            >
                              {formatCellValue(record[col])}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingRecord(record)
                                  setIsEditorOpen(true)
                                }}
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
                  <span className="text-sm text-zinc-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Record Editor Modal */}
          <RecordEditorModal
            isOpen={isEditorOpen}
            onClose={() => {
              setIsEditorOpen(false)
              setEditingRecord(null)
            }}
            record={editingRecord}
            collection={selectedCollection ? schema?.collections[selectedCollection] ?? null : null}
            collectionName={selectedCollection}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </>
      )}
    </AnimatePresence>
  )
}

// Record Editor Modal
interface RecordEditorModalProps {
  isOpen: boolean
  onClose: () => void
  record: Record | null
  collection: CollectionDefinition | null
  collectionName: string | null
  onSave: (data: Record) => void
  isSaving: boolean
}

function RecordEditorModal({
  isOpen,
  onClose,
  record,
  collection,
  collectionName,
  onSave,
  isSaving,
}: RecordEditorModalProps) {
  const [formData, setFormData] = useState<Record>({} as Record)

  useEffect(() => {
    if (record) {
      setFormData({ ...record })
    }
  }, [record])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const fields = collection ? Object.entries(collection.fields) : []
  const isNew = !record?.id

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-lg"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-zinc-800">
                <h3 className="text-lg font-medium text-white">
                  {isNew ? `New ${collectionName}` : `Edit ${collectionName} #${record?.id}`}
                </h3>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
                {fields.map(([fieldName, fieldDef]) => {
                  // Skip auto-generated fields
                  if (fieldName === 'id' || fieldName === 'password_hash') return null
                  if (fieldDef.type === 'relation') return null // Skip relations for now

                  return (
                    <div key={fieldName}>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">
                        {fieldDef.displayName || fieldName}
                        {fieldDef.required && <span className="text-red-400 ml-1">*</span>}
                      </label>

                      {fieldDef.type === 'text' && fieldDef.textarea ? (
                        <textarea
                          value={(formData[fieldName] as string) || ''}
                          onChange={(e) => updateField(fieldName, e.target.value)}
                          required={fieldDef.required}
                          rows={3}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none resize-none"
                        />
                      ) : fieldDef.type === 'boolean' ? (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(formData[fieldName])}
                            onChange={(e) => updateField(fieldName, e.target.checked)}
                            className="rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500"
                          />
                          <span className="text-sm text-zinc-400">
                            {fieldDef.description || 'Enabled'}
                          </span>
                        </label>
                      ) : fieldDef.type === 'enum' ? (
                        <select
                          value={(formData[fieldName] as string) || ''}
                          onChange={(e) => updateField(fieldName, e.target.value)}
                          required={fieldDef.required}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                        >
                          <option value="">Select...</option>
                          {fieldDef.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : fieldDef.type === 'integer' || fieldDef.type === 'float' ? (
                        <input
                          type="number"
                          value={(formData[fieldName] as number) ?? ''}
                          onChange={(e) =>
                            updateField(
                              fieldName,
                              e.target.value
                                ? fieldDef.type === 'integer'
                                  ? parseInt(e.target.value)
                                  : parseFloat(e.target.value)
                                : null
                            )
                          }
                          required={fieldDef.required}
                          min={fieldDef.min}
                          max={fieldDef.max}
                          step={fieldDef.type === 'float' ? 'any' : 1}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                        />
                      ) : fieldDef.type === 'datetime' ? (
                        <input
                          type="datetime-local"
                          value={(formData[fieldName] as string) || ''}
                          onChange={(e) => updateField(fieldName, e.target.value)}
                          required={fieldDef.required}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                        />
                      ) : fieldDef.type === 'date' ? (
                        <input
                          type="date"
                          value={(formData[fieldName] as string) || ''}
                          onChange={(e) => updateField(fieldName, e.target.value)}
                          required={fieldDef.required}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                        />
                      ) : (
                        <input
                          type={fieldDef.type === 'email' ? 'email' : 'text'}
                          value={(formData[fieldName] as string) || ''}
                          onChange={(e) => updateField(fieldName, e.target.value)}
                          required={fieldDef.required}
                          maxLength={fieldDef.maxLength}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                        />
                      )}

                      {fieldDef.description && (
                        <p className="text-xs text-zinc-500 mt-1">{fieldDef.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-zinc-800 bg-zinc-800/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  {isNew ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
