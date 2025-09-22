'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileDropzone } from '@/components/file-dropzone'
import { WatermarkPreview } from '@/components/watermark-preview'
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
import { Droplets, Download, FileText } from 'lucide-react'

export default function WatermarkPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text')
  const [watermarkText, setWatermarkText] = useState('WATERMARK')
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null)
  
  // Enhanced watermark options with better defaults
  const [position, setPosition] = useState('center')
  const [opacity, setOpacity] = useState(0.5)  // More visible default
  const notifyOperation = useNotifyOperation()
  const router = useRouter()
  const [fontSize, setFontSize] = useState(48)  // Larger default size
  const [color, setColor] = useState('red')     // More noticeable default color
  const [rotation, setRotation] = useState(0)
  const [xOffset, setXOffset] = useState(0)
  const [yOffset, setYOffset] = useState(0)
  
  const user = null // Auth disabled

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setDownloadUrl(null)
  }

  const handleWatermarkImageChange = (files: File[]) => {
    if (files.length > 0) {
      setWatermarkImage(files[0])
    }
  }

  const resetWatermarkSettings = () => {
    setPosition('center')
    setOpacity(0.5)
    setFontSize(48)
    setColor('red')
    setRotation(0)
    setXOffset(0)
    setYOffset(0)
    setWatermarkText('WATERMARK')
  }

  const handleAddWatermark = async () => {
    if (files.length !== 1) {
      showToast.error.multipleFiles()
      return
    }

    if (watermarkType === 'text' && !watermarkText.trim()) {
      showToast.error.noText()
      return
    }

    if (watermarkType === 'image' && !watermarkImage) {
      showToast.error.noImage()
      return
    }

    setUploading(true)
    setProgress(0)

    // Simulate realistic progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 200)

    try {
      let response
      
      if (watermarkType === 'text') {
        // Enhanced text watermark with all options
        const formData = new FormData()
        formData.append('file', files[0])
        formData.append('text', watermarkText)
        formData.append('position', position)
        formData.append('opacity', opacity.toString())
        formData.append('font_size', fontSize.toString())
        formData.append('color', color)
        formData.append('rotation', rotation.toString())
        formData.append('x_offset', xOffset.toString())
        formData.append('y_offset', yOffset.toString())
        
        const axios = (await import('axios')).default
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'
        response = await axios.post(`${API_URL}/pdf/watermark/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
          responseType: 'blob'
        })
      } else {
        // Enhanced image watermark with all options
        const formData = new FormData()
        formData.append('file', files[0])
        formData.append('watermark_image', watermarkImage!)
        formData.append('type', 'image')
        formData.append('position', position)
        formData.append('opacity', opacity.toString())
        formData.append('scale', '1.0') // Default scale for now
        formData.append('x_offset', xOffset.toString())
        formData.append('y_offset', yOffset.toString())
        
        const axios = (await import('axios')).default
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'
        response = await axios.post(`${API_URL}/pdf/watermark/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
          responseType: 'blob'
        })
      }

      // Clear progress and create download URL
      clearInterval(progressInterval)
      setProgress(100)
      
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      
      showToast.success.watermark()
      
      // Notify about completed operation
      notifyOperation('watermark', true)
    } catch (error: any) {
      console.error('Watermark error:', error)
      clearInterval(progressInterval)
      
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else if (error.response?.data?.error) {
        showToast.error.processingFailed(`Watermark: ${error.response.data.error}`)
      } else {
        showToast.error.processingFailed('Watermark')
      }
      
      // Notify about failed operation
      notifyOperation('watermark', false)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000) // Keep progress visible briefly on success
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      handleDownloadWithUsageTracking(
        downloadUrl,
        'watermarked.pdf',
        'watermark',
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
            <Droplets className="mx-auto h-16 w-16 text-cyan-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Add Watermark to PDF</h1>
            <p className="text-muted-foreground text-lg">
              Add text or image watermarks to protect your PDF documents
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
                  <h3 className="text-lg font-semibold">Watermark Options</h3>
                  
                  <RadioGroup value={watermarkType} onValueChange={(value: 'text' | 'image') => setWatermarkType(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="text" />
                      <Label htmlFor="text">Text Watermark</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="image" />
                      <Label htmlFor="image">Image Watermark</Label>
                    </div>
                  </RadioGroup>

                  {watermarkType === 'text' && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetWatermarkSettings}
                        className="text-sm"
                      >
                        Reset Settings
                      </Button>
                    </div>
                  )}

                  {watermarkType === 'text' && (
                    <WatermarkPreview
                      watermarkText={watermarkText}
                      onWatermarkTextChange={setWatermarkText}
                      position={position}
                      onPositionChange={setPosition}
                      opacity={opacity}
                      onOpacityChange={setOpacity}
                      fontSize={fontSize}
                      onFontSizeChange={setFontSize}
                      color={color}
                      onColorChange={setColor}
                      rotation={rotation}
                      onRotationChange={setRotation}
                      xOffset={xOffset}
                      onXOffsetChange={setXOffset}
                      yOffset={yOffset}
                      onYOffsetChange={setYOffset}
                    />
                  )}

                  {watermarkType === 'image' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Watermark Image</Label>
                        <FileDropzone
                          onFilesChange={handleWatermarkImageChange}
                          accept={{
                            'image/png': ['.png'],
                            'image/jpeg': ['.jpg', '.jpeg'],
                            'image/gif': ['.gif']
                          }}
                          multiple={false}
                          maxFiles={1}
                          maxSize={5 * 1024 * 1024} // 5MB
                          className="py-4"
                        />
                        {watermarkImage && (
                          <div className="flex items-center justify-between gap-3 p-3 border rounded-lg bg-green-50">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 border rounded overflow-hidden">
                                <img 
                                  src={URL.createObjectURL(watermarkImage)} 
                                  alt="Watermark preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-700">
                                  {watermarkImage.name}
                                </p>
                                <p className="text-xs text-green-600">
                                  {(watermarkImage.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setWatermarkImage(null)}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          PNG images with transparency work best for watermarks
                        </p>
                      </div>

                      {watermarkImage && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Image Position & Settings</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Position</Label>
                              <select 
                                value={position} 
                                onChange={(e) => setPosition(e.target.value)}
                                className="mt-1 w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              >
                                <option value="top-left">Top Left</option>
                                <option value="top-center">Top Center</option>
                                <option value="top-right">Top Right</option>
                                <option value="middle-left">Middle Left</option>
                                <option value="center">Center</option>
                                <option value="middle-right">Middle Right</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="bottom-center">Bottom Center</option>
                                <option value="bottom-right">Bottom Right</option>
                              </select>
                            </div>

                            <div>
                              <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                              <input
                                type="range"
                                value={opacity}
                                onChange={(e) => setOpacity(Number(e.target.value))}
                                min={0.1}
                                max={1}
                                step={0.1}
                                className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm">X Offset: {xOffset}px</Label>
                              <input
                                type="range"
                                value={xOffset}
                                onChange={(e) => setXOffset(Number(e.target.value))}
                                min={-100}
                                max={100}
                                step={5}
                                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Y Offset: {yOffset}px</Label>
                              <input
                                type="range"
                                value={yOffset}
                                onChange={(e) => setYOffset(Number(e.target.value))}
                                min={-100}
                                max={100}
                                step={5}
                                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setXOffset(0)
                              setYOffset(0)
                            }}
                          >
                            Reset Position
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {progress < 30 ? 'Processing PDF...' : 
                     progress < 60 ? 'Applying watermark...' : 
                     progress < 90 ? 'Finalizing document...' : 'Almost done...'}
                  </p>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">{progress}% complete</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAddWatermark}
                disabled={
                  files.length !== 1 || 
                  uploading || 
                  (watermarkType === 'text' && !watermarkText.trim()) ||
                  (watermarkType === 'image' && !watermarkImage)
                }
                className="flex-1"
                size="lg"
              >
                {uploading ? 'Adding Watermark...' : 'Add Watermark'}
              </Button>

              {downloadUrl && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Watermarked PDF
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