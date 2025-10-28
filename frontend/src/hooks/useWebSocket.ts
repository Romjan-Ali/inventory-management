// frontend/src/hooks/useWebSocket.ts
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useWebSocket(room: string) {
  const socketRef = useRef<Socket | null>(null)
  const lastMessageRef = useRef<MessageEvent | null>(null)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000')

    // Join room
    socketRef.current.emit('join:inventory', room)

    // Handle incoming messages
    socketRef.current.on('post:created', (data) => {
      lastMessageRef.current = new MessageEvent('message', {
        data: JSON.stringify({ type: 'post:created', data }),
      })
    })

    socketRef.current.on('post:deleted', (data) => {
      lastMessageRef.current = new MessageEvent('message', {
        data: JSON.stringify({ type: 'post:deleted', data }),
      })
    })

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave:inventory', room)
        socketRef.current.disconnect()
      }
    }
  }, [room])

  return {
    lastMessage: lastMessageRef.current,
  }
}