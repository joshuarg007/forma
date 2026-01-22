'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Plus,
  Copy,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  Type,
  Layers,
  Box,
  Circle,
  Download,
  Upload,
  Sparkles
} from 'lucide-react'
import { useThemeStore, Theme, ColorToken, checkWCAGContrast } from '@/stores/themeStore'
import { Monitor, Smartphone, Tablet, AlertCircle, CheckCircle2 } from 'lucide-react'

interface ThemePanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function ThemePanel({ isOpen, onClose }: ThemePanelProps) {
  const {
    themes,
    activeThemeId,
    setActiveTheme,
    addTheme,
    updateTheme,
    deleteTheme,
    duplicateTheme,
    updateToken,
    getActiveTheme,
    generateCSS
  } = useThemeStore()

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    colors: true,
    typography: false,
    spacing: false,
    shadows: false,
    borderRadius: false,
    breakpoints: false,
    contrastChecker: false
  })

  const [contrastFg, setContrastFg] = useState('#000000')
  const [contrastBg, setContrastBg] = useState('#ffffff')

  const [editingToken, setEditingToken] = useState<{ category: string; name: string } | null>(null)
  const [newThemeName, setNewThemeName] = useState('')
  const [showNewThemeInput, setShowNewThemeInput] = useState(false)

  const activeTheme = getActiveTheme()

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) return

    const newTheme: Theme = {
      id: `custom-${Date.now()}`,
      name: newThemeName,
      tokens: { ...activeTheme.tokens }
    }
    addTheme(newTheme)
    setNewThemeName('')
    setShowNewThemeInput(false)
    setActiveTheme(newTheme.id)
  }

  const handleExportCSS = () => {
    const css = generateCSS()
    const blob = new Blob([css], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTheme.name.toLowerCase().replace(/\s+/g, '-')}-tokens.css`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    const json = JSON.stringify(activeTheme, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target?.result as string) as Theme
        theme.id = `imported-${Date.now()}`
        theme.name = `${theme.name} (Imported)`
        addTheme(theme)
        setActiveTheme(theme.id)
      } catch (err) {
        console.error('Invalid theme file')
      }
    }
    reader.readAsText(file)
  }

  const ColorSwatch = ({ token, category }: { token: ColorToken; category: string }) => (
    <div className="flex items-center gap-2 group">
      <div className="relative">
        <input
          type="color"
          value={token.value}
          onChange={(e) => updateToken(activeThemeId, 'colors', token.name, e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-600 bg-transparent"
          style={{ backgroundColor: token.value }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-300 truncate">{token.name}</div>
        <div className="text-xs text-gray-500 font-mono">{token.value}</div>
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(token.value)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
        title="Copy color"
      >
        <Copy className="w-3 h-3 text-gray-400" />
      </button>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[420px] bg-gray-900 border-l border-gray-700 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-400" />
                <span className="font-semibold text-white">Design Tokens</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Theme Selector */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <select
                  value={activeThemeId}
                  onChange={(e) => setActiveTheme(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {themes.map(theme => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name} {theme.isDefault && '(Default)'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => duplicateTheme(activeThemeId)}
                  className="p-2 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                  title="Duplicate theme"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                {!activeTheme.isDefault && (
                  <button
                    onClick={() => deleteTheme(activeThemeId)}
                    className="p-2 bg-gray-800 border border-gray-600 rounded-lg hover:bg-red-900/50 transition-colors"
                    title="Delete theme"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>

              {/* New Theme */}
              {showNewThemeInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    placeholder="Theme name..."
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTheme()}
                  />
                  <button
                    onClick={handleCreateTheme}
                    className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewThemeInput(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Theme
                </button>
              )}

              {/* Theme description */}
              {activeTheme.description && (
                <p className="mt-2 text-xs text-gray-500">{activeTheme.description}</p>
              )}
            </div>

            {/* Tokens */}
            <div className="flex-1 overflow-y-auto">
              {/* Colors Section */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => toggleSection('colors')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-medium text-white">Colors</span>
                  </div>
                  {expandedSections.colors ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.colors && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4">
                        {/* Primary Colors */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Primary</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {activeTheme.tokens.colors.primary.map((token) => (
                              <div
                                key={token.name}
                                className="group relative"
                              >
                                <input
                                  type="color"
                                  value={token.value}
                                  onChange={(e) => updateToken(activeThemeId, 'colors', token.name, e.target.value)}
                                  className="w-full aspect-square rounded-lg cursor-pointer border border-gray-600"
                                  style={{ backgroundColor: token.value }}
                                  title={token.name}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[9px] font-medium px-1 py-0.5 rounded bg-black/70 text-white">
                                    {token.name.split('-')[1] || token.name}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Secondary Colors */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Secondary</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {activeTheme.tokens.colors.secondary.map((token) => (
                              <div
                                key={token.name}
                                className="group relative"
                              >
                                <input
                                  type="color"
                                  value={token.value}
                                  onChange={(e) => updateToken(activeThemeId, 'colors', token.name, e.target.value)}
                                  className="w-full aspect-square rounded-lg cursor-pointer border border-gray-600"
                                  style={{ backgroundColor: token.value }}
                                  title={token.name}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[9px] font-medium px-1 py-0.5 rounded bg-black/70 text-white">
                                    {token.name.split('-')[1] || token.name}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Neutral Colors */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Neutral</h4>
                          <div className="grid grid-cols-6 gap-2">
                            {activeTheme.tokens.colors.neutral.map((token) => (
                              <div
                                key={token.name}
                                className="group relative"
                              >
                                <input
                                  type="color"
                                  value={token.value}
                                  onChange={(e) => updateToken(activeThemeId, 'colors', token.name, e.target.value)}
                                  className="w-full aspect-square rounded-lg cursor-pointer border border-gray-600"
                                  style={{ backgroundColor: token.value }}
                                  title={token.name}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Semantic Colors */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Semantic</h4>
                          <div className="space-y-2">
                            {activeTheme.tokens.colors.semantic.map((token) => (
                              <ColorSwatch key={token.name} token={token} category="semantic" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Typography Section */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => toggleSection('typography')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Typography</span>
                  </div>
                  {expandedSections.typography ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.typography && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        {activeTheme.tokens.typography.map((token) => (
                          <div
                            key={token.name}
                            className="p-3 bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{token.name}</span>
                              <span className="text-xs text-gray-500">{token.fontSize}</span>
                            </div>
                            <div
                              className="text-gray-300 truncate"
                              style={{
                                fontFamily: token.fontFamily,
                                fontSize: token.fontSize,
                                fontWeight: token.fontWeight,
                                lineHeight: token.lineHeight
                              }}
                            >
                              The quick brown fox
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Spacing Section */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => toggleSection('spacing')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Spacing</span>
                  </div>
                  {expandedSections.spacing ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.spacing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-4 gap-2">
                          {activeTheme.tokens.spacing.map((token) => (
                            <div
                              key={token.name}
                              className="p-2 bg-gray-800 rounded-lg text-center"
                            >
                              <div className="text-xs font-medium text-white mb-1">{token.name}</div>
                              <div className="text-xs text-gray-500">{token.value}</div>
                              <div
                                className="mt-2 mx-auto bg-indigo-500/50 rounded"
                                style={{ width: token.value, height: token.value, maxWidth: '100%', maxHeight: '32px' }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shadows Section */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => toggleSection('shadows')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Shadows</span>
                  </div>
                  {expandedSections.shadows ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.shadows && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        {activeTheme.tokens.shadows.map((token) => (
                          <div
                            key={token.name}
                            className="flex items-center gap-3"
                          >
                            <div
                              className="w-16 h-16 bg-gray-200 rounded-lg"
                              style={{ boxShadow: token.value }}
                            />
                            <div>
                              <div className="text-sm font-medium text-white">{token.name}</div>
                              <div className="text-xs text-gray-500 font-mono max-w-[200px] truncate">{token.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Border Radius Section */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => toggleSection('borderRadius')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-white">Border Radius</span>
                  </div>
                  {expandedSections.borderRadius ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.borderRadius && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-4 gap-3">
                          {activeTheme.tokens.borderRadius.map((token) => (
                            <div
                              key={token.name}
                              className="text-center"
                            >
                              <div
                                className="w-12 h-12 mx-auto bg-indigo-500 mb-2"
                                style={{ borderRadius: token.value }}
                              />
                              <div className="text-xs font-medium text-white">{token.name}</div>
                              <div className="text-xs text-gray-500">{token.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Breakpoints Section */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => toggleSection('breakpoints')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">Breakpoints</span>
                  </div>
                  {expandedSections.breakpoints ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.breakpoints && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {activeTheme.tokens.breakpoints.map((token) => (
                          <div
                            key={token.name}
                            className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                          >
                            <div className="w-8 h-8 flex items-center justify-center">
                              {token.name === 'xs' || token.name === 'sm' ? (
                                <Smartphone className="w-5 h-5 text-cyan-400" />
                              ) : token.name === 'md' ? (
                                <Tablet className="w-5 h-5 text-cyan-400" />
                              ) : (
                                <Monitor className="w-5 h-5 text-cyan-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{token.name}</div>
                              {token.description && (
                                <div className="text-xs text-gray-500">{token.description}</div>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 font-mono">{token.value}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contrast Checker Section */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => toggleSection('contrastChecker')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Contrast Checker</span>
                  </div>
                  {expandedSections.contrastChecker ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.contrastChecker && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4">
                        {/* Color pickers */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 mb-2 block">Foreground</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={contrastFg}
                                onChange={(e) => setContrastFg(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border border-gray-600"
                              />
                              <input
                                type="text"
                                value={contrastFg}
                                onChange={(e) => setContrastFg(e.target.value)}
                                className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-2 block">Background</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={contrastBg}
                                onChange={(e) => setContrastBg(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border border-gray-600"
                              />
                              <input
                                type="text"
                                value={contrastBg}
                                onChange={(e) => setContrastBg(e.target.value)}
                                className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Preview */}
                        <div
                          className="p-4 rounded-lg text-center"
                          style={{ backgroundColor: contrastBg, color: contrastFg }}
                        >
                          <div className="text-2xl font-bold mb-1">Aa</div>
                          <div className="text-sm">Sample Text Preview</div>
                        </div>

                        {/* WCAG Results */}
                        {(() => {
                          const result = checkWCAGContrast(contrastFg, contrastBg)
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <span className="text-sm text-gray-300">Contrast Ratio</span>
                                <span className="text-lg font-bold text-white">{result.ratio}:1</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className={`flex items-center gap-2 p-2 rounded ${result.aa ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                                  {result.aa ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                  )}
                                  <span className="text-xs text-gray-300">AA Normal</span>
                                </div>
                                <div className={`flex items-center gap-2 p-2 rounded ${result.aaLarge ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                                  {result.aaLarge ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                  )}
                                  <span className="text-xs text-gray-300">AA Large</span>
                                </div>
                                <div className={`flex items-center gap-2 p-2 rounded ${result.aaa ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                                  {result.aaa ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                  )}
                                  <span className="text-xs text-gray-300">AAA Normal</span>
                                </div>
                                <div className={`flex items-center gap-2 p-2 rounded ${result.aaaLarge ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                                  {result.aaaLarge ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                  )}
                                  <span className="text-xs text-gray-300">AAA Large</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                WCAG 2.1 requires 4.5:1 for normal text (AA) and 7:1 for enhanced contrast (AAA).
                              </p>
                            </div>
                          )
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer with Export/Import */}
            <div className="p-4 border-t border-gray-700 flex items-center gap-2">
              <button
                onClick={handleExportCSS}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSS
              </button>
              <button
                onClick={handleExportJSON}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              <label className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 rounded-lg text-sm text-white hover:bg-indigo-500 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
