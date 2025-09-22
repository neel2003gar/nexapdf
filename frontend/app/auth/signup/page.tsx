'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/auth-provider'
import { showToast } from '@/lib/toast'
import { UserPlus, FileText, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Client-side password validation
    if (formData.password !== formData.password_confirm) {
      showToast.error.passwordMismatch()
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      showToast.error.passwordTooShort()
      setLoading(false)
      return
    }

    try {
      await signup(formData)
      showToast.success.signup()
      router.push('/dashboard') // Redirect to dashboard after signup
    } catch (error: any) {
      console.error('Signup error:', error)
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Show specific error messages based on backend response
        if (errorData.username) {
          if (errorData.username[0].includes('already exists')) {
            showToast.error.custom('Username already taken - try a different one')
            // Automatically generate a unique username suggestion
            setTimeout(() => {
              generateUniqueUsername()
            }, 1500)
          } else {
            showToast.error.custom(errorData.username[0])
          }
        } else if (errorData.email) {
          if (errorData.email[0].includes('already exists') || errorData.email[0].includes('already registered')) {
            showToast.error.custom('Email already registered')
          } else {
            showToast.error.custom(errorData.email[0])
          }
        } else if (errorData.password) {
          showToast.error.custom(errorData.password[0])
        } else if (errorData.non_field_errors) {
          showToast.error.custom(errorData.non_field_errors[0])
        } else {
          // If there are multiple errors, show the first one
          const firstErrorKey = Object.keys(errorData)[0]
          const firstError = errorData[firstErrorKey]
          if (Array.isArray(firstError)) {
            showToast.error.custom(firstError[0])
          } else {
            showToast.error.custom(firstError)
          }
        }
      } else if (error.message) {
        showToast.error.custom(error.message)
      } else {
        showToast.error.signupFailed()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const generateUniqueUsername = () => {
    const timestamp = Date.now()
    const randomNum = Math.floor(Math.random() * 1000)
    const baseUsername = formData.username || 'user'
    const cleanBase = baseUsername.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)
    const newUsername = `${cleanBase}_${randomNum}`
    
    setFormData(prev => ({
      ...prev,
      username: newUsername
    }))
    
    showToast.info.custom('Generated unique username')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <Image
                    src="/nexapdf/logo.svg"
                    alt="NexaPDF"
                    width={32}
                    height={32}
                    className="h-8 w-8 brightness-0 invert"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png'
                      e.currentTarget.onerror = () => {
                        e.currentTarget.style.display = 'none'
                        const icon = e.currentTarget.parentElement?.querySelector('.fallback-icon')
                        if (icon) icon.classList.remove('hidden')
                      }
                    }}
                  />
                  <FileText className="h-8 w-8 text-white fallback-icon hidden" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">NexaPDF</span>
              </div>
              <CardTitle className="text-2xl">Join NexaPDF</CardTitle>
              <CardDescription>
                Sign up for a free account to start processing PDFs
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateUniqueUsername}
                      disabled={loading}
                      className="px-3 text-xs"
                    >
                      🎲
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click the dice button for a unique username suggestion
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="First name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="password_confirm"
                      name="password_confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.password_confirm}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full group"
                  size="lg"
                  disabled={loading}
                >
                  <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-red-600 hover:text-red-700 hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}