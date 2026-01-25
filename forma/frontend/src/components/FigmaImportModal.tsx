'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileImage,
  Clipboard,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Code
} from 'lucide-react'
import { CanvasComponent } from '@/types/components'

interface FigmaImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (components: CanvasComponent[]) => void
}

interface ParsedElement {
  type: string
  name: string
  styles: Record<string, any>
  children?: ParsedElement[]
}

export default function FigmaImportModal({ isOpen, onClose, onImport }: FigmaImportModalProps) {
  const [pastedContent, setPastedContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle')
  const [parsedElements, setParsedElements] = useState<ParsedElement[]>([])
  const [error, setError] = useState('')

  const generateId = () => `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Parse Figma JSON (from Figma dev mode or plugins)
  const parseFigmaJSON = (json: any): ParsedElement[] => {
    const elements: ParsedElement[] = []

    const processNode = (node: any): ParsedElement | null => {
      // Skip invisible nodes
      if (node.visible === false) return null

      const element: ParsedElement = {
        type: mapFigmaType(node.type),
        name: node.name || 'Unnamed',
        styles: extractFigmaStyles(node),
        children: []
      }

      // Process children recursively
      if (node.children && Array.isArray(node.children)) {
        element.children = node.children
          .map(processNode)
          .filter((e: ParsedElement | null): e is ParsedElement => e !== null)
      }

      return element
    }

    if (json.document) {
      // Full Figma file export
      const pages = json.document.children || []
      for (const page of pages) {
        if (page.children) {
          for (const frame of page.children) {
            const el = processNode(frame)
            if (el) elements.push(el)
          }
        }
      }
    } else if (json.nodes) {
      // Node selection export
      for (const nodeId in json.nodes) {
        const node = json.nodes[nodeId].document
        const el = processNode(node)
        if (el) elements.push(el)
      }
    } else if (json.type) {
      // Single node
      const el = processNode(json)
      if (el) elements.push(el)
    }

    return elements
  }

  const mapFigmaType = (figmaType: string): string => {
    const typeMap: Record<string, string> = {
      'FRAME': 'container',
      'GROUP': 'container',
      'COMPONENT': 'container',
      'INSTANCE': 'container',
      'TEXT': 'text',
      'RECTANGLE': 'box',
      'ELLIPSE': 'circle',
      'VECTOR': 'icon',
      'IMAGE': 'image',
      'LINE': 'divider',
      'BOOLEAN_OPERATION': 'shape'
    }
    return typeMap[figmaType] || 'container'
  }

  const extractFigmaStyles = (node: any): Record<string, any> => {
    const styles: Record<string, any> = {}

    // Size
    if (node.absoluteBoundingBox) {
      styles.width = `${Math.round(node.absoluteBoundingBox.width)}px`
      styles.height = `${Math.round(node.absoluteBoundingBox.height)}px`
    }

    // Background
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0]
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b } = fill.color
        const a = fill.opacity ?? 1
        styles.backgroundColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`
      } else if (fill.type === 'GRADIENT_LINEAR' && fill.gradientStops) {
        const stops = fill.gradientStops.map((stop: any) => {
          const { r, g, b } = stop.color
          return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, 1) ${stop.position * 100}%`
        })
        styles.backgroundGradient = {
          type: 'linear',
          angle: 180,
          colors: fill.gradientStops.map((stop: any) => ({
            color: `rgba(${Math.round(stop.color.r * 255)}, ${Math.round(stop.color.g * 255)}, ${Math.round(stop.color.b * 255)}, 1)`,
            position: Math.round(stop.position * 100)
          }))
        }
      }
    }

    // Border radius
    if (node.cornerRadius) {
      styles.borderRadius = {
        topLeft: node.cornerRadius,
        topRight: node.cornerRadius,
        bottomRight: node.cornerRadius,
        bottomLeft: node.cornerRadius
      }
    } else if (node.rectangleCornerRadii) {
      const [tl, tr, br, bl] = node.rectangleCornerRadii
      styles.borderRadius = {
        topLeft: tl,
        topRight: tr,
        bottomRight: br,
        bottomLeft: bl
      }
    }

    // Border/Stroke
    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0]
      if (stroke.color) {
        const { r, g, b } = stroke.color
        styles.borderColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, 1)`
        styles.borderWidth = {
          top: node.strokeWeight || 1,
          right: node.strokeWeight || 1,
          bottom: node.strokeWeight || 1,
          left: node.strokeWeight || 1
        }
        styles.borderStyle = 'solid'
      }
    }

    // Shadow
    if (node.effects) {
      const shadows = node.effects.filter((e: any) => e.type === 'DROP_SHADOW' && e.visible !== false)
      if (shadows.length > 0) {
        styles.boxShadow = shadows.map((shadow: any) => ({
          x: shadow.offset?.x || 0,
          y: shadow.offset?.y || 0,
          blur: shadow.radius || 0,
          spread: shadow.spread || 0,
          color: shadow.color
            ? `rgba(${Math.round(shadow.color.r * 255)}, ${Math.round(shadow.color.g * 255)}, ${Math.round(shadow.color.b * 255)}, ${shadow.color.a || 1})`
            : 'rgba(0,0,0,0.1)'
        }))
      }
    }

    // Typography (for text nodes)
    if (node.type === 'TEXT' && node.style) {
      styles.fontFamily = node.style.fontFamily || 'Inter'
      styles.fontSize = `${node.style.fontSize || 16}px`
      styles.fontWeight = String(node.style.fontWeight || 400)
      styles.lineHeight = node.style.lineHeightPx ? `${node.style.lineHeightPx}px` : '1.5'
      if (node.style.letterSpacing) {
        styles.letterSpacing = `${node.style.letterSpacing}px`
      }
      if (node.style.textAlignHorizontal) {
        styles.textAlign = node.style.textAlignHorizontal.toLowerCase()
      }
    }

    // Layout (Auto Layout)
    if (node.layoutMode) {
      styles.display = 'flex'
      styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column'

      if (node.primaryAxisAlignItems) {
        const alignMap: Record<string, string> = {
          'MIN': 'start',
          'CENTER': 'center',
          'MAX': 'end',
          'SPACE_BETWEEN': 'between'
        }
        styles.justifyContent = alignMap[node.primaryAxisAlignItems] || 'start'
      }

      if (node.counterAxisAlignItems) {
        const alignMap: Record<string, string> = {
          'MIN': 'start',
          'CENTER': 'center',
          'MAX': 'end'
        }
        styles.alignItems = alignMap[node.counterAxisAlignItems] || 'start'
      }

      if (node.itemSpacing) {
        styles.gap = node.itemSpacing
      }
    }

    // Padding
    if (node.paddingTop !== undefined) {
      styles.padding = {
        top: node.paddingTop || 0,
        right: node.paddingRight || 0,
        bottom: node.paddingBottom || 0,
        left: node.paddingLeft || 0
      }
    }

    // Opacity
    if (node.opacity !== undefined && node.opacity !== 1) {
      styles.opacity = node.opacity
    }

    return styles
  }

  const convertToCanvasComponents = (elements: ParsedElement[], parentId?: string): CanvasComponent[] => {
    return elements.map((el) => {
      const id = generateId()
      const component: CanvasComponent = {
        id,
        type: el.type,
        name: el.name,
        props: {},
        styles: el.styles,
        parentId,
        children: el.children ? convertToCanvasComponents(el.children, id) : []
      }
      return component
    })
  }

  const handleParse = async () => {
    if (!pastedContent.trim()) {
      setError('Please paste Figma JSON content')
      setStatus('error')
      return
    }

    setStatus('parsing')
    setError('')

    try {
      // Try to parse as JSON
      let json: any
      try {
        json = JSON.parse(pastedContent)
      } catch {
        // Try to extract JSON from mixed content
        const jsonMatch = pastedContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          json = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Invalid JSON format')
        }
      }

      // Parse Figma structure
      const elements = parseFigmaJSON(json)

      if (elements.length === 0) {
        throw new Error('No valid elements found in the Figma data')
      }

      setParsedElements(elements)
      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'Failed to parse Figma data')
      setStatus('error')
    }
  }

  const handleImport = () => {
    const components = convertToCanvasComponents(parsedElements)
    onImport(components)
    handleClose()
  }

  const handleClose = () => {
    setPastedContent('')
    setParsedElements([])
    setStatus('idle')
    setError('')
    onClose()
  }

  const ElementPreview = ({ element, depth = 0 }: { element: ParsedElement; depth?: number }) => (
    <div className="ml-4" style={{ marginLeft: depth * 16 }}>
      <div className="flex items-center gap-2 py-1">
        <Layers className="w-3 h-3 text-gray-500" />
        <span className="text-xs text-gray-300">{element.name}</span>
        <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
          {element.type}
        </span>
      </div>
      {element.children?.map((child, i) => (
        <ElementPreview key={i} element={child} depth={depth + 1} />
      ))}
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] max-h-[85vh] bg-gray-900 border border-gray-700 rounded-2xl z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <FileImage className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Import from Figma</h2>
                  <p className="text-xs text-gray-400">Paste Figma JSON to convert to components</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {status === 'idle' || status === 'error' ? (
                <div className="space-y-4">
                  {/* Instructions */}
                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      How to export from Figma
                    </h3>
                    <ol className="space-y-2 text-xs text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 flex items-center justify-center bg-gray-700 rounded text-white font-medium flex-shrink-0">1</span>
                        Select your frame or component in Figma
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 flex items-center justify-center bg-gray-700 rounded text-white font-medium flex-shrink-0">2</span>
                        Right-click → Copy/Paste as → Copy as JSON (or use Figma Dev Mode)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 flex items-center justify-center bg-gray-700 rounded text-white font-medium flex-shrink-0">3</span>
                        Paste the JSON below and click "Parse"
                      </li>
                    </ol>
                  </div>

                  {/* Paste Area */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Paste Figma JSON
                    </label>
                    <div className="relative">
                      <textarea
                        value={pastedContent}
                        onChange={(e) => {
                          setPastedContent(e.target.value)
                          if (status === 'error') setStatus('idle')
                        }}
                        placeholder='{"document": {"children": [...]}}'
                        className="w-full h-56 bg-gray-800 border border-gray-600 rounded-xl p-4 text-sm text-gray-300 font-mono resize-none focus:outline-none focus:border-purple-500"
                        spellCheck={false}
                      />
                      <button
                        onClick={async () => {
                          const text = await navigator.clipboard.readText()
                          setPastedContent(text)
                        }}
                        className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                        Paste
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {status === 'error' && error && (
                    <div className="flex items-start gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300">{error}</p>
                    </div>
                  )}
                </div>
              ) : status === 'parsing' ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
                  <p className="text-sm text-gray-400">Parsing Figma data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Success message */}
                  <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-green-300">
                      Found {parsedElements.length} element{parsedElements.length !== 1 && 's'} to import
                    </p>
                  </div>

                  {/* Preview */}
                  <div>
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      Element Structure
                    </h3>
                    <div className="bg-gray-800 rounded-xl p-4 max-h-64 overflow-y-auto">
                      {parsedElements.map((el, i) => (
                        <ElementPreview key={i} element={el} />
                      ))}
                    </div>
                  </div>

                  {/* Import info */}
                  <div className="flex items-center gap-3 p-4 bg-purple-900/20 border border-purple-700/50 rounded-xl">
                    <Code className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">Ready to import</p>
                      <p className="text-xs text-gray-400">
                        Styles, layout, and colors will be preserved
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex items-center gap-3">
              {status === 'success' ? (
                <>
                  <button
                    onClick={() => {
                      setStatus('idle')
                      setParsedElements([])
                    }}
                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Import Components
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleParse}
                    disabled={!pastedContent.trim() || status === 'parsing'}
                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    {status === 'parsing' ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Parsing...
                      </span>
                    ) : (
                      'Parse JSON'
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
