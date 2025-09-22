'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileDropzone } from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { pdfAPI } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { useNotifyOperation } from '@/lib/usage-context'
import { useRouter } from 'next/navigation'
import { handleDownloadWithUsageTracking } from '@/lib/download-utils'
import { Unlock, Download, FileText, Eye, EyeOff } from 'lucide-react'

export default function UnlockPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const user = null // Auth disabled
  const notifyOperation = useNotifyOperation()
  const router = useRouter()

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setDownloadUrl(null)
  }

  const handleUnlock = async () => {
    if (files.length !== 1) {
      showToast.error.multipleFiles()
      return
    }

    if (!password.trim()) {
      showToast.error.noPassword()
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
      const response = await pdfAPI.unlock(files[0], password)

      // Clear progress and finalize
      clearInterval(progressInterval)
      setProgress(100)

      // Create download URL
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      
      showToast.success.unlock()
      
      // Notify about completed operation
      notifyOperation('unlock', true)
    } catch (error: any) {
      console.error('Unlock error:', error)
      clearInterval(progressInterval)
      
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else if (error.response?.status === 400 || error.response?.data?.error?.includes('password')) {
        showToast.error.wrongPassword()
      } else if (error.response?.data?.error) {
        showToast.error.processingFailed(`Unlock: ${error.response.data.error}`)
      } else {
        showToast.error.processingFailed('Unlock')
      }
      
      // Notify about failed operation
      notifyOperation('unlock', false)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000) // Keep progress visible briefly on success
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      handleDownloadWithUsageTracking(
        downloadUrl,
        'unlocked.pdf',
        'unlock',
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
            <Unlock className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Unlock Password-Protected PDF</h1>
            <p className="text-muted-foreground text-lg">
              Remove password protection from your PDF documents
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
                  <h3 className="text-lg font-semibold">Enter PDF Password</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Current PDF Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter the PDF password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter the password that was used to protect this PDF
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      About Password Removal:
                    </h4>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <li>• You must know the current password to unlock the PDF</li>
                      <li>• The unlocked PDF will have no password protection</li>
                      <li>• Make sure to store the unlocked PDF securely</li>
                      <li>• This process does not work with digitally signed PDFs</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {progress < 30 ? 'Verifying password...' : 
                     progress < 60 ? 'Decrypting PDF content...' : 
                     progress < 90 ? 'Removing protection...' : 'Almost done...'}
                  </p>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {progress}% complete • Removing password protection
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleUnlock}
                disabled={
                  files.length !== 1 || 
                  uploading || 
                  !password.trim()
                }
                className="flex-1"
                size="lg"
              >
                {uploading ? 'Unlocking PDF...' : 'Remove Password Protection'}
              </Button>

              {downloadUrl && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Unlocked PDF
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