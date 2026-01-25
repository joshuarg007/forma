'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles, ChevronLeft, User, CreditCard, Zap,
  Check, ExternalLink, Loader2
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/lib/api'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    ops: '100 AI ops/mo',
    features: ['3 projects', 'Code export', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    ops: '500 AI ops/mo',
    features: ['Unlimited projects', 'Priority support', 'Custom domain', 'Full design system'],
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$199',
    ops: '2,000 AI ops/mo',
    features: ['Everything in Pro', 'Team collaboration', 'SSO/SAML', 'API access'],
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const { usage, fetchUsage } = useProjectStore()

  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user) {
      fetchUsage()
    }
  }, [user, fetchUsage])

  const handleUpgrade = async (plan: string) => {
    setUpgrading(plan)
    try {
      const { checkout_url } = await api.createCheckout(
        plan,
        `${window.location.origin}/settings?success=true`,
        `${window.location.origin}/settings?canceled=true`
      )
      window.location.href = checkout_url
    } catch (error) {
      console.error('Failed to create checkout:', error)
      setUpgrading(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-forma-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forma-950 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-forma-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1 text-white/60 hover:text-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-forma-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-white">Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Account */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-forma-400" />
            <h2 className="text-xl font-semibold text-white">Account</h2>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-white/40">Email</label>
                <p className="text-white mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-white/40">Name</label>
                <p className="text-white mt-1">{user.name || 'Not set'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Usage */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-forma-400" />
            <h2 className="text-xl font-semibold text-white">Usage</h2>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            {usage ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60">AI Operations</span>
                  <span className="text-white font-medium">
                    {usage.operations_used} / {usage.operations_limit}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-forma-500 to-purple-500 transition-all"
                    style={{ width: `${Math.min(100, (usage.operations_used / usage.operations_limit) * 100)}%` }}
                  />
                </div>
                <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/40">Tokens Used</span>
                    <p className="text-white">{usage.tokens_used.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-white/40">Current Plan</span>
                    <p className="text-white capitalize">{usage.plan}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white/40">Loading usage...</div>
            )}
          </div>
        </section>

        {/* Plans */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-forma-400" />
            <h2 className="text-xl font-semibold text-white">Plans</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const isCurrent = user.plan === plan.id
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative p-6 rounded-2xl border transition ${
                    plan.popular
                      ? 'bg-forma-500/10 border-forma-500'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-forma-500 text-white text-xs font-medium">
                      Popular
                    </div>
                  )}

                  <div className="text-white/60 text-sm mb-1">{plan.name}</div>
                  <div className="text-3xl font-bold text-white mb-1">{plan.price}</div>
                  <div className="text-white/40 text-sm mb-6">{plan.ops}</div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-white/60">
                        <Check className="w-4 h-4 text-forma-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div className="w-full py-2 text-center text-white/60 text-sm">
                      Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading !== null}
                      className={`w-full py-2 rounded-lg font-medium transition disabled:opacity-50 ${
                        plan.popular
                          ? 'bg-forma-500 hover:bg-forma-600 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {upgrading === plan.id ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        'Upgrade'
                      )}
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
