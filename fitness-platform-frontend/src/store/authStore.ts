import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth'

interface AuthState {
  token: string | null
  refreshToken: string | null
  tokenExpiresAt: number | null // Unix timestamp in ms
  refreshTokenExpiresAt: number | null // Unix timestamp in ms
  user: User | null
  isAuthenticated: boolean
  showSessionExpiryModal: boolean

  // Actions
  setAuth: (
    token: string,
    user: User,
    expiresIn: number,
    refreshToken: string,
    refreshTokenExpiresIn: number
  ) => void
  updateTokens: (token: string, expiresIn: number, refreshToken: string, refreshTokenExpiresIn: number) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setShowSessionExpiryModal: (show: boolean) => void

  // Computed helpers (these are actually functions that compute from state)
  isTokenExpired: () => boolean
  isTokenExpiringSoon: () => boolean
  isRefreshTokenExpired: () => boolean
  getTokenRemainingTime: () => number
}

// Time before token expires to trigger refresh (5 minutes)
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      tokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      user: null,
      isAuthenticated: false,
      showSessionExpiryModal: false,

      setAuth: (token, user, expiresIn, refreshToken, refreshTokenExpiresIn) => {
        const now = Date.now()
        set({
          token,
          user,
          isAuthenticated: true,
          refreshToken,
          tokenExpiresAt: now + expiresIn * 1000, // Convert seconds to ms
          refreshTokenExpiresAt: now + refreshTokenExpiresIn * 1000,
          showSessionExpiryModal: false,
        })
      },

      updateTokens: (token, expiresIn, refreshToken, refreshTokenExpiresIn) => {
        const now = Date.now()
        set({
          token,
          refreshToken,
          tokenExpiresAt: now + expiresIn * 1000,
          refreshTokenExpiresAt: now + refreshTokenExpiresIn * 1000,
          showSessionExpiryModal: false,
        })
      },

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          tokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          user: null,
          isAuthenticated: false,
          showSessionExpiryModal: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      setShowSessionExpiryModal: (show) =>
        set({ showSessionExpiryModal: show }),

      // Check if access token is expired
      isTokenExpired: () => {
        const { tokenExpiresAt } = get()
        if (!tokenExpiresAt) return true
        return Date.now() >= tokenExpiresAt
      },

      // Check if access token is expiring soon (within threshold)
      isTokenExpiringSoon: () => {
        const { tokenExpiresAt } = get()
        if (!tokenExpiresAt) return true
        return Date.now() >= tokenExpiresAt - TOKEN_REFRESH_THRESHOLD_MS
      },

      // Check if refresh token is expired
      isRefreshTokenExpired: () => {
        const { refreshTokenExpiresAt } = get()
        if (!refreshTokenExpiresAt) return true
        return Date.now() >= refreshTokenExpiresAt
      },

      // Get remaining time for access token in ms
      getTokenRemainingTime: () => {
        const { tokenExpiresAt } = get()
        if (!tokenExpiresAt) return 0
        return Math.max(0, tokenExpiresAt - Date.now())
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        tokenExpiresAt: state.tokenExpiresAt,
        refreshTokenExpiresAt: state.refreshTokenExpiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
