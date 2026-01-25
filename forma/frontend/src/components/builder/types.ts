// Builder Module Types
// These types define the props and configuration for all builder modules

export interface ModuleProps {
  id: string
  className?: string
  styles?: React.CSSProperties
  editable?: boolean
  onEdit?: (field: string, value: any) => void
}

export interface ContainerProps extends ModuleProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  centered?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  children?: React.ReactNode
}

export interface SectionProps extends ModuleProps {
  background?: 'white' | 'gray' | 'dark' | 'gradient' | 'transparent'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  children?: React.ReactNode
}

export interface GridProps extends ModuleProps {
  columns?: 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

export interface FlexProps extends ModuleProps {
  direction?: 'row' | 'column'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'center' | 'end' | 'stretch'
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  wrap?: boolean
  children?: React.ReactNode
}

export interface HeroProps extends ModuleProps {
  headline?: string
  subheadline?: string
  ctaText?: string
  ctaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  backgroundImage?: string
  backgroundGradient?: string
  textAlign?: 'left' | 'center' | 'right'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  imageUrl?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
}

export interface NavbarProps extends ModuleProps {
  logo?: string
  logoText?: string
  links?: Array<{ label: string; href: string }>
  ctaText?: string
  ctaLink?: string
  sticky?: boolean
  transparent?: boolean
  theme?: 'light' | 'dark'
}

export interface TextBlockProps extends ModuleProps {
  content?: string
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'lead' | 'small'
  alignment?: 'left' | 'center' | 'right'
  color?: string
}

export interface FeatureGridProps extends ModuleProps {
  title?: string
  subtitle?: string
  features?: Array<{
    icon?: string
    title: string
    description: string
  }>
  columns?: 2 | 3 | 4
}

export interface CardProps extends ModuleProps {
  title?: string
  description?: string
  image?: string
  link?: string
  linkText?: string
  variant?: 'default' | 'bordered' | 'elevated' | 'gradient'
}

export interface ContactFormProps extends ModuleProps {
  title?: string
  subtitle?: string
  fields?: Array<{
    name: string
    label: string
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select'
    required?: boolean
    options?: string[]
  }>
  submitText?: string
  successMessage?: string
}

export interface NewsletterProps extends ModuleProps {
  title?: string
  subtitle?: string
  placeholder?: string
  buttonText?: string
  successMessage?: string
  layout?: 'inline' | 'stacked'
}

export interface ImageProps extends ModuleProps {
  src?: string
  alt?: string
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | 'auto'
  objectFit?: 'cover' | 'contain' | 'fill'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  caption?: string
}

export interface VideoEmbedProps extends ModuleProps {
  url?: string
  provider?: 'youtube' | 'vimeo' | 'custom'
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9'
  poster?: string
}

export interface CTABannerProps extends ModuleProps {
  headline?: string
  subheadline?: string
  ctaText?: string
  ctaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  background?: 'gradient' | 'solid' | 'image'
  backgroundColor?: string
  backgroundImage?: string
  layout?: 'centered' | 'split'
}

export interface FooterProps extends ModuleProps {
  logo?: string
  logoText?: string
  tagline?: string
  copyright?: string
  links?: Array<{
    category: string
    items: Array<{ label: string; href: string }>
  }>
  socialLinks?: Array<{
    platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'github' | 'youtube'
    url: string
  }>
  theme?: 'light' | 'dark'
}

export interface ButtonProps extends ModuleProps {
  text?: string
  href?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  disabled?: boolean
}

export interface SpacerProps extends ModuleProps {
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  responsive?: boolean
}

export interface DividerProps extends ModuleProps {
  variant?: 'solid' | 'dashed' | 'dotted'
  color?: string
  thickness?: 'thin' | 'medium' | 'thick'
  width?: 'full' | 'half' | 'third'
  margin?: 'sm' | 'md' | 'lg'
}

// Module configuration type for registry
export interface ModuleConfig {
  id: string
  name: string
  category: 'layout' | 'hero' | 'navigation' | 'content' | 'forms' | 'media' | 'cta' | 'footer' | 'utility'
  description: string
  defaultProps: Record<string, any>
  editableFields: Array<{
    name: string
    label: string
    type: 'text' | 'textarea' | 'number' | 'select' | 'color' | 'image' | 'url' | 'boolean' | 'array'
    options?: string[]
    defaultValue?: any
  }>
}
