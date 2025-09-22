'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Zap, Check, X } from 'lucide-react'

interface UsageLimitModalProps {
  isOpen: boolean
  onClose: () => void
  operationsUsed: number
  maxOperations: number
}

export function UsageLimitModal({ isOpen, onClose, operationsUsed, maxOperations }: UsageLimitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <DialogTitle className="text-center">Usage Limit Reached</DialogTitle>
          <DialogDescription className="text-center">
            You've used all {maxOperations} free operations available for anonymous users.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Free Operations</span>
              <span className="text-sm text-muted-foreground">{operationsUsed}/{maxOperations}</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${(operationsUsed / maxOperations) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Create Free Account
              </span>
            </div>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>Unlimited PDF operations</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>All 16+ tools included</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>No daily limits</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>Secure & private processing</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Maybe Later
          </Button>
          <Link href="/auth/signup" className="w-full sm:w-auto">
            <Button className="w-full">
              Create Free Account
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}