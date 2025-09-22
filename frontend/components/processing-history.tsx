'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'

interface ProcessingHistoryItem {
  id: number
  operation: string
  operation_display: string
  filename: string
  file_size: number
  processing_time: number
  created_at: string
  success: boolean
  error_message?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'

export function ProcessingHistory() {
  const [history, setHistory] = useState<ProcessingHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/history/`)
        // Handle paginated response from Django REST Framework
        const historyData = Array.isArray(response.data) 
          ? response.data 
          : response.data.results || []
        setHistory(historyData.slice(0, 10)) // Show only last 10 operations
      } catch (error) {
        console.error('Error fetching processing history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()

    // Listen for auth status changes to clear history when user logs out
    const handleAuthChange = (event: CustomEvent) => {
      if (!event.detail.user) {
        // User logged out, clear history
        setHistory([])
      } else {
        // User logged in, fetch fresh history
        fetchHistory()
      }
    }

    window.addEventListener('authStatusChanged', handleAuthChange as EventListener)
    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange as EventListener)
    }
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (seconds: number) => {
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
    return `${seconds.toFixed(1)}s`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.round(diffInHours * 60)
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      const hours = Math.round(diffInHours)
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getOperationColor = (operation: string) => {
    const colors: Record<string, string> = {
      merge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      split: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      compress: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      pdf_to_img: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      img_to_pdf: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      extract_text: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      watermark: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      rotate: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      secure: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      unlock: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    }
    return colors[operation] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Processing History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Processing History</span>
        </CardTitle>
        <CardDescription>
          Your recent PDF processing operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No processing history yet.</p>
            <p className="text-sm">Start by processing your first PDF!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {item.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getOperationColor(item.operation)}>
                        {item.operation_display}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground truncate">
                      <span className="font-medium text-foreground">{item.filename}</span>
                      {item.success && (
                        <>
                          {' • '}{formatFileSize(item.file_size)}
                          {' • '}{formatTime(item.processing_time)}
                        </>
                      )}
                      {!item.success && item.error_message && (
                        <span className="text-red-500 ml-2">
                          Error: {item.error_message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}