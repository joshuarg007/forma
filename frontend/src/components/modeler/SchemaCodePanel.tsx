'use client'

import { useState } from 'react'
import { Copy, Check, Download, Upload, Code, AlertCircle } from 'lucide-react'
import { useSchemaStore } from '@/stores/schemaStore'

interface SchemaCodePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SchemaCodePanel({ isOpen, onClose }: SchemaCodePanelProps) {
  const { schema, exportSchema, importSchema, isDirty } = useSchemaStore()
  const [copied, setCopied] = useState(false)
  const [importMode, setImportMode] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  if (!isOpen) return null

  const schemaJson = exportSchema()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(schemaJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([schemaJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${schema?.name || 'schema'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    try {
      importSchema(importText)
      setImportMode(false)
      setImportText('')
      setImportError(null)
    } catch (e) {
      setImportError((e as Error).message)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      try {
        importSchema(text)
        setImportMode(false)
        setImportError(null)
      } catch (err) {
        setImportError((err as Error).message)
        setImportText(text)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed right-0 top-0 h-full w-[500px] bg-zinc-900 border-l border-zinc-700 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 bg-zinc-800">
        <div className="flex items-center gap-2">
          <Code size={18} className="text-blue-400" />
          <h3 className="font-medium text-white">Schema JSON</h3>
          {isDirty && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
              unsaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!importMode && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
                title="Copy to clipboard"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2 py-1 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
                title="Download schema.json"
              >
                <Download size={14} />
              </button>

              <button
                onClick={() => setImportMode(true)}
                className="flex items-center gap-1 px-2 py-1 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
                title="Import schema"
              >
                <Upload size={14} />
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
          >
            Close
          </button>
        </div>
      </div>

      {/* Content */}
      {importMode ? (
        <div className="flex-1 flex flex-col p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-300">Import Schema</h4>
            <button
              onClick={() => {
                setImportMode(false)
                setImportError(null)
              }}
              className="text-sm text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {importError && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle size={16} className="text-red-400 mt-0.5" />
              <p className="text-sm text-red-400">{importError}</p>
            </div>
          )}

          <div className="flex-1">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your schema.json here..."
              className="w-full h-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-mono text-zinc-300 resize-none focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer border border-zinc-700">
                <Upload size={14} />
                Upload File
              </span>
            </label>

            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap">
            <code>{schemaJson}</code>
          </pre>
        </div>
      )}

      {/* Footer with stats */}
      {!importMode && schema && (
        <div className="px-4 py-3 border-t border-zinc-700 bg-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{Object.keys(schema.collections).length} collections</span>
            <span>
              {Object.values(schema.collections).reduce(
                (acc, c) => acc + Object.keys(c.fields).length,
                0
              )}{' '}
              fields
            </span>
            <span>{schemaJson.length.toLocaleString()} bytes</span>
          </div>
        </div>
      )}
    </div>
  )
}
