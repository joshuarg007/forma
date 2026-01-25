'use client'

import { cn } from '@/lib/utils'

interface CaseStudyProps {
  id?: string
  className?: string
  title?: string
  client?: string
  year?: string
  duration?: string
  role?: string
  heroImage?: string
  overview?: string
  challenge?: string
  solution?: string
  results?: Array<{ metric: string; value: string; description?: string }>
  gallery?: string[]
  testimonial?: {
    quote: string
    author: string
    role: string
    avatar?: string
  }
  nextProject?: {
    title: string
    image: string
    link?: string
  }
}

export default function CaseStudy({
  id,
  className,
  title = 'E-Commerce Platform Redesign',
  client = 'TechStart Inc.',
  year = '2024',
  duration = '3 months',
  role = 'Lead Designer & Developer',
  heroImage = 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=1200',
  overview = 'A complete redesign of the e-commerce platform to improve user experience and increase conversion rates. The project involved user research, wireframing, prototyping, and implementation.',
  challenge = 'The existing platform had a 68% cart abandonment rate and poor mobile experience. Users found the checkout process confusing and the product discovery lacking.',
  solution = 'We implemented a streamlined checkout flow, improved product search with AI recommendations, and rebuilt the entire frontend with a mobile-first approach using Next.js and Tailwind CSS.',
  results = [
    { metric: 'Conversion Rate', value: '+47%', description: 'Increase in checkout completion' },
    { metric: 'Mobile Traffic', value: '+82%', description: 'Growth in mobile users' },
    { metric: 'Load Time', value: '-65%', description: 'Reduction in page load time' },
    { metric: 'Revenue', value: '+$2.4M', description: 'Additional annual revenue' },
  ],
  gallery = [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
  ],
  testimonial = {
    quote: 'The redesign exceeded our expectations. The new platform has transformed our business and our customers love the improved experience.',
    author: 'Sarah Johnson',
    role: 'CEO, TechStart Inc.',
  },
  nextProject = {
    title: 'Finance Dashboard',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
  },
}: CaseStudyProps) {
  return (
    <article id={id} className={cn('py-12', className)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
            <span>{client}</span>
            <span>·</span>
            <span>{year}</span>
            <span>·</span>
            <span>{duration}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {role}
          </p>
        </header>

        {/* Hero Image */}
        <div className="mb-16 rounded-2xl overflow-hidden">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-[500px] object-cover"
          />
        </div>

        {/* Overview */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {overview}
          </p>
        </section>

        {/* Challenge & Solution */}
        <section className="mb-16 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Challenge</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {challenge}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Solution</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {solution}
            </p>
          </div>
        </section>

        {/* Results */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Results</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800"
              >
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {result.value}
                </div>
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {result.metric}
                </div>
                {result.description && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {result.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Gallery */}
        {gallery && gallery.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Gallery</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {gallery.map((image, index) => (
                <div key={index} className="rounded-xl overflow-hidden">
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-64 object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonial */}
        {testimonial && (
          <section className="mb-16">
            <div className="bg-indigo-600 rounded-2xl p-8 md:p-12">
              <svg className="w-12 h-12 text-indigo-400 mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <blockquote className="text-xl md:text-2xl text-white font-medium mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-indigo-200">{testimonial.role}</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Next Project */}
        {nextProject && (
          <section>
            <a
              href="#"
              className="group block bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition"
            >
              <div className="md:flex">
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Next Project</span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-4">
                    {nextProject.title}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                    View Case Study
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
                <div className="md:w-1/2">
                  <img
                    src={nextProject.image}
                    alt={nextProject.title}
                    className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              </div>
            </a>
          </section>
        )}
      </div>
    </article>
  )
}

CaseStudy.displayName = 'CaseStudy'

CaseStudy.config = {
  id: 'case-study',
  name: 'Case Study',
  category: 'portfolio',
  description: 'Detailed project case study layout',
  defaultProps: {},
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'client', label: 'Client', type: 'text' },
    { name: 'year', label: 'Year', type: 'text' },
    { name: 'duration', label: 'Duration', type: 'text' },
    { name: 'role', label: 'Role', type: 'text' },
    { name: 'heroImage', label: 'Hero Image', type: 'image' },
    { name: 'overview', label: 'Overview', type: 'textarea' },
    { name: 'challenge', label: 'Challenge', type: 'textarea' },
    { name: 'solution', label: 'Solution', type: 'textarea' },
    { name: 'results', label: 'Results', type: 'array' },
    { name: 'gallery', label: 'Gallery', type: 'array' },
    { name: 'testimonial', label: 'Testimonial', type: 'object' },
    { name: 'nextProject', label: 'Next Project', type: 'object' },
  ],
}
