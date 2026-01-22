// Builder Module Exports
// This file exports all builder modules for use in the page builder

// Types
export * from './types'

// Layout Modules
export { Container, Section, Grid, FlexRow, FlexColumn } from './layout'

// Hero Modules
export { HeroSimple, HeroSplit, HeroVideo, HeroAnimated, HeroGradient, HeroParallax } from './hero'

// Navigation Modules
export { NavbarSimple, Sidebar, Tabs, Breadcrumbs, MegaMenu, CommandPalette } from './navigation'

// Content Modules
export { TextBlock, FeatureGrid, CardBasic, TestimonialCard, PricingCard, TeamCard, BlogCard, Timeline, Accordion, Comparison, LogoCloud } from './content'

// Form Modules
export { ContactForm, NewsletterSignup, LoginForm, RegisterForm } from './forms'

// Media Modules
export { ImageModule, VideoEmbed, Gallery, Carousel } from './media'

// CTA Modules
export { CTABanner } from './cta'

// Footer Modules
export { FooterSimple, FooterColumns } from './footer'

// Utility Modules
export { Button, Spacer, Divider } from './utility'

// Data Display Modules
export { StatsCard, DataTable } from './data-display'

// Feedback Modules
export { Alert, Modal, Toast } from './feedback'

// Section Modules
export { PricingSection, TestimonialsSection, TeamSection, FAQSection, FeatureShowcase, StatsSection, LogoCloudSection } from './sections'

// E-commerce Modules
export { ProductCard, CartSummary } from './ecommerce'

// Marketing Modules
export { CountdownTimer, SocialProof, Marquee } from './marketing'

// Templates
export { SaaSLanding, Portfolio, BlogHome } from './templates'

// Blog Modules (Tier 4)
export { BlogList, BlogPost, AuthorBio, RelatedPosts, CategoryFilter, SearchResults } from './blog'

// Portfolio Modules (Tier 4)
export { PortfolioGrid, CaseStudy, ProjectCard, ClientList, SkillsChart } from './portfolio'

// Dashboard Modules (Tier 4)
export { MetricCard, ActivityFeed, ChartWidget, ProgressBar, DataCard } from './dashboard'

// Interactive Modules (Tier 4)
export { Quiz, Poll, Calculator, ProgressTracker, RatingInput, Slider } from './interactive'

// Social Modules (Tier 4)
export { SocialFeed, ShareButtons, CommentSection, FollowCard, UserCard } from './social'

// Module Registry - maps component IDs to their implementations
import { Container, Section, Grid, FlexRow, FlexColumn } from './layout'
import { HeroSimple, HeroSplit, HeroVideo, HeroAnimated, HeroGradient, HeroParallax } from './hero'
import { NavbarSimple, Sidebar, Tabs, Breadcrumbs, MegaMenu, CommandPalette } from './navigation'
import { TextBlock, FeatureGrid, CardBasic, TestimonialCard, PricingCard, TeamCard, BlogCard, Timeline, Accordion, Comparison, LogoCloud } from './content'
import { ContactForm, NewsletterSignup, LoginForm, RegisterForm } from './forms'
import { ImageModule, VideoEmbed, Gallery, Carousel } from './media'
import { CTABanner } from './cta'
import { FooterSimple, FooterColumns } from './footer'
import { Button, Spacer, Divider } from './utility'
import { StatsCard, DataTable } from './data-display'
import { Alert, Modal, Toast } from './feedback'
import { PricingSection, TestimonialsSection, TeamSection, FAQSection, FeatureShowcase, StatsSection, LogoCloudSection } from './sections'
import { ProductCard, CartSummary } from './ecommerce'
import { CountdownTimer, SocialProof, Marquee } from './marketing'
import { SaaSLanding, Portfolio, BlogHome } from './templates'

// Blog Tier 4 imports
import { BlogList, BlogPost, AuthorBio, RelatedPosts, CategoryFilter, SearchResults } from './blog'

// Portfolio Tier 4 imports
import { PortfolioGrid, CaseStudy, ProjectCard, ClientList, SkillsChart } from './portfolio'

// Dashboard Tier 4 imports
import { MetricCard, ActivityFeed, ChartWidget, ProgressBar, DataCard } from './dashboard'

// Interactive Tier 4 imports
import { Quiz, Poll, Calculator, ProgressTracker, RatingInput, Slider } from './interactive'

// Social Tier 4 imports
import { SocialFeed, ShareButtons, CommentSection, FollowCard, UserCard } from './social'

export const moduleRegistry = {
  // Layout
  'container': Container,
  'section': Section,
  'grid-2col': Grid,
  'grid-3col': Grid,
  'grid-4col': Grid,
  'flex-row': FlexRow,
  'flex-col': FlexColumn,
  'flexbox': FlexRow,

  // Hero
  'hero-centered': HeroSimple,
  'hero-split': HeroSplit,
  'hero-video': HeroVideo,
  'hero-animated': HeroAnimated,

  // Navigation
  'navbar': NavbarSimple,
  'sidebar': Sidebar,
  'tabs': Tabs,
  'breadcrumbs': Breadcrumbs,

  // Content
  'heading': TextBlock,
  'paragraph': TextBlock,
  'section-features': FeatureGrid,
  'card-basic': CardBasic,
  'card': CardBasic,
  'testimonial-card': TestimonialCard,
  'pricing-card': PricingCard,
  'team-card': TeamCard,
  'blog-card': BlogCard,

  // Forms
  'form-contact': ContactForm,
  'section-newsletter': NewsletterSignup,
  'login-form': LoginForm,
  'register-form': RegisterForm,

  // Media
  'image': ImageModule,
  'video': VideoEmbed,
  'video-embed': VideoEmbed,

  // CTA
  'section-cta': CTABanner,
  'cta-banner': CTABanner,

  // Footer
  'footer': FooterColumns,
  'footer-simple': FooterSimple,

  // Utility
  'button-primary': Button,
  'button-secondary': Button,
  'button-outline': Button,
  'spacer': Spacer,
  'divider': Divider,

  // Data Display
  'stats-card': StatsCard,
  'data-table': DataTable,

  // Feedback
  'alert': Alert,
  'modal': Modal,
  'toast': Toast,

  // Sections
  'pricing-section': PricingSection,
  'testimonials-section': TestimonialsSection,
  'team-section': TeamSection,
  'faq-section': FAQSection,
  'feature-showcase': FeatureShowcase,
  'stats-section': StatsSection,
  'logo-cloud-section': LogoCloudSection,

  // Hero Tier 3
  'hero-gradient': HeroGradient,
  'hero-parallax': HeroParallax,

  // Navigation Tier 3
  'mega-menu': MegaMenu,
  'command-palette': CommandPalette,

  // Content Tier 3
  'timeline': Timeline,
  'accordion': Accordion,
  'comparison': Comparison,
  'logo-cloud': LogoCloud,

  // Media Tier 3
  'gallery': Gallery,
  'carousel': Carousel,

  // E-commerce
  'product-card': ProductCard,
  'cart-summary': CartSummary,

  // Marketing
  'countdown-timer': CountdownTimer,
  'social-proof': SocialProof,
  'marquee': Marquee,

  // Templates
  'saas-landing-template': SaaSLanding,
  'portfolio-template': Portfolio,
  'blog-home-template': BlogHome,

  // Blog Tier 4
  'blog-list': BlogList,
  'blog-post': BlogPost,
  'author-bio': AuthorBio,
  'related-posts': RelatedPosts,
  'category-filter': CategoryFilter,
  'search-results': SearchResults,

  // Portfolio Tier 4
  'portfolio-grid': PortfolioGrid,
  'case-study': CaseStudy,
  'project-card': ProjectCard,
  'client-list': ClientList,
  'skills-chart': SkillsChart,

  // Dashboard Tier 4
  'metric-card': MetricCard,
  'activity-feed': ActivityFeed,
  'chart-widget': ChartWidget,
  'progress-bar': ProgressBar,
  'data-card': DataCard,

  // Interactive Tier 4
  'quiz': Quiz,
  'poll': Poll,
  'calculator': Calculator,
  'progress-tracker': ProgressTracker,
  'rating-input': RatingInput,
  'slider': Slider,

  // Social Tier 4
  'social-feed': SocialFeed,
  'share-buttons': ShareButtons,
  'comment-section': CommentSection,
  'follow-card': FollowCard,
  'user-card': UserCard,
} as const

export type ModuleType = keyof typeof moduleRegistry

// Helper to get module by ID
export function getModule(id: string) {
  return moduleRegistry[id as ModuleType] || null
}

// Get all module configs
export function getAllModuleConfigs() {
  const configs = []
  const seen = new Set()

  for (const [id, Module] of Object.entries(moduleRegistry)) {
    if (Module.config && !seen.has(Module.config.id)) {
      configs.push(Module.config)
      seen.add(Module.config.id)
    }
  }

  return configs
}

// Get modules by category
export function getModulesByCategory(category: string) {
  return getAllModuleConfigs().filter((config) => config.category === category)
}

// Get all categories
export function getAllCategories() {
  const categories = new Set<string>()
  for (const config of getAllModuleConfigs()) {
    categories.add(config.category)
  }
  return Array.from(categories)
}
