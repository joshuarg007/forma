// FORMA API Client

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class APIClient {
  private accessToken: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('forma_access_token')
    }
  }

  setToken(token: string) {
    this.accessToken = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('forma_access_token', token)
    }
  }

  clearToken() {
    this.accessToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('forma_access_token')
      localStorage.removeItem('forma_refresh_token')
    }
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    let response: Response
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      })
    } catch (networkError) {
      // Network error (CORS, offline, etc.)
      throw new Error('Network error - please check your connection')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Request failed' }))
      const message = typeof errorData?.detail === 'string'
        ? errorData.detail
        : typeof errorData === 'string'
          ? errorData
          : 'Request failed'
      throw new Error(message)
    }

    return response.json()
  }

  // Generic methods for marketplace pages
  async get<T = any>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint)
  }

  async post<T = any>(endpoint: string, data?: any, method: string = 'POST'): Promise<T> {
    return this.fetch<T>(endpoint, {
      method,
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'DELETE',
    })
  }

  // GitHub
  async getGitHubStatus() {
    return this.fetch<{ connected: boolean; github_username: string | null }>('/api/github/status')
  }

  async startGitHubOAuth() {
    return this.fetch<{ oauth_url: string; state: string }>('/api/github/oauth/authorize')
  }

  async disconnectGitHub() {
    return this.fetch<{ success: boolean }>('/api/github/oauth/disconnect', { method: 'DELETE' })
  }

  async getGitHubRepos() {
    return this.fetch<{ repos: any[] }>('/api/github/repos')
  }

  // Team
  async getTeamMembers(projectId: string) {
    return this.fetch<any[]>(`/api/projects/${projectId}/team/members`)
  }

  async getTeamInvites(projectId: string) {
    return this.fetch<any[]>(`/api/projects/${projectId}/team/invites`)
  }

  async inviteTeamMember(projectId: string, email: string, role: string, message?: string) {
    return this.fetch<any>(`/api/projects/${projectId}/team/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role, message }),
    })
  }

  async updateMemberRole(projectId: string, memberId: string, role: string) {
    return this.fetch<any>(`/api/projects/${projectId}/team/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  async removeMember(projectId: string, memberId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/team/members/${memberId}`, {
      method: 'DELETE',
    })
  }

  async cancelInvite(projectId: string, inviteId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/team/invites/${inviteId}`, {
      method: 'DELETE',
    })
  }

  // Uploads
  async uploadImage(file: File, category: string = 'images') {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/api/uploads/image?category=${category}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  }

  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/api/uploads/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  }

  // WebSocket
  getWebSocketUrl(projectId: string): string {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = API_URL.replace(/^https?:\/\//, '')
    return `${wsProtocol}//${host}/ws/project/${projectId}?token=${this.accessToken}`
  }

  // Auth
  async register(email: string, password: string, name?: string) {
    return this.fetch<{
      access_token: string
      refresh_token: string
      user: { id: string; email: string; name: string | null; plan: string }
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }

  async login(email: string, password: string) {
    return this.fetch<{
      access_token: string
      refresh_token: string
      user: { id: string; email: string; name: string | null; plan: string }
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getMe() {
    return this.fetch<{ id: string; email: string; name: string | null; plan: string }>(
      '/api/auth/me'
    )
  }

  // Projects
  async getProjects() {
    return this.fetch<{ projects: any[]; total: number }>('/api/projects')
  }

  async createProject(name: string, description?: string) {
    return this.fetch<any>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    })
  }

  async getProject(id: string) {
    return this.fetch<any>(`/api/projects/${id}`)
  }

  async updateProject(id: string, data: any) {
    return this.fetch<any>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string) {
    return this.fetch<void>(`/api/projects/${id}`, {
      method: 'DELETE',
    })
  }

  // Components
  async getComponents(projectId: string) {
    return this.fetch<any[]>(`/api/projects/${projectId}/components`)
  }

  async createComponent(projectId: string, data: any) {
    return this.fetch<any>(`/api/projects/${projectId}/components`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateComponent(projectId: string, componentId: string, data: any) {
    return this.fetch<any>(`/api/projects/${projectId}/components/${componentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteComponent(projectId: string, componentId: string) {
    return this.fetch<void>(`/api/projects/${projectId}/components/${componentId}`, {
      method: 'DELETE',
    })
  }

  // Pages
  async getPages(projectId: string) {
    return this.fetch<{ pages: any[]; total: number }>(`/api/projects/${projectId}/pages`)
  }

  async createPage(projectId: string, data: {
    name: string
    slug: string
    description?: string
    page_type?: string
    layout?: string
    is_homepage?: boolean
    is_dynamic?: boolean
    dynamic_param?: string
    meta_title?: string
    meta_description?: string
    show_in_nav?: boolean
    nav_label?: string
    nav_icon?: string
    canvas_components?: any[]
  }) {
    return this.fetch<any>(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPage(projectId: string, pageId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/pages/${pageId}`)
  }

  async getPageBySlug(projectId: string, slug: string) {
    return this.fetch<any>(`/api/projects/${projectId}/pages/by-slug/${slug}`)
  }

  async updatePage(projectId: string, pageId: string, data: any) {
    return this.fetch<any>(`/api/projects/${projectId}/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePage(projectId: string, pageId: string) {
    return this.fetch<void>(`/api/projects/${projectId}/pages/${pageId}`, {
      method: 'DELETE',
    })
  }

  async duplicatePage(projectId: string, pageId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/pages/${pageId}/duplicate`, {
      method: 'POST',
    })
  }

  async reorderPages(projectId: string, pages: { id: string; position: number }[]) {
    return this.fetch<{ ok: boolean }>(`/api/projects/${projectId}/pages/reorder`, {
      method: 'POST',
      body: JSON.stringify({ pages }),
    })
  }

  // Menus
  async getMenus(projectId: string) {
    return this.fetch<{ menus: any[]; total: number }>(`/api/projects/${projectId}/menus`)
  }

  async getMenu(projectId: string, menuId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/menus/${menuId}`)
  }

  async createMenu(projectId: string, data: { name: string; slug?: string; description?: string; items?: any[] }) {
    return this.fetch<any>(`/api/projects/${projectId}/menus`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMenu(projectId: string, menuId: string, data: { name?: string; slug?: string; description?: string; items?: any[] }) {
    return this.fetch<any>(`/api/projects/${projectId}/menus/${menuId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMenu(projectId: string, menuId: string) {
    return this.fetch<void>(`/api/projects/${projectId}/menus/${menuId}`, {
      method: 'DELETE',
    })
  }

  // Media
  async getMediaFiles(projectId: string, params?: { folder_id?: string; media_type?: string; search?: string; limit?: number; offset?: number }) {
    const q = new URLSearchParams()
    if (params?.folder_id) q.set('folder_id', params.folder_id)
    if (params?.media_type) q.set('media_type', params.media_type)
    if (params?.search) q.set('search', params.search)
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.offset) q.set('offset', String(params.offset))
    const qs = q.toString()
    return this.fetch<any>(`/api/projects/${projectId}/media/files${qs ? `?${qs}` : ''}`)
  }

  async getMediaFolders(projectId: string, parentId?: string) {
    const q = parentId ? `?parent_id=${parentId}` : ''
    return this.fetch<any>(`/api/projects/${projectId}/media/folders${q}`)
  }

  async createMediaFolder(projectId: string, data: { name: string; parent_id?: string }) {
    return this.fetch<any>(`/api/projects/${projectId}/media/folders`, { method: 'POST', body: JSON.stringify(data) })
  }

  async deleteMediaFile(projectId: string, fileId: string) {
    return this.fetch<void>(`/api/projects/${projectId}/media/files/${fileId}`, { method: 'DELETE' })
  }

  async getMediaStats(projectId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/media/stats`)
  }

  // Blog
  async getBlogPosts(projectId: string, params?: { status?: string; category_id?: string; search?: string }) {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.category_id) q.set('category_id', params.category_id)
    if (params?.search) q.set('search', params.search)
    const qs = q.toString()
    return this.fetch<any>(`/api/blog/projects/${projectId}/posts${qs ? `?${qs}` : ''}`)
  }

  async createBlogPost(projectId: string, data: any) {
    return this.fetch<any>(`/api/blog/projects/${projectId}/posts`, { method: 'POST', body: JSON.stringify(data) })
  }

  async updateBlogPost(projectId: string, postId: string, data: any) {
    return this.fetch<any>(`/api/blog/projects/${projectId}/posts/${postId}`, { method: 'PUT', body: JSON.stringify(data) })
  }

  async deleteBlogPost(projectId: string, postId: string) {
    return this.fetch<void>(`/api/blog/projects/${projectId}/posts/${postId}`, { method: 'DELETE' })
  }

  async getBlogCategories(projectId: string) {
    return this.fetch<any>(`/api/blog/projects/${projectId}/categories`)
  }

  async createBlogCategory(projectId: string, data: { name: string; slug?: string; description?: string }) {
    return this.fetch<any>(`/api/blog/projects/${projectId}/categories`, { method: 'POST', body: JSON.stringify(data) })
  }

  async deleteBlogCategory(projectId: string, categoryId: string) {
    return this.fetch<void>(`/api/blog/projects/${projectId}/categories/${categoryId}`, { method: 'DELETE' })
  }

  // E-Commerce / Store
  async getProducts(projectId: string, params?: { status?: string; search?: string }) {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.search) q.set('search', params.search)
    const qs = q.toString()
    return this.fetch<any>(`/api/ecommerce/projects/${projectId}/products${qs ? `?${qs}` : ''}`)
  }

  async createProduct(projectId: string, data: any) {
    return this.fetch<any>(`/api/ecommerce/projects/${projectId}/products`, { method: 'POST', body: JSON.stringify(data) })
  }

  async updateProduct(projectId: string, productId: string, data: any) {
    return this.fetch<any>(`/api/ecommerce/projects/${projectId}/products/${productId}`, { method: 'PUT', body: JSON.stringify(data) })
  }

  async deleteProduct(projectId: string, productId: string) {
    return this.fetch<void>(`/api/ecommerce/projects/${projectId}/products/${productId}`, { method: 'DELETE' })
  }

  async getOrders(projectId: string, params?: { status?: string }) {
    const q = params?.status ? `?status=${params.status}` : ''
    return this.fetch<any>(`/api/ecommerce/projects/${projectId}/orders${q}`)
  }

  async updateOrderStatus(projectId: string, orderId: string, status: string) {
    return this.fetch<any>(`/api/ecommerce/projects/${projectId}/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
  }

  // SEO
  async getSEOSettings(projectId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/seo`)
  }

  async updateSEOSettings(projectId: string, data: any) {
    return this.fetch<any>(`/api/projects/${projectId}/seo`, { method: 'PUT', body: JSON.stringify(data) })
  }

  async getPageSEO(projectId: string, pageId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/seo/pages/${pageId}`)
  }

  async updatePageSEO(projectId: string, pageId: string, data: any) {
    return this.fetch<any>(`/api/projects/${projectId}/seo/pages/${pageId}`, { method: 'PUT', body: JSON.stringify(data) })
  }

  async analyzeSEO(projectId: string, pageId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/seo/analyze/${pageId}`)
  }

  // Integrations
  async getIntegrationTypes(projectId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/integrations/types`)
  }

  async getIntegrations(projectId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/integrations`)
  }

  async createIntegration(projectId: string, data: any) {
    return this.fetch<any>(`/api/projects/${projectId}/integrations`, { method: 'POST', body: JSON.stringify(data) })
  }

  async updateIntegration(projectId: string, integrationId: string, data: any) {
    return this.fetch<any>(`/api/projects/${projectId}/integrations/${integrationId}`, { method: 'PUT', body: JSON.stringify(data) })
  }

  async deleteIntegration(projectId: string, integrationId: string) {
    return this.fetch<void>(`/api/projects/${projectId}/integrations/${integrationId}`, { method: 'DELETE' })
  }

  async testIntegration(projectId: string, integrationId: string) {
    return this.fetch<any>(`/api/projects/${projectId}/integrations/${integrationId}/test`, { method: 'POST' })
  }

  async toggleIntegration(projectId: string, integrationId: string, enabled: boolean) {
    return this.fetch<any>(`/api/projects/${projectId}/integrations/${integrationId}/${enabled ? 'enable' : 'disable'}`, { method: 'POST' })
  }

  // AI - Disabled (using local TF.js model instead)
  // These methods are kept for API compatibility but return disabled status
  async generateComponent(_intent: string, _projectId: string, _designSystem?: any) {
    return {
      success: false,
      result: null,
      error: 'AI generation disabled. Using local TensorFlow.js model for suggestions.',
      tokens_used: 0,
    }
  }

  async editComponent(
    _componentId: string,
    _editIntent: string,
    _projectId: string
  ) {
    return {
      success: false,
      result: null,
      error: 'AI editing disabled. Using local TensorFlow.js model.',
      tokens_used: 0,
    }
  }

  async explainCode(_code: string) {
    return {
      explanation: 'Code explanation is handled locally.',
      tokens_used: 0,
    }
  }

  async getUsage() {
    // Return mock usage data since we're not using external AI
    return {
      operations_used: 0,
      operations_limit: 999999,
      tokens_used: 0,
      cost_usd: 0,
      plan: 'local',
    }
  }

  // Billing
  async getSubscription() {
    return this.fetch<any>('/api/billing/subscription')
  }

  async createCheckout(plan: string, successUrl: string, cancelUrl: string) {
    return this.fetch<{ checkout_url: string }>('/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({
        plan,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    })
  }

  // Export
  async exportNextjs(projectId: string) {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/export/nextjs`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })
    return response.blob()
  }

  async exportVite(projectId: string) {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/export/vite`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })
    return response.blob()
  }

  // ==========================================================================
  // HOSTING API
  // ==========================================================================

  // Hosting Configuration
  async getHostingConfig(projectId: string) {
    return this.fetch<HostingConfig>(`/api/projects/${projectId}/hosting`)
  }

  async setupHosting(projectId: string, subdomain: string) {
    return this.fetch<HostingConfig>(`/api/projects/${projectId}/hosting/setup`, {
      method: 'POST',
      body: JSON.stringify({ subdomain }),
    })
  }

  async updateHostingConfig(projectId: string, config: Partial<HostingConfigUpdate>) {
    return this.fetch<HostingConfig>(`/api/projects/${projectId}/hosting`, {
      method: 'PUT',
      body: JSON.stringify(config),
    })
  }

  async disableHosting(projectId: string) {
    return this.fetch<void>(`/api/projects/${projectId}/hosting`, {
      method: 'DELETE',
    })
  }

  // Deployments
  async deploy(projectId: string, commitMessage?: string, isPreview = false) {
    return this.fetch<Deployment>(`/api/projects/${projectId}/deploy`, {
      method: 'POST',
      body: JSON.stringify({
        commit_message: commitMessage,
        is_preview: isPreview,
      }),
    })
  }

  async getDeployments(projectId: string, limit = 20, offset = 0) {
    return this.fetch<{ deployments: Deployment[]; total: number }>(
      `/api/projects/${projectId}/deployments?limit=${limit}&offset=${offset}`
    )
  }

  async getDeployment(projectId: string, deploymentId: string) {
    return this.fetch<Deployment>(`/api/projects/${projectId}/deployments/${deploymentId}`)
  }

  async getDeploymentLogs(projectId: string, deploymentId: string) {
    return this.fetch<{ deployment_id: string; logs: BuildLogEntry[]; total: number }>(
      `/api/projects/${projectId}/deployments/${deploymentId}/logs`
    )
  }

  async rollbackDeployment(projectId: string, deploymentId: string) {
    return this.fetch<Deployment>(
      `/api/projects/${projectId}/deployments/${deploymentId}/rollback`,
      { method: 'POST' }
    )
  }

  // Custom Domains
  async getCustomDomains(projectId: string) {
    return this.fetch<{ domains: CustomDomain[]; total: number }>(
      `/api/projects/${projectId}/domains`
    )
  }

  async addCustomDomain(projectId: string, domain: string) {
    return this.fetch<CustomDomain>(`/api/projects/${projectId}/domains`, {
      method: 'POST',
      body: JSON.stringify({ domain }),
    })
  }

  async verifyDomain(projectId: string, domainId: string) {
    return this.fetch<CustomDomain>(
      `/api/projects/${projectId}/domains/${domainId}/verify`,
      { method: 'POST' }
    )
  }

  async removeCustomDomain(projectId: string, domainId: string) {
    return this.fetch<void>(`/api/projects/${projectId}/domains/${domainId}`, {
      method: 'DELETE',
    })
  }

  async setPrimaryDomain(projectId: string, domainId: string) {
    return this.fetch<CustomDomain>(
      `/api/projects/${projectId}/domains/${domainId}/primary`,
      { method: 'PUT' }
    )
  }

  async checkDomainPropagation(projectId: string, domainId: string) {
    return this.fetch<{
      domain: string
      propagation_complete: boolean
      servers_resolved: number
      total_servers: number
      details: Record<string, { status: string; ips?: string[]; error?: string }>
    }>(
      `/api/projects/${projectId}/domains/${domainId}/check-propagation`,
      { method: 'POST' }
    )
  }

  // Subdomain utilities
  async checkSubdomain(subdomain: string) {
    return this.fetch<{ subdomain: string; available: boolean; suggested?: string }>(
      '/api/hosting/check-subdomain',
      {
        method: 'POST',
        body: JSON.stringify({ subdomain }),
      }
    )
  }
}

// ==========================================================================
// HOSTING TYPES
// ==========================================================================

export interface HostingConfig {
  id: string
  project_id: string
  subdomain: string
  production_url: string
  current_deployment_id: string | null
  auto_deploy_enabled: boolean
  build_command: string
  output_directory: string
  node_version: string
  analytics_enabled: boolean
  created_at: string
  updated_at: string
  current_deployment: Deployment | null
  custom_domains: CustomDomain[]
}

export interface HostingConfigUpdate {
  auto_deploy_enabled?: boolean
  build_command?: string
  output_directory?: string
  node_version?: string
  analytics_enabled?: boolean
}

export interface Deployment {
  id: string
  project_id: string
  user_id: string
  version: number
  status: 'pending' | 'building' | 'uploading' | 'deployed' | 'failed' | 'cancelled'
  subdomain: string
  production_url: string | null
  preview_url: string | null
  build_started_at: string | null
  build_completed_at: string | null
  deploy_started_at: string | null
  deploy_completed_at: string | null
  commit_message: string | null
  is_production: boolean
  triggered_by: string
  error_message: string | null
  error_code: string | null
  created_at: string
  updated_at: string
}

export interface CustomDomain {
  id: string
  project_id: string
  domain: string
  status: 'pending_validation' | 'validating' | 'active' | 'failed' | 'expired'
  dns_record_type: string
  dns_record_name: string | null
  dns_record_value: string | null
  dns_verified_at: string | null
  ssl_status: string
  ssl_expires_at: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface BuildLogEntry {
  id: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  step: string | null
  timestamp: string
}

export const api = new APIClient()
