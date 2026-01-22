'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Code, Zap, Download } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-forma-950 via-forma-900 to-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-forma-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo mark for mobile */}
            <Image
              src="/logos/forma-logo-mark.png"
              alt="FORMA - AI-Powered React App Builder"
              width={128}
              height={118}
              className="h-8 w-auto md:hidden"
            />
            {/* Full logo for desktop */}
            <Image
              src="/logos/forma-logo-full.png"
              alt="FORMA - AI-Powered React App Builder"
              width={360}
              height={98}
              className="h-8 w-auto hidden md:block"
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-white/70 hover:text-white transition">Features</Link>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forma-500/20 border border-forma-500/30 text-forma-300 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered React Development
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Build React Apps
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forma-400 to-purple-400">
                With Words
              </span>
            </h1>

            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Describe what you want, and FORMA builds production-ready React components.
              No more boilerplate. Just pure creation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth?mode=register"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-forma-500 to-purple-500 hover:from-forma-400 hover:to-purple-400 text-white font-semibold text-lg transition-all shadow-lg shadow-forma-500/25"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#demo"
                className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 text-white font-medium transition"
              >
                Watch Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-forma-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-forma-500/5 to-purple-500/5" />
            <div className="bg-forma-950/90 backdrop-blur-xl p-1">
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
              <div className="grid grid-cols-12 min-h-[500px]">
                {/* Sidebar */}
                <div className="col-span-2 border-r border-white/10 p-4">
                  <div className="space-y-2">
                    {['Hero', 'Features', 'Pricing', 'Footer'].map((item) => (
                      <div key={item} className="px-3 py-2 rounded-lg bg-white/5 text-white/60 text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main canvas */}
                <div className="col-span-7 p-6 flex items-center justify-center">
                  <div className="w-full max-w-md p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="h-4 w-24 bg-forma-500/30 rounded mb-4" />
                    <div className="h-3 w-full bg-white/10 rounded mb-2" />
                    <div className="h-3 w-3/4 bg-white/10 rounded mb-4" />
                    <div className="h-10 w-32 bg-forma-500 rounded-lg" />
                  </div>
                </div>

                {/* Right panel */}
                <div className="col-span-3 border-l border-white/10 p-4">
                  <div className="mb-4">
                    <div className="text-xs text-white/40 mb-2">Intent</div>
                    <div className="p-3 rounded-lg bg-forma-500/10 border border-forma-500/30 text-forma-300 text-sm">
                      "Create a hero section with gradient background"
                    </div>
                  </div>
                  <div className="h-48 rounded-lg bg-white/5 font-mono text-xs text-green-400 p-3 overflow-hidden">
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
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              From idea to production in minutes, not days.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                image: '/features/feature-ai-generation.png',
                title: 'AI Generation',
                description: 'Describe components in plain English. Our AI builds them instantly with TypeScript and Tailwind.',
              },
              {
                icon: Zap,
                image: '/features/feature-drag-and-drop.png',
                title: 'Drag & Drop Builder',
                description: 'Intuitive visual builder with 100+ components. Build pages in minutes, not hours.',
              },
              {
                icon: Code,
                image: '/features/feature-design-system.png',
                title: 'Design System',
                description: 'Built-in theme management with design tokens. Consistent styling across your entire app.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-forma-500/50 transition group"
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
                  <div className="w-10 h-10 rounded-lg bg-forma-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-forma-400" />
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
                image: '/features/feature-real-time-collaboration.png',
                title: 'Real-Time Collaboration',
                description: 'Work together with your team in real-time. See cursors, changes, and comments instantly.',
              },
              {
                icon: Download,
                image: '/features/feature-export-to-code.png',
                title: 'One-Click Export',
                description: 'Export your entire project as Next.js or Vite. Ready to deploy immediately.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + 0.1 * i }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-forma-500/50 transition group"
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
                  <div className="w-10 h-10 rounded-lg bg-forma-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-forma-400" />
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
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple Pricing
          </h2>
          <p className="text-white/60 mb-12">
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
                    ? 'bg-forma-500/20 border-forma-500'
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
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build?
          </h2>
          <p className="text-white/60 mb-8">
            Join thousands of developers building faster with FORMA.
          </p>
          <Link
            href="/auth?mode=register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-forma-900 font-semibold hover:bg-white/90 transition"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
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
