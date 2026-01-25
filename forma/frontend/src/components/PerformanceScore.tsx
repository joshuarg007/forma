'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gauge,
  Zap,
  Image,
  FileCode,
  Accessibility,
  Search,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { CanvasComponent } from '@/types/components'

interface PerformanceScoreProps {
  components: CanvasComponent[]
  isOpen: boolean
  onClose: () => void
}

interface ScoreCategory {
  name: string
  score: number
  icon: React.ReactNode
  issues: Issue[]
  suggestions: string[]
}

interface Issue {
  severity: 'error' | 'warning' | 'info'
  message: string
  component?: string
}

export default function PerformanceScore({ components, isOpen, onClose }: PerformanceScoreProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  const analysis = useMemo(() => {
    // Performance Analysis
    const performanceIssues: Issue[] = []
    const performanceSuggestions: string[] = []
    let performanceScore = 100

    // Check for large component trees
    if (components.length > 50) {
      performanceIssues.push({
        severity: 'warning',
        message: `High component count (${components.length}). Consider lazy loading sections.`
      })
      performanceScore -= 10
    }

    // Check for heavy animations
    const animatedComponents = components.filter(c =>
      c.animation?.entrance?.type !== 'none' ||
      c.animation?.loop?.type !== 'none'
    )
    if (animatedComponents.length > 10) {
      performanceIssues.push({
        severity: 'warning',
        message: `Many animated components (${animatedComponents.length}). May impact performance on mobile.`
      })
      performanceScore -= 5
    }

    // Check for 3D transforms
    const transform3DComponents = components.filter(c => c.styles?.transform3D)
    if (transform3DComponents.length > 5) {
      performanceIssues.push({
        severity: 'info',
        message: '3D transforms can be GPU-intensive. Test on target devices.'
      })
      performanceSuggestions.push('Use will-change CSS property sparingly')
    }

    // Check for blur/backdrop filters
    const filterComponents = components.filter(c =>
      c.styles?.filter?.blur || c.styles?.backdropFilter?.blur
    )
    if (filterComponents.length > 3) {
      performanceIssues.push({
        severity: 'warning',
        message: 'Multiple blur effects detected. These are expensive to render.'
      })
      performanceScore -= 5
    }

    if (performanceIssues.length === 0) {
      performanceSuggestions.push('Performance looks good! Consider adding lazy loading for images.')
    }

    // SEO Analysis
    const seoIssues: Issue[] = []
    const seoSuggestions: string[] = []
    let seoScore = 100

    // Check for headings
    const headingComponents = components.filter(c =>
      c.type.toLowerCase().includes('heading') ||
      c.type.toLowerCase().includes('hero')
    )
    if (headingComponents.length === 0) {
      seoIssues.push({
        severity: 'error',
        message: 'No heading elements found. Add an H1 for better SEO.'
      })
      seoScore -= 15
    }

    // Check for images without alt text consideration
    const imageComponents = components.filter(c =>
      c.type.toLowerCase().includes('image') ||
      c.type.toLowerCase().includes('hero') ||
      c.type.toLowerCase().includes('gallery')
    )
    if (imageComponents.length > 0) {
      seoSuggestions.push('Ensure all images have descriptive alt text')
    }

    // Check for text content
    const textComponents = components.filter(c =>
      c.type.toLowerCase().includes('text') ||
      c.type.toLowerCase().includes('paragraph')
    )
    if (textComponents.length < 3) {
      seoIssues.push({
        severity: 'warning',
        message: 'Limited text content. Search engines prefer content-rich pages.'
      })
      seoScore -= 10
    }

    seoSuggestions.push('Add meta description in page settings')
    seoSuggestions.push('Use semantic HTML structure')

    // Accessibility Analysis
    const a11yIssues: Issue[] = []
    const a11ySuggestions: string[] = []
    let a11yScore = 100

    // Check for button/link components
    const interactiveComponents = components.filter(c =>
      c.type.toLowerCase().includes('button') ||
      c.type.toLowerCase().includes('link') ||
      c.type.toLowerCase().includes('cta')
    )
    if (interactiveComponents.length > 0) {
      a11ySuggestions.push('Ensure all buttons have accessible labels')
      a11ySuggestions.push('Test keyboard navigation')
    }

    // Check color contrast (simplified)
    const darkBgComponents = components.filter(c =>
      c.styles?.backgroundColor?.includes('#1') ||
      c.styles?.backgroundColor?.includes('#0') ||
      c.styles?.backgroundColor?.includes('dark')
    )
    if (darkBgComponents.length > 0) {
      a11ySuggestions.push('Verify text contrast ratio meets WCAG standards (4.5:1 for normal text)')
    }

    // Check for form components
    const formComponents = components.filter(c =>
      c.type.toLowerCase().includes('form') ||
      c.type.toLowerCase().includes('input') ||
      c.type.toLowerCase().includes('contact')
    )
    if (formComponents.length > 0) {
      a11yIssues.push({
        severity: 'info',
        message: 'Form elements detected. Ensure proper labels and error states.'
      })
    }

    a11ySuggestions.push('Add skip navigation link for keyboard users')
    a11ySuggestions.push('Test with screen reader')

    // Best Practices Analysis
    const bestPracticesIssues: Issue[] = []
    const bestPracticesSuggestions: string[] = []
    let bestPracticesScore = 100

    // Check for consistent styling
    const uniqueFonts = new Set(components.map(c => c.styles?.fontFamily).filter(Boolean))
    if (uniqueFonts.size > 3) {
      bestPracticesIssues.push({
        severity: 'warning',
        message: `Too many font families (${uniqueFonts.size}). Limit to 2-3 for consistency.`
      })
      bestPracticesScore -= 10
    }

    // Check for custom code
    const customCodeComponents = components.filter(c => c.customCode?.js || c.customCode?.css)
    if (customCodeComponents.length > 0) {
      bestPracticesIssues.push({
        severity: 'info',
        message: `${customCodeComponents.length} component(s) have custom code. Ensure it's well-tested.`
      })
    }

    // Check for API bindings
    const dataBoundComponents = components.filter(c => c.dataBinding?.source)
    if (dataBoundComponents.length > 0) {
      bestPracticesSuggestions.push('Implement error handling for API calls')
      bestPracticesSuggestions.push('Add loading states for dynamic content')
    }

    bestPracticesSuggestions.push('Use design tokens for consistent theming')
    bestPracticesSuggestions.push('Add fallback content for dynamic data')

    // Calculate overall score
    const overallScore = Math.round(
      (performanceScore + seoScore + a11yScore + bestPracticesScore) / 4
    )

    return {
      overall: overallScore,
      categories: [
        {
          name: 'Performance',
          score: performanceScore,
          icon: <Zap className="w-4 h-4" />,
          issues: performanceIssues,
          suggestions: performanceSuggestions
        },
        {
          name: 'SEO',
          score: seoScore,
          icon: <Search className="w-4 h-4" />,
          issues: seoIssues,
          suggestions: seoSuggestions
        },
        {
          name: 'Accessibility',
          score: a11yScore,
          icon: <Accessibility className="w-4 h-4" />,
          issues: a11yIssues,
          suggestions: a11ySuggestions
        },
        {
          name: 'Best Practices',
          score: bestPracticesScore,
          icon: <FileCode className="w-4 h-4" />,
          issues: bestPracticesIssues,
          suggestions: bestPracticesSuggestions
        }
      ] as ScoreCategory[]
    }
  }, [components])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-500'
    if (score >= 70) return 'from-yellow-500 to-orange-500'
    if (score >= 50) return 'from-orange-500 to-red-500'
    return 'from-red-500 to-pink-500'
  }

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const handleRefresh = () => {
    setIsAnalyzing(true)
    setTimeout(() => setIsAnalyzing(false), 1000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] max-h-[80vh] bg-gray-900 border border-gray-700 rounded-2xl z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <Gauge className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Performance Score</h2>
                  <p className="text-xs text-gray-400">Analyze your page quality</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isAnalyzing}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Overall Score */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-center gap-8">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="12"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(analysis.overall / 100) * 352} 352`}
                      initial={{ strokeDasharray: '0 352' }}
                      animate={{ strokeDasharray: `${(analysis.overall / 100) * 352} 352` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" className={`${getScoreGradient(analysis.overall).split(' ')[0].replace('from-', 'stop-')}`} />
                        <stop offset="100%" className={`${getScoreGradient(analysis.overall).split(' ')[1].replace('to-', 'stop-')}`} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      className={`text-4xl font-bold ${getScoreColor(analysis.overall)}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {analysis.overall}
                    </motion.span>
                    <span className="text-xs text-gray-500">/ 100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {analysis.categories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${getScoreColor(cat.score)} bg-gray-800`}>
                        {cat.icon}
                      </div>
                      <div className="w-20 text-sm text-gray-300">{cat.name}</div>
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${getScoreGradient(cat.score)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.score}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${getScoreColor(cat.score)}`}>
                        {cat.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories Detail */}
            <div className="flex-1 overflow-y-auto">
              {analysis.categories.map((category) => (
                <div key={category.name} className="border-b border-gray-800 last:border-0">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${getScoreColor(category.score)} bg-gray-800`}>
                        {category.icon}
                      </div>
                      <span className="text-sm font-medium text-white">{category.name}</span>
                      {category.issues.length > 0 && (
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">
                          {category.issues.length} issue{category.issues.length !== 1 && 's'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${getScoreColor(category.score)}`}>
                        {category.score}/100
                      </span>
                      {expandedCategories[category.name] ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedCategories[category.name] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          {/* Issues */}
                          {category.issues.map((issue, i) => (
                            <div
                              key={i}
                              className={`flex items-start gap-2 p-2.5 rounded-lg ${
                                issue.severity === 'error'
                                  ? 'bg-red-900/20 border border-red-800/50'
                                  : issue.severity === 'warning'
                                  ? 'bg-amber-900/20 border border-amber-800/50'
                                  : 'bg-blue-900/20 border border-blue-800/50'
                              }`}
                            >
                              {issue.severity === 'error' ? (
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              ) : issue.severity === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                              )}
                              <p className="text-xs text-gray-300">{issue.message}</p>
                            </div>
                          ))}

                          {/* Suggestions */}
                          {category.suggestions.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Suggestions
                              </h4>
                              {category.suggestions.map((suggestion, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2 text-xs text-gray-400"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}

                          {category.issues.length === 0 && category.suggestions.length === 0 && (
                            <div className="flex items-center gap-2 text-sm text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              All checks passed!
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-sm font-medium text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
