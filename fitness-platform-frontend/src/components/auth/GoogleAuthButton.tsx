import { useGoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { AuthResponse } from '@/types/auth'
import { api } from '@/lib/api'

// Google icon SVG component
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    )
}

interface GoogleAuthButtonProps {
    mode?: 'login' | 'register'
}

export function GoogleAuthButton({ mode = 'login' }: GoogleAuthButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const { toast } = useToast()

    const handleGoogleSuccess = async (tokenResponse: { access_token: string }) => {
        setIsLoading(true)
        try {
            // Exchange the access token for an ID token by calling Google's userinfo endpoint
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            })
            const userInfo = await userInfoResponse.json()

            // For the implicit flow, we need to use a different approach
            // We'll send the access token to our backend which will verify it
            const response = await api.post<AuthResponse>('/users/oauth/google', {
                idToken: tokenResponse.access_token,
                // Include user info for the backend to use
                email: userInfo.email,
                googleId: userInfo.sub,
                firstName: userInfo.given_name,
                lastName: userInfo.family_name
            })

            const authData = response.data
            setAuth(
                authData.token,
                authData.user,
                authData.expiresIn,
                authData.refreshToken,
                authData.refreshTokenExpiresIn
            )

            toast({
                title: mode === 'login' ? 'Welcome back!' : 'Account created!',
                description: mode === 'login'
                    ? 'You have successfully signed in with Google.'
                    : 'Your account has been created with Google.',
            })

            navigate('/dashboard')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            toast({
                variant: 'destructive',
                title: 'Authentication failed',
                description: err.response?.data?.message || 'Failed to sign in with Google',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const login = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => {
            toast({
                variant: 'destructive',
                title: 'Google Sign-In Error',
                description: 'Failed to sign in with Google. Please try again.',
            })
        },
    })

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => login()}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
        </Button>
    )
}
