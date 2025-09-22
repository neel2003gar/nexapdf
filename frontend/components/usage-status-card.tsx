'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { UsageLimitModal } from '@/components/usage-limit-modal'
import { useGuestMode } from '@/components/guest-mode-provider'
import { BarChart3, AlertTriangle, CheckCircle, User, Zap } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'

interface UsageStatusCardProps {
  className?: string
  showUpgradePrompt?: boolean
}

export function UsageStatusCard({ className = '', showUpgradePrompt = true }: UsageStatusCardProps) {
  const [usageData, setUsageData] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const { isGuestMode, guestOperationsUsed, guestOperationsLimit, getRemainingOperations } = useGuestMode()

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
        
        // Show modal if anonymous user reached limit
        if (data.user_type === 'anonymous' && data.operations_used >= data.operations_limit) {
          if (showUpgradePrompt) {
            setShowLimitModal(true)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching usage info:', error)
      // Fallback - check if logged in based on token
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
      sessionStorage.removeItem('refresh_usage_on_home')
      
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
        // Add a slight delay to ensure backend has processed the request
        setTimeout(() => {
          fetchUsageInfo()
        }, 100)
      }
    }

    const handleCustomEvent = () => {
      // Add multiple retries with increasing delays to ensure backend sync
      setTimeout(() => fetchUsageInfo(), 100)
      setTimeout(() => fetchUsageInfo(), 500)
      setTimeout(() => fetchUsageInfo(), 1000)
    }

    // Listen for auth changes
    const handleAuthChange = () => {
      setTimeout(fetchUsageInfo, 500) // Small delay to ensure cookie is set
    }

    // Listen for usage reset (logout)
    const handleUsageReset = () => {
      setUsageData({
        operations_used: 0,
        remaining_operations: 10,
        daily_limit: 10
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
    // Default state for new guest users - show 10/10 operations left
    const defaultUsage = { operations_used: 0, operations_limit: 10 }
    const remaining = defaultUsage.operations_limit - defaultUsage.operations_used
    const progressPercentage = (defaultUsage.operations_used / defaultUsage.operations_limit) * 100

    return (
      <Card className={`border-orange-200 bg-orange-50 dark:bg-orange-950/20 ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Free Operations
          </CardTitle>
          <Zap className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {remaining}/{defaultUsage.operations_limit} left
          </div>
          <div className="mt-2 mb-3">
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-orange-100 dark:bg-orange-900/20"
            />
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
            {remaining} operations remaining today
          </p>
          {showUpgradePrompt && (
            <div className="pt-2 border-t">
              <Link 
                href="/auth/signup" 
                className="text-xs text-orange-700 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-200 font-medium"
              >
                Sign up for unlimited access →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Show loading only if we have some data already but are refreshing
  if (loading && usageData) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usage Status</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Updating...</div>
          <p className="text-xs text-muted-foreground">Refreshing usage info...</p>
        </CardContent>
      </Card>
    )
  }

  // Logged in user - show unlimited status
  if (isLoggedIn || usageData?.user_type === 'authenticated') {
    return (
      <Card className={`border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Account Status
            <div className="p-1 bg-gradient-to-br from-red-500 to-red-600 rounded-full">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          </CardTitle>
          <User className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Unlimited</div>
          <p className="text-xs text-red-700 dark:text-red-400 mb-2">
            Registered account - no limits
          </p>
          {usageData && (
            <div className="text-xs text-muted-foreground">
              Operations today: {usageData.operations_today || 0}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // For anonymous users (including guest mode), always use backend data
  if (!isLoggedIn) {
    const usage = usageData || { operations_used: 0, operations_limit: 10 }
    const remaining = usage.operations_limit - usage.operations_used
    const progressPercentage = (usage.operations_used / usage.operations_limit) * 100
    const isNearLimit = remaining <= 1
    const isAtLimit = remaining === 0



    return (
      <Card className={`${isAtLimit ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : isNearLimit ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/20' : 'border-orange-200 bg-orange-50 dark:bg-orange-950/20'} ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {isGuestMode ? 'Guest Mode' : 'Free Usage'}
            {isAtLimit && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </CardTitle>
          <Zap className={`h-4 w-4 ${isAtLimit ? 'text-red-500' : 'text-orange-500'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isAtLimit ? 'text-red-600' : 'text-orange-600'}`}>
            {remaining}/{usage.operations_limit} left
          </div>
          <div className="mt-2 mb-3">
            <Progress 
              value={progressPercentage} 
              className={`h-2 ${isAtLimit ? 'bg-red-100 dark:bg-red-900/20' : 'bg-orange-100 dark:bg-orange-900/20'}`}
            />
          </div>
          <p className={`text-xs mb-3 ${isAtLimit ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-orange-600 dark:text-orange-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {isAtLimit 
              ? 'No operations left today - Sign up for unlimited access'
              : `${remaining} operations remaining today`
            }
          </p>
          {showUpgradePrompt && (isNearLimit || isAtLimit) && (
            <div className="pt-2 border-t">
              <Link href="/auth/signup" className="block">
                <Button size="sm" className="w-full group" variant={isAtLimit ? 'default' : 'outline'}>
                  <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  {isAtLimit ? 'Sign Up for Free' : 'Create Free Account'}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // This should not happen - fallback for any remaining edge cases
  return (
    <>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Loading...</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--/5 left</div>
          <div className="mt-2 mb-3">
            <Progress value={0} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Loading usage information...
          </p>
        </CardContent>
      </Card>

      {showLimitModal && (
        <UsageLimitModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          operationsUsed={0}
          maxOperations={5}
        />
      )}
    </>
  )
}