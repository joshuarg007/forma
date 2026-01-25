'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Palette, Sun, Moon, Monitor, Check, Type, Maximize, Grid3X3,
  Sparkles, Eye, Layout
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import AdminLayout from '@/components/AdminLayout'

type ThemeMode = 'light' | 'dark' | 'system'
type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'red'
type FontSize = 'small' | 'medium' | 'large'
type Density = 'compact' | 'comfortable' | 'spacious'

const accentColors: { id: AccentColor; label: string; class: string; preview: string }[] = [
  { id: 'blue', label: 'Blue', class: 'bg-blue-500', preview: 'from-blue-400 to-blue-600' },
  { id: 'purple', label: 'Purple', class: 'bg-purple-500', preview: 'from-purple-400 to-purple-600' },
  { id: 'green', label: 'Green', class: 'bg-green-500', preview: 'from-green-400 to-green-600' },
  { id: 'orange', label: 'Orange', class: 'bg-orange-500', preview: 'from-orange-400 to-orange-600' },
  { id: 'pink', label: 'Pink', class: 'bg-pink-500', preview: 'from-pink-400 to-pink-600' },
  { id: 'red', label: 'Red', class: 'bg-red-500', preview: 'from-red-400 to-red-600' },
]

export default function AppearancePage() {
  const router = useRouter()
  const { user, initialized, checkAuth } = useAuthStore()

  const [themeMode, setThemeMode] = useState<ThemeMode>('dark')
  const [accentColor, setAccentColor] = useState<AccentColor>('purple')
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [density, setDensity] = useState<Density>('comfortable')
  const [showAnimations, setShowAnimations] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [showGridLines, setShowGridLines] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth')
    }
  }, [user, initialized, router])

  const handleSave = () => {
    // Save preferences to localStorage or API
    const preferences = {
      themeMode,
      accentColor,
      fontSize,
      density,
      showAnimations,
      reducedMotion,
      showGridLines,
    }
    localStorage.setItem('forma_appearance', JSON.stringify(preferences))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!initialized || !user) {
    return (
      <div className="min-h-screen bg-forma-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forma-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-forma-400" />
            Appearance
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Customize how FORMA looks and feels
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-forma-500 hover:bg-forma-600 text-white font-medium transition flex items-center gap-2"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Theme Mode */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-forma-400" />
            Theme
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'light' as ThemeMode, label: 'Light', icon: <Sun className="w-5 h-5" /> },
              { id: 'dark' as ThemeMode, label: 'Dark', icon: <Moon className="w-5 h-5" /> },
              { id: 'system' as ThemeMode, label: 'System', icon: <Monitor className="w-5 h-5" /> },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => setThemeMode(theme.id)}
                className={`p-4 rounded-xl border text-center transition ${
                  themeMode === theme.id
                    ? 'bg-forma-500/20 border-forma-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                  themeMode === theme.id ? 'bg-forma-500/20 text-forma-400' : 'bg-white/10 text-white/60'
                }`}>
                  {theme.icon}
                </div>
                <p className="text-sm font-medium text-white">{theme.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-forma-400" />
            Accent Color
          </h2>

          <div className="grid grid-cols-6 gap-3">
            {accentColors.map((color) => (
              <button
                key={color.id}
                onClick={() => setAccentColor(color.id)}
                className={`relative aspect-square rounded-xl transition ${
                  accentColor === color.id ? 'ring-2 ring-white ring-offset-2 ring-offset-forma-950' : ''
                }`}
              >
                <div className={`w-full h-full rounded-xl bg-gradient-to-br ${color.preview}`} />
                {accentColor === color.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 rounded-xl bg-forma-950 border border-white/10">
            <p className="text-sm text-white/60 mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <button className={`px-4 py-2 rounded-lg bg-gradient-to-r ${accentColors.find(c => c.id === accentColor)?.preview} text-white text-sm font-medium`}>
                Primary Button
              </button>
              <button className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                accentColor === 'blue' ? 'border-blue-500 text-blue-400' :
                accentColor === 'purple' ? 'border-purple-500 text-purple-400' :
                accentColor === 'green' ? 'border-green-500 text-green-400' :
                accentColor === 'orange' ? 'border-orange-500 text-orange-400' :
                accentColor === 'pink' ? 'border-pink-500 text-pink-400' :
                'border-red-500 text-red-400'
              }`}>
                Secondary Button
              </button>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-forma-400" />
            Typography
          </h2>

          <div>
            <label className="block text-sm text-white/60 mb-3">Font Size</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'small' as FontSize, label: 'Small', size: 'text-sm' },
                { id: 'medium' as FontSize, label: 'Medium', size: 'text-base' },
                { id: 'large' as FontSize, label: 'Large', size: 'text-lg' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFontSize(option.id)}
                  className={`p-4 rounded-xl border text-center transition ${
                    fontSize === option.id
                      ? 'bg-forma-500/20 border-forma-500'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className={`font-medium text-white ${option.size}`}>{option.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Density */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5 text-forma-400" />
            Interface Density
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'compact' as Density, label: 'Compact', desc: 'More content, less space' },
              { id: 'comfortable' as Density, label: 'Comfortable', desc: 'Balanced layout' },
              { id: 'spacious' as Density, label: 'Spacious', desc: 'More breathing room' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setDensity(option.id)}
                className={`p-4 rounded-xl border text-left transition ${
                  density === option.id
                    ? 'bg-forma-500/20 border-forma-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <p className="font-medium text-white mb-1">{option.label}</p>
                <p className="text-xs text-white/40">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Builder Options */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-forma-400" />
            Builder Options
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="font-medium text-white">Show Grid Lines</p>
                <p className="text-sm text-white/40">Display alignment grid in the canvas</p>
              </div>
              <button
                onClick={() => setShowGridLines(!showGridLines)}
                className={`w-12 h-7 rounded-full transition ${
                  showGridLines ? 'bg-forma-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  showGridLines ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="font-medium text-white">Enable Animations</p>
                <p className="text-sm text-white/40">Show smooth transitions and effects</p>
              </div>
              <button
                onClick={() => setShowAnimations(!showAnimations)}
                className={`w-12 h-7 rounded-full transition ${
                  showAnimations ? 'bg-forma-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  showAnimations ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="font-medium text-white">Reduced Motion</p>
                <p className="text-sm text-white/40">Minimize animations for accessibility</p>
              </div>
              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`w-12 h-7 rounded-full transition ${
                  reducedMotion ? 'bg-forma-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  reducedMotion ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="rounded-2xl bg-gradient-to-br from-forma-500/10 to-purple-500/10 border border-forma-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-forma-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-forma-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Live Preview</h3>
              <p className="text-sm text-white/60">Changes are applied in real-time</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-forma-950 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accentColors.find(c => c.id === accentColor)?.preview}`} />
              <div>
                <p className={`font-medium text-white ${
                  fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'
                }`}>
                  Sample Card Title
                </p>
                <p className={`text-white/60 ${
                  fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm'
                }`}>
                  This is how your interface will look
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${accentColors.find(c => c.id === accentColor)?.preview} text-white text-sm`}>
                Action
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-white/10 text-white/60 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
