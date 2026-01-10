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
  Plus,
  ChevronRight
} from 'lucide-react'
import type { WorkoutSession, WorkoutSet } from '@/types/session'

// Exercise state for tracking progress during workout
interface ExerciseState {
  exerciseId: number
  name: string
  targetSets: number
  targetReps: string
  restSeconds: number
  completedSets: WorkoutSet[]
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
  const REST_DURATION = 180
  const [restTime, setRestTime] = useState(REST_DURATION)

  // Logging inputs
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

      // Build exercise states from planDayExercises
      if (data.planDayExercises && data.planDayExercises.length > 0) {
        const exerciseStates: ExerciseState[] = data.planDayExercises.map((pe) => {
          const completedSets = (data.sets || []).filter((s) => s.exerciseId === pe.exerciseId)
          return {
            exerciseId: pe.exerciseId,
            name: pe.exerciseName,
            targetSets: pe.targetSets || 3,
            targetReps: pe.targetReps || '8-12',
            restSeconds: pe.restSeconds || REST_DURATION,
            completedSets
          }
        })
        setExercises(exerciseStates)
      } else if (data.template?.exercises) {
        // Fallback for template-based sessions
        const exerciseStates: ExerciseState[] = data.template.exercises.map((te) => {
          const completedSets = (data.sets || []).filter((s) => s.exerciseId === te.exercise!.id)
          return {
            exerciseId: te.exercise!.id,
            name: te.exercise!.name,
            targetSets: te.targetSets || 3,
            targetReps: String(te.targetReps || '8-12'),
            restSeconds: REST_DURATION,
            completedSets
          }
        })
        setExercises(exerciseStates)
      }
    } catch (error) {
      console.error('Failed to load session:', error)
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

  // Get current selected exercise
  const selectedExercise = exercises.find(e => e.exerciseId === selectedExerciseId)

  // Calculate stats
  const exercisesWithSets = exercises.filter(e => e.completedSets.length > 0)
  const completedExercisesCount = exercisesWithSets.length
  const totalSets = exercises.reduce((acc, e) => acc + e.completedSets.length, 0)

  // Check if exercise has at least one set logged
  const hasLoggedSet = (exerciseId: number) => {
    const ex = exercises.find(e => e.exerciseId === exerciseId)
    return ex && ex.completedSets.length > 0
  }

  // Start logging an exercise
  const handleStartExercise = (exerciseId: number) => {
    const exercise = exercises.find(e => e.exerciseId === exerciseId)
    if (!exercise) return

    setSelectedExerciseId(exerciseId)
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

      // Update local state with new set
      const newSet = response.data
      setExercises(prev => prev.map(ex => {
        if (ex.exerciseId === selectedExercise.exerciseId) {
          return {
            ...ex,
            completedSets: [...ex.completedSets, newSet]
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
      console.error('Failed to log set:', error)
      toast({
        variant: 'destructive',
        title: 'Failed to log set',
        description: 'Something went wrong.',
      })
    } finally {
      setIsLogging(false)
    }
  }

  // Skip rest timer
  const handleSkipRest = () => {
    setRestTime(REST_DURATION)
    setViewMode('logging')
  }

  // Go back to exercise list
  const handleBackToList = () => {
    setSelectedExerciseId(null)
    setViewMode('list')
  }

  // Finish current exercise
  const handleFinishExercise = () => {
    setSelectedExerciseId(null)
    setViewMode('list')
    toast({
      title: 'Exercise complete!',
      description: 'Great work! Select your next exercise.',
    })
  }

  // Finish entire workout
  const handleFinishWorkout = async () => {
    if (!session) return

    try {
      await sessionApi.completeSession(session.id, { notes: '' })
      setShowCelebration(true)
    } catch (error) {
      console.error('Failed to complete workout:', error)
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
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) return null

  // ========== VIEW: REST TIMER ==========
  if (viewMode === 'rest' && selectedExercise) {
    const restProgress = ((REST_DURATION - restTime) / REST_DURATION) * 100

    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Back button */}
        <Button variant="ghost" className="mb-4" onClick={handleBackToList}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Exercise List
        </Button>

        {/* Exercise name */}
        <div className="mb-6">
          <h1 className="text-xl font-bold">{selectedExercise.name}</h1>
          <p className="text-sm text-muted-foreground">
            Recommended: {selectedExercise.targetSets} sets of {selectedExercise.targetReps} reps
          </p>
        </div>

        {/* Rest Timer Card */}
        <Card className="glass mb-6">
          <CardContent className="pt-8 pb-8 text-center">
            <Timer className="h-12 w-12 mx-auto text-primary mb-4" />
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">⏱️ Rest Timer</p>
            <p className="text-6xl font-bold text-primary mb-4 font-mono">
              {formatRestTime(restTime)}
            </p>
            <Progress value={restProgress} className="h-2 mb-6" />

            <Button variant="outline" onClick={handleSkipRest}>
              <SkipForward className="h-4 w-4 mr-2" />
              Skip Rest
            </Button>
          </CardContent>
        </Card>

        {/* Completed sets */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Completed Sets</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedExercise.completedSets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sets completed yet</p>
            ) : (
              <div className="space-y-2">
                {selectedExercise.completedSets.map((set, i) => (
                  <div key={set.id} className="flex items-center gap-3 p-2 bg-primary/10 rounded">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="font-medium">Set {i + 1}:</span>
                    <span className="text-muted-foreground">{set.repsCompleted} reps @ {set.weightUsed} lbs</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Another Set button */}
        <Button className="w-full" size="lg" onClick={handleSkipRest}>
          <Plus className="h-4 w-4 mr-2" />
          Add Another Set
        </Button>
      </div>
    )
  }

  // ========== VIEW: EXERCISE LOGGING ==========
  if (viewMode === 'logging' && selectedExercise) {
    const currentSetNumber = selectedExercise.completedSets.length + 1

    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Back button */}
        <Button variant="ghost" className="mb-4" onClick={handleBackToList}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Exercise List
        </Button>

        {/* Exercise header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{selectedExercise.name}</h1>
          <p className="text-muted-foreground">
            Recommended: {selectedExercise.targetSets} sets of {selectedExercise.targetReps} reps
          </p>
        </div>

        {/* Log Set Card */}
        <Card className="glass border-primary/50 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              📝 LOG SET {currentSetNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reps</label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                className="text-lg h-12"
                placeholder="Enter reps"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Weight (lbs)</label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="text-lg h-12"
                placeholder="Enter weight"
              />
            </div>

            <Button
              className="w-full h-12"
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
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Completed Sets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedExercise.completedSets.map((set, i) => (
                  <div key={set.id} className="flex items-center gap-3 p-2 bg-primary/10 rounded">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="font-medium">Set {i + 1}:</span>
                    <span className="text-muted-foreground">{set.repsCompleted} reps @ {set.weightUsed} lbs</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Finish Exercise button (only show if at least 1 set logged) */}
        {selectedExercise.completedSets.length > 0 && (
          <Button variant="outline" className="w-full" onClick={handleFinishExercise}>
            Finish Exercise
          </Button>
        )}
      </div>
    )
  }

  // ========== VIEW: EXERCISE LIST (DEFAULT) ==========
  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Active Workout: {session.planDayName || session.template?.name || 'Workout'}
        </h1>
        <p className="text-muted-foreground">
          Progress: {completedExercisesCount}/{exercises.length} exercises completed
        </p>
        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
          <Timer className="h-4 w-4" />
          {formatDuration(duration)} elapsed
        </p>
      </div>

      {/* Exercise List */}
      <div className="space-y-4 mb-8">
        {exercises.map((exercise, index) => {
          const setsCompleted = exercise.completedSets.length
          const hasStarted = setsCompleted > 0

          return (
            <Card
              key={exercise.exerciseId}
              className={`transition-all cursor-pointer ${hasStarted ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'
                }`}
              onClick={() => handleStartExercise(exercise.exerciseId)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${hasStarted ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}>
                    {hasStarted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Dumbbell className="h-5 w-5" />
                    )}
                  </div>

                  {/* Exercise info */}
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {hasStarted && '✓ '}{exercise.name}
                      {hasStarted && <span className="text-sm font-normal text-muted-foreground ml-2">({setsCompleted} sets completed)</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Recommended: {exercise.targetSets} sets of {exercise.targetReps} reps
                    </p>

                    {/* Start/Continue button */}
                    {!hasStarted ? (
                      <Button size="sm" className="mt-3">
                        <Play className="h-4 w-4 mr-2" />
                        Start Exercise
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="mt-3">
                        <Plus className="h-4 w-4 mr-2" />
                        Add More Sets
                      </Button>
                    )}
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Finish Workout Button */}
      <Button
        className="w-full h-14 text-lg"
        size="lg"
        onClick={handleFinishWorkout}
        disabled={completedExercisesCount === 0}
      >
        <Trophy className="h-5 w-5 mr-2" />
        Finish Workout
      </Button>

      {completedExercisesCount === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          Complete at least one exercise to finish your workout
        </p>
      )}

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
                <p className="text-2xl font-bold">{totalSets}</p>
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
