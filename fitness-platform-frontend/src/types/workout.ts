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

