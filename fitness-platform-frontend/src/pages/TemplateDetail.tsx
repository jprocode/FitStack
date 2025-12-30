import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { templateApi, sessionApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { Loader2, Play, Edit, ArrowLeft, Dumbbell } from 'lucide-react'
import type { WorkoutTemplate } from '@/types/workout'

export default function TemplateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return
      try {
        const response = await templateApi.getTemplate(parseInt(id))
        setTemplate(response.data)
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Template not found',
          description: 'The template could not be loaded.',
        })
        navigate('/templates')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTemplate()
  }, [id, navigate, toast])

  const handleStartWorkout = async () => {
    if (!template) return
    try {
      const response = await sessionApi.startSession({ templateId: template.id })
      const session = response.data
      toast({
        title: 'Workout started!',
        description: 'Let\'s get those gains!',
      })
      navigate(`/workout/${session.id}`)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to start workout',
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

  if (!template) return null

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/templates')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold">{template.name}</h1>
          {template.description && (
            <p className="text-muted-foreground mt-1">{template.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/templates/${template.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button onClick={handleStartWorkout}>
            <Play className="mr-2 h-4 w-4" />
            Start Workout
          </Button>
        </div>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Exercises ({template.exercises.length})</CardTitle>
          <CardDescription>
            Created {formatDate(template.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {template.exercises.map((te, index) => (
              <div
                key={te.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    <span className="font-medium">{te.exercise?.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {te.exercise?.muscleGroup} • {te.exercise?.equipment}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {te.targetSets} × {te.targetReps}
                  </p>
                  {te.targetWeight && (
                    <p className="text-sm text-muted-foreground">
                      {te.targetWeight} kg
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

