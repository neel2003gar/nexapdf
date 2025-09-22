'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, User, UserPlus, Zap, Shield, Infinity, CheckCircle, X } from 'lucide-react'
import Link from 'next/link'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  onContinueAsGuest: () => void
}

export function WelcomeModal({ isOpen, onClose, onContinueAsGuest }: WelcomeModalProps) {
  const [showDetails, setShowDetails] = useState(false)

  const guestFeatures = [
    { icon: FileText, text: "10 free operations per day" },
    { icon: Zap, text: "All PDF tools available" },
    { icon: Shield, text: "Secure processing" }
  ]

  const accountFeatures = [
    { icon: Infinity, text: "Unlimited operations" },
    { icon: CheckCircle, text: "Processing history" },
    { icon: Shield, text: "Priority support" },
    { icon: FileText, text: "Advanced features" }
  ]

  const handleContinueAsGuest = () => {
    onContinueAsGuest()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden border-2 border-red-200 dark:border-red-800" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
              <img
                src="/nexa-pdf/logo.svg"
                alt="NexaPDF"
                width={40}
                height={40}
                className="h-10 w-10 brightness-0 invert"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const icon = e.currentTarget.parentElement?.querySelector('.fallback-icon')
                  if (icon) icon.classList.remove('hidden')
                }}
              />
              <FileText className="h-10 w-10 text-white fallback-icon hidden" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Welcome to NexaPDF
              </DialogTitle>
              <DialogDescription className="text-lg text-gray-600 dark:text-gray-400">
                Choose how you'd like to get started
              </DialogDescription>
              <div className="flex items-center justify-center mt-2">
                <div className="px-3 py-1 bg-red-100 dark:bg-red-900/20 rounded-full border border-red-200 dark:border-red-800">
                  <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                    Please select an option to continue
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sign Up Option */}
          <Card className="border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg mb-4">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-red-800 dark:text-red-200">Create Account</CardTitle>
              <CardDescription>Get unlimited access to all PDF tools</CardDescription>
              <Badge className="bg-red-600 text-white border-red-600 hover:bg-red-700">Recommended</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {accountFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-1 bg-red-500 rounded-full">
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature.text}</span>
                </div>
              ))}
              <Link href="/auth/signup" className="block pt-4">
                <Button className="w-full group" size="lg" onClick={() => {
                  // Mark that user has seen welcome (they chose to sign up)
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('nexapdf_has_seen_welcome', 'true')
                  }
                  onClose()
                }}>
                  <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Sign Up Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Login Option */}
          <Card className="border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-4 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Sign In</CardTitle>
              <CardDescription>Already have an account?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Welcome back! Sign in to access your unlimited PDF processing account.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400">
                  <Infinity className="h-4 w-4" />
                  <span>Unlimited Operations</span>
                </div>
              </div>
              <Link href="/auth/login" className="block">
                <Button variant="outline" className="w-full group" size="lg" onClick={() => {
                  // Mark that user has seen welcome (they chose to login) 
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('nexapdf_has_seen_welcome', 'true')
                  }
                  onClose()
                }}>
                  <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Guest Option */}
          <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-orange-800 dark:text-orange-200">Try as Guest</CardTitle>
              <CardDescription>Test our tools with limited access</CardDescription>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">Limited</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {guestFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-1 bg-orange-500 rounded-full">
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature.text}</span>
                </div>
              ))}
              
              {!showDetails && (
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-xs text-orange-600 hover:text-orange-700 underline"
                >
                  What happens after 10 operations?
                </button>
              )}
              
              {showDetails && (
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-xs text-orange-700 dark:text-orange-300 mb-2">
                    After 10 operations, you'll need to create a free account to continue processing PDFs.
                  </p>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-xs text-orange-600 hover:text-orange-700 underline"
                  >
                    Hide details
                  </button>
                </div>
              )}
              
              <Button variant="outline" className="w-full group border-orange-300 text-orange-700 hover:bg-orange-100" size="lg" onClick={handleContinueAsGuest}>
                <Zap className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Continue as Guest
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}