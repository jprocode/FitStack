import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mealPlanApi } from '@/lib/api'
import { MealPlan } from '@/types/nutrition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import {
  Sparkles,
  ArrowLeft,
  Trash2,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Calendar,
  Tag,
} from 'lucide-react'

export default function MealPlanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchMealPlan = async () => {
      if (!id) return

      setLoading(true)
      try {
        const response = await mealPlanApi.getMealPlan(Number(id))
        setMealPlan(response.data)
      } catch (error) {
        console.error('Error fetching meal plan:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch meal plan',
          variant: 'destructive',
        })
        navigate('/nutrition/meal-plans')
      } finally {
        setLoading(false)
      }
    }

    fetchMealPlan()
  }, [id, navigate, toast])

  const handleDelete = async () => {
    if (!mealPlan) return

    setDeleting(true)
    try {
      await mealPlanApi.deleteMealPlan(mealPlan.id)
      toast({
        title: 'Meal plan deleted',
        description: 'The meal plan has been removed.',
      })
      navigate('/nutrition/meal-plans')
    } catch (error) {
      console.error('Error deleting meal plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete meal plan',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Parse dietary prefs from JSON string if needed
  const getDietaryPrefs = (): string[] => {
    if (!mealPlan?.dietaryPrefs) return []
    if (typeof mealPlan.dietaryPrefs === 'string') {
      try {
        return JSON.parse(mealPlan.dietaryPrefs)
      } catch {
        return mealPlan.dietaryPrefs.split(',').filter(Boolean)
      }
    }
    return mealPlan.dietaryPrefs as unknown as string[]
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (!mealPlan) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-center text-gray-500">Meal plan not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/nutrition/meal-plans')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              {mealPlan.name}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              Created on {formatDate(mealPlan.createdAt)}
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      {/* Targets Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Nutritional Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">
                {mealPlan.targetCalories?.toFixed(0)}
              </p>
              <p className="text-sm text-gray-500">Calories</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Beef className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">
                {mealPlan.targetProtein?.toFixed(0)}g
              </p>
              <p className="text-sm text-gray-500">Protein</p>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <Wheat className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-600">
                {mealPlan.targetCarbs?.toFixed(0)}g
              </p>
              <p className="text-sm text-gray-500">Carbs</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {mealPlan.targetFat?.toFixed(0)}g
              </p>
              <p className="text-sm text-gray-500">Fat</p>
            </div>
          </div>

          {/* Dietary Preferences */}
          {getDietaryPrefs().length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dietary Preferences:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getDietaryPrefs().map((pref) => (
                  <span
                    key={pref}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Generated Meal Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {mealPlan.generatedPlan}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

