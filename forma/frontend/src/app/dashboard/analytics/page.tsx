'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  BarChart3, TrendingUp, TrendingDown, Sparkles, Users, FolderOpen,
  Layers, Clock, Calendar, ArrowUpRight, Eye, Zap, Activity,
  FileCode, Download, Globe
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import AdminLayout from '@/components/AdminLayout'

interface StatCard {
  label: string
  value: string | number
  change: string
  changePositive: boolean
  icon: React.ReactNode
  color: string
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()
  const { projects, usage, fetchProjects, fetchUsage } = useProjectStore()

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

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

  const stats: StatCard[] = [
    {
      label: 'Total Projects',
      value: projects.length,
      change: '+3 this month',
      changePositive: true,
      icon: <FolderOpen className="w-5 h-5" />,
      color: 'from-forma-400 to-forma-600',
    },
    {
      label: 'AI Generations',
      value: usage?.operations_used || 0,
      change: `${usage?.operations_limit || 100} limit`,
      changePositive: true,
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-purple-400 to-purple-600',
    },
    {
      label: 'Components Created',
      value: projects.length * 5,
      change: '+12 this week',
      changePositive: true,
      icon: <Layers className="w-5 h-5" />,
      color: 'from-amber-400 to-orange-500',
    },
    {
      label: 'Total Pages',
      value: projects.reduce((acc, p) => acc + (p.pages_count || 1), 0),
      change: '+8 this month',
      changePositive: true,
      icon: <FileCode className="w-5 h-5" />,
      color: 'from-green-400 to-emerald-500',
    },
  ]

  // Mock chart data
  const weeklyData = [
    { day: 'Mon', generations: 5, components: 3 },
    { day: 'Tue', generations: 8, components: 5 },
    { day: 'Wed', generations: 12, components: 8 },
    { day: 'Thu', generations: 7, components: 4 },
    { day: 'Fri', generations: 15, components: 10 },
    { day: 'Sat', generations: 3, components: 2 },
    { day: 'Sun', generations: 6, components: 4 },
  ]

  const topProjects = projects.slice(0, 5).map(p => ({
    ...p,
    views: Math.floor(Math.random() * 500) + 100,
    components: Math.floor(Math.random() * 10) + 1,
  }))

  const recentActivity = [
    { action: 'Generated component', target: 'PricingTable', time: '2 hours ago', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { action: 'Created project', target: 'E-commerce Dashboard', time: '5 hours ago', icon: <FolderOpen className="w-4 h-4 text-forma-400" /> },
    { action: 'Exported project', target: 'Landing Page', time: '1 day ago', icon: <Download className="w-4 h-4 text-green-400" /> },
    { action: 'Published component', target: 'HeroSection', time: '2 days ago', icon: <Globe className="w-4 h-4 text-blue-400" /> },
  ]

  if (!initialized || !user) {
    return (
      <div className="min-h-screen bg-forma-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Show empty state when no projects exist
  if (projects.length === 0) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-48 h-36 mb-4">
            <Image
              src="/empty-states/empty-no-analytics-data.webp"
              alt="FORMA AI-Powered React App Builder - No Analytics Data"
              fill
              className="object-contain"
            />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No analytics data yet</h3>
          <p className="text-white/60 text-center max-w-md mb-6">
            Start creating projects and generating components to see your analytics
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white transition text-sm font-medium"
          >
            Create Your First Project
          </button>
        </div>
      </AdminLayout>
    )
  }

  const maxGeneration = Math.max(...weeklyData.map(d => d.generations))

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-forma-400" />
            Analytics
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Track your usage and activity
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === range
                  ? 'bg-forma-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
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
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <span className={`text-xs flex items-center gap-1 ${stat.changePositive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.changePositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-forma-400" />
            AI Generation Activity
          </h2>

          <div className="h-64 flex items-end justify-between gap-2">
            {weeklyData.map((data, i) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.generations / maxGeneration) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-forma-500 to-forma-400 min-h-[4px]"
                    style={{ height: `${(data.generations / maxGeneration) * 180}px` }}
                  />
                </div>
                <span className="text-xs text-white/40">{data.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-forma-500 to-forma-400" />
              <span className="text-sm text-white/60">AI Generations</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-forma-400" />
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
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    {activity.action}
                    <span className="text-white/60"> {activity.target}</span>
                  </p>
                  <p className="text-xs text-white/40">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Projects */}
      <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-forma-400" />
            Top Projects
          </h2>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="text-sm text-forma-400 hover:text-forma-300 flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {topProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">No projects yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-white/60">Project</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden sm:table-cell">Components</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden md:table-cell">Views</th>
                <th className="text-left p-4 text-sm font-medium text-white/60 hidden lg:table-cell">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topProjects.map((project, i) => (
                <motion.tr
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/builder/${project.id}`)}
                  className="hover:bg-white/5 transition cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-forma-500/20 to-purple-500/20 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-forma-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{project.name}</p>
                        <p className="text-sm text-white/40">{project.pages_count || 1} pages</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-white/60">
                      <Layers className="w-4 h-4" />
                      {project.components}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-white/60">
                      <Eye className="w-4 h-4" />
                      {project.views}
                    </div>
                  </td>
                  <td className="p-4 text-white/60 text-sm hidden lg:table-cell">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Usage Summary */}
      {usage && (
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-forma-500/10 to-purple-500/10 border border-forma-500/30 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-forma-500 to-purple-500 flex items-center justify-center text-white">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI Usage This Month</h3>
                <p className="text-white/60">
                  {usage.operations_used} of {usage.operations_limit} generations used
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/60">Usage</span>
                <span className="text-white font-medium">
                  {Math.round((usage.operations_used / usage.operations_limit) * 100)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-forma-400 to-purple-400 transition-all"
                  style={{ width: `${Math.min((usage.operations_used / usage.operations_limit) * 100, 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/billing')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
