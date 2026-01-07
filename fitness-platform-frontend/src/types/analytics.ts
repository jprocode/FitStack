// Body Analytics Types
export interface WeightTrendData {
  date: string
  weightKg: number
  movingAverage: number | null
  rateOfChange: number | null
  bodyFatPct: number | null
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

export interface GoalProgress {
  goalId: number
  goalType: string
  currentValue: number | null
  targetValue: number | null
  startValue: number | null
  progressPercentage: number
  predictedCompletionDate: string | null
  daysRemaining: number | null
  targetDate: string | null
  status: string
}

export interface MetricsStats {
  averageWeight: number | null
  minWeight: number | null
  maxWeight: number | null
  weightChange: number | null
  ratePerWeek: number | null
  averageBodyFat: number | null
  bodyFatChange: number | null
  startDate: string
  endDate: string
  totalEntries: number
  weeksTracked: number
}

// Workout Analytics Types
export interface WorkoutFrequencyData {
  date: string
  workoutCount: number
  weekNumber: number
}

export interface VolumeProgressionData {
  date: string
  totalVolume: number
  exerciseBreakdown: Record<string, number>
}

export interface PersonalRecord {
  exerciseId: number
  exerciseName: string
  muscleGroup: string
  maxWeight: number
  maxReps: number
  maxVolume: number
  estimatedOneRepMax: number | null
  achievedAt: string
  isRecent: boolean
}

export interface ProgressiveOverloadSuggestion {
  exerciseId: number
  exerciseName: string
  muscleGroup: string
  progressType: 'WEIGHT' | 'REPS' | 'SETS' | 'VOLUME'
  lastWeight: number
  suggestedWeight: number
  lastReps: number
  suggestedReps: number
  reasoning: string
}

