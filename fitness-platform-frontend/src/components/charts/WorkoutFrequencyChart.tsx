import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { WorkoutFrequencyData } from '@/types/analytics'

interface WorkoutFrequencyChartProps {
  data: WorkoutFrequencyData[]
}

export function WorkoutFrequencyChart({ data }: WorkoutFrequencyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No workout data available for this period
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{item.weekLabel}</p>
          <p className="text-sm text-muted-foreground">
            {item.workoutCount} workout{item.workoutCount !== 1 ? 's' : ''}
          </p>
        </div>
      )
    }
    return null
  }

  const getBarColor = (count: number) => {
    if (count >= 5) return 'hsl(var(--chart-1))'
    if (count >= 3) return 'hsl(var(--primary))'
    if (count >= 1) return 'hsl(var(--chart-2))'
    return 'hsl(var(--muted))'
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="weekLabel"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          tickLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="workoutCount" radius={[4, 4, 0, 0]} maxBarSize={50}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.workoutCount)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

