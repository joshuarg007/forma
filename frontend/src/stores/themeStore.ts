import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Design Token Types
export interface ColorToken {
  name: string
  value: string
  description?: string
}

export interface TypographyToken {
  name: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing?: string
}

export interface SpacingToken {
  name: string
  value: string
}

export interface ShadowToken {
  name: string
  value: string
}

export interface BorderRadiusToken {
  name: string
  value: string
}

export interface BreakpointToken {
  name: string
  value: string
  description?: string
}

export interface DesignTokens {
  colors: {
    primary: ColorToken[]
    secondary: ColorToken[]
    neutral: ColorToken[]
    semantic: ColorToken[]
  }
  typography: TypographyToken[]
  spacing: SpacingToken[]
  shadows: ShadowToken[]
  borderRadius: BorderRadiusToken[]
  breakpoints: BreakpointToken[]
}

// Utility function to calculate relative luminance
function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)
  if (!rgb) return 0

  const [r, g, b] = rgb.map(c => {
    const val = parseInt(c, 16) / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Utility function to calculate contrast ratio
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// Check if contrast meets WCAG requirements
export function checkWCAGContrast(foreground: string, background: string): {
  ratio: number
  aa: boolean
  aaLarge: boolean
  aaa: boolean
  aaaLarge: boolean
} {
  const ratio = getContrastRatio(foreground, background)
  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: ratio >= 4.5,       // WCAG AA for normal text
    aaLarge: ratio >= 3,    // WCAG AA for large text (18pt+ or 14pt bold)
    aaa: ratio >= 7,        // WCAG AAA for normal text
    aaaLarge: ratio >= 4.5, // WCAG AAA for large text
  }
}

// Default breakpoints
const defaultBreakpoints: BreakpointToken[] = [
  { name: 'xs', value: '320px', description: 'Extra small phones' },
  { name: 'sm', value: '640px', description: 'Small tablets' },
  { name: 'md', value: '768px', description: 'Tablets' },
  { name: 'lg', value: '1024px', description: 'Laptops' },
  { name: 'xl', value: '1280px', description: 'Desktops' },
  { name: '2xl', value: '1536px', description: 'Large screens' },
]

export interface Theme {
  id: string
  name: string
  description?: string
  tokens: DesignTokens
  isDefault?: boolean
}

// Default Light Theme
const defaultLightTheme: Theme = {
  id: 'light',
  name: 'Light',
  description: 'Clean, modern light theme',
  isDefault: true,
  tokens: {
    colors: {
      primary: [
        { name: 'primary-50', value: '#eef2ff' },
        { name: 'primary-100', value: '#e0e7ff' },
        { name: 'primary-200', value: '#c7d2fe' },
        { name: 'primary-300', value: '#a5b4fc' },
        { name: 'primary-400', value: '#818cf8' },
        { name: 'primary-500', value: '#6366f1', description: 'Main brand color' },
        { name: 'primary-600', value: '#4f46e5' },
        { name: 'primary-700', value: '#4338ca' },
        { name: 'primary-800', value: '#3730a3' },
        { name: 'primary-900', value: '#312e81' },
      ],
      secondary: [
        { name: 'secondary-50', value: '#faf5ff' },
        { name: 'secondary-100', value: '#f3e8ff' },
        { name: 'secondary-200', value: '#e9d5ff' },
        { name: 'secondary-300', value: '#d8b4fe' },
        { name: 'secondary-400', value: '#c084fc' },
        { name: 'secondary-500', value: '#a855f7', description: 'Secondary accent' },
        { name: 'secondary-600', value: '#9333ea' },
        { name: 'secondary-700', value: '#7e22ce' },
        { name: 'secondary-800', value: '#6b21a8' },
        { name: 'secondary-900', value: '#581c87' },
      ],
      neutral: [
        { name: 'white', value: '#ffffff' },
        { name: 'gray-50', value: '#f9fafb' },
        { name: 'gray-100', value: '#f3f4f6' },
        { name: 'gray-200', value: '#e5e7eb' },
        { name: 'gray-300', value: '#d1d5db' },
        { name: 'gray-400', value: '#9ca3af' },
        { name: 'gray-500', value: '#6b7280' },
        { name: 'gray-600', value: '#4b5563' },
        { name: 'gray-700', value: '#374151' },
        { name: 'gray-800', value: '#1f2937' },
        { name: 'gray-900', value: '#111827' },
        { name: 'black', value: '#000000' },
      ],
      semantic: [
        { name: 'success', value: '#10b981', description: 'Success states' },
        { name: 'warning', value: '#f59e0b', description: 'Warning states' },
        { name: 'error', value: '#ef4444', description: 'Error states' },
        { name: 'info', value: '#3b82f6', description: 'Info states' },
      ],
    },
    typography: [
      { name: 'heading-xl', fontFamily: 'Inter', fontSize: '3.5rem', fontWeight: '700', lineHeight: '1.1' },
      { name: 'heading-lg', fontFamily: 'Inter', fontSize: '2.5rem', fontWeight: '700', lineHeight: '1.2' },
      { name: 'heading-md', fontFamily: 'Inter', fontSize: '1.875rem', fontWeight: '600', lineHeight: '1.3' },
      { name: 'heading-sm', fontFamily: 'Inter', fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.4' },
      { name: 'body-lg', fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: '400', lineHeight: '1.6' },
      { name: 'body-md', fontFamily: 'Inter', fontSize: '1rem', fontWeight: '400', lineHeight: '1.6' },
      { name: 'body-sm', fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.5' },
      { name: 'caption', fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: '400', lineHeight: '1.4' },
    ],
    spacing: [
      { name: 'xs', value: '0.25rem' },
      { name: 'sm', value: '0.5rem' },
      { name: 'md', value: '1rem' },
      { name: 'lg', value: '1.5rem' },
      { name: 'xl', value: '2rem' },
      { name: '2xl', value: '3rem' },
      { name: '3xl', value: '4rem' },
      { name: '4xl', value: '6rem' },
    ],
    shadows: [
      { name: 'sm', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
      { name: 'md', value: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
      { name: 'lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.1)' },
      { name: 'xl', value: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
      { name: '2xl', value: '0 25px 50px -12px rgb(0 0 0 / 0.25)' },
    ],
    borderRadius: [
      { name: 'none', value: '0' },
      { name: 'sm', value: '0.25rem' },
      { name: 'md', value: '0.375rem' },
      { name: 'lg', value: '0.5rem' },
      { name: 'xl', value: '0.75rem' },
      { name: '2xl', value: '1rem' },
      { name: '3xl', value: '1.5rem' },
      { name: 'full', value: '9999px' },
    ],
    breakpoints: defaultBreakpoints,
  },
}

// Default Dark Theme
const defaultDarkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  description: 'Sleek dark mode theme',
  tokens: {
    colors: {
      primary: [
        { name: 'primary-50', value: '#1e1b4b' },
        { name: 'primary-100', value: '#312e81' },
        { name: 'primary-200', value: '#3730a3' },
        { name: 'primary-300', value: '#4338ca' },
        { name: 'primary-400', value: '#4f46e5' },
        { name: 'primary-500', value: '#6366f1', description: 'Main brand color' },
        { name: 'primary-600', value: '#818cf8' },
        { name: 'primary-700', value: '#a5b4fc' },
        { name: 'primary-800', value: '#c7d2fe' },
        { name: 'primary-900', value: '#e0e7ff' },
      ],
      secondary: [
        { name: 'secondary-50', value: '#581c87' },
        { name: 'secondary-100', value: '#6b21a8' },
        { name: 'secondary-200', value: '#7e22ce' },
        { name: 'secondary-300', value: '#9333ea' },
        { name: 'secondary-400', value: '#a855f7' },
        { name: 'secondary-500', value: '#c084fc', description: 'Secondary accent' },
        { name: 'secondary-600', value: '#d8b4fe' },
        { name: 'secondary-700', value: '#e9d5ff' },
        { name: 'secondary-800', value: '#f3e8ff' },
        { name: 'secondary-900', value: '#faf5ff' },
      ],
      neutral: [
        { name: 'white', value: '#0f0f0f' },
        { name: 'gray-50', value: '#171717' },
        { name: 'gray-100', value: '#1f1f1f' },
        { name: 'gray-200', value: '#2a2a2a' },
        { name: 'gray-300', value: '#3f3f3f' },
        { name: 'gray-400', value: '#525252' },
        { name: 'gray-500', value: '#737373' },
        { name: 'gray-600', value: '#a3a3a3' },
        { name: 'gray-700', value: '#d4d4d4' },
        { name: 'gray-800', value: '#e5e5e5' },
        { name: 'gray-900', value: '#f5f5f5' },
        { name: 'black', value: '#ffffff' },
      ],
      semantic: [
        { name: 'success', value: '#34d399', description: 'Success states' },
        { name: 'warning', value: '#fbbf24', description: 'Warning states' },
        { name: 'error', value: '#f87171', description: 'Error states' },
        { name: 'info', value: '#60a5fa', description: 'Info states' },
      ],
    },
    typography: defaultLightTheme.tokens.typography,
    spacing: defaultLightTheme.tokens.spacing,
    shadows: [
      { name: 'sm', value: '0 1px 2px 0 rgb(0 0 0 / 0.3)' },
      { name: 'md', value: '0 4px 6px -1px rgb(0 0 0 / 0.4)' },
      { name: 'lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.4)' },
      { name: 'xl', value: '0 20px 25px -5px rgb(0 0 0 / 0.4)' },
      { name: '2xl', value: '0 25px 50px -12px rgb(0 0 0 / 0.5)' },
    ],
    borderRadius: defaultLightTheme.tokens.borderRadius,
    breakpoints: defaultBreakpoints,
  },
}

// Neon Theme
const neonTheme: Theme = {
  id: 'neon',
  name: 'Neon',
  description: 'Vibrant cyberpunk-inspired theme',
  tokens: {
    colors: {
      primary: [
        { name: 'primary-50', value: '#0a0a0a' },
        { name: 'primary-100', value: '#0d1117' },
        { name: 'primary-200', value: '#161b22' },
        { name: 'primary-300', value: '#21262d' },
        { name: 'primary-400', value: '#30363d' },
        { name: 'primary-500', value: '#00ff88', description: 'Neon green' },
        { name: 'primary-600', value: '#33ff9f' },
        { name: 'primary-700', value: '#66ffb8' },
        { name: 'primary-800', value: '#99ffd1' },
        { name: 'primary-900', value: '#ccffea' },
      ],
      secondary: [
        { name: 'secondary-50', value: '#0a0a0a' },
        { name: 'secondary-100', value: '#0d1117' },
        { name: 'secondary-200', value: '#161b22' },
        { name: 'secondary-300', value: '#21262d' },
        { name: 'secondary-400', value: '#30363d' },
        { name: 'secondary-500', value: '#ff00ff', description: 'Neon pink' },
        { name: 'secondary-600', value: '#ff33ff' },
        { name: 'secondary-700', value: '#ff66ff' },
        { name: 'secondary-800', value: '#ff99ff' },
        { name: 'secondary-900', value: '#ffccff' },
      ],
      neutral: [
        { name: 'white', value: '#0a0a0a' },
        { name: 'gray-50', value: '#0d1117' },
        { name: 'gray-100', value: '#161b22' },
        { name: 'gray-200', value: '#21262d' },
        { name: 'gray-300', value: '#30363d' },
        { name: 'gray-400', value: '#484f58' },
        { name: 'gray-500', value: '#6e7681' },
        { name: 'gray-600', value: '#8b949e' },
        { name: 'gray-700', value: '#c9d1d9' },
        { name: 'gray-800', value: '#e6edf3' },
        { name: 'gray-900', value: '#f0f6fc' },
        { name: 'black', value: '#ffffff' },
      ],
      semantic: [
        { name: 'success', value: '#00ff88', description: 'Success states' },
        { name: 'warning', value: '#ffcc00', description: 'Warning states' },
        { name: 'error', value: '#ff3366', description: 'Error states' },
        { name: 'info', value: '#00ccff', description: 'Info states' },
      ],
    },
    typography: defaultLightTheme.tokens.typography,
    spacing: defaultLightTheme.tokens.spacing,
    shadows: [
      { name: 'sm', value: '0 0 5px rgb(0 255 136 / 0.3)' },
      { name: 'md', value: '0 0 10px rgb(0 255 136 / 0.4)' },
      { name: 'lg', value: '0 0 20px rgb(0 255 136 / 0.5)' },
      { name: 'xl', value: '0 0 30px rgb(0 255 136 / 0.6)' },
      { name: '2xl', value: '0 0 50px rgb(0 255 136 / 0.7)' },
    ],
    borderRadius: defaultLightTheme.tokens.borderRadius,
    breakpoints: defaultBreakpoints,
  },
}

// Minimal Theme - Clean, simple, lots of whitespace
const minimalTheme: Theme = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean and simple with maximum whitespace',
  tokens: {
    colors: {
      primary: [
        { name: 'primary-50', value: '#fafafa' },
        { name: 'primary-100', value: '#f5f5f5' },
        { name: 'primary-200', value: '#e5e5e5' },
        { name: 'primary-300', value: '#d4d4d4' },
        { name: 'primary-400', value: '#a3a3a3' },
        { name: 'primary-500', value: '#171717', description: 'Pure black accent' },
        { name: 'primary-600', value: '#262626' },
        { name: 'primary-700', value: '#404040' },
        { name: 'primary-800', value: '#525252' },
        { name: 'primary-900', value: '#737373' },
      ],
      secondary: [
        { name: 'secondary-50', value: '#fafafa' },
        { name: 'secondary-100', value: '#f5f5f5' },
        { name: 'secondary-200', value: '#e5e5e5' },
        { name: 'secondary-300', value: '#d4d4d4' },
        { name: 'secondary-400', value: '#a3a3a3' },
        { name: 'secondary-500', value: '#525252', description: 'Muted gray' },
        { name: 'secondary-600', value: '#737373' },
        { name: 'secondary-700', value: '#a3a3a3' },
        { name: 'secondary-800', value: '#d4d4d4' },
        { name: 'secondary-900', value: '#e5e5e5' },
      ],
      neutral: defaultLightTheme.tokens.colors.neutral,
      semantic: defaultLightTheme.tokens.colors.semantic,
    },
    typography: [
      { name: 'heading-xl', fontFamily: 'Inter', fontSize: '3rem', fontWeight: '300', lineHeight: '1.1' },
      { name: 'heading-lg', fontFamily: 'Inter', fontSize: '2.25rem', fontWeight: '300', lineHeight: '1.2' },
      { name: 'heading-md', fontFamily: 'Inter', fontSize: '1.5rem', fontWeight: '400', lineHeight: '1.3' },
      { name: 'heading-sm', fontFamily: 'Inter', fontSize: '1.25rem', fontWeight: '400', lineHeight: '1.4' },
      { name: 'body-lg', fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: '300', lineHeight: '1.7' },
      { name: 'body-md', fontFamily: 'Inter', fontSize: '1rem', fontWeight: '300', lineHeight: '1.7' },
      { name: 'body-sm', fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: '300', lineHeight: '1.6' },
      { name: 'caption', fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: '400', lineHeight: '1.5' },
    ],
    spacing: [
      { name: 'xs', value: '0.5rem' },
      { name: 'sm', value: '1rem' },
      { name: 'md', value: '2rem' },
      { name: 'lg', value: '3rem' },
      { name: 'xl', value: '4rem' },
      { name: '2xl', value: '6rem' },
      { name: '3xl', value: '8rem' },
      { name: '4xl', value: '12rem' },
    ],
    shadows: [
      { name: 'sm', value: 'none' },
      { name: 'md', value: '0 1px 3px rgb(0 0 0 / 0.05)' },
      { name: 'lg', value: '0 2px 6px rgb(0 0 0 / 0.05)' },
      { name: 'xl', value: '0 4px 12px rgb(0 0 0 / 0.05)' },
      { name: '2xl', value: '0 8px 24px rgb(0 0 0 / 0.05)' },
    ],
    borderRadius: [
      { name: 'none', value: '0' },
      { name: 'sm', value: '0.125rem' },
      { name: 'md', value: '0.25rem' },
      { name: 'lg', value: '0.375rem' },
      { name: 'xl', value: '0.5rem' },
      { name: '2xl', value: '0.75rem' },
      { name: '3xl', value: '1rem' },
      { name: 'full', value: '9999px' },
    ],
    breakpoints: defaultBreakpoints,
  },
}

// Corporate Theme - Professional blue tones
const corporateTheme: Theme = {
  id: 'corporate',
  name: 'Corporate',
  description: 'Professional and trustworthy',
  tokens: {
    colors: {
      primary: [
        { name: 'primary-50', value: '#eff6ff' },
        { name: 'primary-100', value: '#dbeafe' },
        { name: 'primary-200', value: '#bfdbfe' },
        { name: 'primary-300', value: '#93c5fd' },
        { name: 'primary-400', value: '#60a5fa' },
        { name: 'primary-500', value: '#2563eb', description: 'Corporate blue' },
        { name: 'primary-600', value: '#1d4ed8' },
        { name: 'primary-700', value: '#1e40af' },
        { name: 'primary-800', value: '#1e3a8a' },
        { name: 'primary-900', value: '#172554' },
      ],
      secondary: [
        { name: 'secondary-50', value: '#f0fdf4' },
        { name: 'secondary-100', value: '#dcfce7' },
        { name: 'secondary-200', value: '#bbf7d0' },
        { name: 'secondary-300', value: '#86efac' },
        { name: 'secondary-400', value: '#4ade80' },
        { name: 'secondary-500', value: '#16a34a', description: 'Success green' },
        { name: 'secondary-600', value: '#15803d' },
        { name: 'secondary-700', value: '#166534' },
        { name: 'secondary-800', value: '#14532d' },
        { name: 'secondary-900', value: '#052e16' },
      ],
      neutral: [
        { name: 'white', value: '#ffffff' },
        { name: 'gray-50', value: '#f8fafc' },
        { name: 'gray-100', value: '#f1f5f9' },
        { name: 'gray-200', value: '#e2e8f0' },
        { name: 'gray-300', value: '#cbd5e1' },
        { name: 'gray-400', value: '#94a3b8' },
        { name: 'gray-500', value: '#64748b' },
        { name: 'gray-600', value: '#475569' },
        { name: 'gray-700', value: '#334155' },
        { name: 'gray-800', value: '#1e293b' },
        { name: 'gray-900', value: '#0f172a' },
        { name: 'black', value: '#020617' },
      ],
      semantic: [
        { name: 'success', value: '#16a34a', description: 'Success states' },
        { name: 'warning', value: '#ca8a04', description: 'Warning states' },
        { name: 'error', value: '#dc2626', description: 'Error states' },
        { name: 'info', value: '#2563eb', description: 'Info states' },
      ],
    },
    typography: [
      { name: 'heading-xl', fontFamily: 'system-ui', fontSize: '3rem', fontWeight: '700', lineHeight: '1.1' },
      { name: 'heading-lg', fontFamily: 'system-ui', fontSize: '2.25rem', fontWeight: '700', lineHeight: '1.2' },
      { name: 'heading-md', fontFamily: 'system-ui', fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.3' },
      { name: 'heading-sm', fontFamily: 'system-ui', fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.4' },
      { name: 'body-lg', fontFamily: 'system-ui', fontSize: '1.125rem', fontWeight: '400', lineHeight: '1.6' },
      { name: 'body-md', fontFamily: 'system-ui', fontSize: '1rem', fontWeight: '400', lineHeight: '1.6' },
      { name: 'body-sm', fontFamily: 'system-ui', fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.5' },
      { name: 'caption', fontFamily: 'system-ui', fontSize: '0.75rem', fontWeight: '500', lineHeight: '1.4' },
    ],
    spacing: defaultLightTheme.tokens.spacing,
    shadows: defaultLightTheme.tokens.shadows,
    borderRadius: [
      { name: 'none', value: '0' },
      { name: 'sm', value: '0.125rem' },
      { name: 'md', value: '0.25rem' },
      { name: 'lg', value: '0.375rem' },
      { name: 'xl', value: '0.5rem' },
      { name: '2xl', value: '0.625rem' },
      { name: '3xl', value: '0.75rem' },
      { name: 'full', value: '9999px' },
    ],
    breakpoints: defaultBreakpoints,
  },
}

// Creative Theme - Bold and playful
const creativeTheme: Theme = {
  id: 'creative',
  name: 'Creative',
  description: 'Bold, playful, and expressive',
  tokens: {
    colors: {
      primary: [
        { name: 'primary-50', value: '#fdf4ff' },
        { name: 'primary-100', value: '#fae8ff' },
        { name: 'primary-200', value: '#f5d0fe' },
        { name: 'primary-300', value: '#f0abfc' },
        { name: 'primary-400', value: '#e879f9' },
        { name: 'primary-500', value: '#d946ef', description: 'Vibrant fuchsia' },
        { name: 'primary-600', value: '#c026d3' },
        { name: 'primary-700', value: '#a21caf' },
        { name: 'primary-800', value: '#86198f' },
        { name: 'primary-900', value: '#701a75' },
      ],
      secondary: [
        { name: 'secondary-50', value: '#fff7ed' },
        { name: 'secondary-100', value: '#ffedd5' },
        { name: 'secondary-200', value: '#fed7aa' },
        { name: 'secondary-300', value: '#fdba74' },
        { name: 'secondary-400', value: '#fb923c' },
        { name: 'secondary-500', value: '#f97316', description: 'Energetic orange' },
        { name: 'secondary-600', value: '#ea580c' },
        { name: 'secondary-700', value: '#c2410c' },
        { name: 'secondary-800', value: '#9a3412' },
        { name: 'secondary-900', value: '#7c2d12' },
      ],
      neutral: defaultLightTheme.tokens.colors.neutral,
      semantic: [
        { name: 'success', value: '#22c55e', description: 'Success states' },
        { name: 'warning', value: '#eab308', description: 'Warning states' },
        { name: 'error', value: '#f43f5e', description: 'Error states' },
        { name: 'info', value: '#06b6d4', description: 'Info states' },
      ],
    },
    typography: [
      { name: 'heading-xl', fontFamily: 'Poppins', fontSize: '4rem', fontWeight: '800', lineHeight: '1.0' },
      { name: 'heading-lg', fontFamily: 'Poppins', fontSize: '3rem', fontWeight: '700', lineHeight: '1.1' },
      { name: 'heading-md', fontFamily: 'Poppins', fontSize: '2rem', fontWeight: '600', lineHeight: '1.2' },
      { name: 'heading-sm', fontFamily: 'Poppins', fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.3' },
      { name: 'body-lg', fontFamily: 'Inter', fontSize: '1.25rem', fontWeight: '400', lineHeight: '1.6' },
      { name: 'body-md', fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: '400', lineHeight: '1.6' },
      { name: 'body-sm', fontFamily: 'Inter', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5' },
      { name: 'caption', fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.4' },
    ],
    spacing: defaultLightTheme.tokens.spacing,
    shadows: [
      { name: 'sm', value: '0 2px 4px rgb(217 70 239 / 0.1)' },
      { name: 'md', value: '0 6px 12px rgb(217 70 239 / 0.15)' },
      { name: 'lg', value: '0 12px 24px rgb(217 70 239 / 0.2)' },
      { name: 'xl', value: '0 20px 40px rgb(217 70 239 / 0.25)' },
      { name: '2xl', value: '0 32px 64px rgb(217 70 239 / 0.3)' },
    ],
    borderRadius: [
      { name: 'none', value: '0' },
      { name: 'sm', value: '0.5rem' },
      { name: 'md', value: '0.75rem' },
      { name: 'lg', value: '1rem' },
      { name: 'xl', value: '1.5rem' },
      { name: '2xl', value: '2rem' },
      { name: '3xl', value: '3rem' },
      { name: 'full', value: '9999px' },
    ],
    breakpoints: defaultBreakpoints,
  },
}

// Bold Theme - High contrast and impactful
const boldTheme: Theme = {
  id: 'bold',
  name: 'Bold',
  description: 'High contrast and maximum impact',
  tokens: {
    colors: {
      primary: [
        { name: 'primary-50', value: '#fef2f2' },
        { name: 'primary-100', value: '#fee2e2' },
        { name: 'primary-200', value: '#fecaca' },
        { name: 'primary-300', value: '#fca5a5' },
        { name: 'primary-400', value: '#f87171' },
        { name: 'primary-500', value: '#ef4444', description: 'Bold red' },
        { name: 'primary-600', value: '#dc2626' },
        { name: 'primary-700', value: '#b91c1c' },
        { name: 'primary-800', value: '#991b1b' },
        { name: 'primary-900', value: '#7f1d1d' },
      ],
      secondary: [
        { name: 'secondary-50', value: '#fefce8' },
        { name: 'secondary-100', value: '#fef9c3' },
        { name: 'secondary-200', value: '#fef08a' },
        { name: 'secondary-300', value: '#fde047' },
        { name: 'secondary-400', value: '#facc15' },
        { name: 'secondary-500', value: '#eab308', description: 'Bold yellow' },
        { name: 'secondary-600', value: '#ca8a04' },
        { name: 'secondary-700', value: '#a16207' },
        { name: 'secondary-800', value: '#854d0e' },
        { name: 'secondary-900', value: '#713f12' },
      ],
      neutral: [
        { name: 'white', value: '#ffffff' },
        { name: 'gray-50', value: '#fafafa' },
        { name: 'gray-100', value: '#f4f4f5' },
        { name: 'gray-200', value: '#e4e4e7' },
        { name: 'gray-300', value: '#d4d4d8' },
        { name: 'gray-400', value: '#a1a1aa' },
        { name: 'gray-500', value: '#71717a' },
        { name: 'gray-600', value: '#52525b' },
        { name: 'gray-700', value: '#3f3f46' },
        { name: 'gray-800', value: '#27272a' },
        { name: 'gray-900', value: '#18181b' },
        { name: 'black', value: '#09090b' },
      ],
      semantic: [
        { name: 'success', value: '#22c55e', description: 'Success states' },
        { name: 'warning', value: '#f59e0b', description: 'Warning states' },
        { name: 'error', value: '#ef4444', description: 'Error states' },
        { name: 'info', value: '#3b82f6', description: 'Info states' },
      ],
    },
    typography: [
      { name: 'heading-xl', fontFamily: 'Inter', fontSize: '4.5rem', fontWeight: '900', lineHeight: '1.0' },
      { name: 'heading-lg', fontFamily: 'Inter', fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.05' },
      { name: 'heading-md', fontFamily: 'Inter', fontSize: '2.5rem', fontWeight: '700', lineHeight: '1.1' },
      { name: 'heading-sm', fontFamily: 'Inter', fontSize: '1.75rem', fontWeight: '700', lineHeight: '1.2' },
      { name: 'body-lg', fontFamily: 'Inter', fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.5' },
      { name: 'body-md', fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: '500', lineHeight: '1.5' },
      { name: 'body-sm', fontFamily: 'Inter', fontSize: '1rem', fontWeight: '500', lineHeight: '1.5' },
      { name: 'caption', fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.4' },
    ],
    spacing: defaultLightTheme.tokens.spacing,
    shadows: [
      { name: 'sm', value: '0 4px 6px rgb(0 0 0 / 0.15)' },
      { name: 'md', value: '0 8px 15px rgb(0 0 0 / 0.2)' },
      { name: 'lg', value: '0 15px 30px rgb(0 0 0 / 0.25)' },
      { name: 'xl', value: '0 25px 50px rgb(0 0 0 / 0.3)' },
      { name: '2xl', value: '0 35px 70px rgb(0 0 0 / 0.35)' },
    ],
    borderRadius: [
      { name: 'none', value: '0' },
      { name: 'sm', value: '0' },
      { name: 'md', value: '0' },
      { name: 'lg', value: '0.25rem' },
      { name: 'xl', value: '0.5rem' },
      { name: '2xl', value: '0.75rem' },
      { name: '3xl', value: '1rem' },
      { name: 'full', value: '9999px' },
    ],
    breakpoints: defaultBreakpoints,
  },
}

// Elegant Theme - Sophisticated and refined
const elegantTheme: Theme = {
  id: 'elegant',
  name: 'Elegant',
  description: 'Sophisticated, refined, and luxurious',
  tokens: {
    colors: {
      primary: [
        { name: 'primary-50', value: '#faf5f0' },
        { name: 'primary-100', value: '#f0e6d8' },
        { name: 'primary-200', value: '#e0ccb0' },
        { name: 'primary-300', value: '#c9a87c' },
        { name: 'primary-400', value: '#b8945f' },
        { name: 'primary-500', value: '#a67c4a', description: 'Warm gold' },
        { name: 'primary-600', value: '#8b6640' },
        { name: 'primary-700', value: '#725338' },
        { name: 'primary-800', value: '#5d4430' },
        { name: 'primary-900', value: '#4a3628' },
      ],
      secondary: [
        { name: 'secondary-50', value: '#f5f5f4' },
        { name: 'secondary-100', value: '#e7e5e4' },
        { name: 'secondary-200', value: '#d6d3d1' },
        { name: 'secondary-300', value: '#a8a29e' },
        { name: 'secondary-400', value: '#78716c' },
        { name: 'secondary-500', value: '#57534e', description: 'Warm stone' },
        { name: 'secondary-600', value: '#44403c' },
        { name: 'secondary-700', value: '#292524' },
        { name: 'secondary-800', value: '#1c1917' },
        { name: 'secondary-900', value: '#0c0a09' },
      ],
      neutral: [
        { name: 'white', value: '#fffbf5' },
        { name: 'gray-50', value: '#faf8f5' },
        { name: 'gray-100', value: '#f5f0e8' },
        { name: 'gray-200', value: '#e8e0d5' },
        { name: 'gray-300', value: '#d6cfc2' },
        { name: 'gray-400', value: '#a8a095' },
        { name: 'gray-500', value: '#78716a' },
        { name: 'gray-600', value: '#57524c' },
        { name: 'gray-700', value: '#3d3935' },
        { name: 'gray-800', value: '#262420' },
        { name: 'gray-900', value: '#1a1816' },
        { name: 'black', value: '#0f0d0c' },
      ],
      semantic: [
        { name: 'success', value: '#4d7c0f', description: 'Success states' },
        { name: 'warning', value: '#b45309', description: 'Warning states' },
        { name: 'error', value: '#b91c1c', description: 'Error states' },
        { name: 'info', value: '#1d4ed8', description: 'Info states' },
      ],
    },
    typography: [
      { name: 'heading-xl', fontFamily: 'Playfair Display', fontSize: '3.5rem', fontWeight: '500', lineHeight: '1.1' },
      { name: 'heading-lg', fontFamily: 'Playfair Display', fontSize: '2.5rem', fontWeight: '500', lineHeight: '1.2' },
      { name: 'heading-md', fontFamily: 'Playfair Display', fontSize: '1.875rem', fontWeight: '500', lineHeight: '1.3' },
      { name: 'heading-sm', fontFamily: 'Playfair Display', fontSize: '1.5rem', fontWeight: '500', lineHeight: '1.4' },
      { name: 'body-lg', fontFamily: 'Lato', fontSize: '1.125rem', fontWeight: '300', lineHeight: '1.8' },
      { name: 'body-md', fontFamily: 'Lato', fontSize: '1rem', fontWeight: '300', lineHeight: '1.8' },
      { name: 'body-sm', fontFamily: 'Lato', fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.7' },
      { name: 'caption', fontFamily: 'Lato', fontSize: '0.75rem', fontWeight: '400', lineHeight: '1.5', letterSpacing: '0.05em' },
    ],
    spacing: [
      { name: 'xs', value: '0.375rem' },
      { name: 'sm', value: '0.75rem' },
      { name: 'md', value: '1.25rem' },
      { name: 'lg', value: '2rem' },
      { name: 'xl', value: '2.5rem' },
      { name: '2xl', value: '4rem' },
      { name: '3xl', value: '5rem' },
      { name: '4xl', value: '7rem' },
    ],
    shadows: [
      { name: 'sm', value: '0 1px 2px rgb(166 124 74 / 0.05)' },
      { name: 'md', value: '0 4px 8px rgb(166 124 74 / 0.08)' },
      { name: 'lg', value: '0 8px 16px rgb(166 124 74 / 0.1)' },
      { name: 'xl', value: '0 16px 32px rgb(166 124 74 / 0.12)' },
      { name: '2xl', value: '0 24px 48px rgb(166 124 74 / 0.15)' },
    ],
    borderRadius: [
      { name: 'none', value: '0' },
      { name: 'sm', value: '0.125rem' },
      { name: 'md', value: '0.25rem' },
      { name: 'lg', value: '0.375rem' },
      { name: 'xl', value: '0.5rem' },
      { name: '2xl', value: '0.625rem' },
      { name: '3xl', value: '0.75rem' },
      { name: 'full', value: '9999px' },
    ],
    breakpoints: defaultBreakpoints,
  },
}

// Ocean Theme - Cool blue/teal palette
const oceanTheme: Theme = {
  id: 'ocean',
  name: 'Ocean',
  description: 'Cool and calming ocean-inspired palette',
  tokens: {
    colors: {
      primary: [
        { name: 'primary-50', value: '#ecfeff' },
        { name: 'primary-100', value: '#cffafe' },
        { name: 'primary-200', value: '#a5f3fc' },
        { name: 'primary-300', value: '#67e8f9' },
        { name: 'primary-400', value: '#22d3ee' },
        { name: 'primary-500', value: '#06b6d4', description: 'Cyan blue' },
        { name: 'primary-600', value: '#0891b2' },
        { name: 'primary-700', value: '#0e7490' },
        { name: 'primary-800', value: '#155e75' },
        { name: 'primary-900', value: '#164e63' },
      ],
      secondary: [
        { name: 'secondary-50', value: '#f0fdfa' },
        { name: 'secondary-100', value: '#ccfbf1' },
        { name: 'secondary-200', value: '#99f6e4' },
        { name: 'secondary-300', value: '#5eead4' },
        { name: 'secondary-400', value: '#2dd4bf' },
        { name: 'secondary-500', value: '#14b8a6', description: 'Teal accent' },
        { name: 'secondary-600', value: '#0d9488' },
        { name: 'secondary-700', value: '#0f766e' },
        { name: 'secondary-800', value: '#115e59' },
        { name: 'secondary-900', value: '#134e4a' },
      ],
      neutral: [
        { name: 'white', value: '#f8fdff' },
        { name: 'gray-50', value: '#f0f9ff' },
        { name: 'gray-100', value: '#e0f2fe' },
        { name: 'gray-200', value: '#bae6fd' },
        { name: 'gray-300', value: '#7dd3fc' },
        { name: 'gray-400', value: '#38bdf8' },
        { name: 'gray-500', value: '#64748b' },
        { name: 'gray-600', value: '#475569' },
        { name: 'gray-700', value: '#334155' },
        { name: 'gray-800', value: '#1e293b' },
        { name: 'gray-900', value: '#0f172a' },
        { name: 'black', value: '#020617' },
      ],
      semantic: [
        { name: 'success', value: '#14b8a6', description: 'Success states' },
        { name: 'warning', value: '#f59e0b', description: 'Warning states' },
        { name: 'error', value: '#f43f5e', description: 'Error states' },
        { name: 'info', value: '#06b6d4', description: 'Info states' },
      ],
    },
    typography: defaultLightTheme.tokens.typography,
    spacing: defaultLightTheme.tokens.spacing,
    shadows: [
      { name: 'sm', value: '0 1px 3px rgb(6 182 212 / 0.1)' },
      { name: 'md', value: '0 4px 8px rgb(6 182 212 / 0.15)' },
      { name: 'lg', value: '0 10px 20px rgb(6 182 212 / 0.2)' },
      { name: 'xl', value: '0 20px 40px rgb(6 182 212 / 0.25)' },
      { name: '2xl', value: '0 30px 60px rgb(6 182 212 / 0.3)' },
    ],
    borderRadius: defaultLightTheme.tokens.borderRadius,
    breakpoints: defaultBreakpoints,
  },
}

// Forest Theme - Natural greens and earth tones
const forestTheme: Theme = {
  id: 'forest',
  name: 'Forest',
  description: 'Natural, organic, and earthy',
  tokens: {
    colors: {
      primary: [
        { name: 'primary-50', value: '#f0fdf4' },
        { name: 'primary-100', value: '#dcfce7' },
        { name: 'primary-200', value: '#bbf7d0' },
        { name: 'primary-300', value: '#86efac' },
        { name: 'primary-400', value: '#4ade80' },
        { name: 'primary-500', value: '#22c55e', description: 'Forest green' },
        { name: 'primary-600', value: '#16a34a' },
        { name: 'primary-700', value: '#15803d' },
        { name: 'primary-800', value: '#166534' },
        { name: 'primary-900', value: '#14532d' },
      ],
      secondary: [
        { name: 'secondary-50', value: '#fefce8' },
        { name: 'secondary-100', value: '#fef9c3' },
        { name: 'secondary-200', value: '#fef08a' },
        { name: 'secondary-300', value: '#fde047' },
        { name: 'secondary-400', value: '#facc15' },
        { name: 'secondary-500', value: '#84cc16', description: 'Lime accent' },
        { name: 'secondary-600', value: '#65a30d' },
        { name: 'secondary-700', value: '#4d7c0f' },
        { name: 'secondary-800', value: '#3f6212' },
        { name: 'secondary-900', value: '#365314' },
      ],
      neutral: [
        { name: 'white', value: '#fafdf7' },
        { name: 'gray-50', value: '#f7faf4' },
        { name: 'gray-100', value: '#ecf4e3' },
        { name: 'gray-200', value: '#d8e8c8' },
        { name: 'gray-300', value: '#bcd9a2' },
        { name: 'gray-400', value: '#8cb86b' },
        { name: 'gray-500', value: '#5c7f45' },
        { name: 'gray-600', value: '#486535' },
        { name: 'gray-700', value: '#374d28' },
        { name: 'gray-800', value: '#273520' },
        { name: 'gray-900', value: '#1a2414' },
        { name: 'black', value: '#0d1208' },
      ],
      semantic: [
        { name: 'success', value: '#22c55e', description: 'Success states' },
        { name: 'warning', value: '#ca8a04', description: 'Warning states' },
        { name: 'error', value: '#dc2626', description: 'Error states' },
        { name: 'info', value: '#0ea5e9', description: 'Info states' },
      ],
    },
    typography: defaultLightTheme.tokens.typography,
    spacing: defaultLightTheme.tokens.spacing,
    shadows: [
      { name: 'sm', value: '0 1px 3px rgb(34 197 94 / 0.1)' },
      { name: 'md', value: '0 4px 8px rgb(34 197 94 / 0.15)' },
      { name: 'lg', value: '0 10px 20px rgb(34 197 94 / 0.2)' },
      { name: 'xl', value: '0 20px 40px rgb(34 197 94 / 0.25)' },
      { name: '2xl', value: '0 30px 60px rgb(34 197 94 / 0.3)' },
    ],
    borderRadius: defaultLightTheme.tokens.borderRadius,
    breakpoints: defaultBreakpoints,
  },
}

// Sunset Theme - Warm oranges and pinks
const sunsetTheme: Theme = {
  id: 'sunset',
  name: 'Sunset',
  description: 'Warm, inviting sunset colors',
  tokens: {
    colors: {
      primary: [
        { name: 'primary-50', value: '#fff7ed' },
        { name: 'primary-100', value: '#ffedd5' },
        { name: 'primary-200', value: '#fed7aa' },
        { name: 'primary-300', value: '#fdba74' },
        { name: 'primary-400', value: '#fb923c' },
        { name: 'primary-500', value: '#f97316', description: 'Sunset orange' },
        { name: 'primary-600', value: '#ea580c' },
        { name: 'primary-700', value: '#c2410c' },
        { name: 'primary-800', value: '#9a3412' },
        { name: 'primary-900', value: '#7c2d12' },
      ],
      secondary: [
        { name: 'secondary-50', value: '#fdf2f8' },
        { name: 'secondary-100', value: '#fce7f3' },
        { name: 'secondary-200', value: '#fbcfe8' },
        { name: 'secondary-300', value: '#f9a8d4' },
        { name: 'secondary-400', value: '#f472b6' },
        { name: 'secondary-500', value: '#ec4899', description: 'Pink accent' },
        { name: 'secondary-600', value: '#db2777' },
        { name: 'secondary-700', value: '#be185d' },
        { name: 'secondary-800', value: '#9d174d' },
        { name: 'secondary-900', value: '#831843' },
      ],
      neutral: [
        { name: 'white', value: '#fffaf5' },
        { name: 'gray-50', value: '#fef7f0' },
        { name: 'gray-100', value: '#fdede0' },
        { name: 'gray-200', value: '#fad8c0' },
        { name: 'gray-300', value: '#f5bc96' },
        { name: 'gray-400', value: '#e89865' },
        { name: 'gray-500', value: '#c47545' },
        { name: 'gray-600', value: '#9a5835' },
        { name: 'gray-700', value: '#724228' },
        { name: 'gray-800', value: '#4d2e1d' },
        { name: 'gray-900', value: '#2e1c12' },
        { name: 'black', value: '#1a100a' },
      ],
      semantic: [
        { name: 'success', value: '#22c55e', description: 'Success states' },
        { name: 'warning', value: '#f97316', description: 'Warning states' },
        { name: 'error', value: '#ef4444', description: 'Error states' },
        { name: 'info', value: '#3b82f6', description: 'Info states' },
      ],
    },
    typography: defaultLightTheme.tokens.typography,
    spacing: defaultLightTheme.tokens.spacing,
    shadows: [
      { name: 'sm', value: '0 1px 3px rgb(249 115 22 / 0.15)' },
      { name: 'md', value: '0 4px 8px rgb(249 115 22 / 0.2)' },
      { name: 'lg', value: '0 10px 20px rgb(249 115 22 / 0.25)' },
      { name: 'xl', value: '0 20px 40px rgb(249 115 22 / 0.3)' },
      { name: '2xl', value: '0 30px 60px rgb(249 115 22 / 0.35)' },
    ],
    borderRadius: defaultLightTheme.tokens.borderRadius,
    breakpoints: defaultBreakpoints,
  },
}

interface ThemeStore {
  themes: Theme[]
  activeThemeId: string

  // Actions
  setActiveTheme: (id: string) => void
  addTheme: (theme: Theme) => void
  updateTheme: (id: string, updates: Partial<Theme>) => void
  deleteTheme: (id: string) => void
  duplicateTheme: (id: string) => void
  updateToken: (themeId: string, category: string, tokenName: string, value: string) => void

  // Getters
  getActiveTheme: () => Theme
  getTokenValue: (tokenPath: string) => string | undefined
  generateCSS: () => string
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      themes: [
        defaultLightTheme,
        defaultDarkTheme,
        minimalTheme,
        corporateTheme,
        creativeTheme,
        boldTheme,
        elegantTheme,
        oceanTheme,
        forestTheme,
        sunsetTheme,
        neonTheme,
      ],
      activeThemeId: 'light',

      setActiveTheme: (id) => set({ activeThemeId: id }),

      addTheme: (theme) => set((state) => ({
        themes: [...state.themes, theme]
      })),

      updateTheme: (id, updates) => set((state) => ({
        themes: state.themes.map(t =>
          t.id === id ? { ...t, ...updates } : t
        )
      })),

      deleteTheme: (id) => set((state) => ({
        themes: state.themes.filter(t => t.id !== id),
        activeThemeId: state.activeThemeId === id ? 'light' : state.activeThemeId
      })),

      duplicateTheme: (id) => {
        const theme = get().themes.find(t => t.id === id)
        if (!theme) return

        const newTheme: Theme = {
          ...theme,
          id: `${theme.id}-copy-${Date.now()}`,
          name: `${theme.name} Copy`,
          isDefault: false,
        }
        set((state) => ({ themes: [...state.themes, newTheme] }))
      },

      updateToken: (themeId, category, tokenName, value) => {
        set((state) => ({
          themes: state.themes.map(theme => {
            if (theme.id !== themeId) return theme

            const newTokens = { ...theme.tokens }

            if (category === 'colors') {
              // Handle nested color categories
              for (const colorCat of ['primary', 'secondary', 'neutral', 'semantic'] as const) {
                const idx = newTokens.colors[colorCat].findIndex(c => c.name === tokenName)
                if (idx !== -1) {
                  newTokens.colors[colorCat][idx] = {
                    ...newTokens.colors[colorCat][idx],
                    value
                  }
                  break
                }
              }
            } else if (category in newTokens) {
              const arr = newTokens[category as keyof typeof newTokens] as any[]
              const idx = arr.findIndex((t: any) => t.name === tokenName)
              if (idx !== -1) {
                arr[idx] = { ...arr[idx], value }
              }
            }

            return { ...theme, tokens: newTokens }
          })
        }))
      },

      getActiveTheme: () => {
        const state = get()
        return state.themes.find(t => t.id === state.activeThemeId) || defaultLightTheme
      },

      getTokenValue: (tokenPath) => {
        const theme = get().getActiveTheme()
        const [category, name] = tokenPath.split('.')

        if (category === 'colors') {
          for (const colorCat of ['primary', 'secondary', 'neutral', 'semantic'] as const) {
            const token = theme.tokens.colors[colorCat].find(c => c.name === name)
            if (token) return token.value
          }
        } else if (category in theme.tokens) {
          const arr = theme.tokens[category as keyof typeof theme.tokens] as any[]
          const token = arr.find((t: any) => t.name === name)
          return token?.value
        }
        return undefined
      },

      generateCSS: () => {
        const theme = get().getActiveTheme()
        let css = ':root {\n'

        // Colors
        for (const colorCat of ['primary', 'secondary', 'neutral', 'semantic'] as const) {
          for (const token of theme.tokens.colors[colorCat]) {
            css += `  --${token.name}: ${token.value};\n`
          }
        }

        // Typography
        for (const token of theme.tokens.typography) {
          css += `  --font-${token.name}: ${token.fontSize};\n`
          css += `  --font-${token.name}-family: ${token.fontFamily};\n`
          css += `  --font-${token.name}-weight: ${token.fontWeight};\n`
          css += `  --font-${token.name}-line-height: ${token.lineHeight};\n`
        }

        // Spacing
        for (const token of theme.tokens.spacing) {
          css += `  --spacing-${token.name}: ${token.value};\n`
        }

        // Shadows
        for (const token of theme.tokens.shadows) {
          css += `  --shadow-${token.name}: ${token.value};\n`
        }

        // Border radius
        for (const token of theme.tokens.borderRadius) {
          css += `  --radius-${token.name}: ${token.value};\n`
        }

        // Breakpoints
        for (const token of theme.tokens.breakpoints) {
          css += `  --breakpoint-${token.name}: ${token.value};\n`
        }

        css += '}\n'
        return css
      },
    }),
    {
      name: 'forma-themes',
    }
  )
)
