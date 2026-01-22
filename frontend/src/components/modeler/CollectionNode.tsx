'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Database,
  Key,
  Link,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Shield,
  Copy,
  MoreHorizontal,
  Type,
  Mail,
  Hash,
  ToggleLeft,
  Calendar,
  List,
  Braces,
  FileText,
  Paperclip,
} from 'lucide-react'
import { useSchemaStore } from '@/stores/schemaStore'
import type { CollectionDefinition, FieldDefinition, FieldType } from '@/types/schema'
import { FIELD_TYPE_INFO } from '@/types/schema'

interface CollectionNodeProps {
  name: string
  collection: CollectionDefinition
  position: { x: number; y: number }
  isSelected: boolean
  onSelect: () => void
  onDragStart: (e: React.MouseEvent) => void
  onFieldClick: (fieldName: string) => void
  selectedField: string | null
}

const FieldIcon = ({ type }: { type: FieldType }) => {
  const iconMap: Record<FieldType, React.ReactNode> = {
    text: <Type size={12} />,
    email: <Mail size={12} />,
    integer: <Hash size={12} />,
    float: <Hash size={12} />,
    boolean: <ToggleLeft size={12} />,
    datetime: <Calendar size={12} />,
    date: <Calendar size={12} />,
    enum: <List size={12} />,
    json: <Braces size={12} />,
    richtext: <FileText size={12} />,
    file: <Paperclip size={12} />,
    relation: <Link size={12} />,
  }
  return <span style={{ color: FIELD_TYPE_INFO[type]?.color }}>{iconMap[type]}</span>
}

export function CollectionNode({
  name,
  collection,
  position,
  isSelected,
  onSelect,
  onDragStart,
  onFieldClick,
  selectedField,
}: CollectionNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)

  const {
    removeCollection,
    duplicateCollection,
    addField,
  } = useSchemaStore()

  const fields = Object.entries(collection.fields || {})
  const isAuthCollection = collection.auth === true

  const handleAddField = () => {
    const fieldName = `field_${Object.keys(collection.fields).length + 1}`
    addField(name, fieldName, { type: 'text' })
  }

  const handleDelete = () => {
    if (confirm(`Delete collection "${name}"? This cannot be undone.`)) {
      removeCollection(name)
    }
  }

  const handleDuplicate = () => {
    duplicateCollection(name)
  }

  return (
    <motion.div
      ref={nodeRef}
      className={`absolute bg-zinc-900 border rounded-lg shadow-xl min-w-[280px] ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-700'
      }`}
      style={{ left: position.x, top: position.y }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={onSelect}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-t-lg cursor-move border-b border-zinc-700"
        onMouseDown={onDragStart}
      >
        <GripVertical size={14} className="text-zinc-500" />

        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className="text-zinc-400 hover:text-white"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <Database size={14} className="text-blue-400" />

        <span className="font-medium text-white flex-1">{name}</span>

        {isAuthCollection && (
          <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
            <Key size={10} />
            Auth
          </span>
        )}

        {collection.timestamps && (
          <span className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded">
            timestamps
          </span>
        )}

        {/* Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
          >
            <MoreHorizontal size={14} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 py-1 min-w-[140px]">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddField()
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                <Plus size={14} />
                Add Field
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDuplicate()
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                <Copy size={14} />
                Duplicate
              </button>
              <hr className="my-1 border-zinc-700" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-zinc-700"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fields */}
      {isExpanded && (
        <div className="p-2 space-y-1">
          {/* ID field (always present) */}
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-400 bg-zinc-800/50 rounded">
            <Key size={12} className="text-yellow-500" />
            <span className="flex-1">id</span>
            <span className="text-xs text-zinc-500">integer</span>
            <span className="text-xs text-yellow-500">PK</span>
          </div>

          {/* User-defined fields */}
          {fields.map(([fieldName, field]) => (
            <div
              key={fieldName}
              onClick={(e) => {
                e.stopPropagation()
                onFieldClick(fieldName)
              }}
              className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${
                selectedField === fieldName
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <FieldIcon type={field.type} />
              <span className="flex-1 truncate">{fieldName}</span>

              {field.required && (
                <span className="text-xs text-red-400">*</span>
              )}

              {field.unique && (
                <span className="text-xs text-purple-400">unique</span>
              )}

              {field.type === 'relation' && field.target && (
                <span className="text-xs text-blue-400">→ {field.target}</span>
              )}

              {field.type !== 'relation' && (
                <span className="text-xs text-zinc-500">{field.type}</span>
              )}
            </div>
          ))}

          {/* Timestamp fields */}
          {collection.timestamps && (
            <>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-500 bg-zinc-800/30 rounded">
                <Calendar size={12} />
                <span className="flex-1">created_at</span>
                <span className="text-xs">datetime</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-500 bg-zinc-800/30 rounded">
                <Calendar size={12} />
                <span className="flex-1">updated_at</span>
                <span className="text-xs">datetime</span>
              </div>
            </>
          )}

          {/* Add field button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAddField()
            }}
            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded border border-dashed border-zinc-700 hover:border-zinc-500 transition-colors"
          >
            <Plus size={12} />
            Add Field
          </button>
        </div>
      )}
    </motion.div>
  )
}
