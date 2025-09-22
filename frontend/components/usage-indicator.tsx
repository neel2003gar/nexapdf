'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { UsageLimitModal } from '@/components/usage-limit-modal'
import { AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface UsageIndicatorProps {
  variant?: 'default' | 'compact' | 'minimal'
  showUpgradeButton?: boolean
}

export function UsageIndicator({ variant = 'default', showUpgradeButton = true }: UsageIndicatorProps) {
  const [usageData, setUsageData] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuthStatus = () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1]
    return !!token
  }

  const fetchUsageInfo = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1]

      const headers: any = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/pdf/usage/`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsageData(data)
        setIsLoggedIn(data.user_type === 'authenticated')
      }
    } catch (error) {
      console.error('Error fetching usage info:', error)
      setIsLoggedIn(checkAuthStatus())
      // For new users, set default guest usage data
      if (!usageData) {
        setUsageData({
          user_type: 'anonymous',
          operations_used: 0,
          operations_limit: 10,
          remaining_operations: 10
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check auth status immediately for instant UI update
    setIsLoggedIn(checkAuthStatus())
    
    fetchUsageInfo()
    
    // Check if we need to refresh usage data after returning from a PDF operation
    const shouldRefresh = sessionStorage.getItem('refresh_usage_on_home')
    if (shouldRefresh === 'true') {
      // Multiple refresh attempts with increasing delays to ensure backend has processed
      const refreshAttempts = [1000, 2000, 3000] // 1s, 2s, 3s delays
      
      refreshAttempts.forEach((delay, index) => {
        setTimeout(() => {
          fetchUsageInfo()
        }, delay)
      })
    }
  }, [])

  // Listen for usage updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pdf_operation_completed') {
        setTimeout(() => {
          fetchUsageInfo()
        }, 100)
      }
    }

    const handleCustomEvent = () => {
      setTimeout(() => {
        fetchUsageInfo()
      }, 100)
    }

    const handleAuthChange = () => {
      setTimeout(fetchUsageInfo, 500)
    }

    const handleUsageReset = () => {
      setUsageData({
        user_type: 'anonymous',
        operations_used: 0,
        operations_limit: 10,
        remaining_operations: 10
      })
      setLoading(false)
      setIsLoggedIn(false)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('pdfOperationCompleted', handleCustomEvent)
    window.addEventListener('authStatusChanged', handleAuthChange)
    window.addEventListener('usageReset', handleUsageReset)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('pdfOperationCompleted', handleCustomEvent)
      window.removeEventListener('authStatusChanged', handleAuthChange)
      window.removeEventListener('usageReset', handleUsageReset)
    }
  }, [])

  // For new guest users, show default 10/10 immediately instead of loading
  if (loading && !usageData) {
    const defaultUsage = { operations_used: 0, operations_limit: 10 }
    const remaining = defaultUsage.operations_limit - defaultUsage.operations_used
    const isAtLimit = remaining === 0
    
    if (variant === 'minimal') {
      return (
        <Badge variant={isAtLimit ? "destructive" : "secondary"}>
          {remaining}/{defaultUsage.operations_limit}
        </Badge>
      )
    }
    
    return (
      <Badge variant={isAtLimit ? "destructive" : "secondary"}>
        <BarChart3 className="h-3 w-3 mr-1" />
        {remaining}/{defaultUsage.operations_limit} left
      </Badge>
    )
  }

  // Show loading only if we have some data already but are refreshing
  if (loading && usageData) {
    return (
      <Badge variant="secondary" className="animate-pulse">
        <BarChart3 className="h-3 w-3 mr-1" />
        Updating...
      </Badge>
    )
  }

  // Logged in user - show unlimited status
  if (isLoggedIn || usageData?.user_type === 'authenticated') {
    if (variant === 'minimal') {
      return null // Don't show anything for logged in users in minimal mode
    }
    
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        <CheckCircle className="h-3 w-3 mr-1" />
        {variant === 'compact' ? '∞' : 'Unlimited'}
      </Badge>
    )
  }

  // Anonymous user - show usage limit
  const usage = usageData || { operations_used: 0, operations_limit: 10 }
  const isAtLimit = usage.operations_used >= usage.operations_limit
  const isNearLimit = usage.operations_used >= usage.operations_limit - 1

  if (variant === 'minimal') {
    return (
      <Badge 
        variant={isAtLimit ? "destructive" : "outline"}
        className="text-xs px-2 py-1"
      >
        {usage.operations_limit - usage.operations_used}/{usage.operations_limit} left
      </Badge>
    )
  }

  if (variant === 'compact') {
    return (
      <>
        <div className="flex items-center gap-1">
          <Badge 
            variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
            className={`text-xs ${isNearLimit && !isAtLimit ? "border-orange-400 text-orange-600" : ""}`}
          >
            {isAtLimit && <AlertTriangle className="h-3 w-3 mr-1" />}
            {usage.operations_limit - usage.operations_used}/{usage.operations_limit} left
          </Badge>
          
          {showUpgradeButton && isAtLimit && (
            <Button size="sm" variant="outline" className="text-xs h-6 px-2" asChild>
              <Link href="/auth/signup">
                Sign Up
              </Link>
            </Button>
          )}
        </div>

        <UsageLimitModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          operationsUsed={usage.operations_used}
          maxOperations={usage.operations_limit}
        />
      </>
    )
  }

  // Default variant
  return (
    <>
      <div className="flex items-center gap-2">
        <Badge 
          variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
          className={isNearLimit && !isAtLimit ? "border-orange-400 text-orange-600" : ""}
        >
          {isAtLimit && <AlertTriangle className="h-3 w-3 mr-1" />}
          <BarChart3 className="h-3 w-3 mr-1" />
          {usage.operations_limit - usage.operations_used}/{usage.operations_limit} left
        </Badge>
        
        {showUpgradeButton && (isNearLimit || isAtLimit) && (
          <Button size="sm" variant="outline" asChild>
            <Link href="/auth/signup">
              {isAtLimit ? 'Sign Up' : 'Upgrade'}
            </Link>
          </Button>
        )}
      </div>

      <UsageLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        operationsUsed={usage.operations_used}
        maxOperations={usage.operations_limit}
      />
    </>
  )
}