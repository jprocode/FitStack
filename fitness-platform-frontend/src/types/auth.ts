export interface User {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  isOAuthUser?: boolean // True if user signed up via Google OAuth (no password)
}

export interface AuthResponse {
  token: string
  tokenType: string
  expiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface UserProfile {
  id: number | null
  userId: number
  email: string
  firstName: string | null
  lastName: string | null
  heightCm: number | null
  birthDate: string | null
  gender: string | null
  activityLevel: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  heightCm?: number
  birthDate?: string
  gender?: string
  activityLevel?: string
}

