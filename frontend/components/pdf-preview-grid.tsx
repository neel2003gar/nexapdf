'use client'

import { useState, useRef, useEffect } from 'react'
import { FileText, GripVertical, X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface PDFPreviewItem {
  file: File
  id: string
  thumbnail?: string
  previewPages?: string[]
  showFirstPageOnly?: boolean
}

interface PDFPreviewGridProps {
  files: File[]
  onFilesReorder: (files: File[]) => void
  onFileRemove: (index: number) => void
  className?: string
}

const generatePlaceholderThumbnail = (file: File): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 150
  canvas.height = 200
  
  if (ctx) {
    // Create a placeholder thumbnail
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Header bar
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(0, 0, canvas.width, 30)
    
    // PDF text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('PDF', canvas.width / 2, 20)
    
    // File name
    ctx.fillStyle = '#374151'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    const fileName = file.name.length > 18 ? file.name.substring(0, 18) + '...' : file.name
    ctx.fillText(fileName, canvas.width / 2, canvas.height - 15)
    
    // File size
    ctx.fillStyle = '#6b7280'
    ctx.font = '9px Arial'
    const sizeText = `${(file.size / 1024 / 1024).toFixed(1)} MB`
    ctx.fillText(sizeText, canvas.width / 2, canvas.height - 5)
    
    // Simulate document lines
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 1
    for (let i = 45; i < canvas.height - 35; i += 12) {
      ctx.beginPath()
      ctx.moveTo(15, i)
      ctx.lineTo(canvas.width - 15, i)
      ctx.stroke()
    }
    
    // Add border
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
  }
  
  return canvas.toDataURL('image/jpeg', 0.8)
}

export function PDFPreviewGrid({ files, onFilesReorder, onFileRemove, className = '' }: PDFPreviewGridProps) {
  const [previewItems, setPreviewItems] = useState<PDFPreviewItem[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showPreviews, setShowPreviews] = useState(true)
  const [loadingThumbnails, setLoadingThumbnails] = useState<Set<string>>(new Set())



  // Update preview items when files change
  useEffect(() => {
    const updatePreviews = async () => {
      const items: PDFPreviewItem[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const id = `${file.name}-${file.size}-${i}`
        
        items.push({
          file,
          id,
          thumbnail: undefined
        })
      }
      
      setPreviewItems(items)
      
      // Generate previews using backend API (only in browser)
      if (showPreviews && typeof window !== 'undefined') {
        items.forEach(async (item, index) => {
          if (!loadingThumbnails.has(item.id)) {
            setLoadingThumbnails(prev => new Set(Array.from(prev).concat(item.id)))
            
            try {
              // Use backend preview API for real PDF rendering
              const formData = new FormData()
              formData.append('pdf', item.file)
              
              const response = await axios.post(`${API_URL}/pdf/preview/`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
                responseType: 'json'
              })
              
              if (response.data.pages && response.data.pages.length > 0) {
                // Use the first page as thumbnail, store all pages for later use
                setPreviewItems(prevItems => 
                  prevItems.map(prevItem => 
                    prevItem.id === item.id 
                      ? { 
                          ...prevItem, 
                          thumbnail: response.data.pages[0], // First page as thumbnail
                          previewPages: response.data.pages,
                          showFirstPageOnly: true
                        }
                      : prevItem
                  )
                )
              } else {
                // Fall back to placeholder if no pages returned
                setPreviewItems(prevItems => 
                  prevItems.map(prevItem => 
                    prevItem.id === item.id 
                      ? { ...prevItem, thumbnail: generatePlaceholderThumbnail(item.file) }
                      : prevItem
                  )
                )
              }
            } catch (error) {
              console.error('Failed to generate preview:', error)
              // Fall back to placeholder on error
              if (typeof window !== 'undefined') {
                setPreviewItems(prevItems => 
                  prevItems.map(prevItem => 
                    prevItem.id === item.id 
                      ? { ...prevItem, thumbnail: generatePlaceholderThumbnail(item.file) }
                      : prevItem
                  )
                )
              }
            } finally {
              setLoadingThumbnails(prev => {
                const newArray = Array.from(prev).filter(id => id !== item.id)
                return new Set(newArray)
              })
            }
          }
        })
      }
    }

    updatePreviews()
  }, [files, showPreviews])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newFiles = [...files]
    const draggedFile = newFiles[draggedIndex]
    
    // Remove dragged file from its original position
    newFiles.splice(draggedIndex, 1)
    
    // Insert at new position
    newFiles.splice(dropIndex, 0, draggedFile)
    
    onFilesReorder(newFiles)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          PDF Files ({files.length}) - {showPreviews ? 'Preview Mode' : 'List Mode'}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreviews(!showPreviews)}
            className="flex items-center gap-2"
          >
            {showPreviews ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreviews ? 'List View' : 'Preview'}
          </Button>
        </div>
      </div>

      {showPreviews ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewItems.map((item, index) => (
            <Card
              key={item.id}
              className={`p-3 cursor-move transition-all duration-200 ${
                draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-2">
                {/* Drag Handle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <span className="text-xs font-medium">#{index + 1}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileRemove(index)
                    }}
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Thumbnail */}
                <div className="aspect-[3/4] bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border shadow-sm relative">
                  {item.thumbnail ? (
                    <>
                      <img
                        src={item.thumbnail}
                        alt={`Preview of ${item.file.name}`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                      {item.previewPages && item.previewPages.length > 1 && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {item.previewPages.length}
                        </div>
                      )}
                    </>
                  ) : loadingThumbnails.has(item.id) ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent"></div>
                      <span className="text-xs text-muted-foreground">Loading preview...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-red-500" />
                      <span className="text-xs text-muted-foreground">PDF File</span>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {item.previewPages && (
                      <p className="text-xs text-red-600 font-medium">
                        {item.previewPages.length} pages
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {previewItems.map((item, index) => (
            <Card
              key={item.id}
              className={`p-3 cursor-move transition-all duration-200 ${
                draggedIndex === index ? 'opacity-50 scale-98' : 'hover:shadow-sm'
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <span className="text-sm font-medium">#{index + 1}</span>
                  </div>
                  <FileText className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">{item.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFileRemove(index)
                  }}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
        <p className="text-sm text-red-700 dark:text-red-300">
          <strong>💡 Tip:</strong> Drag and drop the cards above to reorder your PDFs before merging. The order here determines the final merge order.
        </p>
      </div>
    </div>
  )
}