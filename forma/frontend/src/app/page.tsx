'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Code, Zap, Download } from 'lucide-react'
import { MarketingLayout } from '@/components/marketing'
import { pageStyles } from '@/lib/theme'

export default function LandingPage() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered React Development
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Build React Apps
              <br />
              <span className={pageStyles.hero.titleGradient}>
                With Words
              </span>
            </h1>

            <p className={`${pageStyles.hero.subtitle} mb-10 max-w-2xl mx-auto`}>
              Describe what you want, and FORMA builds production-ready React components.
              No more boilerplate. Just pure creation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth?mode=register"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-semibold text-lg transition-all shadow-lg shadow-violet-500/25"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#demo"
                className={pageStyles.cta.buttonSecondary}
              >
                Watch Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className={pageStyles.section.wrapper}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5" />
            <div className="bg-zinc-950/90 backdrop-blur-xl p-1">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center text-sm text-white/40">FORMA Builder</div>
              </div>

              {/* Mock builder interface */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px] lg:min-h-[500px]">
                {/* Sidebar - hidden on mobile/tablet */}
                <div className="hidden lg:block lg:col-span-2 border-r border-white/10 p-4">
                  <div className="space-y-2">
                    {['Hero', 'Features', 'Pricing', 'Footer'].map((item) => (
                      <div key={item} className="px-3 py-2 rounded-lg bg-white/5 text-white/60 text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main canvas */}
                <div className="col-span-1 lg:col-span-7 p-4 lg:p-6 flex items-center justify-center">
                  <div className="w-full max-w-md p-4 lg:p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="h-4 w-24 bg-violet-500/30 rounded mb-4" />
                    <div className="h-3 w-full bg-white/10 rounded mb-2" />
                    <div className="h-3 w-3/4 bg-white/10 rounded mb-4" />
                    <div className="h-10 w-32 bg-violet-500 rounded-lg" />
                  </div>
                </div>

                {/* Right panel - hidden on mobile, shown on tablet+ */}
                <div className="hidden md:block lg:col-span-3 border-t md:border-t-0 md:border-l border-white/10 p-4">
                  <div className="mb-4">
                    <div className="text-xs text-white/40 mb-2">Intent</div>
                    <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm">
                      "Create a hero section with gradient background"
                    </div>
                  </div>
                  <div className="h-32 lg:h-48 rounded-lg bg-white/5 font-mono text-xs text-green-400 p-3 overflow-hidden">
                    <code>{`export default function Hero() {
  return (
    <section className="...">
      <h1>Welcome</h1>
    </section>
  )
}`}</code>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className={pageStyles.section.wrapper}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={pageStyles.section.title}>
              Everything You Need
            </h2>
            <p className={`${pageStyles.section.subtitle} max-w-xl mx-auto`}>
              From idea to production in minutes, not days.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                image: '/features/feature-ai-generation.webp',
                title: 'AI Generation',
                description: 'Describe components in plain English. Our AI builds them instantly with TypeScript and Tailwind.',
              },
              {
                icon: Zap,
                image: '/features/feature-drag-and-drop.webp',
                title: 'Drag & Drop Builder',
                description: 'Intuitive visual builder with 100+ components. Build pages in minutes, not hours.',
              },
              {
                icon: Code,
                image: '/features/feature-design-system.webp',
                title: 'Design System',
                description: 'Built-in theme management with design tokens. Consistent styling across your entire app.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className={`p-6 ${pageStyles.card.base} ${pageStyles.card.glass} hover:border-violet-500/50 group`}
              >
                <div className="relative h-40 mb-4 rounded-lg overflow-hidden bg-white/5">
                  <Image
                    src={feature.image}
                    alt={`FORMA AI-Powered React App Builder - ${feature.title}`}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Second row of features */}
          <div className="grid md:grid-cols-2 gap-8 mt-8 max-w-4xl mx-auto">
            {[
              {
                icon: Zap,
                image: '/features/feature-real-time-collaboration.webp',
                title: 'Real-Time Collaboration',
                description: 'Work together with your team in real-time. See cursors, changes, and comments instantly.',
              },
              {
                icon: Download,
                image: '/features/feature-export-to-code.webp',
                title: 'One-Click Export',
                description: 'Export your entire project as Next.js or Vite. Ready to deploy immediately.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + 0.1 * i }}
                className={`p-6 ${pageStyles.card.base} ${pageStyles.card.glass} hover:border-violet-500/50 group`}
              >
                <div className="relative h-40 mb-4 rounded-lg overflow-hidden bg-white/5">
                  <Image
                    src={feature.image}
                    alt={`FORMA AI-Powered React App Builder - ${feature.title}`}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className={pageStyles.section.wrapper}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={pageStyles.section.title}>
            Simple Pricing
          </h2>
          <p className={`${pageStyles.section.subtitle} mb-12`}>
            Start free. Scale as you grow.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: '$29', ops: '100 AI ops/mo', highlight: false },
              { name: 'Pro', price: '$79', ops: '500 AI ops/mo', highlight: true },
              { name: 'Team', price: '$199', ops: '2,000 AI ops/mo', highlight: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-2xl border transition ${
                  plan.highlight
                    ? 'bg-violet-500/20 border-violet-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-white/60 text-sm mb-2">{plan.name}</div>
                <div className="text-3xl font-bold text-white mb-2">{plan.price}</div>
                <div className="text-white/40 text-sm">{plan.ops}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={pageStyles.section.wrapper}>
        <div className="max-w-3xl mx-auto">
          <div className={pageStyles.cta.wrapper}>
            <h2 className={pageStyles.cta.title}>
              Ready to Build?
            </h2>
            <p className={pageStyles.cta.subtitle}>
              Join thousands of developers building faster with FORMA.
            </p>
            <div className="rgb-border-wrapper inline-block">
              <Link
                href="/auth?mode=register"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-950 text-white font-semibold hover:bg-zinc-900 transition"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .rgb-border-wrapper {
          padding: 1px;
          border-radius: 0.85rem;
          background: linear-gradient(90deg, rgba(139,92,246,0.6), rgba(236,72,153,0.6), rgba(34,211,238,0.6), rgba(139,92,246,0.6));
          background-size: 300% 100%;
          animation: rgbMove 12s linear infinite;
        }
        @keyframes rgbMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>
    </MarketingLayout>
  )
}
