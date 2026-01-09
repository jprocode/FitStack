import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, Info } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { calculateBodyFat } from '@/lib/bodyFat'
import { cmToInches, inchesToCm } from '@/lib/unitConversions'

export function BodyFatCalculatorTool() {
    const { unitSystem } = useSettingsStore()
    const [gender, setGender] = useState('male')
    const [height, setHeight] = useState('')
    const [neck, setNeck] = useState('')
    const [waist, setWaist] = useState('')
    const [hips, setHips] = useState('')
    const [result, setResult] = useState<number | null>(null)

    useEffect(() => {
        // Clear result when inputs change
        setResult(null)
    }, [gender, height, neck, waist, hips])

    const handleCalculate = () => {
        const h = parseFloat(height)
        const n = parseFloat(neck)
        const w = parseFloat(waist)
        const hp = parseFloat(hips)

        if (isNaN(h) || isNaN(n) || isNaN(w)) return
        if (gender === 'female' && isNaN(hp)) return

        // Convert to cm if imperial
        const heightCm = unitSystem === 'metric' ? h : inchesToCm(h)
        const neckCm = unitSystem === 'metric' ? n : inchesToCm(n)
        const waistCm = unitSystem === 'metric' ? w : inchesToCm(w)
        const hipsCm = unitSystem === 'metric' && hp ? hp : (hp ? inchesToCm(hp) : undefined)

        const bf = calculateBodyFat(gender, heightCm, neckCm, waistCm, hipsCm)
        setResult(bf)
    }

    const unitLabel = unitSystem === 'metric' ? 'cm' : 'in'

    return (
        <Card className="glass w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Body Fat Calculator
                </CardTitle>
                <CardDescription>
                    Estimate your body fat percentage using the US Navy method
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Height ({unitLabel})</Label>
                        <Input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Neck ({unitLabel})</Label>
                        <Input
                            type="number"
                            value={neck}
                            onChange={(e) => setNeck(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Waist ({unitLabel})</Label>
                        <Input
                            type="number"
                            value={waist}
                            onChange={(e) => setWaist(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    {gender === 'female' && (
                        <div className="space-y-2">
                            <Label>Hips ({unitLabel})</Label>
                            <Input
                                type="number"
                                value={hips}
                                onChange={(e) => setHips(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    )}
                </div>

                <Button className="w-full" onClick={handleCalculate} disabled={!height || !neck || !waist || (gender === 'female' && !hips)}>
                    Calculate
                </Button>

                {result !== null && (
                    <div className="p-4 bg-secondary/50 rounded-lg text-center animate-in fade-in zoom-in duration-300">
                        <p className="text-sm text-muted-foreground mb-1">Estimated Body Fat</p>
                        <p className="text-4xl font-bold text-primary">{result}%</p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                            <Info className="h-3 w-3" />
                            Based on US Navy Formula
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
