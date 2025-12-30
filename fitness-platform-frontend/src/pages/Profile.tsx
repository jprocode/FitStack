import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { userApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, User } from 'lucide-react'
import type { UserProfile } from '@/types/auth'

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  heightCm: z.coerce.number().min(50).max(300).optional().or(z.literal('')),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  activityLevel: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
]

const activityLevelOptions = [
  { value: 'SEDENTARY', label: 'Sedentary (little or no exercise)' },
  { value: 'LIGHT', label: 'Light (exercise 1-3 days/week)' },
  { value: 'MODERATE', label: 'Moderate (exercise 3-5 days/week)' },
  { value: 'ACTIVE', label: 'Active (exercise 6-7 days/week)' },
  { value: 'VERY_ACTIVE', label: 'Very Active (intense exercise daily)' },
]

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { updateUser } = useAuthStore()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userApi.getProfile()
        const profile: UserProfile = response.data
        setValue('firstName', profile.firstName || '')
        setValue('lastName', profile.lastName || '')
        setValue('heightCm', profile.heightCm || '')
        setValue('birthDate', profile.birthDate || '')
        setValue('gender', profile.gender || '')
        setValue('activityLevel', profile.activityLevel || '')
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [setValue])

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true)
    try {
      const response = await userApi.updateProfile({
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        heightCm: data.heightCm || null,
        birthDate: data.birthDate || null,
        gender: data.gender || null,
        activityLevel: data.activityLevel || null,
      })
      const profile: UserProfile = response.data
      updateUser({ firstName: profile.firstName, lastName: profile.lastName })
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Failed to update your profile.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-semibold">
              {watch('firstName')?.[0] || <User className="h-8 w-8" />}
            </div>
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register('firstName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register('lastName')} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="heightCm">Height (cm)</Label>
                <Input
                  id="heightCm"
                  type="number"
                  placeholder="175"
                  {...register('heightCm')}
                />
                {errors.heightCm && (
                  <p className="text-sm text-destructive">{errors.heightCm.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register('birthDate')}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={watch('gender') || ''}
                  onValueChange={(value) => setValue('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select
                  value={watch('activityLevel') || ''}
                  onValueChange={(value) => setValue('activityLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

