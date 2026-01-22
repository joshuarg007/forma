'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface ComparisonFeature {
  name: string
  description?: string
  values: (boolean | string)[]
}

interface ComparisonPlan {
  name: string
  price?: string
  description?: string
  highlighted?: boolean
  ctaText?: string
  ctaLink?: string
}

interface ComparisonProps extends ModuleProps {
  title?: string
  subtitle?: string
  plans?: ComparisonPlan[]
  features?: ComparisonFeature[]
  showPrices?: boolean
  stickyHeader?: boolean
}

const defaultPlans: ComparisonPlan[] = [
  { name: 'Starter', price: '$9/mo', description: 'For individuals', ctaText: 'Get Started' },
  { name: 'Pro', price: '$29/mo', description: 'For small teams', highlighted: true, ctaText: 'Get Started' },
  { name: 'Enterprise', price: '$99/mo', description: 'For large orgs', ctaText: 'Contact Sales' },
]

const defaultFeatures: ComparisonFeature[] = [
  { name: 'Projects', values: ['5', 'Unlimited', 'Unlimited'] },
  { name: 'Storage', values: ['10 GB', '100 GB', 'Unlimited'] },
  { name: 'Team Members', values: ['1', '10', 'Unlimited'] },
  { name: 'API Access', values: [false, true, true] },
  { name: 'Custom Domain', values: [false, true, true] },
  { name: 'Analytics', values: ['Basic', 'Advanced', 'Custom'] },
  { name: 'Support', values: ['Email', 'Priority', '24/7 Phone'] },
  { name: 'SSO', values: [false, false, true] },
  { name: 'Audit Logs', values: [false, false, true] },
  { name: 'Custom Contracts', values: [false, false, true] },
]

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function Comparison({
  id,
  className,
  styles,
  title = 'Compare Plans',
  subtitle = 'Choose the right plan for your needs',
  plans = defaultPlans,
  features = defaultFeatures,
  showPrices = true,
  stickyHeader = true,
}: ComparisonProps) {
  return (
    <div id={id} className={cn('overflow-x-auto', className)} style={styles}>
      <table className="w-full min-w-[640px] border-collapse">
        {/* Header */}
        <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <tr>
            {/* Feature column header */}
            <th className="text-left p-4 bg-white border-b border-gray-200 w-1/4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 font-normal">{subtitle}</p>
              </div>
            </th>

            {/* Plan headers */}
            {plans.map((plan, index) => (
              <th
                key={index}
                className={cn(
                  'p-4 text-center border-b',
                  plan.highlighted
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-white border-gray-200'
                )}
              >
                {plan.highlighted && (
                  <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full mb-2">
                    Most Popular
                  </span>
                )}
                <h4 className={cn(
                  'text-lg font-bold',
                  plan.highlighted ? 'text-indigo-600' : 'text-gray-900'
                )}>
                  {plan.name}
                </h4>
                {showPrices && plan.price && (
                  <p className="text-2xl font-bold text-gray-900 mt-1">{plan.price}</p>
                )}
                {plan.description && (
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                )}
                {plan.ctaText && (
                  <a
                    href={plan.ctaLink || '#'}
                    className={cn(
                      'inline-block mt-4 px-6 py-2 rounded-lg font-medium transition-colors',
                      plan.highlighted
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    )}
                  >
                    {plan.ctaText}
                  </a>
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Features */}
        <tbody>
          {features.map((feature, featureIndex) => (
            <tr
              key={featureIndex}
              className={cn(
                featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              )}
            >
              {/* Feature name */}
              <td className="p-4 border-b border-gray-200">
                <span className="font-medium text-gray-900">{feature.name}</span>
                {feature.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{feature.description}</p>
                )}
              </td>

              {/* Feature values */}
              {feature.values.map((value, planIndex) => (
                <td
                  key={planIndex}
                  className={cn(
                    'p-4 text-center border-b',
                    plans[planIndex]?.highlighted
                      ? 'bg-indigo-50/50 border-indigo-100'
                      : 'border-gray-200'
                  )}
                >
                  {typeof value === 'boolean' ? (
                    value ? <CheckIcon /> : <XIcon />
                  ) : (
                    <span className={cn(
                      'text-sm font-medium',
                      plans[planIndex]?.highlighted ? 'text-indigo-600' : 'text-gray-900'
                    )}>
                      {value}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

Comparison.displayName = 'Comparison'

Comparison.config = {
  id: 'comparison',
  name: 'Comparison Table',
  category: 'content',
  description: 'Feature comparison table for plans',
  defaultProps: {
    title: 'Compare Plans',
    subtitle: 'Choose the right plan for your needs',
    plans: defaultPlans,
    features: defaultFeatures,
    showPrices: true,
    stickyHeader: true,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'plans', label: 'Plans', type: 'array' },
    { name: 'features', label: 'Features', type: 'array' },
    { name: 'showPrices', label: 'Show Prices', type: 'boolean', defaultValue: true },
    { name: 'stickyHeader', label: 'Sticky Header', type: 'boolean', defaultValue: true },
  ],
}
