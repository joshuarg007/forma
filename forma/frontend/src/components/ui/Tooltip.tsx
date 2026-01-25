'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  maxWidth?: number
}

export function Tooltip({
  content,
  children,
  side = 'top',
  delay = 200,
  maxWidth = 280,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const tooltipEl = tooltipRef.current

      let top = 0
      let left = 0

      const gap = 8

      switch (side) {
        case 'top':
          top = rect.top - gap
          left = rect.left + rect.width / 2
          break
        case 'bottom':
          top = rect.bottom + gap
          left = rect.left + rect.width / 2
          break
        case 'left':
          top = rect.top + rect.height / 2
          left = rect.left - gap
          break
        case 'right':
          top = rect.top + rect.height / 2
          left = rect.right + gap
          break
      }

      // Adjust for scroll
      top += window.scrollY
      left += window.scrollX

      setPosition({ top, left })
    }
  }, [isVisible, side])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getTransformStyle = () => {
    switch (side) {
      case 'top':
        return 'translate(-50%, -100%)'
      case 'bottom':
        return 'translate(-50%, 0)'
      case 'left':
        return 'translate(-100%, -50%)'
      case 'right':
        return 'translate(0, -50%)'
    }
  }

  // Clone child to attach refs and handlers
  const child = children
  const clonedChild = (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement>}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      className="inline-flex"
    >
      {child}
    </span>
  )

  return (
    <>
      {clonedChild}
      {isVisible &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className="fixed z-[9999] px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 text-white rounded-lg shadow-xl pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              top: position.top,
              left: position.left,
              transform: getTransformStyle(),
              maxWidth,
            }}
          >
            {content}
            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-zinc-800 border-zinc-700 rotate-45 ${
                side === 'top'
                  ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r'
                  : side === 'bottom'
                    ? 'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l'
                    : side === 'left'
                      ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r'
                      : 'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l'
              }`}
            />
          </div>,
          document.body
        )}
    </>
  )
}

// Info icon with built-in tooltip
interface InfoTooltipProps {
  content: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function InfoTooltip({ content, side = 'top' }: InfoTooltipProps) {
  return (
    <Tooltip content={content} side={side}>
      <button
        type="button"
        className="p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors rounded-full hover:bg-zinc-700/50"
        tabIndex={-1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </Tooltip>
  )
}
