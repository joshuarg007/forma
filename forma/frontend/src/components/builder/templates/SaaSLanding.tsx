'use client'

import { cn } from '@/lib/utils'

interface SaaSLandingProps {
  id?: string
  className?: string
  // Branding
  brandName?: string
  brandLogo?: string
  // Hero
  heroTitle?: string
  heroSubtitle?: string
  heroCta?: string
  heroCtaLink?: string
  heroImage?: string
  // Features
  features?: Array<{
    icon?: string
    title: string
    description: string
  }>
  // Pricing
  pricing?: Array<{
    name: string
    price: string
    period?: string
    description?: string
    features: string[]
    cta?: string
    popular?: boolean
  }>
  // Testimonials
  testimonials?: Array<{
    quote: string
    author: string
    role?: string
    avatar?: string
    company?: string
  }>
  // FAQ
  faqs?: Array<{
    question: string
    answer: string
  }>
  // Footer
  footerLinks?: Array<{
    title: string
    links: Array<{ label: string; href: string }>
  }>
  // Colors
  primaryColor?: string
}

const defaultFeatures = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Built for speed with optimized performance out of the box.',
  },
  {
    icon: '🔒',
    title: 'Secure by Default',
    description: 'Enterprise-grade security with end-to-end encryption.',
  },
  {
    icon: '🎨',
    title: 'Fully Customizable',
    description: 'Tailor every aspect to match your brand perfectly.',
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Deep insights into user behavior and performance.',
  },
  {
    icon: '🔄',
    title: 'Seamless Integration',
    description: 'Connect with your favorite tools in minutes.',
  },
  {
    icon: '💬',
    title: '24/7 Support',
    description: 'Our team is here to help whenever you need us.',
  },
]

const defaultPricing = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'Perfect for getting started',
    features: ['Up to 5 projects', 'Basic analytics', 'Email support', '1 team member'],
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Best for growing teams',
    features: ['Unlimited projects', 'Advanced analytics', 'Priority support', '10 team members', 'Custom integrations'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large organizations',
    features: ['Everything in Pro', 'Dedicated support', 'Custom contracts', 'Unlimited members', 'SLA guarantee'],
    cta: 'Contact Sales',
  },
]

const defaultTestimonials = [
  {
    quote: "This product completely transformed how our team works. We've seen a 40% increase in productivity.",
    author: 'Sarah Chen',
    role: 'CEO',
    company: 'TechStart Inc.',
  },
  {
    quote: "The best investment we've made this year. The ROI was visible within the first month.",
    author: 'Michael Rodriguez',
    role: 'CTO',
    company: 'GrowthLabs',
  },
  {
    quote: "Finally, a tool that just works. No complicated setup, no learning curve. Just results.",
    author: 'Emily Watson',
    role: 'Product Manager',
    company: 'ScaleUp Co.',
  },
]

const defaultFaqs = [
  {
    question: 'How do I get started?',
    answer: 'Sign up for a free trial and you\'ll be up and running in minutes. No credit card required.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! You can cancel your subscription at any time. No questions asked.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund your payment.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.',
  },
]

export default function SaaSLanding({
  id,
  className,
  brandName = 'SaaSify',
  heroTitle = 'Build better products, faster',
  heroSubtitle = 'The all-in-one platform that helps teams ship products 10x faster. Start your free trial today.',
  heroCta = 'Start Free Trial',
  heroCtaLink = '#',
  heroImage = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
  features = defaultFeatures,
  pricing = defaultPricing,
  testimonials = defaultTestimonials,
  faqs = defaultFaqs,
}: SaaSLandingProps) {
  return (
    <div id={id} className={cn('min-h-screen', className)}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                {brandName.charAt(0)}
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{brandName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">Features</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">Pricing</a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">Testimonials</a>
              <a href="#faq" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">FAQ</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="/auth" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">Sign in</a>
              <a href="/auth?mode=register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {heroTitle}
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                {heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={heroCtaLink}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition"
                >
                  {heroCta}
                </a>
                <a
                  href="#features"
                  className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold border border-gray-200 dark:border-gray-700 transition"
                >
                  Learn More
                </a>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Free 14-day trial
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No credit card required
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl transform rotate-3" />
              <img
                src={heroImage}
                alt="Product screenshot"
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Powerful features designed to help you build, launch, and scale faster than ever.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-lg transition"
              >
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-4">
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that works best for your team.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={cn(
                  'relative p-8 bg-white dark:bg-gray-900 rounded-2xl',
                  plan.popular ? 'ring-2 ring-indigo-600 shadow-xl' : 'border border-gray-200 dark:border-gray-700'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={cn(
                    'mt-8 w-full py-3 px-4 rounded-xl font-semibold transition',
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Loved by teams worldwide
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of teams already using {brandName} to build better products.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/auth?mode=register"
              className="px-8 py-4 bg-white hover:bg-gray-100 text-indigo-600 rounded-xl font-semibold transition"
            >
              Start Free Trial
            </a>
            <a
              href="#"
              className="px-8 py-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-semibold transition"
            >
              Schedule a Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                {brandName.charAt(0)}
              </div>
              <span className="text-xl font-bold text-white">{brandName}</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

SaaSLanding.displayName = 'SaaSLanding'

SaaSLanding.config = {
  id: 'saas-landing-template',
  name: 'SaaS Landing Page',
  category: 'templates',
  description: 'Complete SaaS landing page with hero, features, pricing, testimonials, FAQ',
  defaultProps: {
    brandName: 'SaaSify',
    heroTitle: 'Build better products, faster',
    heroSubtitle: 'The all-in-one platform that helps teams ship products 10x faster.',
  },
  editableFields: [
    { name: 'brandName', label: 'Brand Name', type: 'text' },
    { name: 'heroTitle', label: 'Hero Title', type: 'text' },
    { name: 'heroSubtitle', label: 'Hero Subtitle', type: 'textarea' },
    { name: 'heroCta', label: 'CTA Button Text', type: 'text' },
    { name: 'heroImage', label: 'Hero Image URL', type: 'text' },
    { name: 'features', label: 'Features', type: 'array' },
    { name: 'pricing', label: 'Pricing Plans', type: 'array' },
    { name: 'testimonials', label: 'Testimonials', type: 'array' },
    { name: 'faqs', label: 'FAQs', type: 'array' },
  ],
}
