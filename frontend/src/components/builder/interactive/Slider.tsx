'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  id?: string
  className?: string
  label?: string
  min?: number
  max?: number
  step?: number
  initialValue?: number
  showValue?: boolean
  showMinMax?: boolean
  showMarks?: boolean
  marks?: { value: number; label: string }[]
  variant?: 'default' | 'range' | 'stepped'
  color?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  formatValue?: (value: number) => string
  onChange?: (value: number) => void
}

export default function Slider({
  id,
  className,
  label,
  min = 0,
  max = 100,
  step = 1,
  initialValue = 50,
  showValue = true,
  showMinMax = true,
  showMarks = false,
  marks,
  variant = 'default',
  color = 'primary',
  size = 'md',
  formatValue = (v) => String(v),
  onChange,
}: SliderProps) {
  const [value, setValue] = useState(initialValue)
  const [rangeStart, setRangeStart] = useState(25)
  const [rangeEnd, setRangeEnd] = useState(75)

  const percentage = ((value - min) / (max - min)) * 100
  const rangeStartPct = ((rangeStart - min) / (max - min)) * 100
  const rangeEndPct = ((rangeEnd - min) / (max - min)) * 100

  const handleChange = (newValue: number) => {
    setValue(newValue)
    onChange?.(newValue)
  }

  const colors = {
    primary: 'bg-indigo-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  }

  const thumbColors = {
    primary: 'border-indigo-600 focus:ring-indigo-500',
    success: 'border-green-500 focus:ring-green-500',
    warning: 'border-yellow-500 focus:ring-yellow-500',
    danger: 'border-red-500 focus:ring-red-500',
  }

  const sizes = {
    sm: { track: 'h-1', thumb: 'w-4 h-4' },
    md: { track: 'h-2', thumb: 'w-5 h-5' },
    lg: { track: 'h-3', thumb: 'w-6 h-6' },
  }

  const defaultMarks = [
    { value: min, label: formatValue(min) },
    { value: min + (max - min) * 0.25, label: formatValue(min + (max - min) * 0.25) },
    { value: min + (max - min) * 0.5, label: formatValue(min + (max - min) * 0.5) },
    { value: min + (max - min) * 0.75, label: formatValue(min + (max - min) * 0.75) },
    { value: max, label: formatValue(max) },
  ]

  const displayMarks = marks || defaultMarks

  if (variant === 'range') {
    return (
      <div id={id} className={cn('', className)}>
        {label && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            {showValue && (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatValue(rangeStart)} - {formatValue(rangeEnd)}
              </span>
            )}
          </div>
        )}

        <div className="relative pt-6 pb-2">
          <div className={cn('relative w-full rounded-full bg-gray-200 dark:bg-gray-700', sizes[size].track)}>
            <div
              className={cn('absolute h-full rounded-full', colors[color])}
              style={{
                left: `${rangeStartPct}%`,
                width: `${rangeEndPct - rangeStartPct}%`,
              }}
            />
          </div>

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={rangeStart}
            onChange={(e) => {
              const newValue = Math.min(parseInt(e.target.value), rangeEnd - step)
              setRangeStart(newValue)
            }}
            className="absolute top-0 w-full h-full opacity-0 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={rangeEnd}
            onChange={(e) => {
              const newValue = Math.max(parseInt(e.target.value), rangeStart + step)
              setRangeEnd(newValue)
            }}
            className="absolute top-0 w-full h-full opacity-0 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          />

          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full bg-white border-2 shadow-md',
              sizes[size].thumb,
              thumbColors[color]
            )}
            style={{ left: `calc(${rangeStartPct}% - ${parseInt(sizes[size].thumb.split(' ')[0].slice(2)) / 2}px)` }}
          />
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full bg-white border-2 shadow-md',
              sizes[size].thumb,
              thumbColors[color]
            )}
            style={{ left: `calc(${rangeEndPct}% - ${parseInt(sizes[size].thumb.split(' ')[0].slice(2)) / 2}px)` }}
          />
        </div>

        {showMinMax && (
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'stepped') {
    const steps = Math.floor((max - min) / step)
    const stepPositions = Array.from({ length: steps + 1 }, (_, i) => min + i * step)

    return (
      <div id={id} className={cn('', className)}>
        {label && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            {showValue && (
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatValue(value)}</span>
            )}
          </div>
        )}

        <div className="relative">
          <div className={cn('relative w-full rounded-full bg-gray-200 dark:bg-gray-700', sizes[size].track)}>
            <div
              className={cn('h-full rounded-full transition-all', colors[color])}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-0">
            {stepPositions.map((stepValue, i) => (
              <button
                key={i}
                onClick={() => handleChange(stepValue)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all',
                  stepValue <= value
                    ? colors[color]
                    : 'bg-gray-300 dark:bg-gray-600',
                  stepValue === value && 'ring-2 ring-offset-2 ring-indigo-500'
                )}
              />
            ))}
          </div>

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            className="absolute top-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {showMarks && (
          <div className="relative h-6 mt-2">
            {stepPositions.map((stepValue, i) => (
              <span
                key={i}
                className="absolute text-xs text-gray-500 dark:text-gray-400 transform -translate-x-1/2"
                style={{ left: `${((stepValue - min) / (max - min)) * 100}%` }}
              >
                {formatValue(stepValue)}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div id={id} className={cn('', className)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {showValue && (
            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatValue(value)}</span>
          )}
        </div>
      )}

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          className={cn(
            'w-full appearance-none rounded-full cursor-pointer',
            sizes[size].track,
            'bg-gray-200 dark:bg-gray-700',
            '[&::-webkit-slider-thumb]:appearance-none',
            `[&::-webkit-slider-thumb]:${sizes[size].thumb}`,
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:border-2',
            `[&::-webkit-slider-thumb]:${thumbColors[color].split(' ')[0]}`,
            '[&::-webkit-slider-thumb]:shadow-md',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:appearance-none',
            `[&::-moz-range-thumb]:${sizes[size].thumb}`,
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-white',
            '[&::-moz-range-thumb]:border-2',
            `[&::-moz-range-thumb]:${thumbColors[color].split(' ')[0]}`,
            '[&::-moz-range-thumb]:shadow-md',
            '[&::-moz-range-thumb]:cursor-pointer'
          )}
          style={{
            background: `linear-gradient(to right, ${color === 'primary' ? '#4f46e5' : color === 'success' ? '#22c55e' : color === 'warning' ? '#eab308' : '#ef4444'} 0%, ${color === 'primary' ? '#4f46e5' : color === 'success' ? '#22c55e' : color === 'warning' ? '#eab308' : '#ef4444'} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          }}
        />
      </div>

      {showMinMax && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}

      {showMarks && (
        <div className="relative h-6 mt-1">
          {displayMarks.map((mark, i) => (
            <span
              key={i}
              className="absolute text-xs text-gray-500 dark:text-gray-400 transform -translate-x-1/2"
              style={{ left: `${((mark.value - min) / (max - min)) * 100}%` }}
            >
              {mark.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

Slider.displayName = 'Slider'

Slider.config = {
  id: 'slider',
  name: 'Slider',
  category: 'interactive',
  description: 'Range slider input',
  defaultProps: { min: 0, max: 100, step: 1, initialValue: 50, showValue: true, showMinMax: true, variant: 'default', color: 'primary', size: 'md' },
  editableFields: [
    { name: 'label', label: 'Label', type: 'text' },
    { name: 'min', label: 'Min', type: 'number' },
    { name: 'max', label: 'Max', type: 'number' },
    { name: 'step', label: 'Step', type: 'number' },
    { name: 'initialValue', label: 'Initial Value', type: 'number' },
    { name: 'showValue', label: 'Show Value', type: 'boolean' },
    { name: 'showMinMax', label: 'Show Min/Max', type: 'boolean' },
    { name: 'showMarks', label: 'Show Marks', type: 'boolean' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'range', 'stepped'] },
    { name: 'color', label: 'Color', type: 'select', options: ['primary', 'success', 'warning', 'danger'] },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'] },
  ],
}
