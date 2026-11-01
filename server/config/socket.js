import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

let io = null

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PATCH'],
    },
  })

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '')

      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      socket.user = { id: decoded.id, role: decoded.role }
      next()
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.user?.id
    if (userId) {
      // Join personal room for targeted notifications
      const userRoom = `user:${userId}`
      socket.join(userRoom)
    }

    socket.on('disconnect', () => {
      // Cleanup happens automatically in socket.io
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!')
  }
  return io
}

/**
 * Emit a real-time notification to a specific user's private room
 * @param {string} recipientId - User ID of the recipient
 * @param {object} notification - Persisted notification document/object
 */
export const emitNotification = (recipientId, notification) => {
  if (!io) return
  const room = `user:${String(recipientId)}`
  io.to(room).emit('notification', notification)
}
