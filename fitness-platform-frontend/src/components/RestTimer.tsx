import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react'

interface RestTimerProps {
  remainingSeconds: number
  totalSeconds: number
  active: boolean
  onSkip?: () => void
  onStop?: () => void
}

export default function RestTimer({
  remainingSeconds,
  totalSeconds,
  active,
  onSkip,
  onStop,
}: RestTimerProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Play sound when timer ends
  useEffect(() => {
    if (remainingSeconds === 0 && active === false && soundEnabled) {
      // Play a notification sound
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.value = 0.3
        
        oscillator.start()
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch {
        console.log('Audio notification not supported')
      }
    }
  }, [remainingSeconds, active, soundEnabled])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0

  // Calculate the circumference and offset for the circular progress
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  if (!active && remainingSeconds === 0) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Circular Progress */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              {/* Timer text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold tabular-nums">
                  {formatTime(remainingSeconds)}
                </span>
              </div>
            </div>

            {/* Rest info */}
            <div>
              <h3 className="text-xl font-semibold mb-1">Rest Time</h3>
              <p className="text-blue-100">
                {active ? 'Take a breather...' : 'Rest complete!'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-white hover:bg-white/20"
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
            {active && onSkip && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onSkip}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Skip
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

