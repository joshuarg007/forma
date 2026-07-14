'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import AdminLayout from '@/components/AdminLayout'

interface Listing {
  id: string
  component_id: string
  title: string
  description: string | null
  long_description: string | null
  category: string | null
  tags: string[]
  listing_type: 'free' | 'paid'
  price_usd: number
  status: string
  is_featured: boolean
  downloads: number
  forks: number
  likes: number
  preview_images: string[]
  demo_url: string | null
  created_at: string
  published_at: string | null
  creator: {
    id: string
    username: string | null
    name: string | null
    avatar_url: string | null
    bio: string | null
  }
}

interface Project {
  id: string
  name: string
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const isAuthenticated = !!user

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fork modal state
  const [showForkModal, setShowForkModal] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [forkName, setForkName] = useState('')
  const [forking, setForking] = useState(false)

  // Purchase state
  const [purchasing, setPurchasing] = useState(false)
  const [purchased, setPurchased] = useState(false)

  useEffect(() => {
    loadListing()
  }, [params.id])

  const loadListing = async () => {
    try {
      const data = await api.get(`/api/marketplace/listing/${params.id}`)
      setListing(data)
      setForkName(data.title)
    } catch (err: any) {
      setError(err.message || 'Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await api.get('/api/projects')
      setProjects(data)
      if (data.length > 0) {
        setSelectedProject(data[0].id)
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    }
  }

  const handleForkClick = async () => {
    if (!isAuthenticated) {
      router.push('/auth?redirect=/marketplace/' + params.id)
      return
    }

    await loadProjects()
    setShowForkModal(true)
  }

  const handleFork = async () => {
    if (!selectedProject || !listing) return

    setForking(true)
    try {
      await api.post('/api/marketplace/fork', {
        listing_id: listing.id,
        target_project_id: selectedProject,
        new_name: forkName || undefined,
      })

      // Redirect to project
      router.push(`/builder/${selectedProject}`)
    } catch (err: any) {
      if (err.message?.includes('purchase')) {
        // Need to purchase first
        setShowForkModal(false)
        handlePurchase()
      } else {
        setError(err.message || 'Failed to fork component')
      }
    } finally {
      setForking(false)
    }
  }

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push('/auth?redirect=/marketplace/' + params.id)
      return
    }

    if (!listing) return

    setPurchasing(true)
    try {
      await api.post('/api/marketplace/purchase', {
        listing_id: listing.id,
      })
      setPurchased(true)
      // Now can fork
      handleForkClick()
    } catch (err: any) {
      setError(err.message || 'Failed to purchase')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forma-500" />
        </div>
      </AdminLayout>
    )
  }

  if (error || !listing) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Component Not Found</h1>
            <p className="text-white/60 mb-4">{error || 'This listing does not exist'}</p>
            <Link href="/marketplace" className="text-forma-400 hover:underline">
              Back to Marketplace
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Back link */}
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Preview */}
            <div className="aspect-video bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
              {listing.preview_images.length > 0 ? (
                <img
                  src={listing.preview_images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Title & Meta */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
                  <p className="text-white/60">{listing.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {listing.is_featured && (
                    <span className="px-3 py-1 bg-forma-500 text-white text-sm font-medium rounded-full">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              {listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {listing.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-forma-500/20 text-forma-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-white/40">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {listing.downloads} downloads
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {listing.forks} forks
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {listing.likes} likes
                </span>
              </div>
            </div>

            {/* Long Description */}
            {listing.long_description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                <div className="text-white/60 whitespace-pre-wrap">
                  {listing.long_description}
                </div>
              </div>
            )}

            {/* Demo */}
            {listing.demo_url && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Live Demo</h2>
                <a
                  href={listing.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-forma-400 hover:underline"
                >
                  View Demo
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Price & Actions */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                <div className="text-center mb-6">
                  {listing.listing_type === 'free' ? (
                    <span className="text-3xl font-bold text-emerald-400">Free</span>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-white">${listing.price_usd}</span>
                      <span className="text-white/40"> USD</span>
                    </div>
                  )}
                </div>

                {listing.listing_type === 'free' || purchased ? (
                  <button
                    onClick={handleForkClick}
                    className="w-full py-3 bg-forma-500 text-white rounded-xl font-medium hover:bg-forma-600 transition mb-3"
                  >
                    Fork to Project
                  </button>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full py-3 bg-forma-500 text-white rounded-xl font-medium hover:bg-forma-600 transition disabled:opacity-50 mb-3"
                  >
                    {purchasing ? 'Processing...' : `Purchase for $${listing.price_usd}`}
                  </button>
                )}

                <p className="text-sm text-center text-white/40">
                  Fork this component into any of your FORMA projects
                </p>
              </div>

              {/* Creator */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4">Created by</h3>
                <div className="flex items-center gap-3">
                  {listing.creator.avatar_url ? (
                    <img
                      src={listing.creator.avatar_url}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {(listing.creator.name || listing.creator.username || 'A')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">
                      {listing.creator.name || listing.creator.username || 'Anonymous'}
                    </p>
                    {listing.creator.username && (
                      <p className="text-sm text-white/40">@{listing.creator.username}</p>
                    )}
                  </div>
                </div>
                {listing.creator.bio && (
                  <p className="mt-3 text-sm text-white/60">{listing.creator.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fork Modal */}
      {showForkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-forma-950 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Fork Component</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-2">Target Project</label>
              {projects.length === 0 ? (
                <p className="text-white/40 text-sm">
                  No projects found.{' '}
                  <Link href="/dashboard" className="text-forma-400 hover:underline">
                    Create a project first
                  </Link>
                </p>
              ) : (
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Component Name</label>
              <input
                type="text"
                value={forkName}
                onChange={(e) => setForkName(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40"
                placeholder="Component name"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForkModal(false)}
                className="flex-1 py-2 border border-white/10 rounded-xl text-white/80 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFork}
                disabled={forking || !selectedProject}
                className="flex-1 py-2 bg-forma-500 text-white rounded-xl hover:bg-forma-600 transition disabled:opacity-50"
              >
                {forking ? 'Forking...' : 'Fork Component'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
