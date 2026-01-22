'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PortfolioProps {
  id?: string
  className?: string
  // Personal Info
  name?: string
  title?: string
  bio?: string
  avatar?: string
  email?: string
  location?: string
  // Social Links
  socials?: Array<{
    platform: 'github' | 'linkedin' | 'twitter' | 'dribbble' | 'behance' | 'website'
    url: string
  }>
  // Projects
  projects?: Array<{
    title: string
    description: string
    image: string
    tags: string[]
    link?: string
    github?: string
  }>
  // Skills
  skills?: Array<{
    category: string
    items: string[]
  }>
  // Experience
  experience?: Array<{
    company: string
    role: string
    period: string
    description?: string
    logo?: string
  }>
}

const defaultProjects = [
  {
    title: 'E-commerce Platform',
    description: 'A full-stack e-commerce solution with React, Node.js, and Stripe integration.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    link: '#',
    github: '#',
  },
  {
    title: 'AI Dashboard',
    description: 'Real-time analytics dashboard with machine learning insights and predictions.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    tags: ['Python', 'TensorFlow', 'React', 'D3.js'],
    link: '#',
  },
  {
    title: 'Mobile Banking App',
    description: 'Secure mobile banking application with biometric authentication.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
    tags: ['React Native', 'TypeScript', 'Firebase'],
    link: '#',
  },
  {
    title: 'Design System',
    description: 'Comprehensive design system with 100+ components and documentation.',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
    tags: ['Figma', 'Storybook', 'React', 'Tailwind'],
    link: '#',
    github: '#',
  },
]

const defaultSkills = [
  { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'] },
  { category: 'Backend', items: ['Node.js', 'Python', 'PostgreSQL', 'GraphQL', 'REST APIs'] },
  { category: 'Tools', items: ['Git', 'Docker', 'AWS', 'Figma', 'VS Code'] },
]

const defaultExperience = [
  {
    company: 'TechCorp',
    role: 'Senior Full-Stack Developer',
    period: '2022 - Present',
    description: 'Leading development of microservices architecture and mentoring junior developers.',
  },
  {
    company: 'StartupXYZ',
    role: 'Full-Stack Developer',
    period: '2020 - 2022',
    description: 'Built and scaled the core product from 0 to 100k users.',
  },
  {
    company: 'AgencyPro',
    role: 'Frontend Developer',
    period: '2018 - 2020',
    description: 'Developed responsive web applications for Fortune 500 clients.',
  },
]

const defaultSocials = [
  { platform: 'github' as const, url: '#' },
  { platform: 'linkedin' as const, url: '#' },
  { platform: 'twitter' as const, url: '#' },
  { platform: 'dribbble' as const, url: '#' },
]

const socialIcons = {
  github: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  dribbble: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.424 25.424 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" />
    </svg>
  ),
  behance: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
    </svg>
  ),
  website: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
}

export default function Portfolio({
  id,
  className,
  name = 'Alex Johnson',
  title = 'Full-Stack Developer & Designer',
  bio = "I'm a passionate developer with 5+ years of experience building web applications. I love creating beautiful, performant, and accessible digital experiences.",
  avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  email = 'hello@alexjohnson.dev',
  location = 'San Francisco, CA',
  socials = defaultSocials,
  projects = defaultProjects,
  skills = defaultSkills,
  experience = defaultExperience,
}: PortfolioProps) {
  const [filter, setFilter] = useState<string | null>(null)

  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags)))
  const filteredProjects = filter
    ? projects.filter((p) => p.tags.includes(filter))
    : projects

  return (
    <div id={id} className={cn('min-h-screen bg-gray-50 dark:bg-gray-950', className)}>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src={avatar}
            alt={name}
            className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/20 object-cover"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{name}</h1>
          <p className="text-xl text-gray-300 mb-6">{title}</p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">{bio}</p>
          <div className="flex items-center justify-center gap-4 mb-8">
            {socials.map((social, index) => (
              <a
                key={index}
                href={social.url}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                {socialIcons[social.platform]}
              </a>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
            <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-white transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {email}
            </a>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Skills & Technologies
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {skills.map((skillGroup, index) => (
              <div key={index} className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {skillGroup.category}
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {skillGroup.items.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Featured Projects
          </h2>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setFilter(null)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition',
                filter === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              )}
            >
              All
            </button>
            {allTags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition',
                  filter === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {filteredProjects.map((project, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                    {project.link && (
                      <a
                        href={project.link}
                        className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition"
                      >
                        {socialIcons.github}
                      </a>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Experience
          </h2>
          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div
                key={index}
                className="relative pl-8 border-l-2 border-indigo-200 dark:border-indigo-800"
              >
                <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-indigo-600" />
                <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                  {exp.period}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {exp.role}
                </h3>
                <div className="text-gray-600 dark:text-gray-400 mb-2">
                  {exp.company}
                </div>
                {exp.description && (
                  <p className="text-gray-500 dark:text-gray-500">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Let&apos;s work together
          </h2>
          <p className="text-indigo-100 mb-8">
            I&apos;m always open to discussing new projects and opportunities.
          </p>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-indigo-600 rounded-xl font-semibold transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Get in Touch
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} {name}. Built with Forma.
        </p>
      </footer>
    </div>
  )
}

Portfolio.displayName = 'Portfolio'

Portfolio.config = {
  id: 'portfolio-template',
  name: 'Portfolio',
  category: 'templates',
  description: 'Developer/designer portfolio with projects, skills, and experience',
  defaultProps: {
    name: 'Alex Johnson',
    title: 'Full-Stack Developer & Designer',
  },
  editableFields: [
    { name: 'name', label: 'Your Name', type: 'text' },
    { name: 'title', label: 'Your Title', type: 'text' },
    { name: 'bio', label: 'Bio', type: 'textarea' },
    { name: 'avatar', label: 'Avatar URL', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'socials', label: 'Social Links', type: 'array' },
    { name: 'projects', label: 'Projects', type: 'array' },
    { name: 'skills', label: 'Skills', type: 'array' },
    { name: 'experience', label: 'Experience', type: 'array' },
  ],
}
