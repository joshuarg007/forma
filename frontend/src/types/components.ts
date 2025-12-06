// Enhanced component types with full styling and animation support

export interface ComponentStyles {
  // Typography
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  lineHeight?: string
  letterSpacing?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textColor?: string
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'

  // Background
  backgroundColor?: string
  backgroundGradient?: {
    type: 'linear' | 'radial'
    angle?: number
    colors: { color: string; position: number }[]
  }
  backgroundImage?: string
  backgroundSize?: 'cover' | 'contain' | 'auto'
  backgroundPosition?: string

  // Spacing
  padding?: { top: number; right: number; bottom: number; left: number }
  margin?: { top: number; right: number; bottom: number; left: number }

  // Size
  width?: string
  maxWidth?: string
  minWidth?: string
  height?: string
  maxHeight?: string
  minHeight?: string

  // Border
  borderRadius?: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }
  borderWidth?: { top: number; right: number; bottom: number; left: number }
  borderColor?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'

  // Shadow
  boxShadow?: {
    x: number
    y: number
    blur: number
    spread: number
    color: string
    inset?: boolean
  }[]

  // Layout
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block'
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  gap?: number
  gridColumns?: number

  // Position
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky'
  top?: string
  right?: string
  bottom?: string
  left?: string
  zIndex?: number

  // Visibility
  opacity?: number
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
  visibility?: 'visible' | 'hidden'

  // 3D Transforms
  transform3D?: {
    rotateX?: number
    rotateY?: number
    rotateZ?: number
    translateX?: number
    translateY?: number
    translateZ?: number
    scaleX?: number
    scaleY?: number
    scaleZ?: number
    perspective?: number
    perspectiveOrigin?: string
    transformStyle?: 'flat' | 'preserve-3d'
    backfaceVisibility?: 'visible' | 'hidden'
  }

  // Filters & Effects
  filter?: {
    blur?: number
    brightness?: number
    contrast?: number
    grayscale?: number
    hueRotate?: number
    invert?: number
    saturate?: number
    sepia?: number
  }
  backdropFilter?: {
    blur?: number
    brightness?: number
    contrast?: number
    grayscale?: number
    saturate?: number
  }
  mixBlendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity'

  // Cursor
  cursor?: 'auto' | 'default' | 'pointer' | 'wait' | 'text' | 'move' | 'not-allowed' | 'grab' | 'grabbing' | 'zoom-in' | 'zoom-out'
}

export interface AnimationConfig {
  // Entrance animation
  entrance?: {
    type: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'bounce' | 'flip' | 'rotate'
    duration: number // in ms
    delay: number
    easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring'
  }

  // Hover animation
  hover?: {
    scale?: number
    rotate?: number
    translateX?: number
    translateY?: number
    opacity?: number
    backgroundColor?: string
    boxShadow?: string
    duration: number
  }

  // Scroll animation
  scroll?: {
    type: 'none' | 'fade' | 'slide' | 'parallax' | 'scale' | 'rotate'
    trigger: 'top' | 'center' | 'bottom'
    offset?: number
  }

  // Continuous animation
  loop?: {
    type: 'none' | 'pulse' | 'bounce' | 'shake' | 'swing' | 'float' | 'spin'
    duration: number
  }
}

export interface ResponsiveStyles {
  desktop?: Partial<ComponentStyles>
  tablet?: Partial<ComponentStyles>
  mobile?: Partial<ComponentStyles>
}

export interface CanvasComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>

  // Enhanced styling
  styles?: ComponentStyles
  responsiveStyles?: ResponsiveStyles
  animation?: AnimationConfig

  // Nesting support
  children?: CanvasComponent[]
  parentId?: string

  // Layout
  alignment?: 'left' | 'center' | 'right'
  layoutRole?: 'header' | 'sidebar' | 'main' | 'footer' // header = top full width, sidebar = fixed left, main = content area, footer = bottom full width

  // Content editing
  content?: {
    [key: string]: string | number | boolean
  }

  // Metadata
  locked?: boolean
  hidden?: boolean
  collapsed?: boolean

  // AI generated code
  code?: string

  // API Data Binding
  dataBinding?: {
    source?: string // API endpoint or data source
    method?: 'GET' | 'POST'
    headers?: Record<string, string>
    mapping?: {
      [propPath: string]: string // maps component prop to data path
    }
    refreshInterval?: number // auto-refresh in seconds, 0 = disabled
    loadingState?: 'idle' | 'loading' | 'success' | 'error'
    cache?: boolean
  }

  // Custom Code Injection
  customCode?: {
    css?: string
    cssScope?: 'component' | 'global'
    js?: string
    jsEvent?: 'mount' | 'click' | 'hover' | 'scroll'
    htmlBefore?: string
    htmlAfter?: string
  }

  // Interactions
  interactions?: {
    onClick?: {
      action: 'navigate' | 'scroll' | 'toggle' | 'animate' | 'custom'
      target?: string
      value?: string
    }
    onHover?: {
      action: 'show' | 'hide' | 'animate' | 'custom'
      target?: string
    }
  }
}

// Style presets
export interface StylePreset {
  id: string
  name: string
  category: 'button' | 'text' | 'card' | 'section' | 'custom'
  styles: Partial<ComponentStyles>
  animation?: Partial<AnimationConfig>
}

// Default style presets
export const defaultPresets: StylePreset[] = [
  {
    id: 'shadow-soft',
    name: 'Soft Shadow',
    category: 'card',
    styles: {
      boxShadow: [{ x: 0, y: 4, blur: 20, spread: 0, color: 'rgba(0,0,0,0.1)' }],
      borderRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 }
    }
  },
  {
    id: 'shadow-elevated',
    name: 'Elevated',
    category: 'card',
    styles: {
      boxShadow: [
        { x: 0, y: 10, blur: 40, spread: -10, color: 'rgba(0,0,0,0.2)' },
        { x: 0, y: 4, blur: 6, spread: -2, color: 'rgba(0,0,0,0.05)' }
      ],
      borderRadius: { topLeft: 24, topRight: 24, bottomRight: 24, bottomLeft: 24 }
    }
  },
  {
    id: 'glass',
    name: 'Glassmorphism',
    category: 'card',
    styles: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderWidth: { top: 1, right: 1, bottom: 1, left: 1 },
      borderColor: 'rgba(255,255,255,0.2)',
      borderRadius: { topLeft: 20, topRight: 20, bottomRight: 20, bottomLeft: 20 }
    }
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset Gradient',
    category: 'section',
    styles: {
      backgroundGradient: {
        type: 'linear',
        angle: 135,
        colors: [
          { color: '#f093fb', position: 0 },
          { color: '#f5576c', position: 100 }
        ]
      }
    }
  },
  {
    id: 'gradient-ocean',
    name: 'Ocean Gradient',
    category: 'section',
    styles: {
      backgroundGradient: {
        type: 'linear',
        angle: 135,
        colors: [
          { color: '#667eea', position: 0 },
          { color: '#764ba2', position: 100 }
        ]
      }
    }
  },
  {
    id: 'hover-lift',
    name: 'Lift on Hover',
    category: 'card',
    styles: {},
    animation: {
      hover: {
        scale: 1.02,
        translateY: -4,
        duration: 200
      }
    }
  },
  {
    id: 'hover-glow',
    name: 'Glow on Hover',
    category: 'button',
    styles: {},
    animation: {
      hover: {
        scale: 1.05,
        boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
        duration: 200
      }
    }
  },
  {
    id: 'entrance-fade-up',
    name: 'Fade Up',
    category: 'custom',
    styles: {},
    animation: {
      entrance: {
        type: 'slide-up',
        duration: 600,
        delay: 0,
        easing: 'ease-out'
      }
    }
  }
]

// Color palette presets
export const colorPalettes = {
  indigo: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'],
  purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87'],
  pink: ['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'],
  rose: ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337'],
  orange: ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
  amber: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  emerald: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  teal: ['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'],
  cyan: ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
  sky: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'],
  slate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
  gray: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'],
  neutral: ['#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717'],
}

// Font options
export const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Source Code Pro', label: 'Source Code Pro' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
]

// Easing functions for animations
export const easingOptions = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'spring', label: 'Spring' },
]
