'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus, FolderOpen, Trash2, Sparkles, Zap, ChevronRight, ArrowUpRight,
  TrendingUp, Clock, Star, Layers, BarChart3, Users, Activity, FileCode,
  Rocket, Globe, Package, Play, Eye
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'

export default function DashboardPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, loadingProjects, fetchProjects, createProject, deleteProject, usage, fetchUsage } = useProjectStore()

  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [creating, setCreating] = useState(false)

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
      fetchUsage()
    }
  }, [user, fetchProjects, fetchUsage])

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    setCreating(true)
    try {
      const project = await createProject(newProjectName.trim())
      setShowNewProject(false)
      setNewProjectName('')
      router.push(`/builder/${project.id}`)
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setCreating(false)
    }
  }

  if (!initialized || !user) {
    return (
      <div className="min-h-screen bg-forma-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Mock data for dashboard widgets
  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      change: '+2 this week',
      changePositive: true,
      icon: <FolderOpen className="w-5 h-5" />,
      color: 'from-forma-400 to-forma-600',
    },
    {
      label: 'Components',
      value: projects.reduce((acc, p) => acc + (p.components?.length || 0), 0),
      change: '+12 this month',
      changePositive: true,
      icon: <Layers className="w-5 h-5" />,
      color: 'from-purple-400 to-purple-600',
    },
    {
      label: 'AI Generations',
      value: usage?.operations_used || 0,
      change: `${usage?.operations_limit || 100} limit`,
      changePositive: true,
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-amber-400 to-orange-500',
    },
    {
      label: 'Team Members',
      value: 3,
      change: '+1 pending invite',
      changePositive: true,
      icon: <Users className="w-5 h-5" />,
      color: 'from-green-400 to-emerald-500',
    },
  ]

  const recentActivity = [
    { type: 'component', action: 'created', name: 'HeroSection', time: '2 hours ago', icon: <FileCode className="w-4 h-4" /> },
    { type: 'project', action: 'updated', name: 'E-commerce Dashboard', time: '5 hours ago', icon: <FolderOpen className="w-4 h-4" /> },
    { type: 'ai', action: 'generated', name: 'PricingTable', time: '1 day ago', icon: <Sparkles className="w-4 h-4" /> },
    { type: 'export', action: 'exported', name: 'Landing Page', time: '2 days ago', icon: <Package className="w-4 h-4" /> },
  ]

  const quickTemplates = [
    { name: 'SaaS Landing', category: 'Landing Page', uses: '2.4k', icon: <Globe className="w-8 h-8" /> },
    { name: 'Dashboard', category: 'Admin Panel', uses: '1.8k', icon: <BarChart3 className="w-8 h-8" /> },
    { name: 'E-commerce', category: 'Store Front', uses: '1.2k', icon: <Package className="w-8 h-8" /> },
    { name: 'Portfolio', category: 'Personal', uses: '956', icon: <Star className="w-8 h-8" /> },
  ]

  return (
    <AdminLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Welcome back, {user.name || 'Developer'}!
        </h1>
        <p className="text-white/60">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20 flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <span className={`text-xs ${stat.changePositive ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                  {stat.changePositive && <TrendingUp className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Projects Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-forma-500/20 to-purple-500/20 border border-forma-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Ready to create something amazing?</h2>
                <p className="text-sm text-white/60">Start a new project or explore our templates</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/marketplace')}
                  className="px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 transition text-sm font-medium"
                >
                  Browse Templates
                </button>
                <button
                  onClick={() => {
                    console.log('New Project clicked')
                    setShowNewProject(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent Projects</h2>
              <button
                onClick={() => router.push('/dashboard/projects')}
                className="text-sm text-forma-400 hover:text-forma-300 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loadingProjects ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
                <p className="text-sm text-white/60 mb-4">Create your first project to get started</p>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="px-6 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition text-sm font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {projects.slice(0, 5).map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(`/builder/${project.id}`)}
                    className="group flex items-center justify-between p-4 hover:bg-white/5 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forma-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                        <FolderOpen className="w-6 h-6 text-forma-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white group-hover:text-forma-400 transition">{project.name}</h3>
                        <p className="text-sm text-white/40">{project.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-white/40">Last updated</p>
                        <p className="text-sm text-white/60">
                          {new Date(project.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/builder/${project.id}`)
                          }}
                          className="p-2 rounded-lg hover:bg-forma-500/20 text-forma-400 transition"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (confirm('Delete this project?')) {
                              await deleteProject(project.id)
                            }
                          }}
                          className="p-3 rounded-lg border-2 border-dashed border-red-400/50 hover:border-red-400 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-forma-400" />
                Recent Activity
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {recentActivity.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-forma-400 flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="capitalize">{activity.action}</span>{' '}
                      <span className="text-white/60">{activity.name}</span>
                    </p>
                    <p className="text-xs text-white/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-forma-400" />
                Quick Start Templates
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {quickTemplates.map((template, i) => (
                <motion.button
                  key={template.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push('/marketplace')}
                  className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-forma-500/20 to-purple-500/20 flex items-center justify-center text-forma-400 group-hover:text-forma-300">
                    {template.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{template.name}</p>
                    <p className="text-xs text-white/40">{template.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40">{template.uses} uses</p>
                    <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-forma-400 transition ml-auto" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Pro Tip */}
          <div className="rounded-2xl bg-gradient-to-br from-forma-500/10 to-purple-500/10 border border-forma-500/30 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-forma-500/20 flex items-center justify-center text-forma-400 flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Pro Tip</h3>
                <p className="text-sm text-white/60">
                  Use keyboard shortcut <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Cmd+K</kbd> to quickly search and navigate anywhere in FORMA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-forma-900 rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">New Project</h2>

            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-forma-500 transition mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateProject()
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewProject(false)
                  setNewProjectName('')
                }}
                className="flex-1 px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || creating}
                className="flex-1 px-4 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  )
}
