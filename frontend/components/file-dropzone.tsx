'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Upload, X } from 'lucide-react'

interface FileDropzoneProps {
  onFilesChange: (files: File[]) => void
  accept?: Record<string, string[]>
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  className?: string
}

export function FileDropzone({
  onFilesChange,
  accept = { 'application/pdf': ['.pdf'] },
  multiple = true,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  className
}: FileDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange(acceptedFiles)
  }, [onFilesChange])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    maxSize
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:scale-[1.02]',
          isDragActive && !isDragReject && 'border-red-500 bg-red-50 dark:bg-red-950/20 shadow-lg shadow-red-500/20',
          isDragReject && 'border-red-400 bg-red-50 dark:bg-red-950/20',
          !isDragActive && 'border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/10',
          className
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Upload className="h-8 w-8 text-white" />
          </div>
          
          {isDragActive ? (
            <div>
              {isDragReject ? (
                <p className="text-red-600 font-medium">
                  Some files are not supported
                </p>
              ) : (
                <p className="text-red-600 font-medium text-lg">
                  Drop files here...
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {multiple ? `Upload up to ${maxFiles} files` : 'Upload a file'} 
                {' '}(max {formatFileSize(maxSize)} each)
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                Supported formats: {Object.values(accept).flat().join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-destructive">
            Some files were rejected:
          </h4>
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="text-sm text-destructive">
              <span className="font-medium">{file.name}</span>
              <ul className="list-disc list-inside ml-4">
                {errors.map((error) => (
                  <li key={error.code}>{error.message}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}