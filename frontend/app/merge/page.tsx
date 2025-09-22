'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileDropzone } from '@/components/file-dropzone'
import { PDFPreviewGrid } from '@/components/pdf-preview-grid'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProcessingResult } from '@/components/processing-result'
import { GuestLimitModal } from '@/components/guest-limit-modal'
import { useGuestMode } from '@/components/guest-mode-provider'
import { useAuth } from '@/components/auth-provider'
import axios from 'axios'
import { pdfAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Download, FileText, ArrowUpDown } from 'lucide-react'
import { useNotifyOperation } from '@/lib/usage-context'
import { useRouter } from 'next/navigation'
import { handleDownloadWithUsageTracking } from '@/lib/download-utils'
import '@/lib/build-info' // Force cache refresh

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [processingStats, setProcessingStats] = useState<any>(null)
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false)
  const { user } = useAuth()
  const { isGuestMode, canPerformOperation } = useGuestMode()
  const notifyOperation = useNotifyOperation()
  const router = useRouter()

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setDownloadUrl(null)
    setProcessingStats(null)
  }

  const handleFilesReorder = (reorderedFiles: File[]) => {
    setFiles(reorderedFiles)
    setDownloadUrl(null)
    setProcessingStats(null)
  }

  const handleFileRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    setDownloadUrl(null)
    setProcessingStats(null)
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      showToast.error.minFiles(2)
      return
    }

    // Check guest mode limitations
    if (isGuestMode && !canPerformOperation) {
      setShowGuestLimitModal(true)
      return
    }

    setUploading(true)
    setProgress(0)
    const startTime = Date.now()

    try {
      const formData = new FormData()
      // Add files in order with explicit indexing to ensure order preservation
      files.forEach((file, index) => {
        formData.append(`files`, file)
        formData.append(`file_order_${index}`, file.name)
      })
      formData.append('total_files', files.length.toString())

      const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0)

      console.log('🔗 Using API URL:', API_URL) // Debug log
      const response = await axios.post(`${API_URL}/pdf/merge/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        onUploadProgress: (progressEvent: any) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setProgress(progress)
        },
        responseType: 'blob'
      })

      const endTime = Date.now()
      const processingTime = (endTime - startTime) / 1000

      // Create download URL
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      
      // Set processing statistics
      setProcessingStats({
        originalSize: totalOriginalSize,
        processedSize: blob.size,
        processingTime,
        fileCount: files.length,
        operationType: 'merge'
      })
      
      // Notify about successful operation (this will trigger usage updates)
      notifyOperation('merge', true)
      
      showToast.success.merge(files.length)
    } catch (error: any) {
      console.error('Merge error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('API URL used:', API_URL)
      
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else if (error.response?.status === 500) {
        showToast.error.processingFailed('Merge (Server Error)')
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        showToast.error.processingFailed('Merge (Network Error - Check API Connection)')
      } else {
        showToast.error.processingFailed('Merge')
      }
      
      // Notify about failed operation (won't update usage count but will trigger refresh)
      notifyOperation('merge', false)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      handleDownloadWithUsageTracking(
        downloadUrl,
        'merged.pdf',
        'merge',
        router,
        notifyOperation
      )
    }
  }



  return (
    <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Merge PDF Files</h1>
              <p className="text-muted-foreground text-lg">
                Combine multiple PDF files into a single document
              </p>
            </div>

          <div className="space-y-6">
            <FileDropzone
              onFilesChange={handleFilesChange}
              accept={{ 'application/pdf': ['.pdf'] }}
              multiple={true}
              maxFiles={10}
            />

            {files.length > 0 && (
              <PDFPreviewGrid
                files={files}
                onFilesReorder={handleFilesReorder}
                onFileRemove={handleFileRemove}
              />
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {progress < 30 ? 'Uploading PDFs...' : 
                     progress < 60 ? 'Processing merge...' : 
                     progress < 90 ? 'Finalizing document...' : 'Almost done...'}
                  </p>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">{progress}% complete</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleMerge}
                disabled={files.length < 2 || uploading || (isGuestMode && !canPerformOperation)}
                className="flex-1 group bg-red-600 hover:bg-red-700"
                size="lg"
              >
                {files.length > 0 ? (
                  <ArrowUpDown className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                ) : (
                  <FileText className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                )}
                {uploading ? 'Merging...' : files.length > 0 ? `Merge ${files.length} PDFs in Order` : 'Select PDFs to Merge'}
              </Button>
            </div>

            {/* Guest limit warning */}
            {isGuestMode && !canPerformOperation && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-orange-700 dark:text-orange-300 text-sm text-center">
                  You've reached your daily limit of 10 operations. Sign up for unlimited access!
                </p>
              </div>
            )}

            {/* Processing Result */}
            <ProcessingResult
              downloadUrl={downloadUrl}
              onDownload={handleDownload}
              stats={processingStats}
              filename="merged.pdf"
            />

          </div>
        </div>
      </main>
      
      {/* Guest Limit Modal */}
      <GuestLimitModal
        isOpen={showGuestLimitModal}
        onClose={() => setShowGuestLimitModal(false)}
      />
      
      <Footer />
    </div>
  )
}