import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useWebSocket(inventoryId: string) {
  const socketRef = useRef<Socket | null>(null)
  const [lastMessage, setLastMessage] = useState<any>(null)

  useEffect(() => {
    socketRef.current = io(
      import.meta.env.VITE_WS_URL || 'http://localhost:5000'
    )

    // Join the specific inventory room
    socketRef.current.emit('join:inventory', inventoryId)

    const messageHandler = (data: any) => {
      setLastMessage(data)
    }

    socketRef.current.on('post:created', messageHandler)
    socketRef.current.on('post:deleted', messageHandler)

    return () => {
      if (socketRef.current) {
        socketRef.current.off('post:created', messageHandler)
        socketRef.current.off('post:deleted', messageHandler)
        socketRef.current.emit('leave:inventory', inventoryId)
        socketRef.current.disconnect()
      }
    }
  }, [inventoryId])
  return {
    lastMessage,
  }
}
