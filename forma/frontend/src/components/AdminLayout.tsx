'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Home, FolderOpen, Layers, ShoppingBag, Users, Settings,
  CreditCard, BarChart3, HelpCircle, ChevronLeft, ChevronRight, LogOut,
  Search, Bell, Command, Moon, Sun, Menu, X, Zap, Globe, MessageSquare,
  FileCode, Palette, Package, Rocket, Star, TrendingUp, ArrowUpRight
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'

interface AdminLayoutProps {
  children: ReactNode
}

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  badge?: string | number
  badgeColor?: string
  children?: { id: string; label: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    href: '/dashboard',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <FolderOpen className="w-5 h-5" />,
    href: '/dashboard/projects',
    badge: 'New',
    badgeColor: 'bg-forma-500',
  },
  {
    id: 'components',
    label: 'Components',
    icon: <Layers className="w-5 h-5" />,
    children: [
      { id: 'all-components', label: 'All Components', href: '/dashboard/components' },
      { id: 'templates', label: 'Templates', href: '/dashboard/templates' },
      { id: 'my-library', label: 'My Library', href: '/dashboard/library' },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: <ShoppingBag className="w-5 h-5" />,
    href: '/marketplace',
  },
  {
    id: 'team',
    label: 'Team',
    icon: <Users className="w-5 h-5" />,
    href: '/dashboard/team',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/dashboard/analytics',
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: <CreditCard className="w-5 h-5" />,
    href: '/dashboard/billing',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    children: [
      { id: 'general', label: 'General', href: '/settings' },
      { id: 'appearance', label: 'Appearance', href: '/settings/appearance' },
      { id: 'security', label: 'Security', href: '/settings/security' },
      { id: 'api', label: 'API Keys', href: '/settings/api' },
    ],
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { usage, fetchUsage } = useProjectStore()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [darkMode, setDarkMode] = useState(true)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [notifications] = useState([
    { id: 1, title: 'New component generated', time: '2 min ago', unread: true },
    { id: 2, title: 'Team member joined', time: '1 hour ago', unread: true },
    { id: 3, title: 'Export completed', time: '3 hours ago', unread: false },
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(prev => !prev)
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false)
        setShowNotifications(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-forma-950' : 'bg-gray-50'}`}>
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-forma-950 border-r border-white/10 z-50 transition-all duration-300 flex flex-col
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            {sidebarCollapsed ? (
              <Image
                src="/logos/forma-logo-mark.png"
                alt="Forma"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Image
                  src="/logos/forma-logo-full.png"
                  alt="Forma"
                  width={140}
                  height={38}
                  className="h-9 w-auto"
                />
              </motion.div>
            )}
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats */}
        {!sidebarCollapsed && usage && (
          <div className="p-4 border-b border-white/10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-forma-500/20 to-purple-500/20 border border-forma-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">AI Credits</span>
                <Zap className="w-4 h-4 text-forma-400" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{usage.operations_used}</span>
                <span className="text-sm text-white/40 mb-0.5">/ {usage.operations_limit}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-forma-400 to-purple-400"
                  style={{ width: `${(usage.operations_used / usage.operations_limit) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <div key={item.id}>
              {item.href ? (
                <button
                  onClick={() => router.push(item.href!)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition group
                    ${isActive(item.href)
                      ? 'bg-forma-500/20 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <span className={`${isActive(item.href) ? 'text-forma-400' : ''}`}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-xs text-white ${item.badgeColor || 'bg-white/20'}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition
                      ${expandedMenus.includes(item.id) ? 'bg-white/5 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    {item.icon}
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${expandedMenus.includes(item.id) ? 'rotate-90' : ''}`}
                        />
                      </>
                    )}
                  </button>
                  {!sidebarCollapsed && (
                    <AnimatePresence>
                      {expandedMenus.includes(item.id) && item.children && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-8 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => router.push(child.href)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                                  ${isActive(child.href) ? 'text-forma-400 bg-forma-500/10' : 'text-white/50 hover:text-white hover:bg-white/5'}
                                `}
                              >
                                {child.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Help & Upgrade */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {!sidebarCollapsed && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-white">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-white/60 mb-3">Unlock unlimited AI generations and premium features</p>
              <button className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-400 hover:to-pink-400 transition">
                Upgrade Now
              </button>
            </div>
          )}

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition">
            <HelpCircle className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Help & Support</span>}
          </button>
        </div>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forma-400 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0">
              {user?.name?.[0] || user?.email?.[0] || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-white/40 truncate">{user?.email}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-forma-950/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setShowCommandPalette(true)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition w-64 lg:w-80"
              >
                <Search className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/40 flex-1 text-left">Search...</span>
                <kbd className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-xs text-white/40">
                  <Command className="w-3 h-3" />K
                </kbd>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Create */}
            <button
              onClick={() => router.push('/dashboard')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white text-sm font-medium transition"
            >
              <Sparkles className="w-4 h-4" />
              New Project
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-forma-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      <button className="text-xs text-forma-400 hover:text-forma-300">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer ${notif.unread ? 'bg-forma-500/5' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            {notif.unread && (
                              <span className="w-2 h-2 rounded-full bg-forma-400 mt-2 flex-shrink-0" />
                            )}
                            <div className={notif.unread ? '' : 'ml-5'}>
                              <p className="text-sm text-white">{notif.title}</p>
                              <p className="text-xs text-white/40 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-white/10">
                      <button className="w-full text-center text-sm text-forma-400 hover:text-forma-300">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu (mobile) */}
            <div className="lg:hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forma-400 to-purple-500 flex items-center justify-center text-white font-medium">
                {user?.name?.[0] || user?.email?.[0] || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCommandPalette(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-forma-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search for projects, components, or actions..."
                    autoFocus
                    className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
                  />
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs text-white/40">esc</kbd>
                </div>
              </div>
              <div className="p-2 max-h-80 overflow-y-auto">
                <div className="px-2 py-1.5 text-xs text-white/40">Quick Actions</div>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/80 text-left">
                  <FileCode className="w-4 h-4 text-forma-400" />
                  <span>New Component</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/80 text-left">
                  <FolderOpen className="w-4 h-4 text-forma-400" />
                  <span>New Project</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/80 text-left">
                  <Palette className="w-4 h-4 text-forma-400" />
                  <span>Browse Templates</span>
                </button>
                <div className="px-2 py-1.5 text-xs text-white/40 mt-2">Navigation</div>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/80 text-left">
                  <Home className="w-4 h-4 text-white/40" />
                  <span>Dashboard</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/80 text-left">
                  <ShoppingBag className="w-4 h-4 text-white/40" />
                  <span>Marketplace</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/80 text-left">
                  <Settings className="w-4 h-4 text-white/40" />
                  <span>Settings</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
