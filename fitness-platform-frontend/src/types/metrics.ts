export interface BodyMetric {
  id: number
  userId: number
  weightKg: number
  bodyFatPct: number | null
  measurementDate: string
  notes: string | null
  createdAt: string
}

export interface CreateMetricRequest {
  weightKg: number
  bodyFatPct?: number
  measurementDate: string
  notes?: string
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

