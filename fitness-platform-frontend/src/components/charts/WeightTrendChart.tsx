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

interface WeightTrendChartProps {
  data: WeightTrendData[]
  showMovingAverage?: boolean
  showBodyFat?: boolean
}

export function WeightTrendChart({
  data,
  showMovingAverage = true,
  showBodyFat = false,
}: WeightTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No weight data available for this period
      </div>
    )
  }

  const formattedData = data.map((item) => ({
    ...item,
    date: format(parseISO(item.date), 'MMM d'),
    fullDate: format(parseISO(item.date), 'MMM d, yyyy'),
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{payload[0]?.payload?.fullDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(1)} {entry.name.includes('Fat') ? '%' : 'kg'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
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
          yAxisId="weight"
          domain={['auto', 'auto']}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
          label={{ value: 'kg', angle: -90, position: 'insideLeft', fontSize: 12 }}
        />
        {showBodyFat && (
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
          yAxisId="weight"
          type="monotone"
          dataKey="weightKg"
          name="Weight"
          stroke="hsl(var(--primary))"
          fill="url(#weightGradient)"
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 6 }}
        />
        {showMovingAverage && (
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="movingAverage"
            name="7-Day Average"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        )}
        {showBodyFat && (
          <Line
            yAxisId="bodyFat"
            type="monotone"
            dataKey="bodyFatPct"
            name="Body Fat %"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

