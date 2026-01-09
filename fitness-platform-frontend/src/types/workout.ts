export interface Exercise {
  id: number
  name: string
  muscleGroup: string | null
  equipment: string | null
  difficulty: string | null
  instructions: string | null
  createdAt: string
}

export interface WorkoutTemplate {
  id: number
  userId: number
  name: string
  description: string | null
  isPublic: boolean
  exercises: TemplateExercise[]
  createdAt: string
  updatedAt: string
}

export interface TemplateExercise {
  id: number
  exerciseId: number
  exercise?: Exercise
  orderIndex: number
  targetSets: number
  targetReps: number
  targetWeight: number | null
  notes: string | null
}

export interface CreateTemplateRequest {
  name: string
  description?: string
  isPublic?: boolean
  exercises: CreateTemplateExerciseRequest[]
}

export interface CreateTemplateExerciseRequest {
  exerciseId: number
  orderIndex: number
  targetSets: number
  targetReps: number
  targetWeight?: number
  notes?: string
}

export interface UpdateTemplateRequest {
  name?: string
  description?: string
  isPublic?: boolean
  exercises?: CreateTemplateExerciseRequest[]
}

// Workout Plan Types
export interface WorkoutPlan {
  id: number
  userId: number
  name: string
  description?: string
  planType: 'WEEKLY' | 'NUMBERED'
  isActive: boolean
  isPrimary?: boolean
  lastCompletedDay?: number
  days?: WorkoutPlanDay[]
  createdAt: string
  updatedAt: string
}

export interface WorkoutPlanDay {
  id: number
  dayIdentifier: string
  name?: string
  orderIndex: number
  exercises: PlanDayExercise[]
}

export interface PlanDayExercise {
  id: number
  exerciseId: number
  exerciseName: string
  muscleGroup?: string
  orderIndex: number
  targetSets: number
  targetReps: string
  restSeconds?: number
  notes?: string
}

export interface TodaysWorkout {
  planId: number
  planName: string
  planType: 'WEEKLY' | 'NUMBERED'
  detectedDay: string
  dayLabel: string
  isRestDay: boolean
  lastCompletedDay?: number
  workoutDay?: WorkoutPlanDay
  allDays: WorkoutPlanDay[]
}
