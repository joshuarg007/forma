'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  title: string
  description: string
  image: string
  category: string
  tags?: string[]
  link?: string
  year?: string
}

interface PortfolioGridProps {
  id?: string
  className?: string
  projects?: Project[]
  columns?: 2 | 3 | 4
  showFilter?: boolean
  showTags?: boolean
  layout?: 'grid' | 'masonry'
  hoverEffect?: 'zoom' | 'overlay' | 'slide'
}

const defaultProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'A modern e-commerce solution with real-time inventory and AI recommendations.',
    image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800',
    category: 'Web App',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    year: '2024',
  },
  {
    id: '2',
    title: 'Finance Dashboard',
    description: 'Real-time financial analytics dashboard for enterprise clients.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    category: 'Dashboard',
    tags: ['Vue.js', 'D3.js', 'Python'],
    year: '2024',
  },
  {
    id: '3',
    title: 'Health & Wellness App',
    description: 'Mobile-first wellness tracking with AI-powered insights.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
    category: 'Mobile',
    tags: ['React Native', 'Firebase'],
    year: '2023',
  },
  {
    id: '4',
    title: 'Brand Identity System',
    description: 'Complete brand identity for a sustainable fashion startup.',
    image: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800',
    category: 'Branding',
    tags: ['Figma', 'Illustrator'],
    year: '2023',
  },
  {
    id: '5',
    title: 'SaaS Landing Page',
    description: 'High-converting landing page for a B2B SaaS product.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    category: 'Web App',
    tags: ['Next.js', 'Tailwind'],
    year: '2024',
  },
  {
    id: '6',
    title: 'Restaurant Ordering System',
    description: 'Digital ordering and payment solution for restaurants.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    category: 'Mobile',
    tags: ['Flutter', 'Stripe'],
    year: '2023',
  },
]

export default function PortfolioGrid({
  id,
  className,
  projects = defaultProjects,
  columns = 3,
  showFilter = true,
  showTags = true,
  layout = 'grid',
  hoverEffect = 'overlay',
}: PortfolioGridProps) {
  const [activeFilter, setActiveFilter] = useState('All')

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))]

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === activeFilter)

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div id={id} className={cn('py-12', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter */}
        {showFilter && (
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition',
                  activeFilter === category
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className={cn('grid gap-8', gridCols[columns])}>
          {filteredProjects.map((project) => (
            <a
              key={project.id}
              href="#"
              className="group relative block rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className={cn(
                    'w-full h-full object-cover transition duration-500',
                    hoverEffect === 'zoom' && 'group-hover:scale-110'
                  )}
                />

                {/* Overlay */}
                {hoverEffect === 'overlay' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white/80 text-sm mb-2">{project.description}</p>
                      {showTags && project.tags && (
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-white/20 text-white text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Slide effect */}
                {hoverEffect === 'slide' && (
                  <div className="absolute inset-0 bg-gray-900/90 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center">
                    <div className="p-6 text-center">
                      <p className="text-white/80 text-sm mb-4">{project.description}</p>
                      <span className="inline-flex items-center gap-2 text-white font-medium">
                        View Project
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                    {project.category}
                  </span>
                  {project.year && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">{project.year}</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {project.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

PortfolioGrid.displayName = 'PortfolioGrid'

PortfolioGrid.config = {
  id: 'portfolio-grid',
  name: 'Portfolio Grid',
  category: 'portfolio',
  description: 'Filterable project grid with hover effects',
  defaultProps: {
    columns: 3,
    showFilter: true,
    showTags: true,
    layout: 'grid',
    hoverEffect: 'overlay',
  },
  editableFields: [
    { name: 'projects', label: 'Projects', type: 'array' },
    { name: 'columns', label: 'Columns', type: 'select', options: [2, 3, 4] },
    { name: 'showFilter', label: 'Show Filter', type: 'boolean' },
    { name: 'showTags', label: 'Show Tags', type: 'boolean' },
    { name: 'hoverEffect', label: 'Hover Effect', type: 'select', options: ['zoom', 'overlay', 'slide'] },
  ],
}
