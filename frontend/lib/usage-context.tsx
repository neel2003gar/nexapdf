'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface UsageContextType {
  triggerUpdate: () => void
  isUpdating: boolean
}

const UsageContext = createContext<UsageContextType | undefined>(undefined)

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  const triggerUpdate = useCallback(() => {
    setIsUpdating(true)
    setUpdateTrigger(prev => prev + 1)
    
    // Reset updating state after a short delay
    setTimeout(() => {
      setIsUpdating(false)
    }, 1000)
  }, [])

  return (
    <UsageContext.Provider value={{ triggerUpdate, isUpdating }}>
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

// Hook to listen for usage updates
export function useUsageUpdates(callback: () => void) {
  const [lastUpdate, setLastUpdate] = useState(0)

  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pdf_operation_completed') {
        const timestamp = parseInt(e.newValue || '0')
        if (timestamp > lastUpdate) {
          setLastUpdate(timestamp)
          callback()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [callback, lastUpdate])
}

// Utility to trigger usage update across tabs
export function notifyUsageUpdate() {
  const timestamp = Date.now()
  localStorage.setItem('pdf_operation_completed', timestamp.toString())
  
  // Also dispatch a custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('pdfOperationCompleted', {
    detail: { timestamp }
  }))
}

// Hook to listen for same-tab usage updates
export function useSameTabUsageUpdates(callback: () => void) {
  React.useEffect(() => {
    const handleUpdate = () => {
      callback()
    }

    window.addEventListener('pdfOperationCompleted', handleUpdate)
    return () => window.removeEventListener('pdfOperationCompleted', handleUpdate)
  }, [callback])
}

// Hook for PDF processing pages to easily notify about completed operations
export function useNotifyOperation() {
  return React.useCallback((operationType: string, success: boolean = true) => {
    if (success) {
      notifyUsageUpdate()
      
      // Also store the operation type for better tracking
      localStorage.setItem('last_pdf_operation', JSON.stringify({
        type: operationType,
        timestamp: Date.now(),
        success
      }))
    }
  }, [])
}