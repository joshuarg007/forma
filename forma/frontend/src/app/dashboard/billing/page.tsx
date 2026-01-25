'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CreditCard, Check, Zap, Crown, Sparkles, ExternalLink,
  Receipt, Download, Calendar, AlertCircle, ArrowRight, Star
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import { api } from '@/lib/api'

interface Subscription {
  id: string
  plan: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

interface Invoice {
  id: string
  amount: number
  status: string
  created_at: string
  invoice_url: string
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    features: [
      '3 projects',
      '10 AI generations/month',
      'Basic components',
      'Community support',
    ],
    icon: <Zap className="w-6 h-6" />,
    color: 'from-gray-400 to-gray-600',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    period: 'month',
    features: [
      'Unlimited projects',
      '100 AI generations/month',
      'All components',
      'Priority support',
      'Team collaboration',
      'Export to code',
    ],
    icon: <Star className="w-6 h-6" />,
    color: 'from-forma-400 to-forma-600',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'month',
    features: [
      'Everything in Pro',
      'Unlimited AI generations',
      'Custom components',
      'Dedicated support',
      'SSO & SAML',
      'Custom integrations',
      'SLA guarantee',
    ],
    icon: <Crown className="w-6 h-6" />,
    color: 'from-purple-400 to-pink-500',
  },
]

export default function BillingPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { usage, fetchUsage } = useProjectStore()

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth')
    }
  }, [user, initialized, router])

  useEffect(() => {
    if (user) {
      loadBillingData()
      fetchUsage()
    }
  }, [user, fetchUsage])

  const loadBillingData = async () => {
    setLoading(true)
    try {
      const subData = await api.getSubscription()
      setSubscription(subData)
      // Mock invoices - in real app, would fetch from API
      setInvoices([
        {
          id: 'inv_1',
          amount: 19,
          status: 'paid',
          created_at: new Date().toISOString(),
          invoice_url: '#',
        },
      ])
    } catch (error) {
      console.error('Failed to load billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId)
    try {
      const { checkout_url } = await api.createCheckout(
        planId,
        `${window.location.origin}/dashboard/billing?success=true`,
        `${window.location.origin}/dashboard/billing?canceled=true`
      )
      window.location.href = checkout_url
    } catch (error) {
      console.error('Failed to create checkout:', error)
      setUpgrading(null)
    }
  }

  const currentPlan = user?.plan || 'free'

  if (!initialized || !user) {
    return (
      <div className="min-h-screen bg-forma-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-forma-400" />
          Billing
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Manage your subscription and billing details
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current Plan */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Current Plan</h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plans.find(p => p.id === currentPlan)?.color || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white`}>
                  {plans.find(p => p.id === currentPlan)?.icon || <Zap className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white capitalize">{currentPlan}</h3>
                  <p className="text-white/60 text-sm">
                    {subscription?.status === 'active' && subscription.current_period_end
                      ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                      : 'Free forever'}
                  </p>
                </div>
              </div>

              {subscription?.status === 'active' && (
                <button className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition text-sm">
                  Manage Subscription
                </button>
              )}
            </div>

            {/* Usage */}
            {usage && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">AI Generations Used</span>
                  <span className="text-sm text-white">
                    {usage.operations_used} / {usage.operations_limit}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-forma-400 to-purple-400 transition-all"
                    style={{ width: `${Math.min((usage.operations_used / usage.operations_limit) * 100, 100)}%` }}
                  />
                </div>
                {usage.operations_used >= usage.operations_limit * 0.8 && (
                  <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    You're running low on AI generations
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Plans */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Available Plans</h2>

            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl bg-white/5 border ${
                    plan.popular ? 'border-forma-500' : 'border-white/10'
                  } p-6 overflow-hidden`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-forma-500 text-white text-xs font-medium px-3 py-1 rounded-bl-xl">
                      Popular
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4`}>
                    {plan.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2 mb-4">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-white/40">/{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-white/80">
                        <Check className="w-4 h-4 text-forma-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {currentPlan === plan.id ? (
                    <button
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white/40 font-medium cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : plan.price > (plans.find(p => p.id === currentPlan)?.price || 0) ? (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading === plan.id}
                      className={`w-full px-4 py-2.5 rounded-xl bg-gradient-to-r ${plan.color} text-white font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50`}
                    >
                      {upgrading === plan.id ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Upgrade <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-white/60 font-medium hover:border-white/20 transition"
                    >
                      Downgrade
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Invoices */}
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-forma-400" />
                Billing History
              </h2>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No invoices yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-white/60">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-white/60">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-white/60">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-white/5 transition">
                      <td className="p-4 text-white">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-white">${invoice.amount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          invoice.status === 'paid'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={invoice.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-forma-400 hover:text-forma-300 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Payment Method</h2>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  VISA
                </div>
                <div>
                  <p className="text-white">•••• •••• •••• 4242</p>
                  <p className="text-sm text-white/40">Expires 12/25</p>
                </div>
              </div>
              <button className="text-sm text-forma-400 hover:text-forma-300">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
