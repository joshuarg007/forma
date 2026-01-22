'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight, Check, X, Sparkles, Zap, Building2, HelpCircle
} from 'lucide-react'

const plans = [
  {
    name: 'Free',
    description: 'Perfect for trying out FORMA',
    price: { monthly: 0, yearly: 0 },
    features: [
      { name: '3 projects', included: true },
      { name: '10 AI generations/month', included: true },
      { name: 'Basic components', included: true },
      { name: 'Community support', included: true },
      { name: 'Export to code', included: true },
      { name: 'Real-time collaboration', included: false },
      { name: 'Custom themes', included: false },
      { name: 'Priority support', included: false },
      { name: 'Team features', included: false },
      { name: 'API access', included: false },
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Starter',
    description: 'For individual developers',
    price: { monthly: 29, yearly: 24 },
    features: [
      { name: '10 projects', included: true },
      { name: '100 AI generations/month', included: true },
      { name: 'All components', included: true },
      { name: 'Email support', included: true },
      { name: 'Export to code', included: true },
      { name: 'Real-time collaboration', included: true },
      { name: 'Custom themes', included: true },
      { name: 'Priority support', included: false },
      { name: 'Team features', included: false },
      { name: 'API access', included: false },
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'For professional developers',
    price: { monthly: 79, yearly: 66 },
    features: [
      { name: 'Unlimited projects', included: true },
      { name: '500 AI generations/month', included: true },
      { name: 'All components', included: true },
      { name: 'Priority support', included: true },
      { name: 'Export to code', included: true },
      { name: 'Real-time collaboration', included: true },
      { name: 'Custom themes', included: true },
      { name: 'GitHub integration', included: true },
      { name: 'Team features (up to 5)', included: true },
      { name: 'API access', included: true },
    ],
    cta: 'Start Free Trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Team',
    description: 'For growing teams',
    price: { monthly: 199, yearly: 166 },
    features: [
      { name: 'Unlimited projects', included: true },
      { name: '2,000 AI generations/month', included: true },
      { name: 'All components', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Export to code', included: true },
      { name: 'Real-time collaboration', included: true },
      { name: 'Custom themes', included: true },
      { name: 'GitHub integration', included: true },
      { name: 'Unlimited team members', included: true },
      { name: 'Advanced API access', included: true },
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
]

const faqs = [
  {
    question: 'Can I switch plans at any time?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any differences.',
  },
  {
    question: 'What happens when I run out of AI generations?',
    answer: 'You can purchase additional AI generation packs, or wait until your monthly limit resets. Your existing projects and components remain accessible.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Absolutely. You can cancel your subscription at any time from your account settings. You\'ll retain access until the end of your billing period.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can pay via invoice.',
  },
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

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
            <Link href="/features" className="text-white/70 hover:text-white transition">Features</Link>
            <Link href="/pricing" className="text-white font-medium">Pricing</Link>
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
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Simple, Transparent
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forma-400 to-purple-400">
                Pricing
              </span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                  billingPeriod === 'monthly'
                    ? 'bg-forma-500 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  billingPeriod === 'yearly'
                    ? 'bg-forma-500 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl border transition ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-forma-500/20 to-purple-500/10 border-forma-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-forma-500 text-white text-xs font-medium">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-white/60">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${plan.price[billingPeriod]}
                    </span>
                    {plan.price[billingPeriod] > 0 && (
                      <span className="text-white/40">/month</span>
                    )}
                  </div>
                  {billingPeriod === 'yearly' && plan.price.yearly > 0 && (
                    <p className="text-sm text-white/40 mt-1">
                      Billed annually (${plan.price.yearly * 12}/year)
                    </p>
                  )}
                </div>

                <Link
                  href="/auth?mode=register"
                  className={`block w-full py-3 rounded-xl text-center font-medium transition mb-6 ${
                    plan.highlighted
                      ? 'bg-forma-500 hover:bg-forma-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-white/20 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-white/80' : 'text-white/40'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forma-500 to-purple-500 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                  <p className="text-white/60 max-w-md">
                    Need more? Get custom limits, dedicated support, SSO, and advanced security features.
                  </p>
                </div>
              </div>
              <Link
                href="/contact"
                className="px-6 py-3 rounded-xl border border-white/20 text-white font-medium hover:border-white/40 transition whitespace-nowrap"
              >
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-white/60">
              Have more questions? <Link href="/contact" className="text-forma-400 hover:text-forma-300">Contact us</Link>
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <h3 className="text-lg font-medium text-white mb-2 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-forma-400 flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-white/60 pl-8">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/60 mb-8">
            Try FORMA free for 14 days. No credit card required.
          </p>
          <Link
            href="/auth?mode=register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-forma-500 to-purple-500 text-white font-semibold hover:from-forma-400 hover:to-purple-400 transition"
          >
            Start Your Free Trial
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
