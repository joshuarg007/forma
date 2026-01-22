'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Upload, Package, Tag, DollarSign, Image, FileCode, Eye,
  Check, AlertCircle, X, ChevronRight, Globe, Lock, Sparkles
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import { api } from '@/lib/api'

const categories = [
  'Heroes',
  'Features',
  'Pricing',
  'Testimonials',
  'Forms',
  'Footers',
  'Navigation',
  'Cards',
  'Galleries',
  'CTAs',
  'Stats',
  'Teams',
  'FAQs',
  'Other',
]

export default function PublishPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()

  const [step, setStep] = useState(1)
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedComponent, setSelectedComponent] = useState('')
  const [components, setComponents] = useState<any[]>([])
  const [loadingComponents, setLoadingComponents] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [pricing, setPricing] = useState<'free' | 'paid'>('free')
  const [price, setPrice] = useState('')
  const [previewImage, setPreviewImage] = useState<File | null>(null)

  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
      fetchProjects()
    }
  }, [user, fetchProjects])

  useEffect(() => {
    if (selectedProject) {
      loadProjectComponents()
    }
  }, [selectedProject])

  const loadProjectComponents = async () => {
    setLoadingComponents(true)
    try {
      const projectComponents = await api.getComponents(selectedProject)
      setComponents(projectComponents)
    } catch (error) {
      console.error('Failed to load components:', error)
    } finally {
      setLoadingComponents(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handlePublish = async () => {
    setError('')

    if (!name.trim()) {
      setError('Please enter a component name')
      return
    }
    if (!description.trim()) {
      setError('Please enter a description')
      return
    }
    if (!category) {
      setError('Please select a category')
      return
    }
    if (pricing === 'paid' && (!price || parseFloat(price) <= 0)) {
      setError('Please enter a valid price')
      return
    }

    setPublishing(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || 'Failed to publish component')
    } finally {
      setPublishing(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return selectedProject && selectedComponent
    if (step === 2) return name.trim() && description.trim() && category
    if (step === 3) return pricing === 'free' || (price && parseFloat(price) > 0)
    return true
  }

  if (!initialized || !user) {
    return (
      <div className="min-h-screen bg-forma-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (success) {
    return (
      <AdminLayout>
        <div className="max-w-lg mx-auto text-center py-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Component Published!</h1>
          <p className="text-white/60 mb-6">
            Your component is now available in the marketplace.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/marketplace')}
              className="px-6 py-2.5 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition"
            >
              View in Marketplace
            </button>
            <button
              onClick={() => {
                setSuccess(false)
                setStep(1)
                setSelectedProject('')
                setSelectedComponent('')
                setName('')
                setDescription('')
                setCategory('')
                setTags([])
                setVisibility('public')
                setPricing('free')
                setPrice('')
              }}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition"
            >
              Publish Another
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Upload className="w-6 h-6 text-forma-400" />
          Publish Component
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Share your component with the community
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                step >= s
                  ? 'bg-forma-500 text-white'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-20 h-0.5 mx-2 ${step > s ? 'bg-forma-500' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Select Component */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Select Component</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => {
                      setSelectedProject(e.target.value)
                      setSelectedComponent('')
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-forma-500 transition"
                  >
                    <option value="" className="bg-forma-900">Select a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id} className="bg-forma-900">
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProject && (
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Component</label>
                    {loadingComponents ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-forma-500 border-t-transparent rounded-full" />
                      </div>
                    ) : components.length === 0 ? (
                      <div className="text-center py-8">
                        <FileCode className="w-10 h-10 text-white/20 mx-auto mb-2" />
                        <p className="text-white/60">No components in this project</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {components.map((component) => (
                          <button
                            key={component.id}
                            onClick={() => setSelectedComponent(component.id)}
                            className={`w-full p-4 rounded-xl border text-left transition ${
                              selectedComponent === component.id
                                ? 'bg-forma-500/20 border-forma-500'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-forma-500/20 to-purple-500/20 flex items-center justify-center">
                                <FileCode className="w-5 h-5 text-forma-400" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{component.name}</p>
                                <p className="text-sm text-white/40 truncate">
                                  {component.intent || 'No description'}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Component Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Component Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Modern Hero Section"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what your component does and its features..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-forma-500 transition"
                  >
                    <option value="" className="bg-forma-900">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-forma-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Tags (up to 5)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-forma-500/20 text-forma-400 text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-white transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {tags.length < 5 && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add a tag..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                      />
                      <button
                        onClick={addTag}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Pricing & Visibility */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Pricing & Visibility</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-white/60 mb-3">Visibility</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setVisibility('public')}
                      className={`p-4 rounded-xl border text-left transition ${
                        visibility === 'public'
                          ? 'bg-forma-500/20 border-forma-500'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Globe className="w-5 h-5 text-forma-400 mb-2" />
                      <p className="font-medium text-white">Public</p>
                      <p className="text-sm text-white/40">Anyone can see and use</p>
                    </button>
                    <button
                      onClick={() => setVisibility('private')}
                      className={`p-4 rounded-xl border text-left transition ${
                        visibility === 'private'
                          ? 'bg-forma-500/20 border-forma-500'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Lock className="w-5 h-5 text-forma-400 mb-2" />
                      <p className="font-medium text-white">Private</p>
                      <p className="text-sm text-white/40">Only you can access</p>
                    </button>
                  </div>
                </div>

                {visibility === 'public' && (
                  <div>
                    <label className="block text-sm text-white/60 mb-3">Pricing</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setPricing('free')}
                        className={`p-4 rounded-xl border text-left transition ${
                          pricing === 'free'
                            ? 'bg-forma-500/20 border-forma-500'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Sparkles className="w-5 h-5 text-green-400 mb-2" />
                        <p className="font-medium text-white">Free</p>
                        <p className="text-sm text-white/40">Share with the community</p>
                      </button>
                      <button
                        onClick={() => setPricing('paid')}
                        className={`p-4 rounded-xl border text-left transition ${
                          pricing === 'paid'
                            ? 'bg-forma-500/20 border-forma-500'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <DollarSign className="w-5 h-5 text-amber-400 mb-2" />
                        <p className="font-medium text-white">Paid</p>
                        <p className="text-sm text-white/40">Earn from your work</p>
                      </button>
                    </div>

                    {pricing === 'paid' && (
                      <div className="mt-4">
                        <label className="block text-sm text-white/60 mb-2">Price (USD)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition"
                          />
                        </div>
                        <p className="text-xs text-white/40 mt-2">
                          You'll receive 80% of each sale. Platform fee is 20%.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-6 py-2.5 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={!canProceed() || publishing}
              className="px-6 py-2.5 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {publishing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Publish Component
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
