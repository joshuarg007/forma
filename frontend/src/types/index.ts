// FORMA Types

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
