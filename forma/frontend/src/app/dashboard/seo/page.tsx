'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search, SearchCheck, Globe, FileText, ChevronDown, CheckCircle,
  AlertTriangle, XCircle, ExternalLink, RefreshCw, Eye, Code
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'
import { api } from '@/lib/api'

export default function SEOPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()

  const [selectedProject, setSelectedProject] = useState<string>('')
  const [settings, setSettings] = useState<any>(null)
  const [pages, setPages] = useState<any[]>([])
  const [pageAnalysis, setPageAnalysis] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Settings form
  const [siteTitle, setSiteTitle] = useState('')
  const [siteDescription, setSiteDescription] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [enableSitemap, setEnableSitemap] = useState(true)
  const [enableRobots, setEnableRobots] = useState(true)

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
    if (selectedProject) loadSEOData()
  }, [selectedProject])

  async function loadSEOData() {
    setLoading(true)
    try {
      const [seoRes, pagesRes] = await Promise.all([
        api.getSEOSettings(selectedProject).catch(() => null),
        api.getPages(selectedProject).catch(() => ({ pages: [] })),
      ])
      if (seoRes) {
        setSettings(seoRes)
        setSiteTitle(seoRes.site_title || '')
        setSiteDescription(seoRes.site_description || '')
        setOgImage(seoRes.og_image || '')
        setEnableSitemap(seoRes.enable_sitemap !== false)
        setEnableRobots(seoRes.enable_robots !== false)
      }
      setPages(pagesRes.pages || [])
    } catch {
      // settings may not exist yet
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveSettings() {
    setSaving(true)
    try {
      await api.updateSEOSettings(selectedProject, {
        site_title: siteTitle,
        site_description: siteDescription,
        og_image: ogImage,
        enable_sitemap: enableSitemap,
        enable_robots: enableRobots,
      })
    } catch (err: any) {
      alert(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleAnalyzePage(pageId: string) {
    try {
      const result = await api.analyzeSEO(selectedProject, pageId)
      setPageAnalysis(prev => ({ ...prev, [pageId]: result }))
    } catch (err: any) {
      alert(err.message || 'Analysis failed')
    }
  }

  if (!user) return null

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">SEO</h1>
            <p className="text-white/60 mt-1">Optimize your site for search engines</p>
          </div>
          <div className="relative">
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-forma-500" style={{ colorScheme: 'dark' }}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Global SEO Settings */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-forma-400" />
                Global Settings
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-white/60 block mb-1.5">Site Title</label>
                  <input type="text" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="My Awesome Site" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-forma-500" />
                </div>
                <div>
                  <label className="text-sm text-white/60 block mb-1.5">Site Description</label>
                  <textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} placeholder="A brief description of your site for search engines..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-forma-500 resize-none" />
                </div>
                <div>
                  <label className="text-sm text-white/60 block mb-1.5">Default OG Image URL</label>
                  <input type="url" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://example.com/og-image.jpg" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-forma-500" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input type="checkbox" checked={enableSitemap} onChange={(e) => setEnableSitemap(e.target.checked)} className="rounded border-white/20" />
                    Generate sitemap.xml
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input type="checkbox" checked={enableRobots} onChange={(e) => setEnableRobots(e.target.checked)} className="rounded border-white/20" />
                    Generate robots.txt
                  </label>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSaveSettings} disabled={saving} className="px-5 py-2 bg-forma-500 hover:bg-forma-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>

            {/* Page-by-Page SEO */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-forma-400" />
                Page SEO Analysis
              </h2>
              {pages.length === 0 ? (
                <p className="text-white/40 text-sm">No pages found for this project.</p>
              ) : (
                <div className="space-y-3">
                  {pages.map((page: any) => {
                    const analysis = pageAnalysis[page.id]
                    return (
                      <div key={page.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-white font-medium">{page.name}</h3>
                            <span className="text-xs text-white/40">/{page.slug}</span>
                          </div>
                          <button
                            onClick={() => handleAnalyzePage(page.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-lg transition"
                          >
                            <SearchCheck className="w-3.5 h-3.5" />
                            Analyze
                          </button>
                        </div>
                        {analysis && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
                            {analysis.score != null && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-white/60">Score:</span>
                                <span className={`text-sm font-medium ${analysis.score >= 80 ? 'text-green-400' : analysis.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {analysis.score}/100
                                </span>
                              </div>
                            )}
                            {analysis.issues && analysis.issues.length > 0 && (
                              <div className="space-y-1">
                                {analysis.issues.map((issue: any, i: number) => (
                                  <div key={i} className="flex items-start gap-2 text-xs">
                                    {issue.severity === 'error' ? <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />}
                                    <span className="text-white/60">{issue.message}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {analysis.issues && analysis.issues.length === 0 && (
                              <div className="flex items-center gap-2 text-xs text-green-400">
                                <CheckCircle className="w-3.5 h-3.5" />
                                No issues found
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
