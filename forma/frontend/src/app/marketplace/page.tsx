'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal } from 'lucide-react'
import { api } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'

interface ListingCard {
  id: string
  title: string
  description: string | null
  category: string | null
  tags: string[]
  listing_type: 'free' | 'paid'
  price_usd: number
  downloads: number
  likes: number
  preview_image: string | null
  creator_username: string | null
  creator_avatar: string | null
}

interface Category {
  name: string
  count: number
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
]

export default function MarketplacePage() {
  const [listings, setListings] = useState<ListingCard[]>([])
  const [featured, setFeatured] = useState<ListingCard[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [listingType, setListingType] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('popular')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadCategories()
    loadFeatured()
  }, [])

  useEffect(() => {
    loadListings()
  }, [searchQuery, selectedCategory, listingType, sortBy, page])

  const loadCategories = async () => {
    try {
      const data = await api.get('/api/marketplace/categories')
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadFeatured = async () => {
    try {
      const data = await api.get('/api/marketplace/featured?limit=4')
      setFeatured(data)
    } catch (err) {
      console.error('Failed to load featured:', err)
    }
  }

  const loadListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('query', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)
      if (listingType) params.append('listing_type', listingType)
      params.append('sort_by', sortBy)
      params.append('page', page.toString())
      params.append('per_page', '12')

      const data = await api.get(`/api/marketplace/browse?${params}`)
      setListings(data.listings)
      setTotalPages(data.total_pages)
    } catch (err) {
      console.error('Failed to load listings:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Component Marketplace</h1>
          <p className="text-white/60 max-w-2xl">
            Discover, share, and monetize AI-generated React components.
            Fork into your projects with one click.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-forma-500/50 focus:border-forma-500/50"
            />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              setSelectedCategory(e.target.value || null)
              setPage(1)
            }}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-forma-500/50"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>
          <select
            value={listingType || ''}
            onChange={(e) => {
              setListingType(e.target.value || null)
              setPage(1)
            }}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-forma-500/50"
          >
            <option value="">All Types</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-forma-500/50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Featured Section */}
        {featured.length > 0 && !searchQuery && !selectedCategory && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4">Featured Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((listing) => (
                <ComponentCard key={listing.id} listing={listing} featured />
              ))}
            </div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Components'}
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-white/5 border border-white/10 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-white/60 mb-2">No components found</p>
              <p className="text-white/40">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ComponentCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-white/10 rounded-xl text-white/80 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-white/40">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-white/10 rounded-xl text-white/80 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function ComponentCard({
  listing,
  featured = false,
}: {
  listing: ListingCard
  featured?: boolean
}) {
  return (
    <Link href={`/marketplace/${listing.id}`}>
      <div
        className={`group bg-white/5 border rounded-2xl overflow-hidden hover:border-forma-500/50 transition cursor-pointer ${
          featured ? 'border-forma-500/30' : 'border-white/10'
        }`}
      >
        {/* Preview */}
        <div className="aspect-video bg-white/[0.02] relative overflow-hidden">
          {listing.preview_image ? (
            <img
              src={listing.preview_image}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
          )}
          {featured && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-forma-500 text-white text-xs font-medium rounded-lg">
              Featured
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur text-xs font-medium rounded-lg">
            {listing.listing_type === 'free' ? (
              <span className="text-emerald-400">Free</span>
            ) : (
              <span className="text-forma-400">${listing.price_usd}</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-white mb-1 truncate group-hover:text-forma-400 transition">
            {listing.title}
          </h3>
          <p className="text-sm text-white/50 line-clamp-2 mb-3">
            {listing.description || 'No description'}
          </p>

          {/* Tags */}
          {listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {listing.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-forma-500/20 text-forma-300 text-xs rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-white/40">
            <div className="flex items-center gap-1">
              {listing.creator_avatar ? (
                <img
                  src={listing.creator_avatar}
                  alt=""
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 bg-white/10 rounded-full" />
              )}
              <span>{listing.creator_username || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {listing.downloads}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {listing.likes}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
