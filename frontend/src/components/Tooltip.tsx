'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
  children: ReactNode
  content: ReactNode
  delay?: number
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export default function Tooltip({
  children,
  content,
  delay = 400,
  position = 'right',
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        let x = 0
        let y = 0

        switch (position) {
          case 'right':
            x = rect.right + 8
            y = rect.top + rect.height / 2
            break
          case 'left':
            x = rect.left - 8
            y = rect.top + rect.height / 2
            break
          case 'top':
            x = rect.left + rect.width / 2
            y = rect.top - 8
            break
          case 'bottom':
            x = rect.left + rect.width / 2
            y = rect.bottom + 8
            break
        }

        setCoords({ x, y })
        setIsVisible(true)
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getTransformOrigin = () => {
    switch (position) {
      case 'right':
        return 'left center'
      case 'left':
        return 'right center'
      case 'top':
        return 'bottom center'
      case 'bottom':
        return 'top center'
    }
  }

  const getTransform = () => {
    switch (position) {
      case 'right':
        return 'translateY(-50%)'
      case 'left':
        return 'translate(-100%, -50%)'
      case 'top':
        return 'translate(-50%, -100%)'
      case 'bottom':
        return 'translateX(-50%)'
    }
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className={className}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[100] pointer-events-none"
            style={{
              left: coords.x,
              top: coords.y,
              transform: getTransform(),
              transformOrigin: getTransformOrigin()
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
