"""Full Page Templates - Next-Gen UI Components for FORMA"""

from typing import Dict, List, Any

# =============================================================================
# LANDING PAGE TEMPLATES
# =============================================================================

LANDING_SAAS_MODERN = {
    "id": "page-landing-saas",
    "name": "SaaS Landing Page",
    "category": "page",
    "subcategory": "landing",
    "description": "Modern SaaS landing page with hero, features, pricing, testimonials, and CTA",
    "tags": ["page", "landing", "saas", "marketing", "complete"],
    "preview_image": None,
    "code": '''import { useState } from 'react'

export default function SaaSLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Nexus
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/70 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-white/70 hover:text-white transition">Pricing</a>
            <a href="#testimonials" className="text-white/70 hover:text-white transition">Testimonials</a>
            <a href="#faq" className="text-white/70 hover:text-white transition">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-white/70 hover:text-white transition">Sign In</button>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 font-medium transition shadow-lg shadow-violet-500/25">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Introducing Nexus 2.0 — Now with AI Superpowers
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Ship products
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
              10x faster
            </span>
          </h1>

          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform for modern teams. Automate workflows, collaborate in real-time, and scale your business without limits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold text-lg hover:bg-white/90 transition shadow-2xl shadow-white/10">
              Get Started Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 font-medium transition backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch Demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="max-w-6xl mx-auto mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/10 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="p-8 grid grid-cols-12 gap-6">
              <div className="col-span-3 space-y-4">
                <div className="h-10 bg-white/10 rounded-lg" />
                <div className="h-8 bg-white/5 rounded-lg" />
                <div className="h-8 bg-violet-500/20 rounded-lg" />
                <div className="h-8 bg-white/5 rounded-lg" />
              </div>
              <div className="col-span-9 space-y-4">
                <div className="h-32 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-white/5 rounded-xl" />
                  <div className="h-24 bg-white/5 rounded-xl" />
                  <div className="h-24 bg-white/5 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm text-white/40 mb-8">Trusted by innovative teams at</p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-50">
            {['Vercel', 'Stripe', 'Notion', 'Linear', 'Figma', 'GitHub'].map((brand) => (
              <div key={brand} className="text-xl font-bold text-white/60">{brand}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm mb-4">
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to scale
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Powerful features designed to help your team move faster and build better products.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Lightning Fast', desc: 'Built with performance in mind. Sub-100ms response times guaranteed.' },
              { icon: '🔒', title: 'Enterprise Security', desc: 'SOC 2 Type II certified. Your data is encrypted at rest and in transit.' },
              { icon: '🔄', title: 'Real-time Sync', desc: 'Changes sync instantly across all devices. Always stay up to date.' },
              { icon: '🤖', title: 'AI-Powered', desc: 'Smart automation that learns from your workflow and suggests improvements.' },
              { icon: '📊', title: 'Advanced Analytics', desc: 'Deep insights into your team\'s performance with custom dashboards.' },
              { icon: '🔗', title: '100+ Integrations', desc: 'Connect with all your favorite tools. Slack, GitHub, Jira, and more.' },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-violet-500/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10M+', label: 'Active Users' },
              { value: '99.99%', label: 'Uptime SLA' },
              { value: '150+', label: 'Countries' },
              { value: '4.9/5', label: 'User Rating' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm mb-4">
              Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-white/60 mb-8">
              Start free and scale as you grow. No hidden fees.
            </p>

            <div className="inline-flex items-center gap-4 p-1 rounded-full bg-white/5 border border-white/10">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full transition ${billingCycle === 'monthly' ? 'bg-violet-600 text-white' : 'text-white/60 hover:text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-violet-600 text-white' : 'text-white/60 hover:text-white'}`}
              >
                Annual
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: billingCycle === 'monthly' ? 29 : 23, features: ['5 team members', '10GB storage', 'Basic analytics', 'Email support'] },
              { name: 'Pro', price: billingCycle === 'monthly' ? 79 : 63, popular: true, features: ['Unlimited members', '100GB storage', 'Advanced analytics', 'Priority support', 'API access', 'Custom integrations'] },
              { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Unlimited storage', 'Dedicated support', 'Custom SLA', 'On-premise option', 'SSO/SAML'] },
            ].map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-2xl ${plan.popular ? 'bg-gradient-to-b from-violet-600 to-purple-600 ring-2 ring-violet-400' : 'bg-white/5 border border-white/10'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-black text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  {typeof plan.price === 'number' ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-white/60">/mo</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold">{plan.price}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${plan.popular ? 'text-violet-200' : 'text-violet-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.popular ? 'text-white' : 'text-white/70'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-medium transition ${plan.popular ? 'bg-white text-violet-600 hover:bg-white/90' : 'bg-violet-600 text-white hover:bg-violet-500'}`}>
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm mb-4">
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by teams worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Nexus transformed how our team collaborates. We shipped our last product 3x faster than before.", author: "Sarah Chen", role: "CTO, TechFlow", avatar: "SC" },
              { quote: "The AI features are game-changing. It's like having an extra team member who never sleeps.", author: "Marcus Rivera", role: "Founder, BuildFast", avatar: "MR" },
              { quote: "Best investment we made this year. The ROI was visible within the first month.", author: "Emily Watson", role: "VP Engineering, Scale", avatar: "EW" },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/80 mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center font-medium text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{t.author}</div>
                    <div className="text-sm text-white/60">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 rounded-3xl bg-gradient-to-r from-violet-600 to-purple-600 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
            <div className="relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Join 10,000+ teams already using Nexus to build faster.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-violet-600 font-semibold hover:bg-white/90 transition">
                  Start Free Trial
                </button>
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-white/30 font-semibold hover:bg-white/10 transition">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">Nexus</span>
              </div>
              <p className="text-white/60 mb-4 max-w-xs">
                The all-in-one platform for modern teams to build, ship, and scale products.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Community', 'Support'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}><a href="#" className="text-white/60 hover:text-white transition">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
            <p className="text-white/40 text-sm">© 2024 Nexus. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="text-white/40 hover:text-white transition">Privacy</a>
              <a href="#" className="text-white/40 hover:text-white transition">Terms</a>
              <a href="#" className="text-white/40 hover:text-white transition">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}''',
    "styles": ""
}

LANDING_STARTUP = {
    "id": "page-landing-startup",
    "name": "Startup Launch Page",
    "category": "page",
    "subcategory": "landing",
    "description": "High-converting startup landing page with waitlist signup",
    "tags": ["page", "landing", "startup", "waitlist", "launch"],
    "preview_image": None,
    "code": '''import { useState } from 'react'

export default function StartupLaunchPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-500/20 animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="fixed inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <span className="text-black font-bold text-xl">∞</span>
              </div>
              <span className="text-xl font-bold">Infinity</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-white/70 hover:text-white transition hidden sm:block">About</a>
              <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition backdrop-blur-sm border border-white/10">
                Early Access
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Coming Q1 2025
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-none">
              The future of
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400">
                collaboration
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-xl mx-auto">
              A new paradigm in team productivity. Join the waitlist to be among the first to experience it.
            </p>

            {/* Waitlist Form */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/40 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold hover:from-emerald-400 hover:to-cyan-400 transition whitespace-nowrap"
                  >
                    Join Waitlist
                  </button>
                </div>
                <p className="mt-4 text-sm text-white/40">
                  2,847 people already joined • No spam, ever
                </p>
              </form>
            ) : (
              <div className="max-w-md mx-auto p-8 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
                <p className="text-white/60">We'll notify you when we launch. Get ready for something amazing.</p>
              </div>
            )}

            {/* Social Proof */}
            <div className="mt-16 flex items-center justify-center gap-8">
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 border-2 border-black flex items-center justify-center text-xs font-bold text-black">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="font-semibold">Backed by YC</div>
                <div className="text-sm text-white/60">W24 Batch</div>
              </div>
            </div>
          </div>
        </main>

        {/* Features Preview */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '🚀', title: 'Instant Setup', desc: 'Get started in seconds. No complex configuration needed.' },
                { icon: '🔮', title: 'AI-Native', desc: 'Built from the ground up with artificial intelligence at its core.' },
                { icon: '🌐', title: 'Global Scale', desc: 'Infrastructure that scales with you, from 10 to 10 million users.' },
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition">
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-white/60">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white/40 text-sm">© 2024 Infinity Labs. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-white/40 hover:text-white transition">Twitter</a>
              <a href="#" className="text-white/40 hover:text-white transition">LinkedIn</a>
              <a href="#" className="text-white/40 hover:text-white transition">Discord</a>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}''',
    "styles": ""
}

# =============================================================================
# DASHBOARD TEMPLATES
# =============================================================================

DASHBOARD_ANALYTICS = {
    "id": "page-dashboard-analytics",
    "name": "Analytics Dashboard",
    "category": "page",
    "subcategory": "dashboard",
    "description": "Full analytics dashboard with charts, stats, and data tables",
    "tags": ["page", "dashboard", "analytics", "charts", "admin"],
    "preview_image": None,
    "code": '''import { useState } from 'react'

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('7d')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const stats = [
    { label: 'Total Revenue', value: '$45,231', change: '+20.1%', positive: true },
    { label: 'Active Users', value: '2,338', change: '+15.3%', positive: true },
    { label: 'Conversion Rate', value: '3.24%', change: '-2.1%', positive: false },
    { label: 'Avg. Session', value: '4m 32s', change: '+8.4%', positive: true },
  ]

  const recentActivity = [
    { user: 'John Doe', action: 'Completed purchase', amount: '$129.00', time: '2 min ago' },
    { user: 'Sarah Smith', action: 'Signed up', amount: null, time: '15 min ago' },
    { user: 'Mike Johnson', action: 'Upgraded plan', amount: '$49.00', time: '1 hour ago' },
    { user: 'Emily Brown', action: 'Completed purchase', amount: '$299.00', time: '2 hours ago' },
    { user: 'Chris Wilson', action: 'Submitted support ticket', amount: null, time: '3 hours ago' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Analytics</span>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {[
            { icon: '📊', label: 'Dashboard', active: true },
            { icon: '📈', label: 'Analytics' },
            { icon: '👥', label: 'Users' },
            { icon: '💰', label: 'Revenue' },
            { icon: '📁', label: 'Projects' },
            { icon: '⚙️', label: 'Settings' },
          ].map((item, i) => (
            <a
              key={i}
              href="#"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                item.active
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">John Doe</p>
              <p className="text-sm text-gray-500 truncate">john@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back! Here's what's happening.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-0 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
                Download Report
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4 h-16 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-gray-600 dark:text-gray-400">Expenses</span>
                  </div>
                </div>
              </div>
              <div className="h-64 bg-gradient-to-t from-indigo-500/20 to-transparent rounded-xl flex items-end justify-around px-4 pb-4">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className="w-8 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all hover:from-indigo-500 hover:to-purple-400"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-xs text-gray-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Traffic Sources</h3>
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" className="dark:stroke-gray-800" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient1)" strokeWidth="20" strokeDasharray="125.6 251.2" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient2)" strokeWidth="20" strokeDasharray="75.4 251.2" strokeDashoffset="-125.6" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient3)" strokeWidth="20" strokeDasharray="50.2 251.2" strokeDashoffset="-201" />
                  <defs>
                    <linearGradient id="gradient1"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient>
                    <linearGradient id="gradient2"><stop stopColor="#22c55e" /><stop offset="1" stopColor="#10b981" /></linearGradient>
                    <linearGradient id="gradient3"><stop stopColor="#f59e0b" /><stop offset="1" stopColor="#f97316" /></linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Direct', value: '50%', color: 'bg-indigo-500' },
                  { label: 'Organic', value: '30%', color: 'bg-green-500' },
                  { label: 'Referral', value: '20%', color: 'bg-amber-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentActivity.map((activity, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{activity.user}</p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="font-medium text-gray-900 dark:text-white">{activity.amount}</p>
                    )}
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}''',
    "styles": ""
}

# =============================================================================
# AUTH PAGE TEMPLATES
# =============================================================================

AUTH_LOGIN_MODERN = {
    "id": "page-auth-login",
    "name": "Modern Login Page",
    "category": "page",
    "subcategory": "auth",
    "description": "Beautiful login page with social auth and split design",
    "tags": ["page", "auth", "login", "signin", "social"],
    "preview_image": None,
    "code": '''import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Acme Inc</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account? <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">Sign up</a>
            </p>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-gray-700 dark:text-gray-300">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="font-medium text-gray-700 dark:text-gray-300">GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-950 text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 focus:ring-4 focus:ring-indigo-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />

        {/* Floating elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-xl animate-float" />
          <div className="absolute bottom-40 right-20 w-40 h-40 bg-white/10 rounded-full backdrop-blur-xl animate-float animation-delay-2000" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-2xl backdrop-blur-xl animate-float animation-delay-4000" />
        </div>

        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h2 className="text-4xl font-bold mb-6">Start your journey with us</h2>
            <p className="text-white/80 text-lg mb-8">
              Join thousands of teams already using our platform to build amazing products.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="font-semibold">50,000+ users</div>
                <div className="text-sm text-white/60">already signed up</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}''',
    "styles": ""
}

# =============================================================================
# ADVANCED UI COMPONENTS
# =============================================================================

COMPONENT_GLASSMORPHISM_CARD = {
    "id": "component-glass-card",
    "name": "Glassmorphism Card",
    "category": "component",
    "subcategory": "card",
    "description": "Beautiful frosted glass card with blur effect",
    "tags": ["component", "card", "glass", "blur", "modern"],
    "preview_image": None,
    "code": '''export default function GlassmorphismCard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-violet-600 to-indigo-700 flex items-center justify-center p-8">
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Glass Card */}
      <div className="relative">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Premium Plan</h3>
              <p className="text-white/60">Best for growing teams</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">$49</span>
              <span className="text-white/60">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {['Unlimited projects', 'Advanced analytics', 'Priority support', 'Custom integrations', 'Team collaboration'].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-white/80">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <button className="w-full py-4 rounded-2xl bg-white text-violet-600 font-semibold hover:bg-white/90 transition shadow-lg">
            Get Started
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}''',
    "styles": ""
}

COMPONENT_ANIMATED_COUNTER = {
    "id": "component-animated-counter",
    "name": "Animated Counter",
    "category": "component",
    "subcategory": "stats",
    "description": "Numbers that animate when scrolling into view",
    "tags": ["component", "stats", "animation", "counter", "numbers"],
    "preview_image": None,
    "code": '''import { useState, useEffect, useRef } from 'react'

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isVisible, end, duration])

  return { count, ref }
}

export default function AnimatedCounter() {
  const stats = [
    { value: 10000, suffix: '+', label: 'Happy Customers' },
    { value: 99.9, suffix: '%', label: 'Uptime SLA' },
    { value: 150, suffix: '+', label: 'Countries' },
    { value: 24, suffix: '/7', label: 'Support' },
  ]

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Trusted by thousands</h2>
          <p className="text-slate-400 text-lg">Numbers that speak for themselves</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const { count, ref } = useCountUp(stat.value, 2500)
            return (
              <div key={i} ref={ref} className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                  {stat.value % 1 === 0 ? count.toLocaleString() : count.toFixed(1)}
                  <span className="text-3xl">{stat.suffix}</span>
                </div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}''',
    "styles": ""
}

COMPONENT_BENTO_GRID = {
    "id": "component-bento-grid",
    "name": "Bento Grid Layout",
    "category": "component",
    "subcategory": "layout",
    "description": "Apple-style bento grid for feature showcases",
    "tags": ["component", "layout", "bento", "grid", "apple", "modern"],
    "preview_image": None,
    "code": '''export default function BentoGrid() {
  return (
    <section className="py-24 px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need
          </h2>
          <p className="text-xl text-gray-400">
            Powerful features designed for modern teams
          </p>
        </div>

        <div className="grid grid-cols-4 grid-rows-3 gap-4 h-[800px]">
          {/* Large feature card */}
          <div className="col-span-2 row-span-2 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-8 flex flex-col justify-between group hover:scale-[1.02] transition-transform cursor-pointer">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-white/70">
                Built for speed. Every interaction feels instant with our optimized architecture.
              </p>
            </div>
            <div className="mt-8 h-40 bg-white/10 rounded-2xl" />
          </div>

          {/* Medium cards */}
          <div className="col-span-2 rounded-3xl bg-gray-900 p-8 group hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Enterprise Security</h3>
            <p className="text-gray-400">SOC 2 Type II certified with end-to-end encryption</p>
          </div>

          <div className="rounded-3xl bg-gray-900 p-6 group hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Real-time</h3>
            <p className="text-gray-400 text-sm">Instant sync across all devices</p>
          </div>

          <div className="rounded-3xl bg-gray-900 p-6 group hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Customizable</h3>
            <p className="text-gray-400 text-sm">Make it yours with themes</p>
          </div>

          {/* Bottom row */}
          <div className="col-span-2 rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-600 p-8 group hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Team Collaboration</h3>
                <p className="text-white/70">Work together in real-time with unlimited team members</p>
              </div>
            </div>
          </div>

          <div className="col-span-2 rounded-3xl bg-gray-900 p-8 flex items-center justify-between group hover:bg-gray-800 transition-colors cursor-pointer">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">100+ Integrations</h3>
              <p className="text-gray-400">Connect with your favorite tools</p>
            </div>
            <div className="flex -space-x-3">
              {['Slack', 'GitHub', 'Figma', 'Notion'].map((tool, i) => (
                <div key={i} className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-xs font-medium text-white">
                  {tool[0]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}''',
    "styles": ""
}

COMPONENT_COMMAND_PALETTE = {
    "id": "component-command-palette",
    "name": "Command Palette (Cmd+K)",
    "category": "component",
    "subcategory": "navigation",
    "description": "Keyboard-driven command palette like VS Code or Linear",
    "tags": ["component", "navigation", "keyboard", "search", "command"],
    "preview_image": None,
    "code": '''import { useState, useEffect, useRef } from 'react'

interface Command {
  id: string
  title: string
  icon: string
  shortcut?: string
  category: string
}

const commands: Command[] = [
  { id: '1', title: 'Go to Dashboard', icon: '🏠', shortcut: 'G D', category: 'Navigation' },
  { id: '2', title: 'Go to Projects', icon: '📁', shortcut: 'G P', category: 'Navigation' },
  { id: '3', title: 'Go to Settings', icon: '⚙️', shortcut: 'G S', category: 'Navigation' },
  { id: '4', title: 'Create New Project', icon: '➕', shortcut: 'C', category: 'Actions' },
  { id: '5', title: 'Search Files', icon: '🔍', shortcut: '/', category: 'Actions' },
  { id: '6', title: 'Toggle Dark Mode', icon: '🌙', shortcut: 'T D', category: 'Appearance' },
  { id: '7', title: 'Open Documentation', icon: '📚', category: 'Help' },
  { id: '8', title: 'Contact Support', icon: '💬', category: 'Help' },
]

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSearch('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  )

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      console.log('Execute:', filteredCommands[selectedIndex].title)
      setIsOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Search commands...</span>
        <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono">⌘K</kbd>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />
              <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs text-gray-500">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {category}
                  </div>
                  {cmds.map((cmd) => {
                    const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id)
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          console.log('Execute:', cmd.title)
                          setIsOpen(false)
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition ${
                          selectedIndex === globalIndex
                            ? 'bg-indigo-50 dark:bg-indigo-500/10'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <span className="text-xl">{cmd.icon}</span>
                        <span className={`flex-1 text-left font-medium ${
                          selectedIndex === globalIndex ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {cmd.title}
                        </span>
                        {cmd.shortcut && (
                          <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-500">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}

              {filteredCommands.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  No commands found for "{search}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700">↵</kbd>
                  Select
                </span>
              </div>
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}''',
    "styles": ""
}

COMPONENT_TOAST_NOTIFICATIONS = {
    "id": "component-toast",
    "name": "Toast Notifications",
    "category": "component",
    "subcategory": "feedback",
    "description": "Beautiful animated toast notifications system",
    "tags": ["component", "toast", "notification", "feedback", "alert"],
    "preview_image": None,
    "code": '''import { useState, useEffect, createContext, useContext } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

const ToastContext = createContext<{
  addToast: (toast: Omit<Toast, 'id'>) => void
}>({ addToast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  }

  return (
    <div className="animate-slide-in-right flex items-start gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[320px] max-w-md">
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${colors[toast.type]} flex items-center justify-center text-white`}>
        {icons[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white">{toast.title}</p>
        {toast.message && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export const useToast = () => useContext(ToastContext)

// Demo component
export default function ToastDemo() {
  return (
    <ToastProvider>
      <ToastDemoContent />
    </ToastProvider>
  )
}

function ToastDemoContent() {
  const { addToast } = useToast()

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8">
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => addToast({ type: 'success', title: 'Success!', message: 'Your changes have been saved.' })}
          className="px-6 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition"
        >
          Show Success
        </button>
        <button
          onClick={() => addToast({ type: 'error', title: 'Error', message: 'Something went wrong. Please try again.' })}
          className="px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition"
        >
          Show Error
        </button>
        <button
          onClick={() => addToast({ type: 'warning', title: 'Warning', message: 'Your session is about to expire.' })}
          className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition"
        >
          Show Warning
        </button>
        <button
          onClick={() => addToast({ type: 'info', title: 'Info', message: 'A new update is available.' })}
          className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
        >
          Show Info
        </button>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}''',
    "styles": ""
}

# =============================================================================
# EXPORT ALL PAGE TEMPLATES
# =============================================================================

ALL_PAGE_TEMPLATES: List[Dict[str, Any]] = [
    # Landing Pages
    LANDING_SAAS_MODERN,
    LANDING_STARTUP,
    # Dashboards
    DASHBOARD_ANALYTICS,
    # Auth Pages
    AUTH_LOGIN_MODERN,
    # Advanced Components
    COMPONENT_GLASSMORPHISM_CARD,
    COMPONENT_ANIMATED_COUNTER,
    COMPONENT_BENTO_GRID,
    COMPONENT_COMMAND_PALETTE,
    COMPONENT_TOAST_NOTIFICATIONS,
]

def get_page_templates_by_subcategory(subcategory: str) -> List[Dict[str, Any]]:
    """Get all page templates in a specific subcategory."""
    return [t for t in ALL_PAGE_TEMPLATES if t.get("subcategory") == subcategory]

def get_page_template_by_id(template_id: str) -> Dict[str, Any] | None:
    """Get a specific page template by its ID."""
    for template in ALL_PAGE_TEMPLATES:
        if template["id"] == template_id:
            return template
    return None
