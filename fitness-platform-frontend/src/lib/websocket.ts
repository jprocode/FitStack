import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8082/ws/workout'

export function createWebSocketClient(
  sessionId: number,
  onMessage: (message: unknown) => void
): Client {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL.replace('ws:', 'http:').replace('wss:', 'https:')),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      console.log('[WebSocket]', str)
    },
  })

  client.onConnect = () => {
    console.log('WebSocket connected')
    client.subscribe(`/topic/workout/${sessionId}`, (message) => {
      if (message.body) {
        try {
          const data = JSON.parse(message.body)
          onMessage(data)
        } catch (e) {
          console.error('Failed to parse message:', e)
        }
      }
    })
  }

  client.onStompError = (frame) => {
    console.error('WebSocket error:', frame)
  }

  return client
}

export function sendSetComplete(
  client: Client,
  sessionId: number,
  setData: unknown
): void {
  if (client.connected) {
    client.publish({
      destination: `/app/workout/${sessionId}/set-complete`,
      body: JSON.stringify(setData),
    })
  }
}

export function startRestTimer(
  client: Client,
  sessionId: number,
  exerciseId: number,
  setNumber: number,
  totalSeconds: number
): void {
  if (client.connected) {
    client.publish({
      destination: `/app/workout/${sessionId}/start-timer`,
      body: JSON.stringify({
        sessionId,
        exerciseId,
        setNumber,
        totalSeconds,
      }),
    })
  }
}

export function stopRestTimer(
  client: Client,
  sessionId: number
): void {
  if (client.connected) {
    client.publish({
      destination: `/app/workout/${sessionId}/stop-timer`,
      body: JSON.stringify({ sessionId }),
    })
  }
}

