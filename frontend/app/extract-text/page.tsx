'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileDropzone } from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { pdfAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { useNotifyOperation } from '@/lib/usage-context'
import { useRouter } from 'next/navigation'
import { handleDownloadWithUsageTracking } from '@/lib/download-utils'
import { Type, Copy, Download } from 'lucide-react'

export default function ExtractTextPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedText, setExtractedText] = useState('')
  const notifyOperation = useNotifyOperation()
  const router = useRouter()
  const [processingType, setProcessingType] = useState<'text' | 'ocr' | ''>('')
  const user = null // Auth disabled

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setExtractedText('')
    setProcessingType('')
  }

  const handleExtract = async () => {
    if (files.length !== 1) {
      showToast.error.multipleFiles()
      return
    }

    setUploading(true)
    setProgress(0)
    setProcessingType('')

    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Simulate progress for better UX
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 500)

      const response = await pdfAPI.extractText(files[0])
      
      if (progressInterval) clearInterval(progressInterval)
      setProgress(100)
      
      if (response.data && response.data.text) {
        setExtractedText(response.data.text)
        
        // Determine processing type based on response
        if (response.data.text.includes('(OCR)')) {
          setProcessingType('ocr')
          showToast.success.extract()
        } else {
          setProcessingType('text')
          showToast.success.extract()
        }
        
        // Notify about completed operation
        notifyOperation('extract-text', true)
      } else {
        console.error('No text data in response:', response.data)
        showToast.error.processingFailed('Extract')
      }
    } catch (error: any) {
      console.error('Extract error:', error)
      if (progressInterval) clearInterval(progressInterval)
      
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else {
        showToast.error.processingFailed('Extract')
      }
      
      // Notify about failed operation
      notifyOperation('extract-text', false)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText)
      showToast.success.download()
    } catch (error) {
      showToast.error.processingFailed('Copy')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    
    handleDownloadWithUsageTracking(
      url,
      'extracted-text.txt',
      'extract-text',
      router,
      notifyOperation
    )
    
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
        <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Type className="mx-auto h-16 w-16 text-indigo-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Extract Text from PDF</h1>
            <p className="text-muted-foreground text-lg">
              Extract all text content from your PDF documents
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              ✨ Supports both text-based PDFs and scanned documents with OCR
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
                    <Type className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="font-medium">{files[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(files[0].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {progress < 30 ? 'Analyzing PDF...' : 
                   progress < 60 ? 'Extracting text...' : 
                   progress < 90 ? 'Processing content...' : 'Finalizing...'}
                </p>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {progress < 50 ? 'Trying text extraction first...' : 
                   'If no text found, OCR will be used automatically'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleExtract}
                disabled={files.length !== 1 || uploading}
                className="flex-1"
                size="lg"
              >
                {uploading ? 'Extracting...' : 'Extract Text'}
              </Button>
            </div>

            {extractedText && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Extracted Text</h3>
                    {processingType && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {processingType === 'ocr' ? (
                          <span className="flex items-center gap-1">
                            🔍 Extracted using OCR (scanned document detected)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            📄 Extracted from text-based PDF
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  value={extractedText}
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Extracted text will appear here..."
                />
                
                <div className="text-sm text-muted-foreground">
                  <p>Character count: {extractedText.length.toLocaleString()}</p>
                  <p>Word count: {extractedText.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()}</p>
                </div>
              </div>
            )}

            // User content removed
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}