import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { createWebSocketClient, sendSetComplete } from '@/lib/websocket'

export function useWorkoutWebSocket(
  sessionId: number | null,
  onSetComplete?: (setData: unknown) => void
) {
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const handleMessage = (data: unknown) => {
      if (onSetComplete) {
        onSetComplete(data)
      }
    }

    const client = createWebSocketClient(sessionId, handleMessage)
    clientRef.current = client
    client.activate()

    return () => {
      if (client.connected) {
        client.deactivate()
      }
    }
  }, [sessionId, onSetComplete])

  const broadcastSetComplete = useCallback(
    (setData: unknown) => {
      if (clientRef.current && sessionId) {
        sendSetComplete(clientRef.current, sessionId, setData)
      }
    },
    [sessionId]
  )

  return {
    broadcastSetComplete,
    isConnected: clientRef.current?.connected || false,
  }
}

