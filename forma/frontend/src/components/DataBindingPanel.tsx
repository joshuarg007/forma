'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Loader2,
  Zap,
  Server,
  Table2,
  ArrowRight
} from 'lucide-react'
import { CanvasComponent } from '@/types/components'
import { useProjectStore } from '@/stores/projectStore'
import type { SchemaDefinition } from '@/types/schema'

interface DataBindingPanelProps {
  component: CanvasComponent
  onUpdate: (component: CanvasComponent) => void
}

export default function DataBindingPanel({ component, onUpdate }: DataBindingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick')
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error'
    data?: any
    error?: string
  }>({ status: 'idle' })

  const { currentProject } = useProjectStore()

  // Get schema from project
  const schema = currentProject?.schema_json as SchemaDefinition | null
  const runtimeUrl = currentProject?.runtime_api_url
  const isDeployed = !!runtimeUrl

  // Extract collections from schema
  const collections = useMemo(() => {
    if (!schema?.collections) return []
    return Object.entries(schema.collections).map(([name, def]) => ({
      name,
      displayName: def.displayName || name,
      fields: Object.entries(def.fields || {}).map(([fieldName, fieldDef]) => ({
        name: fieldName,
        type: fieldDef.type,
        required: fieldDef.required,
      })),
      isAuth: def.auth || false,
    }))
  }, [schema])

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

  // Quick bind to a collection
  const bindToCollection = (collectionName: string) => {
    if (!runtimeUrl) return

    const collection = collections.find(c => c.name === collectionName)
    if (!collection) return

    // Auto-generate mapping based on component type and collection fields
    const autoMapping: Record<string, string> = {}

    // Smart mapping based on common patterns
    collection.fields.forEach(field => {
      // Map title/name fields
      if (['title', 'name', 'heading'].includes(field.name)) {
        if (component.type.includes('hero') || component.type.includes('heading')) {
          autoMapping['title'] = `data.${field.name}`
        }
      }
      // Map description/content fields
      if (['description', 'content', 'body', 'subtitle', 'text'].includes(field.name)) {
        autoMapping['subtitle'] = `data.${field.name}`
        autoMapping['description'] = `data.${field.name}`
      }
      // Map image fields
      if (['image', 'imageUrl', 'image_url', 'thumbnail', 'avatar'].includes(field.name)) {
        autoMapping['imageUrl'] = `data.${field.name}`
      }
    })

    updateBinding({
      source: `${runtimeUrl}/${collectionName}`,
      method: 'GET',
      mapping: autoMapping,
      headers: {},
      refreshInterval: 0,
      cache: true,
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

  const clearBinding = () => {
    updateBinding({
      source: '',
      method: 'GET',
      headers: {},
      mapping: {},
      refreshInterval: 0,
      cache: true,
    })
    setTestResult({ status: 'idle' })
  }

  // Detect which collection is currently bound (if any)
  const boundCollection = useMemo(() => {
    if (!runtimeUrl || !dataBinding.source) return null
    const match = dataBinding.source.match(new RegExp(`${runtimeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([^/]+)`))
    return match ? match[1] : null
  }, [runtimeUrl, dataBinding.source])

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-forma-900/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-white">Data Binding</span>
          {dataBinding.source && (
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
              Connected
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/40" />
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
            <div className="p-4 space-y-4 border-t border-white/10">
              {/* Runtime Status */}
              {!isDeployed ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Deploy your backend first to bind data</span>
                  </div>
                  <p className="text-xs text-amber-400/70 mt-1 ml-6">
                    Go to Data Modeler → Deploy Backend
                  </p>
                </div>
              ) : (
                <>
                  {/* Tab switcher */}
                  <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                    <button
                      onClick={() => setActiveTab('quick')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs transition ${
                        activeTab === 'quick'
                          ? 'bg-cyan-500 text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Quick Bind
                    </button>
                    <button
                      onClick={() => setActiveTab('custom')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs transition ${
                        activeTab === 'custom'
                          ? 'bg-cyan-500 text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      Custom API
                    </button>
                  </div>

                  {activeTab === 'quick' ? (
                    /* Quick Bind - Collection Selection */
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Server className="w-3.5 h-3.5" />
                        <span>Your Collections</span>
                      </div>

                      {collections.length === 0 ? (
                        <p className="text-xs text-white/40 text-center py-4">
                          No collections in your schema yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {collections.map((collection) => (
                            <button
                              key={collection.name}
                              onClick={() => bindToCollection(collection.name)}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${
                                boundCollection === collection.name
                                  ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                              }`}
                            >
                              <Table2 className={`w-4 h-4 ${
                                boundCollection === collection.name ? 'text-cyan-400' : 'text-white/40'
                              }`} />
                              <div className="flex-1 text-left">
                                <div className="text-sm font-medium">{collection.displayName}</div>
                                <div className="text-xs text-white/40">
                                  {collection.fields.length} fields
                                  {collection.isAuth && ' • Auth'}
                                </div>
                              </div>
                              {boundCollection === collection.name ? (
                                <CheckCircle className="w-4 h-4 text-cyan-400" />
                              ) : (
                                <ArrowRight className="w-4 h-4 text-white/20" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Show current binding info */}
                      {boundCollection && (
                        <div className="p-3 bg-white/5 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/60">API Endpoint</span>
                            <button
                              onClick={clearBinding}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Clear
                            </button>
                          </div>
                          <code className="block text-xs text-cyan-400 bg-black/30 p-2 rounded font-mono break-all">
                            {dataBinding.source}
                          </code>

                          {Object.keys(dataBinding.mapping || {}).length > 0 && (
                            <>
                              <div className="text-xs text-white/60 pt-2">Auto-mapped fields</div>
                              <div className="space-y-1">
                                {Object.entries(dataBinding.mapping || {}).map(([prop, path]) => (
                                  <div key={prop} className="flex items-center gap-2 text-xs">
                                    <span className="text-white/80">{prop}</span>
                                    <ArrowRight className="w-3 h-3 text-white/30" />
                                    <span className="text-cyan-400 font-mono">{path as string}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Custom API Tab */
                    <div className="space-y-4">
                      {/* API Endpoint */}
                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5">
                          API Endpoint
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            value={dataBinding.method}
                            onChange={(e) => updateBinding({ method: e.target.value as 'GET' | 'POST' })}
                            className="bg-forma-900 border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                          </select>
                          <input
                            type="text"
                            value={dataBinding.source || ''}
                            onChange={(e) => updateBinding({ source: e.target.value })}
                            placeholder="https://api.example.com/data"
                            className="flex-1 bg-forma-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Headers */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-medium text-white/60">Headers</label>
                          <button
                            onClick={addHeader}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-white/40" />
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
                                className="flex-1 bg-forma-900 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500"
                              />
                              <input
                                type="text"
                                value={value as string}
                                onChange={(e) => updateHeader(key, key, e.target.value)}
                                placeholder="Value"
                                className="flex-1 bg-forma-900 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500"
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
                          <label className="text-xs font-medium text-white/60">
                            Data Mapping
                            <span className="ml-1 text-white/40">(prop → data.path)</span>
                          </label>
                          <button
                            onClick={addMapping}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-white/40" />
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
                                className="flex-1 bg-forma-900 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500"
                              />
                              <Link className="w-4 h-4 text-white/30" />
                              <input
                                type="text"
                                value={path as string}
                                onChange={(e) => updateMapping(prop, prop, e.target.value)}
                                placeholder="data.items[0].name"
                                className="flex-1 bg-forma-900 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 font-mono text-xs"
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
                          <label className="block text-xs font-medium text-white/60 mb-1.5">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Auto-refresh (sec)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={dataBinding.refreshInterval || 0}
                            onChange={(e) => updateBinding({ refreshInterval: parseInt(e.target.value) || 0 })}
                            className="w-full bg-forma-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={dataBinding.cache !== false}
                              onChange={(e) => updateBinding({ cache: e.target.checked })}
                              className="w-4 h-4 rounded border-white/20 bg-forma-900 text-cyan-500 focus:ring-cyan-500"
                            />
                            <span className="text-sm text-white/60">Cache responses</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Test Connection */}
                  {dataBinding.source && (
                    <div className="pt-3 border-t border-white/10">
                      <button
                        onClick={testConnection}
                        disabled={testResult.status === 'loading'}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-white/10 rounded-lg text-sm text-white transition-colors"
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
                            ? 'bg-green-900/30 border border-green-500/30'
                            : 'bg-red-900/30 border border-red-500/30'
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
                            <pre className="text-xs text-white/60 bg-black/30 p-2 rounded overflow-auto max-h-32 font-mono">
                              {JSON.stringify(testResult.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
