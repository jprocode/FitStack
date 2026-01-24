import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { Activity, Loader2, AlertCircle, Clock } from 'lucide-react'
import type { AuthResponse } from '@/types/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

// Helper to parse rate limit messages
function parseRateLimitError(message: string): { isRateLimited: boolean; minutes?: number } {
  const match = message.match(/Try again in (\d+) minutes?/i)
  if (match) {
    return { isRateLimited: true, minutes: parseInt(match[1], 10) }
  }
  if (message.toLowerCase().includes('too many') || message.toLowerCase().includes('rate limit')) {
    return { isRateLimited: true }
  }
  return { isRateLimited: false }
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<{ minutes?: number } | null>(null)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setRateLimitInfo(null)
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      })
      const authData: AuthResponse = response.data
      setAuth(
        authData.token,
        authData.user,
        authData.expiresIn,
        authData.refreshToken,
        authData.refreshTokenExpiresIn
      )
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      })
      navigate('/dashboard')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Invalid email or password'
      const rateLimitParsed = parseRateLimitError(message)

      if (rateLimitParsed.isRateLimited) {
        setRateLimitInfo({ minutes: rateLimitParsed.minutes })
        toast({
          variant: 'destructive',
          title: 'Account temporarily locked',
          description: rateLimitParsed.minutes
            ? `Too many failed attempts. Please wait ${rateLimitParsed.minutes} minutes before trying again.`
            : 'Too many failed attempts. Please try again later.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: message,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <Card className="w-full max-w-md glass relative">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-10 w-10 text-primary" />
              <span className="font-display text-3xl font-bold text-gradient">FitStack</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Rate limit warning banner */}
          {rateLimitInfo && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <Clock className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Account temporarily locked</p>
                <p className="text-muted-foreground">
                  {rateLimitInfo.minutes
                    ? `Please wait ${rateLimitInfo.minutes} minutes before trying again.`
                    : 'Please try again later.'}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setValue('rememberMe', checked === true)}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me for 30 days
                </Label>
              </div>
              {/* Future: Forgot Password link */}
              {/* <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link> */}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !!rateLimitInfo}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In */}
            <GoogleAuthButton mode="login" />
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
