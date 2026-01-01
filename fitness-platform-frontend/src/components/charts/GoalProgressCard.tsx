import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Target, TrendingDown, TrendingUp, Dumbbell, Calendar } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import type { GoalProgress } from '@/types/analytics'

interface GoalProgressCardProps {
  goal: GoalProgress
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'WEIGHT_LOSS':
        return <TrendingDown className="h-5 w-5 text-emerald-500" />
      case 'MUSCLE_GAIN':
        return <TrendingUp className="h-5 w-5 text-blue-500" />
      case 'MAINTENANCE':
        return <Dumbbell className="h-5 w-5 text-amber-500" />
      default:
        return <Target className="h-5 w-5 text-primary" />
    }
  }

  const getGoalLabel = (type: string) => {
    switch (type) {
      case 'WEIGHT_LOSS':
        return 'Weight Loss'
      case 'MUSCLE_GAIN':
        return 'Muscle Gain'
      case 'MAINTENANCE':
        return 'Maintenance'
      default:
        return type
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-emerald-500'
    if (percentage >= 50) return 'bg-blue-500'
    if (percentage >= 25) return 'bg-amber-500'
    return 'bg-muted-foreground'
  }

  const progressValue = Math.min(Math.max(goal.progressPercentage, 0), 100)
  const daysText =
    goal.daysRemaining !== null
      ? goal.daysRemaining > 0
        ? `${goal.daysRemaining} days remaining`
        : goal.daysRemaining === 0
          ? 'Due today!'
          : `${Math.abs(goal.daysRemaining)} days overdue`
      : null

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {getGoalIcon(goal.goalType)}
            <span>{getGoalLabel(goal.goalType)}</span>
          </div>
          <span
            className={`text-sm font-normal px-2 py-1 rounded-full ${
              goal.status === 'ACTIVE'
                ? 'bg-primary/10 text-primary'
                : goal.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {goal.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Ring / Bar */}
        <div className="relative pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold inline-block text-muted-foreground">
              Progress
            </span>
            <span className="text-xs font-semibold inline-block text-primary">
              {progressValue.toFixed(1)}%
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Weight Info */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Start</p>
            <p className="text-sm font-medium">
              {goal.startValue !== null ? `${goal.startValue.toFixed(1)} kg` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-sm font-medium">
              {goal.currentValue !== null ? `${goal.currentValue.toFixed(1)} kg` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-sm font-medium">
              {goal.targetValue !== null ? `${goal.targetValue.toFixed(1)} kg` : '—'}
            </p>
          </div>
        </div>

        {/* Timeline */}
        {goal.targetDate && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Target: {format(parseISO(goal.targetDate), 'MMM d, yyyy')}</span>
            </div>
            {daysText && (
              <span
                className={`text-xs ${
                  goal.daysRemaining !== null && goal.daysRemaining < 0
                    ? 'text-red-500'
                    : goal.daysRemaining !== null && goal.daysRemaining <= 7
                      ? 'text-amber-500'
                      : 'text-muted-foreground'
                }`}
              >
                {daysText}
              </span>
            )}
          </div>
        )}

        {/* Predicted Completion */}
        {goal.predictedCompletionDate && (
          <div className="text-xs text-muted-foreground">
            Predicted completion: {format(parseISO(goal.predictedCompletionDate), 'MMM d, yyyy')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

