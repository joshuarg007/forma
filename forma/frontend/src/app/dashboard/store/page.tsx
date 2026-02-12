'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus, Trash2, Search, Store, Edit2, Package, ShoppingCart,
  DollarSign, ChevronDown, Eye, TrendingUp, Archive, CheckCircle, Clock
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import { api } from '@/lib/api'

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  draft: 'bg-yellow-500/20 text-yellow-400',
  archived: 'bg-white/10 text-white/40',
}

const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-green-500/20 text-green-400',
  shipped: 'bg-blue-500/20 text-blue-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
  refunded: 'bg-white/10 text-white/40',
}

export default function StorePage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()

  const [tab, setTab] = useState<'products' | 'orders'>('products')
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('')

  useEffect(() => { checkAuth() }, [checkAuth])
  useEffect(() => {
    if (initialized && !user) router.push('/auth')
  }, [user, initialized, router])
  useEffect(() => {
    if (user) fetchProjects()
  }, [user, fetchProjects])
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) setSelectedProject(projects[0].id)
  }, [projects, selectedProject])

  useEffect(() => {
    if (selectedProject) loadData()
  }, [selectedProject, tab])

  async function loadData() {
    setLoading(true)
    try {
      if (tab === 'products') {
        const res = await api.getProducts(selectedProject, { search: searchQuery || undefined })
        setProducts(res.products || res || [])
      } else {
        const res = await api.getOrders(selectedProject)
        setOrders(res.orders || res || [])
      }
    } catch {
      setProducts([])
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProduct() {
    try {
      await api.createProduct(selectedProject, {
        name: 'New Product',
        slug: `product-${Date.now()}`,
        price: 0,
        status: 'draft',
      })
      loadData()
    } catch (err: any) {
      alert(err.message || 'Failed to create product')
    }
  }

  async function handleDeleteProduct(productId: string) {
    if (!confirm('Delete this product?')) return
    try {
      await api.deleteProduct(selectedProject, productId)
      setProducts(products.filter(p => p.id !== productId))
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
    }
  }

  if (!user) return null

  const totalRevenue = orders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered').reduce((sum: number, o: any) => sum + (o.total || 0), 0)

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Store</h1>
            <p className="text-white/60 mt-1">Manage products, orders, and your online store</p>
          </div>
          {tab === 'products' && (
            <button
              onClick={handleCreateProduct}
              className="flex items-center gap-2 px-4 py-2.5 bg-forma-500 hover:bg-forma-600 text-white rounded-xl font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-forma-500/20 to-purple-500/20 border border-forma-500/30">
            <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-forma-400" /><span className="text-xs text-white/60">Products</span></div>
            <p className="text-2xl font-bold text-white">{products.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1"><ShoppingCart className="w-4 h-4 text-blue-400" /><span className="text-xs text-white/60">Orders</span></div>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-green-400" /><span className="text-xs text-white/60">Revenue</span></div>
            <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('products')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'products' ? 'bg-forma-500 text-white' : 'text-white/60 hover:text-white'}`}
          >
            Products
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'orders' ? 'bg-forma-500 text-white' : 'text-white/60 hover:text-white'}`}
          >
            Orders
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder={tab === 'products' ? 'Search products...' : 'Search orders...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-forma-500"
            />
          </div>
          <div className="relative">
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-forma-500" style={{ colorScheme: 'dark' }}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'products' ? (
          products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No products yet</h3>
              <p className="text-white/60 mb-6">Add your first product to start selling.</p>
              <button onClick={handleCreateProduct} className="inline-flex items-center gap-2 px-4 py-2.5 bg-forma-500 hover:bg-forma-600 text-white rounded-xl font-medium transition">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product: any) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition group"
                >
                  <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-medium truncate">{product.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[product.status] || statusColors.draft}`}>{product.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span className="text-white/60 font-medium">${(product.price || 0).toFixed(2)}</span>
                      {product.stock_quantity != null && <span>Stock: {product.stock_quantity}</span>}
                      <span>/{product.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          orders.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
              <p className="text-white/60">Orders will appear here when customers make purchases.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-medium">#{order.order_number || order.id?.slice(0, 8)}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${orderStatusColors[order.status] || orderStatusColors.pending}`}>{order.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>{order.customer_email}</span>
                      <span>{order.items?.length || 0} items</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="text-white font-medium">${(order.total || 0).toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </AdminLayout>
  )
}
