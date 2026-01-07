export interface BodyMetric {
  id: number
  userId: number
  weightKg: number
  bodyFatPct: number | null
  measurementDate: string
  notes: string | null
  createdAt: string
  // Extended metrics
  neckCm?: number
  shouldersCm?: number
  chestCm?: number
  waistCm?: number
  hipsCm?: number
  leftBicepCm?: number
  rightBicepCm?: number
  leftThighCm?: number
  rightThighCm?: number
  leftCalfCm?: number
  rightCalfCm?: number
}

export interface CreateMetricRequest {
  weightKg: number
  bodyFatPct?: number
  measurementDate: string
  notes?: string
  // Extended metrics
  neckCm?: number
  shouldersCm?: number
  chestCm?: number
  waistCm?: number
  hipsCm?: number
  leftBicepCm?: number
  rightBicepCm?: number
  leftThighCm?: number
  rightThighCm?: number
  leftCalfCm?: number
  rightCalfCm?: number
}

export interface Goal {
  id: number
  userId: number
  goalType: GoalType
  targetWeight: number | null
  targetDate: string | null
  status: GoalStatus
  createdAt: string
  updatedAt: string
}

export type GoalType = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE'
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED'

export interface CreateGoalRequest {
  goalType: GoalType
  targetWeight?: number
  targetDate?: string
}

