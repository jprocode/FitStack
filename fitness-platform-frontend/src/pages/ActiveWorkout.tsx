import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { sessionApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { formatDuration } from '@/lib/utils'
import { Loader2, Check, Timer, Dumbbell, Trophy, X } from 'lucide-react'
import type { WorkoutSession, WorkoutSet } from '@/types/session'

interface ExerciseState {
  exerciseId: number
  name: string
  targetSets: number
  targetReps: number
  targetWeight: number | null
  completedSets: WorkoutSet[]
}

export default function ActiveWorkout() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [exercises, setExercises] = useState<ExerciseState[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [restTime, setRestTime] = useState(60)
  const [showSummary, setShowSummary] = useState(false)

  // Set input state
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState(0)
  const [isLogging, setIsLogging] = useState(false)

  const fetchSession = useCallback(async () => {
    if (!sessionId) return
    try {
      const response = await sessionApi.getSession(parseInt(sessionId))
      const data: WorkoutSession = response.data
      setSession(data)

      // Handle both plan-based and template-based sessions
      if (data.planDayExercises && data.planDayExercises.length > 0) {
        // Plan-based session
        const exerciseStates: ExerciseState[] = data.planDayExercises.map((pe) => ({
          exerciseId: pe.exerciseId,
          name: pe.exerciseName,
          targetSets: pe.targetSets,
          targetReps: typeof pe.targetReps === 'string' ? parseInt(pe.targetReps.split('-')[0]) || 10 : pe.targetReps,
          targetWeight: null,
          completedSets: data.sets.filter((s) => s.exerciseId === pe.exerciseId),
        }))
        setExercises(exerciseStates)

        if (exerciseStates.length > 0) {
          setReps(exerciseStates[0].targetReps)
          setWeight(0)
        }
      } else if (data.template?.exercises) {
        // Template-based session (legacy)
        const exerciseStates: ExerciseState[] = data.template.exercises.map((te) => ({
          exerciseId: te.exercise!.id,
          name: te.exercise!.name,
          targetSets: te.targetSets,
          targetReps: te.targetReps,
          targetWeight: te.targetWeight,
          completedSets: data.sets.filter((s) => s.exerciseId === te.exercise!.id),
        }))
        setExercises(exerciseStates)

        if (exerciseStates.length > 0) {
          setReps(exerciseStates[0].targetReps)
          setWeight(exerciseStates[0].targetWeight || 0)
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Session not found',
        description: 'The workout session could not be loaded.',
      })
      navigate('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, navigate, toast])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  // Duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((d) => d + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Rest timer
  useEffect(() => {
    if (showRestTimer && restTime > 0) {
      const timer = setTimeout(() => setRestTime((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (restTime === 0) {
      setShowRestTimer(false)
      setRestTime(60)
    }
  }, [showRestTimer, restTime])

  const currentExercise = exercises[currentExerciseIndex]
  const completedSetsCount = currentExercise?.completedSets.length || 0
  const totalSets = exercises.reduce((acc, e) => acc + e.targetSets, 0)
  const completedTotalSets = exercises.reduce((acc, e) => acc + e.completedSets.length, 0)
  const progress = totalSets > 0 ? (completedTotalSets / totalSets) * 100 : 0

  const handleLogSet = async () => {
    if (!session || !currentExercise) return

    setIsLogging(true)
    try {
      const response = await sessionApi.logSet(session.id, {
        exerciseId: currentExercise.exerciseId,
        setNumber: completedSetsCount + 1,
        repsCompleted: reps,
        weightUsed: weight,
      })

      const newSet = response.data
      setExercises((prev) =>
        prev.map((e, i) =>
          i === currentExerciseIndex
            ? { ...e, completedSets: [...e.completedSets, newSet] }
            : e
        )
      )

      toast({
        title: 'Set logged!',
        description: `${reps} reps @ ${weight} kg`,
      })

      // Show rest timer
      setShowRestTimer(true)

      // Move to next exercise if all sets completed
      if (completedSetsCount + 1 >= currentExercise.targetSets) {
        if (currentExerciseIndex < exercises.length - 1) {
          const nextExercise = exercises[currentExerciseIndex + 1]
          setCurrentExerciseIndex(currentExerciseIndex + 1)
          setReps(nextExercise.targetReps)
          setWeight(nextExercise.targetWeight || 0)
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to log set',
        description: 'Something went wrong.',
      })
    } finally {
      setIsLogging(false)
    }
  }

  const handleFinishWorkout = async () => {
    if (!session) return

    try {
      await sessionApi.completeSession(session.id, {})
      setShowSummary(true)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to complete workout',
        description: 'Something went wrong.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) return null

  // Show empty state if no exercises
  if (exercises.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">
              {session.planDayName || session.template?.name || 'Workout'}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Timer className="h-4 w-4" />
              {formatDuration(duration)}
            </p>
          </div>
          <Button variant="destructive" onClick={handleFinishWorkout}>
            Finish Workout
          </Button>
        </div>
        <Card className="glass">
          <CardContent className="pt-6 text-center py-12">
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Exercises</h2>
            <p className="text-muted-foreground mb-4">
              This workout day doesn't have any exercises yet.
            </p>
            <Button onClick={handleFinishWorkout}>Complete Workout</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">
            {session.planDayName || session.template?.name || 'Workout'}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Timer className="h-4 w-4" />
            {formatDuration(duration)}
          </p>
        </div>
        <Button variant="destructive" onClick={handleFinishWorkout}>
          Finish Workout
        </Button>
      </div>

      {/* Progress */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium">
              {completedTotalSets} / {totalSets} sets
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Current Exercise */}
      <Card className="glass border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              {currentExercise.name}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sets Progress */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: currentExercise.targetSets }).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-8 rounded-full transition-colors ${i < completedSetsCount ? 'bg-primary' : 'bg-secondary'
                  }`}
              />
            ))}
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reps</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setReps((r) => Math.max(1, r - 1))}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                  className="text-center text-lg font-bold"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setReps((r) => r + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Weight (kg)</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeight((w) => Math.max(0, w - 2.5))}
                >
                  -
                </Button>
                <Input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="text-center text-lg font-bold"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeight((w) => w + 2.5)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Log Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleLogSet}
            disabled={isLogging || completedSetsCount >= currentExercise.targetSets}
          >
            {isLogging ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-5 w-5" />
            )}
            Log Set {completedSetsCount + 1}
          </Button>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">All Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {exercises.map((exercise, index) => (
              <div
                key={exercise.exerciseId}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${index === currentExerciseIndex
                  ? 'bg-primary/10 border border-primary/50'
                  : 'bg-secondary/30 hover:bg-secondary/50'
                  }`}
                onClick={() => {
                  setCurrentExerciseIndex(index)
                  setReps(exercise.targetReps)
                  setWeight(exercise.targetWeight || 0)
                }}
              >
                <span className={index === currentExerciseIndex ? 'font-medium' : ''}>
                  {exercise.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {exercise.completedSets.length}/{exercise.targetSets}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rest Timer */}
      {showRestTimer && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="glass w-80">
            <CardContent className="pt-6 text-center">
              <Timer className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Rest Time</h3>
              <p className="text-4xl font-mono font-bold text-primary mb-4">
                {restTime}s
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowRestTimer(false)
                  setRestTime(60)
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Skip Rest
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workout Summary */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            {/* Big celebration emoji */}
            <div className="text-6xl mb-4">💪</div>

            <h2 className="text-2xl font-bold text-primary mb-2">
              Great Job!
            </h2>
            <p className="text-muted-foreground mb-6">
              You crushed your workout today!
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-bold">{completedTotalSets}</p>
                <p className="text-xs text-muted-foreground">Sets</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-bold">{exercises.length}</p>
                <p className="text-xs text-muted-foreground">Exercises</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-bold">{formatDuration(duration)}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/analytics/workout')}>
                <Trophy className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

