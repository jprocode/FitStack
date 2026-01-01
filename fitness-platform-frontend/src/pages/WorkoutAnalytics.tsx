import { useEffect, useState } from 'react'
import { workoutAnalyticsApi, exerciseApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WorkoutFrequencyChart } from '@/components/charts/WorkoutFrequencyChart'
import { VolumeChart } from '@/components/charts/VolumeChart'
import { PersonalRecordsList } from '@/components/PersonalRecordsList'
import { ProgressiveOverloadCard } from '@/components/ProgressiveOverloadCard'
import { BarChart3, TrendingUp, Trophy, Zap, Dumbbell, Calendar } from 'lucide-react'
import { format, subDays, subYears } from 'date-fns'
import type {
  WorkoutFrequencyData,
  VolumeProgressionData,
  PersonalRecord,
  ProgressiveOverloadSuggestion,
} from '@/types/analytics'

export default function WorkoutAnalytics() {
  const [frequency, setFrequency] = useState<WorkoutFrequencyData[]>([])
  const [volume, setVolume] = useState<VolumeProgressionData[]>([])
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [suggestions, setSuggestions] = useState<ProgressiveOverloadSuggestion[]>([])
  const [exercises, setExercises] = useState<{ id: number; name: string }[]>([])
  const [period, setPeriod] = useState('90d')
  const [selectedExercise, setSelectedExercise] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    fetchExercises()
  }, [period])

  useEffect(() => {
    fetchVolume()
  }, [selectedExercise, period])

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
        default:
          startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd')
      }

      const [freqRes, recordsRes, suggestionsRes] = await Promise.all([
        workoutAnalyticsApi.getFrequency(startDate, endDate),
        workoutAnalyticsApi.getPersonalRecords(),
        workoutAnalyticsApi.getProgressiveOverload(),
      ])

      setFrequency(freqRes.data || [])
      setPersonalRecords(recordsRes.data || [])
      setSuggestions(suggestionsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch workout analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVolume = async () => {
    try {
      const exerciseId = selectedExercise !== 'all' ? parseInt(selectedExercise) : undefined
      const volRes = await workoutAnalyticsApi.getVolume(exerciseId, period)
      setVolume(volRes.data || [])
    } catch (error) {
      console.error('Failed to fetch volume data:', error)
    }
  }

  const fetchExercises = async () => {
    try {
      const res = await exerciseApi.getExercises()
      setExercises(
        res.data?.content?.map((e: any) => ({ id: e.id, name: e.name })) || []
      )
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
    }
  }

  // Calculate summary stats
  const totalWorkouts = frequency.reduce((sum, f) => sum + f.workoutCount, 0)
  const avgPerWeek =
    frequency.length > 0 ? (totalWorkouts / frequency.length).toFixed(1) : '0'
  const totalVolume = volume.reduce((sum, v) => sum + v.totalVolume, 0)
  const recentPRs = personalRecords.filter((pr) => pr.isRecent).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Workout Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your training progress and performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Per Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerWeek}</div>
            <p className="text-xs text-muted-foreground">Workouts per week</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalVolume / 1000).toFixed(0)}k kg</div>
            <p className="text-xs text-muted-foreground">Weight × Reps lifted</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent PRs</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentPRs}</div>
            <p className="text-xs text-muted-foreground">In last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Workout Frequency Chart */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Workout Frequency
          </CardTitle>
          <CardDescription>Number of workouts per week</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading chart...</div>
            </div>
          ) : (
            <WorkoutFrequencyChart data={frequency} />
          )}
        </CardContent>
      </Card>

      {/* Volume Progression */}
      <Card className="glass">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Volume Progression
              </CardTitle>
              <CardDescription>Total training volume over time</CardDescription>
            </div>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Exercises" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exercises</SelectItem>
                {exercises.map((ex) => (
                  <SelectItem key={ex.id} value={ex.id.toString()}>
                    {ex.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading chart...</div>
            </div>
          ) : (
            <VolumeChart data={volume} />
          )}
        </CardContent>
      </Card>

      {/* Personal Records and Progressive Overload */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PersonalRecordsList records={personalRecords} />
        <ProgressiveOverloadCard suggestions={suggestions} />
      </div>

      {/* Empty State */}
      {!isLoading &&
        frequency.length === 0 &&
        personalRecords.length === 0 && (
          <Card className="glass">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Training</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Complete workouts to see your training analytics and track your progress.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  )
}

