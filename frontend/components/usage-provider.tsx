'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

interface UsageInfo {
  user_type: 'authenticated' | 'anonymous'
  username?: string
  operations_used?: number
  operations_today?: number
  operations_limit?: number
  total_operations?: number
  is_unlimited: boolean
  remaining_operations: number
}

interface UsageContextType {
  usageInfo: UsageInfo | null
  refreshUsage: () => void
  loading: boolean
}

const UsageContext = createContext<UsageContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUsageInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/pdf/usage/`)
      setUsageInfo(response.data)
    } catch (error) {
      console.error('Error fetching usage info:', error)
      // Set default for anonymous users
      setUsageInfo({
        user_type: 'anonymous',
        operations_used: 0,
        operations_limit: 10,
        is_unlimited: false,
        remaining_operations: 10
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshUsage = () => {
    fetchUsageInfo()
  }

  useEffect(() => {
    fetchUsageInfo()

    // Listen for auth status changes to reset usage data
    const handleAuthChange = (event: CustomEvent) => {
      if (!event.detail.user) {
        // User logged out, reset to anonymous state
        setUsageInfo({
          user_type: 'anonymous',
          operations_used: 0,
          operations_limit: 10,
          is_unlimited: false,
          remaining_operations: 10
        })
      } else {
        // User logged in, fetch fresh usage data
        fetchUsageInfo()
      }
    }

    window.addEventListener('authStatusChanged', handleAuthChange as EventListener)
    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange as EventListener)
    }
  }, [])

  return (
    <UsageContext.Provider value={{ usageInfo, refreshUsage, loading }}>
      {children}
    </UsageContext.Provider>
  )
}

export function useUsage() {
  const context = useContext(UsageContext)
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider')
  }
  return context
}