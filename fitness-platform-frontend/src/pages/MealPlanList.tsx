import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { mealPlanApi } from '@/lib/api'
import { MealPlan } from '@/types/nutrition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Sparkles, Plus, Trash2, ChevronRight, Flame, Beef, Wheat, Droplets } from 'lucide-react'

export default function MealPlanList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingPlan, setDeletingPlan] = useState<number | null>(null)

  const fetchMealPlans = async () => {
    setLoading(true)
    try {
      const response = await mealPlanApi.getMealPlans()
      setMealPlans(response.data)
    } catch (error) {
      console.error('Error fetching meal plans:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch meal plans',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMealPlans()
  }, [])

  const handleDelete = async (e: React.MouseEvent, planId: number) => {
    e.stopPropagation()
    setDeletingPlan(planId)
    try {
      await mealPlanApi.deleteMealPlan(planId)
      toast({
        title: 'Meal plan deleted',
        description: 'The meal plan has been removed.',
      })
      setMealPlans(mealPlans.filter((p) => p.id !== planId))
    } catch (error) {
      console.error('Error deleting meal plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete meal plan',
        variant: 'destructive',
      })
    } finally {
      setDeletingPlan(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-600" />
            Meal Plans
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your AI-generated meal plans
          </p>
        </div>
        <Button
          onClick={() => navigate('/nutrition/meal-plans/generate')}
          className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generate New Plan
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : mealPlans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No meal plans yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Generate your first AI-powered meal plan to get started
            </p>
            <Button
              onClick={() => navigate('/nutrition/meal-plans/generate')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Meal Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mealPlans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/nutrition/meal-plans/${plan.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Created on {formatDate(plan.createdAt)}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-orange-600">
                        <Flame className="h-4 w-4" />
                        <span>{plan.targetCalories?.toFixed(0)} kcal</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <Beef className="h-4 w-4" />
                        <span>{plan.targetProtein?.toFixed(0)}g protein</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Wheat className="h-4 w-4" />
                        <span>{plan.targetCarbs?.toFixed(0)}g carbs</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <Droplets className="h-4 w-4" />
                        <span>{plan.targetFat?.toFixed(0)}g fat</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(e, plan.id)}
                      disabled={deletingPlan === plan.id}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
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

