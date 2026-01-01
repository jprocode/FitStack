import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post('/users/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/users/login', data),
}

// User API
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/profile', data),
}

// Metrics API
export const metricsApi = {
  getMetrics: () => api.get('/users/metrics'),
  createMetric: (data: Record<string, unknown>) => api.post('/users/metrics', data),
  deleteMetric: (id: number) => api.delete(`/users/metrics/${id}`),
  getLatestMetric: () => api.get('/users/metrics/latest'),
}

// Goals API
export const goalsApi = {
  getGoals: () => api.get('/users/goals'),
  getActiveGoals: () => api.get('/users/goals/active'),
  createGoal: (data: Record<string, unknown>) => api.post('/users/goals', data),
  updateGoalStatus: (id: number, status: string) =>
    api.put(`/users/goals/${id}/status`, null, { params: { status } }),
  deleteGoal: (id: number) => api.delete(`/users/goals/${id}`),
}

// Exercise API
export const exerciseApi = {
  getExercises: (params?: { search?: string; muscleGroup?: string; equipment?: string }) =>
    api.get('/workouts/exercises', { params }),
  getExercise: (id: number) => api.get(`/workouts/exercises/${id}`),
}

// Template API
export const templateApi = {
  getTemplates: () => api.get('/workouts/templates'),
  getTemplate: (id: number) => api.get(`/workouts/templates/${id}`),
  createTemplate: (data: Record<string, unknown>) => api.post('/workouts/templates', data),
  updateTemplate: (id: number, data: Record<string, unknown>) => api.put(`/workouts/templates/${id}`, data),
  deleteTemplate: (id: number) => api.delete(`/workouts/templates/${id}`),
}

// Session API
export const sessionApi = {
  startSession: (data: { templateId: number }) => api.post('/workouts/sessions', data),
  getSession: (id: number) => api.get(`/workouts/sessions/${id}`),
  logSet: (sessionId: number, data: Record<string, unknown>) =>
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

// Nutrition - Meals API
export const mealApi = {
  getMeals: (startDate?: string, endDate?: string) =>
    api.get('/nutrition/meals', { params: { startDate, endDate } }),
  getMealById: (id: number) => api.get(`/nutrition/meals/${id}`),
  getTodaysMeals: () => api.get('/nutrition/meals/today'),
  getDailyMacros: (date: string) => api.get('/nutrition/meals/daily', { params: { date } }),
  createMeal: (data: Record<string, unknown>) => api.post('/nutrition/meals', data),
  deleteMeal: (id: number) => api.delete(`/nutrition/meals/${id}`),
}

// Nutrition - Meal Plans API
export const mealPlanApi = {
  getMealPlans: () => api.get('/nutrition/meal-plans'),
  getMealPlan: (id: number) => api.get(`/nutrition/meal-plans/${id}`),
  generateMealPlan: (data: Record<string, unknown>) => api.post('/nutrition/meal-plans/generate', data),
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
}

export default api

