import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, token } = res.data;
          set({ user, token, isAuthenticated: true });
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed';
          throw new Error(message);
        }
      },
      register: async (username, email, password, firstName, lastName) => {
        try {
          const res = await api.post('/auth/register', { username, email, password, firstName, lastName });
          const { user, token } = res.data;
          set({ user, token, isAuthenticated: true });
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed';
          throw new Error(message);
        }
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
