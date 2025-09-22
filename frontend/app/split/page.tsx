'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileDropzone } from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProcessingResult } from '@/components/processing-result'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { pdfAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { toast } from 'sonner'
import { Download, Scissors } from 'lucide-react'
import { useNotifyOperation } from '@/lib/usage-context'
import { useRouter } from 'next/navigation'
import { handleDownloadWithUsageTracking } from '@/lib/download-utils'

export default function SplitPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [processingStats, setProcessingStats] = useState<any>(null)
  const [splitMethod, setSplitMethod] = useState('each')
  const [pageRanges, setPageRanges] = useState('')
  const [pagesPerSplit, setPagesPerSplit] = useState('1')
  // Authentication disabled for now
  const user = null
  const notifyOperation = useNotifyOperation()
  const router = useRouter()

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setDownloadUrl(null)
    setProcessingStats(null)
    
    // Show upload confirmation
    if (newFiles.length > 0) {
      toast.success(`File uploaded: ${newFiles[0].name} 📄`)
    }
  }

  const handleSplit = async () => {
    if (files.length !== 1) {
      showToast.error.multipleFiles()
      return
    }

    setUploading(true)
    setProgress(0)
    const startTime = Date.now()

    try {
      let splitValue = undefined
      
      if (splitMethod === 'pages') {
        splitValue = pageRanges
      } else if (splitMethod === 'range') {
        splitValue = pageRanges
      } else if (splitMethod === 'interval') {
        splitValue = pagesPerSplit
      }

      const response = await pdfAPI.split(files[0], splitMethod, splitValue, (progressEvent) => {
        const progress = progressEvent.total 
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0
        setProgress(progress)
      })

      const endTime = Date.now()
      const processingTime = (endTime - startTime) / 1000

      // Create download URL from blob
      const contentType = response.headers['content-type'] || 'application/pdf'
      const blob = new Blob([response.data], { 
        type: contentType 
      })
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      
      // Determine if it's a ZIP or PDF
      const isZip = contentType === 'application/zip' || response.headers['content-disposition']?.includes('.zip')
      
      // Set processing statistics
      setProcessingStats({
        originalSize: files[0].size,
        processedSize: blob.size,
        processingTime,
        fileCount: isZip ? 'multiple' : 1,
        operationType: 'split',
        isZip
      })
      
      // Notify about successful operation (this will trigger usage updates)
      notifyOperation('split', true)
      
      showToast.success.split()
    } catch (error: any) {      
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error || 'Invalid file or parameters'
        showToast.error.processingFailed(`Split: ${errorMsg}`)
      } else {
        showToast.error.processingFailed('Split')
      }
      
      // Notify about failed operation
      notifyOperation('split', false)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      // Determine filename and extension based on content type
      const baseFilename = files[0] ? files[0].name.replace('.pdf', '') : 'split'
      const extension = processingStats?.isZip ? '.zip' : '.pdf'
      const filename = `split_${baseFilename}${extension}`
      
      handleDownloadWithUsageTracking(
        downloadUrl,
        filename,
        'split',
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
            <Scissors className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Split PDF File</h1>
            <p className="text-muted-foreground text-lg">
              Extract pages or split PDF into multiple files
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              💡 Multi-page PDFs will be split into individual files and zipped for download
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
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Download className="h-4 w-4" />
                  <span className="font-medium">File Ready:</span>
                  <span>{files[0].name}</span>
                  <span className="text-sm opacity-75">({Math.round(files[0].size / 1024)}KB)</span>
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Split Options</h3>
                
                <RadioGroup value={splitMethod} onValueChange={setSplitMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="each" id="each" />
                    <Label htmlFor="each">Split into individual pages</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="range" id="range" />
                    <Label htmlFor="range">Split by page ranges</Label>
                  </div>
                  
                  {splitMethod === 'range' && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="pageRanges">Page ranges (e.g., 1-3,5-7,10)</Label>
                      <Input
                        id="pageRanges"
                        value={pageRanges}
                        onChange={(e) => setPageRanges(e.target.value)}
                        placeholder="1-3,5-7,10"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="interval" id="interval" />
                    <Label htmlFor="interval">Split by page interval</Label>
                  </div>
                  
                  {splitMethod === 'interval' && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="pagesPerSplit">Pages per split</Label>
                      <Input
                        id="pagesPerSplit"
                        type="number"
                        min="1"
                        value={pagesPerSplit}
                        onChange={(e) => setPagesPerSplit(e.target.value)}
                        className="w-24"
                      />
                    </div>
                  )}
                </RadioGroup>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Splitting PDF...</p>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleSplit}
                disabled={files.length !== 1 || uploading}
                className="min-w-[200px]"
                size="lg"
              >
                {uploading ? 'Splitting...' : 'Split PDF'}
              </Button>
            </div>

            {/* Processing Result */}
            <ProcessingResult
              downloadUrl={downloadUrl}
              onDownload={handleDownload}
              stats={processingStats}
              filename={files[0] ? `split_${files[0].name}` : 'split.pdf'}
            />

            {/* Authentication disabled for now */}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}