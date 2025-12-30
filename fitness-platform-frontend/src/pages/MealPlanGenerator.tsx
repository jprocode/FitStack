import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mealPlanApi } from '@/lib/api'
import { GenerateMealPlanRequest } from '@/types/nutrition'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Sparkles, Loader2, Flame, Beef, Wheat, Droplets } from 'lucide-react'

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'dairy-free', label: 'Dairy Free' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'low-carb', label: 'Low Carb' },
  { id: 'high-protein', label: 'High Protein' },
  { id: 'nut-free', label: 'Nut Free' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
]

export default function MealPlanGenerator() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [targetCalories, setTargetCalories] = useState(2000)
  const [targetProtein, setTargetProtein] = useState(150)
  const [targetCarbs, setTargetCarbs] = useState(200)
  const [targetFat, setTargetFat] = useState(65)
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)

  const togglePref = (pref: string) => {
    if (selectedPrefs.includes(pref)) {
      setSelectedPrefs(selectedPrefs.filter((p) => p !== pref))
    } else {
      setSelectedPrefs([...selectedPrefs, pref])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your meal plan',
        variant: 'destructive',
      })
      return
    }

    setGenerating(true)
    try {
      const request: GenerateMealPlanRequest = {
        name,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        dietaryPrefs: selectedPrefs,
      }

      const response = await mealPlanApi.generateMealPlan(request)
      toast({
        title: 'Meal plan generated!',
        description: 'Your personalized meal plan is ready.',
      })
      navigate(`/nutrition/meal-plans/${response.data.id}`)
    } catch (error) {
      console.error('Error generating meal plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate meal plan. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-600" />
          AI Meal Plan Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your nutritional targets and preferences to generate a personalized meal plan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Name */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                placeholder="e.g., Weight Loss Week 1, Muscle Building Plan..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Nutritional Targets */}
        <Card>
          <CardHeader>
            <CardTitle>Nutritional Targets</CardTitle>
            <CardDescription>
              Set your daily macro targets for the meal plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="calories" className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Calories
                </Label>
                <Input
                  id="calories"
                  type="number"
                  min="1000"
                  max="5000"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">kcal/day</p>
              </div>
              <div>
                <Label htmlFor="protein" className="flex items-center gap-2">
                  <Beef className="h-4 w-4 text-red-500" />
                  Protein
                </Label>
                <Input
                  id="protein"
                  type="number"
                  min="30"
                  max="400"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(Number(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">grams/day</p>
              </div>
              <div>
                <Label htmlFor="carbs" className="flex items-center gap-2">
                  <Wheat className="h-4 w-4 text-amber-500" />
                  Carbs
                </Label>
                <Input
                  id="carbs"
                  type="number"
                  min="50"
                  max="500"
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(Number(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">grams/day</p>
              </div>
              <div>
                <Label htmlFor="fat" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  Fat
                </Label>
                <Input
                  id="fat"
                  type="number"
                  min="20"
                  max="200"
                  value={targetFat}
                  onChange={(e) => setTargetFat(Number(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">grams/day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Dietary Preferences</CardTitle>
            <CardDescription>
              Select any dietary restrictions or preferences (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => togglePref(option.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedPrefs.includes(option.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/nutrition/meal-plans')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={generating}
            className="bg-purple-600 hover:bg-purple-700 min-w-[200px]"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Meal Plan
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Loading Overlay */}
      {generating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Sparkles className="h-12 w-12 text-purple-600 mx-auto animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-2">Generating Your Meal Plan</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our AI is creating a personalized meal plan based on your targets and preferences...
              </p>
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                This may take up to a minute
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

