# Forma Builder Frontend

Visual page builder with 54 pre-built modules for creating React websites.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Animation**: Framer Motion
- **Drag & Drop**: dnd-kit

## Quick Start

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # Type check + production build
```

## Module System

All builder modules are in `src/components/builder/`. Each module:
- Exports a React component
- Has a static `.config` property with metadata
- Follows the `ModuleProps` interface

### Module Count: 54 Total

| Tier | Count | Categories |
|------|-------|------------|
| Tier 1 | 17 | Layout, Hero, Navigation, Content, Forms, Media, CTA, Footer, Utility |
| Tier 2 | 19 | Data Display, Feedback, Sections |
| Tier 3 | 18 | Advanced Hero, Advanced Nav, Advanced Content, Media, E-commerce, Marketing, Advanced Sections |

## Module Categories

### Layout (5 modules)
- `Container` - Responsive container with max-width
- `Section` - Full-width section wrapper
- `Grid` - CSS Grid with configurable columns
- `FlexRow` - Horizontal flex container
- `FlexColumn` - Vertical flex container

### Hero (6 modules)
- `HeroSimple` - Centered text hero
- `HeroSplit` - Two-column hero with image
- `HeroVideo` - Background video hero
- `HeroAnimated` - Animated particles/gradients
- `HeroGradient` - Animated gradient backgrounds *(Tier 3)*
- `HeroParallax` - Parallax scrolling effect *(Tier 3)*

### Navigation (6 modules)
- `NavbarSimple` - Basic navigation bar
- `Sidebar` - Vertical sidebar navigation
- `Tabs` - Tab navigation component
- `Breadcrumbs` - Breadcrumb trail
- `MegaMenu` - Dropdown mega menu *(Tier 3)*
- `CommandPalette` - Cmd+K style search modal *(Tier 3)*

### Content (11 modules)
- `TextBlock` - Rich text content
- `FeatureGrid` - Feature cards grid
- `CardBasic` - Basic card component
- `TestimonialCard` - Customer testimonial
- `PricingCard` - Pricing tier card
- `TeamCard` - Team member card
- `BlogCard` - Blog post card
- `Timeline` - Chronological events *(Tier 3)*
- `Accordion` - Collapsible content *(Tier 3)*
- `Comparison` - Feature comparison table *(Tier 3)*
- `LogoCloud` - Partner/client logos *(Tier 3)*

### Forms (4 modules)
- `ContactForm` - Contact form
- `NewsletterSignup` - Email signup
- `LoginForm` - Login form
- `RegisterForm` - Registration form

### Media (4 modules)
- `ImageModule` - Responsive image
- `VideoEmbed` - YouTube/Vimeo embed
- `Gallery` - Image gallery with lightbox *(Tier 3)*
- `Carousel` - Image/content slider *(Tier 3)*

### CTA (1 module)
- `CTABanner` - Call-to-action banner

### Footer (2 modules)
- `FooterSimple` - Minimal footer
- `FooterColumns` - Multi-column footer

### Utility (3 modules)
- `Button` - Button variants
- `Spacer` - Vertical spacing
- `Divider` - Horizontal divider

### Data Display (2 modules)
- `StatsCard` - Statistics display
- `DataTable` - Sortable data table

### Feedback (3 modules)
- `Alert` - Alert/notification
- `Modal` - Modal dialog
- `Toast` - Toast notification

### Sections (7 modules)
- `PricingSection` - Full pricing section
- `TestimonialsSection` - Testimonials grid
- `TeamSection` - Team members section
- `FAQSection` - FAQ accordion
- `FeatureShowcase` - Alternating features *(Tier 3)*
- `StatsSection` - Statistics section *(Tier 3)*
- `LogoCloudSection` - Partner logos section *(Tier 3)*

### E-commerce (2 modules) *(Tier 3)*
- `ProductCard` - Product display with variants
- `CartSummary` - Shopping cart summary

### Marketing (3 modules) *(Tier 3)*
- `CountdownTimer` - Sales/event countdown
- `SocialProof` - Visitor counts, activity
- `Marquee` - Scrolling text/logos

## Module Interface

```typescript
interface ModuleProps {
  id?: string
  className?: string
  styles?: React.CSSProperties
}

// Each module has a .config property:
ComponentName.config = {
  id: 'component-id',
  name: 'Display Name',
  category: 'category-name',
  description: 'Brief description',
  defaultProps: { /* default values */ },
  editableFields: [
    { name: 'fieldName', label: 'Label', type: 'text' | 'select' | 'boolean' | 'array' | 'textarea' }
  ]
}
```

## Module Registry

The central registry is in `src/components/builder/index.ts`:

```typescript
import { moduleRegistry, getModule, getAllModuleConfigs, getModulesByCategory } from '@/components/builder'

// Get a specific module by ID
const HeroComponent = getModule('hero-centered')

// Get all module configs for the component library
const allModules = getAllModuleConfigs()

// Get modules by category
const heroModules = getModulesByCategory('hero')
```

## Directory Structure

```
src/components/builder/
├── index.ts              # Main registry + exports
├── types.ts              # ModuleProps interface
│
├── layout/               # Container, Section, Grid, Flex
├── hero/                 # HeroSimple, Split, Video, Animated, Gradient, Parallax
├── navigation/           # Navbar, Sidebar, Tabs, Breadcrumbs, MegaMenu, CommandPalette
├── content/              # TextBlock, Cards, Timeline, Accordion, Comparison, LogoCloud
├── forms/                # ContactForm, NewsletterSignup, LoginForm, RegisterForm
├── media/                # ImageModule, VideoEmbed, Gallery, Carousel
├── cta/                  # CTABanner
├── footer/               # FooterSimple, FooterColumns
├── utility/              # Button, Spacer, Divider
├── data-display/         # StatsCard, DataTable
├── feedback/             # Alert, Modal, Toast
├── sections/             # PricingSection, Testimonials, Team, FAQ, FeatureShowcase, Stats, LogoCloud
├── ecommerce/            # ProductCard, CartSummary
└── marketing/            # CountdownTimer, SocialProof, Marquee
```

## Adding New Modules

1. Create component file in appropriate category folder
2. Implement component with `ModuleProps` interface
3. Add `.config` static property
4. Export from category's `index.ts`
5. Add to main `builder/index.ts` registry

Example:

```typescript
// src/components/builder/content/MyComponent.tsx
'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface MyComponentProps extends ModuleProps {
  title?: string
  variant?: 'default' | 'alt'
}

export default function MyComponent({
  id,
  className,
  styles,
  title = 'Default Title',
  variant = 'default',
}: MyComponentProps) {
  return (
    <div id={id} className={cn('...', className)} style={styles}>
      {title}
    </div>
  )
}

MyComponent.displayName = 'MyComponent'

MyComponent.config = {
  id: 'my-component',
  name: 'My Component',
  category: 'content',
  description: 'A custom component',
  defaultProps: {
    title: 'Default Title',
    variant: 'default',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'alt'] },
  ],
}
```

## Roadmap

### Phase B: Page Templates (Next)
Pre-built page layouts using existing modules:
- Landing page templates
- SaaS templates
- Portfolio templates
- Blog templates
- E-commerce templates

### Phase C: Builder Infrastructure
- Drag-and-drop system
- Module configuration panels
- Live preview
- Export/import JSON

### Phase D: Theme System
- Color scheme presets
- Typography scales
- Spacing/sizing tokens
- Dark mode support

### Phase A: Tier 4 Specialized Modules
- Blog: BlogList, BlogPost, AuthorBio, RelatedPosts
- Portfolio: PortfolioGrid, CaseStudy, ProjectCard
- Dashboard: DashboardCard, ChartWidget, MetricCard
- Interactive: Quiz, Poll, Calculator, ProgressTracker
- Social: SocialFeed, ShareButtons, CommentSection
- Integrations: MapEmbed, CalendarEmbed, ChatWidget

## License

Proprietary - Axion Deep Labs
