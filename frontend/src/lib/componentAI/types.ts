// Component AI Types

// All available component types in the system
export const COMPONENT_TYPES = [
  // Layout containers
  'grid-2col', 'grid-3col', 'grid-4col', 'grid-sidebar',
  'section', 'container', 'flexbox', 'flex-row', 'flex-col',

  // Content components
  'card-basic', 'card-image', 'card-pricing', 'card-team',
  'text', 'heading', 'paragraph', 'list',
  'image', 'video', 'icon', 'avatar',
  'button', 'button-group', 'link',
  'divider', 'spacer',

  // Form elements
  'form-contact', 'form-newsletter', 'form-login',
  'input', 'textarea', 'select', 'checkbox', 'radio',

  // Sections
  'hero-centered', 'hero-split', 'hero-video',
  'section-features', 'section-pricing', 'section-testimonials',
  'section-faq', 'section-cta', 'section-team', 'section-stats',

  // Navigation
  'navbar', 'navbar-vertical', 'footer', 'breadcrumb', 'tabs',

  // Data display
  'stats', 'stat-item', 'testimonial', 'team-member',
  'pricing-card', 'feature-card', 'logo',
] as const

export type ComponentType = typeof COMPONENT_TYPES[number]

// Context for making predictions
export interface PredictionContext {
  parentType: ComponentType
  existingChildren: ComponentType[]
  siblingComponents: ComponentType[]
  pageComponents: ComponentType[]
}

// A single prediction result
export interface ComponentPrediction {
  componentType: ComponentType
  score: number
  reason?: string
}

// Training sample
export interface TrainingSample {
  context: PredictionContext
  chosenComponent: ComponentType
  weight?: number // Higher weight = more important sample
}

// User interaction for personalization
export interface UserInteraction {
  context: PredictionContext
  chosenComponent: ComponentType
  timestamp: number
  sessionId?: string
}

// Model configuration
export interface ModelConfig {
  embeddingDim: number
  hiddenDim: number
  numComponents: number
  learningRate: number
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  embeddingDim: 16,
  hiddenDim: 32,
  numComponents: COMPONENT_TYPES.length,
  learningRate: 0.001,
}

// Component metadata for display
export interface ComponentMeta {
  id: ComponentType
  name: string
  icon: string
  category: 'layout' | 'content' | 'form' | 'section' | 'navigation' | 'data'
}

// Create lookup maps
export const COMPONENT_TO_INDEX: Record<ComponentType, number> =
  COMPONENT_TYPES.reduce((acc, type, idx) => ({ ...acc, [type]: idx }), {} as Record<ComponentType, number>)

export const INDEX_TO_COMPONENT: Record<number, ComponentType> =
  COMPONENT_TYPES.reduce((acc, type, idx) => ({ ...acc, [idx]: type }), {} as Record<number, ComponentType>)
