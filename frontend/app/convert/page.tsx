'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileDropzone } from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ImagePreviewGrid } from '@/components/image-preview-grid'
import { pdfAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { useNotifyOperation } from '@/lib/usage-context'
import { useRouter } from 'next/navigation'
import { handleDownloadWithUsageTracking } from '@/lib/download-utils'
import { RefreshCw, Download, Image, FileText } from 'lucide-react'

function ConvertPageContent() {
  const searchParams = useSearchParams()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrls, setDownloadUrls] = useState<string[]>([])
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [conversionType, setConversionType] = useState('pdf-to-img')
  const [imageFormat, setImageFormat] = useState<'jpg' | 'png'>('jpg')
  const [dpi, setDpi] = useState<number>(150)
  const [rotations, setRotations] = useState<number[]>([])
  const user = null // Auth disabled
  const notifyOperation = useNotifyOperation()
  const router = useRouter()

  // Set conversion type from URL parameter
  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'pdf-to-img' || type === 'img-to-pdf') {
      setConversionType(type)
    }
  }, [searchParams])

  // Reset state when conversion type changes
  useEffect(() => {
    setFiles([])
    setDownloadUrls([])
    setDownloadUrl(null)
    setUploading(false)
    setProgress(0)
    setRotations([])
  }, [conversionType])

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setDownloadUrls([])
    setDownloadUrl(null)
    setRotations([])
  }

  const getAcceptedFormats = (): Record<string, string[]> => {
    if (conversionType === 'pdf-to-img') {
      return { 'application/pdf': ['.pdf'] }
    } else {
      return { 
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/bmp': ['.bmp'],
        'image/tiff': ['.tiff'],
        'image/webp': ['.webp']
      }
    }
  }

  const handleConvert = async () => {
    if (files.length === 0) {
      showToast.error.noFiles()
      return
    }

    if (conversionType === 'pdf-to-img' && files.length !== 1) {
      showToast.error.multipleFiles()
      return
    }

    if (conversionType === 'img-to-pdf' && files.length === 0) {
      showToast.error.noFiles()
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      let response

      if (conversionType === 'pdf-to-img') {
        response = await pdfAPI.pdfToImages(files[0], imageFormat, dpi)
        
        // Handle ZIP file download (contains all images)
        const blob = new Blob([response.data], { type: 'application/zip' })
        const url = window.URL.createObjectURL(blob)
        setDownloadUrl(url)
        showToast.success.convert()
        
        // Notify about completed operation
        notifyOperation('pdf-to-img', true)
      } else {
        response = await pdfAPI.imagesToPdf(files, rotations)
        
        // Handle single PDF download
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        setDownloadUrl(url)
        showToast.success.convert()
        
        // Notify about completed operation
        notifyOperation('img-to-pdf', true)
      }
    } catch (error: any) {
      console.error('Convert error:', error)
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else {
        showToast.error.processingFailed('Convert')
      }
      
      // Notify about failed operation (won't update usage count but will trigger refresh)
      notifyOperation(conversionType, false)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDownload = (url: string, filename: string) => {
    handleDownloadWithUsageTracking(
      url,
      filename,
      'convert',
      router,
      notifyOperation
    )
  }

  const handleSingleDownload = (filename: string = 'converted.pdf') => {
    if (downloadUrl) {
      handleDownload(downloadUrl, filename)
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const getTitle = () => {
    return conversionType === 'pdf-to-img' ? 'PDF to Images' : 'Images to PDF'
  }

  const getDescription = () => {
    return conversionType === 'pdf-to-img' 
      ? 'Convert PDF pages to JPG or PNG images'
      : 'Convert multiple images into a single PDF document'
  }

  const getIcon = () => {
    return conversionType === 'pdf-to-img' ? Image : FileText
  }

  const IconComponent = getIcon()

  return (
    <div className="min-h-screen bg-background">
        <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <IconComponent className="mx-auto h-16 w-16 text-purple-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">{getTitle()}</h1>
            <p className="text-muted-foreground text-lg">
              {getDescription()}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              <RadioGroup 
                value={conversionType} 
                onValueChange={(value) => {
                  setConversionType(value)
                  setFiles([])
                  setDownloadUrls([])
                  setDownloadUrl(null)
                }}
                className="flex flex-row space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf-to-img" id="pdf-to-img" />
                  <Label htmlFor="pdf-to-img">PDF to Images</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="img-to-pdf" id="img-to-pdf" />
                  <Label htmlFor="img-to-pdf">Images to PDF</Label>
                </div>
              </RadioGroup>
            </div>

            {conversionType === 'pdf-to-img' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Image Format:</Label>
                    <RadioGroup 
                      value={imageFormat} 
                      onValueChange={(value: 'jpg' | 'png') => setImageFormat(value)}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="jpg" id="jpg" />
                        <Label htmlFor="jpg">JPG</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="png" id="png" />
                        <Label htmlFor="png">PNG</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Image Quality (DPI):</Label>
                    <RadioGroup 
                      value={dpi.toString()} 
                      onValueChange={(value: string) => setDpi(parseInt(value))}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="100" id="dpi100" />
                        <Label htmlFor="dpi100">100 (Small)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="150" id="dpi150" />
                        <Label htmlFor="dpi150">150 (Medium)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="300" id="dpi300" />
                        <Label htmlFor="dpi300">300 (High)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            <FileDropzone
              onFilesChange={handleFilesChange}
              accept={getAcceptedFormats()}
              multiple={conversionType === 'img-to-pdf'}
              maxFiles={conversionType === 'pdf-to-img' ? 1 : 20}
            />

            {/* Enhanced preview for images-to-PDF */}
            {conversionType === 'img-to-pdf' && files.length > 0 && (
              <ImagePreviewGrid
                files={files}
                onFilesChange={setFiles}
                onRemoveFile={removeFile}
                onRotationsChange={setRotations}
              />
            )}

            {/* Simple file list for PDF-to-images */}
            {conversionType === 'pdf-to-img' && files.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Selected Files ({files.length})
                </h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Converting files...</p>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleConvert}
                disabled={files.length === 0 || uploading}
                className="flex-1 flex items-center gap-2"
                size="lg"
              >
                <RefreshCw className={`h-4 w-4 ${uploading ? 'animate-spin' : ''}`} />
                {uploading ? 'Converting...' : `Convert ${files.length} file${files.length !== 1 ? 's' : ''}`}
              </Button>
            </div>

            {/* Single file download */}
            {downloadUrl && (
              <div className="flex justify-center">
                <Button
                  onClick={() => handleSingleDownload(
                    conversionType === 'pdf-to-img' 
                      ? `${files[0]?.name.replace('.pdf', '')}_images.zip` 
                      : 'converted.pdf'
                  )}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {conversionType === 'pdf-to-img' ? 'Download Images (ZIP)' : 'Download PDF'}
                </Button>
              </div>
            )}

            {/* Multiple image downloads - disabled since we use ZIP files */}
            {downloadUrls.length > 0 && conversionType !== 'pdf-to-img' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">
                  Download Converted Images
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {downloadUrls.map((url, index) => (
                    <Button
                      key={index}
                      onClick={() => handleDownload(url, `page_${index + 1}.${imageFormat}`)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-3 w-3" />
                      Page {index + 1}
                    </Button>
                  ))}
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

export default function ConvertPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConvertPageContent />
    </Suspense>
  )
}