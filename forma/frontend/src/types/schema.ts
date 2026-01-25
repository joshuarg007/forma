// Formabase Schema Types - mirrors the runtime schema format

export type FieldType =
  | 'text'
  | 'email'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'datetime'
  | 'date'
  | 'enum'
  | 'json'
  | 'richtext'
  | 'file'
  | 'relation'

export type RelationType =
  | 'many-to-one'
  | 'one-to-many'
  | 'many-to-many'
  | 'one-to-one'

export type OnDeleteAction = 'cascade' | 'set_null' | 'restrict'

export interface FieldDefinition {
  type: FieldType
  required?: boolean
  unique?: boolean
  nullable?: boolean
  default?: unknown

  // Text options
  minLength?: number
  maxLength?: number
  pattern?: string
  textarea?: boolean

  // Number options
  min?: number
  max?: number
  precision?: number

  // Enum options
  options?: string[]
  multiple?: boolean

  // File options
  accept?: string[]
  maxSize?: number

  // Relation options
  target?: string
  relation?: RelationType
  onDelete?: OnDeleteAction

  // Display
  displayName?: string
  description?: string
  searchable?: boolean
  admin?: boolean
}

export interface IndexDefinition {
  fields: string[]
  unique?: boolean
}

export interface PermissionRule {
  public?: boolean | { where: Record<string, unknown> }
  authenticated?: boolean
  admin?: boolean
  [role: string]: boolean | { where: Record<string, unknown> } | undefined
}

export interface CollectionPermissions {
  create?: string[] | PermissionRule
  read?: string[] | PermissionRule
  update?: string[] | PermissionRule
  delete?: string[] | PermissionRule
}

export interface CollectionHooks {
  beforeCreate?: string[]
  afterCreate?: string[]
  beforeUpdate?: string[]
  afterUpdate?: string[]
  beforeDelete?: string[]
  afterDelete?: string[]
}

export interface CollectionApiConfig {
  list?: {
    defaultLimit?: number
    maxLimit?: number
  }
  search?: {
    fields?: string[]
  }
}

export interface CollectionDefinition {
  displayName?: string
  icon?: string
  auth?: boolean
  timestamps?: boolean
  softDelete?: boolean
  fields: Record<string, FieldDefinition>
  indexes?: IndexDefinition[]
  permissions?: CollectionPermissions
  hooks?: CollectionHooks
  api?: CollectionApiConfig
}

export interface AuthSettings {
  providers?: string[]
  requireEmailVerification?: boolean
  sessionDuration?: number
  allowRegistration?: boolean
  defaultRole?: string
}

export interface StorageSettings {
  provider?: 'local' | 's3'
  bucket?: string
  region?: string
  publicUrl?: string
}

export interface ApiSettings {
  rateLimit?: {
    public?: { requests: number; window: number }
    authenticated?: { requests: number; window: number }
  }
  cors?: {
    origins?: string[]
    credentials?: boolean
  }
}

export interface SchemaSettings {
  auth?: AuthSettings
  storage?: StorageSettings
  api?: ApiSettings
  hooks?: {
    email?: { provider?: string; from?: string }
    webhook?: { secret?: string }
  }
}

export interface SchemaDefinition {
  $schema?: string
  version: string
  name: string
  collections: Record<string, CollectionDefinition>
  settings?: SchemaSettings
}

// UI-specific types for the visual modeler
export interface CollectionPosition {
  x: number
  y: number
}

export interface SchemaUIState {
  positions: Record<string, CollectionPosition>
  selectedCollection: string | null
  selectedField: string | null
  zoom: number
  pan: { x: number; y: number }
}

// Field type metadata for UI
export const FIELD_TYPE_INFO: Record<FieldType, { label: string; icon: string; color: string }> = {
  text: { label: 'Text', icon: 'Type', color: '#3B82F6' },
  email: { label: 'Email', icon: 'Mail', color: '#8B5CF6' },
  integer: { label: 'Integer', icon: 'Hash', color: '#10B981' },
  float: { label: 'Float', icon: 'Percent', color: '#10B981' },
  boolean: { label: 'Boolean', icon: 'ToggleLeft', color: '#F59E0B' },
  datetime: { label: 'DateTime', icon: 'Calendar', color: '#EC4899' },
  date: { label: 'Date', icon: 'CalendarDays', color: '#EC4899' },
  enum: { label: 'Enum', icon: 'List', color: '#6366F1' },
  json: { label: 'JSON', icon: 'Braces', color: '#64748B' },
  richtext: { label: 'Rich Text', icon: 'FileText', color: '#0EA5E9' },
  file: { label: 'File', icon: 'Paperclip', color: '#F97316' },
  relation: { label: 'Relation', icon: 'Link', color: '#EF4444' },
}

export const RELATION_TYPE_INFO: Record<RelationType, { label: string; description: string }> = {
  'many-to-one': { label: 'Many to One', description: 'Many items belong to one (e.g., posts → author)' },
  'one-to-many': { label: 'One to Many', description: 'One item has many (inverse)' },
  'many-to-many': { label: 'Many to Many', description: 'Many items relate to many' },
  'one-to-one': { label: 'One to One', description: 'One item has exactly one' },
}
