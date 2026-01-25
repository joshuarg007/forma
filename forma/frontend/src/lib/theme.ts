/**
 * Centralized Theme Configuration
 *
 * Edit colors here to update the entire site simultaneously.
 * All pages import from this file for consistent styling.
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const colors = {
  // Primary accent color (used for buttons, links, highlights)
  primary: 'violet',

  // Category colors for feature sections
  categories: {
    ai: 'violet',
    visual: 'sky',
    design: 'emerald',
    collaboration: 'amber',
    export: 'pink',
  },
} as const

// =============================================================================
// PAGE STYLES
// =============================================================================

export const pageStyles = {
  // Main page background
  background: 'bg-gradient-to-b from-zinc-950 via-zinc-900 to-black',

  // Navigation
  nav: {
    wrapper: 'fixed top-0 w-full z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl',
    link: 'text-white/70 hover:text-white transition',
    linkActive: 'text-white font-medium',
    button: 'px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-medium transition',
  },

  // Hero sections
  hero: {
    wrapper: 'pt-32 pb-20 px-6',
    title: 'text-4xl md:text-6xl font-bold text-white mb-6',
    titleGradient: 'bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent',
    subtitle: 'text-xl text-white/70',
  },

  // Section styling
  section: {
    wrapper: 'py-20 px-6',
    wrapperAlt: 'py-20 px-6 bg-white/[0.02]',
    title: 'text-3xl md:text-4xl font-bold text-white mb-4',
    subtitle: 'text-white/60',
  },

  // Cards
  card: {
    base: 'rounded-2xl border border-white/10 hover:border-white/20 transition',
    dark: 'bg-zinc-900/50',
    glass: 'bg-white/5 backdrop-blur-sm',
  },

  // CTA sections
  cta: {
    wrapper: 'p-12 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 text-center',
    title: 'text-3xl md:text-4xl font-bold text-white mb-4',
    subtitle: 'text-xl text-white/60 mb-8',
    buttonPrimary: 'group flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-zinc-900 font-semibold hover:bg-white/90 transition',
    buttonSecondary: 'px-8 py-4 rounded-xl border border-white/20 text-white font-medium hover:border-white/40 transition',
  },

  // Footer
  footer: {
    wrapper: 'border-t border-white/10 py-12 px-6',
    heading: 'font-semibold text-white mb-4',
    link: 'text-white/60 hover:text-white transition',
    copyright: 'text-sm text-white/40',
  },
} as const

// =============================================================================
// COMPONENT STYLES
// =============================================================================

export const componentStyles = {
  // Icon containers
  icon: {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-lg',
    lg: 'w-12 h-12 rounded-xl',
  },

  // Badges/pills
  badge: {
    base: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
    subtle: 'bg-white/10 border border-white/10',
  },

  // Text colors
  text: {
    primary: 'text-white',
    secondary: 'text-white/70',
    muted: 'text-white/60',
    subtle: 'text-white/40',
  },
} as const

// =============================================================================
// FEATURE CATEGORY STYLES
// =============================================================================

type CategoryKey = keyof typeof colors.categories

export const getCategoryStyles = (category: CategoryKey) => {
  const color = colors.categories[category]

  return {
    // Main frame (darker, more prominent)
    frame: {
      background: `bg-${color}-950/40`,
      border: `border-${color}-400/40`,
      borderHover: `hover:border-${color}-400/60`,
    },
    // Cards (lighter, complementary)
    card: {
      background: `bg-${color}-900/20`,
      border: `border-${color}-400/25`,
      borderHover: `hover:border-${color}-400/45`,
    },
    // Icons
    icon: {
      background: `bg-${color}-400/15`,
      color: `text-${color}-300`,
    },
    // Text
    text: {
      heading: `text-${color}-300`,
      pill: `bg-${color}-400/10 text-${color}-200`,
    },
    // Gradient for titles
    gradient: `from-${color}-400 to-${color}-300`,
  }
}

// Pre-computed category styles for direct use
export const categoryStyles = {
  ai: {
    frame: 'bg-emerald-950/50 border-2 border-emerald-400/50',
    card: 'bg-emerald-900/30 border border-emerald-400/40 hover:border-emerald-400/60',
    iconBg: 'bg-emerald-400/20',
    iconColor: 'text-emerald-300',
    pill: 'bg-emerald-400/15 text-emerald-200',
    gradient: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent',
  },
  visual: {
    frame: 'bg-violet-950/50 border-2 border-violet-400/60',
    card: 'bg-violet-900/30 border border-violet-400/40 hover:border-violet-400/60',
    iconBg: 'bg-violet-400/20',
    iconColor: 'text-violet-300',
    pill: 'bg-violet-400/15 text-violet-200',
    gradient: 'bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent',
  },
  design: {
    frame: 'bg-amber-950/50 border-2 border-amber-400/60',
    card: 'bg-amber-900/30 border border-amber-400/40 hover:border-amber-400/60',
    iconBg: 'bg-amber-400/20',
    iconColor: 'text-amber-300',
    pill: 'bg-amber-400/15 text-amber-200',
    gradient: 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent',
  },
  collaboration: {
    frame: 'bg-teal-950/50 border-2 border-teal-400/60',
    card: 'bg-teal-900/30 border border-teal-400/40 hover:border-teal-400/60',
    iconBg: 'bg-teal-400/20',
    iconColor: 'text-teal-300',
    pill: 'bg-teal-400/15 text-teal-200',
    gradient: 'bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent',
  },
  export: {
    frame: 'bg-pink-900/40 border-2 border-pink-400/60',
    card: 'bg-pink-900/25 border border-pink-400/45 hover:border-pink-400/65',
    iconBg: 'bg-pink-400/25',
    iconColor: 'text-pink-300',
    pill: 'bg-pink-400/15 text-pink-200',
    gradient: 'bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent',
  },
} as const

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Combine multiple class strings
 */
export const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Get accent color class
 */
export const accentColor = (shade: number = 400) => `text-${colors.primary}-${shade}`

/**
 * Get accent background class
 */
export const accentBg = (shade: number = 500, opacity?: number) =>
  opacity ? `bg-${colors.primary}-${shade}/${opacity}` : `bg-${colors.primary}-${shade}`
