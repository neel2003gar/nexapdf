import { toast } from 'sonner'

// Custom toast messages with elegant text and appealing styling
export const showToast = {
  // Success messages
  success: {
    login: (username?: string) => toast.success(`🎉 Welcome back${username ? ` ${username}` : ''}!`, {
      description: 'Successfully signed in • You can now access all premium features',
      duration: 3000,
    }),
    signup: () => toast.success('🎊 Account created successfully!', {
      description: 'Welcome to NexaPDF - start processing PDFs now',
      duration: 3000,
    }),
    merge: (count: number) => toast.success(`✨ ${count} PDFs merged successfully!`, {
      description: 'Your combined PDF is ready for download',
    }),
    split: () => toast.success('🎯 PDF split completed!', {
      description: 'All pages have been separated successfully',
    }),
    compress: (ratio?: number) => toast.success(`🚀 PDF compressed successfully!${ratio ? ` (${ratio}% reduction)` : ''}`, {
      description: 'File size reduced while maintaining quality',
    }),
    convert: () => toast.success('🔄 Conversion completed!', {
      description: 'Your file has been converted successfully',
    }),
    extract: () => toast.success('📝 Text extracted successfully!', {
      description: 'All text content has been retrieved',
    }),
    watermark: () => toast.success('🏷️ Watermark added!', {
      description: 'Your PDF has been branded successfully',
    }),
    rotate: () => toast.success('🔄 Pages rotated!', {
      description: 'PDF orientation has been corrected',
    }),
    secure: () => toast.success('🔒 PDF secured!', {
      description: 'Password protection has been applied',
    }),
    unlock: () => toast.success('🔓 PDF unlocked!', {
      description: 'Password protection has been removed',
    }),
    download: () => toast.success('⬇️ Download started!', {
      description: 'Your processed file is being downloaded',
    }),
    
    // Custom success message function
    custom: (message: string) => toast.success(message),
  },

  // Error messages
  error: {
    // Authentication errors
    loginFailed: () => toast.error('❌ Login failed', {
      description: 'Please check your credentials and try again',
      duration: 4000,
    }),
    signupFailed: () => toast.error('❌ Account creation failed', {
      description: 'Please check your information and try again',
      duration: 4000,
    }),
    authRequired: () => toast.error('🔐 Authentication required', {
      description: 'Please sign in to access this feature',
      duration: 3000,
    }),
    
    // File validation errors
    noFiles: () => toast.error('📄 No file selected', {
      description: 'Please select a PDF file to continue',
    }),
    multipleFiles: () => toast.error('📁 Too many files', {
      description: 'Please select only one PDF file',
    }),
    minFiles: (min: number) => toast.error('📚 More files needed', {
      description: `Please select at least ${min} PDF files`,
    }),
    invalidFile: () => toast.error('🚫 Invalid file format', {
      description: 'Please upload a valid PDF file',
    }),
    fileTooLarge: () => toast.error('📦 File too large', {
      description: 'Maximum file size is 50MB',
    }),
    
    // Input validation errors
    noPassword: () => toast.error('Enter password'),
    passwordTooShort: () => toast.error('Password too short'),
    passwordMismatch: () => toast.error('Passwords don\'t match'),
    noText: () => toast.error('Enter watermark text'),
    noImage: () => toast.error('Select an image'),
    noPages: () => toast.error('Specify pages'),
    
    // Processing errors
    processingFailed: (operation: string) => toast.error(`${operation} failed`),
    networkError: () => toast.error('Connection failed'),
    serverError: () => toast.error('Server error'),
    
    // Specific errors
    wrongPassword: () => toast.error('Wrong password'),
    alreadyProtected: () => toast.error('Already protected'),
    notProtected: () => toast.error('Not password protected'),
    
    // Custom error message function
    custom: (message: string) => toast.error(message),
  },

  // Info messages
  info: {
    processing: (operation: string) => toast.loading(`⚡ Processing ${operation}...`, {
      description: 'Please wait while we process your file',
    }),
    uploading: () => toast.loading('📤 Uploading your file...', {
      description: 'File upload in progress',
    }),
    downloading: () => toast.loading('📦 Preparing your download...', {
      description: 'Getting your processed file ready',
    }),
    
    // Custom info message function
    custom: (message: string, description?: string) => toast(message, {
      description,
      duration: 3000,
    }),
  },

  // Warning messages
  warning: {
    dailyLimit: () => toast('⚠️ Daily limit reached', {
      description: 'Sign up for unlimited operations or try again tomorrow',
      duration: 5000,
    }),
    largeFile: () => toast('⏳ Large file detected', {
      description: 'Processing may take a bit longer than usual',
      duration: 4000,
    }),
    unsavedChanges: () => toast('⚠️ Unsaved changes', {
      description: 'Your changes will be lost if you continue',
      duration: 4000,
    }),
    
    // Custom warning message function
    custom: (message: string, description?: string) => toast(message, {
      description,
      duration: 4000,
    }),
  }
}

// Utility for custom toasts with consistent styling
export const customToast = {
  success: (message: string, emoji?: string) => 
    toast.success(`${message} ${emoji || '✅'}`),
  
  error: (message: string, emoji?: string) => 
    toast.error(`${message} ${emoji || '❌'}`),
    
  info: (message: string, emoji?: string) => 
    toast(`${message} ${emoji || 'ℹ️'}`),
    
  loading: (message: string) => 
    toast.loading(message),
    
  // For results with statistics
  result: (operation: string, stats?: { saved?: string, time?: string, count?: number }) => {
    let message = `${operation} complete!`
    if (stats?.saved) message += ` Saved ${stats.saved}`
    if (stats?.count) message += ` ${stats.count} files`
    toast.success(`${message} ✅`)
  }
}