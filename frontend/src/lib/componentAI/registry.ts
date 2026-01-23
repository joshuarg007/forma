// Component Registry - Metadata and UI Patterns

import { ComponentType, ComponentMeta } from './types'

// Component metadata for display
export const COMPONENT_REGISTRY: Record<ComponentType, ComponentMeta> = {
  // Layout containers
  'grid-2col': { id: 'grid-2col', name: '2 Column Grid', icon: '▤', category: 'layout' },
  'grid-3col': { id: 'grid-3col', name: '3 Column Grid', icon: '▦', category: 'layout' },
  'grid-4col': { id: 'grid-4col', name: '4 Column Grid', icon: '▩', category: 'layout' },
  'grid-sidebar': { id: 'grid-sidebar', name: 'Sidebar Layout', icon: '◫', category: 'layout' },
  'section': { id: 'section', name: 'Section', icon: '▭', category: 'layout' },
  'container': { id: 'container', name: 'Container', icon: '☐', category: 'layout' },
  'flexbox': { id: 'flexbox', name: 'Flexbox', icon: '⋯', category: 'layout' },
  'flex-row': { id: 'flex-row', name: 'Flex Row', icon: '↔', category: 'layout' },
  'flex-col': { id: 'flex-col', name: 'Flex Column', icon: '↕', category: 'layout' },

  // Content components
  'card-basic': { id: 'card-basic', name: 'Card', icon: '🃏', category: 'content' },
  'card-image': { id: 'card-image', name: 'Image Card', icon: '🖼️', category: 'content' },
  'card-pricing': { id: 'card-pricing', name: 'Pricing Card', icon: '💰', category: 'content' },
  'card-team': { id: 'card-team', name: 'Team Card', icon: '👤', category: 'content' },
  'text': { id: 'text', name: 'Text', icon: '📝', category: 'content' },
  'heading': { id: 'heading', name: 'Heading', icon: '📰', category: 'content' },
  'paragraph': { id: 'paragraph', name: 'Paragraph', icon: '¶', category: 'content' },
  'list': { id: 'list', name: 'List', icon: '📋', category: 'content' },
  'image': { id: 'image', name: 'Image', icon: '🖼️', category: 'content' },
  'video': { id: 'video', name: 'Video', icon: '🎬', category: 'content' },
  'icon': { id: 'icon', name: 'Icon', icon: '⭐', category: 'content' },
  'avatar': { id: 'avatar', name: 'Avatar', icon: '👤', category: 'content' },
  'button': { id: 'button', name: 'Button', icon: '🔘', category: 'content' },
  'button-group': { id: 'button-group', name: 'Button Group', icon: '🔘🔘', category: 'content' },
  'link': { id: 'link', name: 'Link', icon: '🔗', category: 'content' },
  'divider': { id: 'divider', name: 'Divider', icon: '➖', category: 'content' },
  'spacer': { id: 'spacer', name: 'Spacer', icon: '↕️', category: 'content' },

  // Form elements
  'form-contact': { id: 'form-contact', name: 'Contact Form', icon: '📧', category: 'form' },
  'form-newsletter': { id: 'form-newsletter', name: 'Newsletter', icon: '📮', category: 'form' },
  'form-login': { id: 'form-login', name: 'Login Form', icon: '🔐', category: 'form' },
  'input': { id: 'input', name: 'Input', icon: '▭', category: 'form' },
  'textarea': { id: 'textarea', name: 'Textarea', icon: '📝', category: 'form' },
  'select': { id: 'select', name: 'Select', icon: '▼', category: 'form' },
  'checkbox': { id: 'checkbox', name: 'Checkbox', icon: '☑️', category: 'form' },
  'radio': { id: 'radio', name: 'Radio', icon: '◉', category: 'form' },

  // Sections
  'hero-centered': { id: 'hero-centered', name: 'Hero', icon: '🎯', category: 'section' },
  'hero-split': { id: 'hero-split', name: 'Split Hero', icon: '◧', category: 'section' },
  'hero-video': { id: 'hero-video', name: 'Video Hero', icon: '🎬', category: 'section' },
  'section-features': { id: 'section-features', name: 'Features', icon: '✨', category: 'section' },
  'section-pricing': { id: 'section-pricing', name: 'Pricing', icon: '💰', category: 'section' },
  'section-testimonials': { id: 'section-testimonials', name: 'Testimonials', icon: '💬', category: 'section' },
  'section-faq': { id: 'section-faq', name: 'FAQ', icon: '❓', category: 'section' },
  'section-cta': { id: 'section-cta', name: 'CTA', icon: '📢', category: 'section' },
  'section-team': { id: 'section-team', name: 'Team', icon: '👥', category: 'section' },
  'section-stats': { id: 'section-stats', name: 'Stats', icon: '📊', category: 'section' },

  // Navigation
  'navbar': { id: 'navbar', name: 'Navbar', icon: '☰', category: 'navigation' },
  'navbar-vertical': { id: 'navbar-vertical', name: 'Sidebar Nav', icon: '▮', category: 'navigation' },
  'footer': { id: 'footer', name: 'Footer', icon: '▬', category: 'navigation' },
  'breadcrumb': { id: 'breadcrumb', name: 'Breadcrumb', icon: '›', category: 'navigation' },
  'tabs': { id: 'tabs', name: 'Tabs', icon: '▭▭', category: 'navigation' },

  // Data display
  'stats': { id: 'stats', name: 'Stats', icon: '📊', category: 'data' },
  'stat-item': { id: 'stat-item', name: 'Stat Item', icon: '📈', category: 'data' },
  'testimonial': { id: 'testimonial', name: 'Testimonial', icon: '💬', category: 'data' },
  'team-member': { id: 'team-member', name: 'Team Member', icon: '👤', category: 'data' },
  'pricing-card': { id: 'pricing-card', name: 'Pricing Card', icon: '💳', category: 'data' },
  'feature-card': { id: 'feature-card', name: 'Feature Card', icon: '✨', category: 'data' },
  'logo': { id: 'logo', name: 'Logo', icon: '🏷️', category: 'data' },
}

// UI Patterns - What typically goes where
// These are used to generate training data and as fallback rules

export interface UIPattern {
  name: string
  parentTypes: ComponentType[]
  likelyChildren: ComponentType[]
  weight: number // How common this pattern is (1-10)
}

export const UI_PATTERNS: UIPattern[] = [
  // Grid patterns
  {
    name: 'Feature cards in grid',
    parentTypes: ['grid-3col', 'grid-4col'],
    likelyChildren: ['card-basic', 'card-image', 'feature-card'],
    weight: 10,
  },
  {
    name: 'Stats in grid',
    parentTypes: ['grid-3col', 'grid-4col'],
    likelyChildren: ['stat-item', 'stats'],
    weight: 8,
  },
  {
    name: 'Team members in grid',
    parentTypes: ['grid-3col', 'grid-4col'],
    likelyChildren: ['team-member', 'card-team', 'avatar'],
    weight: 7,
  },
  {
    name: 'Pricing cards in grid',
    parentTypes: ['grid-3col'],
    likelyChildren: ['pricing-card', 'card-pricing'],
    weight: 9,
  },
  {
    name: 'Testimonials in grid',
    parentTypes: ['grid-2col', 'grid-3col'],
    likelyChildren: ['testimonial', 'card-basic'],
    weight: 7,
  },
  {
    name: 'Logo cloud',
    parentTypes: ['grid-4col', 'flex-row'],
    likelyChildren: ['logo', 'image'],
    weight: 6,
  },
  {
    name: 'Two column content',
    parentTypes: ['grid-2col'],
    likelyChildren: ['text', 'image', 'card-basic', 'form-contact'],
    weight: 8,
  },
  {
    name: 'Sidebar layout',
    parentTypes: ['grid-sidebar'],
    likelyChildren: ['navbar-vertical', 'card-basic', 'text'],
    weight: 7,
  },

  // Section patterns
  {
    name: 'Section with content',
    parentTypes: ['section', 'container'],
    likelyChildren: ['heading', 'text', 'grid-3col', 'card-basic'],
    weight: 9,
  },
  {
    name: 'CTA in section',
    parentTypes: ['section'],
    likelyChildren: ['heading', 'text', 'button', 'form-newsletter'],
    weight: 8,
  },

  // Flex patterns
  {
    name: 'Button row',
    parentTypes: ['flex-row', 'flexbox'],
    likelyChildren: ['button', 'button-group'],
    weight: 8,
  },
  {
    name: 'Avatar row',
    parentTypes: ['flex-row'],
    likelyChildren: ['avatar'],
    weight: 6,
  },
  {
    name: 'Icon row',
    parentTypes: ['flex-row'],
    likelyChildren: ['icon', 'logo'],
    weight: 5,
  },
  {
    name: 'Vertical stack',
    parentTypes: ['flex-col'],
    likelyChildren: ['heading', 'text', 'button', 'image'],
    weight: 9,
  },

  // Form patterns
  {
    name: 'Form fields',
    parentTypes: ['flex-col', 'container'],
    likelyChildren: ['input', 'textarea', 'select', 'button'],
    weight: 8,
  },
]

// Page flow patterns - What typically follows what
export interface PageFlowPattern {
  after: ComponentType[]
  suggests: ComponentType[]
  weight: number
}

export const PAGE_FLOW_PATTERNS: PageFlowPattern[] = [
  // After navbar
  { after: ['navbar'], suggests: ['hero-centered', 'hero-split', 'hero-video'], weight: 10 },

  // After hero
  { after: ['hero-centered', 'hero-split', 'hero-video'], suggests: ['section-features', 'section-stats', 'section-testimonials'], weight: 9 },

  // After features
  { after: ['section-features'], suggests: ['section-testimonials', 'section-pricing', 'section-stats'], weight: 8 },

  // After testimonials
  { after: ['section-testimonials'], suggests: ['section-pricing', 'section-cta', 'section-faq'], weight: 8 },

  // After pricing
  { after: ['section-pricing'], suggests: ['section-faq', 'section-cta', 'section-testimonials'], weight: 8 },

  // After FAQ
  { after: ['section-faq'], suggests: ['section-cta', 'footer'], weight: 7 },

  // After CTA
  { after: ['section-cta'], suggests: ['footer', 'section-faq'], weight: 7 },

  // Before footer
  { after: ['section-team', 'section-stats'], suggests: ['section-cta', 'footer'], weight: 6 },
]

// Context-aware suggestions - What makes sense given siblings
export interface SiblingPattern {
  withSiblings: ComponentType[]
  suggests: ComponentType[]
  weight: number
}

export const SIBLING_PATTERNS: SiblingPattern[] = [
  // Matching cards
  { withSiblings: ['card-basic'], suggests: ['card-basic'], weight: 9 },
  { withSiblings: ['card-image'], suggests: ['card-image'], weight: 9 },
  { withSiblings: ['pricing-card'], suggests: ['pricing-card'], weight: 10 },
  { withSiblings: ['team-member'], suggests: ['team-member'], weight: 10 },
  { withSiblings: ['stat-item'], suggests: ['stat-item'], weight: 10 },
  { withSiblings: ['testimonial'], suggests: ['testimonial'], weight: 9 },
  { withSiblings: ['logo'], suggests: ['logo', 'image'], weight: 8 },
  { withSiblings: ['feature-card'], suggests: ['feature-card'], weight: 9 },

  // Complementary items
  { withSiblings: ['image'], suggests: ['text', 'heading'], weight: 7 },
  { withSiblings: ['heading'], suggests: ['text', 'paragraph'], weight: 8 },
  { withSiblings: ['text'], suggests: ['button', 'image'], weight: 6 },
]
