'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, ArrowRight } from 'lucide-react'
import { MarketingLayout } from '@/components/marketing'
import { pageStyles } from '@/lib/theme'

const faqCategories = [
  {
    name: 'Getting Started',
    faqs: [
      {
        question: 'What is FORMA?',
        answer: 'FORMA is an AI-powered React development platform that helps you build production-ready React applications faster. It combines a visual drag-and-drop builder with AI component generation, allowing you to describe what you want in plain English and get working code instantly.',
      },
      {
        question: 'Do I need coding experience to use FORMA?',
        answer: 'While FORMA is designed to be accessible to beginners with its visual builder, having basic knowledge of React and web development concepts will help you get the most out of the platform. The AI generation and code export features are particularly useful for developers of all skill levels.',
      },
      {
        question: 'How do I get started?',
        answer: 'Simply sign up for a free account to get started. You\'ll get access to the visual builder, AI generation (with limited monthly credits), and the ability to create up to 3 projects. No credit card required.',
      },
      {
        question: 'Is there a free trial?',
        answer: 'Yes! All paid plans come with a 14-day free trial. You can also use our Free tier indefinitely with limited features to test the platform.',
      },
    ],
  },
  {
    name: 'AI Generation',
    faqs: [
      {
        question: 'How does AI component generation work?',
        answer: 'Simply describe the component you want in plain English (e.g., "Create a pricing table with three tiers and a toggle for monthly/yearly billing"), and our AI will generate production-ready React code with TypeScript and Tailwind CSS styling.',
      },
      {
        question: 'What happens when I run out of AI generations?',
        answer: 'When you\'ve used all your monthly AI generations, you can either wait for your limit to reset at the start of the next billing cycle, purchase additional generation packs, or upgrade to a higher tier plan.',
      },
      {
        question: 'Can I edit AI-generated components?',
        answer: 'Absolutely! All AI-generated components can be edited in the visual builder or directly in the code. You can also ask the AI to make specific modifications by describing what you want to change.',
      },
      {
        question: 'What languages/frameworks does the AI support?',
        answer: 'Currently, FORMA generates React components with TypeScript and Tailwind CSS. We\'re working on adding support for additional frameworks and styling solutions in future updates.',
      },
    ],
  },
  {
    name: 'Billing & Plans',
    faqs: [
      {
        question: 'Can I change my plan at any time?',
        answer: 'Yes, you can upgrade or downgrade your plan at any time from your account settings. Upgrades take effect immediately, and downgrades take effect at the start of your next billing cycle.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover) and PayPal. Enterprise customers can also pay via invoice.',
      },
      {
        question: 'Do you offer refunds?',
        answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied with FORMA, contact us within 30 days of your purchase for a full refund.',
      },
      {
        question: 'What happens to my projects if I downgrade?',
        answer: 'Your existing projects remain accessible, but you won\'t be able to create new ones beyond your plan\'s limit. AI generation limits will be adjusted according to your new plan.',
      },
    ],
  },
  {
    name: 'Features',
    faqs: [
      {
        question: 'Can I export my projects?',
        answer: 'Yes! All plans include the ability to export your projects as complete Next.js or Vite + React applications. The exported code is clean, well-organized, and ready for production deployment.',
      },
      {
        question: 'Does FORMA support team collaboration?',
        answer: 'Yes, Pro and Team plans include real-time collaboration features. You can invite team members, see live cursors, and work together on the same project simultaneously.',
      },
      {
        question: 'Can I use my own components?',
        answer: 'Yes! You can create custom components in the builder and save them to your library for reuse across projects. You can also import components from the marketplace.',
      },
      {
        question: 'Is there a marketplace for components?',
        answer: 'Yes, the FORMA Marketplace allows you to browse, purchase, and sell components. You can find premium components created by the community and professional designers.',
      },
    ],
  },
  {
    name: 'Technical',
    faqs: [
      {
        question: 'What technologies does FORMA use?',
        answer: 'FORMA generates React components using TypeScript and Tailwind CSS. The exported projects support both Next.js and Vite + React setups. The builder itself is built with Next.js, React, and modern web technologies.',
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and regularly audit our systems. Enterprise plans include additional security features like SSO and audit logs.',
      },
      {
        question: 'Can I self-host FORMA?',
        answer: 'Currently, FORMA is available as a cloud-based SaaS platform. We\'re exploring self-hosted options for enterprise customers. Contact us for more information.',
      },
      {
        question: 'Do you have an API?',
        answer: 'Yes, Pro and Team plans include API access, allowing you to programmatically create and manage projects, generate components, and more. API documentation is available in your dashboard.',
      },
    ],
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.faqs.length > 0)

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
        {/* Hero */}
        <section className="pt-32 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className={pageStyles.hero.title}>
                Frequently Asked
                <br />
                <span className={pageStyles.hero.titleGradient}>
                  Questions
                </span>
              </h1>
              <p className={`${pageStyles.hero.subtitle} max-w-2xl mx-auto mb-8`}>
                Find answers to common questions about FORMA.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60 mb-4">No questions found matching your search.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-violet-400 hover:text-violet-300 transition"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredCategories.map((category, categoryIndex) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.1 }}
                  >
                    <h2 className="text-xl font-semibold text-white mb-4">{category.name}</h2>
                    <div className="space-y-3">
                      {category.faqs.map((faq, faqIndex) => {
                        const itemId = `${category.name}-${faqIndex}`
                        const isOpen = openItems.includes(itemId)

                        return (
                          <div
                            key={faq.question}
                            className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
                          >
                            <button
                              onClick={() => toggleItem(itemId)}
                              className="w-full flex items-center justify-between p-5 text-left"
                            >
                              <span className="font-medium text-white pr-4">{faq.question}</span>
                              <ChevronDown
                                className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="px-5 pb-5 text-white/60">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Still have questions? */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
            <p className="text-white/60 mb-6">
              Can't find the answer you're looking for? We're here to help.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-medium transition"
            >
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </MarketingLayout>
  )
}
