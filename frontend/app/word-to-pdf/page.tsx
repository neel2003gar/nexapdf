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
import { useNotifyOperation } from '@/lib/usage-context'
import { useRouter } from 'next/navigation'
import { handleDownloadWithUsageTracking } from '@/lib/download-utils'
import { FileText, Download } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'

export default function WordToPDFPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [processingStats, setProcessingStats] = useState<any>(null)
  const notifyOperation = useNotifyOperation()
  const router = useRouter()

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setDownloadUrl(null)
    setProcessingStats(null)
  }

  const handleConvert = async () => {
    if (files.length !== 1) {
      showToast.error.noFiles()
      return
    }

    setUploading(true)
    setProgress(0)
    const startTime = Date.now()

    try {
      const formData = new FormData()
      formData.append('docx', files[0])

      const response = await axios.post(`${API_URL}/pdf/convert/word-to-pdf/`, formData, {
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
      
      // Set processing statistics
      setProcessingStats({
        originalSize: files[0].size,
        processedSize: blob.size,
        processingTime,
        fileCount: 1,
        operationType: 'Word to PDF Conversion'
      })
      
      showToast.success.convert()
      
      // Notify about completed operation
      notifyOperation('word-to-pdf', true)
    } catch (error: any) {
      console.error('Conversion error:', error)
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else {
        showToast.error.processingFailed('Word to PDF conversion')
      }
      
      // Notify about failed operation
      notifyOperation('word-to-pdf', false)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const originalName = files[0]?.name || 'document'
      const baseName = originalName.replace(/\.[^/.]+$/, '')
      const filename = `${baseName}.pdf`
      
      handleDownloadWithUsageTracking(
        downloadUrl,
        filename,
        'word-to-pdf',
        router,
        notifyOperation
      )
      
      window.URL.revokeObjectURL(downloadUrl)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <FileText className="mx-auto h-16 w-16 text-red-600 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Word to PDF</h1>
            <p className="text-muted-foreground text-lg">
              Convert Word documents to PDF format with preserved formatting
            </p>
          </div>

          <div className="space-y-8">
            <FileDropzone
              onFilesChange={handleFilesChange}
              accept={{ 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
              }}
              multiple={false}
              maxFiles={1}
              className="border-2 border-dashed border-red-300 hover:border-red-400"
            />

            {files.length > 0 && (
              <div className="space-y-6">
                {/* File Info and Convert Button */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="font-medium">{files[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(files[0].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleConvert}
                    disabled={uploading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {uploading ? (
                      <>
                        <Download className="mr-2 h-4 w-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Convert to PDF
                      </>
                    )}
                  </Button>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Converting to PDF...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <ProcessingResult
                  downloadUrl={downloadUrl}
                  onDownload={handleDownload}
                  stats={processingStats}
                  filename={`${files[0]?.name.replace(/\.[^/.]+$/, '') || 'document'}.pdf`}
                />
              </div>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  What is Word to PDF?
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Converts DOCX documents to PDF format</li>
                  <li>• Preserves formatting, fonts, and layout</li>
                  <li>• Maintains images and tables structure</li>
                  <li>• Creates universal, print-ready documents</li>
                </ul>
              </div>
              
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                  Tips
                </h3>
                <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                  <li>• Use DOCX format for best results</li>
                  <li>• Check document formatting before conversion</li>
                  <li>• Complex layouts may need adjustment</li>
                  <li>• PDF format ensures consistent display</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}