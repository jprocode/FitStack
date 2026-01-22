import { useState, useEffect, useCallback } from 'react'
import { exerciseApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

interface Exercise {
    id: number
    name: string
    muscleGroup: string
    equipment?: string
    gifUrl?: string
}

interface ExerciseSelectorModalProps {
    open: boolean
    onClose: () => void
    onSelectExercise: (exercise: Exercise) => void
    title?: string
}

export function ExerciseSelectorModal({
    open,
    onClose,
    onSelectExercise,
    title = 'Add Exercise',
}: ExerciseSelectorModalProps) {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [muscleGroups, setMuscleGroups] = useState<string[]>([])
    const [equipmentList, setEquipmentList] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [search, setSearch] = useState('')
    const [muscleGroup, setMuscleGroup] = useState<string>('')
    const [equipment, setEquipment] = useState<string>('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    const fetchExercises = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await exerciseApi.getExercises({
                search: search || undefined,
                muscleGroup: muscleGroup || undefined,
                equipment: equipment || undefined,
                page,
                size: 20,
            })
            const data = response.data
            setExercises(data.content || [])
            setTotalPages(data.totalPages || 0)
            setTotalElements(data.totalElements || 0)
        } catch (error) {
            console.error('Failed to fetch exercises:', error)
        } finally {
            setIsLoading(false)
        }
    }, [search, muscleGroup, equipment, page])

    // Fetch exercises when modal opens or filters change
    useEffect(() => {
        if (open) {
            fetchExercises()
        }
    }, [open, fetchExercises])

    // Fetch filter options once when modal opens
    useEffect(() => {
        if (open && muscleGroups.length === 0) {
            const fetchFilters = async () => {
                try {
                    const [muscleRes, equipRes] = await Promise.all([
                        exerciseApi.getMuscleGroups(),
                        exerciseApi.getEquipment(),
                    ])
                    setMuscleGroups(muscleRes.data || [])
                    setEquipmentList(equipRes.data || [])
                } catch (error) {
                    console.error('Failed to fetch filters:', error)
                }
            }
            fetchFilters()
        }
    }, [open, muscleGroups.length])

    const handleSelect = (exercise: Exercise) => {
        onSelectExercise(exercise)
        // Don't close - let user add multiple exercises
    }

    const handleSearchChange = (value: string) => {
        setSearch(value)
        setPage(0)
    }

    const resetFilters = () => {
        setSearch('')
        setMuscleGroup('')
        setEquipment('')
        setPage(0)
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{title}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                            {totalElements} exercises
                        </span>
                    </DialogTitle>
                </DialogHeader>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search exercises..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={muscleGroup || 'all'}
                        onValueChange={(v) => { setMuscleGroup(v === 'all' ? '' : v); setPage(0); }}
                    >
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="Muscle Group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Muscles</SelectItem>
                            {muscleGroups.map((group) => (
                                <SelectItem key={group} value={group}>{group}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={equipment || 'all'}
                        onValueChange={(v) => { setEquipment(v === 'all' ? '' : v); setPage(0); }}
                    >
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="Equipment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Equipment</SelectItem>
                            {equipmentList.map((equip) => (
                                <SelectItem key={equip} value={equip}>{equip}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {(search || muscleGroup || equipment) && (
                        <Button variant="ghost" size="sm" onClick={resetFilters}>
                            Clear
                        </Button>
                    )}
                </div>

                {/* Exercise List */}
                <div className="flex-1 overflow-y-auto min-h-[300px]">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : exercises.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <p>No exercises found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {exercises.map((exercise) => (
                                <div
                                    key={exercise.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{exercise.name}</p>
                                        <div className="flex gap-2 text-xs text-muted-foreground">
                                            <span>{exercise.muscleGroup}</span>
                                            {exercise.equipment && (
                                                <>
                                                    <span>•</span>
                                                    <span>{exercise.equipment}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleSelect(exercise)}
                                        className="ml-2 shrink-0"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {page + 1} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}

                {/* Done Button */}
                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={onClose}>Done</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
