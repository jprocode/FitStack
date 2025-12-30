import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { foodApi, mealApi } from '@/lib/api'
import { Food, MealType, CreateMealRequest } from '@/types/nutrition'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Search, Plus, Trash2, Flame, Beef, Wheat, Droplets, X } from 'lucide-react'

interface SelectedFood {
  food: Food
  servings: number
}

export default function MealLog() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [mealType, setMealType] = useState<MealType>('BREAKFAST')
  const [mealName, setMealName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Food[]>([])
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Check if a food was passed from FoodSearch page
  useEffect(() => {
    if (location.state?.selectedFood) {
      const food = location.state.selectedFood as Food
      setSelectedFoods([{ food, servings: 1 }])
      setShowSearch(false)
    }
  }, [location.state])

  const searchFoods = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await foodApi.searchFoods(searchQuery, 10)
      setSearchResults(response.data.foods)
    } catch (error) {
      console.error('Error searching foods:', error)
      toast({
        title: 'Error',
        description: 'Failed to search foods',
        variant: 'destructive',
      })
    } finally {
      setSearching(false)
    }
  }

  const addFood = (food: Food) => {
    const exists = selectedFoods.find((sf) => sf.food.id === food.id)
    if (exists) {
      toast({
        title: 'Already added',
        description: 'This food is already in your meal',
      })
      return
    }
    setSelectedFoods([...selectedFoods, { food, servings: 1 }])
    setSearchQuery('')
    setSearchResults([])
    setShowSearch(false)
  }

  const removeFood = (foodId: number) => {
    setSelectedFoods(selectedFoods.filter((sf) => sf.food.id !== foodId))
  }

  const updateServings = (foodId: number, servings: number) => {
    setSelectedFoods(
      selectedFoods.map((sf) =>
        sf.food.id === foodId ? { ...sf, servings: Math.max(0.1, servings) } : sf
      )
    )
  }

  const calculateTotals = () => {
    return selectedFoods.reduce(
      (acc, { food, servings }) => ({
        calories: acc.calories + (food.calories || 0) * servings,
        protein: acc.protein + (food.proteinG || 0) * servings,
        carbs: acc.carbs + (food.carbsG || 0) * servings,
        fat: acc.fat + (food.fatG || 0) * servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedFoods.length === 0) {
      toast({
        title: 'No foods selected',
        description: 'Please add at least one food to your meal',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const mealData: CreateMealRequest = {
        mealType,
        name: mealName || mealType,
        date,
        notes: notes || undefined,
        foods: selectedFoods.map((sf) => ({
          foodId: sf.food.id,
          servings: sf.servings,
        })),
      }

      await mealApi.createMeal(mealData)
      toast({
        title: 'Meal logged!',
        description: 'Your meal has been saved successfully.',
      })
      navigate('/nutrition/dashboard')
    } catch (error) {
      console.error('Error creating meal:', error)
      toast({
        title: 'Error',
        description: 'Failed to log meal. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Log Meal
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track what you eat by adding foods to your meal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meal Details */}
        <Card>
          <CardHeader>
            <CardTitle>Meal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mealType">Meal Type</Label>
                <Select
                  value={mealType}
                  onValueChange={(value) => setMealType(value as MealType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                    <SelectItem value="LUNCH">Lunch</SelectItem>
                    <SelectItem value="DINNER">Dinner</SelectItem>
                    <SelectItem value="SNACK">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="mealName">Meal Name (optional)</Label>
              <Input
                id="mealName"
                placeholder="e.g., Protein Smoothie, Chicken Salad..."
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Selected Foods */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Foods</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Food
            </Button>
          </CardHeader>
          <CardContent>
            {/* Search Section */}
            {showSearch && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search for a food..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchFoods()}
                      className="pl-9"
                    />
                  </div>
                  <Button type="button" onClick={searchFoods} disabled={searching}>
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowSearch(false)
                      setSearchResults([])
                      setSearchQuery('')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((food) => (
                      <div
                        key={food.id || food.fdcId}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => addFood(food)}
                      >
                        <div>
                          <p className="font-medium text-sm">{food.name}</p>
                          <p className="text-xs text-gray-500">
                            {food.calories?.toFixed(0)} kcal | {food.servingSize || '100g'}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-emerald-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected Foods List */}
            {selectedFoods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No foods added yet. Click "Add Food" to search and add foods.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedFoods.map(({ food, servings }) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {food.name}
                      </h4>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                        <span>{((food.calories || 0) * servings).toFixed(0)} kcal</span>
                        <span>{((food.proteinG || 0) * servings).toFixed(1)}g protein</span>
                        <span>{((food.carbsG || 0) * servings).toFixed(1)}g carbs</span>
                        <span>{((food.fatG || 0) * servings).toFixed(1)}g fat</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-500">Servings:</Label>
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={servings}
                          onChange={(e) =>
                            updateServings(food.id, parseFloat(e.target.value) || 0.1)
                          }
                          className="w-20"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFood(food.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        {selectedFoods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Meal Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">
                    {totals.calories.toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-500">Calories</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Beef className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">
                    {totals.protein.toFixed(1)}g
                  </p>
                  <p className="text-sm text-gray-500">Protein</p>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Wheat className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-600">
                    {totals.carbs.toFixed(1)}g
                  </p>
                  <p className="text-sm text-gray-500">Carbs</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {totals.fat.toFixed(1)}g
                  </p>
                  <p className="text-sm text-gray-500">Fat</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/nutrition/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || selectedFoods.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? 'Saving...' : 'Log Meal'}
          </Button>
        </div>
      </form>
    </div>
  )
}

