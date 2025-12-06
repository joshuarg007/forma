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
}

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
      themes: [defaultLightTheme, defaultDarkTheme, neonTheme],
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

        css += '}\n'
        return css
      },
    }),
    {
      name: 'forma-themes',
    }
  )
)
