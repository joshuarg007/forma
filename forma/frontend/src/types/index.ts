// FORMA Types
import type { CanvasComponent } from './components'
export type { CanvasComponent }

// Schema Types for Formabase Data Modeler
export * from './schema'
import type { SchemaDefinition } from './schema'

export interface User {
  id: string
  email: string
  name: string | null
  plan: PlanType
  created_at: string
}

export type PlanType = 'starter' | 'pro' | 'team' | 'enterprise'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  design_system: DesignSystem
  is_public: boolean
  created_at: string
  updated_at: string
  pages_count?: number
  // DataModeler schema and runtime deployment
  schema_json?: SchemaDefinition | null
  runtime_deployed_at?: string | null
  runtime_api_url?: string | null
}

export interface DesignSystem {
  colors: Record<string, string>
  typography: Record<string, unknown>
  spacing: Record<string, string>
  borders: Record<string, string>
  shadows: Record<string, string>
}

export interface Component {
  id: string
  project_id: string
  name: string
  intent: string | null
  code: string | null
  props_schema: Record<string, unknown>
  parent_id: string | null
  position: number
  created_at: string
  updated_at: string
}

// Page types for multi-page projects
export type PageType = 'page' | 'layout' | 'component'

export interface Page {
  id: string
  project_id: string
  name: string
  slug: string
  description: string | null
  page_type: PageType
  canvas_components: CanvasComponent[]
  layout: string
  parent_layout_id: string | null
  is_homepage: boolean
  is_dynamic: boolean
  dynamic_param: string | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  position: number
  show_in_nav: boolean
  nav_label: string | null
  nav_icon: string | null
  created_at: string
  updated_at: string
}

export interface PageCreate {
  name: string
  slug: string
  description?: string
  page_type?: PageType
  layout?: string
  is_homepage?: boolean
  is_dynamic?: boolean
  dynamic_param?: string
  meta_title?: string
  meta_description?: string
  show_in_nav?: boolean
  nav_label?: string
  nav_icon?: string
  canvas_components?: CanvasComponent[]
}

export interface PageUpdate {
  name?: string
  slug?: string
  description?: string
  page_type?: PageType
  layout?: string
  parent_layout_id?: string
  is_homepage?: boolean
  is_dynamic?: boolean
  dynamic_param?: string
  meta_title?: string
  meta_description?: string
  og_image?: string
  show_in_nav?: boolean
  nav_label?: string
  nav_icon?: string
  canvas_components?: CanvasComponent[]
  position?: number
}

export interface Intention {
  id: string
  component_id: string
  intent_text: string
  version: number
  created_at: string
}

export interface ComponentResult {
  name: string
  code: string
  props_schema: Record<string, unknown>
  explanation: string
}

export interface GenerateResponse {
  success: boolean
  result: ComponentResult | null
  error: string | null
  tokens_used: number
}

export interface UsageStats {
  operations_used: number
  operations_limit: number
  tokens_used: number
  cost_usd: number
  plan: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}
