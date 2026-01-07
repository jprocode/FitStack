import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { WeightTrendData } from '@/types/analytics'
import { useSettingsStore } from '@/store/settingsStore'
import { kgToLbs, cmToInches } from '@/lib/unitConversions'

export type MetricType = 'weight' | 'neck' | 'shoulders' | 'chest' | 'waist' | 'hips' | 'leftBicep' | 'rightBicep' | 'leftThigh' | 'rightThigh' | 'leftCalf' | 'rightCalf'

interface WeightTrendChartProps {
  data: WeightTrendData[]
  showMovingAverage?: boolean
  showBodyFat?: boolean
  selectedMetric?: MetricType
}

export function WeightTrendChart({
  data,
  showMovingAverage = true,
  showBodyFat = false,
  selectedMetric = 'weight',
}: WeightTrendChartProps) {
  const { unitSystem } = useSettingsStore()

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for this period
      </div>
    )
  }

  const getMetricData = (item: WeightTrendData) => {
    switch (selectedMetric) {
      case 'weight':
        return item.weightKg
      case 'neck': return item.neckCm
      case 'shoulders': return item.shouldersCm
      case 'chest': return item.chestCm
      case 'waist': return item.waistCm
      case 'hips': return item.hipsCm
      case 'leftBicep': return item.leftBicepCm
      case 'rightBicep': return item.rightBicepCm
      case 'leftThigh': return item.leftThighCm
      case 'rightThigh': return item.rightThighCm
      case 'leftCalf': return item.leftCalfCm
      case 'rightCalf': return item.rightCalfCm
      default: return item.weightKg
    }
  }

  const getMetricLabel = () => {
    if (selectedMetric === 'weight') return 'Weight'
    return selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1).replace(/([A-Z])/g, ' $1').trim()
  }

  const getUnitLabel = () => {
    if (selectedMetric === 'weight') return unitSystem === 'metric' ? 'kg' : 'lbs'
    return unitSystem === 'metric' ? 'cm' : 'in'
  }

  const convertValue = (val: number | undefined | null) => {
    if (val === undefined || val === null) return null
    if (selectedMetric === 'weight') {
      return unitSystem === 'metric' ? val : kgToLbs(val)
    }
    return unitSystem === 'metric' ? val : cmToInches(val)
  }

  const formattedData = data.map((item) => {
    const rawValue = getMetricData(item)
    const displayValue = convertValue(rawValue)

    // Only calculate MA for weight for now, or simply assume it's null for other metrics
    // Ideally backend should provide MA for generic metric, but for now we disable MA for non-weight
    const isWeight = selectedMetric === 'weight'
    const displayMovingAverage = isWeight && item.movingAverage
      ? (unitSystem === 'metric' ? item.movingAverage : kgToLbs(item.movingAverage))
      : null

    return {
      ...item,
      date: format(parseISO(item.date), 'MMM d'),
      fullDate: format(parseISO(item.date), 'MMM d, yyyy'),
      displayValue,
      displayMovingAverage,
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{payload[0]?.payload?.fullDate}</p>
          {payload.map((entry: any, index: number) => {
            // Filter out null values
            if (entry.value === null || entry.value === undefined) return null;

            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value?.toFixed(1)} {entry.name.includes('Fat') ? '%' : getUnitLabel()}
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickLine={false}
        />
        <YAxis
          yAxisId="metric"
          domain={['auto', 'auto']}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
          label={{
            value: getUnitLabel(),
            angle: -90,
            position: 'insideLeft',
            fontSize: 12
          }}
        />
        {showBodyFat && selectedMetric === 'weight' && (
          <YAxis
            yAxisId="bodyFat"
            orientation="right"
            domain={[0, 50]}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickLine={false}
            axisLine={false}
            label={{ value: '%', angle: 90, position: 'insideRight', fontSize: 12 }}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          yAxisId="metric"
          type="monotone"
          dataKey="displayValue"
          name={getMetricLabel()}
          stroke="hsl(var(--primary))"
          fill="url(#metricGradient)"
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 6 }}
          connectNulls
        />
        {showMovingAverage && selectedMetric === 'weight' && (
          <Line
            yAxisId="metric"
            type="monotone"
            dataKey="displayMovingAverage"
            name="7-Day Average"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        )}
        {showBodyFat && selectedMetric === 'weight' && (
          <Line
            yAxisId="bodyFat"
            type="monotone"
            dataKey="bodyFatPct"
            name="Body Fat %"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

