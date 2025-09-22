'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, GripVertical, Move, RotateCw, RotateCcw } from 'lucide-react'

interface ImagePreviewGridProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  onRemoveFile: (index: number) => void
  onRotationsChange?: (rotations: number[]) => void
}

interface ImageWithMetadata {
  file: File
  preview: string
  rotation: number
  index: number
}

export function ImagePreviewGrid({ files, onFilesChange, onRemoveFile, onRotationsChange }: ImagePreviewGridProps) {
  const [images, setImages] = useState<ImageWithMetadata[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)

  // Generate previews when files change
  useEffect(() => {
    const newImages: ImageWithMetadata[] = []
    
    files.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file)
        newImages.push({
          file,
          preview,
          rotation: 0,
          index
        })
      }
    })
    
    setImages(newImages)
    
    // Notify parent about initial rotations (all 0)
    if (onRotationsChange) {
      const rotations = newImages.map(() => 0)
      onRotationsChange(rotations)
    }
    
    // Cleanup function for URLs
    return () => {
      newImages.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [files])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    dragCounter.current = 0
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    // Reorder files
    const newFiles = [...files]
    const [draggedFile] = newFiles.splice(draggedIndex, 1)
    newFiles.splice(dropIndex, 0, draggedFile)
    
    onFilesChange(newFiles)
    setDraggedIndex(null)
  }

  const rotateImage = (index: number, direction: 'cw' | 'ccw') => {
    setImages(prevImages => {
      const newImages = prevImages.map((img, i) => 
        i === index 
          ? { ...img, rotation: img.rotation + (direction === 'cw' ? 90 : -90) }
          : img
      )
      
      // Notify parent about rotation changes
      if (onRotationsChange) {
        const rotations = newImages.map(img => img.rotation)
        onRotationsChange(rotations)
      }
      
      return newImages
    })
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    
    const newFiles = [...files]
    const [movedFile] = newFiles.splice(fromIndex, 1)
    newFiles.splice(toIndex, 0, movedFile)
    
    onFilesChange(newFiles)
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Preview & Arrange Pages</h3>
        <p className="text-sm text-muted-foreground">Drag and drop to reorder • Click to rotate</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <Card 
            key={`${image.file.name}-${index}`}
            className={`relative p-2 cursor-move hover:shadow-lg transition-shadow ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            {/* Page number */}
            <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded z-10">
              {index + 1}
            </div>
            
            {/* Remove button */}
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1 h-6 w-6 p-0 z-10"
              onClick={() => onRemoveFile(index)}
            >
              <X className="h-3 w-3" />
            </Button>

            {/* Drag handle */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-muted p-1 rounded cursor-grab active:cursor-grabbing z-10">
              <GripVertical className="h-3 w-3" />
            </div>

            {/* Image preview */}
            <div className="aspect-[3/4] bg-muted rounded overflow-hidden mb-2">
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-contain"
                style={{
                  transform: `rotate(${image.rotation}deg)`,
                  transition: 'transform 0.2s ease'
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => rotateImage(index, 'ccw')}
                  title="Rotate Left"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => rotateImage(index, 'cw')}
                  title="Rotate Right"
                >
                  <RotateCw className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => moveImage(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  title="Move Up"
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => moveImage(index, Math.min(files.length - 1, index + 1))}
                  disabled={index === files.length - 1}
                  title="Move Down"
                >
                  ↓
                </Button>
              </div>
            </div>

            {/* File info */}
            <div className="text-xs text-muted-foreground mt-1 truncate" title={image.file.name}>
              {image.file.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {(image.file.size / 1024).toFixed(1)} KB
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-muted-foreground">
        {files.length} image{files.length !== 1 ? 's' : ''} • 
        Total size: {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB
      </div>
    </div>
  )
}