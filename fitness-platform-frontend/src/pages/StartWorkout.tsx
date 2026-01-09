import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workoutPlanApi, sessionApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
    Play,
    Calendar,
    Dumbbell,
    ListOrdered,
    Clock,
    Target,
    Loader2,
    Coffee,
    ChevronRight
} from 'lucide-react'
import type { TodaysWorkout, WorkoutPlanDay } from '@/types/workout'

export default function StartWorkout() {
    const navigate = useNavigate()
    const { toast } = useToast()

    const [todaysWorkout, setTodaysWorkout] = useState<TodaysWorkout | null>(null)
    const [selectedDayId, setSelectedDayId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState(false)
    const [noPrimaryPlan, setNoPrimaryPlan] = useState(false)

    useEffect(() => {
        fetchTodaysWorkout()
    }, [])

    const fetchTodaysWorkout = async () => {
        setLoading(true)
        try {
            const response = await workoutPlanApi.getTodaysWorkout()
            setTodaysWorkout(response.data)
            if (response.data.workoutDay) {
                setSelectedDayId(response.data.workoutDay.id)
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                setNoPrimaryPlan(true)
            } else {
                console.error('Failed to fetch today\'s workout:', error)
                toast({
                    title: 'Error',
                    description: 'Failed to load today\'s workout',
                    variant: 'destructive',
                })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleStartWorkout = async () => {
        if (!selectedDayId) {
            toast({
                title: 'Select a workout',
                description: 'Please select a workout day to start',
                variant: 'destructive',
            })
            return
        }

        setStarting(true)
        try {
            const response = await sessionApi.startFromPlan(selectedDayId)
            toast({
                title: 'Workout started!',
                description: 'Let\'s crush it! 💪',
            })
            navigate(`/workout/${response.data.id}`)
        } catch (error) {
            console.error('Failed to start workout:', error)
            toast({
                title: 'Error',
                description: 'Failed to start workout session',
                variant: 'destructive',
            })
        } finally {
            setStarting(false)
        }
    }

    const handleDayChange = (dayId: string) => {
        setSelectedDayId(parseInt(dayId))
    }

    const getSelectedDay = (): WorkoutPlanDay | null => {
        if (!todaysWorkout || !selectedDayId) return null
        return todaysWorkout.allDays.find(d => d.id === selectedDayId) || null
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (noPrimaryPlan) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card className="glass">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-bold mb-2">No Primary Plan Set</h2>
                        <p className="text-muted-foreground text-center mb-6 max-w-md">
                            To use the Start Workout feature, you need to set one of your workout plans as your primary plan.
                        </p>
                        <Button onClick={() => navigate('/plans')}>
                            <ListOrdered className="mr-2 h-4 w-4" />
                            Go to Workout Plans
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!todaysWorkout) return null

    const selectedDay = getSelectedDay()

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Play className="h-8 w-8 text-primary" />
                    Start Workout
                </h1>
                <p className="text-muted-foreground">
                    Ready to crush your workout? Let's go!
                </p>
            </div>

            {/* Plan Info Card */}
            <Card className="glass mb-6">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">{todaysWorkout.planName}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                {todaysWorkout.planType === 'WEEKLY' ? (
                                    <Calendar className="h-4 w-4" />
                                ) : (
                                    <ListOrdered className="h-4 w-4" />
                                )}
                                {todaysWorkout.planType === 'WEEKLY' ? 'Weekly Plan' : 'Numbered Plan'}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-lg px-4 py-1">
                            {todaysWorkout.dayLabel}
                        </Badge>
                    </div>
                </CardHeader>
                {todaysWorkout.planType === 'NUMBERED' && todaysWorkout.lastCompletedDay !== undefined && (
                    <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">
                            Last completed: Day {todaysWorkout.lastCompletedDay || 'None'}
                        </p>
                    </CardContent>
                )}
            </Card>

            {/* Rest Day Message */}
            {todaysWorkout.isRestDay && !selectedDayId && (
                <Card className="glass mb-6 border-amber-500/50">
                    <CardContent className="flex items-center gap-4 py-6">
                        <div className="p-3 bg-amber-500/10 rounded-full">
                            <Coffee className="h-8 w-8 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Rest Day</h3>
                            <p className="text-muted-foreground">
                                No workout scheduled for {todaysWorkout.dayLabel}. Take it easy or select a different day below!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Day Selector */}
            <Card className="glass mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Select Workout Day</CardTitle>
                    <CardDescription>
                        {todaysWorkout.isRestDay
                            ? 'Choose a workout to do today instead'
                            : 'Change if you want to do a different day'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedDayId?.toString() || ''} onValueChange={handleDayChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a workout day" />
                        </SelectTrigger>
                        <SelectContent>
                            {todaysWorkout.allDays.map((day) => (
                                <SelectItem key={day.id} value={day.id.toString()}>
                                    {day.name || (todaysWorkout.planType === 'WEEKLY'
                                        ? day.dayIdentifier.charAt(0) + day.dayIdentifier.slice(1).toLowerCase()
                                        : `Day ${day.dayIdentifier}`)}
                                    {' '}({day.exercises.length} exercises)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Exercise Preview */}
            {selectedDay && (
                <Card className="glass mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="h-5 w-5 text-primary" />
                            Today's Exercises
                        </CardTitle>
                        <CardDescription>
                            {selectedDay.exercises.length} exercises to complete
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {selectedDay.exercises.map((exercise, index) => (
                                <div
                                    key={exercise.id}
                                    className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium text-primary">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{exercise.exerciseName}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Dumbbell className="h-3 w-3" />
                                                {exercise.targetSets} sets × {exercise.targetReps} reps
                                            </span>
                                            {exercise.restSeconds && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {exercise.restSeconds}s rest
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Start Button */}
            <Button
                size="lg"
                className="w-full py-6 text-lg"
                onClick={handleStartWorkout}
                disabled={!selectedDayId || starting}
            >
                {starting ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Starting...
                    </>
                ) : (
                    <>
                        <Play className="mr-2 h-5 w-5" />
                        Start Workout
                    </>
                )}
            </Button>
        </div>
    )
}
