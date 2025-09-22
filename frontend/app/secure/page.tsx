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
import { Shield, Download, FileText, Eye, EyeOff } from 'lucide-react'

export default function SecurePage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const user = null // Auth disabled
  const notifyOperation = useNotifyOperation()
  const router = useRouter()

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setDownloadUrl(null)
  }

  const handleSecure = async () => {
    if (files.length !== 1) {
      showToast.error.multipleFiles()
      return
    }

    if (!password.trim()) {
      showToast.error.noPassword()
      return
    }

    if (password.length < 6) {
      showToast.error.passwordTooShort()
      return
    }

    if (password !== confirmPassword) {
      showToast.error.passwordMismatch()
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
      const response = await pdfAPI.secure(files[0], password)

      // Clear progress and finalize
      clearInterval(progressInterval)
      setProgress(100)

      // Create download URL
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      
      showToast.success.secure()
      
      // Notify about completed operation
      notifyOperation('secure', true)
    } catch (error: any) {
      console.error('Secure error:', error)
      clearInterval(progressInterval)
      
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else if (error.response?.data?.error) {
        showToast.error.processingFailed(`Security: ${error.response.data.error}`)
      } else {
        showToast.error.processingFailed('Security')
      }
      
      // Notify about failed operation
      notifyOperation('secure', false)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000) // Keep progress visible briefly on success
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      handleDownloadWithUsageTracking(
        downloadUrl,
        'secured.pdf',
        'secure',
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
            <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Secure PDF with Password</h1>
            <p className="text-muted-foreground text-lg">
              Add password protection to your PDF documents
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
                  <h3 className="text-lg font-semibold">Password Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter a strong password"
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
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                      />
                    </div>

                    {password && confirmPassword && (
                      <div className="text-sm">
                        {password === confirmPassword ? (
                          <p className="text-green-600">✓ Passwords match</p>
                        ) : (
                          <p className="text-red-600">✗ Passwords do not match</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      Important Security Notes:
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• Choose a strong, unique password</li>
                      <li>• Store your password safely - we cannot recover it</li>
                      <li>• The password will be required to open the PDF</li>
                      <li>• This prevents unauthorized access to your document</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {progress < 30 ? 'Analyzing PDF structure...' : 
                     progress < 60 ? 'Applying AES-256 encryption...' : 
                     progress < 90 ? 'Finalizing security settings...' : 'Almost done...'}
                  </p>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {progress}% complete • Securing with strong encryption
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSecure}
                disabled={
                  files.length !== 1 || 
                  uploading || 
                  !password.trim() ||
                  password.length < 6 ||
                  password !== confirmPassword
                }
                className="flex-1"
                size="lg"
              >
                {uploading ? 'Securing PDF...' : 'Secure with Password'}
              </Button>

              {downloadUrl && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Secured PDF
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