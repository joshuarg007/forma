'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight, Sparkles, Code, Zap, Download, Users, Palette,
  Layers, Globe, Shield, Cpu, GitBranch, Smartphone, Box,
  Wand2, RefreshCw, MessageSquare, Check
} from 'lucide-react'
import { MarketingLayout } from '@/components/marketing'
import { pageStyles, categoryStyles } from '@/lib/theme'

const features = [
  {
    category: 'AI-Powered Development',
    categoryIcon: Cpu,
    categoryKey: 'ai' as const,
    image: '/features/feature-ai-generation.webp',
    items: [
      {
        icon: Sparkles,
        title: 'AI Component Generation',
        description: 'Describe what you want in plain English and watch as our AI generates production-ready React components with TypeScript and Tailwind CSS.',
        highlights: ['Natural language input', 'TypeScript & Tailwind output', 'Instant generation'],
      },
      {
        icon: Wand2,
        title: 'Smart Suggestions',
        description: 'Get intelligent suggestions for layouts, colors, and components based on your project context and design patterns.',
        highlights: ['Context-aware suggestions', 'Design pattern recognition', 'Auto-completion'],
      },
      {
        icon: RefreshCw,
        title: 'Iterative Refinement',
        description: 'Refine generated components with follow-up prompts. Our AI understands context and maintains consistency.',
        highlights: ['Conversation memory', 'Incremental changes', 'Version history'],
      },
    ],
  },
  {
    category: 'Visual Builder',
    categoryIcon: Layers,
    categoryKey: 'visual' as const,
    image: '/features/feature-drag-and-drop.webp',
    items: [
      {
        icon: Zap,
        title: 'Drag & Drop Interface',
        description: 'Intuitive visual builder with 100+ pre-built components. Drag, drop, and customize without writing a single line of code.',
        highlights: ['100+ components', 'Real-time preview', 'No code required'],
      },
      {
        icon: Box,
        title: 'Component Library',
        description: 'Extensive library of professionally designed components including heroes, navbars, forms, cards, and more.',
        highlights: ['Heroes & CTAs', 'Forms & inputs', 'Cards & layouts'],
      },
      {
        icon: Layers,
        title: 'Custom Components',
        description: 'Create and save your own components. Build a library of reusable elements tailored to your projects.',
        highlights: ['Save custom components', 'Reuse across projects', 'Share with team'],
      },
    ],
  },
  {
    category: 'Design System',
    categoryIcon: Palette,
    categoryKey: 'design' as const,
    image: '/features/feature-design-system.webp',
    items: [
      {
        icon: Palette,
        title: 'Theme Management',
        description: 'Built-in design system with customizable themes. Define colors, typography, spacing, and apply consistently.',
        highlights: ['Custom color palettes', 'Typography scales', 'Spacing tokens'],
      },
      {
        icon: Smartphone,
        title: 'Responsive Design',
        description: 'Build responsive layouts that look great on any device. Preview and customize for desktop, tablet, and mobile.',
        highlights: ['Breakpoint preview', 'Mobile-first approach', 'Adaptive layouts'],
      },
      {
        icon: Globe,
        title: 'Global Styles',
        description: 'Define global styles once and apply everywhere. Change your entire site\'s look with a single update.',
        highlights: ['Centralized styling', 'Instant propagation', 'Style inheritance'],
      },
    ],
  },
  {
    category: 'Collaboration',
    categoryIcon: Users,
    categoryKey: 'collaboration' as const,
    image: '/features/feature-real-time-collaboration.webp',
    items: [
      {
        icon: Users,
        title: 'Real-Time Collaboration',
        description: 'Work together with your team in real-time. See cursors, changes, and comments as they happen.',
        highlights: ['Live cursors', 'Instant sync', 'Conflict resolution'],
      },
      {
        icon: MessageSquare,
        title: 'Comments & Feedback',
        description: 'Leave comments directly on components. Discuss changes and gather feedback without leaving the builder.',
        highlights: ['Inline comments', 'Thread discussions', 'Mention teammates'],
      },
      {
        icon: Shield,
        title: 'Role-Based Access',
        description: 'Control who can view, edit, or manage your projects. Assign roles to keep your work secure.',
        highlights: ['Owner/Admin/Editor/Viewer', 'Granular permissions', 'Audit logs'],
      },
    ],
  },
  {
    category: 'Export & Deploy',
    categoryIcon: Download,
    categoryKey: 'export' as const,
    image: '/features/feature-export-to-code.webp',
    items: [
      {
        icon: Download,
        title: 'One-Click Export',
        description: 'Export your entire project as a Next.js or Vite application. Clean, production-ready code you own.',
        highlights: ['Next.js export', 'Vite + React export', 'Clean code output'],
      },
      {
        icon: GitBranch,
        title: 'GitHub Integration',
        description: 'Connect to GitHub and push your components directly to your repositories. Keep code in sync.',
        highlights: ['Direct push', 'Branch support', 'Sync changes'],
      },
      {
        icon: Code,
        title: 'Code Quality',
        description: 'Generated code follows best practices with proper TypeScript types, accessibility attributes, and clean structure.',
        highlights: ['TypeScript support', 'A11y compliant', 'Best practices'],
      },
    ],
  },
]

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className={pageStyles.hero.wrapper}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={pageStyles.hero.title}>
              Everything You Need to
              <br />
              <span className={pageStyles.hero.titleGradient}>
                Build Faster
              </span>
            </h1>
            <p className={`${pageStyles.hero.subtitle} max-w-2xl mx-auto`}>
              FORMA combines AI-powered generation, visual building, and seamless collaboration
              to help you create React applications in record time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features by Category */}
      {features.map((category, categoryIndex) => {
        const styles = categoryStyles[category.categoryKey]

        return (
          <section key={category.category} className={categoryIndex % 2 === 1 ? pageStyles.section.wrapperAlt : pageStyles.section.wrapper}>
            <div className="max-w-7xl mx-auto">
              {/* Category header with image */}
              <div className={`grid lg:grid-cols-2 gap-12 items-center mb-16 ${categoryIndex % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Text side */}
                <motion.div
                  initial={{ opacity: 0, x: categoryIndex % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={categoryIndex % 2 === 1 ? 'lg:order-2' : ''}
                >
                  <div className="inline-flex items-center gap-1 mb-4">
                    <category.categoryIcon className={`w-2 h-2 ${styles.iconColor}`} />
                    <span className="text-sm font-medium text-white/80">
                      {category.category}
                    </span>
                  </div>
                  <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${styles.gradient}`}>
                    {category.items[0].title}
                  </h2>
                  <p className="text-lg text-white/60 mb-6">
                    {category.items[0].description}
                  </p>
                  <ul className="space-y-3">
                    {category.items[0].highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2 text-white/70">
                        <Check className={`w-3 h-3 ${styles.iconColor}`} />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Image side */}
                <motion.div
                  initial={{ opacity: 0, x: categoryIndex % 2 === 0 ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`relative ${categoryIndex % 2 === 1 ? 'lg:order-1' : ''}`}
                >
                  <div className="relative h-56">
                    <Image
                      src={category.image}
                      alt={category.category}
                      fill
                      className="object-contain p-6"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Additional features in this category (2 cards) */}
              <div className="grid md:grid-cols-2 gap-6">
                {category.items.slice(1).map((feature, featureIndex) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                    className={`group p-6 rounded-2xl border transition ${styles.card}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <feature.icon className={`w-5 h-5 ${styles.iconColor}`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold mb-2 ${styles.iconColor}`}>{feature.title}</h3>
                        <p className="text-white/70 text-sm mb-4">{feature.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {feature.highlights.map((highlight) => (
                            <span key={highlight} className={`text-xs px-2.5 py-1 rounded-full ${styles.pill}`}>
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* CTA */}
      <section className={pageStyles.section.wrapper}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={pageStyles.cta.wrapper}
          >
            <h2 className={pageStyles.cta.title}>
              Ready to Build Smarter?
            </h2>
            <p className={`${pageStyles.cta.subtitle} max-w-xl mx-auto`}>
              Join thousands of developers who are shipping faster with FORMA.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth?mode=register" className={pageStyles.cta.buttonPrimary}>
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/pricing" className={pageStyles.cta.buttonSecondary}>
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  )
}
