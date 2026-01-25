'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps extends ModuleProps {
  title?: string
  subtitle?: string
  description?: string
  items?: FAQItem[]
  layout?: 'accordion' | 'grid' | 'columns'
  allowMultiple?: boolean
  showContactCTA?: boolean
  contactTitle?: string
  contactDescription?: string
  contactButtonText?: string
  contactButtonLink?: string
  background?: 'white' | 'gray' | 'gradient'
}

const defaultItems: FAQItem[] = [
  {
    question: 'How do I get started?',
    answer: 'Getting started is easy! Simply sign up for a free account, and you\'ll be guided through our onboarding process. You can start using the platform immediately.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for enterprise customers.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. If you cancel, you\'ll continue to have access until the end of your billing period.',
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption and security practices. Your data is stored in SOC 2 compliant data centers.',
  },
  {
    question: 'Do you offer customer support?',
    answer: 'Yes, we offer 24/7 customer support via chat, email, and phone for all paid plans. Free users have access to our community forums and knowledge base.',
  },
]

export default function FAQSection({
  id,
  className,
  styles,
  title = 'Frequently asked questions',
  subtitle = 'FAQ',
  description = 'Everything you need to know about our product',
  items = defaultItems,
  layout = 'accordion',
  allowMultiple = false,
  showContactCTA = true,
  contactTitle = 'Still have questions?',
  contactDescription = 'Can\'t find the answer you\'re looking for? Our team is here to help.',
  contactButtonText = 'Contact Support',
  contactButtonLink = '#',
  background = 'white',
}: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<number[]>([0])

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      )
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]))
    }
  }

  return (
    <section
      id={id}
      className={cn(
        'py-20 px-4',
        background === 'white' && 'bg-white',
        background === 'gray' && 'bg-gray-50',
        background === 'gradient' && 'bg-gradient-to-br from-indigo-50 to-purple-50',
        className
      )}
      style={styles}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          {subtitle && (
            <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              {subtitle}
            </span>
          )}
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600">{description}</p>
        </div>

        {/* FAQ Items */}
        {layout === 'accordion' ? (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                  <svg
                    className={cn(
                      'w-5 h-5 text-gray-500 flex-shrink-0 transition-transform',
                      openItems.includes(index) && 'rotate-180'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : layout === 'grid' ? (
          <div className="grid md:grid-cols-2 gap-8">
            {items.map((item, index) => (
              <div key={index} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">{item.question}</h3>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
            {items.map((item, index) => (
              <div key={index}>
                <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        {showContactCTA && (
          <div className="mt-16 text-center p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">{contactTitle}</h3>
            <p className="text-indigo-100 mb-6">{contactDescription}</p>
            <a
              href={contactButtonLink}
              className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {contactButtonText}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

FAQSection.displayName = 'FAQSection'

FAQSection.config = {
  id: 'faq-section',
  name: 'FAQ Section',
  category: 'sections',
  description: 'FAQ section with accordion or grid layout',
  defaultProps: {
    title: 'Frequently asked questions',
    subtitle: 'FAQ',
    description: 'Everything you need to know about our product',
    items: defaultItems,
    layout: 'accordion',
    allowMultiple: false,
    showContactCTA: true,
    contactTitle: 'Still have questions?',
    contactDescription: 'Can\'t find the answer you\'re looking for? Our team is here to help.',
    contactButtonText: 'Contact Support',
    contactButtonLink: '#',
    background: 'white',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'items', label: 'FAQ Items', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['accordion', 'grid', 'columns'], defaultValue: 'accordion' },
    { name: 'allowMultiple', label: 'Allow Multiple Open', type: 'boolean', defaultValue: false },
    { name: 'showContactCTA', label: 'Show Contact CTA', type: 'boolean', defaultValue: true },
    { name: 'contactTitle', label: 'Contact Title', type: 'text' },
    { name: 'contactDescription', label: 'Contact Description', type: 'text' },
    { name: 'contactButtonText', label: 'Contact Button Text', type: 'text' },
    { name: 'contactButtonLink', label: 'Contact Button Link', type: 'url' },
    { name: 'background', label: 'Background', type: 'select', options: ['white', 'gray', 'gradient'], defaultValue: 'white' },
  ],
}
