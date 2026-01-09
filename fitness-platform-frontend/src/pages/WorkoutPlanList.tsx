import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workoutPlanApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
    Plus,
    Calendar,
    ListOrdered,
    Trash2,
    Edit,
    Dumbbell,
    ChevronRight,
} from 'lucide-react'

interface WorkoutPlan {
    id: number
    name: string
    description?: string
    planType: 'WEEKLY' | 'NUMBERED'
    isActive: boolean
    days?: WorkoutPlanDay[]
    createdAt: string
}

interface WorkoutPlanDay {
    id: number
    dayIdentifier: string
    name?: string
    orderIndex: number
    exercises: unknown[]
}

export default function WorkoutPlanList() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const [plans, setPlans] = useState<WorkoutPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const fetchPlans = async () => {
        setLoading(true)
        try {
            const response = await workoutPlanApi.getPlans()
            setPlans(response.data)
        } catch (error) {
            console.error('Failed to fetch plans:', error)
            toast({
                title: 'Error',
                description: 'Failed to load workout plans',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPlans()
    }, [])

    const handleDelete = async (id: number) => {
        setDeletingId(id)
        try {
            await workoutPlanApi.deletePlan(id)
            setPlans(plans.filter(p => p.id !== id))
            toast({
                title: 'Plan deleted',
                description: 'The workout plan has been removed.',
            })
        } catch (error) {
            console.error('Failed to delete plan:', error)
            toast({
                title: 'Error',
                description: 'Failed to delete plan',
                variant: 'destructive',
            })
        } finally {
            setDeletingId(null)
        }
    }

    const formatDayIdentifier = (planType: string, identifier: string) => {
        if (planType === 'WEEKLY') {
            return identifier.charAt(0) + identifier.slice(1).toLowerCase()
        }
        return `Day ${identifier}`
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Dumbbell className="h-8 w-8 text-primary" />
                        Workout Plans
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create and manage your multi-day workout programs
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/plans/new')}
                    className="mt-4 md:mt-0"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                </Button>
            </div>

            {/* Plans List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : plans.length === 0 ? (
                <Card className="glass">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No workout plans yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Create your first multi-day workout plan to get started
                        </p>
                        <Button onClick={() => navigate('/plans/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Plan
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(`/plans/${plan.id}`)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                {plan.name}
                                            </h3>
                                            <Badge variant={plan.planType === 'WEEKLY' ? 'default' : 'secondary'}>
                                                {plan.planType === 'WEEKLY' ? (
                                                    <>
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        Weekly
                                                    </>
                                                ) : (
                                                    <>
                                                        <ListOrdered className="h-3 w-3 mr-1" />
                                                        Numbered
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                        {plan.description && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {plan.description}
                                            </p>
                                        )}
                                        {plan.days && plan.days.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {plan.days.slice(0, 7).map((day) => (
                                                    <span
                                                        key={day.id}
                                                        className="text-xs px-2 py-1 bg-muted rounded-full"
                                                    >
                                                        {day.name || formatDayIdentifier(plan.planType, day.dayIdentifier)}
                                                    </span>
                                                ))}
                                                {plan.days.length > 7 && (
                                                    <span className="text-xs px-2 py-1 text-muted-foreground">
                                                        +{plan.days.length - 7} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/plans/${plan.id}/edit`)
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(plan.id)
                                            }}
                                            disabled={deletingId === plan.id}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
