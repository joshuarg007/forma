'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Check, X, Building2, HelpCircle
} from 'lucide-react'
import { MarketingLayout } from '@/components/marketing'
import { pageStyles } from '@/lib/theme'

// Streamlined feature comparison with descriptions
const comparisonFeatures = [
  { category: 'Usage', name: 'Projects', desc: 'Number of separate projects you can create', free: '3', starter: '10', pro: 'Unlimited', team: 'Unlimited' },
  { category: 'Usage', name: 'AI generations / month', desc: 'AI-powered component and layout generation requests', free: '10', starter: '100', pro: '500', team: '2,000' },
  { category: 'Usage', name: 'Pages per project', desc: 'Maximum pages within each project', free: '5', starter: '25', pro: 'Unlimited', team: 'Unlimited' },
  { category: 'Usage', name: 'Storage', desc: 'Space for images, assets, and project files', free: '500 MB', starter: '5 GB', pro: '25 GB', team: '100 GB' },
  { category: 'Features', name: 'All components', desc: 'Access to 100+ premium UI components', free: false, starter: true, pro: true, team: true },
  { category: 'Features', name: 'Custom themes', desc: 'Create and save custom color schemes and styles', free: false, starter: true, pro: true, team: true },
  { category: 'Features', name: 'Design system tools', desc: 'Design tokens, style guides, and brand management', free: false, starter: false, pro: true, team: true },
  { category: 'Collaboration', name: 'Real-time editing', desc: 'Work simultaneously with teammates on the same project', free: false, starter: true, pro: true, team: true },
  { category: 'Collaboration', name: 'Team members', desc: 'Number of people who can access your projects', free: '1', starter: '1', pro: 'Up to 5', team: 'Unlimited' },
  { category: 'Collaboration', name: 'Guest access', desc: 'Share view-only links with clients or stakeholders', free: false, starter: false, pro: true, team: true },
  { category: 'Export', name: 'Export to React / Next.js', desc: 'Download production-ready code for your projects', free: true, starter: true, pro: true, team: true },
  { category: 'Export', name: 'GitHub integration', desc: 'Push code directly to your GitHub repositories', free: false, starter: false, pro: true, team: true },
  { category: 'Export', name: 'API access', desc: 'Programmatic access to manage projects and components', free: false, starter: false, pro: true, team: true },
  { category: 'Export', name: 'Webhooks & CI/CD', desc: 'Automate deployments and integrate with your pipeline', free: false, starter: false, pro: false, team: true },
  { category: 'Security', name: 'Two-factor auth', desc: 'Extra layer of account protection with 2FA', free: false, starter: true, pro: true, team: true },
  { category: 'Security', name: 'Role-based permissions', desc: 'Control who can view, edit, or admin projects', free: false, starter: false, pro: true, team: true },
  { category: 'Security', name: 'Audit logs', desc: 'Track all changes and access across your organization', free: false, starter: false, pro: false, team: true },
  { category: 'Security', name: 'SSO (SAML)', desc: 'Single sign-on with your identity provider', free: false, starter: false, pro: false, team: true },
  { category: 'Support', name: 'Email support', desc: 'Get help via email within 24 hours', free: false, starter: true, pro: true, team: true },
  { category: 'Support', name: 'Priority support', desc: 'Faster response times and dedicated queue', free: false, starter: false, pro: true, team: true },
  { category: 'Support', name: 'Dedicated account manager', desc: 'Personal point of contact for your team', free: false, starter: false, pro: false, team: true },
]

// Category descriptions for section headers
const categoryDescriptions: Record<string, string> = {
  Usage: 'Limits and quotas for your account',
  Features: 'Design and building capabilities',
  Collaboration: 'Work together with your team',
  Export: 'Get your code out of FORMA',
  Security: 'Keep your projects safe',
  Support: 'Help when you need it',
}

// Plan details with descriptions
const planDetails = {
  Free: { desc: 'Get started with the basics — no credit card required', color: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' },
  Starter: { desc: 'For individuals building personal or freelance projects', color: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  Pro: { desc: 'Best for professional developers and small teams', color: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  Team: { desc: 'For growing organizations that need advanced features', color: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
}


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
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null)

  const handleCardClick = (planName: string, e: React.MouseEvent) => {
    // Don't open modal if clicking on the CTA button or a link
    if ((e.target as HTMLElement).closest('a')) return
    setHighlightedPlan(planName)
    setShowCompareModal(true)
  }

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
              Simple, Transparent
              <br />
              <span className={pageStyles.hero.titleGradient}>
                Pricing
              </span>
            </h1>
            <p className={`${pageStyles.hero.subtitle} max-w-2xl mx-auto mb-8`}>
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                  billingPeriod === 'monthly'
                    ? 'bg-violet-500 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  billingPeriod === 'yearly'
                    ? 'bg-violet-500 text-white'
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
      <section className={pageStyles.section.wrapper}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative ${plan.highlighted ? 'rgb-border-wrapper' : ''}`}
              >
                <div
                  onClick={(e) => handleCardClick(plan.name, e)}
                  className={`relative h-full p-6 rounded-2xl border transition cursor-pointer ${
                  plan.highlighted
                    ? 'bg-zinc-950 border-transparent'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                }`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-medium">
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
                      ? 'bg-violet-500 hover:bg-violet-600 text-white'
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

                {/* Click hint */}
                <p className="mt-6 pt-4 border-t border-white/5 text-[11px] text-white/30 text-center hover:text-white/50 transition cursor-pointer">
                  Compare all features →
                </p>
                </div>
              </motion.div>
            ))}
          </div>
          <style jsx>{`
            .rgb-border-wrapper {
              padding: 1px;
              border-radius: 1rem;
              background: linear-gradient(90deg, rgba(139,92,246,0.5), rgba(236,72,153,0.5), rgba(34,211,238,0.5), rgba(139,92,246,0.5));
              background-size: 300% 100%;
              animation: rgbMove 12s linear infinite;
            }
            @keyframes rgbMove {
              0% { background-position: 0% 50%; }
              100% { background-position: 300% 50%; }
            }
          `}</style>
        </div>
      </section>

      {/* Enterprise */}
      <section className={pageStyles.section.wrapper}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="enterprise-card"
          >
            <div className="p-8 md:p-12 rounded-3xl bg-zinc-950">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
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
                  className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 hover:border-white/30 transition whitespace-nowrap"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </motion.div>
          <style jsx>{`
            .enterprise-card {
              padding: 1px;
              border-radius: 1.5rem;
              background: linear-gradient(90deg, rgba(139,92,246,0.4), rgba(236,72,153,0.4), rgba(34,211,238,0.4), rgba(139,92,246,0.4));
              background-size: 300% 100%;
              animation: rgbMoveEnterprise 14s linear infinite;
            }
            @keyframes rgbMoveEnterprise {
              0% { background-position: 0% 50%; }
              100% { background-position: 300% 50%; }
            }
          `}</style>
        </div>
      </section>

      {/* FAQ */}
      <section className={pageStyles.section.wrapper}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={pageStyles.section.title}>
              Frequently Asked Questions
            </h2>
            <p className={pageStyles.section.subtitle}>
              Have more questions? <Link href="/contact" className="text-violet-400 hover:text-violet-300">Contact us</Link>
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
                  <HelpCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-white/60 pl-8">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={pageStyles.section.wrapper}>
        <div className={`max-w-2xl mx-auto ${pageStyles.cta.wrapper}`}>
          <h2 className={pageStyles.cta.title}>
            Ready to Get Started?
          </h2>
          <p className={pageStyles.cta.subtitle}>
            Try FORMA free for 14 days. No credit card required.
          </p>
          <Link
            href="/auth?mode=register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold hover:from-violet-400 hover:to-fuchsia-400 transition"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Feature Comparison Modal */}
      <AnimatePresence>
        {showCompareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[3vh] overflow-y-auto"
            onClick={() => setShowCompareModal(false)}
          >
            {/* Backdrop with blur */}
            <motion.div
              initial={{ backdropFilter: 'blur(0px)' }}
              animate={{ backdropFilter: 'blur(8px)' }}
              className="fixed inset-0 bg-black/80"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', damping: 35, stiffness: 400 }}
              className="relative w-full max-w-5xl my-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect behind modal */}
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 rounded-[2rem] blur-xl opacity-50" />

              {/* Modal content */}
              <div className="relative rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden">

                {/* Header with gradient background */}
                <div className="relative px-4 sm:px-8 pt-6 sm:pt-10 pb-6 sm:pb-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10" />
                  <button
                    onClick={() => setShowCompareModal(false)}
                    className="absolute top-3 sm:top-6 right-3 sm:right-6 p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all hover:rotate-90 duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="relative text-center">
                    <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent mb-2 sm:mb-3">
                      Find Your Perfect Plan
                    </h2>
                    <p className="text-white/50 text-sm sm:text-base">See what's included in each plan</p>
                  </div>
                </div>

                {/* Plan selector cards */}
                <div className="px-4 sm:px-8 pb-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {plans.map((plan) => {
                      const details = planDetails[plan.name as keyof typeof planDetails]
                      const isHighlighted = highlightedPlan === plan.name
                      return (
                        <motion.div
                          key={plan.name}
                          className="relative group"
                          whileHover={{ y: -3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <button
                            onClick={() => setHighlightedPlan(isHighlighted ? null : plan.name)}
                            className={`relative w-full p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                              isHighlighted
                                ? `${details.color} border-2 ${details.border} shadow-lg`
                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                            }`}
                          >
                            {plan.badge && (
                              <span className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 px-2 sm:px-4 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] sm:text-xs font-bold shadow-lg whitespace-nowrap">
                                {plan.badge}
                              </span>
                            )}
                            <div className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${isHighlighted ? details.text : 'text-white/50'}`}>
                              {plan.name}
                            </div>
                            <div className="flex items-baseline justify-center gap-1">
                              <span className={`text-2xl sm:text-4xl font-bold ${isHighlighted ? 'text-white' : 'text-white/90'}`}>
                                ${plan.price[billingPeriod]}
                              </span>
                              {plan.price[billingPeriod] > 0 && (
                                <span className="text-white/40 text-xs sm:text-base">/mo</span>
                              )}
                            </div>
                          </button>
                          {/* Tooltip */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 px-5 py-3 bg-zinc-950/95 backdrop-blur border border-white/10 rounded-xl text-sm text-white/70 text-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 shadow-2xl min-w-[220px]">
                            {details.desc}
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950 border-l border-t border-white/10 rotate-45" />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Features Table */}
                <div className="px-4 sm:px-8 py-4">
                  <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-x-auto">
                    {['Usage', 'Features', 'Collaboration', 'Export', 'Security', 'Support'].map((category, catIdx) => {
                      const categoryFeatures = comparisonFeatures.filter(f => f.category === category)
                      const dotColors: Record<string, string> = {
                        Usage: 'bg-amber-400',
                        Features: 'bg-violet-400',
                        Collaboration: 'bg-cyan-400',
                        Export: 'bg-emerald-400',
                        Security: 'bg-rose-400',
                        Support: 'bg-blue-400',
                      }
                      return (
                        <div key={category}>
                          {/* Category Header */}
                          <div className={`group relative flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 min-w-[600px] sm:min-w-0 ${catIdx > 0 ? 'border-t border-white/5' : ''}`}>
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[category]}`} />
                            <span className="text-[10px] sm:text-xs font-semibold text-white/50 uppercase tracking-widest cursor-help">
                              {category}
                            </span>
                            <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
                            {/* Category tooltip - hidden on mobile */}
                            <div className="hidden sm:block absolute left-10 top-full -mt-1 px-4 py-2.5 bg-zinc-950/95 backdrop-blur border border-white/10 rounded-xl text-sm text-white/60 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 shadow-xl">
                              {categoryDescriptions[category]}
                            </div>
                          </div>

                          {/* Features */}
                          {categoryFeatures.map((feature, idx) => (
                            <div
                              key={feature.name}
                              className={`grid grid-cols-5 gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 transition-colors hover:bg-white/[0.04] min-w-[600px] sm:min-w-0 ${
                                idx % 2 === 1 ? 'bg-white/[0.015]' : ''
                              }`}
                            >
                              <div className="flex items-center group/feature relative col-span-1 min-w-[120px]">
                                <span className="text-sm sm:text-[15px] text-white/70 cursor-help hover:text-white/90 transition-colors">
                                  {feature.name}
                                </span>
                                {/* Feature tooltip - hidden on mobile */}
                                <div className="hidden sm:block absolute left-0 top-full mt-2 px-5 py-3 bg-zinc-950/95 backdrop-blur border border-white/10 rounded-xl text-sm text-white/60 w-72 opacity-0 group-hover/feature:opacity-100 transition-all duration-200 pointer-events-none z-30 shadow-2xl leading-relaxed">
                                  {feature.desc}
                                </div>
                              </div>

                              {(['free', 'starter', 'pro', 'team'] as const).map((planKey) => {
                                const value = feature[planKey]
                                const planName = planKey.charAt(0).toUpperCase() + planKey.slice(1)
                                const det = planDetails[planName as keyof typeof planDetails]
                                const isHighlighted = highlightedPlan === planName

                                return (
                                  <div
                                    key={planKey}
                                    className={`flex items-center justify-center rounded-xl py-2 transition-all duration-200 ${
                                      isHighlighted ? `${det.color} scale-105` : ''
                                    }`}
                                  >
                                    {typeof value === 'boolean' ? (
                                      value ? (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                          isHighlighted
                                            ? 'bg-emerald-500/30 ring-2 ring-emerald-500/30'
                                            : 'bg-emerald-500/10'
                                        }`}>
                                          <Check className={`w-5 h-5 ${isHighlighted ? 'text-emerald-300' : 'text-emerald-400/80'}`} />
                                        </div>
                                      ) : (
                                        <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center">
                                          <X className="w-4 h-4 text-red-400/60" />
                                        </div>
                                      )
                                    ) : (
                                      <span className={`text-[15px] font-semibold transition-colors ${
                                        value === 'Unlimited' || value?.includes('Unlimited')
                                          ? isHighlighted ? 'text-violet-300' : 'text-violet-400/90'
                                          : isHighlighted ? 'text-white' : 'text-white/80'
                                      }`}>
                                        {value}
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-8 py-6 bg-white/[0.02] border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-base text-white/50">
                      Start free, upgrade anytime — no credit card needed
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowCompareModal(false)}
                      className="px-6 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-base"
                    >
                      Maybe later
                    </button>
                    <Link
                      href="/auth?mode=register"
                      onClick={() => setShowCompareModal(false)}
                      className="group px-8 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-semibold text-base transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center gap-2"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </MarketingLayout>
  )
}
