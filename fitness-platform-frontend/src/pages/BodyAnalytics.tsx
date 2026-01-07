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
import type { MetricType } from '@/components/charts/WeightTrendChart'
import { useSettingsStore } from '@/store/settingsStore'
import { formatWeight, kgToLbs } from '@/lib/unitConversions'

export default function BodyAnalytics() {
  const [weightTrend, setWeightTrend] = useState<WeightTrendData[]>([])
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([])
  const [stats, setStats] = useState<MetricsStats | null>(null)
  const [period, setPeriod] = useState('90d')
  const [isLoading, setIsLoading] = useState(true)
  const [showMovingAverage, setShowMovingAverage] = useState(true)
  const [showBodyFat, setShowBodyFat] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('weight')
  const { unitSystem } = useSettingsStore()

  // ... (omitted fetching logic remains same)

  return (
    <div className="space-y-8">
      {/* ... (Header and Stats Cards remain same) ... */}

      {/* Metric Trend Chart */}
      <Card className="glass">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {selectedMetric === 'weight' ? 'Weight Trend' : 'Measurement Trend'}
              </CardTitle>
              <CardDescription>
                Your {selectedMetric === 'weight' ? 'weight' : selectedMetric} progression over time
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedMetric}
                onValueChange={(val) => setSelectedMetric(val as MetricType)}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="neck">Neck</SelectItem>
                  <SelectItem value="shoulders">Shoulders</SelectItem>
                  <SelectItem value="chest">Chest</SelectItem>
                  <SelectItem value="waist">Waist</SelectItem>
                  <SelectItem value="hips">Hips</SelectItem>
                  <SelectItem value="leftBicep">L Bicep</SelectItem>
                  <SelectItem value="rightBicep">R Bicep</SelectItem>
                  <SelectItem value="leftThigh">L Thigh</SelectItem>
                  <SelectItem value="rightThigh">R Thigh</SelectItem>
                  <SelectItem value="leftCalf">L Calf</SelectItem>
                  <SelectItem value="rightCalf">R Calf</SelectItem>
                </SelectContent>
              </Select>

              {selectedMetric === 'weight' && (
                <>
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
                </>
              )}
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
              selectedMetric={selectedMetric}
            />
          )}
        </CardContent>
      </Card>


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

