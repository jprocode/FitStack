import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { workoutPlanApi, exerciseApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    GripVertical,
    Calendar,
    ListOrdered,
    Dumbbell,
} from 'lucide-react'

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

interface Exercise {
    id: number
    name: string
    muscleGroup: string
}

interface PlanDayExercise {
    exerciseId: number
    exerciseName?: string
    targetSets?: number
    targetReps?: string
    restSeconds?: number
}

interface PlanDay {
    id?: number
    dayIdentifier: string
    name: string
    orderIndex: number
    exercises: PlanDayExercise[]
}

export default function WorkoutPlanBuilder() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { toast } = useToast()
    const isEditing = !!id

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [planType, setPlanType] = useState<'WEEKLY' | 'NUMBERED'>('WEEKLY')
    const [days, setDays] = useState<PlanDay[]>([])
    const [saving, setSaving] = useState(false)
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [addDayDialogOpen, setAddDayDialogOpen] = useState(false)
    const [newDayIdentifier, setNewDayIdentifier] = useState('')
    const [newDayName, setNewDayName] = useState('')
    // Searchable exercise inputs per day
    const [exerciseSearchQuery, setExerciseSearchQuery] = useState<Record<number, string>>({})
    const [showExerciseDropdown, setShowExerciseDropdown] = useState<Record<number, boolean>>({})
    const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({})

    // Click outside handler to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            Object.entries(dropdownRefs.current).forEach(([dayIndex, ref]) => {
                if (ref && !ref.contains(event.target as Node)) {
                    setShowExerciseDropdown(prev => ({ ...prev, [parseInt(dayIndex)]: false }))
                }
            })
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch exercises
    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const response = await exerciseApi.getExercises()
                // Handle paginated response - extract content array
                const exercisesData = response.data.content || response.data
                setExercises(Array.isArray(exercisesData) ? exercisesData : [])
            } catch (error) {
                console.error('Failed to fetch exercises:', error)
            }
        }
        fetchExercises()
    }, [])

    // Fetch existing plan if editing
    useEffect(() => {
        if (isEditing && id) {
            const fetchPlan = async () => {
                try {
                    const response = await workoutPlanApi.getPlan(parseInt(id))
                    const plan = response.data
                    setName(plan.name)
                    setDescription(plan.description || '')
                    setPlanType(plan.planType)
                    setDays(plan.days || [])
                } catch (error) {
                    console.error('Failed to fetch plan:', error)
                    toast({
                        title: 'Error',
                        description: 'Failed to load plan',
                        variant: 'destructive',
                    })
                    navigate('/plans')
                }
            }
            fetchPlan()
        }
    }, [id, isEditing, navigate, toast])

    const handleAddDay = () => {
        if (!newDayIdentifier) return

        const newDay: PlanDay = {
            dayIdentifier: newDayIdentifier,
            name: newDayName,
            orderIndex: days.length,
            exercises: [],
        }

        setDays([...days, newDay])
        setNewDayIdentifier('')
        setNewDayName('')
        setAddDayDialogOpen(false)
    }

    const handleRemoveDay = (index: number) => {
        setDays(days.filter((_, i) => i !== index))
    }

    const handleAddExerciseToDay = (dayIndex: number, exerciseId: number) => {
        const exercise = exercises.find(e => e.id === exerciseId)
        if (!exercise) return

        const newDays = [...days]
        newDays[dayIndex].exercises.push({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            targetSets: 3,
            targetReps: '8-12',
            restSeconds: 180,
        })
        setDays(newDays)
        // Clear search
        setExerciseSearchQuery(prev => ({ ...prev, [dayIndex]: '' }))
        setShowExerciseDropdown(prev => ({ ...prev, [dayIndex]: false }))
    }

    // Get filtered exercises for a day based on search query
    const getFilteredExercises = (dayIndex: number) => {
        const query = (exerciseSearchQuery[dayIndex] || '').toLowerCase()
        if (!query) return exercises
        return exercises.filter(ex =>
            ex.name.toLowerCase().includes(query) ||
            ex.muscleGroup.toLowerCase().includes(query)
        )
    }

    const handleRemoveExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
        const newDays = [...days]
        newDays[dayIndex].exercises.splice(exerciseIndex, 1)
        setDays(newDays)
    }

    const handleSave = async () => {
        if (!name.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a plan name',
                variant: 'destructive',
            })
            return
        }

        setSaving(true)
        try {
            const planData = {
                name,
                description,
                planType,
                days: days.map((day, index) => ({
                    dayIdentifier: day.dayIdentifier,
                    name: day.name,
                    orderIndex: index,
                    exercises: day.exercises.map((ex, exIndex) => ({
                        exerciseId: ex.exerciseId,
                        orderIndex: exIndex,
                        targetSets: ex.targetSets,
                        targetReps: ex.targetReps,
                        restSeconds: ex.restSeconds,
                    })),
                })),
            }

            if (isEditing && id) {
                await workoutPlanApi.updatePlan(parseInt(id), planData)
                toast({
                    title: 'Plan updated',
                    description: 'Your workout plan has been saved.',
                })
            } else {
                await workoutPlanApi.createPlan(planData)
                toast({
                    title: 'Plan created',
                    description: 'Your workout plan has been created.',
                })
            }

            navigate('/plans')
        } catch (error) {
            console.error('Failed to save plan:', error)
            toast({
                title: 'Error',
                description: 'Failed to save plan',
                variant: 'destructive',
            })
        } finally {
            setSaving(false)
        }
    }

    const formatDayLabel = (identifier: string) => {
        if (planType === 'WEEKLY') {
            return identifier.charAt(0) + identifier.slice(1).toLowerCase()
        }
        return `Day ${identifier}`
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate('/plans')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit Workout Plan' : 'Create Workout Plan'}
                    </h1>
                    <p className="text-muted-foreground">
                        Build your multi-day workout program
                    </p>
                </div>
            </div>

            {/* Plan Info */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Plan Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Plan Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Push Pull Legs"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your workout plan..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Plan Type</Label>
                        <Select value={planType} onValueChange={(v: 'WEEKLY' | 'NUMBERED') => setPlanType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WEEKLY">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Weekly (Mon-Sun)
                                    </div>
                                </SelectItem>
                                <SelectItem value="NUMBERED">
                                    <div className="flex items-center">
                                        <ListOrdered className="h-4 w-4 mr-2" />
                                        Numbered (Day 1, 2, 3...)
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Days */}
            <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Workout Days</h2>
                    <Dialog open={addDayDialogOpen} onOpenChange={setAddDayDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Day
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Workout Day</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Day</Label>
                                    {planType === 'WEEKLY' ? (
                                        <Select value={newDayIdentifier} onValueChange={setNewDayIdentifier}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select day" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {WEEKDAYS.filter(d => !days.some(day => day.dayIdentifier === d)).map(day => (
                                                    <SelectItem key={day} value={day}>
                                                        {day.charAt(0) + day.slice(1).toLowerCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            type="number"
                                            placeholder="Day number"
                                            value={newDayIdentifier}
                                            onChange={(e) => setNewDayIdentifier(e.target.value)}
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Custom Name (optional)</Label>
                                    <Input
                                        placeholder="e.g. Push Day, Leg Day"
                                        value={newDayName}
                                        onChange={(e) => setNewDayName(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleAddDay} className="w-full">
                                    Add Day
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {days.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <Dumbbell className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground text-center">
                                No days added yet. Click "Add Day" to get started.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    days.map((day, dayIndex) => (
                        <Card key={dayIndex}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base">
                                            {day.name || formatDayLabel(day.dayIdentifier)}
                                        </CardTitle>
                                        {day.name && (
                                            <span className="text-sm text-muted-foreground">
                                                ({formatDayLabel(day.dayIdentifier)})
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveDay(dayIndex)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Exercises in day */}
                                {day.exercises.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-2">
                                        No exercises yet
                                    </p>
                                ) : (
                                    <div className="space-y-2 mb-4">
                                        {day.exercises.map((ex, exIndex) => (
                                            <div
                                                key={exIndex}
                                                className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                            >
                                                <span className="font-medium">{ex.exerciseName}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">
                                                        {ex.targetSets} × {ex.targetReps}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => handleRemoveExerciseFromDay(dayIndex, exIndex)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add exercise - Searchable */}
                                <div className="relative" ref={(el) => { dropdownRefs.current[dayIndex] = el }}>
                                    <Input
                                        placeholder="🔍 Search exercises..."
                                        value={exerciseSearchQuery[dayIndex] || ''}
                                        onChange={(e) => {
                                            setExerciseSearchQuery(prev => ({ ...prev, [dayIndex]: e.target.value }))
                                            setShowExerciseDropdown(prev => ({ ...prev, [dayIndex]: true }))
                                        }}
                                        onFocus={() => setShowExerciseDropdown(prev => ({ ...prev, [dayIndex]: true }))}
                                    />
                                    {showExerciseDropdown[dayIndex] && (
                                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                                            {getFilteredExercises(dayIndex).length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground">No exercises found</div>
                                            ) : (
                                                getFilteredExercises(dayIndex).slice(0, 10).map(ex => (
                                                    <div
                                                        key={ex.id}
                                                        className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                                                        onClick={() => handleAddExerciseToDay(dayIndex, ex.id)}
                                                    >
                                                        <span>{ex.name}</span>
                                                        <span className="text-xs text-muted-foreground">{ex.muscleGroup}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate('/plans')}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Plan'}
                </Button>
            </div>
        </div>
    )
}
