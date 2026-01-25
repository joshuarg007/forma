'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronRight,
  ChevronLeft,
  LayoutTemplate,
  Database,
  Wand2,
  Rocket,
  Sparkles,
} from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  targetSelector?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Data Modeler',
    description:
      'Design your database schema visually. Create collections, define fields, and set up relationships - no code required.',
    icon: <Sparkles className="w-8 h-8" />,
    position: 'center',
  },
  {
    id: 'templates',
    title: 'Start with a Template',
    description:
      'Jump-start your project with pre-built templates for common use cases like blogs, SaaS apps, or e-commerce stores.',
    icon: <LayoutTemplate className="w-6 h-6" />,
    position: 'bottom',
  },
  {
    id: 'collections',
    title: 'Add Collections',
    description:
      'Collections are like database tables. Add a collection for each type of data in your app - users, posts, products, etc.',
    icon: <Database className="w-6 h-6" />,
    position: 'bottom',
  },
  {
    id: 'ai-generate',
    title: 'AI Schema Generator',
    description:
      'Describe your app in plain English and let AI create the perfect schema for you. Just say "a blog with posts and comments".',
    icon: <Wand2 className="w-6 h-6" />,
    position: 'bottom',
  },
  {
    id: 'deploy',
    title: 'Deploy Your Backend',
    description:
      'When your schema is ready, click Deploy to instantly create a working REST API with authentication, database, and more.',
    icon: <Rocket className="w-6 h-6" />,
    position: 'bottom',
  },
]

const STORAGE_KEY = 'forma-data-modeler-tour-completed'

interface WelcomeTourProps {
  onComplete?: () => void
}

export function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if tour has been completed before
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed) {
      // Delay to let the page render first
      const timer = setTimeout(() => setIsOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
    onComplete?.()
  }, [onComplete])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const step = TOUR_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === TOUR_STEPS.length - 1

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Tour dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
          >
            <div className="bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="relative px-6 py-8 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-transparent">
                <button
                  onClick={handleSkip}
                  className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Skip tour"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Step icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-violet-500/25">
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white text-center">
                  {step.title}
                </h2>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p className="text-zinc-300 text-center leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 py-2">
                {TOUR_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-6 bg-violet-500'
                        : index < currentStep
                          ? 'bg-violet-500/50'
                          : 'bg-zinc-600'
                    }`}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                <button
                  onClick={handleSkip}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Skip tour
                </button>

                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                  >
                    {isLastStep ? (
                      "Let's go!"
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook to reset tour for testing
export function useResetTour() {
  return useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }, [])
}
