'use client'

import { cn } from '@/lib/utils'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface ChartWidgetProps {
  id?: string
  className?: string
  title?: string
  type?: 'bar' | 'line' | 'pie' | 'donut'
  data?: DataPoint[]
  showLegend?: boolean
  showValues?: boolean
  height?: number
}

const defaultData: DataPoint[] = [
  { label: 'Jan', value: 65, color: '#6366f1' },
  { label: 'Feb', value: 78, color: '#8b5cf6' },
  { label: 'Mar', value: 90, color: '#a855f7' },
  { label: 'Apr', value: 81, color: '#d946ef' },
  { label: 'May', value: 95, color: '#ec4899' },
  { label: 'Jun', value: 110, color: '#f43f5e' },
]

export default function ChartWidget({
  id,
  className,
  title = 'Revenue Overview',
  type = 'bar',
  data = defaultData,
  showLegend = true,
  showValues = true,
  height = 200,
}: ChartWidgetProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  if (type === 'pie' || type === 'donut') {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    let cumulativeAngle = 0

    return (
      <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
        {title && <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>}
        <div className="flex items-center gap-8">
          <div className="relative" style={{ width: height, height }}>
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {data.map((item, index) => {
                const angle = (item.value / total) * 360
                const startAngle = cumulativeAngle
                cumulativeAngle += angle
                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180)
                const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180)
                const largeArc = angle > 180 ? 1 : 0
                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={item.color || `hsl(${index * 60}, 70%, 50%)`}
                    className="hover:opacity-80 transition"
                  />
                )
              })}
              {type === 'donut' && (
                <circle cx="50" cy="50" r="25" fill="white" className="dark:fill-gray-900" />
              )}
            </svg>
            {type === 'donut' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            )}
          </div>
          {showLegend && (
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                  {showValues && <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (type === 'line') {
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: 100 - (d.value / maxValue) * 100,
    }))
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaD = `${pathD} L 100 100 L 0 100 Z`

    return (
      <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
        {title && <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>}
        <div style={{ height }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#lineGradient)" />
            <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill="#6366f1" className="hover:r-4 transition" />
            ))}
          </svg>
        </div>
        {showLegend && (
          <div className="flex justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
            {data.map((d) => <span key={d.label}>{d.label}</span>)}
          </div>
        )}
      </div>
    )
  }

  // Default bar chart
  return (
    <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      {title && <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>}
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center justify-end h-full">
              {showValues && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.value}</span>
              )}
              <div
                className="w-full rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#6366f1',
                  minHeight: 4,
                }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

ChartWidget.displayName = 'ChartWidget'

ChartWidget.config = {
  id: 'chart-widget',
  name: 'Chart Widget',
  category: 'dashboard',
  description: 'Bar, line, pie, or donut chart',
  defaultProps: { type: 'bar', showLegend: true, showValues: true, height: 200 },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'type', label: 'Chart Type', type: 'select', options: ['bar', 'line', 'pie', 'donut'] },
    { name: 'data', label: 'Data', type: 'array' },
    { name: 'showLegend', label: 'Show Legend', type: 'boolean' },
    { name: 'showValues', label: 'Show Values', type: 'boolean' },
    { name: 'height', label: 'Height', type: 'number' },
  ],
}
