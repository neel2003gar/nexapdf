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
import { FileSpreadsheet, Download } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'

export default function PDFToExcelPage() {
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
      formData.append('pdf', files[0])

      const response = await axios.post(`${API_URL}/pdf/convert/pdf-to-excel/`, formData, {
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
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      
      // Set processing statistics
      setProcessingStats({
        originalSize: files[0].size,
        processedSize: blob.size,
        processingTime,
        fileCount: 1,
        operationType: 'PDF to Excel Conversion'
      })
      
      // Notify about successful operation (this will trigger usage updates)
      notifyOperation('pdf-to-excel', true)
      
      showToast.success.convert()
    } catch (error: any) {
      console.error('Conversion error:', error)
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else {
        showToast.error.processingFailed('PDF to Excel conversion')
      }
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const originalName = files[0]?.name || 'spreadsheet'
      const baseName = originalName.replace(/\.[^/.]+$/, '')
      const filename = `${baseName}.xlsx`
      
      handleDownloadWithUsageTracking(
        downloadUrl,
        filename,
        'pdf-to-excel',
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
            <FileSpreadsheet className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">PDF to Excel</h1>
            <p className="text-muted-foreground text-lg">
              Extract tabular data from PDF documents to Excel spreadsheets
            </p>
          </div>

          <div className="space-y-8">
            <FileDropzone
              onFilesChange={handleFilesChange}
              accept={{ 'application/pdf': ['.pdf'] }}
              multiple={false}
              maxFiles={1}
              className="border-2 border-dashed border-green-300 hover:border-green-400"
            />

            {files.length > 0 && (
              <div className="space-y-6">
                {/* File Info and Convert Button */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-500" />
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
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {uploading ? (
                      <>
                        <Download className="mr-2 h-4 w-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Convert to Excel
                      </>
                    )}
                  </Button>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Converting to Excel...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <ProcessingResult
                  downloadUrl={downloadUrl}
                  onDownload={handleDownload}
                  stats={processingStats}
                  filename={`${files[0]?.name.replace(/\.[^/.]+$/, '') || 'spreadsheet'}.xlsx`}
                />
              </div>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                  What is PDF to Excel?
                </h3>
                <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                  <li>• Extracts tables and data from PDFs</li>
                  <li>• Converts to editable Excel format</li>
                  <li>• Preserves table structure and formatting</li>
                  <li>• Perfect for data analysis and editing</li>
                </ul>
              </div>
              
              <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">
                  Tips
                </h3>
                <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                  <li>• Works best with PDFs containing tables</li>
                  <li>• Text-based PDFs give better results</li>
                  <li>• Review extracted data for accuracy</li>
                  <li>• Use for financial reports and data sheets</li>
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