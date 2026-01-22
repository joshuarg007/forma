'use client'

import { cn } from '@/lib/utils'

interface Skill {
  name: string
  level: number // 0-100
  category?: string
  color?: string
}

interface SkillsChartProps {
  id?: string
  className?: string
  title?: string
  skills?: Skill[]
  layout?: 'bars' | 'grid' | 'tags' | 'radar'
  showPercentage?: boolean
  animated?: boolean
  groupByCategory?: boolean
}

const defaultSkills: Skill[] = [
  { name: 'React', level: 95, category: 'Frontend', color: '#61dafb' },
  { name: 'TypeScript', level: 90, category: 'Frontend', color: '#3178c6' },
  { name: 'Next.js', level: 92, category: 'Frontend', color: '#000000' },
  { name: 'Node.js', level: 85, category: 'Backend', color: '#339933' },
  { name: 'Python', level: 80, category: 'Backend', color: '#3776ab' },
  { name: 'PostgreSQL', level: 78, category: 'Database', color: '#336791' },
  { name: 'GraphQL', level: 82, category: 'Backend', color: '#e535ab' },
  { name: 'AWS', level: 75, category: 'DevOps', color: '#ff9900' },
  { name: 'Docker', level: 80, category: 'DevOps', color: '#2496ed' },
  { name: 'Figma', level: 88, category: 'Design', color: '#f24e1e' },
]

export default function SkillsChart({
  id,
  className,
  title = 'Skills & Expertise',
  skills = defaultSkills,
  layout = 'bars',
  showPercentage = true,
  animated = true,
  groupByCategory = false,
}: SkillsChartProps) {
  const categories = groupByCategory
    ? Array.from(new Set(skills.map((s) => s.category).filter(Boolean)))
    : []

  const getSkillColor = (skill: Skill) => {
    return skill.color || '#6366f1'
  }

  if (layout === 'tags') {
    return (
      <div id={id} className={cn('py-12', className)}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">{title}</h2>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            {skills.map((skill) => (
              <span
                key={skill.name}
                className="px-4 py-2 rounded-full text-sm font-medium transition hover:scale-105"
                style={{
                  backgroundColor: `${getSkillColor(skill)}20`,
                  color: getSkillColor(skill),
                  borderWidth: 1,
                  borderColor: `${getSkillColor(skill)}40`,
                }}
              >
                {skill.name}
                {showPercentage && (
                  <span className="ml-1.5 opacity-70">{skill.level}%</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (layout === 'grid') {
    return (
      <div id={id} className={cn('py-12', className)}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">{title}</h2>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="relative p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-center group hover:shadow-lg transition"
              >
                <div
                  className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl font-bold"
                  style={{
                    backgroundColor: `${getSkillColor(skill)}20`,
                    color: getSkillColor(skill),
                  }}
                >
                  {skill.name.charAt(0)}
                </div>
                <div className="font-medium text-gray-900 dark:text-white">{skill.name}</div>
                {showPercentage && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{skill.level}%</div>
                )}
                {/* Progress circle on hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-t"
                  style={{
                    background: `linear-gradient(to top, ${getSkillColor(skill)}10, transparent)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default bars layout
  const renderSkillBar = (skill: Skill) => (
    <div key={skill.name} className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
        {showPercentage && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{skill.level}%</span>
        )}
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full',
            animated && 'transition-all duration-1000 ease-out'
          )}
          style={{
            width: `${skill.level}%`,
            backgroundColor: getSkillColor(skill),
          }}
        />
      </div>
    </div>
  )

  return (
    <div id={id} className={cn('py-12', className)}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">{title}</h2>
        )}

        {groupByCategory && categories.length > 0 ? (
          <div className="space-y-10">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  {category}
                </h3>
                <div className="space-y-4">
                  {skills
                    .filter((s) => s.category === category)
                    .map(renderSkillBar)}
                </div>
              </div>
            ))}
            {/* Skills without category */}
            {skills.some((s) => !s.category) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Other
                </h3>
                <div className="space-y-4">
                  {skills
                    .filter((s) => !s.category)
                    .map(renderSkillBar)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map(renderSkillBar)}
          </div>
        )}
      </div>
    </div>
  )
}

SkillsChart.displayName = 'SkillsChart'

SkillsChart.config = {
  id: 'skills-chart',
  name: 'Skills Chart',
  category: 'portfolio',
  description: 'Skills visualization with progress bars or grid',
  defaultProps: {
    layout: 'bars',
    showPercentage: true,
    animated: true,
    groupByCategory: false,
  },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'skills', label: 'Skills', type: 'array' },
    { name: 'layout', label: 'Layout', type: 'select', options: ['bars', 'grid', 'tags', 'radar'] },
    { name: 'showPercentage', label: 'Show Percentage', type: 'boolean' },
    { name: 'animated', label: 'Animated', type: 'boolean' },
    { name: 'groupByCategory', label: 'Group by Category', type: 'boolean' },
  ],
}
