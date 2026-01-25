'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Users, ShoppingCart, Sparkles, Check } from 'lucide-react'
import type { SchemaDefinition } from '@/types/schema'

interface Template {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  collections: string[]
  schema: SchemaDefinition
}

const templates: Template[] = [
  {
    id: 'blog',
    name: 'Blog',
    description: 'Posts, authors, categories, and comments',
    icon: <FileText className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    collections: ['user', 'post', 'category', 'comment', 'tag'],
    schema: {
      version: '1.0',
      name: 'blog',
      description: 'A blog with posts, comments, and categories',
      collections: {
        user: {
          auth: true,
          timestamps: true,
          fields: {
            email: { type: 'email', required: true, unique: true },
            password_hash: { type: 'text', required: true },
            name: { type: 'text', required: true },
            bio: { type: 'text' },
            avatar: { type: 'file' },
            role: { type: 'enum', options: ['admin', 'author', 'reader'], default: 'reader' }
          }
        },
        category: {
          timestamps: true,
          fields: {
            name: { type: 'text', required: true },
            slug: { type: 'text', unique: true },
            description: { type: 'text' }
          }
        },
        tag: {
          fields: {
            name: { type: 'text', required: true, unique: true },
            slug: { type: 'text', unique: true }
          }
        },
        post: {
          timestamps: true,
          softDelete: true,
          fields: {
            title: { type: 'text', required: true },
            slug: { type: 'text', unique: true },
            content: { type: 'richtext' },
            excerpt: { type: 'text' },
            author: { type: 'relation', target: 'user', relation: 'many-to-one', required: true },
            category: { type: 'relation', target: 'category', relation: 'many-to-one' },
            featured_image: { type: 'file' },
            status: { type: 'enum', options: ['draft', 'published', 'archived'], default: 'draft' },
            published_at: { type: 'datetime' },
            views: { type: 'integer', default: 0 }
          },
          permissions: {
            read: 'public',
            create: 'authenticated',
            update: 'owner',
            delete: 'admin'
          }
        },
        comment: {
          timestamps: true,
          fields: {
            post: { type: 'relation', target: 'post', relation: 'many-to-one', required: true },
            author: { type: 'relation', target: 'user', relation: 'many-to-one', required: true },
            content: { type: 'text', required: true },
            status: { type: 'enum', options: ['pending', 'approved', 'spam'], default: 'pending' }
          },
          permissions: {
            read: 'public',
            create: 'authenticated',
            update: 'owner',
            delete: 'admin'
          }
        }
      }
    }
  },
  {
    id: 'saas',
    name: 'SaaS',
    description: 'Users, teams, subscriptions, and billing',
    icon: <Users className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    collections: ['user', 'organization', 'team', 'subscription', 'invoice'],
    schema: {
      version: '1.0',
      name: 'saas',
      description: 'A SaaS application with organizations, teams, and subscriptions',
      collections: {
        user: {
          auth: true,
          timestamps: true,
          fields: {
            email: { type: 'email', required: true, unique: true },
            password_hash: { type: 'text', required: true },
            name: { type: 'text', required: true },
            avatar: { type: 'file' },
            role: { type: 'enum', options: ['super_admin', 'admin', 'member'], default: 'member' },
            onboarding_completed: { type: 'boolean', default: false }
          }
        },
        organization: {
          timestamps: true,
          fields: {
            name: { type: 'text', required: true },
            slug: { type: 'text', unique: true },
            logo: { type: 'file' },
            owner: { type: 'relation', target: 'user', relation: 'many-to-one', required: true },
            plan: { type: 'enum', options: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
            settings: { type: 'json' }
          }
        },
        team: {
          timestamps: true,
          fields: {
            name: { type: 'text', required: true },
            organization: { type: 'relation', target: 'organization', relation: 'many-to-one', required: true },
            description: { type: 'text' }
          }
        },
        team_member: {
          timestamps: true,
          fields: {
            team: { type: 'relation', target: 'team', relation: 'many-to-one', required: true },
            user: { type: 'relation', target: 'user', relation: 'many-to-one', required: true },
            role: { type: 'enum', options: ['owner', 'admin', 'member'], default: 'member' }
          }
        },
        subscription: {
          timestamps: true,
          fields: {
            organization: { type: 'relation', target: 'organization', relation: 'many-to-one', required: true },
            plan: { type: 'enum', options: ['free', 'starter', 'pro', 'enterprise'], required: true },
            status: { type: 'enum', options: ['active', 'past_due', 'canceled', 'trialing'], default: 'trialing' },
            stripe_subscription_id: { type: 'text' },
            current_period_start: { type: 'datetime' },
            current_period_end: { type: 'datetime' },
            cancel_at_period_end: { type: 'boolean', default: false }
          }
        },
        invoice: {
          timestamps: true,
          fields: {
            organization: { type: 'relation', target: 'organization', relation: 'many-to-one', required: true },
            stripe_invoice_id: { type: 'text' },
            amount: { type: 'integer', required: true },
            currency: { type: 'text', default: 'usd' },
            status: { type: 'enum', options: ['draft', 'open', 'paid', 'void', 'uncollectible'], default: 'draft' },
            paid_at: { type: 'datetime' },
            pdf_url: { type: 'text' }
          }
        }
      }
    }
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Products, orders, customers, and reviews',
    icon: <ShoppingCart className="w-6 h-6" />,
    color: 'from-emerald-500 to-emerald-600',
    collections: ['user', 'category', 'product', 'order', 'review'],
    schema: {
      version: '1.0',
      name: 'ecommerce',
      description: 'An e-commerce application with products, orders, and customers',
      collections: {
        user: {
          auth: true,
          timestamps: true,
          fields: {
            email: { type: 'email', required: true, unique: true },
            password_hash: { type: 'text', required: true },
            name: { type: 'text', required: true },
            phone: { type: 'text' },
            role: { type: 'enum', options: ['admin', 'staff', 'customer'], default: 'customer' }
          }
        },
        category: {
          fields: {
            name: { type: 'text', required: true },
            slug: { type: 'text', unique: true },
            description: { type: 'text' },
            image: { type: 'file' },
            parent: { type: 'relation', target: 'category', relation: 'many-to-one' },
            sort_order: { type: 'integer', default: 0 }
          }
        },
        product: {
          timestamps: true,
          softDelete: true,
          fields: {
            name: { type: 'text', required: true },
            slug: { type: 'text', unique: true },
            description: { type: 'richtext' },
            sku: { type: 'text', unique: true },
            price: { type: 'integer', required: true },
            compare_at_price: { type: 'integer' },
            category: { type: 'relation', target: 'category', relation: 'many-to-one' },
            images: { type: 'json' },
            status: { type: 'enum', options: ['draft', 'active', 'archived'], default: 'draft' },
            inventory_quantity: { type: 'integer', default: 0 },
            featured: { type: 'boolean', default: false }
          }
        },
        address: {
          timestamps: true,
          fields: {
            user: { type: 'relation', target: 'user', relation: 'many-to-one', required: true },
            name: { type: 'text', required: true },
            address1: { type: 'text', required: true },
            address2: { type: 'text' },
            city: { type: 'text', required: true },
            state: { type: 'text' },
            postal_code: { type: 'text', required: true },
            country: { type: 'text', required: true },
            is_default: { type: 'boolean', default: false }
          }
        },
        order: {
          timestamps: true,
          softDelete: true,
          fields: {
            order_number: { type: 'text', unique: true, required: true },
            customer: { type: 'relation', target: 'user', relation: 'many-to-one', required: true },
            email: { type: 'email', required: true },
            shipping_address: { type: 'json', required: true },
            status: { type: 'enum', options: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
            subtotal: { type: 'integer', required: true },
            shipping_cost: { type: 'integer', default: 0 },
            tax: { type: 'integer', default: 0 },
            total: { type: 'integer', required: true }
          }
        },
        order_item: {
          timestamps: true,
          fields: {
            order: { type: 'relation', target: 'order', relation: 'many-to-one', required: true },
            product: { type: 'relation', target: 'product', relation: 'many-to-one', required: true },
            name: { type: 'text', required: true },
            quantity: { type: 'integer', required: true },
            unit_price: { type: 'integer', required: true },
            total: { type: 'integer', required: true }
          }
        },
        review: {
          timestamps: true,
          fields: {
            product: { type: 'relation', target: 'product', relation: 'many-to-one', required: true },
            user: { type: 'relation', target: 'user', relation: 'many-to-one', required: true },
            rating: { type: 'integer', required: true },
            title: { type: 'text' },
            content: { type: 'text' },
            status: { type: 'enum', options: ['pending', 'approved', 'rejected'], default: 'pending' }
          }
        }
      }
    }
  }
]

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (schema: SchemaDefinition) => void
}

export function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleUseTemplate = () => {
    const template = templates.find(t => t.id === selectedTemplate)
    if (template) {
      onSelect(template.schema)
      onClose()
      setSelectedTemplate(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
          >
            <div className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Start from a Template</h2>
                    <p className="text-sm text-zinc-400">Choose a template to jumpstart your project</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Template Grid */}
              <div className="p-6 grid gap-4">
                {templates.map((template) => (
                  <motion.button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedTemplate === template.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${template.color} text-white shrink-0`}>
                      {template.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-zinc-400 mb-2">{template.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {template.collections.map((collection) => (
                          <span
                            key={collection}
                            className="px-2 py-0.5 text-xs font-medium bg-zinc-700 text-zinc-300 rounded"
                          >
                            {collection}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {selectedTemplate === template.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 p-1 bg-violet-500 rounded-full"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-700 bg-zinc-800/50">
                <p className="text-sm text-zinc-400">
                  Templates include authentication and common patterns
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUseTemplate}
                    disabled={!selectedTemplate}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      selectedTemplate
                        ? 'bg-violet-600 hover:bg-violet-500 text-white'
                        : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
