import { useEffect, useState } from 'react'
import { sessionApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatDateTime, formatDuration } from '@/lib/utils'
import { Loader2, Calendar, Dumbbell, Clock, History as HistoryIcon } from 'lucide-react'
import type { WorkoutSession } from '@/types/session'

export default function WorkoutHistory() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await sessionApi.getHistory()
        setSessions(response.data)
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const calculateDuration = (session: WorkoutSession) => {
    if (!session.completedAt) return null
    const start = new Date(session.startedAt).getTime()
    const end = new Date(session.completedAt).getTime()
    return Math.floor((end - start) / 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-primary/10 text-primary'
      case 'IN_PROGRESS':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'CANCELLED':
        return 'bg-destructive/10 text-destructive'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Workout History</h1>
        <p className="text-muted-foreground mt-1">
          Review your past workout sessions
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HistoryIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
            <p className="text-muted-foreground text-center">
              Complete your first workout to see it here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const duration = calculateDuration(session)
            return (
              <Card key={session.id} className="glass">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-primary" />
                        {session.template?.name || 'Workout'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(session.startedAt)}
                        </span>
                        {duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(duration)}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {session.sets && session.sets.length > 0 ? (
                    <div className="space-y-2">
                      {/* Group sets by exercise */}
                      {Object.entries(
                        session.sets.reduce((acc, set) => {
                          const name = set.exercise?.name || 'Unknown'
                          if (!acc[name]) acc[name] = []
                          acc[name].push(set)
                          return acc
                        }, {} as Record<string, typeof session.sets>)
                      ).map(([name, sets]) => (
                        <div key={name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <span className="font-medium">{name}</span>
                          <div className="flex gap-2 text-sm text-muted-foreground">
                            {sets.map((set, i) => (
                              <span key={set.id} className="px-2 py-0.5 rounded bg-secondary">
                                {set.repsCompleted}×{set.weightUsed}kg
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No sets recorded</p>
                  )}
                  {session.notes && (
                    <p className="mt-4 text-sm text-muted-foreground italic">
                      "{session.notes}"
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

