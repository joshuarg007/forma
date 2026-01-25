/**
 * useDataBinding Hook
 *
 * Fetches data from runtime API based on component's dataBinding configuration
 * and maps the response to component props.
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface DataBindingConfig {
  source?: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  mapping?: Record<string, string>
  refreshInterval?: number
  cache?: boolean
}

export interface DataBindingState {
  data: any
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Simple cache for data binding results
const dataCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute cache

/**
 * Get value from nested object using dot notation path
 * e.g., getValue({ user: { name: 'John' }}, 'user.name') => 'John'
 */
function getValue(obj: any, path: string): any {
  if (!path || !obj) return undefined

  // Handle array access like 'items[0].name'
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')

  let current = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = current[part]
  }
  return current
}

/**
 * Map API response data to component props using the mapping configuration
 */
export function mapDataToProps(
  data: any,
  mapping: Record<string, string> | undefined,
  existingProps: Record<string, any> = {}
): Record<string, any> {
  if (!mapping || !data) return existingProps

  const mappedProps = { ...existingProps }

  for (const [propPath, dataPath] of Object.entries(mapping)) {
    // dataPath can be like 'data.title' or 'data.items[0].name'
    const value = getValue(data, dataPath.replace(/^data\./, ''))

    if (value !== undefined) {
      // Handle nested prop paths like 'content.title'
      const propParts = propPath.split('.')
      if (propParts.length === 1) {
        mappedProps[propPath] = value
      } else {
        // Create nested structure
        let current = mappedProps
        for (let i = 0; i < propParts.length - 1; i++) {
          if (!current[propParts[i]]) {
            current[propParts[i]] = {}
          }
          current = current[propParts[i]]
        }
        current[propParts[propParts.length - 1]] = value
      }
    }
  }

  return mappedProps
}

/**
 * Hook for fetching and managing data binding state
 */
export function useDataBinding(config: DataBindingConfig | undefined): DataBindingState {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    if (!config?.source) {
      setData(null)
      setError(null)
      return
    }

    // Check cache first
    if (config.cache !== false) {
      const cached = dataCache.get(config.source)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setData(cached.data)
        setLoading(false)
        return
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(config.source, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      // Cache the result
      if (config.cache !== false) {
        dataCache.set(config.source, { data: result, timestamp: Date.now() })
      }

      setData(result)
      setError(null)
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Failed to fetch data')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [config?.source, config?.method, config?.headers, config?.cache])

  // Initial fetch and refresh interval
  useEffect(() => {
    fetchData()

    // Set up refresh interval if configured
    if (config?.refreshInterval && config.refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, config.refreshInterval * 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData, config?.refreshInterval])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

/**
 * Hook for data binding in preview context - returns mapped props ready to use
 */
export function useDataBoundProps(
  dataBinding: DataBindingConfig | undefined,
  baseProps: Record<string, any>
): {
  props: Record<string, any>
  loading: boolean
  error: string | null
  hasBinding: boolean
} {
  const { data, loading, error } = useDataBinding(dataBinding)

  const hasBinding = !!(dataBinding?.source && dataBinding?.mapping)

  const props = hasBinding && data
    ? mapDataToProps(data, dataBinding?.mapping, baseProps)
    : baseProps

  return {
    props,
    loading,
    error,
    hasBinding,
  }
}

/**
 * Clear the data binding cache
 */
export function clearDataBindingCache(source?: string) {
  if (source) {
    dataCache.delete(source)
  } else {
    dataCache.clear()
  }
}
