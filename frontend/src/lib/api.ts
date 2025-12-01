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

  // AI
  async generateComponent(intent: string, projectId: string, designSystem?: any) {
    return this.fetch<{
      success: boolean
      result: { name: string; code: string; props_schema: any; explanation: string } | null
      error: string | null
      tokens_used: number
    }>('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({
        intent,
        context: {
          project_id: projectId,
          design_system: designSystem || {},
          existing_components: [],
        },
      }),
    })
  }

  async editComponent(
    componentId: string,
    editIntent: string,
    projectId: string
  ) {
    return this.fetch<{
      success: boolean
      result: { name: string; code: string; props_schema: any; explanation: string } | null
      error: string | null
      tokens_used: number
    }>('/api/ai/edit', {
      method: 'POST',
      body: JSON.stringify({
        component_id: componentId,
        edit_intent: editIntent,
        context: {
          project_id: projectId,
          design_system: {},
          existing_components: [],
        },
      }),
    })
  }

  async explainCode(code: string) {
    return this.fetch<{ explanation: string; tokens_used: number }>('/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async getUsage() {
    return this.fetch<{
      operations_used: number
      operations_limit: number
      tokens_used: number
      cost_usd: number
      plan: string
    }>('/api/ai/usage')
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
}

export const api = new APIClient()
