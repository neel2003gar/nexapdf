'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileDropzone } from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { pdfAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { useNotifyOperation } from '@/lib/usage-context'
import { useRouter } from 'next/navigation'
import { handleDownloadWithUsageTracking } from '@/lib/download-utils'
import { RotateCw, Download, FileText } from 'lucide-react'

export default function RotatePage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [rotationAngle, setRotationAngle] = useState(90)
  const [pageSelection, setPageSelection] = useState('all')
  const router = useRouter()
  const [specificPages, setSpecificPages] = useState('')
  const user = null // Auth disabled
  const notifyOperation = useNotifyOperation()

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setDownloadUrl(null)
  }

  const handleRotate = async () => {
    if (files.length !== 1) {
      showToast.error.multipleFiles()
      return
    }

    if (pageSelection === 'specific' && !specificPages.trim()) {
      showToast.error.noPages()
      return
    }

    setUploading(true)
    setProgress(0)

    // Simulate realistic progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      const pages = pageSelection === 'all' ? 'all' : specificPages
      const response = await pdfAPI.rotate(files[0], pages, rotationAngle)

      // Clear progress and finalize
      clearInterval(progressInterval)
      setProgress(100)

      // Create download URL
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      
      showToast.success.rotate()
      
      // Notify about completed operation
      notifyOperation('rotate', true)
    } catch (error: any) {
      console.error('Rotate error:', error)
      clearInterval(progressInterval)
      
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else if (error.response?.data?.error) {
        showToast.error.processingFailed(`Rotation: ${error.response.data.error}`)
      } else {
        showToast.error.processingFailed('Rotation')
      }
      
      // Notify about failed operation
      notifyOperation('rotate', false)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000) // Keep progress visible briefly on success
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      handleDownloadWithUsageTracking(
        downloadUrl,
        'rotated.pdf',
        'rotate',
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
            <RotateCw className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Rotate PDF Pages</h1>
            <p className="text-muted-foreground text-lg mb-4">
              Rotate PDF pages to correct their orientation
            </p>
            <div className="max-w-2xl mx-auto p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Works with all PDFs:</strong> Regular documents, scanned pages, and image-based PDFs. 
                Perfect for fixing documents that were scanned upside down or sideways.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <FileDropzone
              onFilesChange={handleFilesChange}
              accept={{ 'application/pdf': ['.pdf'] }}
              multiple={false}
              maxFiles={1}
            />

            {files.length > 0 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Selected File</h3>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">{files[0].name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(files[0].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Rotation Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <Label>Rotation Angle</Label>
                      
                      {/* Visual preview of rotation */}
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center">
                          <div 
                            className="w-16 h-20 bg-white border-2 border-blue-300 rounded shadow-sm transition-transform duration-300 flex items-center justify-center"
                            style={{ transform: `rotate(${rotationAngle}deg)` }}
                          >
                            <div className="text-xs text-center leading-tight">
                              <div className="font-semibold">PAGE</div>
                              <div className="text-[8px]">Content</div>
                            </div>
                          </div>
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-2">
                          Preview: {rotationAngle}° rotation
                        </p>
                      </div>
                      
                      <RadioGroup 
                        value={rotationAngle.toString()} 
                        onValueChange={(value) => setRotationAngle(parseInt(value))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="90" id="90" />
                          <Label htmlFor="90" className="flex items-center gap-2">
                            90° Clockwise
                            <span className="text-xs text-muted-foreground">(Turn right)</span>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="180" id="180" />
                          <Label htmlFor="180" className="flex items-center gap-2">
                            180° (Upside down)
                            <span className="text-xs text-muted-foreground">(Flip)</span>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="270" id="270" />
                          <Label htmlFor="270" className="flex items-center gap-2">
                            270° Counter-clockwise
                            <span className="text-xs text-muted-foreground">(Turn left)</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Pages to Rotate</Label>
                      <RadioGroup 
                        value={pageSelection} 
                        onValueChange={setPageSelection}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="all" />
                          <Label htmlFor="all">All pages</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="specific" id="specific" />
                          <Label htmlFor="specific">Specific pages</Label>
                        </div>
                      </RadioGroup>
                      
                      {pageSelection === 'specific' && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor="specificPages">
                            Page numbers (e.g., 1,3,5-7)
                          </Label>
                          <Input
                            id="specificPages"
                            value={specificPages}
                            onChange={(e) => setSpecificPages(e.target.value)}
                            placeholder="1,3,5-7"
                          />
                          <p className="text-xs text-muted-foreground">
                            Use commas for individual pages and hyphens for ranges
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {progress < 30 ? 'Processing PDF pages...' : 
                     progress < 60 ? `Rotating pages ${rotationAngle}°...` : 
                     progress < 90 ? 'Finalizing document...' : 'Almost done...'}
                  </p>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {progress}% complete • {pageSelection === 'all' ? 'All pages' : `Pages: ${specificPages}`}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleRotate}
                disabled={
                  files.length !== 1 || 
                  uploading || 
                  (pageSelection === 'specific' && !specificPages.trim())
                }
                className="flex-1"
                size="lg"
              >
                {uploading ? 'Rotating...' : `Rotate ${rotationAngle}°`}
              </Button>

              {downloadUrl && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Rotated PDF
                </Button>
              )}
            </div>

            // User content removed
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}