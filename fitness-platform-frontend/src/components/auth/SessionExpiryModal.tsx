import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clock, LogOut, RefreshCw } from 'lucide-react'
import type { AuthResponse } from '@/types/auth'

export function SessionExpiryModal() {
    const navigate = useNavigate()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [countdown, setCountdown] = useState(60) // 60 seconds before auto-logout

    const {
        showSessionExpiryModal,
        setShowSessionExpiryModal,
        refreshToken,
        updateTokens,
        logout,
        isRefreshTokenExpired,
    } = useAuthStore()

    // Countdown timer
    useEffect(() => {
        if (!showSessionExpiryModal) {
            setCountdown(60)
            return
        }

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    handleLogout()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [showSessionExpiryModal])

    const handleStayLoggedIn = async () => {
        if (!refreshToken || isRefreshTokenExpired()) {
            // Refresh token expired, need to login again
            handleLogout()
            return
        }

        setIsRefreshing(true)
        try {
            const response = await authApi.refresh(refreshToken)
            const data: AuthResponse = response.data

            updateTokens(
                data.token,
                data.expiresIn,
                data.refreshToken,
                data.refreshTokenExpiresIn
            )

            setShowSessionExpiryModal(false)
        } catch (error) {
            // Refresh failed, logout
            handleLogout()
        } finally {
            setIsRefreshing(false)
        }
    }

    const handleLogout = () => {
        setShowSessionExpiryModal(false)
        logout()
        navigate('/login')
    }

    // Don't render if refresh token is still valid (modal shouldn't show in this case)
    if (!showSessionExpiryModal) {
        return null
    }

    const isExpired = isRefreshTokenExpired()

    return (
        <Dialog open={showSessionExpiryModal} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                        <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <DialogTitle className="text-center">
                        {isExpired ? 'Session Expired' : 'Session Expiring Soon'}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {isExpired ? (
                            'Your session has expired. Please log in again to continue.'
                        ) : (
                            <>
                                Your session is about to expire due to inactivity.
                                <br />
                                <span className="mt-2 inline-block font-medium text-foreground">
                                    Auto-logout in {countdown} seconds
                                </span>
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    {!isExpired && (
                        <Button
                            onClick={handleStayLoggedIn}
                            disabled={isRefreshing}
                            className="w-full"
                        >
                            {isRefreshing ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Stay Logged In
                                </>
                            )}
                        </Button>
                    )}
                    <Button
                        variant={isExpired ? 'default' : 'outline'}
                        onClick={handleLogout}
                        className="w-full"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        {isExpired ? 'Go to Login' : 'Log Out'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
