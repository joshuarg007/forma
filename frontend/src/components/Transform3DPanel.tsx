'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  ChevronDown,
  ChevronRight,
  RotateCw,
  Move3D,
  Maximize,
  Eye,
  Layers,
  RefreshCw
} from 'lucide-react'
import { CanvasComponent, ComponentStyles } from '@/types/components'

interface Transform3DPanelProps {
  component: CanvasComponent
  onUpdate: (component: CanvasComponent) => void
}

interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
}

const Slider = ({ label, value, onChange, min, max, step = 1, unit = '' }: SliderProps) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-400">{label}</label>
      <span className="text-xs text-gray-500 font-mono">
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
    />
  </div>
)

export default function Transform3DPanel({ component, onUpdate }: Transform3DPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [previewActive, setPreviewActive] = useState(false)

  const transform3D = component.styles?.transform3D || {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    perspective: 1000,
    perspectiveOrigin: 'center center',
    transformStyle: 'preserve-3d' as const,
    backfaceVisibility: 'visible' as const
  }

  const updateTransform = (updates: Partial<typeof transform3D>) => {
    onUpdate({
      ...component,
      styles: {
        ...component.styles,
        transform3D: { ...transform3D, ...updates }
      }
    })
  }

  const resetTransforms = () => {
    onUpdate({
      ...component,
      styles: {
        ...component.styles,
        transform3D: undefined
      }
    })
  }

  // Generate CSS transform string for preview
  const getTransformCSS = () => {
    const transforms: string[] = []

    if (transform3D.perspective) {
      transforms.push(`perspective(${transform3D.perspective}px)`)
    }
    if (transform3D.rotateX) transforms.push(`rotateX(${transform3D.rotateX}deg)`)
    if (transform3D.rotateY) transforms.push(`rotateY(${transform3D.rotateY}deg)`)
    if (transform3D.rotateZ) transforms.push(`rotateZ(${transform3D.rotateZ}deg)`)
    if (transform3D.translateX) transforms.push(`translateX(${transform3D.translateX}px)`)
    if (transform3D.translateY) transforms.push(`translateY(${transform3D.translateY}px)`)
    if (transform3D.translateZ) transforms.push(`translateZ(${transform3D.translateZ}px)`)
    if (transform3D.scaleX !== 1) transforms.push(`scaleX(${transform3D.scaleX})`)
    if (transform3D.scaleY !== 1) transforms.push(`scaleY(${transform3D.scaleY})`)
    if (transform3D.scaleZ !== 1) transforms.push(`scaleZ(${transform3D.scaleZ})`)

    return transforms.join(' ')
  }

  const presets = [
    {
      name: 'Card Flip',
      transform: { rotateY: 180, perspective: 1000, transformStyle: 'preserve-3d' as const }
    },
    {
      name: 'Tilt Left',
      transform: { rotateY: -15, rotateX: 5, perspective: 1000 }
    },
    {
      name: 'Tilt Right',
      transform: { rotateY: 15, rotateX: 5, perspective: 1000 }
    },
    {
      name: 'Pop Out',
      transform: { translateZ: 50, scaleX: 1.05, scaleY: 1.05, perspective: 1000 }
    },
    {
      name: 'Isometric',
      transform: { rotateX: 45, rotateY: -45, perspective: 800 }
    },
    {
      name: 'Spin',
      transform: { rotateY: 360, perspective: 1000 }
    }
  ]

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-white">3D Transforms</span>
          {component.styles?.transform3D && (
            <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-5">
              {/* 3D Preview */}
              <div className="relative">
                <div
                  className="w-full h-32 bg-gray-800/50 rounded-lg flex items-center justify-center overflow-hidden"
                  style={{ perspective: `${transform3D.perspective}px` }}
                >
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center"
                    animate={{
                      transform: getTransformCSS(),
                      transformStyle: transform3D.transformStyle
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-white text-xs font-medium">3D</span>
                  </motion.div>
                </div>
                <button
                  onClick={resetTransforms}
                  className="absolute top-2 right-2 p-1.5 bg-gray-700/80 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Reset transforms"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-gray-300" />
                </button>
              </div>

              {/* Presets */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Quick Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateTransform(preset.transform)}
                      className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <RotateCw className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-medium text-white">Rotation</span>
                </div>
                <div className="space-y-3">
                  <Slider
                    label="Rotate X"
                    value={transform3D.rotateX || 0}
                    onChange={(v) => updateTransform({ rotateX: v })}
                    min={-180}
                    max={180}
                    unit="°"
                  />
                  <Slider
                    label="Rotate Y"
                    value={transform3D.rotateY || 0}
                    onChange={(v) => updateTransform({ rotateY: v })}
                    min={-180}
                    max={180}
                    unit="°"
                  />
                  <Slider
                    label="Rotate Z"
                    value={transform3D.rotateZ || 0}
                    onChange={(v) => updateTransform({ rotateZ: v })}
                    min={-180}
                    max={180}
                    unit="°"
                  />
                </div>
              </div>

              {/* Translation */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Move3D className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-medium text-white">Translation</span>
                </div>
                <div className="space-y-3">
                  <Slider
                    label="Translate X"
                    value={transform3D.translateX || 0}
                    onChange={(v) => updateTransform({ translateX: v })}
                    min={-200}
                    max={200}
                    unit="px"
                  />
                  <Slider
                    label="Translate Y"
                    value={transform3D.translateY || 0}
                    onChange={(v) => updateTransform({ translateY: v })}
                    min={-200}
                    max={200}
                    unit="px"
                  />
                  <Slider
                    label="Translate Z"
                    value={transform3D.translateZ || 0}
                    onChange={(v) => updateTransform({ translateZ: v })}
                    min={-200}
                    max={200}
                    unit="px"
                  />
                </div>
              </div>

              {/* Scale */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Maximize className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-medium text-white">Scale</span>
                </div>
                <div className="space-y-3">
                  <Slider
                    label="Scale X"
                    value={transform3D.scaleX || 1}
                    onChange={(v) => updateTransform({ scaleX: v })}
                    min={0.1}
                    max={2}
                    step={0.05}
                  />
                  <Slider
                    label="Scale Y"
                    value={transform3D.scaleY || 1}
                    onChange={(v) => updateTransform({ scaleY: v })}
                    min={0.1}
                    max={2}
                    step={0.05}
                  />
                  <Slider
                    label="Scale Z"
                    value={transform3D.scaleZ || 1}
                    onChange={(v) => updateTransform({ scaleZ: v })}
                    min={0.1}
                    max={2}
                    step={0.05}
                  />
                </div>
              </div>

              {/* Perspective */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-medium text-white">Perspective</span>
                </div>
                <div className="space-y-3">
                  <Slider
                    label="Distance"
                    value={transform3D.perspective || 1000}
                    onChange={(v) => updateTransform({ perspective: v })}
                    min={100}
                    max={2000}
                    step={50}
                    unit="px"
                  />
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Origin</label>
                    <select
                      value={transform3D.perspectiveOrigin || 'center center'}
                      onChange={(e) => updateTransform({ perspectiveOrigin: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="center center">Center</option>
                      <option value="top center">Top</option>
                      <option value="bottom center">Bottom</option>
                      <option value="left center">Left</option>
                      <option value="right center">Right</option>
                      <option value="top left">Top Left</option>
                      <option value="top right">Top Right</option>
                      <option value="bottom left">Bottom Left</option>
                      <option value="bottom right">Bottom Right</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-medium text-white">Advanced</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Transform Style</label>
                    <select
                      value={transform3D.transformStyle || 'preserve-3d'}
                      onChange={(e) => updateTransform({ transformStyle: e.target.value as 'flat' | 'preserve-3d' })}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="preserve-3d">Preserve 3D</option>
                      <option value="flat">Flat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Backface Visibility</label>
                    <select
                      value={transform3D.backfaceVisibility || 'visible'}
                      onChange={(e) => updateTransform({ backfaceVisibility: e.target.value as 'visible' | 'hidden' })}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Generated CSS */}
              <div className="pt-3 border-t border-gray-700">
                <label className="block text-xs font-medium text-gray-400 mb-2">Generated CSS</label>
                <pre className="p-3 bg-gray-800 rounded-lg text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                  {`transform: ${getTransformCSS() || 'none'};
transform-style: ${transform3D.transformStyle};
backface-visibility: ${transform3D.backfaceVisibility};`}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
