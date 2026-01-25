'use client'

import { cn } from '@/lib/utils'

interface Client {
  id: string
  name: string
  logo?: string
  url?: string
}

interface ClientListProps {
  id?: string
  className?: string
  title?: string
  subtitle?: string
  clients?: Client[]
  layout?: 'grid' | 'inline' | 'marquee'
  columns?: 3 | 4 | 5 | 6
  showTitle?: boolean
  grayscale?: boolean
}

const defaultClients: Client[] = [
  { id: '1', name: 'Vercel' },
  { id: '2', name: 'Stripe' },
  { id: '3', name: 'Notion' },
  { id: '4', name: 'Linear' },
  { id: '5', name: 'Figma' },
  { id: '6', name: 'Framer' },
  { id: '7', name: 'Supabase' },
  { id: '8', name: 'Raycast' },
]

export default function ClientList({
  id,
  className,
  title = 'Trusted by leading companies',
  subtitle = 'I\'ve had the pleasure of working with some amazing clients',
  clients = defaultClients,
  layout = 'grid',
  columns = 4,
  showTitle = true,
  grayscale = true,
}: ClientListProps) {
  const gridCols = {
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-3 md:grid-cols-6',
  }

  const renderClientLogo = (client: Client) => (
    <div
      key={client.id}
      className={cn(
        'flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition',
        grayscale && 'grayscale hover:grayscale-0'
      )}
    >
      {client.logo ? (
        <img
          src={client.logo}
          alt={client.name}
          className="h-8 w-auto object-contain"
        />
      ) : (
        <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
          {client.name}
        </span>
      )}
    </div>
  )

  if (layout === 'marquee') {
    return (
      <div id={id} className={cn('py-12 overflow-hidden', className)}>
        {showTitle && (
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
        )}
        <div className="relative">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...clients, ...clients].map((client, index) => (
              <div
                key={`${client.id}-${index}`}
                className={cn(
                  'mx-4 flex items-center justify-center px-8 py-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800',
                  grayscale && 'grayscale hover:grayscale-0'
                )}
              >
                {client.logo ? (
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {client.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
        `}</style>
      </div>
    )
  }

  if (layout === 'inline') {
    return (
      <div id={id} className={cn('py-12', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showTitle && (
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
              {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {clients.map((client) => (
              <div
                key={client.id}
                className={cn(
                  'flex items-center justify-center',
                  grayscale && 'grayscale hover:grayscale-0 transition'
                )}
              >
                {client.logo ? (
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition">
                    {client.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default grid layout
  return (
    <div id={id} className={cn('py-12', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
        )}
        <div className={cn('grid gap-4', gridCols[columns])}>
          {clients.map(renderClientLogo)}
        </div>
      </div>
    </div>
  )
}

ClientList.displayName = 'ClientList'

ClientList.config = {
  id: 'client-list',
  name: 'Client List',
  category: 'portfolio',
  description: 'Client logo showcase',
  defaultProps: {
    layout: 'grid',
    columns: 4,
    showTitle: true,
    grayscale: true,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'clients', label: 'Clients', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['grid', 'inline', 'marquee'] },
    { name: 'columns', label: 'Columns', type: 'select', options: [3, 4, 5, 6] },
    { name: 'showTitle', label: 'Show Title', type: 'boolean' },
    { name: 'grayscale', label: 'Grayscale', type: 'boolean' },
  ],
}
