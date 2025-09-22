'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProcessingHistory } from '@/components/processing-history'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileText, Scissors, Archive, Droplets, RotateCw, Lock, Unlock, Image, BookOpen, Layers, Star, Zap, TrendingUp, Clock, Settings, Home } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'

interface UserStats {
  daily_operations_count: number
  total_files_processed: number
  last_operation_date: string | null
}

interface UserData {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
  profile: UserStats
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUserData = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1]

      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`${API_URL}/auth/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 dark:from-gray-900 dark:to-red-950/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-red-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const popularTools = [
    { name: 'Merge PDFs', href: '/merge', icon: FileText, description: 'Combine multiple PDFs', gradient: 'from-red-500 to-red-600' },
    { name: 'Split PDF', href: '/split', icon: Scissors, description: 'Divide PDF into parts', gradient: 'from-orange-500 to-red-500' },
    { name: 'Compress PDF', href: '/compress', icon: Archive, description: 'Reduce file size', gradient: 'from-rose-500 to-pink-500' },
    { name: 'PDF to Word', href: '/pdf-to-word', icon: BookOpen, description: 'Convert to DOCX', gradient: 'from-red-600 to-rose-600' },
    { name: 'Add Watermark', href: '/watermark', icon: Droplets, description: 'Protect with watermarks', gradient: 'from-pink-500 to-red-500' },
    { name: 'Secure PDF', href: '/secure', icon: Lock, description: 'Password protection', gradient: 'from-red-700 to-red-800' },
  ]

  const allTools = [
    { name: 'Merge PDFs', href: '/merge', icon: FileText },
    { name: 'Split PDF', href: '/split', icon: Scissors },
    { name: 'Compress PDF', href: '/compress', icon: Archive },
    { name: 'PDF to Word', href: '/pdf-to-word', icon: BookOpen },
    { name: 'Word to PDF', href: '/word-to-pdf', icon: FileText },
    { name: 'PDF to Images', href: '/convert', icon: Image },
    { name: 'Add Watermark', href: '/watermark', icon: Droplets },
    { name: 'Rotate Pages', href: '/rotate', icon: RotateCw },
    { name: 'Secure PDF', href: '/secure', icon: Lock },
    { name: 'Unlock PDF', href: '/unlock', icon: Unlock },
    { name: 'Extract Text', href: '/extract-text', icon: FileText },
    { name: 'Organize PDF', href: '/organize-pdf', icon: Layers },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-950/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Hero Section with Home Button */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Welcome back, {user.first_name || user.username}! 👋
                </h1>
                <p className="text-red-100 text-lg">
                  Ready to process some PDFs? Your unlimited tools await.
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-4xl font-bold">∞</div>
                  <div className="text-red-100 text-sm">Daily Operations</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">{user.profile?.total_files_processed || 0}</div>
                  <div className="text-red-100 text-sm">Files Processed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Today's Operations</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{user.profile?.daily_operations_count || 0}</div>
              <p className="text-xs text-red-600 dark:text-red-400">Unlimited access</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{user.profile?.total_files_processed || 0}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400">Documents processed</p>
            </CardContent>
          </Card>

          <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-rose-800 dark:text-rose-200">Account Status</CardTitle>
              <Star className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">Pro</div>
              <p className="text-xs text-rose-600 dark:text-rose-400">Unlimited features</p>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-950/20 dark:to-red-950/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-800 dark:text-pink-200">Member Since</CardTitle>
              <Clock className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                {new Date(user.date_joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
              <p className="text-xs text-pink-600 dark:text-pink-400">Account created</p>
            </CardContent>
          </Card>
        </div>

        {/* Popular Tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-red-600" />
            Popular Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTools.map((tool) => (
              <Card key={tool.name} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-red-100 dark:border-red-900/20">
                <div className={`h-2 bg-gradient-to-r ${tool.gradient} rounded-t-lg`}></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">{tool.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
                    onClick={() => router.push(tool.href)}
                  >
                    Use Tool
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Tools Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All PDF Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allTools.map((tool) => (
              <Button
                key={tool.name}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 text-xs border-red-200 hover:border-red-400 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-600 dark:hover:bg-red-950/20 transition-all duration-300 group"
                onClick={() => router.push(tool.href)}
              >
                <tool.icon className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
                <span className="text-center leading-tight group-hover:text-red-700">{tool.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Processing History */}
        <div className="mb-8">
          <ProcessingHistory />
        </div>

        {/* Quick Tips Card */}
        <div className="mb-8">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
                <Settings className="h-5 w-5" />
                <span>Pro Tips for Better PDF Processing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">📄 Best Practices</h4>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li>• Use compress before sharing large PDFs</li>
                    <li>• Merge related documents for better organization</li>
                    <li>• Add watermarks to protect sensitive content</li>
                    <li>• Convert to Word for easy editing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">⚡ Quick Actions</h4>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li>• Drag & drop files for instant processing</li>
                    <li>• Use keyboard shortcuts for faster workflow</li>
                    <li>• Bookmark frequently used tools</li>
                    <li>• Check processing history for downloads</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
