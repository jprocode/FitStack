import { useState, useEffect } from 'react'
import { userApi } from '@/lib/api'
import { calculateCalorieTargets, calculateAge } from '@/lib/calorieCalculator'
import { lbsToKg, inchesToCm } from '@/lib/unitConversions'
import { useSettingsStore } from '@/store/settingsStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, Flame, TrendingDown, TrendingUp, Activity } from 'lucide-react'

interface CalorieCalculatorToolProps {
    onResultChange?: (targets: ReturnType<typeof calculateCalorieTargets>) => void
}

export function CalorieCalculatorTool({ onResultChange }: CalorieCalculatorToolProps) {
    const { unitSystem } = useSettingsStore()

    const [weight, setWeight] = useState('')
    const [height, setHeight] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState<string>('')
    const [activityLevel, setActivityLevel] = useState<string>('MODERATE')
    const [results, setResults] = useState<ReturnType<typeof calculateCalorieTargets>>(null)

    // Pre-populate from user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userApi.getProfile()
                const profile = response.data

                if (profile.birthDate) {
                    setAge(String(calculateAge(profile.birthDate)))
                }
                if (profile.heightCm) {
                    setHeight(unitSystem === 'metric'
                        ? String(profile.heightCm)
                        : String(Math.round(profile.heightCm / 2.54))
                    )
                }
                if (profile.gender) {
                    setGender(profile.gender.toUpperCase())
                }
                if (profile.activityLevel) {
                    setActivityLevel(profile.activityLevel)
                }
            } catch (error) {
                console.error('Failed to load profile:', error)
            }
        }
        fetchProfile()
    }, [unitSystem])

    const handleCalculate = () => {
        const weightNum = parseFloat(weight)
        const heightNum = parseFloat(height)
        const ageNum = parseInt(age, 10)

        if (!weightNum || !heightNum || !ageNum || !gender) {
            return
        }

        // Convert to metric if imperial
        const weightKg = unitSystem === 'metric' ? weightNum : lbsToKg(weightNum)
        const heightCm = unitSystem === 'metric' ? heightNum : inchesToCm(heightNum)

        const targets = calculateCalorieTargets(weightKg, heightCm, ageNum, gender, activityLevel)
        setResults(targets)
        onResultChange?.(targets)
    }

    const weightLabel = unitSystem === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'
    const heightLabel = unitSystem === 'metric' ? 'Height (cm)' : 'Height (in)'

    return (
        <Card className="glass">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Calorie Calculator
                </CardTitle>
                <CardDescription>
                    Calculate your daily calorie needs using the Mifflin-St Jeor formula
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Inputs */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="calc-weight">{weightLabel}</Label>
                        <Input
                            id="calc-weight"
                            type="number"
                            placeholder={unitSystem === 'metric' ? '70' : '154'}
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="calc-height">{heightLabel}</Label>
                        <Input
                            id="calc-height"
                            type="number"
                            placeholder={unitSystem === 'metric' ? '175' : '69'}
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="calc-age">Age (years)</Label>
                        <Input
                            id="calc-age"
                            type="number"
                            placeholder="30"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="calc-gender">Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger id="calc-gender">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="calc-activity">Activity Level</Label>
                    <Select value={activityLevel} onValueChange={setActivityLevel}>
                        <SelectTrigger id="calc-activity">
                            <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SEDENTARY">Sedentary (little/no exercise)</SelectItem>
                            <SelectItem value="LIGHT">Light (1-3 days/week)</SelectItem>
                            <SelectItem value="MODERATE">Moderate (3-5 days/week)</SelectItem>
                            <SelectItem value="ACTIVE">Active (6-7 days/week)</SelectItem>
                            <SelectItem value="VERY_ACTIVE">Very Active (twice daily)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={handleCalculate} className="w-full">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate
                </Button>

                {/* Results */}
                {results && (
                    <div className="pt-4 border-t space-y-4">
                        <h4 className="font-semibold text-lg">Your Results</h4>

                        <div className="grid gap-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2">
                                    <Flame className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm">Basal Metabolic Rate (BMR)</span>
                                </div>
                                <span className="font-bold">{results.bmr} cal</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm">Maintenance (TDEE)</span>
                                </div>
                                <span className="font-bold text-lg">{results.tdee} cal</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Weight Loss (-0.5kg/week)</span>
                                </div>
                                <span className="font-bold text-green-600">{results.weightLossCalories} cal</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-purple-500" />
                                    <span className="text-sm">Muscle Gain</span>
                                </div>
                                <span className="font-bold text-purple-600">{results.muscleGainCalories} cal</span>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            These are estimates based on the Mifflin-St Jeor equation. Individual needs may vary.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
