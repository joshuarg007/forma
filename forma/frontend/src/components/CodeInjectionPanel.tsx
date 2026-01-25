'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code,
  FileCode,
  Braces,
  ChevronDown,
  ChevronRight,
  Play,
  AlertTriangle,
  Sparkles,
  Copy,
  Check
} from 'lucide-react'
import { CanvasComponent } from '@/types/components'

interface CodeInjectionPanelProps {
  component: CanvasComponent
  onUpdate: (component: CanvasComponent) => void
}

const cssPresets = [
  {
    name: 'Glassmorphism',
    css: `background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 16px;`
  },
  {
    name: 'Neon Glow',
    css: `box-shadow: 0 0 10px #00ff88,
             0 0 20px #00ff88,
             0 0 40px #00ff88;
text-shadow: 0 0 10px #00ff88;`
  },
  {
    name: 'Gradient Border',
    css: `background: linear-gradient(#1a1a2e, #1a1a2e) padding-box,
             linear-gradient(135deg, #667eea, #764ba2) border-box;
border: 2px solid transparent;
border-radius: 12px;`
  },
  {
    name: 'Neumorphism',
    css: `background: #e0e0e0;
border-radius: 16px;
box-shadow: 8px 8px 16px #bebebe,
            -8px -8px 16px #ffffff;`
  },
  {
    name: '3D Perspective',
    css: `transform: perspective(1000px) rotateX(5deg) rotateY(-5deg);
transform-style: preserve-3d;`
  }
]

const jsPresets = [
  {
    name: 'Parallax Scroll',
    js: `// Add parallax effect on scroll
const handleScroll = () => {
  const scrolled = window.scrollY;
  element.style.transform = \`translateY(\${scrolled * 0.3}px)\`;
};
window.addEventListener('scroll', handleScroll);`
  },
  {
    name: 'Mouse Follow',
    js: `// Element follows mouse cursor
document.addEventListener('mousemove', (e) => {
  const rect = element.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  element.style.transform = \`translate(\${x * 0.1}px, \${y * 0.1}px)\`;
});`
  },
  {
    name: 'Type Writer',
    js: `// Typewriter animation
const text = element.textContent;
element.textContent = '';
let i = 0;
const typeWriter = () => {
  if (i < text.length) {
    element.textContent += text.charAt(i);
    i++;
    setTimeout(typeWriter, 50);
  }
};
typeWriter();`
  },
  {
    name: 'Counter Animation',
    js: `// Animate number counting up
const target = parseInt(element.textContent);
let current = 0;
const increment = target / 50;
const counter = setInterval(() => {
  current += increment;
  element.textContent = Math.round(current);
  if (current >= target) {
    element.textContent = target;
    clearInterval(counter);
  }
}, 30);`
  }
]

export default function CodeInjectionPanel({ component, onUpdate }: CodeInjectionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<'css' | 'js' | 'html'>('css')
  const [showPresets, setShowPresets] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const customCode = component.customCode || {
    css: '',
    cssScope: 'component' as const,
    js: '',
    jsEvent: 'mount' as const,
    htmlBefore: '',
    htmlAfter: ''
  }

  const updateCode = (updates: Partial<typeof customCode>) => {
    onUpdate({
      ...component,
      customCode: { ...customCode, ...updates }
    })
  }

  const applyPreset = (code: string) => {
    if (activeTab === 'css') {
      updateCode({ css: customCode.css ? `${customCode.css}\n\n${code}` : code })
    } else if (activeTab === 'js') {
      updateCode({ js: customCode.js ? `${customCode.js}\n\n${code}` : code })
    }
    setShowPresets(false)
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-white">Custom Code</span>
          {(customCode.css || customCode.js) && (
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
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
            <div className="p-4">
              {/* Warning */}
              <div className="flex items-start gap-2 p-2.5 bg-amber-900/30 border border-amber-700/50 rounded-lg mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200">
                  Custom code is powerful but use with caution. Injected JavaScript runs in the browser context.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 mb-4 bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('css')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm transition-colors ${
                    activeTab === 'css'
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  CSS
                </button>
                <button
                  onClick={() => setActiveTab('js')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm transition-colors ${
                    activeTab === 'js'
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Braces className="w-3.5 h-3.5" />
                  JS
                </button>
                <button
                  onClick={() => setActiveTab('html')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm transition-colors ${
                    activeTab === 'html'
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  HTML
                </button>
              </div>

              {/* CSS Tab */}
              {activeTab === 'css' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-400">CSS Styles</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={customCode.cssScope || 'component'}
                        onChange={(e) => updateCode({ cssScope: e.target.value as 'component' | 'global' })}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="component" className="bg-gray-800 text-white">Component scope</option>
                        <option value="global" className="bg-gray-800 text-white">Global scope</option>
                      </select>
                      <button
                        onClick={() => setShowPresets(!showPresets)}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        Presets
                      </button>
                    </div>
                  </div>

                  {/* CSS Presets */}
                  <AnimatePresence>
                    {showPresets && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-2 gap-2 p-3 bg-gray-800/50 rounded-lg overflow-hidden"
                      >
                        {cssPresets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => applyPreset(preset.css)}
                            className="p-2 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <span className="text-xs font-medium text-white block">{preset.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea
                    value={customCode.css || ''}
                    onChange={(e) => updateCode({ css: e.target.value })}
                    placeholder=".component {&#10;  /* Your styles here */&#10;}"
                    className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 font-mono resize-y focus:outline-none focus:border-orange-500"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* JS Tab */}
              {activeTab === 'js' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-400">JavaScript</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={customCode.jsEvent || 'mount'}
                        onChange={(e) => updateCode({ jsEvent: e.target.value as 'mount' | 'click' | 'hover' | 'scroll' })}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="mount" className="bg-gray-800 text-white">On mount</option>
                        <option value="click" className="bg-gray-800 text-white">On click</option>
                        <option value="hover" className="bg-gray-800 text-white">On hover</option>
                        <option value="scroll" className="bg-gray-800 text-white">On scroll</option>
                      </select>
                      <button
                        onClick={() => setShowPresets(!showPresets)}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        Presets
                      </button>
                    </div>
                  </div>

                  {/* JS Presets */}
                  <AnimatePresence>
                    {showPresets && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 p-3 bg-gray-800/50 rounded-lg overflow-hidden"
                      >
                        {jsPresets.map((preset) => (
                          <div
                            key={preset.name}
                            className="p-2 bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-white">{preset.name}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => copyToClipboard(preset.js, preset.name)}
                                  className="p-1 hover:bg-gray-600 rounded transition-colors"
                                >
                                  {copied === preset.name ? (
                                    <Check className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-gray-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() => applyPreset(preset.js)}
                                  className="px-2 py-0.5 bg-orange-600 hover:bg-orange-500 rounded text-xs text-white transition-colors"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                            <pre className="text-[10px] text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap">
                              {preset.js.slice(0, 80)}...
                            </pre>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea
                    value={customCode.js || ''}
                    onChange={(e) => updateCode({ js: e.target.value })}
                    placeholder="// Access the element via 'element' variable&#10;element.addEventListener('click', () => {&#10;  console.log('Clicked!');&#10;});"
                    className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 font-mono resize-y focus:outline-none focus:border-orange-500"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* HTML Tab */}
              {activeTab === 'html' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      HTML Before Component
                    </label>
                    <textarea
                      value={customCode.htmlBefore || ''}
                      onChange={(e) => updateCode({ htmlBefore: e.target.value })}
                      placeholder="<!-- HTML to inject before -->"
                      className="w-full h-20 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 font-mono resize-y focus:outline-none focus:border-orange-500"
                      spellCheck={false}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      HTML After Component
                    </label>
                    <textarea
                      value={customCode.htmlAfter || ''}
                      onChange={(e) => updateCode({ htmlAfter: e.target.value })}
                      placeholder="<!-- HTML to inject after -->"
                      className="w-full h-20 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 font-mono resize-y focus:outline-none focus:border-orange-500"
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
