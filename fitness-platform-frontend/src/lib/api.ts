import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { AuthResponse } from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Function to refresh tokens
async function refreshTokens(): Promise<string | null> {
  const store = useAuthStore.getState()
  const refreshToken = store.refreshToken

  if (!refreshToken) {
    return null
  }

  try {
    // Use a separate axios instance to avoid interceptor loops
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/users/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    )

    const { token, expiresIn, refreshToken: newRefreshToken, refreshTokenExpiresIn } = response.data

    // Update store with new tokens
    store.updateTokens(token, expiresIn, newRefreshToken, refreshTokenExpiresIn)

    return token
  } catch (error) {
    // Refresh failed - logout user
    store.logout()
    return null
  }
}

// Request interceptor to add auth token and check expiration
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const store = useAuthStore.getState()
    const token = store.token

    // Skip auth for login/register/refresh endpoints
    const publicEndpoints = ['/users/login', '/users/register', '/users/refresh']
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url?.includes(endpoint)
    )

    if (token && !isPublicEndpoint) {
      // Check if token is expiring soon and needs refresh
      if (store.isTokenExpiringSoon() && !store.isRefreshTokenExpired()) {
        if (!isRefreshing) {
          isRefreshing = true
          try {
            const newToken = await refreshTokens()
            isRefreshing = false
            processQueue(null, newToken)
            if (newToken) {
              config.headers.Authorization = `Bearer ${newToken}`
            }
          } catch (error) {
            isRefreshing = false
            processQueue(error as Error, null)
          }
        } else {
          // Wait for the ongoing refresh to complete
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (newToken) => {
                config.headers.Authorization = `Bearer ${newToken}`
                resolve(config)
              },
              reject: (err) => {
                reject(err)
              },
            })
          })
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and retry failed requests
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const store = useAuthStore.getState()

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if refresh token is still valid
      if (store.refreshToken && !store.isRefreshTokenExpired()) {
        if (isRefreshing) {
          // Wait for refresh to complete
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(api(originalRequest))
              },
              reject: (err) => reject(err),
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const newToken = await refreshTokens()
          isRefreshing = false
          processQueue(null, newToken)

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          isRefreshing = false
          processQueue(refreshError as Error, null)
        }
      }

      // Refresh token expired or refresh failed - show modal or logout
      if (store.isRefreshTokenExpired()) {
        // Show session expiry modal instead of immediate logout
        store.setShowSessionExpiryModal(true)
      } else {
        store.logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post('/users/register', data),
  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post('/users/login', data),
  logout: () => api.post('/users/logout'),
  refresh: (refreshToken: string) =>
    api.post('/users/refresh', { refreshToken }),
  deleteAccount: (password: string) =>
    api.delete('/users/account', { data: { password } }),
}

// User API
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: object) => api.put('/users/profile', data),
  getCalorieTargets: () => api.get('/users/profile/calorie-targets'),
}

// Metrics API
export const metricsApi = {
  getMetrics: () => api.get('/users/metrics'),
  createMetric: (data: object) => api.post('/users/metrics', data),
  deleteMetric: (id: number) => api.delete(`/users/metrics/${id}`),
  getLatestMetric: () => api.get('/users/metrics/latest'),
}

// Goals API
export const goalsApi = {
  getGoals: () => api.get('/users/goals'),
  getActiveGoals: () => api.get('/users/goals/active'),
  createGoal: (data: object) => api.post('/users/goals', data),
  updateGoalStatus: (id: number, status: string) =>
    api.put(`/users/goals/${id}/status`, null, { params: { status } }),
  deleteGoal: (id: number) => api.delete(`/users/goals/${id}`),
}

// Exercise API
export const exerciseApi = {
  getExercises: (params?: { search?: string; muscleGroup?: string; equipment?: string; page?: number; size?: number }) =>
    api.get('/workouts/exercises', { params }),
  getExercise: (id: number) => api.get(`/workouts/exercises/${id}`),
  getMuscleGroups: () => api.get('/workouts/exercises/muscle-groups'),
  getEquipment: () => api.get('/workouts/exercises/equipment'),
}

// Template API
export const templateApi = {
  getTemplates: () => api.get('/workouts/templates'),
  getTemplate: (id: number) => api.get(`/workouts/templates/${id}`),
  createTemplate: (data: object) => api.post('/workouts/templates', data),
  updateTemplate: (id: number, data: object) => api.put(`/workouts/templates/${id}`, data),
  deleteTemplate: (id: number) => api.delete(`/workouts/templates/${id}`),
}

// Workout Plan API
export const workoutPlanApi = {
  getPlans: () => api.get('/workouts/plans'),
  getPlan: (id: number) => api.get(`/workouts/plans/${id}`),
  createPlan: (data: object) => api.post('/workouts/plans', data),
  updatePlan: (id: number, data: object) => api.put(`/workouts/plans/${id}`, data),
  deletePlan: (id: number) => api.delete(`/workouts/plans/${id}`),
  addDay: (planId: number, data: object) => api.post(`/workouts/plans/${planId}/days`, data),
  updateDay: (planId: number, dayId: number, data: object) =>
    api.put(`/workouts/plans/${planId}/days/${dayId}`, data),
  deleteDay: (planId: number, dayId: number) => api.delete(`/workouts/plans/${planId}/days/${dayId}`),
  // Primary plan methods
  setPrimary: (id: number) => api.put(`/workouts/plans/${id}/set-primary`),
  getPrimary: () => api.get('/workouts/plans/primary'),
  getTodaysWorkout: () => api.get('/workouts/plans/primary/today'),
}

// Session API
export const sessionApi = {
  startSession: (data: { templateId: number }) => api.post('/workouts/sessions', data),
  startFromPlan: (planDayId: number) => api.post('/workouts/sessions/start-from-plan', { planDayId }),
  getSession: (id: number) => api.get(`/workouts/sessions/${id}`),
  logSet: (sessionId: number, data: object) =>
    api.post(`/workouts/sessions/${sessionId}/sets`, data),
  completeSession: (id: number, data?: { notes?: string }) =>
    api.put(`/workouts/sessions/${id}/complete`, data),
  getHistory: () => api.get('/workouts/history'),
}

// Nutrition - Foods API
export const foodApi = {
  searchFoods: (query: string, limit?: number) =>
    api.get('/nutrition/foods/search', { params: { q: query, limit: limit || 20 } }),
  getFoodById: (id: number) => api.get(`/nutrition/foods/${id}`),
  getFoodByFdcId: (fdcId: number) => api.get(`/nutrition/foods/fdc/${fdcId}`),
}

// Nutrition - Custom Foods API
export const customFoodApi = {
  getMyFoods: () => api.get('/nutrition/my-foods'),
  searchMyFoods: (query: string) => api.get('/nutrition/my-foods/search', { params: { q: query } }),
  getById: (id: number) => api.get(`/nutrition/my-foods/${id}`),
  create: (data: object) => api.post('/nutrition/my-foods', data),
  update: (id: number, data: object) => api.put(`/nutrition/my-foods/${id}`, data),
  delete: (id: number) => api.delete(`/nutrition/my-foods/${id}`),
}

// Nutrition - Meals API
export const mealApi = {
  getMeals: (startDate?: string, endDate?: string) =>
    api.get('/nutrition/meals', { params: { startDate, endDate } }),
  getMealById: (id: number) => api.get(`/nutrition/meals/${id}`),
  getTodaysMeals: () => api.get('/nutrition/meals/today'),
  getDailyMacros: (date: string) => api.get('/nutrition/meals/daily', { params: { date } }),
  createMeal: (data: object) => api.post('/nutrition/meals', data),
  deleteMeal: (id: number) => api.delete(`/nutrition/meals/${id}`),
}

// Nutrition - Meal Plans API
export const mealPlanApi = {
  getMealPlans: () => api.get('/nutrition/meal-plans'),
  getMealPlan: (id: number) => api.get(`/nutrition/meal-plans/${id}`),
  generateMealPlan: (data: object) => api.post('/nutrition/meal-plans/generate', data),
  deleteMealPlan: (id: number) => api.delete(`/nutrition/meal-plans/${id}`),
}

// Body Analytics API
export const analyticsApi = {
  getWeightTrend: (startDate: string, endDate: string) =>
    api.get('/users/analytics/weight-trend', { params: { startDate, endDate } }),
  getGoalProgress: () => api.get('/users/analytics/goal-progress'),
  getMetricsStats: (period: string) =>
    api.get('/users/analytics/stats', { params: { period } }),
  predictGoalCompletion: (goalId: number) => api.get(`/users/analytics/predict/${goalId}`),
}

// Workout Analytics API
export const workoutAnalyticsApi = {
  getFrequency: (startDate: string, endDate: string) =>
    api.get('/workouts/analytics/frequency', { params: { startDate, endDate } }),
  getVolume: (exerciseId?: number, period?: string) =>
    api.get('/workouts/analytics/volume', { params: { exerciseId, period } }),
  getPersonalRecords: () => api.get('/workouts/analytics/personal-records'),
  getProgressiveOverload: () => api.get('/workouts/analytics/progressive-overload'),
  clearAll: () => api.delete('/workouts/analytics/clear-all'),
  clearRecent: () => api.delete('/workouts/analytics/clear-recent'),
  clearLastSession: () => api.delete('/workouts/analytics/clear-last-session'),
}

export default api
