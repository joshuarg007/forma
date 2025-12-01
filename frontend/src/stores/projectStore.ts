import { create } from 'zustand'
import { api } from '@/lib/api'
import type { Project, Component, UsageStats } from '@/types'

interface ProjectState {
  // Projects
  projects: Project[]
  currentProject: Project | null
  loadingProjects: boolean

  // Components
  components: Component[]
  selectedComponent: Component | null
  loadingComponents: boolean

  // AI
  generating: boolean
  generationError: string | null
  usage: UsageStats | null

  // Actions - Projects
  fetchProjects: () => Promise<void>
  createProject: (name: string, description?: string) => Promise<Project>
  selectProject: (id: string) => Promise<void>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  // Actions - Components
  fetchComponents: (projectId: string) => Promise<void>
  selectComponent: (component: Component | null) => void
  createComponent: (data: Partial<Component>) => Promise<Component>
  updateComponent: (id: string, data: Partial<Component>) => Promise<void>
  deleteComponent: (id: string) => Promise<void>

  // Actions - AI
  generateComponent: (intent: string) => Promise<void>
  editComponent: (componentId: string, editIntent: string) => Promise<void>
  fetchUsage: () => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  currentProject: null,
  loadingProjects: false,
  components: [],
  selectedComponent: null,
  loadingComponents: false,
  generating: false,
  generationError: null,
  usage: null,

  // Projects
  fetchProjects: async () => {
    set({ loadingProjects: true })
    try {
      const data = await api.getProjects()
      set({ projects: data.projects, loadingProjects: false })
    } catch (error) {
      set({ loadingProjects: false })
      throw error
    }
  },

  createProject: async (name, description) => {
    const project = await api.createProject(name, description)
    set((state) => ({ projects: [...state.projects, project] }))
    return project
  },

  selectProject: async (id) => {
    const project = await api.getProject(id)
    set({ currentProject: project })
    await get().fetchComponents(id)
  },

  updateProject: async (id, data) => {
    const updated = await api.updateProject(id, data)
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? updated : p)),
      currentProject: state.currentProject?.id === id ? updated : state.currentProject,
    }))
  },

  deleteProject: async (id) => {
    await api.deleteProject(id)
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }))
  },

  // Components
  fetchComponents: async (projectId) => {
    set({ loadingComponents: true })
    try {
      const components = await api.getComponents(projectId)
      set({ components, loadingComponents: false })
    } catch (error) {
      set({ loadingComponents: false })
      throw error
    }
  },

  selectComponent: (component) => {
    set({ selectedComponent: component })
  },

  createComponent: async (data) => {
    const { currentProject } = get()
    if (!currentProject) throw new Error('No project selected')

    const component = await api.createComponent(currentProject.id, data)
    set((state) => ({ components: [...state.components, component] }))
    return component
  },

  updateComponent: async (id, data) => {
    const { currentProject } = get()
    if (!currentProject) throw new Error('No project selected')

    const updated = await api.updateComponent(currentProject.id, id, data)
    set((state) => ({
      components: state.components.map((c) => (c.id === id ? updated : c)),
      selectedComponent: state.selectedComponent?.id === id ? updated : state.selectedComponent,
    }))
  },

  deleteComponent: async (id) => {
    const { currentProject } = get()
    if (!currentProject) throw new Error('No project selected')

    await api.deleteComponent(currentProject.id, id)
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
      selectedComponent: state.selectedComponent?.id === id ? null : state.selectedComponent,
    }))
  },

  // AI
  generateComponent: async (intent) => {
    const { currentProject } = get()
    if (!currentProject) throw new Error('No project selected')

    set({ generating: true, generationError: null })

    try {
      const response = await api.generateComponent(
        intent,
        currentProject.id,
        currentProject.design_system
      )

      if (!response.success || !response.result) {
        throw new Error(response.error || 'Generation failed')
      }

      // Component is auto-saved by backend, refresh list
      const prevComponentCount = get().components.length
      await get().fetchComponents(currentProject.id)

      // Select the newest component (last added)
      const { components } = get()
      if (components.length > prevComponentCount) {
        // Select the most recently created component
        const sortedComponents = [...components].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        set({ selectedComponent: sortedComponents[0] })
      } else {
        // Fallback: find by name
        const newComponent = components.find((c) => c.name === response.result!.name)
        if (newComponent) {
          set({ selectedComponent: newComponent })
        }
      }

      set({ generating: false })
    } catch (error) {
      set({ generating: false, generationError: (error as Error).message })
      throw error
    }
  },

  editComponent: async (componentId, editIntent) => {
    const { currentProject } = get()
    if (!currentProject) throw new Error('No project selected')

    set({ generating: true, generationError: null })

    try {
      const response = await api.editComponent(componentId, editIntent, currentProject.id)

      if (!response.success || !response.result) {
        throw new Error(response.error || 'Edit failed')
      }

      // Refresh components
      await get().fetchComponents(currentProject.id)

      set({ generating: false })
    } catch (error) {
      set({ generating: false, generationError: (error as Error).message })
      throw error
    }
  },

  fetchUsage: async () => {
    try {
      const usage = await api.getUsage()
      set({ usage })
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    }
  },
}))
