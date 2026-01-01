import { useEffect, useState } from 'react'
import { analyticsApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WeightTrendChart } from '@/components/charts/WeightTrendChart'
import { GoalProgressCard } from '@/components/charts/GoalProgressCard'
import {
  Scale,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'
import { format, subDays, subMonths, subYears } from 'date-fns'
import type { WeightTrendData, GoalProgress, MetricsStats } from '@/types/analytics'

export default function BodyAnalytics() {
  const [weightTrend, setWeightTrend] = useState<WeightTrendData[]>([])
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([])
  const [stats, setStats] = useState<MetricsStats | null>(null)
  const [period, setPeriod] = useState('90d')
  const [isLoading, setIsLoading] = useState(true)
  const [showMovingAverage, setShowMovingAverage] = useState(true)
  const [showBodyFat, setShowBodyFat] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const endDate = format(new Date(), 'yyyy-MM-dd')
      let startDate: string

      switch (period) {
        case '30d':
          startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
          break
        case '90d':
          startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd')
          break
        case '1y':
          startDate = format(subYears(new Date(), 1), 'yyyy-MM-dd')
          break
        case 'all':
          startDate = format(subYears(new Date(), 10), 'yyyy-MM-dd')
          break
        default:
          startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd')
      }

      const [trendRes, progressRes, statsRes] = await Promise.all([
        analyticsApi.getWeightTrend(startDate, endDate),
        analyticsApi.getGoalProgress(),
        analyticsApi.getMetricsStats(period),
      ])

      setWeightTrend(trendRes.data || [])
      setGoalProgress(progressRes.data || [])
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (value: number | null) => {
    if (value === null) return <Minus className="h-4 w-4 text-muted-foreground" />
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-red-500" />
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-emerald-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const formatChange = (value: number | null) => {
    if (value === null) return '—'
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)} kg`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Body Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your body composition progress</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Weight</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageWeight ? `${stats.averageWeight.toFixed(1)} kg` : '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                Range: {stats.minWeight?.toFixed(1)} - {stats.maxWeight?.toFixed(1)} kg
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weight Change</CardTitle>
              {getTrendIcon(stats.weightChange)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatChange(stats.weightChange)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.ratePerWeek !== null
                  ? `${stats.ratePerWeek > 0 ? '+' : ''}${stats.ratePerWeek.toFixed(2)} kg/week`
                  : 'Over selected period'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Body Fat Avg</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageBodyFat ? `${stats.averageBodyFat.toFixed(1)}%` : '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.bodyFatChange !== null
                  ? `${stats.bodyFatChange > 0 ? '+' : ''}${stats.bodyFatChange.toFixed(1)}% change`
                  : 'No body fat data'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tracking</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntries} entries</div>
              <p className="text-xs text-muted-foreground">
                Over {stats.weeksTracked} week{stats.weeksTracked !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weight Trend Chart */}
      <Card className="glass">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weight Trend
              </CardTitle>
              <CardDescription>Your weight progression over time</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showMovingAverage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMovingAverage(!showMovingAverage)}
              >
                7-Day Avg
              </Button>
              <Button
                variant={showBodyFat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowBodyFat(!showBodyFat)}
              >
                Body Fat
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading chart...</div>
            </div>
          ) : (
            <WeightTrendChart
              data={weightTrend}
              showMovingAverage={showMovingAverage}
              showBodyFat={showBodyFat}
            />
          )}
        </CardContent>
      </Card>

      {/* Goal Progress */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Goal Progress
        </h2>
        {goalProgress.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goalProgress.map((goal) => (
              <GoalProgressCard key={goal.goalId} goal={goal} />
            ))}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Set a goal to track your progress toward your fitness targets.
              </p>
              <Button onClick={() => (window.location.href = '/goals')}>Create Goal</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {!isLoading && weightTrend.length === 0 && goalProgress.length === 0 && (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scale className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Tracking Your Progress</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Log your body metrics regularly to see trends and track your progress toward your
              goals.
            </p>
            <Button onClick={() => (window.location.href = '/metrics')}>Log Metrics</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

