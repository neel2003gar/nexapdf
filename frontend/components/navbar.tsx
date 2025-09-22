'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { useUsage } from '@/components/usage-provider'
import { useGuestMode } from '@/components/guest-mode-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { FileText, User, LogOut, UserCheck, Home } from 'lucide-react'
import { UsageIndicator } from '@/components/usage-indicator'

export function Navbar() {
  const { user, logout } = useAuth()
  const { usageInfo } = useUsage()
  const { isGuestMode, guestOperationsUsed, guestOperationsLimit, getRemainingOperations } = useGuestMode()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <img
                src="/nexa-pdf/logo.svg"
                alt="NexaPDF"
                width={48}
                height={48}
                className="h-12 w-12"
                onError={(e) => {
                  // Fallback to PNG if SVG fails
                  e.currentTarget.src = '/nexa-pdf/logo.png'
                  e.currentTarget.onerror = () => {
                    // Hide image and show icon if both fail
                    e.currentTarget.style.display = 'none'
                    const icon = e.currentTarget.parentElement?.querySelector('.fallback-icon')
                    if (icon) icon.classList.remove('hidden')
                  }
                }}
              />
              <FileText className="h-12 w-12 fallback-icon hidden text-red-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">NexaPDF</span>
            </div>
          </Link>
        </div>



        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-3 md:hidden">
              <div className="flex items-center space-x-3">
                <img
                  src="/nexa-pdf/logo.svg"
                  alt="NexaPDF"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                  onError={(e) => {
                    // Fallback to PNG if SVG fails
                    e.currentTarget.src = '/nexa-pdf/logo.png'
                    e.currentTarget.onerror = () => {
                      // Hide image and show icon if both fail
                      e.currentTarget.style.display = 'none'
                      const icon = e.currentTarget.parentElement?.querySelector('.fallback-icon-mobile')
                      if (icon) icon.classList.remove('hidden')
                    }
                  }}
                />
                <FileText className="h-8 w-8 fallback-icon-mobile hidden text-red-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">NexaPDF</span>
              </div>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            
            {/* Home Button */}
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Home</span>
              </Button>
            </Link>
            
            {/* Usage Status - show for guest users */}
            {!user && isGuestMode && (
              <div className="hidden md:flex items-center">
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {getRemainingOperations()}/{guestOperationsLimit} left
                </div>
              </div>
            )}
            
            {/* Authentication */}
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="hidden md:inline text-sm">Hi, {user.username}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            ) : isGuestMode ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="hidden md:inline text-sm text-muted-foreground">Guest User</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Login</span>
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">
                      <span className="hidden md:inline">Sign Up</span>
                      <span className="md:hidden">Join</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Login</span>
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">
                    <span className="hidden md:inline">Sign Up</span>
                    <span className="md:hidden">Join</span>
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>


    </header>
  )
}