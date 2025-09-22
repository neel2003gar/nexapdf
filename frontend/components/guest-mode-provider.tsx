'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface GuestModeContextType {
  isGuestMode: boolean
  hasSeenWelcome: boolean
  guestOperationsUsed: number
  guestOperationsLimit: number
  canPerformOperation: boolean
  setGuestMode: (isGuest: boolean) => void
  setHasSeenWelcome: (seen: boolean) => void
  incrementGuestOperations: () => void
  resetGuestOperations: () => void
  getRemainingOperations: () => number
}

const GuestModeContext = createContext<GuestModeContextType | undefined>(undefined)

interface GuestModeProviderProps {
  children: ReactNode
}

export function GuestModeProvider({ children }: GuestModeProviderProps) {
  const [isGuestMode, setIsGuestMode] = useState(false)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)
  const [guestOperationsUsed, setGuestOperationsUsed] = useState(0)
  const guestOperationsLimit = 10

  // Load state from sessionStorage on mount (clears when browser closes)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGuestMode = sessionStorage.getItem('nexapdf_guest_mode')
      const savedHasSeenWelcome = sessionStorage.getItem('nexapdf_has_seen_welcome')
      const savedOperationsUsed = sessionStorage.getItem('nexapdf_guest_operations_used')
      const savedOperationsDate = sessionStorage.getItem('nexapdf_guest_operations_date')
      
      if (savedGuestMode === 'true') {
        setIsGuestMode(true)
      }
      
      if (savedHasSeenWelcome === 'true') {
        setHasSeenWelcome(true)
      }
      
      // Check if operations are from today, reset if not
      const today = new Date().toDateString()
      if (savedOperationsDate !== today) {
        setGuestOperationsUsed(0)
        sessionStorage.setItem('nexapdf_guest_operations_used', '0')
        sessionStorage.setItem('nexapdf_guest_operations_date', today)
      } else if (savedOperationsUsed) {
        setGuestOperationsUsed(parseInt(savedOperationsUsed, 10))
      }
    }
  }, [])

  // Listen for auth status changes to manage guest mode
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent) => {
      if (event.detail.user) {
        // User logged in, clear guest mode
        setIsGuestMode(false)
        setGuestOperationsUsed(0)
        setHasSeenWelcome(true)
      } else {
        // User logged out, reset everything to initial state
        setIsGuestMode(false)
        setGuestOperationsUsed(0)
        setHasSeenWelcome(false)
      }
    }

    const handleUsageReset = () => {
      // Reset all guest usage data
      setGuestOperationsUsed(0)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nexapdf_guest_operations_used')
        sessionStorage.removeItem('nexapdf_guest_operations_date')
      }
    }

    window.addEventListener('authStatusChanged', handleAuthChange as EventListener)
    window.addEventListener('usageReset', handleUsageReset as EventListener)
    
    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange as EventListener)
      window.removeEventListener('usageReset', handleUsageReset as EventListener)
    }
  }, [])

  // Listen for PDF operation completions to update guest usage count
  useEffect(() => {
    const handlePdfOperationCompleted = () => {
      if (isGuestMode) {
        // Fetch updated count from backend
        const fetchGuestUsage = async () => {
          try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
            const response = await fetch(`${API_URL}/pdf/usage/`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            })
            if (response.ok) {
              const data = await response.json()
              const used = data.operations_used || 0
              setGuestOperationsUsed(used)
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('nexapdf_guest_operations_used', used.toString())
                sessionStorage.setItem('nexapdf_guest_operations_date', new Date().toDateString())
              }
            }
          } catch (error) {
            console.error('Failed to fetch guest usage:', error)
          }
        }
        fetchGuestUsage()
      }
    }

    const handleStorageUpdate = () => {
      if (isGuestMode && typeof window !== 'undefined') {
        const refreshFlag = sessionStorage.getItem('nexapdf_refresh_usage')
        if (refreshFlag === 'true') {
          handlePdfOperationCompleted()
          sessionStorage.removeItem('nexapdf_refresh_usage')
        }
      }
    }

    // Listen for multiple event types to catch all PDF operations
    window.addEventListener('pdfOperationCompleted', handlePdfOperationCompleted as EventListener)
    window.addEventListener('usageUpdateNeeded', handlePdfOperationCompleted as EventListener)
    window.addEventListener('storage', handleStorageUpdate as EventListener)

    // Check for refresh flag on mount
    handleStorageUpdate()

    return () => {
      window.removeEventListener('pdfOperationCompleted', handlePdfOperationCompleted as EventListener)
      window.removeEventListener('usageUpdateNeeded', handlePdfOperationCompleted as EventListener) 
      window.removeEventListener('storage', handleStorageUpdate as EventListener)
    }
  }, [isGuestMode])

  const setGuestMode = (isGuest: boolean) => {
    setIsGuestMode(isGuest)
    if (typeof window !== 'undefined') {
      if (isGuest) {
        sessionStorage.setItem('nexapdf_guest_mode', 'true')
      } else {
        sessionStorage.removeItem('nexapdf_guest_mode')
        sessionStorage.removeItem('nexapdf_guest_operations_used')
        sessionStorage.removeItem('nexapdf_guest_operations_date')
      }
    }
  }

  const setHasSeenWelcomeWrapper = (seen: boolean) => {
    setHasSeenWelcome(seen)
    if (typeof window !== 'undefined') {
      if (seen) {
        sessionStorage.setItem('nexapdf_has_seen_welcome', 'true')
      } else {
        sessionStorage.removeItem('nexapdf_has_seen_welcome')
      }
    }
  }

  const incrementGuestOperations = () => {
    if (isGuestMode) {
      const newCount = guestOperationsUsed + 1
      setGuestOperationsUsed(newCount)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('nexapdf_guest_operations_used', newCount.toString())
        sessionStorage.setItem('nexapdf_guest_operations_date', new Date().toDateString())
      }
    }
  }

  const resetGuestOperations = () => {
    setGuestOperationsUsed(0)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nexapdf_guest_operations_used', '0')
      sessionStorage.setItem('nexapdf_guest_operations_date', new Date().toDateString())
    }
  }

  const getRemainingOperations = () => {
    return Math.max(0, guestOperationsLimit - guestOperationsUsed)
  }

  const canPerformOperation = !isGuestMode || guestOperationsUsed < guestOperationsLimit

  const value: GuestModeContextType = {
    isGuestMode,
    hasSeenWelcome,
    guestOperationsUsed,
    guestOperationsLimit,
    canPerformOperation,
    setGuestMode,
    setHasSeenWelcome: setHasSeenWelcomeWrapper,
    incrementGuestOperations,
    resetGuestOperations,
    getRemainingOperations
  }

  return (
    <GuestModeContext.Provider value={value}>
      {children}
    </GuestModeContext.Provider>
  )
}

export function useGuestMode() {
  const context = useContext(GuestModeContext)
  if (context === undefined) {
    throw new Error('useGuestMode must be used within a GuestModeProvider')
  }
  return context
}