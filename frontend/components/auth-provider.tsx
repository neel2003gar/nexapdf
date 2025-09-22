'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  signup: (userData: any) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Configure axios defaults and interceptors
  useEffect(() => {
    const token = Cookies.get('access_token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    // Setup axios interceptor for automatic token refresh
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const newToken = await refreshToken()
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
            return axios(originalRequest)
          } catch (refreshError) {
            // Refresh failed, redirect to login or show login modal
            setUser(null)
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [])

  // Token refresh function
  const refreshToken = async () => {
    try {
      const refresh = Cookies.get('refresh_token')
      if (!refresh) {
        throw new Error('No refresh token')
      }

      const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
        refresh
      })

      const { access } = response.data
      Cookies.set('access_token', access)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      return access
    } catch (error) {
      // Refresh failed, clear tokens
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
      throw error
    }
  }

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('access_token')
        if (token) {
          try {
            const response = await axios.get(`${API_URL}/auth/me/`)
            setUser(response.data)
            
            // Clear guest mode when authenticated user is found
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('nexapdf_guest_mode')
              sessionStorage.removeItem('nexapdf_guest_operations_used')
              sessionStorage.removeItem('nexapdf_guest_operations_date')
            }
          } catch (error: any) {
            // If token expired, try to refresh
            if (error.response?.status === 401) {
              try {
                await refreshToken()
                const response = await axios.get(`${API_URL}/auth/me/`)
                setUser(response.data)
                
                // Clear guest mode when authenticated user is found
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('nexapdf_guest_mode')
                  sessionStorage.removeItem('nexapdf_guest_operations_used')
                  sessionStorage.removeItem('nexapdf_guest_operations_date')
                }
              } catch (refreshError) {
                // Refresh failed, user needs to login again
                console.log('Token refresh failed, user needs to login')
              }
            } else {
              throw error
            }
          }
        }
      } catch (error) {
        // Token is invalid, remove it
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        delete axios.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, {
        username,
        password
      })

      const { user, tokens } = response.data
      
      // Store tokens in session cookies (cleared when browser closes)
      Cookies.set('access_token', tokens.access)
      Cookies.set('refresh_token', tokens.refresh)
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`
      
      setUser(user)
      
      // Clear guest mode when user logs in
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nexapdf_guest_mode')
        sessionStorage.removeItem('nexapdf_guest_operations_used')
        sessionStorage.removeItem('nexapdf_guest_operations_date')
        sessionStorage.setItem('nexapdf_has_seen_welcome', 'true')
      }
      
      // Dispatch auth status change event
      window.dispatchEvent(new CustomEvent('authStatusChanged', { detail: { user } }))
    } catch (error) {
      throw error
    }
  }

  const signup = async (userData: any) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup/`, userData)
      
      const { user, tokens } = response.data
      
      // Store tokens in session cookies (cleared when browser closes)
      Cookies.set('access_token', tokens.access)
      Cookies.set('refresh_token', tokens.refresh)
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`
      
      setUser(user)
      
      // Clear guest mode when user signs up
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nexapdf_guest_mode')
        sessionStorage.removeItem('nexapdf_guest_operations_used')
        sessionStorage.removeItem('nexapdf_guest_operations_date')
        sessionStorage.setItem('nexapdf_has_seen_welcome', 'true')
      }
      
      // Dispatch auth status change event
      window.dispatchEvent(new CustomEvent('authStatusChanged', { detail: { user } }))
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      const refreshToken = Cookies.get('refresh_token')
      if (refreshToken) {
        await axios.post(`${API_URL}/auth/logout/`, {
          refresh_token: refreshToken
        })
      } else {
        // For guest users or when no refresh token, reset guest session
        await axios.post(`${API_URL}/auth/guest-reset/`, {}, {
          withCredentials: true
        })
      }
    } catch (error) {
      // Ignore logout errors but still try to reset guest session
      try {
        await axios.post(`${API_URL}/auth/guest-reset/`, {}, {
          withCredentials: true
        })
      } catch (resetError) {
        // Ignore reset errors too
      }
    } finally {
      // Clear all authentication tokens and headers
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
      
      // Completely reset all application data
      if (typeof window !== 'undefined') {
        // Clear all session data (guest mode, welcome status, operations count, etc.)
        sessionStorage.clear()
        
        // Clear any cached user preferences from localStorage (theme can persist)
        // Note: We keep theme in localStorage so it persists across sessions
        localStorage.removeItem('user_preferences')
        localStorage.removeItem('pdf_operation_completed')
        localStorage.removeItem('usage_data')
        localStorage.removeItem('nexapdf_refresh_usage')
        
        // Notify all components about auth status change to reset their state
        const authEvent = new CustomEvent('authStatusChanged', {
          detail: { user: null, action: 'logout' }
        })
        window.dispatchEvent(authEvent)
        
        // Notify usage components to reset
        const usageResetEvent = new CustomEvent('usageReset', {
          detail: { reason: 'logout' }
        })
        window.dispatchEvent(usageResetEvent)
      }
      
      // Clear any cached API responses
      if (window.caches) {
        window.caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('nexapdf') || name.includes('api')) {
              window.caches.delete(name)
            }
          })
        })
      }
      
      // Reset page to home and force reload to clear any cached state
      window.location.href = '/'
      
      // Dispatch auth status change event
      window.dispatchEvent(new CustomEvent('authStatusChanged', { detail: { user: null } }))
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}