import axios from 'axios'
import Cookies from 'js-cookie'

// Production API URL - Now configured without .env.local override
const API_URL = 'https://nexapdf-backend.onrender.com/api'

// Debug: Log the API URL 
console.log('🔗 API_URL configured as:', API_URL)

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for cross-origin requests
})

// Test API connection on initialization
if (typeof window !== 'undefined') {
  api.get('/pdf/health/')
    .then(() => console.log('✅ Backend connection successful'))
    .catch((error) => console.error('❌ Backend connection failed:', error.message))
}

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// PDF processing API calls
export const pdfAPI = {
  // Merge PDFs
  merge: (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post('/pdf/merge/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    })
  },

  // Split PDF
  split: (file: File, splitType: string, splitValue?: string, onUploadProgress?: (progressEvent: any) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('split_type', splitType)
    
    if (splitValue) {
      formData.append('split_value', splitValue)
    }
    
    return api.post('/pdf/split/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      onUploadProgress
    })
  },

  // Compress PDF
  compress: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/pdf/compress/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    })
  },

  // Convert PDF to images
  pdfToImages: (file: File, format: 'jpg' | 'png' = 'jpg', dpi: number = 150) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', format)
    formData.append('dpi', dpi.toString())
    return api.post('/pdf/convert/pdf-to-img/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    })
  },

  // Convert images to PDF
  imagesToPdf: (files: File[], rotations?: number[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    if (rotations) {
      formData.append('rotations', JSON.stringify(rotations))
    }
    return api.post('/pdf/convert/img-to-pdf/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    })
  },

  // Extract text from PDF
  extractText: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/pdf/extract-text/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Add watermark
  addWatermark: (file: File, watermark: string, type: 'text' | 'image' = 'text') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('watermark', watermark)
    formData.append('type', type)
    return api.post('/pdf/watermark/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    })
  },

  // Rotate pages
  rotate: (file: File, pages: string, angle: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('pages', pages)
    formData.append('angle', angle.toString())
    return api.post('/pdf/rotate/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    })
  },

  // Secure PDF with password
  secure: (file: File, password: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_password', password)
    return api.post('/pdf/secure/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    })
  },

  // Remove password from PDF
  unlock: (file: File, password: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)
    return api.post('/pdf/unlock/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    })
  }
}

// Auth API calls
export const authAPI = {
  // Sign up
  signup: (userData: any) => {
    return api.post('/auth/signup/', userData)
  },

  // Login
  login: (username: string, password: string) => {
    return api.post('/auth/login/', { username, password })
  },

  // Logout
  logout: (refreshToken: string) => {
    return api.post('/auth/logout/', { refresh_token: refreshToken })
  },

  // Get user profile
  getProfile: () => {
    return api.get('/auth/me/')
  },

  // Reset password
  resetPassword: (email: string) => {
    return api.post('/auth/reset-password/', { email })
  }
}

export default api