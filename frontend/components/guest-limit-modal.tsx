'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, UserPlus, User, Zap, Infinity, CheckCircle, FileText, Clock } from 'lucide-react'
import Link from 'next/link'
import { useGuestMode } from '@/components/guest-mode-provider'

interface GuestLimitModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GuestLimitModal({ isOpen, onClose }: GuestLimitModalProps) {
  const { guestOperationsUsed, guestOperationsLimit } = useGuestMode()

  const benefits = [
    { icon: Infinity, title: "Unlimited Operations", description: "Process as many PDFs as you need" },
    { icon: CheckCircle, title: "Processing History", description: "Keep track of all your processed files" },
    { icon: Zap, title: "Priority Processing", description: "Faster processing speeds for all operations" },
    { icon: FileText, title: "Advanced Features", description: "Access to premium PDF tools and options" }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Guest Limit Reached
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600 dark:text-gray-400">
            You've used all {guestOperationsLimit} free operations for today
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800 dark:text-orange-200">Usage Summary</span>
            </div>
            <Badge className="bg-orange-600 text-white">Guest Mode</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{guestOperationsUsed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Operations Used</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Remaining Today</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Sign Up Card */}
          <Card className="border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg mb-3">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-red-800 dark:text-red-200">Create Free Account</CardTitle>
              <CardDescription>Get unlimited access instantly</CardDescription>
              <Badge className="bg-red-600 text-white border-red-600">Recommended</Badge>
            </CardHeader>
            <CardContent>
              <Link href="/auth/signup" onClick={onClose}>
                <Button className="w-full group" size="lg">
                  <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Sign Up Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Sign In Card */}
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg mb-3">
                <User className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Already Have Account?</CardTitle>
              <CardDescription>Sign in to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/login" onClick={onClose}>
                <Button variant="outline" className="w-full group" size="lg">
                  <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
            Why Create an Account?
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-sm">
                  <benefit.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{benefit.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your guest operations will reset tomorrow at midnight
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}