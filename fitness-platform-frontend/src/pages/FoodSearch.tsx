import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { foodApi } from '@/lib/api'
import { Food, FoodSearchResponse } from '@/types/nutrition'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Search, Plus, Flame, Beef, Wheat, Droplets } from 'lucide-react'

// Debounce hook
function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      const newTimeoutId = setTimeout(() => {
        callback(...args)
      }, delay)
      setTimeoutId(newTimeoutId)
    },
    [callback, delay, timeoutId]
  ) as T

  return debouncedCallback
}

export default function FoodSearch() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const searchFoods = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFoods([])
      setSearched(false)
      return
    }

    setLoading(true)
    try {
      const response = await foodApi.searchFoods(searchQuery)
      const data: FoodSearchResponse = response.data
      setFoods(data.foods)
      setSearched(true)
    } catch (error) {
      console.error('Error searching foods:', error)
      toast({
        title: 'Error',
        description: 'Failed to search foods. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebounce(searchFoods, 500)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  const handleAddToMeal = (food: Food) => {
    navigate('/nutrition/log', { state: { selectedFood: food } })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Food Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Search for foods to add to your meals
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search for foods (e.g., chicken breast, rice, banana...)"
          value={query}
          onChange={handleInputChange}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Searching...</span>
        </div>
      )}

      {/* Results */}
      {!loading && searched && foods.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No foods found for "{query}". Try a different search term.
          </p>
        </div>
      )}

      {!loading && foods.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Found {foods.length} results for "{query}"
          </p>

          {foods.map((food) => (
            <Card key={food.id || food.fdcId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {food.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Per {food.servingSize || '100g'}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-orange-600">
                        <Flame className="h-4 w-4" />
                        <span>{food.calories?.toFixed(0) || 0} kcal</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <Beef className="h-4 w-4" />
                        <span>{food.proteinG?.toFixed(1) || 0}g protein</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Wheat className="h-4 w-4" />
                        <span>{food.carbsG?.toFixed(1) || 0}g carbs</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <Droplets className="h-4 w-4" />
                        <span>{food.fatG?.toFixed(1) || 0}g fat</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAddToMeal(food)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Initial State */}
      {!loading && !searched && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Start typing to search for foods
          </p>
        </div>
      )}
    </div>
  )
}

