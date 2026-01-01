import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
  
  root.classList.remove('light', 'dark')
  root.classList.add(resolvedTheme)
  
  return resolvedTheme
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: getSystemTheme(),
      setTheme: (theme: Theme) => {
        const resolvedTheme = applyTheme(theme)
        set({ theme, resolvedTheme })
      },
    }),
    {
      name: 'fitstack-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)

// Initialize theme on load
if (typeof window !== 'undefined') {
  const theme = useThemeStore.getState().theme
  applyTheme(theme)
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = useThemeStore.getState().theme
    if (currentTheme === 'system') {
      const resolvedTheme = e.matches ? 'dark' : 'light'
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
      useThemeStore.setState({ resolvedTheme })
    }
  })
}

