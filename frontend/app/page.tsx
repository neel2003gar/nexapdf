'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FeatureCard } from '@/components/feature-card'
import { Button } from '@/components/ui/button'
import { WelcomeModal } from '@/components/welcome-modal'
import { useGuestMode } from '@/components/guest-mode-provider'
import { useAuth } from '@/components/auth-provider'
import Image from 'next/image'
import { 
  FileText, 
  Scissors, 
  Archive, 
  Image as ImageIcon, 
  FileImage, 
  Type, 
  Shield, 
  RotateCw,
  Droplets,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { UsageStatusCard } from '@/components/usage-status-card'

const features = [
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one document',
    icon: FileText,
    href: '/merge',
    color: 'bg-gradient-to-br from-red-500 to-red-600'
  },
  {
    title: 'Split PDF',
    description: 'Extract pages or split PDF into multiple files',
    icon: Scissors,
    href: '/split',
    color: 'bg-gradient-to-br from-red-600 to-red-700'
  },
  {
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    icon: Archive,
    href: '/compress',
    color: 'bg-gradient-to-br from-red-700 to-red-800'
  },
  {
    title: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files',
    icon: FileText,
    href: '/pdf-to-word',
    color: 'bg-gradient-to-br from-rose-500 to-red-600'
  },
  {
    title: 'Word to PDF',
    description: 'Convert Word documents to PDF format',
    icon: FileText,
    href: '/word-to-pdf',
    color: 'bg-gradient-to-br from-rose-600 to-red-700'
  },
  {
    title: 'PDF to PowerPoint',
    description: 'Convert PDF to PowerPoint presentations',
    icon: FileText,
    href: '/pdf-to-powerpoint',
    color: 'bg-gradient-to-br from-pink-600 to-red-600'
  },
  {
    title: 'PowerPoint to PDF',
    description: 'Convert PowerPoint presentations to PDF',
    icon: FileText,
    href: '/powerpoint-to-pdf',
    color: 'bg-gradient-to-br from-pink-700 to-red-700'
  },
  {
    title: 'PDF to Excel',
    description: 'Extract tabular data from PDF to Excel',
    icon: FileText,
    href: '/pdf-to-excel',
    color: 'bg-gradient-to-br from-red-500 to-pink-600'
  },
  {
    title: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF',
    icon: FileText,
    href: '/excel-to-pdf',
    color: 'bg-gradient-to-br from-red-600 to-pink-700'
  },
  {
    title: 'PDF to Image',
    description: 'Convert PDF pages to JPG, PNG images',
    icon: ImageIcon,
    href: '/convert?type=pdf-to-img',
    color: 'bg-gradient-to-br from-rose-500 to-pink-600'
  },
  {
    title: 'Image to PDF',
    description: 'Convert images to PDF documents',
    icon: FileImage,
    href: '/convert?type=img-to-pdf',
    color: 'bg-gradient-to-br from-rose-600 to-pink-700'
  },
  {
    title: 'Organize PDF',
    description: 'Preview and reorder pages with drag & drop',
    icon: RotateCw,
    href: '/organize-pdf',
    color: 'bg-gradient-to-br from-red-500 to-rose-600'
  },
  {
    title: 'Extract Text',
    description: 'Extract text content from PDF files',
    icon: Type,
    href: '/extract-text',
    color: 'bg-gradient-to-br from-red-600 to-rose-700'
  },
  {
    title: 'Add Watermark',
    description: 'Add text or image watermarks to PDFs',
    icon: Droplets,
    href: '/watermark',
    color: 'bg-gradient-to-br from-red-700 to-rose-800'
  },
  {
    title: 'Rotate Pages',
    description: 'Rotate PDF pages to correct orientation',
    icon: RotateCw,
    href: '/rotate',
    color: 'bg-gradient-to-br from-rose-700 to-red-800'
  },
  {
    title: 'Secure PDF',
    description: 'Add password protection to PDF files',
    icon: Shield,
    href: '/secure',
    color: 'bg-gradient-to-br from-red-800 to-rose-900'
  }
]

export default function HomePage() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const { hasSeenWelcome, setHasSeenWelcome, setGuestMode } = useGuestMode()
  const { user, loading } = useAuth()

  // Show welcome modal for new users who haven't seen it and aren't logged in
  // Wait for auth loading to complete to avoid showing modal during refresh
  useEffect(() => {
    if (!loading && !user && !hasSeenWelcome) {
      setShowWelcomeModal(true)
    }
  }, [user, hasSeenWelcome, loading])

  const handleContinueAsGuest = () => {
    setGuestMode(true)
    setHasSeenWelcome(true)
    setShowWelcomeModal(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-950/20 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-red-50 dark:bg-red-950/10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex justify-center mb-6">
              <Image
                src="/nexapdf/logo.svg"
                alt="NexaPDF"
                width={80}
                height={80}
                className="h-16 w-16 md:h-20 md:w-20"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.parentElement?.querySelector('.fallback-hero-icon')
                  if (fallback) fallback.classList.remove('hidden')
                }}
              />
              <FileText className="h-16 w-16 md:h-20 md:w-20 text-red-600 fallback-hero-icon hidden" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-rose-600 bg-clip-text text-transparent mb-6 leading-tight">
              NexaPDF
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Complete PDF processing suite with merge, split, compress, convert, and more features. 
              Fast, secure, and easy to use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="xl" asChild className="group">
                <Link href="/merge" className="flex items-center gap-2">
                  <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Get Started
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="group">
                <Link href="#features" className="flex items-center gap-2">
                  <Settings className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  View All Tools
                </Link>
              </Button>
            </div>
            
            {/* Usage Status Card */}
            <div className="max-w-sm mx-auto">
              <UsageStatusCard />
            </div>
          </div>
        </section>

        {/* Welcome Modal */}
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => {}} 
          onContinueAsGuest={handleContinueAsGuest}
        />

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                PDF Processing Tools
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                All the tools you need to work with PDF files
              </p>
            </div>
              
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Why Choose NexaPDF?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6">
                <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your files are processed securely and deleted after processing
                </p>
              </div>
              <div className="p-6">
                <RotateCw className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Quick and efficient PDF processing in the cloud
                </p>
              </div>
              <div className="p-6">
                <Type className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Simple drag-and-drop interface for all operations
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}