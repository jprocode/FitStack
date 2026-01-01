import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Medal, Star, ChevronUp, ChevronDown, Flame } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { PersonalRecord } from '@/types/analytics'

interface PersonalRecordsListProps {
  records: PersonalRecord[]
}

type SortKey = 'maxWeight' | 'maxVolume' | 'exerciseName'

export function PersonalRecordsList({ records }: PersonalRecordsListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('maxWeight')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  if (!records || records.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Personal Records Yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Complete some workouts to start tracking your personal records.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const sortedRecords = [...records].sort((a, b) => {
    let comparison = 0
    switch (sortKey) {
      case 'maxWeight':
        comparison = a.maxWeight - b.maxWeight
        break
      case 'maxVolume':
        comparison = a.maxVolume - b.maxVolume
        break
      case 'exerciseName':
        comparison = a.exerciseName.localeCompare(b.exerciseName)
        break
    }
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const SortButton = ({ column, label }: { column: SortKey; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 hover:bg-accent"
      onClick={() => handleSort(column)}
    >
      {label}
      {sortKey === column &&
        (sortDirection === 'asc' ? (
          <ChevronUp className="ml-1 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4" />
        ))}
    </Button>
  )

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Personal Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-3">
                  <SortButton column="exerciseName" label="Exercise" />
                </th>
                <th className="text-right pb-3">
                  <SortButton column="maxWeight" label="Max Weight" />
                </th>
                <th className="text-right pb-3">Max Reps</th>
                <th className="text-right pb-3">
                  <SortButton column="maxVolume" label="Max Volume" />
                </th>
                <th className="text-right pb-3">Est. 1RM</th>
                <th className="text-right pb-3">Achieved</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record, index) => (
                <tr
                  key={record.exerciseId}
                  className="border-b border-border/50 hover:bg-accent/50 transition-colors"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Medal className="h-4 w-4 text-amber-500" />}
                      {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                      {index === 2 && <Medal className="h-4 w-4 text-amber-700" />}
                      <div>
                        <p className="font-medium">{record.exerciseName}</p>
                        <p className="text-xs text-muted-foreground">{record.muscleGroup}</p>
                      </div>
                      {record.isRecent && (
                        <Flame className="h-4 w-4 text-orange-500" title="Recent PR!" />
                      )}
                    </div>
                  </td>
                  <td className="text-right py-3 font-medium">{record.maxWeight.toFixed(1)} kg</td>
                  <td className="text-right py-3">{record.maxReps}</td>
                  <td className="text-right py-3">{record.maxVolume.toFixed(0)} kg</td>
                  <td className="text-right py-3 text-muted-foreground">
                    {record.estimatedOneRepMax ? `${record.estimatedOneRepMax.toFixed(1)} kg` : '—'}
                  </td>
                  <td className="text-right py-3 text-sm text-muted-foreground">
                    {record.achievedAt ? format(parseISO(record.achievedAt), 'MMM d, yyyy') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

