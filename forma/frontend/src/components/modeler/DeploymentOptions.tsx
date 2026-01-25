'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Server,
  Cloud,
  Container,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import type { SchemaDefinition } from '@/types/schema'
import { useToast } from '@/components/ui/Toast'

interface DeploymentOptionsProps {
  isOpen: boolean
  onClose: () => void
  schema: SchemaDefinition | null
  projectId?: string
}

type Provider = 'render' | 'railway' | 'docker'

interface ProviderInfo {
  id: Provider
  name: string
  description: string
  icon: React.ReactNode
  color: string
  docsUrl: string
}

const providers: ProviderInfo[] = [
  {
    id: 'render',
    name: 'Render',
    description: 'Free tier available. Easy deploys from Git.',
    icon: <Cloud className="w-6 h-6" />,
    color: 'from-emerald-500 to-teal-600',
    docsUrl: 'https://render.com/docs/deploy-fastapi',
  },
  {
    id: 'railway',
    name: 'Railway',
    description: 'Simple deploys with generous free tier.',
    icon: <Server className="w-6 h-6" />,
    color: 'from-purple-500 to-indigo-600',
    docsUrl: 'https://docs.railway.app/',
  },
  {
    id: 'docker',
    name: 'Docker',
    description: 'Self-host anywhere with containers.',
    icon: <Container className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-600',
    docsUrl: 'https://docs.docker.com/',
  },
]

export function DeploymentOptions({ isOpen, onClose, schema, projectId }: DeploymentOptionsProps) {
  const toast = useToast()
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const projectName = schema?.name || 'my-app'

  // Generate Render blueprint (render.yaml)
  const renderYaml = `# render.yaml - Render Blueprint
# Put this file in your repository root

services:
  - type: web
    name: ${projectName}-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: ${projectName}-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: ENVIRONMENT
        value: production

databases:
  - name: ${projectName}-db
    databaseName: ${projectName.replace(/-/g, '_')}
    plan: free
`

  // Generate Railway config (railway.json)
  const railwayJson = `{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
`

  // Generate Dockerfile
  const dockerfile = `# Dockerfile for ${projectName}
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`

  // Generate docker-compose.yml
  const dockerCompose = `# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/${projectName.replace(/-/g, '_')}
      - SECRET_KEY=\${SECRET_KEY:-change-me-in-production}
      - ENVIRONMENT=production
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=${projectName.replace(/-/g, '_')}
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres

volumes:
  postgres_data:
`

  const getConfigContent = () => {
    switch (selectedProvider) {
      case 'render':
        return {
          filename: 'render.yaml',
          content: renderYaml,
          steps: [
            'Create a new account at render.com',
            'Fork or push your project to GitHub',
            'Add the render.yaml file to your repository',
            'Connect your GitHub repo to Render',
            'Render will auto-deploy from your blueprint',
          ],
        }
      case 'railway':
        return {
          filename: 'railway.json',
          content: railwayJson,
          steps: [
            'Create an account at railway.app',
            'Install Railway CLI: npm i -g @railway/cli',
            'Run: railway login',
            'Run: railway init',
            'Add a PostgreSQL database: railway add',
            'Deploy: railway up',
          ],
        }
      case 'docker':
        return {
          filename: 'Dockerfile',
          content: dockerfile,
          secondaryFilename: 'docker-compose.yml',
          secondaryContent: dockerCompose,
          steps: [
            'Install Docker on your server',
            'Copy your project files to the server',
            'Run: docker-compose up -d',
            'Access your API at http://your-server:8000',
            'Set up a reverse proxy (nginx) for HTTPS',
          ],
        }
      default:
        return null
    }
  }

  const config = getConfigContent()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[85vh] overflow-hidden"
          >
            <div className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Deploy Your Backend</h2>
                    <p className="text-sm text-zinc-400">Choose a hosting provider</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {!selectedProvider ? (
                  /* Provider Selection */
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-400 mb-4">
                      Select a hosting provider to get deployment instructions and configuration files.
                    </p>

                    {providers.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => setSelectedProvider(provider.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-700 hover:border-violet-500/50 bg-zinc-800/50 hover:bg-zinc-800 transition-all text-left group"
                      >
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${provider.color} text-white`}>
                          {provider.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white group-hover:text-violet-400 transition-colors">
                            {provider.name}
                          </h3>
                          <p className="text-sm text-zinc-500">{provider.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Provider Details */
                  <div className="space-y-6">
                    <button
                      onClick={() => setSelectedProvider(null)}
                      className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Back to providers
                    </button>

                    {config && (
                      <>
                        {/* Steps */}
                        <div>
                          <h3 className="text-sm font-medium text-white mb-3">Deployment Steps</h3>
                          <ol className="space-y-2">
                            {config.steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">
                                  {i + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Primary Config File */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-white">{config.filename}</h3>
                            <button
                              onClick={() => copyToClipboard(config.content, 'primary')}
                              className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                            >
                              {copiedField === 'primary' ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              Copy
                            </button>
                          </div>
                          <pre className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300 overflow-x-auto">
                            <code>{config.content}</code>
                          </pre>
                        </div>

                        {/* Secondary Config File (for Docker) */}
                        {config.secondaryFilename && config.secondaryContent && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-white">{config.secondaryFilename}</h3>
                              <button
                                onClick={() => copyToClipboard(config.secondaryContent!, 'secondary')}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                              >
                                {copiedField === 'secondary' ? (
                                  <Check className="w-3 h-3 text-green-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                Copy
                              </button>
                            </div>
                            <pre className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300 overflow-x-auto">
                              <code>{config.secondaryContent}</code>
                            </pre>
                          </div>
                        )}

                        {/* Docs Link */}
                        <a
                          href={providers.find(p => p.id === selectedProvider)?.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View full documentation
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-zinc-700 bg-zinc-800/50">
                <p className="text-xs text-zinc-500 text-center">
                  Need help? Check our deployment guide or contact support.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
