import { useEffect, useState, useCallback } from 'react'
import { exerciseApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Search, Dumbbell } from 'lucide-react'
import type { Exercise } from '@/types/workout'

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [muscleGroups, setMuscleGroups] = useState<string[]>([])
  const [equipmentList, setEquipmentList] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  
  const [search, setSearch] = useState('')
  const [muscleGroup, setMuscleGroup] = useState<string>('')
  const [equipment, setEquipment] = useState<string>('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchExercises = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await exerciseApi.getExercises({
        search: search || undefined,
        muscleGroup: muscleGroup || undefined,
        equipment: equipment || undefined,
      })
      const data = response.data
      setExercises(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
    } finally {
      setIsLoading(false)
    }
  }, [search, muscleGroup, equipment, page])

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [muscleRes, equipRes] = await Promise.all([
          exerciseApi.getExercises({}),
          exerciseApi.getExercises({}),
        ])
        // Extract unique muscle groups and equipment from exercises
        const allExercises = muscleRes.data.content || []
        const muscles = [...new Set(allExercises.map((e: Exercise) => e.muscleGroup).filter(Boolean))]
        const equips = [...new Set(allExercises.map((e: Exercise) => e.equipment).filter(Boolean))]
        setMuscleGroups(muscles as string[])
        setEquipmentList(equips as string[])
      } catch (error) {
        console.error('Failed to fetch filters:', error)
      }
    }
    fetchFilters()
  }, [])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(0)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Exercise Library</h1>
        <p className="text-muted-foreground mt-1">
          Browse and search through our exercise database
        </p>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={muscleGroup} onValueChange={(v) => { setMuscleGroup(v === 'all' ? '' : v); setPage(0); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Muscle Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Muscles</SelectItem>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={equipment} onValueChange={(v) => { setEquipment(v === 'all' ? '' : v); setPage(0); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                {equipmentList.map((equip) => (
                  <SelectItem key={equip} value={equip}>{equip}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : exercises.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="glass cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedExercise(exercise)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                      {exercise.muscleGroup}
                    </span>
                    {exercise.equipment && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                        {exercise.equipment}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {exercise.instructions || 'No instructions available'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedExercise?.name}</DialogTitle>
          </DialogHeader>
          {selectedExercise && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {selectedExercise.muscleGroup}
                </span>
                {selectedExercise.equipment && (
                  <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                    {selectedExercise.equipment}
                  </span>
                )}
                {selectedExercise.difficulty && (
                  <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                    {selectedExercise.difficulty}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Instructions</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedExercise.instructions || 'No instructions available'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

