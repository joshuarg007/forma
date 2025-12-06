'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ChevronRight, ChevronLeft, Box, Wand2, Layers,
  Monitor, Download, ExternalLink, GripVertical, MousePointer,
  Settings, Palette, Sparkles, CheckCircle, ArrowRight
} from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  highlight?: 'left-panel' | 'canvas' | 'right-panel' | 'header' | 'device-selector' | 'export' | 'preview'
  tip?: string
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Forma!',
    description: 'Forma is a visual page builder that lets you create beautiful web pages without writing code. Let\'s take a quick tour of the main features.',
    icon: <Sparkles className="w-8 h-8" />,
    tip: 'You can restart this tutorial anytime by clicking the ? button in the top right.'
  },
  {
    id: 'component-library',
    title: 'Component Library',
    description: 'This is your toolbox! Browse through 100+ pre-built components organized by category. Click on any component to add it to your page, or drag and drop it onto the canvas.',
    icon: <Box className="w-8 h-8" />,
    highlight: 'left-panel',
    tip: 'Components include heroes, navbars, features, pricing tables, testimonials, and more.'
  },
  {
    id: 'canvas',
    title: 'Visual Canvas',
    description: 'This is your workspace where you build your page. Components you add appear here. Click on any component to select it and see editing options.',
    icon: <Layers className="w-8 h-8" />,
    highlight: 'canvas',
    tip: 'The canvas shows a live preview of how your page will look.'
  },
  {
    id: 'drag-drop',
    title: 'Drag & Drop',
    description: 'Reorder components by dragging them up or down. Use the grab handle that appears when hovering over a component, or use the arrow buttons in the toolbar.',
    icon: <GripVertical className="w-8 h-8" />,
    highlight: 'canvas',
    tip: 'You can also duplicate or delete components using the toolbar buttons.'
  },
  {
    id: 'properties',
    title: 'Properties Panel',
    description: 'When you select a component, its properties appear here. Adjust styling, layout roles (header, sidebar, main, footer), animations, and more.',
    icon: <Settings className="w-8 h-8" />,
    highlight: 'right-panel',
    tip: 'Use layout roles to create complex layouts like dashboards with sidebars.'
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Need a custom component? Type a description and our AI will generate it for you! Try things like "Create a pricing card with 3 tiers" or "Make a contact form".',
    icon: <Wand2 className="w-8 h-8" />,
    highlight: 'right-panel',
    tip: 'The AI understands your design system and creates components that match your style.'
  },
  {
    id: 'device-preview',
    title: 'Device Preview',
    description: 'Preview how your page looks on different devices. Switch between Desktop, Tablet, and Mobile views to ensure your design is responsive.',
    icon: <Monitor className="w-8 h-8" />,
    highlight: 'device-selector',
    tip: 'Components automatically adjust to different screen sizes.'
  },
  {
    id: 'theme',
    title: 'Design Tokens & Themes',
    description: 'Click the palette icon to customize your design system. Set colors, fonts, spacing, and more to create a consistent look across your entire page.',
    icon: <Palette className="w-8 h-8" />,
    highlight: 'header',
    tip: 'Your theme settings are applied to all components automatically.'
  },
  {
    id: 'preview-export',
    title: 'Preview & Export',
    description: 'Click "Preview Site" to see your page in a new tab. When you\'re ready, export your project as a Next.js or Vite application!',
    icon: <ExternalLink className="w-8 h-8" />,
    highlight: 'preview',
    tip: 'Exported projects include all your components and styling, ready to deploy.'
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    description: 'You now know the basics of Forma. Start by adding a component from the library, then customize it to your liking. Have fun building!',
    icon: <CheckCircle className="w-8 h-8" />,
    tip: 'Pro tip: Start with a Navbar, then add a Hero section, and build from there.'
  }
]

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  // Get highlight position based on step
  const getHighlightStyle = () => {
    if (!step.highlight) return null

    switch (step.highlight) {
      case 'left-panel':
        return {
          left: 0,
          top: '56px',
          width: '256px',
          height: 'calc(100% - 56px)'
        }
      case 'canvas':
        return {
          left: '256px',
          top: '56px',
          width: 'calc(100% - 576px)',
          height: 'calc(100% - 56px)'
        }
      case 'right-panel':
        return {
          right: 0,
          top: '56px',
          width: '320px',
          height: 'calc(100% - 56px)'
        }
      case 'header':
        return {
          left: 0,
          top: 0,
          width: '100%',
          height: '56px'
        }
      case 'device-selector':
        return {
          left: '50%',
          top: '8px',
          width: '140px',
          height: '40px',
          transform: 'translateX(-50%)'
        }
      case 'preview':
        return {
          right: '200px',
          top: '8px',
          width: '120px',
          height: '40px'
        }
      default:
        return null
    }
  }

  const highlightStyle = getHighlightStyle()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay with highlight cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/70" onClick={handleSkip} />

            {/* Highlight box */}
            {highlightStyle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute pointer-events-none"
                style={{
                  ...highlightStyle,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 40px 10px rgba(99, 102, 241, 0.3)',
                  borderRadius: '12px',
                  border: '2px solid rgba(99, 102, 241, 0.5)'
                }}
              />
            )}

            {/* Pulsing indicator for highlighted area */}
            {highlightStyle && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute pointer-events-none"
                style={{
                  ...highlightStyle,
                  borderRadius: '12px',
                  border: '3px solid rgba(99, 102, 241, 0.8)'
                }}
              />
            )}
          </motion.div>

          {/* Tutorial card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-50 bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg"
          >
            <div className="bg-gradient-to-br from-forma-900 to-forma-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-forma-500 to-indigo-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-forma-500 to-indigo-500 flex items-center justify-center text-white">
                      {step.icon}
                    </div>
                    <div>
                      <div className="text-xs text-white/50 mb-1">
                        Step {currentStep + 1} of {tutorialSteps.length}
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Tip */}
                {step.tip && (
                  <div className="bg-forma-500/10 border border-forma-500/20 rounded-lg px-4 py-3 mb-6">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-forma-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-forma-300">
                        {step.tip}
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSkip}
                    className="text-sm text-white/50 hover:text-white transition"
                  >
                    Skip tutorial
                  </button>

                  <div className="flex items-center gap-2">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrev}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1 px-5 py-2 rounded-lg bg-gradient-to-r from-forma-500 to-indigo-500 hover:from-forma-600 hover:to-indigo-600 text-white text-sm font-medium transition"
                    >
                      {currentStep === tutorialSteps.length - 1 ? (
                        <>
                          Get Started
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Step dots */}
                <div className="flex items-center justify-center gap-1.5 mt-6">
                  {tutorialSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep
                          ? 'bg-forma-500 w-4'
                          : index < currentStep
                          ? 'bg-forma-500/50'
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
