import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { metricsApi } from '@/lib/api'
import { useSettingsStore } from '@/store/settingsStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { kgToLbs, lbsToKg, formatWeight } from '@/lib/unitConversions'
import { ChevronDown, ChevronRight, Loader2, Plus, Scale, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { formatLength, cmToInches, inchesToCm } from '@/lib/unitConversions'
import { BodyMetric } from '@/types/metrics'

const metricSchema = z.object({
  weight: z.coerce.number().min(20).max(1000),
  bodyFatPct: z.coerce.number().min(1).max(70).optional().or(z.literal('')),
  measurementDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  // Extended metrics (all optional)
  neck: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  shoulders: z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  chest: z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  waist: z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  hips: z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  leftBicep: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  rightBicep: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  leftThigh: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  rightThigh: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  leftCalf: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  rightCalf: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
})

type MetricForm = z.infer<typeof metricSchema>

export default function BodyMetrics() {
  const [metrics, setMetrics] = useState<BodyMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { unitSystem } = useSettingsStore()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MetricForm>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      measurementDate: new Date().toISOString().split('T')[0],
    },
  })

  const fetchMetrics = async () => {
    try {
      const response = await metricsApi.getMetrics()
      setMetrics(response.data)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const onSubmit = async (data: MetricForm) => {
    setIsSaving(true)
    try {
      // Convert to kg if using imperial
      const weightKg = unitSystem === 'metric' ? data.weight : lbsToKg(data.weight)

      // Helper to convert length inputs to cm
      const toCm = (val: number | string | undefined | null) => {
        if (!val || val === '') return undefined
        const num = Number(val)
        return unitSystem === 'metric' ? num : inchesToCm(num)
      }

      await metricsApi.createMetric({
        weightKg,
        bodyFatPct: data.bodyFatPct || undefined,
        measurementDate: data.measurementDate,
        notes: data.notes || undefined,
        // Extended metrics
        neckCm: toCm(data.neck),
        shouldersCm: toCm(data.shoulders),
        chestCm: toCm(data.chest),
        waistCm: toCm(data.waist),
        hipsCm: toCm(data.hips),
        leftBicepCm: toCm(data.leftBicep),
        rightBicepCm: toCm(data.rightBicep),
        leftThighCm: toCm(data.leftThigh),
        rightThighCm: toCm(data.rightThigh),
        leftCalfCm: toCm(data.leftCalf),
        rightCalfCm: toCm(data.rightCalf),
      })
      toast({
        title: 'Metric logged',
        description: 'Your body measurement has been recorded.',
      })
      setIsDialogOpen(false)
      reset()
      fetchMetrics()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to log metric',
        description: 'Something went wrong.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await metricsApi.deleteMetric(id)
      toast({
        title: 'Metric deleted',
        description: 'The entry has been removed.',
      })
      fetchMetrics()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Failed to delete the metric.',
      })
    }
  }

  const getWeightTrend = () => {
    if (metrics.length < 2) return null
    const latest = metrics[0].weightKg
    const previous = metrics[1].weightKg
    const diff = latest - previous
    return { diff, isUp: diff > 0 }
  }

  const weightTrend = getWeightTrend()

  // Helper to display weight difference correctly
  const displayWeightDiff = (diffKg: number) => {
    if (unitSystem === 'metric') return `${Math.abs(diffKg).toFixed(1)} kg`
    const diffLbs = Math.abs(kgToLbs(diffKg))
    return `${diffLbs.toFixed(1)} lbs`
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Body Metrics</h1>
          <p className="text-muted-foreground mt-1">
            Track your body measurements over time
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Body Metrics</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'}) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder={unitSystem === 'metric' ? "75.5" : "166.4"}
                  {...register('weight')}
                />
                {errors.weight && (
                  <p className="text-sm text-destructive">{errors.weight.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyFatPct">Body Fat % (optional)</Label>
                <Input
                  id="bodyFatPct"
                  type="number"
                  step="0.1"
                  placeholder="15.0"
                  {...register('bodyFatPct')}
                />
                {errors.bodyFatPct && (
                  <p className="text-sm text-destructive">{errors.bodyFatPct.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurementDate">Date *</Label>
                <Input
                  id="measurementDate"
                  type="date"
                  {...register('measurementDate')}
                />
                {errors.measurementDate && (
                  <p className="text-sm text-destructive">{errors.measurementDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Morning measurement, after breakfast..."
                  {...register('notes')}
                />
              </div>

              <div className="border rounded-lg p-3 bg-muted/20">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full flex justify-between items-center p-0 h-auto hover:bg-transparent"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <span className="font-medium">Advanced Measurements ({unitSystem === 'metric' ? 'cm' : 'in'})</span>
                  {showAdvanced ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-3 mt-3 animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-1">
                      <Label htmlFor="neck" className="text-xs">Neck</Label>
                      <Input id="neck" type="number" step="0.1" {...register('neck')} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="shoulders" className="text-xs">Shoulders</Label>
                      <Input id="shoulders" type="number" step="0.1" {...register('shoulders')} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="chest" className="text-xs">Chest</Label>
                      <Input id="chest" type="number" step="0.1" {...register('chest')} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="waist" className="text-xs">Waist</Label>
                      <Input id="waist" type="number" step="0.1" {...register('waist')} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="hips" className="text-xs">Hips</Label>
                      <Input id="hips" type="number" step="0.1" {...register('hips')} />
                    </div>
                    <div className="col-span-2 my-1 border-t border-border/50" />
                    <div className="space-y-1">
                      <Label htmlFor="leftBicep" className="text-xs">L Bicep</Label>
                      <Input id="leftBicep" type="number" step="0.1" {...register('leftBicep')} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rightBicep" className="text-xs">R Bicep</Label>
                      <Input id="rightBicep" type="number" step="0.1" {...register('rightBicep')} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="leftThigh" className="text-xs">L Thigh</Label>
                      <Input id="leftThigh" type="number" step="0.1" {...register('leftThigh')} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rightThigh" className="text-xs">R Thigh</Label>
                      <Input id="rightThigh" type="number" step="0.1" {...register('rightThigh')} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="leftCalf" className="text-xs">L Calf</Label>
                      <Input id="leftCalf" type="number" step="0.1" {...register('leftCalf')} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rightCalf" className="text-xs">R Calf</Label>
                      <Input id="rightCalf" type="number" step="0.1" {...register('rightCalf')} />
                    </div>
                  </div>
                )}
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
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {metrics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatWeight(metrics[0].weightKg, unitSystem)}</div>
              {weightTrend && (
                <p className={`text-xs flex items-center gap-1 ${weightTrend.isUp ? 'text-destructive' : 'text-primary'
                  }`}>
                  {weightTrend.isUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {displayWeightDiff(weightTrend.diff)} from last entry
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics[0].bodyFatPct ? `${metrics[0].bodyFatPct}%` : '—'}
              </div>
              <p className="text-xs text-muted-foreground">Latest measurement</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.length}</div>
              <p className="text-xs text-muted-foreground">
                Since {formatDate(metrics[metrics.length - 1].measurementDate)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="glass">
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Your body measurement records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : metrics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Scale className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No metrics yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your body measurements
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Log First Entry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Weight</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Body Fat</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Notes</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.id} className="border-b border-border/50 hover:bg-accent/5">
                      <td className="py-3 px-4">{formatDate(metric.measurementDate)}</td>
                      <td className="py-3 px-4 font-medium">{formatWeight(metric.weightKg, unitSystem)}</td>
                      <td className="py-3 px-4">
                        {metric.bodyFatPct ? `${metric.bodyFatPct}%` : '—'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {metric.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(metric.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

