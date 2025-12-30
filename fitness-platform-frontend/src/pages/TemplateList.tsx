import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { templateApi, sessionApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, Play, Edit, Trash2, ListTodo, Dumbbell } from 'lucide-react'
import type { WorkoutTemplate } from '@/types/workout'

export default function TemplateList() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchTemplates = async () => {
    try {
      const response = await templateApi.getTemplates()
      setTemplates(response.data)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleStartWorkout = async (templateId: number) => {
    try {
      const response = await sessionApi.startSession({ templateId })
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

  const handleDelete = async (id: number) => {
    try {
      await templateApi.deleteTemplate(id)
      toast({
        title: 'Template deleted',
        description: 'The template has been removed.',
      })
      fetchTemplates()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Failed to delete the template.',
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Workout Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage your workout routines
          </p>
        </div>
        <Link to="/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first workout template to get started
            </p>
            <Link to="/templates/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="glass">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.exercises.length} exercises
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/templates/${template.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                  </p>
                )}
                <div className="space-y-2 mb-4">
                  {template.exercises.slice(0, 3).map((te) => (
                    <div key={te.id} className="flex items-center gap-2 text-sm">
                      <Dumbbell className="h-3 w-3 text-primary" />
                      <span className="truncate">{te.exercise?.name}</span>
                      <span className="text-muted-foreground">
                        {te.targetSets}x{te.targetReps}
                      </span>
                    </div>
                  ))}
                  {template.exercises.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{template.exercises.length - 3} more exercises
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleStartWorkout(template.id)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Workout
                  </Button>
                  <Link to={`/templates/${template.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

