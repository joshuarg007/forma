'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import {
  ChevronDown, Star, User, Users, Mail, Lock, ShoppingCart,
  Menu, X, Check, ArrowRight, Play, Quote, Home, Loader2, AlertCircle, Database
} from 'lucide-react'
import CustomCursor from '@/components/ui/CustomCursor'
import { useDataBinding, mapDataToProps, DataBindingConfig } from '@/hooks/useDataBinding'
import { api } from '@/lib/api'

interface CanvasComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>
  styles?: {
    cursor?: string
    [key: string]: any
  }
  children?: CanvasComponent[]
  dataBinding?: DataBindingConfig
}

interface Page {
  id: string
  name: string
  slug: string
  is_homepage: boolean
  show_in_nav: boolean
  nav_label: string | null
  canvas_components: CanvasComponent[]
}

interface PreviewData {
  pages: Page[]
  currentPageSlug: string
  runtimeUrl?: string // Runtime API URL for data binding
}

// Full-page component renderers (more detailed than canvas previews)
const componentRenderers: Record<string, (props: any) => JSX.Element> = {
  'hero-centered': () => (
    <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 py-24 px-6">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="relative max-w-4xl mx-auto text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Build Beautiful Websites <br />Without Code
        </h1>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Create stunning, responsive websites in minutes with our intuitive drag-and-drop builder. No coding required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition shadow-lg">
            Get Started Free
          </button>
          <button className="px-8 py-4 border-2 border-white/50 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> Watch Demo
          </button>
        </div>
      </div>
    </section>
  ),

  'hero-split': () => (
    <section className="bg-gray-900 py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-white">
          <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wide">Welcome to the future</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight">
            Transform Your Ideas Into Reality
          </h1>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Our platform empowers creators, designers, and entrepreneurs to build professional websites that convert visitors into customers.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition">
              Start Building
            </button>
            <button className="px-6 py-3 text-gray-300 hover:text-white transition">
              Learn More →
            </button>
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl h-80 lg:h-96 flex items-center justify-center shadow-2xl">
            <span className="text-white/60 text-lg">Your Image Here</span>
          </div>
        </div>
      </div>
    </section>
  ),

  'navbar': ({ content, projectMenus }: any) => {
    const menuId = content?.menu
    const menu = menuId && projectMenus?.[menuId]
    const menuItems = menu?.items || []
    const brand = content?.brand || 'Brand'
    // Fall back to comma-separated links if no menu selected
    const fallbackLinks = content?.links ? content.links.split(',').map((l: string) => l.trim()).filter(Boolean) : []
    const hasMenu = menuItems.length > 0
    return (
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
            <span className="font-bold text-xl text-gray-900">{brand}</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {hasMenu ? menuItems.map((item: any) => (
              <a
                key={item.id}
                href={item.type === 'page' ? `?page=${item.page_slug || ''}` : (item.url || '#')}
                target={item.open_new_tab ? '_blank' : undefined}
                rel={item.open_new_tab ? 'noopener noreferrer' : undefined}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                {item.label}
              </a>
            )) : fallbackLinks.length > 0 ? fallbackLinks.map((link: string, i: number) => (
              <a key={i} href="#" className="text-gray-600 hover:text-gray-900 transition">{link}</a>
            )) : (
              <>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition">Home</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition">Features</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition">About</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-gray-600 hover:text-gray-900 transition">Sign In</button>
            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">
              Get Started
            </button>
          </div>
        </div>
      </nav>
    )
  },

  'section-features': () => (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Features</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-4">Everything You Need to Succeed</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Powerful features designed to help you build, launch, and grow your online presence.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Drag & Drop Builder', desc: 'Intuitive interface that makes building websites a breeze' },
            { title: 'Responsive Design', desc: 'Your site looks perfect on every device automatically' },
            { title: 'SEO Optimized', desc: 'Built-in tools to help you rank higher in search results' },
            { title: 'Fast Loading', desc: 'Optimized performance for the best user experience' },
            { title: 'Custom Domains', desc: 'Connect your own domain or use our free subdomain' },
            { title: '24/7 Support', desc: 'Our team is here to help you succeed anytime' },
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Check className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),

  'section-pricing': () => (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Pricing</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 text-lg">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: 'Starter', price: 0, features: ['5 Pages', 'Basic Templates', 'Community Support'] },
            { name: 'Pro', price: 29, features: ['Unlimited Pages', 'Premium Templates', 'Priority Support', 'Custom Domain', 'Analytics'], popular: true },
            { name: 'Enterprise', price: 99, features: ['Everything in Pro', 'Team Collaboration', 'API Access', 'Dedicated Support', 'Custom Integrations'] },
          ].map((plan, i) => (
            <div key={i} className={`relative p-8 rounded-2xl ${plan.popular ? 'bg-indigo-600 text-white ring-4 ring-indigo-600 ring-offset-4' : 'bg-gray-50'}`}>
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-semibold rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
              <div className="mb-6">
                <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>${plan.price}</span>
                <span className={plan.popular ? 'text-white/70' : 'text-gray-500'}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <Check className={`w-5 h-5 ${plan.popular ? 'text-white' : 'text-indigo-600'}`} />
                    <span className={plan.popular ? 'text-white/90' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-semibold transition ${plan.popular ? 'bg-white text-indigo-600 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),

  'section-testimonials': () => (
    <section className="py-20 px-6 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wide">Testimonials</span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-4">Loved by Thousands</h2>
          <p className="text-gray-400 text-lg">See what our customers have to say</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Sarah Johnson', role: 'Startup Founder', quote: 'This tool saved me months of development time. I launched my website in just one weekend!' },
            { name: 'Michael Chen', role: 'Designer', quote: 'The design flexibility is incredible. I can create exactly what I envision without any compromises.' },
            { name: 'Emily Davis', role: 'Marketing Director', quote: 'Our conversion rate increased by 40% after switching to this platform. Highly recommended!' },
          ].map((testimonial, i) => (
            <div key={i} className="bg-gray-800 p-8 rounded-2xl">
              <Quote className="w-10 h-10 text-indigo-500 mb-4" />
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full" />
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),

  'section-faq': () => (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">FAQ</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-lg">Everything you need to know</p>
        </div>
        <div className="space-y-4">
          {[
            { q: 'How do I get started?', a: 'Simply sign up for a free account and start building your website using our drag-and-drop builder.' },
            { q: 'Can I use my own domain?', a: 'Yes! You can connect your own custom domain or use our free subdomain.' },
            { q: 'Is there a free plan?', a: 'Absolutely! Our Starter plan is completely free and includes everything you need to get started.' },
            { q: 'How do I cancel my subscription?', a: 'You can cancel anytime from your account settings. No questions asked.' },
          ].map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),

  'section-cta': () => (
    <section className="py-20 px-6 bg-indigo-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-indigo-100 mb-10">
          Join thousands of creators who are already building amazing websites.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition">
            Start Free Trial
          </button>
          <button className="px-8 py-4 border-2 border-white/50 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  ),

  'footer': ({ content, projectMenus }: any) => {
    const menuId = content?.menu
    const menu = menuId && projectMenus?.[menuId]
    const menuItems = menu?.items || []
    const brand = content?.brand || 'Brand'
    const tagline = content?.tagline || 'Building the future of web design, one website at a time.'
    const copyright = content?.copyright || `\u00A9 ${new Date().getFullYear()} ${brand}. All rights reserved.`

    // Split menu items into columns of ~4 for footer layout
    const defaultColumns = [
      { title: 'Product', links: ['Features', 'Pricing', 'Templates', 'Integrations'] },
      { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
      { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Documentation'] },
    ]

    return (
      <footer className="bg-gray-900 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`grid gap-12 mb-12 ${menuItems.length > 0 ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
                <span className="font-bold text-xl text-white">{brand}</span>
              </div>
              <p className="text-gray-400">{tagline}</p>
            </div>
            {menuItems.length > 0 ? (
              <div>
                <h4 className="font-semibold text-white mb-4">Links</h4>
                <ul className="space-y-3">
                  {menuItems.map((item: any) => (
                    <li key={item.id}>
                      <a
                        href={item.type === 'page' ? `?page=${item.page_slug || ''}` : (item.url || '#')}
                        target={item.open_new_tab ? '_blank' : undefined}
                        rel={item.open_new_tab ? 'noopener noreferrer' : undefined}
                        className="text-gray-400 hover:text-white transition"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              defaultColumns.map((col, i) => (
                <div key={i}>
                  <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <a href="#" className="text-gray-400 hover:text-white transition">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">{copyright}</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    )
  },

  'card-basic': () => (
    <div className="py-12 px-6 bg-gray-50">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Card Title</h3>
        <p className="text-gray-600 mb-6">This is a basic card component with some example content. You can customize this to display any information.</p>
        <button className="text-indigo-600 font-medium hover:text-indigo-700 transition flex items-center gap-1">
          Learn more <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  ),

  'card-image': () => (
    <div className="py-12 px-6 bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500" />
        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Image Card</h3>
          <p className="text-gray-600 mb-6">A card with an image header that can showcase products, blog posts, or portfolio items.</p>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            View Details
          </button>
        </div>
      </div>
    </div>
  ),

  'form-contact': () => (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">We'd love to hear from you. Send us a message!</p>
        </div>
        <form className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" rows={4} placeholder="Your message..." />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
            Send Message
          </button>
        </form>
      </div>
    </section>
  ),

  'container': () => (
    <div className="py-12 px-6">
      <div className="max-w-7xl mx-auto p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center text-gray-400">
        Container Section
      </div>
    </div>
  ),

  'sidebar': () => (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="w-full md:w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">A</div>
            <span className="font-semibold">AppName</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Users
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Analytics
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            Projects
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </a>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full" />
            <div className="flex-1">
              <div className="text-sm font-medium">John Doe</div>
              <div className="text-xs text-gray-500">Admin</div>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 bg-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <p className="text-gray-600">Your main content goes here.</p>
      </main>
    </div>
  ),

  'sidebar-minimal': () => (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="w-full md:w-16 bg-gray-900 text-white flex flex-row md:flex-col items-center py-4 justify-around md:justify-start">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm mb-6">A</div>
        <nav className="flex-1 flex flex-col gap-2">
          <a href="#" className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </a>
          <a href="#" className="w-10 h-10 rounded-lg text-gray-400 hover:bg-gray-800 flex items-center justify-center transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </a>
          <a href="#" className="w-10 h-10 rounded-lg text-gray-400 hover:bg-gray-800 flex items-center justify-center transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </a>
        </nav>
        <div className="w-10 h-10 bg-gray-700 rounded-full" />
      </aside>
      <main className="flex-1 bg-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <p className="text-gray-600">Your main content goes here.</p>
      </main>
    </div>
  ),

  'dashboard-layout': () => (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="font-bold text-xl text-gray-900">Dashboard</h1>
            <nav className="hidden md:flex gap-6 text-gray-500 text-sm">
              <a href="#" className="text-indigo-600 font-medium">Overview</a>
              <a href="#" className="hover:text-gray-900 transition">Analytics</a>
              <a href="#" className="hover:text-gray-900 transition">Reports</a>
              <a href="#" className="hover:text-gray-900 transition">Notifications</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="w-8 h-8 bg-indigo-500 rounded-full" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">12,345</div>
            <div className="text-sm text-green-600 mt-2">↑ 12% from last month</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Revenue</div>
            <div className="text-3xl font-bold text-gray-900">$54,321</div>
            <div className="text-sm text-green-600 mt-2">↑ 8% from last month</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Active Projects</div>
            <div className="text-3xl font-bold text-gray-900">48</div>
            <div className="text-sm text-red-600 mt-2">↓ 3% from last month</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-400">
          Additional dashboard content goes here
        </div>
      </main>
    </div>
  ),

  'grid-2col': () => (
    <div className="py-12 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-400">Column 1</div>
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-400">Column 2</div>
      </div>
    </div>
  ),

  'grid-3col': () => (
    <div className="py-12 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-400">Column 1</div>
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-400">Column 2</div>
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-400">Column 3</div>
      </div>
    </div>
  ),

  'grid-4col': () => (
    <div className="py-12 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-400">Col 1</div>
        <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-400">Col 2</div>
        <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-400">Col 3</div>
        <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-400">Col 4</div>
      </div>
    </div>
  ),

  'section': () => (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Section Title</h2>
        <p className="text-gray-600">Add your content here. This is a flexible section container.</p>
      </div>
    </section>
  ),

  'spacer': () => <div className="h-16" />,

  'divider': () => (
    <div className="max-w-6xl mx-auto px-6">
      <hr className="border-gray-200" />
    </div>
  ),

  'default': (props: { name: string }) => (
    <div className="py-12 px-6 bg-gray-100">
      <div className="max-w-4xl mx-auto text-center p-12 bg-white rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{props.name}</h3>
        <p className="text-gray-500">Component Preview</p>
      </div>
    </div>
  ),

  // Data-bound components - render fetched data in tables/lists
  'data-table': (props: { data?: any[]; columns?: string[]; title?: string }) => {
    const { data = [], columns = [], title } = props
    const displayColumns = columns.length > 0 ? columns : (data[0] ? Object.keys(data[0]).slice(0, 5) : [])

    return (
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {displayColumns.map((col) => (
                    <th key={col} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 capitalize">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    {displayColumns.map((col) => (
                      <td key={col} className="px-6 py-4 text-sm text-gray-600">
                        {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-500">No data available</div>
            )}
          </div>
        </div>
      </section>
    )
  },

  'data-cards': (props: { data?: any[]; titleField?: string; descField?: string; imageField?: string }) => {
    const { data = [], titleField = 'title', descField = 'description', imageField = 'image' } = props

    return (
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.slice(0, 9).map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                {item[imageField] && (
                  <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500" />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item[titleField] || `Item ${i + 1}`}
                  </h3>
                  {item[descField] && (
                    <p className="text-gray-600 text-sm line-clamp-3">{item[descField]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {data.length === 0 && (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>
      </section>
    )
  },

  'data-list': (props: { data?: any[]; titleField?: string; subtitleField?: string }) => {
    const { data = [], titleField = 'name', subtitleField = 'email' } = props

    return (
      <section className="py-12 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="divide-y divide-gray-200">
            {data.slice(0, 10).map((item, i) => (
              <div key={i} className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {(item[titleField] || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item[titleField] || `Item ${i + 1}`}</div>
                  {item[subtitleField] && (
                    <div className="text-sm text-gray-500">{item[subtitleField]}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {data.length === 0 && (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>
      </section>
    )
  },
}

// Data-bound component wrapper - fetches data and passes to renderer
function DataBoundComponent({
  component,
  Renderer,
  runtimeUrl,
  projectMenus,
}: {
  component: CanvasComponent
  Renderer: (props: any) => JSX.Element
  runtimeUrl?: string | null
  projectMenus?: Record<string, any>
}) {
  // Resolve the full URL for data binding
  const resolvedConfig = useMemo(() => {
    if (!component.dataBinding?.source) return component.dataBinding

    let source = component.dataBinding.source

    // If the source is a relative path and we have a runtime URL, combine them
    if (source && !source.startsWith('http') && runtimeUrl) {
      // Handle paths like "/posts" or "posts"
      const cleanPath = source.startsWith('/') ? source : `/${source}`
      source = `${runtimeUrl}${cleanPath}`
    }

    return {
      ...component.dataBinding,
      source,
    }
  }, [component.dataBinding, runtimeUrl])

  const { data, loading, error } = useDataBinding(resolvedConfig)

  // Map fetched data to component props
  const mappedProps = useMemo(() => {
    if (!data || !component.dataBinding?.mapping) {
      return component.props
    }
    return mapDataToProps(data, component.dataBinding.mapping, component.props)
  }, [data, component.dataBinding?.mapping, component.props])

  // Show loading state
  if (loading && !data) {
    return (
      <div className="py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !data) {
    return (
      <div className="py-12 px-6 bg-red-50">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Failed to load data</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // For data components, pass the data array directly
  const finalProps = { ...mappedProps }
  if (['data-table', 'data-cards', 'data-list'].includes(component.type) && data) {
    // Handle both { items: [...] } and [...] response formats
    finalProps.data = Array.isArray(data) ? data : (data.items || data.data || data.results || [])
  }

  return <Renderer name={component.name} content={component.content} projectMenus={projectMenus} {...finalProps} />
}

export default function PreviewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const pageSlug = searchParams.get('page')

  const [pages, setPages] = useState<Page[]>([])
  const [currentPage, setCurrentPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNav, setShowNav] = useState(false)
  const [runtimeUrl, setRuntimeUrl] = useState<string | null>(null)
  const [projectMenus, setProjectMenus] = useState<Record<string, any>>({})

  useEffect(() => {
    // Get preview data from localStorage (set by builder page)
    const stored = localStorage.getItem(`forma-preview-${projectId}`)
    if (stored) {
      try {
        const data = JSON.parse(stored)

        // Handle both old format (array) and new format (object with pages)
        if (Array.isArray(data)) {
          // Legacy format - single page
          const legacyPage: Page = {
            id: 'legacy',
            name: 'Home',
            slug: 'home',
            is_homepage: true,
            show_in_nav: true,
            nav_label: null,
            canvas_components: data
          }
          setPages([legacyPage])
          setCurrentPage(legacyPage)
        } else {
          // New multi-page format
          const previewData = data as PreviewData
          setPages(previewData.pages)

          // Store runtime URL if available
          if (previewData.runtimeUrl) {
            setRuntimeUrl(previewData.runtimeUrl)
          }

          // Find the page to display
          const targetSlug = pageSlug || previewData.currentPageSlug || 'home'
          const page = previewData.pages.find(p => p.slug === targetSlug)
            || previewData.pages.find(p => p.is_homepage)
            || previewData.pages[0]
          setCurrentPage(page || null)
        }
      } catch (e) {
        console.error('Failed to parse preview data:', e)
      }
    }
    setLoading(false)
  }, [projectId, pageSlug])

  // Fetch menus for the project
  useEffect(() => {
    if (!projectId) return
    api.getMenus(projectId)
      .then(res => {
        const menuMap: Record<string, any> = {}
        for (const m of (res.menus || [])) {
          menuMap[m.id] = m
        }
        setProjectMenus(menuMap)
      })
      .catch(() => {})
  }, [projectId])

  const navigateToPage = (slug: string) => {
    const page = pages.find(p => p.slug === slug)
    if (page) {
      setCurrentPage(page)
      // Update URL without reload
      window.history.pushState({}, '', `/preview/${projectId}?page=${slug}`)
    }
    setShowNav(false)
  }

  const renderComponent = useCallback((component: CanvasComponent) => {
    const Renderer = componentRenderers[component.type] || componentRenderers['default']

    // Check if component has data binding configured
    if (component.dataBinding?.source) {
      return (
        <DataBoundComponent
          key={component.id}
          component={component}
          Renderer={Renderer}
          runtimeUrl={runtimeUrl}
          projectMenus={projectMenus}
        />
      )
    }

    // Regular rendering without data binding
    return <Renderer key={component.id} name={component.name} content={component.content} projectMenus={projectMenus} {...component.props} />
  }, [runtimeUrl, projectMenus])

  // Check if any component uses rgb-glow cursor
  const hasRgbGlowCursor = useMemo(() => {
    const checkComponents = (components: CanvasComponent[]): boolean => {
      for (const c of components) {
        if (c.styles?.cursor === 'rgb-glow') return true
        if (c.children && checkComponents(c.children)) return true
      }
      return false
    }
    return currentPage ? checkComponents(currentPage.canvas_components) : false
  }, [currentPage])

  // Get nav pages (pages that should show in navigation)
  const navPages = pages.filter(p => p.show_in_nav !== false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!currentPage || currentPage.canvas_components.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Components Yet</h1>
          <p className="text-gray-600 mb-6">Add some components in the builder to preview your page.</p>
          <a
            href={`/builder/${projectId}`}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Go to Builder
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* RGB Glow Cursor Effect */}
      {hasRgbGlowCursor && <CustomCursor />}

      {/* Multi-page Navigation Bar (if more than 1 page) */}
      {pages.length > 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gray-900/90 backdrop-blur-lg rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl border border-white/10">
            {navPages.map((page) => (
              <button
                key={page.id}
                onClick={() => navigateToPage(page.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                  currentPage?.id === page.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {page.is_homepage && <Home className="w-4 h-4" />}
                {page.nav_label || page.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Page Content */}
      {currentPage.canvas_components.map(renderComponent)}
    </div>
  )
}
