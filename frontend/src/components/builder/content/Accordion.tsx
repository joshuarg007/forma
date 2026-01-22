'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface AccordionItem {
  title: string
  content: string
  icon?: string
}

interface AccordionProps extends ModuleProps {
  items?: AccordionItem[]
  allowMultiple?: boolean
  variant?: 'simple' | 'bordered' | 'separated' | 'filled'
  iconPosition?: 'left' | 'right'
  defaultOpen?: number[]
}

const defaultItems: AccordionItem[] = [
  {
    title: 'What is included in the free plan?',
    content: 'The free plan includes up to 5 projects, 10GB of storage, basic analytics, and email support. Perfect for getting started and exploring our platform.',
  },
  {
    title: 'How do I upgrade my subscription?',
    content: 'You can upgrade your subscription at any time from your account settings. Go to Settings > Billing > Upgrade Plan. The new features will be available immediately.',
  },
  {
    title: 'Can I cancel my subscription anytime?',
    content: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of the current billing period. No questions asked.',
  },
  {
    title: 'Do you offer refunds?',
    content: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact our support team within 30 days for a full refund.',
  },
  {
    title: 'Is my data secure?',
    content: 'Absolutely. We use bank-level encryption (AES-256) for all data. Our infrastructure is SOC 2 Type II certified and we perform regular security audits.',
  },
]

export default function Accordion({
  id,
  className,
  styles,
  items = defaultItems,
  allowMultiple = false,
  variant = 'bordered',
  iconPosition = 'right',
  defaultOpen = [0],
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<number[]>(defaultOpen)

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      )
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]))
    }
  }

  const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg
      className={cn(
        'w-5 h-5 transition-transform duration-300',
        isOpen && 'rotate-180'
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  const variantClasses = {
    simple: {
      wrapper: 'divide-y divide-gray-200',
      item: '',
      button: 'py-4',
      content: 'pb-4',
    },
    bordered: {
      wrapper: 'border border-gray-200 rounded-xl divide-y divide-gray-200 overflow-hidden',
      item: '',
      button: 'px-6 py-4',
      content: 'px-6 pb-4',
    },
    separated: {
      wrapper: 'space-y-3',
      item: 'border border-gray-200 rounded-xl overflow-hidden',
      button: 'px-6 py-4',
      content: 'px-6 pb-4',
    },
    filled: {
      wrapper: 'space-y-3',
      item: 'bg-gray-50 rounded-xl overflow-hidden',
      button: 'px-6 py-4',
      content: 'px-6 pb-4',
    },
  }

  const classes = variantClasses[variant]

  return (
    <div id={id} className={cn(classes.wrapper, className)} style={styles}>
      {items.map((item, index) => {
        const isOpen = openItems.includes(index)
        return (
          <div key={index} className={classes.item}>
            <button
              onClick={() => toggleItem(index)}
              className={cn(
                'w-full flex items-center gap-4 text-left transition-colors',
                classes.button,
                isOpen ? 'text-indigo-600' : 'text-gray-900 hover:text-indigo-600'
              )}
            >
              {iconPosition === 'left' && (
                <span className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                )}>
                  <ChevronIcon isOpen={isOpen} />
                </span>
              )}
              <span className="flex-1 font-medium">{item.title}</span>
              {iconPosition === 'right' && (
                <span className={cn(
                  'flex-shrink-0 transition-colors',
                  isOpen ? 'text-indigo-600' : 'text-gray-400'
                )}>
                  <ChevronIcon isOpen={isOpen} />
                </span>
              )}
            </button>
            <div
              className={cn(
                'grid transition-all duration-300 ease-in-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <div className={cn(classes.content, 'text-gray-600 leading-relaxed')}>
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

Accordion.displayName = 'Accordion'

Accordion.config = {
  id: 'accordion',
  name: 'Accordion',
  category: 'content',
  description: 'Collapsible accordion for FAQ and content',
  defaultProps: {
    items: defaultItems,
    allowMultiple: false,
    variant: 'bordered',
    iconPosition: 'right',
    defaultOpen: [0],
  },
  editableFields: [
    { name: 'items', label: 'Accordion Items', type: 'array' },
    { name: 'allowMultiple', label: 'Allow Multiple Open', type: 'boolean', defaultValue: false },
    { name: 'variant', label: 'Variant', type: 'select', options: ['simple', 'bordered', 'separated', 'filled'], defaultValue: 'bordered' },
    { name: 'iconPosition', label: 'Icon Position', type: 'select', options: ['left', 'right'], defaultValue: 'right' },
  ],
}
