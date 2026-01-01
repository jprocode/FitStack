import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { VolumeProgressionData } from '@/types/analytics'

interface VolumeChartProps {
  data: VolumeProgressionData[]
}

export function VolumeChart({ data }: VolumeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No volume data available for this period
      </div>
    )
  }

  const formattedData = data.map((item) => ({
    ...item,
    date: format(parseISO(item.date), 'MMM d'),
    fullDate: format(parseISO(item.date), 'MMM d, yyyy'),
    volumeFormatted: item.totalVolume.toLocaleString(),
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{item.fullDate}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Volume: </span>
            <span className="font-medium">{item.volumeFormatted} kg</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Sets: </span>
            <span className="font-medium">{item.totalSets}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Reps: </span>
            <span className="font-medium">{item.totalReps}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
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
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="totalVolume"
          stroke="hsl(var(--chart-1))"
          fill="url(#volumeGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

