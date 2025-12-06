'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Plus,
  Trash2,
  RefreshCw,
  Play,
  ChevronDown,
  ChevronRight,
  Link,
  Code,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { CanvasComponent } from '@/types/components'

interface DataBindingPanelProps {
  component: CanvasComponent
  onUpdate: (component: CanvasComponent) => void
}

export default function DataBindingPanel({ component, onUpdate }: DataBindingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error'
    data?: any
    error?: string
  }>({ status: 'idle' })

  const dataBinding = component.dataBinding || {
    source: '',
    method: 'GET' as const,
    headers: {},
    mapping: {},
    refreshInterval: 0,
    cache: true
  }

  const updateBinding = (updates: Partial<typeof dataBinding>) => {
    onUpdate({
      ...component,
      dataBinding: { ...dataBinding, ...updates }
    })
  }

  const addHeader = () => {
    updateBinding({
      headers: { ...dataBinding.headers, '': '' }
    })
  }

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const newHeaders = { ...dataBinding.headers }
    if (oldKey !== newKey) {
      delete newHeaders[oldKey]
    }
    newHeaders[newKey] = value
    updateBinding({ headers: newHeaders })
  }

  const removeHeader = (key: string) => {
    const newHeaders = { ...dataBinding.headers }
    delete newHeaders[key]
    updateBinding({ headers: newHeaders })
  }

  const addMapping = () => {
    updateBinding({
      mapping: { ...dataBinding.mapping, '': '' }
    })
  }

  const updateMapping = (oldProp: string, newProp: string, dataPath: string) => {
    const newMapping = { ...dataBinding.mapping }
    if (oldProp !== newProp) {
      delete newMapping[oldProp]
    }
    newMapping[newProp] = dataPath
    updateBinding({ mapping: newMapping })
  }

  const removeMapping = (prop: string) => {
    const newMapping = { ...dataBinding.mapping }
    delete newMapping[prop]
    updateBinding({ mapping: newMapping })
  }

  const testConnection = async () => {
    if (!dataBinding.source) {
      setTestResult({ status: 'error', error: 'No API endpoint specified' })
      return
    }

    setTestResult({ status: 'loading' })

    try {
      const response = await fetch(dataBinding.source, {
        method: dataBinding.method,
        headers: {
          'Content-Type': 'application/json',
          ...dataBinding.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setTestResult({ status: 'success', data })
    } catch (error: any) {
      setTestResult({ status: 'error', error: error.message })
    }
  }

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-white">API Data Binding</span>
          {dataBinding.source && (
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
              Connected
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
            <div className="p-4 space-y-4">
              {/* API Endpoint */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  API Endpoint
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={dataBinding.method}
                    onChange={(e) => updateBinding({ method: e.target.value as 'GET' | 'POST' })}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                  <input
                    type="text"
                    value={dataBinding.source || ''}
                    onChange={(e) => updateBinding({ source: e.target.value })}
                    placeholder="https://api.example.com/data"
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Headers */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-400">Headers</label>
                  <button
                    onClick={addHeader}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(dataBinding.headers || {}).map(([key, value], index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => updateHeader(key, e.target.value, value as string)}
                        placeholder="Header name"
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        value={value as string}
                        onChange={(e) => updateHeader(key, key, e.target.value)}
                        placeholder="Value"
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => removeHeader(key)}
                        className="p-1.5 hover:bg-red-900/50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Mapping */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-400">
                    Data Mapping
                    <span className="ml-1 text-gray-500">(prop → data.path)</span>
                  </label>
                  <button
                    onClick={addMapping}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(dataBinding.mapping || {}).map(([prop, path], index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={prop}
                        onChange={(e) => updateMapping(prop, e.target.value, path as string)}
                        placeholder="Component prop"
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                      <Link className="w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={path as string}
                        onChange={(e) => updateMapping(prop, prop, e.target.value)}
                        placeholder="data.items[0].name"
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                      />
                      <button
                        onClick={() => removeMapping(prop)}
                        className="p-1.5 hover:bg-red-900/50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Auto-refresh (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dataBinding.refreshInterval || 0}
                    onChange={(e) => updateBinding({ refreshInterval: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataBinding.cache !== false}
                      onChange={(e) => updateBinding({ cache: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-gray-300">Cache responses</span>
                  </label>
                </div>
              </div>

              {/* Test Connection */}
              <div className="pt-3 border-t border-gray-700">
                <button
                  onClick={testConnection}
                  disabled={testResult.status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 rounded-lg text-sm text-white transition-colors"
                >
                  {testResult.status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Test Connection
                </button>

                {/* Test Result */}
                {testResult.status !== 'idle' && testResult.status !== 'loading' && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    testResult.status === 'success'
                      ? 'bg-green-900/30 border border-green-700'
                      : 'bg-red-900/30 border border-red-700'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {testResult.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        testResult.status === 'success' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {testResult.status === 'success' ? 'Connection successful!' : 'Connection failed'}
                      </span>
                    </div>
                    {testResult.error && (
                      <p className="text-xs text-red-300">{testResult.error}</p>
                    )}
                    {testResult.data && (
                      <pre className="text-xs text-gray-300 bg-black/30 p-2 rounded overflow-auto max-h-32 font-mono">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
