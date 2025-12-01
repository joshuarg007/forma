'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronDown, Plus, Star, Clock, Sparkles, GripVertical,
  Layout, Navigation, FormInput, Table2, AlertCircle, Type, Box,
  Grid3X3, Columns, PanelTop, CreditCard, Menu, Sidebar as SidebarIcon,
  Bookmark, ArrowLeftRight, TextCursor, ListFilter, ToggleLeft, CircleDot,
  MousePointer, ListOrdered, User, Tag, Bell, MessageSquare, Loader,
  Loader2, BarChart3, Code, ExternalLink, Image, Video, Map, Calendar,
  ShoppingCart, CreditCard as PaymentIcon, Lock, Mail, Phone, FileText,
  Download, Upload, Share2, Heart, ThumbsUp, MessageCircle, Send,
  ChevronRight, ChevronLeft, MoreHorizontal, Settings, Filter, X,
  Layers, Palette, Zap, Globe, Database, Server, Cloud, Wifi,
  Smartphone, Monitor, Tablet, Watch, Tv, Speaker, Headphones,
  Camera, Mic, PlayCircle, PauseCircle, SkipForward, SkipBack,
  Volume2, VolumeX, Maximize, Minimize, RotateCcw, RefreshCw,
  ZoomIn, ZoomOut, Move, Crop, Scissors, Copy, Clipboard, Trash2,
  Edit, Eye, EyeOff, Check, X as XIcon, AlertTriangle, Info, HelpCircle,
  Award, Trophy, Gift, Percent, DollarSign, TrendingUp, TrendingDown,
  PieChart, Activity, Target, Flag, Bookmark as BookmarkIcon, Archive,
  Folder, File, FileImage, FileVideo, FileAudio, FileCode, FilePlus,
  Users, UserPlus, UserMinus, UserCheck, Shield, Key, Unlock,
  Home, Building, MapPin, Navigation2, Compass, Sun, Moon, CloudRain,
  Thermometer, Wind, Droplet, Flame, Snowflake, Umbrella
} from 'lucide-react'

interface ComponentItem {
  id: string
  name: string
  icon: React.ReactNode
  description?: string
  tags?: string[]
  popular?: boolean
  new?: boolean
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  items: ComponentItem[]
}

interface ComponentLibraryProps {
  onSelectComponent: (component: ComponentItem) => void
  onDragStart: (e: React.DragEvent, component: ComponentItem) => void
}

export default function ComponentLibrary({ onSelectComponent, onDragStart }: ComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['layout', 'hero'])
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'new'>('all')
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([])

  const componentLibrary: Category[] = [
    {
      id: 'hero',
      name: 'Hero Sections',
      icon: <Sparkles className="w-4 h-4" />,
      items: [
        { id: 'hero-centered', name: 'Centered Hero', icon: <Layout className="w-4 h-4" />, description: 'Centered text with CTA buttons', popular: true },
        { id: 'hero-split', name: 'Split Hero', icon: <Columns className="w-4 h-4" />, description: 'Text on left, image on right', popular: true },
        { id: 'hero-video', name: 'Video Hero', icon: <Video className="w-4 h-4" />, description: 'Full-width video background', new: true },
        { id: 'hero-animated', name: 'Animated Hero', icon: <Zap className="w-4 h-4" />, description: 'With particle effects', new: true },
        { id: 'hero-gradient', name: 'Gradient Hero', icon: <Palette className="w-4 h-4" />, description: 'Beautiful gradient background' },
      ]
    },
    {
      id: 'layout',
      name: 'Layout',
      icon: <Layout className="w-4 h-4" />,
      items: [
        { id: 'container', name: 'Container', icon: <Box className="w-4 h-4" />, description: 'Responsive container wrapper', popular: true },
        { id: 'grid-2col', name: '2 Column Grid', icon: <Grid3X3 className="w-4 h-4" />, description: 'Two equal columns' },
        { id: 'grid-3col', name: '3 Column Grid', icon: <Grid3X3 className="w-4 h-4" />, description: 'Three equal columns' },
        { id: 'grid-4col', name: '4 Column Grid', icon: <Grid3X3 className="w-4 h-4" />, description: 'Four equal columns' },
        { id: 'grid-sidebar', name: 'Sidebar Layout', icon: <SidebarIcon className="w-4 h-4" />, description: 'Main content with sidebar' },
        { id: 'flex-row', name: 'Flex Row', icon: <Columns className="w-4 h-4" />, description: 'Horizontal flex container' },
        { id: 'flex-col', name: 'Flex Column', icon: <Layers className="w-4 h-4" />, description: 'Vertical flex container' },
        { id: 'section', name: 'Section', icon: <PanelTop className="w-4 h-4" />, description: 'Full-width section with padding' },
        { id: 'card', name: 'Card', icon: <CreditCard className="w-4 h-4" />, description: 'Content card with shadow', popular: true },
        { id: 'divider', name: 'Divider', icon: <MoreHorizontal className="w-4 h-4" />, description: 'Horizontal divider line' },
        { id: 'spacer', name: 'Spacer', icon: <Move className="w-4 h-4" />, description: 'Adjustable vertical space' },
      ]
    },
    {
      id: 'navigation',
      name: 'Navigation',
      icon: <Navigation className="w-4 h-4" />,
      items: [
        { id: 'navbar', name: 'Navbar', icon: <Menu className="w-4 h-4" />, description: 'Responsive navigation bar', popular: true },
        { id: 'navbar-transparent', name: 'Transparent Navbar', icon: <Menu className="w-4 h-4" />, description: 'For hero overlays', new: true },
        { id: 'sidebar', name: 'Sidebar', icon: <SidebarIcon className="w-4 h-4" />, description: 'Collapsible sidebar menu' },
        { id: 'tabs', name: 'Tabs', icon: <Bookmark className="w-4 h-4" />, description: 'Tabbed content switcher', popular: true },
        { id: 'tabs-vertical', name: 'Vertical Tabs', icon: <Bookmark className="w-4 h-4" />, description: 'Side-aligned tabs' },
        { id: 'breadcrumbs', name: 'Breadcrumbs', icon: <ChevronRight className="w-4 h-4" />, description: 'Navigation trail' },
        { id: 'pagination', name: 'Pagination', icon: <ArrowLeftRight className="w-4 h-4" />, description: 'Page navigation controls' },
        { id: 'stepper', name: 'Stepper', icon: <ListOrdered className="w-4 h-4" />, description: 'Multi-step progress' },
        { id: 'menu-dropdown', name: 'Dropdown Menu', icon: <ChevronDown className="w-4 h-4" />, description: 'Hoverable dropdown' },
        { id: 'mega-menu', name: 'Mega Menu', icon: <Grid3X3 className="w-4 h-4" />, description: 'Large dropdown with columns', new: true },
      ]
    },
    {
      id: 'forms',
      name: 'Forms & Inputs',
      icon: <FormInput className="w-4 h-4" />,
      items: [
        { id: 'input', name: 'Text Input', icon: <TextCursor className="w-4 h-4" />, description: 'Single line text input', popular: true },
        { id: 'textarea', name: 'Textarea', icon: <FileText className="w-4 h-4" />, description: 'Multi-line text input' },
        { id: 'select', name: 'Select', icon: <ListFilter className="w-4 h-4" />, description: 'Dropdown select box', popular: true },
        { id: 'multi-select', name: 'Multi Select', icon: <ListFilter className="w-4 h-4" />, description: 'Select multiple options' },
        { id: 'checkbox', name: 'Checkbox', icon: <Check className="w-4 h-4" />, description: 'Boolean checkbox input' },
        { id: 'checkbox-group', name: 'Checkbox Group', icon: <Check className="w-4 h-4" />, description: 'Multiple checkboxes' },
        { id: 'radio', name: 'Radio', icon: <CircleDot className="w-4 h-4" />, description: 'Single choice selection' },
        { id: 'radio-group', name: 'Radio Group', icon: <CircleDot className="w-4 h-4" />, description: 'Radio button group' },
        { id: 'toggle', name: 'Toggle Switch', icon: <ToggleLeft className="w-4 h-4" />, description: 'On/off toggle switch' },
        { id: 'slider', name: 'Range Slider', icon: <ArrowLeftRight className="w-4 h-4" />, description: 'Value range selector' },
        { id: 'date-picker', name: 'Date Picker', icon: <Calendar className="w-4 h-4" />, description: 'Date selection calendar', new: true },
        { id: 'time-picker', name: 'Time Picker', icon: <Clock className="w-4 h-4" />, description: 'Time selection input' },
        { id: 'file-upload', name: 'File Upload', icon: <Upload className="w-4 h-4" />, description: 'Drag & drop file upload' },
        { id: 'image-upload', name: 'Image Upload', icon: <Image className="w-4 h-4" />, description: 'Image upload with preview' },
        { id: 'color-picker', name: 'Color Picker', icon: <Palette className="w-4 h-4" />, description: 'Color selection tool' },
        { id: 'search-input', name: 'Search Input', icon: <Search className="w-4 h-4" />, description: 'Search with icon' },
        { id: 'password-input', name: 'Password Input', icon: <Lock className="w-4 h-4" />, description: 'Password with toggle' },
        { id: 'phone-input', name: 'Phone Input', icon: <Phone className="w-4 h-4" />, description: 'Phone number formatter' },
        { id: 'form-contact', name: 'Contact Form', icon: <Mail className="w-4 h-4" />, description: 'Complete contact form', popular: true },
        { id: 'form-login', name: 'Login Form', icon: <Lock className="w-4 h-4" />, description: 'Email & password login', popular: true },
        { id: 'form-register', name: 'Register Form', icon: <UserPlus className="w-4 h-4" />, description: 'User registration form' },
        { id: 'form-checkout', name: 'Checkout Form', icon: <PaymentIcon className="w-4 h-4" />, description: 'Payment checkout form' },
      ]
    },
    {
      id: 'buttons',
      name: 'Buttons & Actions',
      icon: <MousePointer className="w-4 h-4" />,
      items: [
        { id: 'button-primary', name: 'Primary Button', icon: <MousePointer className="w-4 h-4" />, description: 'Main call-to-action', popular: true },
        { id: 'button-secondary', name: 'Secondary Button', icon: <MousePointer className="w-4 h-4" />, description: 'Secondary action' },
        { id: 'button-outline', name: 'Outline Button', icon: <MousePointer className="w-4 h-4" />, description: 'Bordered button style' },
        { id: 'button-ghost', name: 'Ghost Button', icon: <MousePointer className="w-4 h-4" />, description: 'Transparent button' },
        { id: 'button-icon', name: 'Icon Button', icon: <MousePointer className="w-4 h-4" />, description: 'Icon only button' },
        { id: 'button-group', name: 'Button Group', icon: <Layers className="w-4 h-4" />, description: 'Grouped buttons' },
        { id: 'button-loading', name: 'Loading Button', icon: <Loader2 className="w-4 h-4" />, description: 'With loading state' },
        { id: 'fab', name: 'Floating Action', icon: <Plus className="w-4 h-4" />, description: 'Floating action button' },
        { id: 'cta-banner', name: 'CTA Banner', icon: <Zap className="w-4 h-4" />, description: 'Call-to-action banner', popular: true },
      ]
    },
    {
      id: 'data',
      name: 'Data Display',
      icon: <Table2 className="w-4 h-4" />,
      items: [
        { id: 'table', name: 'Data Table', icon: <Table2 className="w-4 h-4" />, description: 'Sortable data table', popular: true },
        { id: 'table-responsive', name: 'Responsive Table', icon: <Table2 className="w-4 h-4" />, description: 'Mobile-friendly table' },
        { id: 'list', name: 'List', icon: <ListOrdered className="w-4 h-4" />, description: 'Vertical list layout' },
        { id: 'list-avatar', name: 'Avatar List', icon: <User className="w-4 h-4" />, description: 'List with avatars' },
        { id: 'grid-gallery', name: 'Image Gallery', icon: <Image className="w-4 h-4" />, description: 'Responsive image grid', popular: true },
        { id: 'masonry', name: 'Masonry Grid', icon: <Grid3X3 className="w-4 h-4" />, description: 'Pinterest-style grid', new: true },
        { id: 'carousel', name: 'Carousel', icon: <ChevronRight className="w-4 h-4" />, description: 'Image/content slider', popular: true },
        { id: 'avatar', name: 'Avatar', icon: <User className="w-4 h-4" />, description: 'User avatar image' },
        { id: 'avatar-group', name: 'Avatar Group', icon: <Users className="w-4 h-4" />, description: 'Stacked avatars' },
        { id: 'badge', name: 'Badge', icon: <Tag className="w-4 h-4" />, description: 'Status badge/tag' },
        { id: 'chip', name: 'Chip', icon: <Tag className="w-4 h-4" />, description: 'Removable chip/tag' },
        { id: 'stat-card', name: 'Stat Card', icon: <BarChart3 className="w-4 h-4" />, description: 'Statistics display', popular: true },
        { id: 'chart-bar', name: 'Bar Chart', icon: <BarChart3 className="w-4 h-4" />, description: 'Bar chart visualization' },
        { id: 'chart-line', name: 'Line Chart', icon: <Activity className="w-4 h-4" />, description: 'Line chart visualization' },
        { id: 'chart-pie', name: 'Pie Chart', icon: <PieChart className="w-4 h-4" />, description: 'Pie chart visualization' },
        { id: 'timeline', name: 'Timeline', icon: <Clock className="w-4 h-4" />, description: 'Vertical timeline' },
        { id: 'tree-view', name: 'Tree View', icon: <Folder className="w-4 h-4" />, description: 'Hierarchical tree' },
      ]
    },
    {
      id: 'feedback',
      name: 'Feedback & Overlays',
      icon: <AlertCircle className="w-4 h-4" />,
      items: [
        { id: 'alert-info', name: 'Info Alert', icon: <Info className="w-4 h-4" />, description: 'Informational message' },
        { id: 'alert-success', name: 'Success Alert', icon: <Check className="w-4 h-4" />, description: 'Success message' },
        { id: 'alert-warning', name: 'Warning Alert', icon: <AlertTriangle className="w-4 h-4" />, description: 'Warning message' },
        { id: 'alert-error', name: 'Error Alert', icon: <XIcon className="w-4 h-4" />, description: 'Error message' },
        { id: 'toast', name: 'Toast', icon: <Bell className="w-4 h-4" />, description: 'Popup notification', popular: true },
        { id: 'modal', name: 'Modal Dialog', icon: <MessageSquare className="w-4 h-4" />, description: 'Popup modal window', popular: true },
        { id: 'modal-confirm', name: 'Confirm Dialog', icon: <HelpCircle className="w-4 h-4" />, description: 'Confirmation modal' },
        { id: 'drawer', name: 'Drawer', icon: <SidebarIcon className="w-4 h-4" />, description: 'Slide-out panel' },
        { id: 'popover', name: 'Popover', icon: <MessageSquare className="w-4 h-4" />, description: 'Contextual popup' },
        { id: 'tooltip', name: 'Tooltip', icon: <MessageSquare className="w-4 h-4" />, description: 'Hover information' },
        { id: 'progress-bar', name: 'Progress Bar', icon: <Loader className="w-4 h-4" />, description: 'Linear progress' },
        { id: 'progress-circle', name: 'Circular Progress', icon: <Loader2 className="w-4 h-4" />, description: 'Circular progress' },
        { id: 'skeleton', name: 'Skeleton Loader', icon: <Loader className="w-4 h-4" />, description: 'Content placeholder' },
        { id: 'spinner', name: 'Spinner', icon: <Loader2 className="w-4 h-4" />, description: 'Loading spinner' },
        { id: 'empty-state', name: 'Empty State', icon: <Folder className="w-4 h-4" />, description: 'No content message' },
      ]
    },
    {
      id: 'content',
      name: 'Content Blocks',
      icon: <FileText className="w-4 h-4" />,
      items: [
        { id: 'heading', name: 'Heading', icon: <Type className="w-4 h-4" />, description: 'H1-H6 headings', popular: true },
        { id: 'paragraph', name: 'Paragraph', icon: <Type className="w-4 h-4" />, description: 'Body text block' },
        { id: 'blockquote', name: 'Blockquote', icon: <MessageSquare className="w-4 h-4" />, description: 'Quote block' },
        { id: 'code-block', name: 'Code Block', icon: <Code className="w-4 h-4" />, description: 'Syntax highlighted code' },
        { id: 'link', name: 'Link', icon: <ExternalLink className="w-4 h-4" />, description: 'Hyperlink text' },
        { id: 'icon', name: 'Icon', icon: <Star className="w-4 h-4" />, description: 'Single icon display' },
        { id: 'image', name: 'Image', icon: <Image className="w-4 h-4" />, description: 'Responsive image', popular: true },
        { id: 'video', name: 'Video', icon: <Video className="w-4 h-4" />, description: 'Video player', popular: true },
        { id: 'video-embed', name: 'Video Embed', icon: <PlayCircle className="w-4 h-4" />, description: 'YouTube/Vimeo embed' },
        { id: 'audio', name: 'Audio Player', icon: <Volume2 className="w-4 h-4" />, description: 'Audio player' },
        { id: 'map', name: 'Map', icon: <Map className="w-4 h-4" />, description: 'Interactive map' },
        { id: 'iframe', name: 'iFrame', icon: <Globe className="w-4 h-4" />, description: 'Embed external content' },
      ]
    },
    {
      id: 'cards',
      name: 'Card Components',
      icon: <CreditCard className="w-4 h-4" />,
      items: [
        { id: 'card-basic', name: 'Basic Card', icon: <CreditCard className="w-4 h-4" />, description: 'Simple content card', popular: true },
        { id: 'card-image', name: 'Image Card', icon: <Image className="w-4 h-4" />, description: 'Card with image header', popular: true },
        { id: 'card-horizontal', name: 'Horizontal Card', icon: <Columns className="w-4 h-4" />, description: 'Side-by-side layout' },
        { id: 'card-profile', name: 'Profile Card', icon: <User className="w-4 h-4" />, description: 'User profile display' },
        { id: 'card-pricing', name: 'Pricing Card', icon: <DollarSign className="w-4 h-4" />, description: 'Pricing plan card', popular: true },
        { id: 'card-testimonial', name: 'Testimonial Card', icon: <MessageSquare className="w-4 h-4" />, description: 'Customer testimonial' },
        { id: 'card-feature', name: 'Feature Card', icon: <Zap className="w-4 h-4" />, description: 'Feature highlight' },
        { id: 'card-blog', name: 'Blog Card', icon: <FileText className="w-4 h-4" />, description: 'Blog post preview' },
        { id: 'card-product', name: 'Product Card', icon: <ShoppingCart className="w-4 h-4" />, description: 'E-commerce product', popular: true },
        { id: 'card-team', name: 'Team Card', icon: <Users className="w-4 h-4" />, description: 'Team member card' },
        { id: 'card-stats', name: 'Stats Card', icon: <BarChart3 className="w-4 h-4" />, description: 'Statistics card' },
      ]
    },
    {
      id: 'sections',
      name: 'Page Sections',
      icon: <Layers className="w-4 h-4" />,
      items: [
        { id: 'section-features', name: 'Features Section', icon: <Zap className="w-4 h-4" />, description: 'Feature grid display', popular: true },
        { id: 'section-pricing', name: 'Pricing Section', icon: <DollarSign className="w-4 h-4" />, description: 'Pricing table', popular: true },
        { id: 'section-testimonials', name: 'Testimonials', icon: <MessageSquare className="w-4 h-4" />, description: 'Customer reviews', popular: true },
        { id: 'section-team', name: 'Team Section', icon: <Users className="w-4 h-4" />, description: 'Team members grid' },
        { id: 'section-faq', name: 'FAQ Section', icon: <HelpCircle className="w-4 h-4" />, description: 'Accordion FAQ', popular: true },
        { id: 'section-cta', name: 'CTA Section', icon: <Zap className="w-4 h-4" />, description: 'Call to action', popular: true },
        { id: 'section-contact', name: 'Contact Section', icon: <Mail className="w-4 h-4" />, description: 'Contact info + form' },
        { id: 'section-newsletter', name: 'Newsletter', icon: <Mail className="w-4 h-4" />, description: 'Email signup' },
        { id: 'section-stats', name: 'Stats Section', icon: <BarChart3 className="w-4 h-4" />, description: 'Statistics display' },
        { id: 'section-logos', name: 'Logo Cloud', icon: <Globe className="w-4 h-4" />, description: 'Partner/client logos' },
        { id: 'section-blog', name: 'Blog Section', icon: <FileText className="w-4 h-4" />, description: 'Blog post grid' },
        { id: 'footer', name: 'Footer', icon: <PanelTop className="w-4 h-4" />, description: 'Page footer', popular: true },
        { id: 'footer-simple', name: 'Simple Footer', icon: <PanelTop className="w-4 h-4" />, description: 'Minimal footer' },
      ]
    },
    {
      id: 'ecommerce',
      name: 'E-Commerce',
      icon: <ShoppingCart className="w-4 h-4" />,
      items: [
        { id: 'product-grid', name: 'Product Grid', icon: <Grid3X3 className="w-4 h-4" />, description: 'Product listing', popular: true },
        { id: 'product-detail', name: 'Product Detail', icon: <ShoppingCart className="w-4 h-4" />, description: 'Product page' },
        { id: 'cart', name: 'Shopping Cart', icon: <ShoppingCart className="w-4 h-4" />, description: 'Cart summary' },
        { id: 'cart-mini', name: 'Mini Cart', icon: <ShoppingCart className="w-4 h-4" />, description: 'Cart dropdown' },
        { id: 'checkout', name: 'Checkout', icon: <PaymentIcon className="w-4 h-4" />, description: 'Checkout flow' },
        { id: 'order-summary', name: 'Order Summary', icon: <FileText className="w-4 h-4" />, description: 'Order details' },
        { id: 'quantity-selector', name: 'Quantity Selector', icon: <Plus className="w-4 h-4" />, description: 'Add/remove quantity' },
        { id: 'wishlist', name: 'Wishlist', icon: <Heart className="w-4 h-4" />, description: 'Saved items' },
        { id: 'reviews', name: 'Product Reviews', icon: <Star className="w-4 h-4" />, description: 'Customer reviews' },
        { id: 'rating', name: 'Star Rating', icon: <Star className="w-4 h-4" />, description: 'Rating display' },
      ]
    },
    {
      id: 'social',
      name: 'Social & Media',
      icon: <Share2 className="w-4 h-4" />,
      items: [
        { id: 'social-share', name: 'Share Buttons', icon: <Share2 className="w-4 h-4" />, description: 'Social share links' },
        { id: 'social-follow', name: 'Follow Buttons', icon: <UserPlus className="w-4 h-4" />, description: 'Social follow links' },
        { id: 'like-button', name: 'Like Button', icon: <Heart className="w-4 h-4" />, description: 'Like/favorite button' },
        { id: 'comment-section', name: 'Comments', icon: <MessageCircle className="w-4 h-4" />, description: 'Comment thread' },
        { id: 'comment-form', name: 'Comment Form', icon: <Send className="w-4 h-4" />, description: 'Add comment form' },
        { id: 'social-feed', name: 'Social Feed', icon: <Activity className="w-4 h-4" />, description: 'Activity feed' },
        { id: 'embed-twitter', name: 'Twitter Embed', icon: <Globe className="w-4 h-4" />, description: 'Embed tweets' },
        { id: 'embed-instagram', name: 'Instagram Embed', icon: <Camera className="w-4 h-4" />, description: 'Embed posts' },
      ]
    },
  ]

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleItemClick = (item: ComponentItem) => {
    console.log('ComponentLibrary: item clicked', item.id, item.name)
    setRecentlyUsed(prev => {
      const filtered = prev.filter(id => id !== item.id)
      return [item.id, ...filtered].slice(0, 10)
    })
    console.log('ComponentLibrary: calling onSelectComponent')
    onSelectComponent(item)
  }

  // Filter and search
  const filteredLibrary = useMemo(() => {
    return componentLibrary.map(category => ({
      ...category,
      items: category.items.filter(item => {
        const matchesSearch = searchQuery === '' ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = activeFilter === 'all' ||
          (activeFilter === 'popular' && item.popular) ||
          (activeFilter === 'new' && item.new)

        return matchesSearch && matchesFilter
      })
    })).filter(category => category.items.length > 0)
  }, [searchQuery, activeFilter])

  // Get favorites and recent items
  const favoriteItems = useMemo(() => {
    const allItems = componentLibrary.flatMap(c => c.items)
    return favorites.map(id => allItems.find(item => item.id === id)).filter(Boolean) as ComponentItem[]
  }, [favorites])

  const recentItems = useMemo(() => {
    const allItems = componentLibrary.flatMap(c => c.items)
    return recentlyUsed.map(id => allItems.find(item => item.id === id)).filter(Boolean) as ComponentItem[]
  }, [recentlyUsed])

  const totalComponents = componentLibrary.reduce((acc, cat) => acc + cat.items.length, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${totalComponents} components...`}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-white/10 flex gap-1">
        {[
          { id: 'all', label: 'All' },
          { id: 'popular', label: 'Popular', icon: <Star className="w-3 h-3" /> },
          { id: 'new', label: 'New', icon: <Sparkles className="w-3 h-3" /> },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as 'all' | 'popular' | 'new')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              activeFilter === filter.id
                ? 'bg-forma-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {filter.icon}
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Favorites */}
        {favoriteItems.length > 0 && !searchQuery && (
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
              <Star className="w-3 h-3 text-yellow-400" />
              <span>Favorites</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {favoriteItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs hover:bg-yellow-500/20 transition"
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recently Used */}
        {recentItems.length > 0 && !searchQuery && (
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
              <Clock className="w-3 h-3" />
              <span>Recently Used</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {recentItems.slice(0, 5).map(item => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 hover:text-white transition"
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="p-2">
          {filteredLibrary.map((category) => (
            <div key={category.id} className="mb-1">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-forma-400">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-white/40 bg-white/10 px-1.5 py-0.5 rounded">
                    {category.items.length}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-white/40 transition-transform ${
                    expandedCategories.includes(category.id) ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {expandedCategories.includes(category.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-2 pr-1 py-1 space-y-1">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            console.log('Drag start event fired for:', item.name)
                            // Only pass serializable data (not the React icon component)
                            onDragStart(e, { id: item.id, name: item.name })
                          }}
                          onClick={() => {
                            console.log('Row clicked for:', item.name)
                            handleItemClick(item)
                          }}
                          className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-forma-500/20 border border-white/5 hover:border-forma-500/30 cursor-grab active:cursor-grabbing transition"
                        >
                          <GripVertical className="w-3 h-3 text-white/20 group-hover:text-white/40 flex-shrink-0" />
                          <span className="text-white/60 group-hover:text-forma-400 transition">
                            {item.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-white/80 group-hover:text-white transition truncate">
                                {item.name}
                              </span>
                              {item.popular && (
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              )}
                              {item.new && (
                                <span className="px-1 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded">
                                  NEW
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-white/40 truncate">{item.description}</p>
                            )}
                          </div>
                          {/* Add button - always visible */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('Add button clicked for:', item.name)
                              handleItemClick(item)
                            }}
                            className="p-1.5 rounded bg-forma-500 hover:bg-forma-600 text-white transition"
                            title="Add to canvas"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => toggleFavorite(item.id, e)}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition"
                          >
                            <Star
                              className={`w-3 h-3 ${
                                favorites.includes(item.id)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-white/40'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
