'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileText, CheckCircle, Clock, File, Archive } from 'lucide-react'

interface ProcessingResultProps {
  downloadUrl: string | null
  onDownload: () => void
  stats?: {
    originalSize?: number
    processedSize?: number
    processingTime?: number
    fileCount?: number | string
    operationType: string
    isZip?: boolean
  }
  filename?: string
}

export function ProcessingResult({ 
  downloadUrl, 
  onDownload, 
  stats, 
  filename = 'processed_file.pdf' 
}: ProcessingResultProps) {
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

  const compressionRatio = stats?.originalSize && stats?.processedSize 
    ? Math.round(((stats.originalSize - stats.processedSize) / stats.originalSize) * 100)
    : 0

  // Only show compression stats for actual compression operations
  const isCompressionOperation = stats?.operationType?.toLowerCase() === 'compression'

  if (!downloadUrl) return null

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:bg-gradient-to-br dark:from-red-950/20 dark:to-rose-950/20 dark:border-red-800 shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-red-800 dark:text-red-200 text-xl">
            Processing Complete!
          </CardTitle>
        </div>
        <CardDescription className="text-red-700 dark:text-red-300">
          Your {stats?.operationType || 'PDF'} operation has been completed successfully.
          {stats?.isZip && " Multiple files have been packaged into a ZIP archive."}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* File Info */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center space-x-3">
            {stats?.isZip ? (
              <Archive className="h-5 w-5 text-orange-500" />
            ) : (
              <FileText className="h-5 w-5 text-blue-500" />
            )}
            <div>
              <p className="font-medium text-sm">{filename}</p>
              {stats?.processedSize && (
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(stats.processedSize)}
                  {stats?.isZip && " (ZIP archive)"}
                </p>
              )}
            </div>
          </div>
          <Button onClick={onDownload} size="sm" className="flex items-center gap-2 group" variant="default">
            <Download className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Download
          </Button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {stats.fileCount && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <File className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                  {stats.fileCount}
                </p>
                <p className="text-xs text-muted-foreground">Files Processed</p>
              </div>
            )}
            
            {stats.originalSize && stats.processedSize && compressionRatio > 0 && isCompressionOperation && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Download className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                  {compressionRatio}%
                </p>
                <p className="text-xs text-muted-foreground">Size Reduced</p>
              </div>
            )}
            
            {stats.originalSize && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FileText className="h-4 w-4 text-gray-500" />
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {formatFileSize(stats.originalSize)}
                </p>
                <p className="text-xs text-muted-foreground">Original Size</p>
              </div>
            )}
            
            {stats.processingTime && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                  {formatTime(stats.processingTime)}
                </p>
                <p className="text-xs text-muted-foreground">Processing Time</p>
              </div>
            )}
          </div>
        )}

        {/* Compression specific info */}
        {stats?.originalSize && stats?.processedSize && compressionRatio > 0 && isCompressionOperation && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700 dark:text-blue-300">Original:</span>
              <span className="font-medium">{formatFileSize(stats.originalSize)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700 dark:text-blue-300">Compressed:</span>
              <span className="font-medium">{formatFileSize(stats.processedSize)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
              <span className="text-blue-700 dark:text-blue-300">Saved:</span>
              <span className="text-green-600 dark:text-green-400">
                {formatFileSize(stats.originalSize - stats.processedSize)} ({compressionRatio}%)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}