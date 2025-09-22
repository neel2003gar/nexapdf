'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileDropzone } from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProcessingResult } from '@/components/processing-result'
import axios from 'axios'
import { showToast } from '@/lib/toast'
import { Archive, Download, FileText } from 'lucide-react'
import { useNotifyOperation } from '@/lib/usage-context'
import { useRouter } from 'next/navigation'
import { handleDownloadWithUsageTracking } from '@/lib/download-utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'

export default function CompressPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [processingStats, setProcessingStats] = useState<any>(null)
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const user = null // Auth disabled
  const notifyOperation = useNotifyOperation()
  const router = useRouter()

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setDownloadUrl(null)
    setProcessingStats(null)
  }

  const handleCompress = async () => {
    if (files.length !== 1) {
      showToast.error.multipleFiles()
      return
    }

    setUploading(true)
    setProgress(0)
    const startTime = Date.now()

    try {
      const formData = new FormData()
      formData.append('file', files[0])
      formData.append('quality', quality)

      const originalSize = files[0].size

      const response = await axios.post(`${API_URL}/pdf/compress/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
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
      
      // Get actual file size from response header
      const actualFileSize = response.headers['x-file-size'] 
        ? parseInt(response.headers['x-file-size']) 
        : blob.size
      
      // Set processing statistics
      setProcessingStats({
        originalSize,
        processedSize: actualFileSize,
        processingTime,
        fileCount: 1,
        operationType: 'compression'
      })
      
      // Notify about successful operation (this will trigger usage updates)
      notifyOperation('compress', true)
      
      showToast.success.compress()
    } catch (error: any) {
      console.error('Compress error:', error)
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else {
        showToast.error.processingFailed('Compress')
      }
      
      // Notify about failed operation
      notifyOperation('compress', false)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      handleDownloadWithUsageTracking(
        downloadUrl,
        'compressed.pdf',
        'compress',
        router,
        notifyOperation
      )
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background">
        <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Archive className="mx-auto h-16 w-16 text-orange-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Compress PDF File</h1>
            <p className="text-muted-foreground text-lg">
              Reduce PDF file size while maintaining quality
            </p>
          </div>

          <div className="space-y-6">
            <FileDropzone
              onFilesChange={handleFilesChange}
              accept={{ 'application/pdf': ['.pdf'] }}
              multiple={false}
              maxFiles={1}
            />

            {files.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Selected File</h3>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">{files[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        Original size: {formatFileSize(files[0].size)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Quality Selection */}
                <div className="space-y-2">
                  <h4 className="font-medium">Compression Quality</h4>
                  <div className="flex gap-2">
                    {(['high', 'medium', 'low'] as const).map((q) => (
                      <Button
                        key={q}
                        variant={quality === q ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuality(q)}
                      >
                        {q.charAt(0).toUpperCase() + q.slice(1)} 
                        {q === 'high' && ' (Best Quality)'}
                        {q === 'medium' && ' (Balanced)'}
                        {q === 'low' && ' (Smallest Size)'}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Compressing PDF...</p>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleCompress}
                disabled={files.length !== 1 || uploading}
                className="flex-1"
                size="lg"
              >
                {uploading ? 'Compressing...' : 'Compress PDF'}
              </Button>
            </div>

            {/* Processing Result */}
            <ProcessingResult
              downloadUrl={downloadUrl}
              onDownload={handleDownload}
              stats={processingStats}
              filename={files[0] ? `compressed_${files[0].name}` : 'compressed.pdf'}
            />

            // User content removed
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}