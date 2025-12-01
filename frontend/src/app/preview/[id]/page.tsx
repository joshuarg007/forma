'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ChevronDown, Star, User, Users, Mail, Lock, ShoppingCart,
  Menu, X, Check, ArrowRight, Play, Quote
} from 'lucide-react'

interface CanvasComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>
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

  'navbar': () => (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
          <span className="font-bold text-xl text-gray-900">Brand</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-600 hover:text-gray-900 transition">Home</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition">Features</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition">About</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-gray-600 hover:text-gray-900 transition">Sign In</button>
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  ),

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

  'footer': () => (
    <footer className="bg-gray-900 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
              <span className="font-bold text-xl text-white">Brand</span>
            </div>
            <p className="text-gray-400">Building the future of web design, one website at a time.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Templates', 'Integrations'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
            { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Documentation'] },
          ].map((col, i) => (
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
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2024 Brand. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  ),

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

  'default': (props: { name: string }) => (
    <div className="py-12 px-6 bg-gray-100">
      <div className="max-w-4xl mx-auto text-center p-12 bg-white rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{props.name}</h3>
        <p className="text-gray-500">Component Preview</p>
      </div>
    </div>
  ),
}

export default function PreviewPage() {
  const params = useParams()
  const projectId = params.id as string
  const [components, setComponents] = useState<CanvasComponent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get components from localStorage (set by builder page)
    const stored = localStorage.getItem(`forma-preview-${projectId}`)
    if (stored) {
      try {
        setComponents(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse preview data:', e)
      }
    }
    setLoading(false)
  }, [projectId])

  const renderComponent = (component: CanvasComponent) => {
    const Renderer = componentRenderers[component.type] || componentRenderers['default']
    return <Renderer key={component.id} name={component.name} {...component.props} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (components.length === 0) {
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
      {components.map(renderComponent)}
    </div>
  )
}
