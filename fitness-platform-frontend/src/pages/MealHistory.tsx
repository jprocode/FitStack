import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { mealApi } from '@/lib/api'
import { Meal } from '@/types/nutrition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Calendar, Trash2, ChevronDown, ChevronUp, Utensils } from 'lucide-react'

interface GroupedMeals {
  [date: string]: Meal[]
}

export default function MealHistory() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [deletingMeal, setDeletingMeal] = useState<number | null>(null)

  const fetchMeals = async () => {
    setLoading(true)
    try {
      const response = await mealApi.getMeals(startDate, endDate)
      setMeals(response.data)
    } catch (error) {
      console.error('Error fetching meals:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch meal history',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeals()
  }, [startDate, endDate])

  const handleDeleteMeal = async (mealId: number) => {
    setDeletingMeal(mealId)
    try {
      await mealApi.deleteMeal(mealId)
      toast({
        title: 'Meal deleted',
        description: 'The meal has been removed.',
      })
      setMeals(meals.filter((m) => m.id !== mealId))
    } catch (error) {
      console.error('Error deleting meal:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete meal',
        variant: 'destructive',
      })
    } finally {
      setDeletingMeal(null)
    }
  }

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDates(newExpanded)
  }

  // Group meals by date
  const groupedMeals: GroupedMeals = meals.reduce((acc, meal) => {
    const date = meal.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(meal)
    return acc
  }, {} as GroupedMeals)

  const sortedDates = Object.keys(groupedMeals).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (dateStr === today) return 'Today'
    if (dateStr === yesterdayStr) return 'Yesterday'

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'BREAKFAST':
        return '🌅'
      case 'LUNCH':
        return '☀️'
      case 'DINNER':
        return '🌙'
      case 'SNACK':
        return '🍎'
      default:
        return '🍽️'
    }
  }

  const calculateDayTotals = (dayMeals: Meal[]) => {
    return dayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.totalCalories || 0),
        protein: acc.protein + (meal.totalProtein || 0),
        carbs: acc.carbs + (meal.totalCarbs || 0),
        fat: acc.fat + (meal.totalFat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Meal History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your past meals
        </p>
      </div>

      {/* Date Filters */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="startDate">From</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">To</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/nutrition/dashboard')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : sortedDates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Utensils className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No meals found in this date range
            </p>
            <Button
              onClick={() => navigate('/nutrition/log')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Log a Meal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const dayMeals = groupedMeals[date]
            const totals = calculateDayTotals(dayMeals)
            const isExpanded = expandedDates.has(date)

            return (
              <Card key={date}>
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => toggleDate(date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{formatDate(date)}</CardTitle>
                      <span className="text-sm text-gray-500">
                        {dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-right hidden md:block">
                        <span className="text-orange-600 font-medium">
                          {totals.calories.toFixed(0)} kcal
                        </span>
                        <span className="text-gray-400 mx-2">|</span>
                        <span className="text-red-600">
                          {totals.protein.toFixed(0)}g P
                        </span>
                        <span className="text-gray-400 mx-1">•</span>
                        <span className="text-amber-600">
                          {totals.carbs.toFixed(0)}g C
                        </span>
                        <span className="text-gray-400 mx-1">•</span>
                        <span className="text-blue-600">
                          {totals.fat.toFixed(0)}g F
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {dayMeals.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {getMealTypeIcon(meal.mealType)}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {meal.name || meal.mealType}
                              </p>
                              <p className="text-sm text-gray-500">
                                {meal.foods?.length || 0} items •{' '}
                                {meal.totalCalories?.toFixed(0)} kcal
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-right hidden sm:block">
                              <span className="text-red-600">
                                {meal.totalProtein?.toFixed(0)}g
                              </span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span className="text-amber-600">
                                {meal.totalCarbs?.toFixed(0)}g
                              </span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span className="text-blue-600">
                                {meal.totalFat?.toFixed(0)}g
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMeal(meal.id)
                              }}
                              disabled={deletingMeal === meal.id}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

