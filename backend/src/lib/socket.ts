// backend/src/lib/socket.ts
import { Server } from 'socket.io'
import { createServer } from 'http'

let io: Server

export const setupSocketIO = (server: ReturnType<typeof createServer>) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Join inventory room for real-time updates
    socket.on('join:inventory', (inventoryId: string) => {
      socket.join(`inventory:${inventoryId}`)
      console.log(`User ${socket.id} joined inventory ${inventoryId}`)
    })

    // Leave inventory room
    socket.on('leave:inventory', (inventoryId: string) => {
      socket.leave(`inventory:${inventoryId}`)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}
