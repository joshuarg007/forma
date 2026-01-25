import { create } from 'zustand'
import { api } from '@/lib/api'
import type { Project, Component, UsageStats, Page, PageCreate, PageUpdate, CanvasComponent } from '@/types'

interface ProjectState {
  // Projects
  projects: Project[]
  currentProject: Project | null
  loadingProjects: boolean

  // Pages
  pages: Page[]
  currentPage: Page | null
  loadingPages: boolean

  // Components
  components: Component[]
  selectedComponent: Component | null
  loadingComponents: boolean

  // AI - Disabled (using TensorFlow.js locally)
  // These are kept for backward compatibility but always return disabled state
  generating: boolean
  generationError: string | null
  usage: UsageStats | null

  // Actions - Projects
  fetchProjects: () => Promise<void>
  createProject: (name: string, description?: string) => Promise<Project>
  selectProject: (id: string) => Promise<void>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  // Actions - Pages
  fetchPages: (projectId: string) => Promise<void>
  createPage: (data: PageCreate) => Promise<Page>
  selectPage: (pageId: string) => Promise<void>
  selectPageBySlug: (slug: string) => Promise<void>
  updatePage: (pageId: string, data: PageUpdate) => Promise<void>
  deletePage: (pageId: string) => Promise<void>
  duplicatePage: (pageId: string) => Promise<Page>
  reorderPages: (pages: { id: string; position: number }[]) => Promise<void>
  saveCanvasState: (canvasComponents: CanvasComponent[]) => Promise<void>

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
  pages: [],
  currentPage: null,
  loadingPages: false,
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
    // Fetch pages and select the homepage or first page
    await get().fetchPages(id)
    const { pages } = get()
    if (pages.length > 0) {
      const homepage = pages.find(p => p.is_homepage) || pages[0]
      await get().selectPage(homepage.id)
    }
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

  // Pages
  fetchPages: async (projectId) => {
    set({ loadingPages: true })
    try {
      const data = await api.getPages(projectId)
      set({ pages: data.pages, loadingPages: false })
    } catch (error) {
      set({ loadingPages: false })
      throw error
    }
  },

  createPage: async (data) => {
    const { currentProject } = get()
    if (!currentProject) throw new Error('No project selected')

    const page = await api.createPage(currentProject.id, data)
    set((state) => ({ pages: [...state.pages, page] }))
    return page
  },

  selectPage: async (pageId) => {
    const { currentProject } = get()
    if (!currentProject) throw new Error('No project selected')

    const page = await api.getPage(currentProject.id, pageId)
    set({ currentPage: page })
  },

  selectPageBySlug: async (slug) => {
    const { currentProject } = get()
    if (!currentProject) throw new Error('No project selected')

    const page = await api.getPageBySlug(currentProject.id, slug)
    set({ currentPage: page })
  },

  updatePage: async (pageId, data) => {
    const { currentProject } = get()
    if (!currentProject) throw new Error('No project selected')

    const updated = await api.updatePage(currentProject.id, pageId, data)
    set((state) => ({
      pages: state.pages.map((p) => (p.id === pageId ? updated : p)),
      currentPage: state.currentPage?.id === pageId ? updated : state.currentPage,
    }))
  },

  deletePage: async (pageId) => {
    const { currentProject, pages } = get()
    if (!currentProject) throw new Error('No project selected')
    if (pages.length <= 1) throw new Error('Cannot delete the last page')

    await api.deletePage(currentProject.id, pageId)
    const remainingPages = pages.filter((p) => p.id !== pageId)
    set({
      pages: remainingPages,
      currentPage: get().currentPage?.id === pageId ? remainingPages[0] : get().currentPage,
    })
  },

  duplicatePage: async (pageId) => {
    const { currentProject } = get()
    if (!currentProject) throw new Error('No project selected')

    const newPage = await api.duplicatePage(currentProject.id, pageId)
    set((state) => ({ pages: [...state.pages, newPage] }))
    return newPage
  },

  reorderPages: async (pageOrder) => {
    const { currentProject } = get()
    if (!currentProject) throw new Error('No project selected')

    await api.reorderPages(currentProject.id, pageOrder)
    // Refetch to get updated positions
    await get().fetchPages(currentProject.id)
  },

  saveCanvasState: async (canvasComponents) => {
    const { currentProject, currentPage } = get()
    if (!currentProject || !currentPage) throw new Error('No page selected')

    const updated = await api.updatePage(currentProject.id, currentPage.id, {
      canvas_components: canvasComponents,
    })
    set((state) => ({
      currentPage: updated,
      pages: state.pages.map((p) => (p.id === currentPage.id ? updated : p)),
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

  // AI - Disabled (using TensorFlow.js locally)
  // These are kept for backward compatibility but return disabled status
  generateComponent: async (_intent) => {
    set({ generationError: 'AI generation is disabled. Use local TensorFlow.js model for suggestions.' })
    throw new Error('AI generation is disabled. Use local TensorFlow.js model for suggestions.')
  },

  editComponent: async (_componentId, _editIntent) => {
    set({ generationError: 'AI editing is disabled. Use local TensorFlow.js model for suggestions.' })
    throw new Error('AI editing is disabled. Use local TensorFlow.js model for suggestions.')
  },

  fetchUsage: async () => {
    // Return mock usage data since AI is local
    set({
      usage: {
        operations_used: 0,
        operations_limit: 999999,
        tokens_used: 0,
        cost_usd: 0,
        plan: 'local',
      },
    })
  },
}))
