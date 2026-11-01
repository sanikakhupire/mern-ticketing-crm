import { createContext, useContext, useState, useEffect } from 'react'
import api, { setAccessToken, getAccessToken } from '../services/api.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen for session expiration events from Axios interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null)
      setAccessToken(null)
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, [])

  // Restore session silently on mount using refresh token cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: refreshData } = await api.post('/auth/refresh')
        if (refreshData?.accessToken) {
          setAccessToken(refreshData.accessToken)
          const { data: userData } = await api.get('/auth/me')
          setUser(userData.user)
        }
      } catch {
        setUser(null)
        setAccessToken(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setAccessToken(data.accessToken)
    setUser(data.user)
    return data.user
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    setAccessToken(data.accessToken)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }

  const getDefaultDashboard = (role) => {
    switch (role) {
      case 'admin':
        return '/admin'
      case 'employee':
        return '/employee'
      case 'customer':
      default:
        return '/customer'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        loading,
        login,
        register,
        logout,
        getDefaultDashboard,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
