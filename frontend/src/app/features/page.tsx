'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight, Sparkles, Code, Zap, Download, Users, Palette,
  Layers, Globe, Shield, Cpu, GitBranch, Smartphone, Box,
  Wand2, RefreshCw, Lock, BarChart3, MessageSquare, Check
} from 'lucide-react'

const features = [
  {
    category: 'AI-Powered Development',
    items: [
      {
        icon: Sparkles,
        image: '/features/feature-ai-generation.png',
        title: 'AI Component Generation',
        description: 'Describe what you want in plain English and watch as our AI generates production-ready React components with TypeScript and Tailwind CSS.',
        highlights: ['Natural language input', 'TypeScript & Tailwind output', 'Instant generation'],
      },
      {
        icon: Wand2,
        image: '/features/feature-ai-generation.png',
        title: 'Smart Suggestions',
        description: 'Get intelligent suggestions for layouts, colors, and components based on your project context and design patterns.',
        highlights: ['Context-aware suggestions', 'Design pattern recognition', 'Auto-completion'],
      },
      {
        icon: RefreshCw,
        image: '/features/feature-ai-generation.png',
        title: 'Iterative Refinement',
        description: 'Refine generated components with follow-up prompts. Our AI understands context and maintains consistency.',
        highlights: ['Conversation memory', 'Incremental changes', 'Version history'],
      },
    ],
  },
  {
    category: 'Visual Builder',
    items: [
      {
        icon: Zap,
        image: '/features/feature-drag-and-drop.png',
        title: 'Drag & Drop Interface',
        description: 'Intuitive visual builder with 100+ pre-built components. Drag, drop, and customize without writing a single line of code.',
        highlights: ['100+ components', 'Real-time preview', 'No code required'],
      },
      {
        icon: Layers,
        image: '/features/feature-drag-and-drop.png',
        title: 'Component Library',
        description: 'Extensive library of professionally designed components including heroes, navbars, forms, cards, and more.',
        highlights: ['Heroes & CTAs', 'Forms & inputs', 'Cards & layouts'],
      },
      {
        icon: Box,
        image: '/features/feature-drag-and-drop.png',
        title: 'Custom Components',
        description: 'Create and save your own components. Build a library of reusable elements tailored to your projects.',
        highlights: ['Save custom components', 'Reuse across projects', 'Share with team'],
      },
    ],
  },
  {
    category: 'Design System',
    items: [
      {
        icon: Palette,
        image: '/features/feature-design-system.png',
        title: 'Theme Management',
        description: 'Built-in design system with customizable themes. Define colors, typography, spacing, and apply consistently.',
        highlights: ['Custom color palettes', 'Typography scales', 'Spacing tokens'],
      },
      {
        icon: Smartphone,
        image: '/features/feature-design-system.png',
        title: 'Responsive Design',
        description: 'Build responsive layouts that look great on any device. Preview and customize for desktop, tablet, and mobile.',
        highlights: ['Breakpoint preview', 'Mobile-first approach', 'Adaptive layouts'],
      },
      {
        icon: Globe,
        image: '/features/feature-design-system.png',
        title: 'Global Styles',
        description: 'Define global styles once and apply everywhere. Change your entire site\'s look with a single update.',
        highlights: ['Centralized styling', 'Instant propagation', 'Style inheritance'],
      },
    ],
  },
  {
    category: 'Collaboration',
    items: [
      {
        icon: Users,
        image: '/features/feature-real-time-collaboration.png',
        title: 'Real-Time Collaboration',
        description: 'Work together with your team in real-time. See cursors, changes, and comments as they happen.',
        highlights: ['Live cursors', 'Instant sync', 'Conflict resolution'],
      },
      {
        icon: MessageSquare,
        image: '/features/feature-real-time-collaboration.png',
        title: 'Comments & Feedback',
        description: 'Leave comments directly on components. Discuss changes and gather feedback without leaving the builder.',
        highlights: ['Inline comments', 'Thread discussions', 'Mention teammates'],
      },
      {
        icon: Shield,
        image: '/features/feature-real-time-collaboration.png',
        title: 'Role-Based Access',
        description: 'Control who can view, edit, or manage your projects. Assign roles to keep your work secure.',
        highlights: ['Owner/Admin/Editor/Viewer', 'Granular permissions', 'Audit logs'],
      },
    ],
  },
  {
    category: 'Export & Deploy',
    items: [
      {
        icon: Download,
        image: '/features/feature-export-to-code.png',
        title: 'One-Click Export',
        description: 'Export your entire project as a Next.js or Vite application. Clean, production-ready code you own.',
        highlights: ['Next.js export', 'Vite + React export', 'Clean code output'],
      },
      {
        icon: GitBranch,
        image: '/features/feature-export-to-code.png',
        title: 'GitHub Integration',
        description: 'Connect to GitHub and push your components directly to your repositories. Keep code in sync.',
        highlights: ['Direct push', 'Branch support', 'Sync changes'],
      },
      {
        icon: Code,
        image: '/features/feature-export-to-code.png',
        title: 'Code Quality',
        description: 'Generated code follows best practices with proper TypeScript types, accessibility attributes, and clean structure.',
        highlights: ['TypeScript support', 'A11y compliant', 'Best practices'],
      },
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-forma-950 via-forma-900 to-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-forma-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logos/forma-logo-mark.png"
              alt="FORMA - AI-Powered React App Builder"
              width={128}
              height={118}
              className="h-8 w-auto md:hidden"
            />
            <Image
              src="/logos/forma-logo-full.png"
              alt="FORMA - AI-Powered React App Builder"
              width={360}
              height={98}
              className="h-8 w-auto hidden md:block"
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-white font-medium">Features</Link>
            <Link href="/pricing" className="text-white/70 hover:text-white transition">Pricing</Link>
            <Link href="/about" className="text-white/70 hover:text-white transition">About</Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-white/70 hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/auth?mode=register"
              className="px-4 py-2 rounded-lg bg-forma-500 hover:bg-forma-600 text-white font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Everything You Need to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forma-400 to-purple-400">
                Build Faster
              </span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              FORMA combines AI-powered generation, visual building, and seamless collaboration
              to help you create React applications in record time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features by Category */}
      {features.map((category, categoryIndex) => (
        <section key={category.category} className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {category.category}
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-forma-500 to-purple-500 rounded-full" />
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {category.items.map((feature, featureIndex) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-forma-500/50 transition"
                >
                  <div className="relative h-40 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-forma-500/10 to-purple-500/10">
                    <Image
                      src={feature.image}
                      alt={`FORMA AI-Powered React App Builder - ${feature.title}`}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-forma-500/20 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-forma-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  </div>

                  <p className="text-white/60 mb-6">{feature.description}</p>

                  <ul className="space-y-2">
                    {feature.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2 text-sm text-white/50">
                        <Check className="w-4 h-4 text-forma-400" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-forma-500/20 to-purple-500/20 border border-forma-500/30 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Build Smarter?
            </h2>
            <p className="text-xl text-white/60 mb-8 max-w-xl mx-auto">
              Join thousands of developers who are shipping faster with FORMA.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth?mode=register"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-forma-900 font-semibold hover:bg-white/90 transition"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 rounded-xl border border-white/20 text-white font-medium hover:border-white/40 transition"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logos/forma-logo-full.png"
                  alt="FORMA - AI-Powered React App Builder"
                  width={360}
                  height={98}
                  className="h-7 w-auto"
                />
              </Link>
              <p className="text-sm text-white/40">
                AI-powered React development platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/marketplace" className="hover:text-white transition">Marketplace</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} FORMA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
