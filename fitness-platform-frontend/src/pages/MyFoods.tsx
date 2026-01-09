import { useState, useEffect } from 'react'
import { customFoodApi } from '@/lib/api'
import { ManualFoodEntry } from '@/components/nutrition/ManualFoodEntry'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import {
    Plus,
    Search,
    Trash2,
    Edit,
    Utensils,
    Apple,
} from 'lucide-react'

interface CustomFood {
    id: number
    name: string
    brand?: string
    calories: number
    proteinG?: number
    carbsG?: number
    fatG?: number
    fiberG?: number
    servingSize?: number
    servingUnit?: string
    createdAt: string
}

export default function MyFoods() {
    const { toast } = useToast()
    const [foods, setFoods] = useState<CustomFood[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const fetchFoods = async () => {
        setLoading(true)
        try {
            const response = await customFoodApi.getMyFoods()
            setFoods(response.data)
        } catch (error) {
            console.error('Failed to fetch foods:', error)
            toast({
                title: 'Error',
                description: 'Failed to load your foods',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFoods()
    }, [])

    const handleDelete = async (id: number) => {
        setDeletingId(id)
        try {
            await customFoodApi.delete(id)
            setFoods(foods.filter(f => f.id !== id))
            toast({
                title: 'Food deleted',
                description: 'The food has been removed from your list.',
            })
        } catch (error) {
            console.error('Failed to delete food:', error)
            toast({
                title: 'Error',
                description: 'Failed to delete food',
                variant: 'destructive',
            })
        } finally {
            setDeletingId(null)
        }
    }

    const filteredFoods = foods.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.brand && food.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Apple className="h-8 w-8 text-primary" />
                        My Foods
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your custom foods library
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="mt-4 md:mt-0">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Food
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Custom Food</DialogTitle>
                        </DialogHeader>
                        <ManualFoodEntry
                            onSuccess={() => {
                                setIsCreateDialogOpen(false)
                                fetchFoods()
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search your foods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Foods List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredFoods.length === 0 ? (
                <Card className="glass">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {searchQuery ? 'No foods found' : 'No custom foods yet'}
                        </h3>
                        <p className="text-muted-foreground text-center mb-4">
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Create your first custom food to get started'}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Food
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredFoods.map((food) => (
                        <Card key={food.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {food.name}
                                            </h3>
                                            {food.brand && (
                                                <span className="text-sm text-muted-foreground">
                                                    ({food.brand})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span className="font-medium text-orange-600">
                                                {food.calories} cal
                                            </span>
                                            {food.proteinG && (
                                                <span className="text-red-600">P: {food.proteinG}g</span>
                                            )}
                                            {food.carbsG && (
                                                <span className="text-amber-600">C: {food.carbsG}g</span>
                                            )}
                                            {food.fatG && (
                                                <span className="text-blue-600">F: {food.fatG}g</span>
                                            )}
                                        </div>
                                        {food.servingSize && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Serving: {food.servingSize}{food.servingUnit || 'g'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(food.id)}
                                            disabled={deletingId === food.id}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Stats */}
            {foods.length > 0 && (
                <div className="mt-8 text-center text-sm text-muted-foreground">
                    {foods.length} custom food{foods.length !== 1 ? 's' : ''} in your library
                </div>
            )}
        </div>
    )
}
