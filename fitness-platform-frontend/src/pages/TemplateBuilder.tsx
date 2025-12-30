import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { templateApi, exerciseApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, Trash2, GripVertical, Search, Dumbbell } from 'lucide-react'
import type { Exercise, CreateTemplateRequest } from '@/types/workout'

interface SelectedExercise {
  exerciseId: number
  exercise: Exercise
  targetSets: number
  targetReps: number
  targetWeight?: number
  notes?: string
}

export default function TemplateBuilder() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([])
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)

  // Exercise selector state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (isEditing && id) {
      const fetchTemplate = async () => {
        try {
          const response = await templateApi.getTemplate(parseInt(id))
          const template = response.data
          setName(template.name)
          setDescription(template.description || '')
          setSelectedExercises(
            template.exercises.map((te: { exerciseId: number; exercise: Exercise; targetSets: number; targetReps: number; targetWeight?: number; notes?: string }) => ({
              exerciseId: te.exerciseId,
              exercise: te.exercise!,
              targetSets: te.targetSets,
              targetReps: te.targetReps,
              targetWeight: te.targetWeight,
              notes: te.notes,
            }))
          )
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Failed to load template',
            description: 'The template could not be found.',
          })
          navigate('/templates')
        } finally {
          setIsLoading(false)
        }
      }
      fetchTemplate()
    }
  }, [id, isEditing, navigate, toast])

  const searchExercises = async (term: string) => {
    setIsSearching(true)
    try {
      const response = await exerciseApi.getExercises({ search: term || undefined })
      setExercises(response.data.content || [])
    } catch (error) {
      console.error('Failed to search exercises:', error)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchExercises(searchTerm)
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm])

  const addExercise = (exercise: Exercise) => {
    if (selectedExercises.some((e) => e.exerciseId === exercise.id)) {
      toast({
        title: 'Already added',
        description: 'This exercise is already in your template.',
      })
      return
    }
    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId: exercise.id,
        exercise,
        targetSets: 3,
        targetReps: 10,
      },
    ])
    setIsDialogOpen(false)
  }

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: string, value: number | string) => {
    setSelectedExercises(
      selectedExercises.map((e, i) =>
        i === index ? { ...e, [field]: value } : e
      )
    )
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter a template name.',
      })
      return
    }

    if (selectedExercises.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No exercises',
        description: 'Please add at least one exercise.',
      })
      return
    }

    setIsSaving(true)
    try {
      const request: CreateTemplateRequest = {
        name,
        description: description || undefined,
        exercises: selectedExercises.map((e, i) => ({
          exerciseId: e.exerciseId,
          orderIndex: i,
          targetSets: e.targetSets,
          targetReps: e.targetReps,
          targetWeight: e.targetWeight,
          notes: e.notes,
        })),
      }

      if (isEditing && id) {
        await templateApi.updateTemplate(parseInt(id), request)
        toast({
          title: 'Template updated',
          description: 'Your changes have been saved.',
        })
      } else {
        await templateApi.createTemplate(request)
        toast({
          title: 'Template created',
          description: 'Your new template is ready to use.',
        })
      }
      navigate('/templates')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to save',
        description: 'Something went wrong.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">
          {isEditing ? 'Edit Template' : 'Create Template'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Build your custom workout routine
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Push Day, Full Body, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Exercises ({selectedExercises.length})</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Exercise</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {isSearching ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer"
                        onClick={() => addExercise(exercise)}
                      >
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exercise.muscleGroup} • {exercise.equipment}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {selectedExercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No exercises added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedExercises.map((item, index) => (
                <div
                  key={`${item.exerciseId}-${index}`}
                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{item.exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.exercise.muscleGroup}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExercise(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Sets</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.targetSets}
                          onChange={(e) =>
                            updateExercise(index, 'targetSets', parseInt(e.target.value) || 1)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Reps</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.targetReps}
                          onChange={(e) =>
                            updateExercise(index, 'targetReps', parseInt(e.target.value) || 1)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Weight (kg)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
                          value={item.targetWeight || ''}
                          onChange={(e) =>
                            updateExercise(index, 'targetWeight', parseFloat(e.target.value) || 0)
                          }
                          placeholder="—"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={() => navigate('/templates')}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Create Template'}
        </Button>
      </div>
    </div>
  )
}

