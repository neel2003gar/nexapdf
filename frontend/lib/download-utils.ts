'use client'

import { showToast } from '@/lib/toast'

/**
 * Check if user is authenticated by looking for access token
 */
export const checkAuthStatus = (): boolean => {
  if (typeof document === 'undefined') return false
  
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1]
  return !!token
}

/**
 * Handle download with usage tracking and redirect for anonymous users
 */
export const handleDownloadWithUsageTracking = (
  downloadUrl: string,
  filename: string,
  operationType: string,
  router: any,
  notifyOperation: (operation: string, success: boolean) => void
) => {
  // Download the file
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // For anonymous users, redirect to home page and refresh usage display
  const isLoggedIn = checkAuthStatus()
  if (!isLoggedIn) {
    // Notify about successful operation (this will trigger usage updates)
    notifyOperation(operationType, true)
    
    // Set flag to indicate that home page should refresh usage data
    sessionStorage.setItem('refresh_usage_on_home', 'true')
    
    // Show success message
    showToast.success.download()
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }
}