import { useEffect, useRef, useCallback, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { createWebSocketClient, sendSetComplete, startRestTimer, stopRestTimer } from '@/lib/websocket'

export interface WebSocketMessage<T = unknown> {
  type: 'SET_COMPLETE' | 'REST_TIMER_START' | 'REST_TIMER_TICK' | 'REST_TIMER_END' | 'SESSION_UPDATE'
  payload: T
  sessionId: number
  timestamp: number
}

export interface RestTimerState {
  active: boolean
  remainingSeconds: number
  totalSeconds: number
  exerciseId?: number
  setNumber?: number
}

export function useWorkoutWebSocket(
  sessionId: number | null,
  onSetComplete?: (setData: unknown) => void,
  onTimerUpdate?: (timerData: RestTimerState) => void
) {
  const clientRef = useRef<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [timerState, setTimerState] = useState<RestTimerState>({
    active: false,
    remainingSeconds: 0,
    totalSeconds: 0,
  })

  useEffect(() => {
    if (!sessionId) return

    const handleMessage = (data: unknown) => {
      const message = data as WebSocketMessage
      
      switch (message.type) {
        case 'SET_COMPLETE':
          if (onSetComplete) {
            onSetComplete(message.payload)
          }
          break
        case 'REST_TIMER_START':
        case 'REST_TIMER_TICK':
        case 'REST_TIMER_END': {
          const timerPayload = message.payload as RestTimerState
          const newState: RestTimerState = {
            active: message.type !== 'REST_TIMER_END' && timerPayload.remainingSeconds > 0,
            remainingSeconds: timerPayload.remainingSeconds || 0,
            totalSeconds: timerPayload.totalSeconds || 0,
            exerciseId: timerPayload.exerciseId,
            setNumber: timerPayload.setNumber,
          }
          setTimerState(newState)
          if (onTimerUpdate) {
            onTimerUpdate(newState)
          }
          break
        }
        default:
          // Handle legacy messages without type
          if (onSetComplete) {
            onSetComplete(data)
          }
      }
    }

    const client = createWebSocketClient(sessionId, handleMessage)
    clientRef.current = client
    
    client.onConnect = () => {
      setIsConnected(true)
      client.subscribe(`/topic/workout/${sessionId}`, (message) => {
        if (message.body) {
          try {
            const data = JSON.parse(message.body)
            handleMessage(data)
          } catch (e) {
            console.error('Failed to parse message:', e)
          }
        }
      })
    }

    client.onDisconnect = () => {
      setIsConnected(false)
    }

    client.activate()

    return () => {
      if (client.connected) {
        client.deactivate()
      }
    }
  }, [sessionId, onSetComplete, onTimerUpdate])

  const broadcastSetComplete = useCallback(
    (setData: unknown) => {
      if (clientRef.current && sessionId) {
        sendSetComplete(clientRef.current, sessionId, setData)
      }
    },
    [sessionId]
  )

  const startTimer = useCallback(
    (exerciseId: number, setNumber: number, seconds: number) => {
      if (clientRef.current && sessionId) {
        startRestTimer(clientRef.current, sessionId, exerciseId, setNumber, seconds)
      }
    },
    [sessionId]
  )

  const stopTimer = useCallback(() => {
    if (clientRef.current && sessionId) {
      stopRestTimer(clientRef.current, sessionId)
    }
    setTimerState({
      active: false,
      remainingSeconds: 0,
      totalSeconds: 0,
    })
  }, [sessionId])

  return {
    broadcastSetComplete,
    startTimer,
    stopTimer,
    timerState,
    isConnected,
  }
}

