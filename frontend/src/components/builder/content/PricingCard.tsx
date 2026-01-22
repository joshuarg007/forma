'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface PricingFeature {
  text: string
  included: boolean
}

interface PricingCardProps extends ModuleProps {
  name?: string
  description?: string
  price?: string
  priceSubtext?: string
  billingPeriod?: string
  features?: PricingFeature[]
  ctaText?: string
  ctaLink?: string
  highlighted?: boolean
  highlightLabel?: string
  variant?: 'simple' | 'bordered' | 'gradient'
}

const defaultFeatures: PricingFeature[] = [
  { text: 'Unlimited projects', included: true },
  { text: 'Priority support', included: true },
  { text: 'Advanced analytics', included: true },
  { text: 'Custom integrations', included: true },
  { text: 'API access', included: false },
  { text: 'White-label options', included: false },
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

export default function PricingCard({
  id,
  className,
  styles,
  name = 'Professional',
  description = 'Perfect for growing teams and businesses',
  price = '$49',
  priceSubtext,
  billingPeriod = '/month',
  features = defaultFeatures,
  ctaText = 'Get Started',
  ctaLink = '#',
  highlighted = false,
  highlightLabel = 'Most Popular',
  variant = 'bordered',
}: PricingCardProps) {
  const isGradient = variant === 'gradient' || highlighted

  return (
    <div
      id={id}
      className={cn(
        'relative p-8 rounded-2xl flex flex-col',
        variant === 'simple' && 'bg-white',
        variant === 'bordered' && !highlighted && 'bg-white border border-gray-200',
        variant === 'bordered' && highlighted && 'bg-white border-2 border-indigo-600',
        isGradient && 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white',
        className
      )}
      style={styles}
    >
      {/* Highlight Label */}
      {highlighted && !isGradient && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            {highlightLabel}
          </span>
        </div>
      )}
      {highlighted && isGradient && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-white text-indigo-600 px-4 py-1 rounded-full text-sm font-medium shadow-lg">
            {highlightLabel}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className={cn(
          'text-xl font-bold mb-2',
          isGradient ? 'text-white' : 'text-gray-900'
        )}>
          {name}
        </h3>
        <p className={cn(
          'text-sm',
          isGradient ? 'text-indigo-100' : 'text-gray-500'
        )}>
          {description}
        </p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className={cn(
            'text-5xl font-bold',
            isGradient ? 'text-white' : 'text-gray-900'
          )}>
            {price}
          </span>
          <span className={cn(
            'text-lg',
            isGradient ? 'text-indigo-100' : 'text-gray-500'
          )}>
            {billingPeriod}
          </span>
        </div>
        {priceSubtext && (
          <p className={cn(
            'text-sm mt-1',
            isGradient ? 'text-indigo-100' : 'text-gray-500'
          )}>
            {priceSubtext}
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            {feature.included ? (
              isGradient ? (
                <svg className="w-5 h-5 text-indigo-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <CheckIcon />
              )
            ) : (
              isGradient ? (
                <svg className="w-5 h-5 text-indigo-300/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <XIcon />
              )
            )}
            <span className={cn(
              feature.included
                ? isGradient ? 'text-white' : 'text-gray-700'
                : isGradient ? 'text-indigo-300/70' : 'text-gray-400'
            )}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <a
        href={ctaLink}
        className={cn(
          'block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all',
          isGradient
            ? 'bg-white text-indigo-600 hover:bg-indigo-50'
            : highlighted
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        )}
      >
        {ctaText}
      </a>
    </div>
  )
}

PricingCard.displayName = 'PricingCard'

PricingCard.config = {
  id: 'pricing-card',
  name: 'Pricing Card',
  category: 'content',
  description: 'Pricing tier card with features and CTA',
  defaultProps: {
    name: 'Professional',
    description: 'Perfect for growing teams and businesses',
    price: '$49',
    billingPeriod: '/month',
    features: defaultFeatures,
    ctaText: 'Get Started',
    ctaLink: '#',
    highlighted: false,
    highlightLabel: 'Most Popular',
    variant: 'bordered',
  },
  editableFields: [
    { name: 'name', label: 'Plan Name', type: 'text', defaultValue: 'Professional' },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'price', label: 'Price', type: 'text', defaultValue: '$49' },
    { name: 'priceSubtext', label: 'Price Subtext', type: 'text' },
    { name: 'billingPeriod', label: 'Billing Period', type: 'text', defaultValue: '/month' },
    { name: 'features', label: 'Features', type: 'array' },
    { name: 'ctaText', label: 'Button Text', type: 'text', defaultValue: 'Get Started' },
    { name: 'ctaLink', label: 'Button Link', type: 'url' },
    { name: 'highlighted', label: 'Highlighted', type: 'boolean', defaultValue: false },
    { name: 'highlightLabel', label: 'Highlight Label', type: 'text', defaultValue: 'Most Popular' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['simple', 'bordered', 'gradient'], defaultValue: 'bordered' },
  ],
}
