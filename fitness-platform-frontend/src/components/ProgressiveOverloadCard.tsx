import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Dumbbell, ArrowRight, Zap, Target } from 'lucide-react'
import type { ProgressiveOverloadSuggestion } from '@/types/analytics'

interface ProgressiveOverloadCardProps {
  suggestions: ProgressiveOverloadSuggestion[]
}

export function ProgressiveOverloadCard({ suggestions }: ProgressiveOverloadCardProps) {

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Complete more workouts to receive personalized progressive overload suggestions.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getProgressTypeIcon = (type: string) => {
    switch (type) {
      case 'WEIGHT':
        return <Dumbbell className="h-4 w-4 text-blue-500" />
      case 'REPS':
        return <Zap className="h-4 w-4 text-amber-500" />
      case 'SETS':
        return <Target className="h-4 w-4 text-emerald-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-primary" />
    }
  }

  const getProgressTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      WEIGHT: 'bg-blue-500/10 text-blue-500',
      REPS: 'bg-amber-500/10 text-amber-500',
      SETS: 'bg-emerald-500/10 text-emerald-500',
    }
    return colors[type] || 'bg-primary/10 text-primary'
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Progressive Overload Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.slice(0, 6).map((suggestion) => (
            <div
              key={suggestion.exerciseId}
              className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    {suggestion.exerciseName}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getProgressTypeBadge(suggestion.progressType)}`}
                    >
                      {suggestion.progressType}
                    </span>
                  </h4>
                  <p className="text-xs text-muted-foreground">{suggestion.muscleGroup}</p>
                </div>
                {getProgressTypeIcon(suggestion.progressType)}
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Last</p>
                  <p className="text-sm font-medium">
                    {suggestion.lastWeight.toFixed(1)} lbs × {suggestion.lastReps} reps
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Suggested</p>
                  <p className="text-sm font-medium text-primary">
                    {suggestion.suggestedWeight.toFixed(1)} lbs × {suggestion.suggestedReps} reps
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
            </div>
          ))}
        </div>

        {suggestions.length > 6 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            And {suggestions.length - 6} more suggestions...
          </p>
        )}
      </CardContent>
    </Card>
  )
}

