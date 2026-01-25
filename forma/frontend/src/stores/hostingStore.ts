import { create } from 'zustand'
import { api, HostingConfig, Deployment, CustomDomain, BuildLogEntry } from '@/lib/api'

interface HostingState {
  // Config
  hostingConfig: HostingConfig | null
  loading: boolean
  error: string | null

  // Deployments
  deployments: Deployment[]
  currentDeployment: Deployment | null
  deploying: boolean
  deployError: string | null

  // Build logs (for real-time display)
  buildLogs: BuildLogEntry[]
  logsLoading: boolean

  // Custom domains
  customDomains: CustomDomain[]
  domainsLoading: boolean

  // Subdomain check
  subdomainAvailable: boolean | null
  subdomainSuggested: string | null
  checkingSubdomain: boolean

  // Actions - Hosting Config
  fetchHostingConfig: (projectId: string) => Promise<void>
  setupHosting: (projectId: string, subdomain: string) => Promise<HostingConfig>
  updateHostingConfig: (projectId: string, config: Partial<HostingConfig>) => Promise<void>
  disableHosting: (projectId: string) => Promise<void>

  // Actions - Deployments
  deploy: (projectId: string, commitMessage?: string, isPreview?: boolean) => Promise<Deployment>
  fetchDeployments: (projectId: string) => Promise<void>
  fetchDeployment: (projectId: string, deploymentId: string) => Promise<void>
  rollback: (projectId: string, deploymentId: string) => Promise<Deployment>

  // Actions - Build Logs
  fetchBuildLogs: (projectId: string, deploymentId: string) => Promise<void>
  clearBuildLogs: () => void

  // Actions - Custom Domains
  fetchCustomDomains: (projectId: string) => Promise<void>
  addCustomDomain: (projectId: string, domain: string) => Promise<CustomDomain>
  verifyDomain: (projectId: string, domainId: string) => Promise<void>
  removeCustomDomain: (projectId: string, domainId: string) => Promise<void>
  setPrimaryDomain: (projectId: string, domainId: string) => Promise<void>

  // Actions - Subdomain
  checkSubdomain: (subdomain: string) => Promise<void>
  clearSubdomainCheck: () => void

  // Actions - Reset
  reset: () => void
}

const initialState = {
  hostingConfig: null,
  loading: false,
  error: null,
  deployments: [],
  currentDeployment: null,
  deploying: false,
  deployError: null,
  buildLogs: [],
  logsLoading: false,
  customDomains: [],
  domainsLoading: false,
  subdomainAvailable: null,
  subdomainSuggested: null,
  checkingSubdomain: false,
}

export const useHostingStore = create<HostingState>((set, get) => ({
  ...initialState,

  // ==========================================================================
  // HOSTING CONFIG
  // ==========================================================================

  fetchHostingConfig: async (projectId: string) => {
    set({ loading: true, error: null })
    try {
      const config = await api.getHostingConfig(projectId)
      set({
        hostingConfig: config,
        currentDeployment: config.current_deployment,
        customDomains: config.custom_domains || [],
        loading: false,
      })
    } catch (error: any) {
      // 404 means hosting not configured yet
      if (error.message?.includes('404') || error.message?.includes('not configured')) {
        set({ hostingConfig: null, loading: false })
      } else {
        set({ error: error.message, loading: false })
      }
    }
  },

  setupHosting: async (projectId: string, subdomain: string) => {
    set({ loading: true, error: null })
    try {
      const config = await api.setupHosting(projectId, subdomain)
      set({ hostingConfig: config, loading: false })
      return config
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  updateHostingConfig: async (projectId: string, config: Partial<HostingConfig>) => {
    set({ loading: true, error: null })
    try {
      const updated = await api.updateHostingConfig(projectId, config)
      set({ hostingConfig: updated, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  disableHosting: async (projectId: string) => {
    set({ loading: true, error: null })
    try {
      await api.disableHosting(projectId)
      set({ hostingConfig: null, deployments: [], customDomains: [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // ==========================================================================
  // DEPLOYMENTS
  // ==========================================================================

  deploy: async (projectId: string, commitMessage?: string, isPreview = false) => {
    set({ deploying: true, deployError: null, buildLogs: [] })
    try {
      const deployment = await api.deploy(projectId, commitMessage, isPreview)
      set((state) => ({
        deployments: [deployment, ...state.deployments],
        currentDeployment: deployment,
        deploying: false,
      }))
      return deployment
    } catch (error: any) {
      set({ deployError: error.message, deploying: false })
      throw error
    }
  },

  fetchDeployments: async (projectId: string) => {
    set({ loading: true })
    try {
      const data = await api.getDeployments(projectId)
      set({ deployments: data.deployments, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchDeployment: async (projectId: string, deploymentId: string) => {
    try {
      const deployment = await api.getDeployment(projectId, deploymentId)
      set({ currentDeployment: deployment })

      // Update in list if exists
      set((state) => ({
        deployments: state.deployments.map((d) =>
          d.id === deploymentId ? deployment : d
        ),
      }))
    } catch (error: any) {
      console.error('Failed to fetch deployment:', error)
    }
  },

  rollback: async (projectId: string, deploymentId: string) => {
    set({ deploying: true, deployError: null })
    try {
      const deployment = await api.rollbackDeployment(projectId, deploymentId)
      set((state) => ({
        deployments: [deployment, ...state.deployments],
        currentDeployment: deployment,
        deploying: false,
      }))
      return deployment
    } catch (error: any) {
      set({ deployError: error.message, deploying: false })
      throw error
    }
  },

  // ==========================================================================
  // BUILD LOGS
  // ==========================================================================

  fetchBuildLogs: async (projectId: string, deploymentId: string) => {
    set({ logsLoading: true })
    try {
      const data = await api.getDeploymentLogs(projectId, deploymentId)
      set({ buildLogs: data.logs, logsLoading: false })
    } catch (error: any) {
      set({ logsLoading: false })
      console.error('Failed to fetch build logs:', error)
    }
  },

  clearBuildLogs: () => {
    set({ buildLogs: [] })
  },

  // ==========================================================================
  // CUSTOM DOMAINS
  // ==========================================================================

  fetchCustomDomains: async (projectId: string) => {
    set({ domainsLoading: true })
    try {
      const data = await api.getCustomDomains(projectId)
      set({ customDomains: data.domains, domainsLoading: false })
    } catch (error: any) {
      set({ domainsLoading: false })
      console.error('Failed to fetch domains:', error)
    }
  },

  addCustomDomain: async (projectId: string, domain: string) => {
    set({ domainsLoading: true })
    try {
      const newDomain = await api.addCustomDomain(projectId, domain)
      set((state) => ({
        customDomains: [...state.customDomains, newDomain],
        domainsLoading: false,
      }))
      return newDomain
    } catch (error: any) {
      set({ domainsLoading: false })
      throw error
    }
  },

  verifyDomain: async (projectId: string, domainId: string) => {
    try {
      const updated = await api.verifyDomain(projectId, domainId)
      set((state) => ({
        customDomains: state.customDomains.map((d) =>
          d.id === domainId ? updated : d
        ),
      }))
    } catch (error: any) {
      console.error('Failed to verify domain:', error)
      throw error
    }
  },

  removeCustomDomain: async (projectId: string, domainId: string) => {
    try {
      await api.removeCustomDomain(projectId, domainId)
      set((state) => ({
        customDomains: state.customDomains.filter((d) => d.id !== domainId),
      }))
    } catch (error: any) {
      console.error('Failed to remove domain:', error)
      throw error
    }
  },

  setPrimaryDomain: async (projectId: string, domainId: string) => {
    try {
      const updated = await api.setPrimaryDomain(projectId, domainId)
      set((state) => ({
        customDomains: state.customDomains.map((d) => ({
          ...d,
          is_primary: d.id === domainId,
        })),
      }))
    } catch (error: any) {
      console.error('Failed to set primary domain:', error)
      throw error
    }
  },

  // ==========================================================================
  // SUBDOMAIN CHECK
  // ==========================================================================

  checkSubdomain: async (subdomain: string) => {
    set({ checkingSubdomain: true, subdomainAvailable: null, subdomainSuggested: null })
    try {
      const result = await api.checkSubdomain(subdomain)
      set({
        subdomainAvailable: result.available,
        subdomainSuggested: result.suggested || null,
        checkingSubdomain: false,
      })
    } catch (error: any) {
      set({ checkingSubdomain: false })
      console.error('Failed to check subdomain:', error)
    }
  },

  clearSubdomainCheck: () => {
    set({ subdomainAvailable: null, subdomainSuggested: null })
  },

  // ==========================================================================
  // RESET
  // ==========================================================================

  reset: () => {
    set(initialState)
  },
}))
