import { useEffect, useState } from 'react'
import { workoutAnalyticsApi, exerciseApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WorkoutFrequencyChart } from '@/components/charts/WorkoutFrequencyChart'
import { VolumeChart } from '@/components/charts/VolumeChart'
import { PersonalRecordsList } from '@/components/PersonalRecordsList'
import { ProgressiveOverloadCard } from '@/components/ProgressiveOverloadCard'
import { BarChart3, TrendingUp, Trophy, Dumbbell, Calendar, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react'
import { format, subDays, subYears } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
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
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const { toast } = useToast()

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

  const rawTotalVolume = volume.reduce((sum, v) => sum + v.totalVolume, 0)
  // Note: Data is stored in user's preferred unit (lbs), no conversion needed
  const totalVolume = rawTotalVolume

  const recentPRs = personalRecords.filter((pr) => pr.isRecent).length

  // Clear all workout data
  const handleClearAll = async () => {
    setIsClearing(true)
    try {
      await workoutAnalyticsApi.clearAll()
      toast({
        title: 'Workout data cleared',
        description: 'All workout analytics and history have been deleted.',
      })
      setShowResetDialog(false)
      fetchAnalytics()
    } catch (error) {
      console.error('Failed to clear workout data:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clear workout data.',
      })
    } finally {
      setIsClearing(false)
    }
  }

  // Clear recent workout data (last 7 days)
  const handleClearRecent = async () => {
    setIsClearing(true)
    try {
      await workoutAnalyticsApi.clearRecent()
      toast({
        title: 'Recent data cleared',
        description: 'Last 7 days of workout data have been deleted.',
      })
      setShowResetDialog(false)
      fetchAnalytics()
    } catch (error) {
      console.error('Failed to clear recent data:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clear recent data.',
      })
    } finally {
      setIsClearing(false)
    }
  }

  // Clear just the last workout session
  const handleClearLastSession = async () => {
    setIsClearing(true)
    try {
      await workoutAnalyticsApi.clearLastSession()
      toast({
        title: 'Last session cleared',
        description: 'Your most recent workout session has been deleted.',
      })
      setShowResetDialog(false)
      fetchAnalytics()
    } catch (error) {
      console.error('Failed to clear last session:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clear last session.',
      })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Workout Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your training progress and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Analytics
          </Button>
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
      </div>

      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Reset Workout Analytics
            </DialogTitle>
            <DialogDescription>
              Choose what data you want to clear. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Button
              variant="destructive"
              className="w-full justify-start h-auto py-3"
              onClick={handleClearAll}
              disabled={isClearing}
            >
              {isClearing ? (
                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-3" />
              )}
              <div className="text-left">
                <p className="font-semibold">Clear All Workout Analytics & History</p>
                <p className="text-xs opacity-80">Deletes all workout sessions, sets, and analytics</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 border-amber-500 text-amber-600 hover:bg-amber-50"
              onClick={handleClearRecent}
              disabled={isClearing}
            >
              {isClearing ? (
                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-3" />
              )}
              <div className="text-left">
                <p className="font-semibold">Clear Recent Workout Analytics</p>
                <p className="text-xs opacity-80">Deletes last 7 days (fix wrong weight entries)</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={handleClearLastSession}
              disabled={isClearing}
            >
              {isClearing ? (
                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-3" />
              )}
              <div className="text-left">
                <p className="font-semibold">Clear Last Session</p>
                <p className="text-xs opacity-80">Deletes only your most recent workout</p>
              </div>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowResetDialog(false)} disabled={isClearing}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="text-2xl font-bold">
              {(totalVolume / 1000).toFixed(0)}k lbs
            </div>
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

