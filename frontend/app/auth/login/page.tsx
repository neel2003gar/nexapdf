'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { showToast } from '@/lib/toast'
import { FileText, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(username, password)
      showToast.success.login(username)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Show specific error messages based on backend response
        if (errorData.non_field_errors) {
          showToast.error.custom(errorData.non_field_errors[0])
        } else if (errorData.username) {
          showToast.error.custom(errorData.username[0])
        } else if (errorData.password) {
          showToast.error.custom(errorData.password[0])
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
        showToast.error.loginFailed()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <Image
                src="/logo.svg"
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
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full group" disabled={loading} size="lg">
              <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-red-600 hover:text-red-700 hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}