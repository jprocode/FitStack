// Body Analytics Types
export interface WeightTrendData {
  date: string
  weightKg: number
  movingAverage: number | null
  rateOfChange: number | null
  bodyFatPct: number | null
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
  maxWeight: number
  maxReps: number
  maxVolume: number
  achievedAt: string
}

export interface ProgressiveOverloadSuggestion {
  exerciseId: number
  exerciseName: string
  lastWeight: number
  suggestedWeight: number
  lastReps: number
  suggestedReps: number
  reasoning: string
}

