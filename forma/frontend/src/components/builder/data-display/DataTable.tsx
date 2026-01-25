'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps extends ModuleProps {
  columns?: TableColumn[]
  data?: Record<string, any>[]
  title?: string
  description?: string
  showHeader?: boolean
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  compact?: boolean
  showPagination?: boolean
  pageSize?: number
  showSearch?: boolean
  emptyMessage?: string
}

const defaultColumns: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

const defaultData = [
  { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
  { name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive' },
  { name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active' },
  { name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Viewer', status: 'Pending' },
]

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
}

export default function DataTable({
  id,
  className,
  styles,
  columns = defaultColumns,
  data = defaultData,
  title,
  description,
  showHeader = true,
  striped = true,
  hoverable = true,
  bordered = false,
  compact = false,
  showPagination = true,
  pageSize = 5,
  showSearch = true,
  emptyMessage = 'No data available',
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter data based on search
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = showPagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const renderCellValue = (value: any, key: string) => {
    if (key === 'status') {
      const statusClass = statusColors[String(value).toLowerCase()] || 'bg-gray-100 text-gray-700'
      return (
        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', statusClass)}>
          {value}
        </span>
      )
    }
    return value
  }

  return (
    <div
      id={id}
      className={cn('bg-white rounded-2xl shadow-lg overflow-hidden', className)}
      style={styles}
    >
      {/* Header */}
      {(title || showSearch) && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {title && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
              </div>
            )}
            {showSearch && (
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-64"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {showHeader && (
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'font-semibold text-gray-900 text-left',
                      compact ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && 'cursor-pointer hover:bg-gray-100 select-none'
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className={cn(
                      'flex items-center gap-1',
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end'
                    )}>
                      {column.label}
                      {column.sortable && sortColumn === column.key && (
                        <svg
                          className={cn('w-4 h-4 transition-transform', sortDirection === 'desc' && 'rotate-180')}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className={cn(bordered && 'divide-y divide-gray-200')}>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    striped && rowIndex % 2 === 1 && 'bg-gray-50',
                    hoverable && 'hover:bg-gray-100 transition-colors'
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'text-gray-600',
                        compact ? 'px-4 py-2 text-xs' : 'px-6 py-4 text-sm',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        bordered && 'border-b border-gray-200'
                      )}
                    >
                      {renderCellValue(row[column.key], column.key)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-8 h-8 text-sm font-medium rounded-lg transition-colors',
                  page === currentPage
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

DataTable.displayName = 'DataTable'

DataTable.config = {
  id: 'data-table',
  name: 'Data Table',
  category: 'data-display',
  description: 'Sortable, searchable data table with pagination',
  defaultProps: {
    columns: defaultColumns,
    data: defaultData,
    showHeader: true,
    striped: true,
    hoverable: true,
    bordered: false,
    compact: false,
    showPagination: true,
    pageSize: 5,
    showSearch: true,
    emptyMessage: 'No data available',
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'columns', label: 'Columns', type: 'array' },
    { name: 'data', label: 'Data', type: 'array' },
    { name: 'showHeader', label: 'Show Header', type: 'boolean', defaultValue: true },
    { name: 'striped', label: 'Striped Rows', type: 'boolean', defaultValue: true },
    { name: 'hoverable', label: 'Hoverable Rows', type: 'boolean', defaultValue: true },
    { name: 'bordered', label: 'Bordered', type: 'boolean', defaultValue: false },
    { name: 'compact', label: 'Compact', type: 'boolean', defaultValue: false },
    { name: 'showPagination', label: 'Show Pagination', type: 'boolean', defaultValue: true },
    { name: 'pageSize', label: 'Page Size', type: 'number', defaultValue: 5 },
    { name: 'showSearch', label: 'Show Search', type: 'boolean', defaultValue: true },
    { name: 'emptyMessage', label: 'Empty Message', type: 'text', defaultValue: 'No data available' },
  ],
}
