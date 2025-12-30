import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { goalsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { Loader2, Plus, Target, Trash2, CheckCircle, XCircle } from 'lucide-react'
import type { Goal, GoalStatus, GoalType } from '@/types/metrics'

const goalSchema = z.object({
  goalType: z.enum(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE']),
  targetWeight: z.coerce.number().min(20).max(500).optional().or(z.literal('')),
  targetDate: z.string().optional(),
})

type GoalForm = z.infer<typeof goalSchema>

const goalTypeLabels: Record<GoalType, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTENANCE: 'Maintenance',
}

const goalStatusLabels: Record<GoalStatus, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ABANDONED: 'Abandoned',
}

const goalStatusColors: Record<GoalStatus, string> = {
  ACTIVE: 'bg-primary/10 text-primary',
  COMPLETED: 'bg-green-500/10 text-green-500',
  ABANDONED: 'bg-destructive/10 text-destructive',
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
  })

  const fetchGoals = async () => {
    try {
      const response = await goalsApi.getGoals()
      setGoals(response.data)
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const onSubmit = async (data: GoalForm) => {
    setIsSaving(true)
    try {
      await goalsApi.createGoal({
        goalType: data.goalType,
        targetWeight: data.targetWeight || null,
        targetDate: data.targetDate || null,
      })
      toast({
        title: 'Goal created',
        description: 'Your new fitness goal has been set.',
      })
      setIsDialogOpen(false)
      reset()
      fetchGoals()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create goal',
        description: 'Something went wrong.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (id: number, status: GoalStatus) => {
    try {
      await goalsApi.updateGoalStatus(id, status)
      toast({
        title: 'Goal updated',
        description: `Goal marked as ${status.toLowerCase()}.`,
      })
      fetchGoals()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Failed to update goal status.',
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await goalsApi.deleteGoal(id)
      toast({
        title: 'Goal deleted',
        description: 'The goal has been removed.',
      })
      fetchGoals()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Failed to delete the goal.',
      })
    }
  }

  const activeGoals = goals.filter((g) => g.status === 'ACTIVE')
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED')
  const abandonedGoals = goals.filter((g) => g.status === 'ABANDONED')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Goals</h1>
          <p className="text-muted-foreground mt-1">
            Set and track your fitness objectives
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goalType">Goal Type *</Label>
                <Select
                  value={watch('goalType')}
                  onValueChange={(value) => setValue('goalType', value as GoalType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEIGHT_LOSS">Weight Loss</SelectItem>
                    <SelectItem value="MUSCLE_GAIN">Muscle Gain</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                {errors.goalType && (
                  <p className="text-sm text-destructive">{errors.goalType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  placeholder="70.0"
                  {...register('targetWeight')}
                />
                {errors.targetWeight && (
                  <p className="text-sm text-destructive">{errors.targetWeight.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  {...register('targetDate')}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Goal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : goals.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Set your first fitness goal to start tracking your progress
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeGoals.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Active Goals
                </CardTitle>
                <CardDescription>Goals you're currently working on</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{goalTypeLabels[goal.goalType]}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {goal.targetWeight && <span>Target: {goal.targetWeight} kg</span>}
                            {goal.targetDate && <span>• By {formatDate(goal.targetDate)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(goal.id, 'COMPLETED')}
                          className="text-green-500 hover:text-green-500"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(goal.id, 'ABANDONED')}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(goal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(completedGoals.length > 0 || abandonedGoals.length > 0) && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Past Goals</CardTitle>
                <CardDescription>Completed and archived goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...completedGoals, ...abandonedGoals].map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 opacity-70">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Target className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{goalTypeLabels[goal.goalType]}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {goal.targetWeight && <span>Target: {goal.targetWeight} kg</span>}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${goalStatusColors[goal.status]}`}>
                              {goalStatusLabels[goal.status]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(goal.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

