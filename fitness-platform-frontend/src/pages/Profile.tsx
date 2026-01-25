import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { userApi, authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { UnitToggle } from '@/components/UnitToggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, User, Settings as SettingsIcon, Trash2, AlertTriangle } from 'lucide-react'
import type { UserProfile } from '@/types/auth'
import { cmToFeetInches, feetInchesToCm } from '@/lib/unitConversions'

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const { user, updateUser, logout } = useAuthStore()
  const { unitSystem } = useSettingsStore()
  const { toast } = useToast()
  const isOAuthUser = user?.isOAuthUser ?? false

  // Local state for Imperial height input
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  // sync heightCm changes to local Ft/In state for display
  const heightCm = watch('heightCm')

  useEffect(() => {
    if (heightCm && !isNaN(Number(heightCm))) {
      const { feet, inches } = cmToFeetInches(Number(heightCm))
      setHeightFt(feet.toString())
      setHeightIn(inches.toString())
    }
  }, [heightCm])

  // Handle imperial height changes
  const handleImperialHeightChange = (ft: string, inc: string) => {
    setHeightFt(ft)
    setHeightIn(inc)

    if (ft && inc) {
      const cm = feetInchesToCm(Number(ft), Number(inc))
      setValue('heightCm', cm, { shouldDirty: true })
    }
  }

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

  const handleDeleteAccount = async () => {
    // Password required only for non-OAuth users
    if (!isOAuthUser && !deletePassword) {
      toast({
        variant: 'destructive',
        title: 'Password required',
        description: 'Please enter your password to confirm deletion.',
      })
      return
    }

    setIsDeleting(true)
    try {
      await authApi.deleteAccount(isOAuthUser ? '' : deletePassword)
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
      })
      logout()
      window.location.href = '/login'
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: isOAuthUser
          ? 'Failed to delete account. Please try again.'
          : 'Failed to delete account. Please check your password.',
      })
    } finally {
      setIsDeleting(false)
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

      {/* Preferences Card */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
            <div className="space-y-0.5">
              <Label className="text-base">Unit System</Label>
              <p className="text-sm text-muted-foreground">
                Choose between Metric (kg/cm) and Imperial (lbs/in)
              </p>
            </div>
            <UnitToggle />
          </div>
        </CardContent>
      </Card>

      {/* Personal Info Card */}
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
                <Label>Height</Label>
                {unitSystem === 'metric' ? (
                  <div className="relative">
                    <Input
                      id="heightCm"
                      type="number"
                      placeholder="175"
                      {...register('heightCm')}
                    />
                    <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">cm</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        placeholder="5"
                        value={heightFt}
                        onChange={(e) => handleImperialHeightChange(e.target.value, heightIn)}
                      />
                      <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">ft</span>
                    </div>
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        placeholder="10"
                        value={heightIn}
                        onChange={(e) => handleImperialHeightChange(heightFt, e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">in</span>
                    </div>
                  </div>
                )}
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

      {/* Danger Zone - Delete Account */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
              <div className="space-y-0.5">
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </Button>
            </div>
          ) : (
            <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Are you absolutely sure?</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This action cannot be undone. This will permanently delete your account,
                    workouts, meal logs, and all associated data.
                  </p>
                </div>
              </div>
              {!isOAuthUser && (
                <div className="space-y-2">
                  <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    placeholder="Your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletePassword('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || (!isOAuthUser && !deletePassword)}
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Yes, Delete My Account
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
