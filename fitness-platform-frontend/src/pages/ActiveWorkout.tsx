import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { sessionApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { formatDuration } from '@/lib/utils'
import {
  Loader2,
  Check,
  Timer,
  Dumbbell,
  Trophy,
  ArrowLeft,
  Play,
  SkipForward,
  Plus
} from 'lucide-react'
import type { WorkoutSession, WorkoutSet } from '@/types/session'

// Exercise state for tracking progress
interface ExerciseState {
  exerciseId: number
  name: string
  targetSets: number
  targetReps: string  // Can be "8-12" or "10"
  restSeconds: number
  completedSets: WorkoutSet[]
  isComplete: boolean
}

// View modes for the workout session
type ViewMode = 'list' | 'logging' | 'rest'

export default function ActiveWorkout() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Core state
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [exercises, setExercises] = useState<ExerciseState[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [duration, setDuration] = useState(0)

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null)

  // Rest timer state (180 seconds = 3 minutes)
  const [restTime, setRestTime] = useState(180)
  const REST_DURATION = 180

  // Logging state
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState(0)
  const [isLogging, setIsLogging] = useState(false)

  // Celebration modal
  const [showCelebration, setShowCelebration] = useState(false)

  // Fetch session data
  const fetchSession = useCallback(async () => {
    if (!sessionId) return
    try {
      const response = await sessionApi.getSession(parseInt(sessionId))
      const data: WorkoutSession = response.data
      setSession(data)

      // Handle plan-based sessions
      if (data.planDayExercises && data.planDayExercises.length > 0) {
        const exerciseStates: ExerciseState[] = data.planDayExercises.map((pe) => {
          const completedSets = data.sets.filter((s) => s.exerciseId === pe.exerciseId)
          return {
            exerciseId: pe.exerciseId,
            name: pe.exerciseName,
            targetSets: pe.targetSets || 3,
            targetReps: pe.targetReps || '8-12',
            restSeconds: pe.restSeconds || 180,
            completedSets,
            isComplete: completedSets.length >= (pe.targetSets || 3)
          }
        })
        setExercises(exerciseStates)
      } else if (data.template?.exercises) {
        // Handle template-based sessions (legacy)
        const exerciseStates: ExerciseState[] = data.template.exercises.map((te) => {
          const completedSets = data.sets.filter((s) => s.exerciseId === te.exercise!.id)
          return {
            exerciseId: te.exercise!.id,
            name: te.exercise!.name,
            targetSets: te.targetSets || 3,
            targetReps: String(te.targetReps || '8-12'),
            restSeconds: 180,
            completedSets,
            isComplete: completedSets.length >= (te.targetSets || 3)
          }
        })
        setExercises(exerciseStates)
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

  // Rest timer countdown
  useEffect(() => {
    if (viewMode === 'rest' && restTime > 0) {
      const timer = setTimeout(() => setRestTime((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [viewMode, restTime])

  // Get selected exercise
  const selectedExercise = exercises.find(e => e.exerciseId === selectedExerciseId)

  // Calculate progress
  const completedExercisesCount = exercises.filter(e => e.isComplete).length
  const totalSets = exercises.reduce((acc, e) => acc + e.targetSets, 0)
  const completedTotalSets = exercises.reduce((acc, e) => acc + e.completedSets.length, 0)
  const progress = totalSets > 0 ? (completedTotalSets / totalSets) * 100 : 0

  // Start logging an exercise
  const handleStartExercise = (exerciseId: number) => {
    const exercise = exercises.find(e => e.exerciseId === exerciseId)
    if (!exercise) return

    setSelectedExerciseId(exerciseId)
    // Set default reps from target
    const defaultReps = parseInt(exercise.targetReps.split('-')[0]) || 10
    setReps(defaultReps)
    setViewMode('logging')
  }

  // Log a completed set
  const handleCompleteSet = async () => {
    if (!session || !selectedExercise) return

    setIsLogging(true)
    try {
      const setNumber = selectedExercise.completedSets.length + 1
      const response = await sessionApi.logSet(session.id, {
        exerciseId: selectedExercise.exerciseId,
        setNumber,
        repsCompleted: reps,
        weightUsed: weight,
      })

      // Update local state
      const newSet = response.data
      setExercises(prev => prev.map(ex => {
        if (ex.exerciseId === selectedExercise.exerciseId) {
          const newCompletedSets = [...ex.completedSets, newSet]
          return {
            ...ex,
            completedSets: newCompletedSets,
            isComplete: newCompletedSets.length >= ex.targetSets
          }
        }
        return ex
      }))

      // Start rest timer
      setRestTime(REST_DURATION)
      setViewMode('rest')

      toast({
        title: 'Set logged!',
        description: `Set ${setNumber}: ${reps} reps @ ${weight} lbs`,
      })
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

  // Skip rest and add another set
  const handleSkipRest = () => {
    setRestTime(REST_DURATION)
    setViewMode('logging')
  }

  // Finish current exercise and go back to list
  const handleFinishExercise = () => {
    setSelectedExerciseId(null)
    setViewMode('list')
  }

  // Finish entire workout
  const handleFinishWorkout = async () => {
    if (!session) return

    try {
      await sessionApi.completeSession(session.id, { notes: '' })
      setShowCelebration(true)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to complete workout',
        description: 'Something went wrong.',
      })
    }
  }

  // Format rest time as MM:SS
  const formatRestTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) return null

  // ========== RENDER: REST TIMER VIEW ==========
  if (viewMode === 'rest' && selectedExercise) {
    const restProgress = ((REST_DURATION - restTime) / REST_DURATION) * 100

    return (
      <div className="max-w-lg mx-auto space-y-6 px-4">
        <Card className="glass">
          <CardContent className="pt-8 pb-8 text-center">
            <Timer className="h-12 w-12 mx-auto text-primary mb-4" />
            <p className="text-sm text-muted-foreground mb-2">REST</p>
            <p className="text-6xl font-bold text-primary mb-4">
              {formatRestTime(restTime)}
            </p>
            <Progress value={restProgress} className="h-2 mb-6" />

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleSkipRest}>
                <SkipForward className="h-4 w-4 mr-2" />
                Skip
              </Button>
              <Button onClick={handleSkipRest}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another Set
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Completed sets for current exercise */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{selectedExercise.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedExercise.completedSets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sets completed yet</p>
            ) : (
              <div className="space-y-2">
                {selectedExercise.completedSets.map((set, i) => (
                  <div key={set.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Set {i + 1}</span>
                    <span className="font-medium">{set.repsCompleted} reps @ {set.weightUsed} lbs</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" onClick={handleFinishExercise}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Exercise List
        </Button>
      </div>
    )
  }

  // ========== RENDER: EXERCISE LOGGING VIEW ==========
  if (viewMode === 'logging' && selectedExercise) {
    const currentSetNumber = selectedExercise.completedSets.length + 1

    return (
      <div className="max-w-lg mx-auto space-y-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleFinishExercise}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{selectedExercise.name}</h1>
            <p className="text-sm text-muted-foreground">
              Recommended: {selectedExercise.targetSets} sets of {selectedExercise.targetReps} reps
            </p>
          </div>
        </div>

        {/* Current Set Input */}
        <Card className="glass border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Set {currentSetNumber}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reps</label>
                <Input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                  className="text-center text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (lbs)</label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="text-center text-lg"
                />
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCompleteSet}
              disabled={isLogging}
            >
              {isLogging ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Complete Set
            </Button>
          </CardContent>
        </Card>

        {/* Completed Sets */}
        {selectedExercise.completedSets.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Completed Sets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedExercise.completedSets.map((set, i) => (
                  <div key={set.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="font-medium">Set {i + 1}</span>
                    <span className="text-muted-foreground">{set.repsCompleted} reps @ {set.weightUsed} lbs</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Finish Exercise Button */}
        {selectedExercise.completedSets.length > 0 && (
          <Button variant="outline" className="w-full" onClick={handleFinishExercise}>
            Finish Exercise
          </Button>
        )}
      </div>
    )
  }

  // ========== RENDER: EXERCISE LIST VIEW (DEFAULT) ==========
  return (
    <div className="max-w-lg mx-auto space-y-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {session.planDayName || session.template?.name || 'Workout'}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Timer className="h-4 w-4" />
            {formatDuration(duration)} • {completedExercisesCount}/{exercises.length} complete
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="glass">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{completedTotalSets}/{totalSets} sets</span>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Exercise List */}
      <div className="space-y-3">
        {exercises.map((exercise) => {
          const isComplete = exercise.isComplete
          const setsCompleted = exercise.completedSets.length

          return (
            <Card
              key={exercise.exerciseId}
              className={`cursor-pointer transition-all ${isComplete
                  ? 'bg-primary/10 border-primary/30'
                  : 'hover:border-primary/50'
                }`}
              onClick={() => !isComplete && handleStartExercise(exercise.exerciseId)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                      {isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : setsCompleted > 0 ? (
                        <span className="text-sm font-medium">{setsCompleted}</span>
                      ) : (
                        <Dumbbell className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${isComplete ? 'line-through text-muted-foreground' : ''}`}>
                        {exercise.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.targetSets} sets of {exercise.targetReps} reps
                      </p>
                    </div>
                  </div>

                  {!isComplete && (
                    <Button size="sm" variant="ghost">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Show completed sets preview */}
                {setsCompleted > 0 && !isComplete && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      {setsCompleted}/{exercise.targetSets} sets completed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Finish Workout Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleFinishWorkout}
      >
        <Trophy className="h-4 w-4 mr-2" />
        Finish Workout
      </Button>

      {/* Celebration Modal */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="text-7xl mb-4">💪</div>

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
                <p className="text-2xl font-bold">{completedExercisesCount}</p>
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
