export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface WorkoutSession {
  id: number
  userId: number
  templateId: number
  template?: import('./workout').WorkoutTemplate
  startedAt: string
  completedAt: string | null
  status: SessionStatus
  notes: string | null
  sets: WorkoutSet[]
}

export interface WorkoutSet {
  id: number
  sessionId: number
  exerciseId: number
  setNumber: number
  repsCompleted: number
  weightUsed: number
  completedAt: string
}

export interface StartSessionRequest {
  templateId: number
}

export interface LogSetRequest {
  exerciseId: number
  setNumber: number
  repsCompleted: number
  weightUsed: number
}

export interface CompleteSessionRequest {
  notes?: string
}

