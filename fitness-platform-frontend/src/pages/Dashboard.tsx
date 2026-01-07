import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { formatWeight } from '@/lib/unitConversions'
import { metricsApi, goalsApi, sessionApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'
import {
  Scale,
  Target,
  Dumbbell,
  TrendingUp,
  Plus,
  Calendar,
  Activity
} from 'lucide-react'
import type { BodyMetric, Goal } from '@/types/metrics'
import type { WorkoutSession } from '@/types/session'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { unitSystem } = useSettingsStore()
  const [latestMetric, setLatestMetric] = useState<BodyMetric | null>(null)
  const [activeGoals, setActiveGoals] = useState<Goal[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricRes, goalsRes, historyRes] = await Promise.all([
          metricsApi.getLatestMetric().catch(() => ({ data: null })),
          goalsApi.getActiveGoals().catch(() => ({ data: [] })),
          sessionApi.getHistory().catch(() => ({ data: [] })),
        ])
        setLatestMetric(metricRes.data)
        setActiveGoals(goalsRes.data)
        setRecentWorkouts(historyRes.data?.slice(0, 5) || [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">
          {greeting()}, {user?.firstName || 'there'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your fitness journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatWeight(latestMetric?.weightKg, unitSystem)}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestMetric ? `Last updated ${formatDate(latestMetric.measurementDate)}` : 'No data yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetric?.bodyFatPct ? `${latestMetric.bodyFatPct}%` : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestMetric?.bodyFatPct ? 'Current measurement' : 'No data yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeGoals.length === 1 ? '1 goal in progress' : `${activeGoals.length} goals in progress`}
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentWorkouts.length}</div>
            <p className="text-xs text-muted-foreground">Keep up the momentum!</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Start Workout
            </CardTitle>
            <CardDescription>Begin a new workout session</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/templates">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Choose Template
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Log Metrics
            </CardTitle>
            <CardDescription>Record your body measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/metrics">
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Set Goals
            </CardTitle>
            <CardDescription>Define your fitness targets</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/goals">
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Active Goals</CardTitle>
            <CardDescription>Your current fitness objectives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {goal.goalType.replace('_', ' ')}
                    </p>
                    <div className="flex items-center gap-2">
                      {goal.targetWeight && (
                        <span className="text-xs text-muted-foreground">
                          Target: {formatWeight(goal.targetWeight, unitSystem)}
                        </span>
                      )}
                      {goal.targetDate && (
                        <span className="text-xs text-muted-foreground">
                          • By {formatDate(goal.targetDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress value={30} className="w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
            <CardDescription>Your latest training sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {workout.template?.name || 'Workout'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(workout.startedAt)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${workout.status === 'COMPLETED'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                    {workout.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !latestMetric && activeGoals.length === 0 && recentWorkouts.length === 0 && (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome to FitStack!</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start by setting up your profile, logging your body metrics, or creating your first workout template.
            </p>
            <div className="flex gap-4">
              <Link to="/profile">
                <Button variant="outline">Set Up Profile</Button>
              </Link>
              <Link to="/templates/new">
                <Button>Create Template</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

