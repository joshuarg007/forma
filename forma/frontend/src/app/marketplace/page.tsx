'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">F</span>
              </div>
              <span className="text-xl font-bold">FORMA</span>
              <span className="text-muted-foreground">Marketplace</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Dashboard
              </Link>
              <Link
                href="/marketplace/publish"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                Publish Component
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Component Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover, share, and monetize AI-generated React components.
            Fork into your projects with one click.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              setSelectedCategory(e.target.value || null)
              setPage(1)
            }}
            className="px-4 py-3 bg-zinc-900 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="" className="bg-zinc-900 text-white">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name} className="bg-zinc-900 text-white">
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
            className="px-4 py-3 bg-zinc-900 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="" className="bg-zinc-900 text-white">All Types</option>
            <option value="free" className="bg-zinc-900 text-white">Free</option>
            <option value="paid" className="bg-zinc-900 text-white">Paid</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            className="px-4 py-3 bg-zinc-900 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Featured Section */}
        {featured.length > 0 && !searchQuery && !selectedCategory && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((listing) => (
                <ComponentCard key={listing.id} listing={listing} featured />
              ))}
            </div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Components'}
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-card border border-border rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-xl mb-2">No components found</p>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
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
        className={`group bg-card border rounded-xl overflow-hidden hover:border-primary transition cursor-pointer ${
          featured ? 'border-primary/50' : 'border-border'
        }`}
      >
        {/* Preview */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {listing.preview_image ? (
            <img
              src={listing.preview_image}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
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
            <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
              Featured
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur text-xs font-medium rounded">
            {listing.listing_type === 'free' ? (
              <span className="text-green-500">Free</span>
            ) : (
              <span className="text-primary">${listing.price_usd}</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold mb-1 truncate">{listing.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {listing.description || 'No description'}
          </p>

          {/* Tags */}
          {listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {listing.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {listing.creator_avatar ? (
                <img
                  src={listing.creator_avatar}
                  alt=""
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 bg-accent rounded-full" />
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
