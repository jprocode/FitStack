import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { mealApi } from '@/lib/api'
import { DailyMacrosResponse, Meal } from '@/types/nutrition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import {
  Plus,
  Search,
  Flame,
  Beef,
  Wheat,
  Droplets,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Utensils,
  Sparkles,
} from 'lucide-react'

// Default daily targets (could be made configurable)
const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
}

export default function NutritionDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyData, setDailyData] = useState<DailyMacrosResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingMeal, setDeletingMeal] = useState<number | null>(null)

  const fetchDailyData = async () => {
    setLoading(true)
    try {
      const response = await mealApi.getDailyMacros(date)
      setDailyData(response.data)
    } catch (error) {
      console.error('Error fetching daily data:', error)
      // Set empty data on error
      setDailyData({
        date,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: [],
        mealCount: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailyData()
  }, [date])

  const handleDeleteMeal = async (mealId: number) => {
    setDeletingMeal(mealId)
    try {
      await mealApi.deleteMeal(mealId)
      toast({
        title: 'Meal deleted',
        description: 'The meal has been removed.',
      })
      fetchDailyData()
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

  const changeDate = (days: number) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + days)
    setDate(newDate.toISOString().split('T')[0])
  }

  const isToday = date === new Date().toISOString().split('T')[0]

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage < 50) return 'bg-red-500'
    if (percentage < 80) return 'bg-yellow-500'
    if (percentage <= 110) return 'bg-emerald-500'
    return 'bg-red-500'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Nutrition Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your daily nutrition intake
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate('/nutrition/search')}
          >
            <Search className="h-4 w-4 mr-2" />
            Search Foods
          </Button>
          <Button
            onClick={() => navigate('/nutrition/log')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Meal
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/nutrition/meal-plans')}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Meal Plans
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {isToday ? 'Today' : formatDate(date)}
          </p>
          {!isToday && (
            <button
              onClick={() => setDate(new Date().toISOString().split('T')[0])}
              className="text-sm text-emerald-600 hover:underline"
            >
              Jump to today
            </button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => changeDate(1)}
          disabled={isToday}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <>
          {/* Macro Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Calories */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Calories
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {dailyData?.totalCalories?.toFixed(0) || 0}
                  <span className="text-sm font-normal text-gray-500">
                    {' '}/ {DEFAULT_TARGETS.calories}
                  </span>
                </p>
                <Progress
                  value={getProgressPercentage(
                    dailyData?.totalCalories || 0,
                    DEFAULT_TARGETS.calories
                  )}
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Protein */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Beef className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Protein
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {dailyData?.totalProtein?.toFixed(0) || 0}g
                  <span className="text-sm font-normal text-gray-500">
                    {' '}/ {DEFAULT_TARGETS.protein}g
                  </span>
                </p>
                <Progress
                  value={getProgressPercentage(
                    dailyData?.totalProtein || 0,
                    DEFAULT_TARGETS.protein
                  )}
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Carbs */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wheat className="h-5 w-5 text-amber-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Carbs
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {dailyData?.totalCarbs?.toFixed(0) || 0}g
                  <span className="text-sm font-normal text-gray-500">
                    {' '}/ {DEFAULT_TARGETS.carbs}g
                  </span>
                </p>
                <Progress
                  value={getProgressPercentage(
                    dailyData?.totalCarbs || 0,
                    DEFAULT_TARGETS.carbs
                  )}
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Fat */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Fat
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {dailyData?.totalFat?.toFixed(0) || 0}g
                  <span className="text-sm font-normal text-gray-500">
                    {' '}/ {DEFAULT_TARGETS.fat}g
                  </span>
                </p>
                <Progress
                  value={getProgressPercentage(
                    dailyData?.totalFat || 0,
                    DEFAULT_TARGETS.fat
                  )}
                  className="h-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Meals List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Meals ({dailyData?.mealCount || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!dailyData?.meals || dailyData.meals.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No meals logged for this day
                  </p>
                  <Button
                    onClick={() => navigate('/nutrition/log')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Log Your First Meal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dailyData.meals.map((meal: Meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">
                          {getMealTypeIcon(meal.mealType)}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {meal.name || meal.mealType}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {meal.foods?.length || 0} items • {meal.totalCalories?.toFixed(0)} kcal
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm hidden md:block">
                          <p>
                            <span className="text-red-600">
                              {meal.totalProtein?.toFixed(0)}g P
                            </span>
                            {' • '}
                            <span className="text-amber-600">
                              {meal.totalCarbs?.toFixed(0)}g C
                            </span>
                            {' • '}
                            <span className="text-blue-600">
                              {meal.totalFat?.toFixed(0)}g F
                            </span>
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMeal(meal.id)}
                          disabled={deletingMeal === meal.id}
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
        </>
      )}
    </div>
  )
}

