'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight, Target, Heart, Zap, Users, Globe, Rocket,
  Code, Sparkles, Shield, Clock, Star
} from 'lucide-react'
import { MarketingLayout } from '@/components/marketing'
import { pageStyles } from '@/lib/theme'

const values = [
  {
    icon: Zap,
    title: 'Speed First',
    description: 'We believe development should be fast. Every feature we build is designed to help you ship faster.',
  },
  {
    icon: Heart,
    title: 'Developer Experience',
    description: 'We\'re developers too. We obsess over making FORMA a joy to use, with intuitive interfaces and powerful features.',
  },
  {
    icon: Shield,
    title: 'Quality Code',
    description: 'AI-generated or not, code quality matters. We ensure every component follows best practices and is production-ready.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Our roadmap is shaped by our users. We listen, learn, and build what developers actually need.',
  },
]

const stats = [
  { value: '50K+', label: 'Developers' },
  { value: '1M+', label: 'Components Generated' },
  { value: '10K+', label: 'Projects Built' },
  { value: '99.9%', label: 'Uptime' },
]

const timeline = [
  {
    year: '2023',
    title: 'The Beginning',
    description: 'FORMA started as a side project to explore AI-assisted React development.',
  },
  {
    year: '2024',
    title: 'Public Launch',
    description: 'After months of development and testing, we launched FORMA to the public.',
  },
  {
    year: '2024',
    title: 'Rapid Growth',
    description: '10,000 developers joined in our first month. The community shaped our roadmap.',
  },
  {
    year: '2025',
    title: 'Platform Evolution',
    description: 'Expanded beyond components to full application building with Formabase.',
  },
]

export default function AboutPage() {
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
              Building the Future of
              <br />
              <span className={pageStyles.hero.titleGradient}>
                React Development
              </span>
            </h1>
            <p className={`${pageStyles.hero.subtitle} max-w-2xl mx-auto`}>
              We're on a mission to make React development faster, easier, and more accessible
              to developers of all skill levels.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className={pageStyles.section.wrapper}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-violet-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-lg text-white/60 mb-6">
                We believe that building great software shouldn't require weeks of boilerplate.
                FORMA combines the power of AI with intuitive visual tools to help developers
                focus on what matters most: creating amazing user experiences.
              </p>
              <p className="text-lg text-white/60">
                Whether you're a solo developer building your dream project or a team shipping
                enterprise applications, FORMA gives you the tools to build faster without
                sacrificing quality.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={pageStyles.section.wrapperAlt}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={pageStyles.section.title}>Our Values</h2>
            <p className={`${pageStyles.section.subtitle} max-w-xl mx-auto`}>
              The principles that guide everything we do.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-white/60">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className={pageStyles.section.wrapper}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={pageStyles.section.title}>Our Journey</h2>
            <p className={pageStyles.section.subtitle}>
              From idea to platform, here's how FORMA came to be.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500 to-fuchsia-500" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex gap-6 pl-4"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0 z-10">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="text-sm text-violet-400 font-medium mb-1">{item.year}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-white/60">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className={pageStyles.section.wrapperAlt}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={`${pageStyles.section.title} mb-6`}>
                Built with Modern Technology
              </h2>
              <p className="text-lg text-white/60 mb-6">
                FORMA is built on a foundation of cutting-edge technology, ensuring reliability,
                performance, and scalability.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Code, text: 'React, Next.js, TypeScript' },
                  { icon: Sparkles, text: 'Advanced AI Models' },
                  { icon: Globe, text: 'Global CDN Distribution' },
                  { icon: Shield, text: 'Enterprise-grade Security' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <span className="text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative flex items-center justify-center"
            >
              <div className="rgb-border-wrapper">
                <div className="rgb-border-inner">
                  <Image
                    src="/about/technology-stack.webp"
                    alt="FORMA Technology Stack - React, Next.js, TypeScript, AI"
                    width={400}
                    height={400}
                    className="object-contain relative z-10"
                  />
                </div>
              </div>
              <style jsx>{`
                .rgb-border-wrapper {
                  position: relative;
                  padding: 2px;
                  border-radius: 1rem;
                  background: linear-gradient(90deg, #8b5cf6, #ec4899, #22d3ee, #8b5cf6);
                  background-size: 300% 100%;
                  animation: rgbMove 8s linear infinite;
                }
                .rgb-border-inner {
                  background: rgb(9, 9, 11);
                  border-radius: calc(1rem - 2px);
                  padding: 1rem;
                }
                @keyframes rgbMove {
                  0% {
                    background-position: 0% 50%;
                  }
                  100% {
                    background-position: 300% 50%;
                  }
                }
              `}</style>
            </motion.div>
          </div>
        </div>
      </section>

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
              Join Our Community
            </h2>
            <p className={`${pageStyles.cta.subtitle} max-w-xl mx-auto`}>
              Be part of the future of React development. Start building with FORMA today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth?mode=register"
                className={pageStyles.cta.buttonPrimary}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className={pageStyles.cta.buttonSecondary}
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  )
}
