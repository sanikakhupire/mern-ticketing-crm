import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext.jsx'
import api, { getAccessToken } from '../services/api.js'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch initial notifications and unread count when user is authenticated
  const fetchNotifications = async () => {
    if (!isAuthenticated) return
    try {
      const [notifsRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ])
      setNotifications(notifsRes.data)
      setUnreadCount(countRes.data.unreadCount)
    } catch {
      // Ignore background notification fetch errors
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [isAuthenticated])

  // Establish and maintain socket connection
  useEffect(() => {
    const token = getAccessToken()
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

    const socketInstance = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socketInstance.on('connect', () => {
      // Connected successfully
    })

    socketInstance.on('notification', (newNotification) => {
      // Increment unread count
      setUnreadCount((prev) => prev + 1)
      // Add to front of notifications list
      setNotifications((prev) => [newNotification, ...prev])
      // Trigger user-facing alert
      toast((t) => (
        <div className="flex flex-col gap-1">
          <p className="font-bold text-xs uppercase tracking-wider text-indigo-400">
            {newNotification.title}
          </p>
          <p className="text-xs text-slate-200">{newNotification.message}</p>
        </div>
      ), {
        icon: '🔔',
        duration: 5000,
      })
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [isAuthenticated, user?._id])

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // Ignore error
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // Ignore error
    }
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refetchNotifications: fetchNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
