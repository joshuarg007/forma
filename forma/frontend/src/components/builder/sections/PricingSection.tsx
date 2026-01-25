'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface PricingFeature {
  text: string
  included: boolean
}

interface PricingPlan {
  name: string
  description: string
  price: string
  billingPeriod: string
  features: PricingFeature[]
  ctaText: string
  highlighted?: boolean
}

interface PricingSectionProps extends ModuleProps {
  title?: string
  subtitle?: string
  description?: string
  plans?: PricingPlan[]
  showToggle?: boolean
  monthlyLabel?: string
  annualLabel?: string
  annualDiscount?: string
  background?: 'white' | 'gray' | 'gradient'
}

const defaultPlans: PricingPlan[] = [
  {
    name: 'Starter',
    description: 'Perfect for individuals',
    price: '$9',
    billingPeriod: '/month',
    features: [
      { text: '5 Projects', included: true },
      { text: '10GB Storage', included: true },
      { text: 'Basic Support', included: true },
      { text: 'Analytics', included: false },
      { text: 'Custom Domain', included: false },
    ],
    ctaText: 'Get Started',
  },
  {
    name: 'Professional',
    description: 'Perfect for growing teams',
    price: '$29',
    billingPeriod: '/month',
    features: [
      { text: 'Unlimited Projects', included: true },
      { text: '100GB Storage', included: true },
      { text: 'Priority Support', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Custom Domain', included: false },
    ],
    ctaText: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: '$99',
    billingPeriod: '/month',
    features: [
      { text: 'Unlimited Everything', included: true },
      { text: 'Unlimited Storage', included: true },
      { text: '24/7 Premium Support', included: true },
      { text: 'Custom Analytics', included: true },
      { text: 'Custom Domain', included: true },
    ],
    ctaText: 'Contact Sales',
  },
]

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function PricingSection({
  id,
  className,
  styles,
  title = 'Simple, transparent pricing',
  subtitle = 'Pricing',
  description = 'Choose the plan that works best for you and your team',
  plans = defaultPlans,
  showToggle = true,
  monthlyLabel = 'Monthly',
  annualLabel = 'Annual',
  annualDiscount = 'Save 20%',
  background = 'gray',
}: PricingSectionProps) {
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {subtitle && (
            <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              {subtitle}
            </span>
          )}
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600">{description}</p>

          {/* Toggle */}
          {showToggle && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className="text-gray-600 font-medium">{monthlyLabel}</span>
              <button className="relative w-14 h-7 bg-indigo-600 rounded-full transition-colors">
                <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform" />
              </button>
              <span className="text-gray-600 font-medium">{annualLabel}</span>
              {annualDiscount && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  {annualDiscount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                'relative p-8 rounded-2xl flex flex-col',
                plan.highlighted
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white scale-105 shadow-xl z-10'
                  : 'bg-white border border-gray-200'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-indigo-600 px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={cn(
                  'text-xl font-bold mb-2',
                  plan.highlighted ? 'text-white' : 'text-gray-900'
                )}>
                  {plan.name}
                </h3>
                <p className={cn(
                  'text-sm',
                  plan.highlighted ? 'text-indigo-100' : 'text-gray-500'
                )}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    'text-5xl font-bold',
                    plan.highlighted ? 'text-white' : 'text-gray-900'
                  )}>
                    {plan.price}
                  </span>
                  <span className={cn(
                    'text-lg',
                    plan.highlighted ? 'text-indigo-100' : 'text-gray-500'
                  )}>
                    {plan.billingPeriod}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    {feature.included ? (
                      plan.highlighted ? (
                        <svg className="w-5 h-5 text-indigo-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <CheckIcon />
                      )
                    ) : (
                      plan.highlighted ? (
                        <svg className="w-5 h-5 text-indigo-300/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <XIcon />
                      )
                    )}
                    <span className={cn(
                      feature.included
                        ? plan.highlighted ? 'text-white' : 'text-gray-700'
                        : plan.highlighted ? 'text-indigo-300/70' : 'text-gray-400'
                    )}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={cn(
                  'block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all',
                  plan.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                )}
              >
                {plan.ctaText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

PricingSection.displayName = 'PricingSection'

PricingSection.config = {
  id: 'pricing-section',
  name: 'Pricing Section',
  category: 'sections',
  description: 'Full pricing section with multiple plan cards',
  defaultProps: {
    title: 'Simple, transparent pricing',
    subtitle: 'Pricing',
    description: 'Choose the plan that works best for you and your team',
    plans: defaultPlans,
    showToggle: true,
    monthlyLabel: 'Monthly',
    annualLabel: 'Annual',
    annualDiscount: 'Save 20%',
    background: 'gray',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'plans', label: 'Pricing Plans', type: 'array' },
    { name: 'showToggle', label: 'Show Toggle', type: 'boolean', defaultValue: true },
    { name: 'monthlyLabel', label: 'Monthly Label', type: 'text' },
    { name: 'annualLabel', label: 'Annual Label', type: 'text' },
    { name: 'annualDiscount', label: 'Annual Discount Text', type: 'text' },
    { name: 'background', label: 'Background', type: 'select', options: ['white', 'gray', 'gradient'], defaultValue: 'gray' },
  ],
}
