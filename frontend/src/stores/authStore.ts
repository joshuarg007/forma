import { create } from 'zustand'
import { api } from '@/lib/api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await api.login(email, password)
      api.setToken(response.access_token)
      localStorage.setItem('forma_refresh_token', response.refresh_token)
      set({ user: response.user as User, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null })
    try {
      const response = await api.register(email, password, name)
      api.setToken(response.access_token)
      localStorage.setItem('forma_refresh_token', response.refresh_token)
      set({ user: response.user as User, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  logout: () => {
    api.clearToken()
    set({ user: null, loading: false })
  },

  checkAuth: async () => {
    try {
      const user = await api.getMe()
      set({ user: user as User, initialized: true })
    } catch {
      set({ user: null, initialized: true })
    }
  },

  clearError: () => set({ error: null }),
}))
