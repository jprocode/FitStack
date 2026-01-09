import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { customFoodApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Utensils } from 'lucide-react'

const customFoodSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    brand: z.string().optional(),
    calories: z.coerce.number().positive('Calories must be positive'),
    proteinG: z.coerce.number().min(0).optional(),
    carbsG: z.coerce.number().min(0).optional(),
    fatG: z.coerce.number().min(0).optional(),
    fiberG: z.coerce.number().min(0).optional(),
    servingSize: z.coerce.number().positive().optional(),
    servingUnit: z.string().optional(),
})

type CustomFoodForm = z.infer<typeof customFoodSchema>

interface ManualFoodEntryProps {
    onSuccess?: () => void
    onFoodCreated?: (food: CustomFoodForm) => void
}

export function ManualFoodEntry({ onSuccess, onFoodCreated }: ManualFoodEntryProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CustomFoodForm>({
        resolver: zodResolver(customFoodSchema),
        defaultValues: {
            servingUnit: 'g',
            servingSize: 100,
        },
    })

    const onSubmit = async (data: CustomFoodForm) => {
        setIsSubmitting(true)
        try {
            const response = await customFoodApi.create(data)
            toast({
                title: 'Food created',
                description: `${data.name} has been added to your foods.`,
            })
            reset()
            onSuccess?.()
            onFoodCreated?.(response.data)
        } catch (error) {
            console.error('Failed to create food:', error)
            toast({
                title: 'Error',
                description: 'Failed to create custom food',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="glass">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    Add Custom Food
                </CardTitle>
                <CardDescription>
                    Create a new food with your own nutrition data
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="name">Food Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Homemade Protein Shake"
                                {...register('name')}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="brand">Brand (optional)</Label>
                            <Input
                                id="brand"
                                placeholder="e.g. Homemade"
                                {...register('brand')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="calories">Calories *</Label>
                            <Input
                                id="calories"
                                type="number"
                                placeholder="200"
                                {...register('calories')}
                            />
                            {errors.calories && (
                                <p className="text-sm text-destructive">{errors.calories.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="proteinG">Protein (g)</Label>
                            <Input
                                id="proteinG"
                                type="number"
                                step="0.1"
                                placeholder="25"
                                {...register('proteinG')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="carbsG">Carbs (g)</Label>
                            <Input
                                id="carbsG"
                                type="number"
                                step="0.1"
                                placeholder="15"
                                {...register('carbsG')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fatG">Fat (g)</Label>
                            <Input
                                id="fatG"
                                type="number"
                                step="0.1"
                                placeholder="5"
                                {...register('fatG')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fiberG">Fiber (g)</Label>
                            <Input
                                id="fiberG"
                                type="number"
                                step="0.1"
                                placeholder="2"
                                {...register('fiberG')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="servingSize">Serving Size</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="servingSize"
                                    type="number"
                                    placeholder="100"
                                    {...register('servingSize')}
                                />
                                <Input
                                    id="servingUnit"
                                    placeholder="g"
                                    className="w-20"
                                    {...register('servingUnit')}
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        <Plus className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Creating...' : 'Add Food'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
