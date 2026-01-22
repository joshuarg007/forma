'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface CountdownTimerProps extends ModuleProps {
  targetDate?: string
  title?: string
  subtitle?: string
  showLabels?: boolean
  variant?: 'simple' | 'cards' | 'circles' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  theme?: 'light' | 'dark' | 'gradient'
  expiredMessage?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(targetDate: string): TimeLeft | null {
  const difference = new Date(targetDate).getTime() - new Date().getTime()

  if (difference <= 0) {
    return null
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

const sizeClasses = {
  sm: { number: 'text-2xl', label: 'text-xs' },
  md: { number: 'text-4xl', label: 'text-sm' },
  lg: { number: 'text-6xl', label: 'text-base' },
}

export default function CountdownTimer({
  id,
  className,
  styles,
  targetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  title = 'Sale Ends In',
  subtitle,
  showLabels = true,
  variant = 'cards',
  size = 'md',
  theme = 'light',
  expiredMessage = 'This offer has expired',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) {
    return (
      <div
        id={id}
        className={cn('text-center py-8', className)}
        style={styles}
      >
        <p className="text-xl text-gray-500">{expiredMessage}</p>
      </div>
    )
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ]

  const themeStyles = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      label: 'text-gray-500',
      card: 'bg-gray-100',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      label: 'text-gray-400',
      card: 'bg-gray-800',
    },
    gradient: {
      bg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      text: 'text-white',
      label: 'text-white/70',
      card: 'bg-white/20 backdrop-blur-sm',
    },
  }

  const currentTheme = themeStyles[theme]

  if (variant === 'minimal') {
    return (
      <div
        id={id}
        className={cn('text-center py-4', currentTheme.bg, className)}
        style={styles}
      >
        {title && <p className={cn('font-medium mb-2', currentTheme.text)}>{title}</p>}
        <div className={cn('font-mono font-bold', sizeClasses[size].number, currentTheme.text)}>
          {String(timeLeft.days).padStart(2, '0')}:{String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </div>
        {subtitle && <p className={cn('mt-2', currentTheme.label)}>{subtitle}</p>}
      </div>
    )
  }

  if (variant === 'circles') {
    const circleSize = size === 'sm' ? 80 : size === 'md' ? 120 : 160
    const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8
    const radius = (circleSize - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    return (
      <div
        id={id}
        className={cn('py-8 px-4', currentTheme.bg, className)}
        style={styles}
      >
        {title && (
          <h3 className={cn('text-center font-bold mb-6', sizeClasses[size].number, currentTheme.text)}>
            {title}
          </h3>
        )}
        <div className="flex justify-center gap-4 md:gap-8">
          {timeUnits.map((unit, index) => {
            const max = index === 0 ? 365 : index === 1 ? 24 : 60
            const progress = (unit.value / max) * circumference

            return (
              <div key={unit.label} className="flex flex-col items-center">
                <div className="relative" style={{ width: circleSize, height: circleSize }}>
                  <svg className="transform -rotate-90" width={circleSize} height={circleSize}>
                    <circle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      fill="none"
                      stroke={theme === 'gradient' ? 'rgba(255,255,255,0.2)' : '#e5e7eb'}
                      strokeWidth={strokeWidth}
                    />
                    <circle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      fill="none"
                      stroke={theme === 'gradient' ? '#fff' : '#4f46e5'}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn('font-bold', sizeClasses[size].number, currentTheme.text)}>
                      {String(unit.value).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                {showLabels && (
                  <span className={cn('mt-2', sizeClasses[size].label, currentTheme.label)}>
                    {unit.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        {subtitle && <p className={cn('text-center mt-6', currentTheme.label)}>{subtitle}</p>}
      </div>
    )
  }

  if (variant === 'simple') {
    return (
      <div
        id={id}
        className={cn('py-8 px-4', currentTheme.bg, className)}
        style={styles}
      >
        {title && (
          <h3 className={cn('text-center font-semibold mb-4', currentTheme.text)}>{title}</h3>
        )}
        <div className="flex justify-center gap-4 md:gap-8">
          {timeUnits.map((unit) => (
            <div key={unit.label} className="text-center">
              <span className={cn('font-bold', sizeClasses[size].number, currentTheme.text)}>
                {String(unit.value).padStart(2, '0')}
              </span>
              {showLabels && (
                <p className={cn(sizeClasses[size].label, currentTheme.label)}>{unit.label}</p>
              )}
            </div>
          ))}
        </div>
        {subtitle && <p className={cn('text-center mt-4', currentTheme.label)}>{subtitle}</p>}
      </div>
    )
  }

  // Cards variant (default)
  return (
    <div
      id={id}
      className={cn('py-8 px-4', currentTheme.bg, className)}
      style={styles}
    >
      {title && (
        <h3 className={cn('text-center font-bold mb-6', sizeClasses[size].label === 'text-xs' ? 'text-lg' : 'text-2xl', currentTheme.text)}>
          {title}
        </h3>
      )}
      <div className="flex justify-center gap-2 md:gap-4">
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="flex items-center">
            <div className={cn(
              'rounded-xl flex flex-col items-center justify-center',
              currentTheme.card,
              size === 'sm' && 'w-16 h-20 p-2',
              size === 'md' && 'w-24 h-28 p-3',
              size === 'lg' && 'w-32 h-36 p-4'
            )}>
              <span className={cn('font-bold', sizeClasses[size].number, currentTheme.text)}>
                {String(unit.value).padStart(2, '0')}
              </span>
              {showLabels && (
                <span className={cn('mt-1', sizeClasses[size].label, currentTheme.label)}>
                  {unit.label}
                </span>
              )}
            </div>
            {index < timeUnits.length - 1 && (
              <span className={cn('mx-1 md:mx-2 font-bold', sizeClasses[size].number, currentTheme.text)}>:</span>
            )}
          </div>
        ))}
      </div>
      {subtitle && <p className={cn('text-center mt-6', currentTheme.label)}>{subtitle}</p>}
    </div>
  )
}

CountdownTimer.displayName = 'CountdownTimer'

CountdownTimer.config = {
  id: 'countdown-timer',
  name: 'Countdown Timer',
  category: 'marketing',
  description: 'Countdown timer for sales and events',
  defaultProps: {
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Sale Ends In',
    showLabels: true,
    variant: 'cards',
    size: 'md',
    theme: 'light',
    expiredMessage: 'This offer has expired',
  },
  editableFields: [
    { name: 'targetDate', label: 'Target Date', type: 'text' },
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'showLabels', label: 'Show Labels', type: 'boolean', defaultValue: true },
    { name: 'variant', label: 'Variant', type: 'select', options: ['simple', 'cards', 'circles', 'minimal'], defaultValue: 'cards' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
    { name: 'theme', label: 'Theme', type: 'select', options: ['light', 'dark', 'gradient'], defaultValue: 'light' },
    { name: 'expiredMessage', label: 'Expired Message', type: 'text' },
  ],
}
