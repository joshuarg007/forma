import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    // Gradient text colors - ensure these aren't purged
    'from-violet-300', 'from-violet-400', 'via-violet-300', 'to-violet-300',
    'from-fuchsia-300', 'from-fuchsia-400', 'via-fuchsia-300', 'to-fuchsia-300',
    'from-pink-300', 'from-pink-400', 'via-pink-300', 'to-pink-300',
    'from-sky-300', 'from-sky-400', 'via-sky-300', 'to-sky-300',
    'from-cyan-300', 'from-cyan-400', 'via-cyan-300', 'to-cyan-300',
    'from-teal-300', 'from-teal-400', 'via-teal-300', 'to-teal-300',
    'from-emerald-300', 'from-emerald-400', 'via-emerald-300', 'to-emerald-300',
    'from-amber-300', 'from-amber-400', 'via-amber-300', 'to-amber-300',
    'from-orange-300', 'from-orange-400', 'via-orange-300', 'to-orange-300',
    'from-yellow-300', 'from-yellow-400', 'via-yellow-300', 'to-yellow-300',
    'from-rose-300', 'from-rose-400', 'via-rose-300', 'to-rose-300',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        forma: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
