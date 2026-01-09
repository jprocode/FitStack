import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { metricsApi, userApi } from '@/lib/api'
import { calculateBodyFat } from '@/lib/bodyFat'
import type { UserProfile } from '@/types/auth'
import { useSettingsStore } from '@/store/settingsStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { kgToLbs, lbsToKg, formatWeight, formatLength, inchesToCm } from '@/lib/unitConversions'
import { Calculator, ChevronDown, ChevronUp, Info, Loader2, Plus, Ruler, Scale, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
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
  const [isCalcDialogOpen, setIsCalcDialogOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const { unitSystem } = useSettingsStore()
  const { toast } = useToast()

  // Calculator form state
  const [calcHeight, setCalcHeight] = useState('')
  const [calcNeck, setCalcNeck] = useState('')
  const [calcWaist, setCalcWaist] = useState('')
  const [calcHips, setCalcHips] = useState('')
  const [calcResult, setCalcResult] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MetricForm>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      // Use local date format (YYYY-MM-DD) to avoid timezone issues
      measurementDate: new Date().toLocaleDateString('en-CA'), // en-CA gives YYYY-MM-DD format
    },
  })

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    userApi.getProfile().then(res => setUserProfile(res.data)).catch(console.error)
  }, [])

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
      const weightKg = unitSystem === 'metric' ? data.weight : lbsToKg(data.weight)

      // Helper to convert to number or undefined (never empty string)
      const toNumber = (val: number | string | undefined | null): number | undefined => {
        if (val === '' || val === undefined || val === null) return undefined
        const num = Number(val)
        return isNaN(num) ? undefined : num
      }

      const toCm = (val: number | string | undefined | null): number | undefined => {
        const num = toNumber(val)
        if (num === undefined) return undefined
        return unitSystem === 'metric' ? num : inchesToCm(num)
      }

      const requestData = {
        weightKg,
        bodyFatPct: toNumber(data.bodyFatPct),
        measurementDate: data.measurementDate,
        notes: data.notes || undefined,
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
      }

      // Remove undefined keys to avoid sending nulls
      const cleanedData = Object.fromEntries(
        Object.entries(requestData).filter(([_, v]) => v !== undefined)
      )

      console.log('Sending metric data:', cleanedData)

      await metricsApi.createMetric(cleanedData)
      toast({
        title: 'Metric logged',
        description: 'Your body measurement has been recorded.',
      })
      setIsDialogOpen(false)
      reset()
      fetchMetrics()
    } catch (error: any) {
      console.error('Failed to create metric:', error.response?.data || error.message)
      toast({
        variant: 'destructive',
        title: 'Failed to log metric',
        description: error.response?.data?.message || error.response?.data?.error || 'Something went wrong.',
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

  const displayWeightDiff = (diffKg: number) => {
    if (unitSystem === 'metric') return `${Math.abs(diffKg).toFixed(1)} kg`
    const diffLbs = Math.abs(kgToLbs(diffKg))
    return `${diffLbs.toFixed(1)} lbs`
  }

  const toggleRowExpand = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleCalculateBodyFat = () => {
    if (!userProfile?.gender) {
      toast({ variant: 'destructive', title: 'Gender required', description: 'Please set your gender in Profile settings.' })
      return
    }

    const h = parseFloat(calcHeight) || (userProfile?.heightCm ?? 0)
    const n = parseFloat(calcNeck)
    const w = parseFloat(calcWaist)
    const hp = parseFloat(calcHips)

    if (!h || !n || !w) {
      toast({ variant: 'destructive', title: 'Missing values', description: 'Please enter Height, Neck, and Waist.' })
      return
    }

    const heightCm = unitSystem === 'metric' ? h : inchesToCm(h)
    const neckCm = unitSystem === 'metric' ? n : inchesToCm(n)
    const waistCm = unitSystem === 'metric' ? w : inchesToCm(w)
    const hipsCm = hp ? (unitSystem === 'metric' ? hp : inchesToCm(hp)) : undefined

    const bf = calculateBodyFat(userProfile.gender, heightCm, neckCm, waistCm, hipsCm)
    if (bf) {
      setCalcResult(bf)
    } else {
      toast({ variant: 'destructive', title: 'Calculation failed', description: 'Please check your measurements.' })
    }
  }

  // Sync calculator values FROM form when opening calculator
  const handleOpenCalculator = (open: boolean) => {
    if (open) {
      // Pre-populate calculator with form values
      const formNeck = watch('neck')
      const formWaist = watch('waist')
      const formHips = watch('hips')

      if (formNeck) setCalcNeck(String(formNeck))
      if (formWaist) setCalcWaist(String(formWaist))
      if (formHips) setCalcHips(String(formHips))

      // Pre-populate height from profile
      if (userProfile?.heightCm) {
        const displayHeight = unitSystem === 'metric'
          ? userProfile.heightCm
          : (userProfile.heightCm / 2.54)
        setCalcHeight(displayHeight.toFixed(1))
      }
      setCalcResult(null)
    }
    setIsCalcDialogOpen(open)
  }

  const applyCalculatedBodyFat = () => {
    if (calcResult) {
      setValue('bodyFatPct', calcResult, { shouldValidate: true })

      // Also sync neck, waist, hips back to form
      if (calcNeck) setValue('neck', parseFloat(calcNeck))
      if (calcWaist) setValue('waist', parseFloat(calcWaist))
      if (calcHips) setValue('hips', parseFloat(calcHips))

      setIsCalcDialogOpen(false)
      setCalcResult(null)
      toast({ title: 'Body Fat Applied', description: `Set to ${calcResult}%` })
    }
  }

  const unitLabel = unitSystem === 'metric' ? 'cm' : 'in'
  const isFemale = userProfile?.gender?.toLowerCase() === 'female' || userProfile?.gender?.toLowerCase() === 'woman'

  const hasExtendedMetrics = (m: BodyMetric) => {
    return m.neckCm || m.shouldersCm || m.chestCm || m.waistCm || m.hipsCm ||
      m.leftBicepCm || m.rightBicepCm || m.leftThighCm || m.rightThighCm || m.leftCalfCm || m.rightCalfCm
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
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Body Metrics</DialogTitle>
              <DialogDescription>Record your measurements to track progress over time.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Weight */}
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

              {/* Body Fat % Section */}
              <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                <div className="space-y-2">
                  <Label htmlFor="bodyFatPct">Body Fat % <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    id="bodyFatPct"
                    type="number"
                    step="0.1"
                    placeholder="15.0"
                    {...register('bodyFatPct')}
                  />
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    If you have an accurate DEXA scan result, enter it manually for best accuracy.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-muted/30 px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Dialog open={isCalcDialogOpen} onOpenChange={handleOpenCalculator}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="w-full">
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Body Fat (US Navy Method)
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Body Fat Calculator</DialogTitle>
                      <DialogDescription>
                        Estimate your body fat using the US Navy method. Measure at the narrowest point for neck, widest point for waist.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Height ({unitLabel})</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={calcHeight}
                            onChange={e => setCalcHeight(e.target.value)}
                            placeholder={userProfile?.heightCm ? (unitSystem === 'metric' ? userProfile.heightCm.toString() : (userProfile.heightCm / 2.54).toFixed(1)) : ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Neck ({unitLabel})</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={calcNeck}
                            onChange={e => setCalcNeck(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Waist ({unitLabel})</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={calcWaist}
                            onChange={e => setCalcWaist(e.target.value)}
                          />
                        </div>
                        {isFemale && (
                          <div className="space-y-2">
                            <Label>Hips ({unitLabel})</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={calcHips}
                              onChange={e => setCalcHips(e.target.value)}
                            />
                          </div>
                        )}
                      </div>

                      <Button type="button" onClick={handleCalculateBodyFat} className="w-full">
                        Calculate
                      </Button>

                      {calcResult && (
                        <div className="p-4 rounded-lg bg-primary/10 text-center space-y-2">
                          <p className="text-sm text-muted-foreground">Estimated Body Fat</p>
                          <p className="text-3xl font-bold text-primary">{calcResult}%</p>
                          <Button onClick={applyCalculatedBodyFat} size="sm" className="mt-2">
                            Use This Value
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Date */}
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

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="notes"
                  placeholder="Morning measurement, after breakfast..."
                  {...register('notes')}
                />
              </div>

              {/* Extended Measurements - Always visible, scrollable */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Body Measurements ({unitLabel})</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Upper Body */}
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Upper Body</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="neck" className="text-sm">Neck</Label>
                    <Input id="neck" type="number" step="0.1" {...register('neck')} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shoulders" className="text-sm">Shoulders</Label>
                    <Input id="shoulders" type="number" step="0.1" {...register('shoulders')} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="chest" className="text-sm">Chest</Label>
                    <Input id="chest" type="number" step="0.1" {...register('chest')} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="waist" className="text-sm">Waist</Label>
                    <Input id="waist" type="number" step="0.1" {...register('waist')} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="hips" className="text-sm">Hips</Label>
                    <Input id="hips" type="number" step="0.1" {...register('hips')} />
                  </div>

                  {/* Arms */}
                  <div className="col-span-2 mt-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Arms</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="leftBicep" className="text-sm">Left Bicep</Label>
                    <Input id="leftBicep" type="number" step="0.1" {...register('leftBicep')} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rightBicep" className="text-sm">Right Bicep</Label>
                    <Input id="rightBicep" type="number" step="0.1" {...register('rightBicep')} />
                  </div>

                  {/* Legs */}
                  <div className="col-span-2 mt-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Legs</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="leftThigh" className="text-sm">Left Thigh</Label>
                    <Input id="leftThigh" type="number" step="0.1" {...register('leftThigh')} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rightThigh" className="text-sm">Right Thigh</Label>
                    <Input id="rightThigh" type="number" step="0.1" {...register('rightThigh')} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="leftCalf" className="text-sm">Left Calf</Label>
                    <Input id="leftCalf" type="number" step="0.1" {...register('leftCalf')} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rightCalf" className="text-sm">Right Calf</Label>
                    <Input id="rightCalf" type="number" step="0.1" {...register('rightCalf')} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Entry
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {metrics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatWeight(metrics[0].weightKg, unitSystem)}</div>
              {weightTrend && (
                <p className={`text-xs flex items-center gap-1 ${weightTrend.isUp ? 'text-destructive' : 'text-primary'}`}>
                  {weightTrend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {displayWeightDiff(weightTrend.diff)} from last
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
              <CardTitle className="text-sm font-medium">Waist</CardTitle>
              <Ruler className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics[0].waistCm ? formatLength(metrics[0].waistCm, unitSystem) : '—'}
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

      {/* History Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Your body measurement records - click a row to see all measurements</CardDescription>
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
            <div className="space-y-2">
              {metrics.map((metric) => (
                <div key={metric.id} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => toggleRowExpand(metric.id)}
                  >
                    <div className="flex items-center gap-6">
                      <span className="font-medium w-24">{formatDate(metric.measurementDate)}</span>
                      <span className="font-bold">{formatWeight(metric.weightKg, unitSystem)}</span>
                      <span className="text-muted-foreground">
                        {metric.bodyFatPct ? `${metric.bodyFatPct}% BF` : ''}
                      </span>
                      {hasExtendedMetrics(metric) && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          +{[metric.neckCm, metric.chestCm, metric.waistCm, metric.hipsCm, metric.leftBicepCm, metric.leftThighCm].filter(Boolean).length} measurements
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleDelete(metric.id); }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {expandedRows.has(metric.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {expandedRows.has(metric.id) && (
                    <div className="px-4 pb-4 pt-2 border-t bg-muted/20 animate-in fade-in slide-in-from-top-1">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {metric.neckCm && (
                          <div>
                            <span className="text-muted-foreground">Neck:</span>{' '}
                            <span className="font-medium">{formatLength(metric.neckCm, unitSystem)}</span>
                          </div>
                        )}
                        {metric.shouldersCm && (
                          <div>
                            <span className="text-muted-foreground">Shoulders:</span>{' '}
                            <span className="font-medium">{formatLength(metric.shouldersCm, unitSystem)}</span>
                          </div>
                        )}
                        {metric.chestCm && (
                          <div>
                            <span className="text-muted-foreground">Chest:</span>{' '}
                            <span className="font-medium">{formatLength(metric.chestCm, unitSystem)}</span>
                          </div>
                        )}
                        {metric.waistCm && (
                          <div>
                            <span className="text-muted-foreground">Waist:</span>{' '}
                            <span className="font-medium">{formatLength(metric.waistCm, unitSystem)}</span>
                          </div>
                        )}
                        {metric.hipsCm && (
                          <div>
                            <span className="text-muted-foreground">Hips:</span>{' '}
                            <span className="font-medium">{formatLength(metric.hipsCm, unitSystem)}</span>
                          </div>
                        )}
                        {metric.leftBicepCm && (
                          <div>
                            <span className="text-muted-foreground">L Bicep:</span>{' '}
                            <span className="font-medium">{formatLength(metric.leftBicepCm, unitSystem)}</span>
                          </div>
                        )}
                        {metric.rightBicepCm && (
                          <div>
                            <span className="text-muted-foreground">R Bicep:</span>{' '}
                            <span className="font-medium">{formatLength(metric.rightBicepCm, unitSystem)}</span>
                          </div>
                        )}
                        {metric.leftThighCm && (
                          <div>
                            <span className="text-muted-foreground">L Thigh:</span>{' '}
                            <span className="font-medium">{formatLength(metric.leftThighCm, unitSystem)}</span>
                          </div>
                        )}
                        {metric.rightThighCm && (
                          <div>
                            <span className="text-muted-foreground">R Thigh:</span>{' '}
                            <span className="font-medium">{formatLength(metric.rightThighCm, unitSystem)}</span>
                          </div>
                        )}
                        {metric.leftCalfCm && (
                          <div>
                            <span className="text-muted-foreground">L Calf:</span>{' '}
                            <span className="font-medium">{formatLength(metric.leftCalfCm, unitSystem)}</span>
                          </div>
                        )}
                        {metric.rightCalfCm && (
                          <div>
                            <span className="text-muted-foreground">R Calf:</span>{' '}
                            <span className="font-medium">{formatLength(metric.rightCalfCm, unitSystem)}</span>
                          </div>
                        )}
                        {metric.notes && (
                          <div className="col-span-full">
                            <span className="text-muted-foreground">Notes:</span>{' '}
                            <span>{metric.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
