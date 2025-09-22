'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileDropzone } from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProcessingResult } from '@/components/processing-result'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import axios from 'axios'
import { showToast } from '@/lib/toast'
import { useNotifyOperation } from '@/lib/usage-context'
import { useRouter } from 'next/navigation'
import { handleDownloadWithUsageTracking } from '@/lib/download-utils'
import { 
  Download, 
  Settings, 
  Shuffle,
  Bookmark,
  Trash2,
  Copy,
  Eye,
  Move,
  RotateCw,
  X
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexapdf-backend.onrender.com/api'

interface PDFPage {
  id: string
  pageNumber: number
  imageUrl: string
  selected: boolean
}

export default function OrganizePDFPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [processingStats, setProcessingStats] = useState<any>(null)
  const [operation, setOperation] = useState('manual')
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const notifyOperation = useNotifyOperation()
  const router = useRouter()

  const operations = [
    {
      id: 'manual',
      name: 'Manual Reorder',
      description: 'Preview and drag pages to reorder manually',
      icon: Move
    },
    {
      id: 'auto',
      name: 'Auto Organize',
      description: 'Automatically organize pages by content type',
      icon: Shuffle
    },
    {
      id: 'bookmark',
      name: 'By Bookmarks',
      description: 'Organize based on PDF bookmarks/outline',
      icon: Bookmark
    },
    {
      id: 'blank_remove',
      name: 'Remove Blank Pages',
      description: 'Remove empty or nearly empty pages',
      icon: Trash2
    },
    {
      id: 'duplicate_remove',
      name: 'Remove Duplicates',
      description: 'Remove duplicate pages based on content',
      icon: Copy
    }
  ]

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
    setDownloadUrl(null)
    setProcessingStats(null)
    setPdfPages([])
    setShowPreview(false)
    
    // If manual reorder is selected and a file is uploaded, generate preview
    if (newFiles.length > 0 && operation === 'manual') {
      generatePreview(newFiles[0])
    }
  }

  const generatePreview = async (file: File) => {
    setLoadingPreview(true)
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      
      const response = await axios.post(`${API_URL}/pdf/preview/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        responseType: 'json'
      })
      
      if (response.data.pages) {
        const pages: PDFPage[] = response.data.pages.map((pageUrl: string, index: number) => ({
          id: `page-${index}`,
          pageNumber: index + 1,
          imageUrl: pageUrl,
          selected: true
        }))
        
        setPdfPages(pages)
        setShowPreview(true)
      }
    } catch (error) {
      console.error('Preview generation failed:', error)
      showToast.error.processingFailed('Preview generation')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(pdfPages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setPdfPages(items)
  }

  const togglePageSelection = (pageId: string) => {
    setPdfPages(pages => 
      pages.map(page => 
        page.id === pageId 
          ? { ...page, selected: !page.selected }
          : page
      )
    )
  }

  const handleOperationChange = (value: string) => {
    setOperation(value)
    
    // If switching to manual and we have a file, generate preview
    if (value === 'manual' && files.length > 0) {
      generatePreview(files[0])
    } else if (value !== 'manual') {
      setShowPreview(false)
      setPdfPages([])
    }
  }

  const handleOrganize = async () => {
    if (files.length !== 1) {
      showToast.error.noFiles()
      return
    }

    setUploading(true)
    setProgress(0)
    const startTime = Date.now()

    try {
      const formData = new FormData()
      formData.append('pdf', files[0])
      formData.append('operation', operation)

      // For manual reordering, include page order and selection
      if (operation === 'manual' && pdfPages.length > 0) {
        const selectedPages = pdfPages
          .filter(page => page.selected)
          .map(page => page.pageNumber - 1) // Convert to 0-based index
        
        formData.append('page_order', JSON.stringify(selectedPages))
      }

      const response = await axios.post(`${API_URL}/pdf/organize/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setProgress(progress)
        },
        responseType: 'blob'
      })

      const endTime = Date.now()
      const processingTime = (endTime - startTime) / 1000

      // Create download URL
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      
      // Set processing statistics
      setProcessingStats({
        originalSize: files[0].size,
        processedSize: blob.size,
        processingTime,
        fileCount: 1,
        operationType: 'PDF Organization'
      })
      
      showToast.success.convert()
      
      // Notify about completed operation
      notifyOperation('organize-pdf', true)
    } catch (error: any) {
      console.error('Organize error:', error)
      if (error.response?.status === 401) {
        showToast.error.authRequired()
      } else {
        showToast.error.processingFailed('PDF organization')
      }
      
      // Notify about failed operation
      notifyOperation('organize-pdf', false)  
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const filename = `organized_${files[0]?.name}` || 'organized.pdf'
      
      handleDownloadWithUsageTracking(
        downloadUrl,
        filename,
        'organize-pdf',
        router,
        notifyOperation
      )
      
      window.URL.revokeObjectURL(downloadUrl)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Settings className="mx-auto h-16 w-16 text-purple-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Organize PDF</h1>
            <p className="text-muted-foreground text-lg">
              Reorganize, clean, and optimize your PDF documents
            </p>
          </div>

          <div className="space-y-8">
            <FileDropzone
              onFilesChange={handleFilesChange}
              accept={{ 'application/pdf': ['.pdf'] }}
              multiple={false}
              maxFiles={1}
              className="border-2 border-dashed border-purple-300 hover:border-purple-400"
            />

            {files.length > 0 && (
              <div className="space-y-6">
                {/* Organization Options */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Organization Options</h3>
                  <RadioGroup value={operation} onValueChange={handleOperationChange}>
                    {operations.map((op) => {
                      const Icon = op.icon
                      return (
                        <div key={op.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                          <RadioGroupItem value={op.id} id={op.id} />
                          <Icon className="h-5 w-5 text-purple-500" />
                          <div className="flex-1">
                            <Label htmlFor={op.id} className="font-medium cursor-pointer">
                              {op.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {op.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </div>

                {/* PDF Preview for Manual Reordering */}
                {operation === 'manual' && (
                  <div className="space-y-4">
                    {loadingPreview && (
                      <div className="text-center p-8">
                        <div className="animate-spin h-8 w-8 border-b-2 border-purple-500 rounded-full mx-auto mb-4"></div>
                        <p>Generating preview...</p>
                      </div>
                    )}
                    
                    {showPreview && pdfPages.length > 0 && (
                      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold flex items-center">
                            <Eye className="h-5 w-5 mr-2 text-purple-500" />
                            PDF Pages Preview
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            Drag pages to reorder • Click to select/deselect
                          </div>
                        </div>

                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="pdf-pages" direction="horizontal">
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="flex flex-wrap gap-4 min-h-[200px] p-4 border-2 border-dashed border-purple-200 rounded-lg"
                              >
                                {pdfPages.map((page, index) => (
                                  <Draggable key={page.id} draggableId={page.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`relative group cursor-pointer transform transition-all duration-200 ${
                                          snapshot.isDragging ? 'scale-105 rotate-2' : ''
                                        }`}
                                      >
                                        <Card className={`w-32 h-40 overflow-hidden ${
                                          page.selected 
                                            ? 'ring-2 ring-purple-500 bg-purple-50' 
                                            : 'bg-gray-100 opacity-60'
                                        }`}>
                                          <CardContent className="p-2 relative">
                                            <div className="absolute top-1 left-1 bg-white rounded px-1 text-xs font-medium">
                                              {page.pageNumber}
                                            </div>
                                            
                                            <div 
                                              className="absolute top-1 right-1 cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                togglePageSelection(page.id)
                                              }}
                                            >
                                              {page.selected ? (
                                                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                              ) : (
                                                <X className="w-4 h-4 text-red-500 bg-white rounded-full p-0.5" />
                                              )}
                                            </div>
                                            
                                            <img
                                              src={page.imageUrl}
                                              alt={`Page ${page.pageNumber}`}
                                              className="w-full h-32 object-contain"
                                              onClick={() => togglePageSelection(page.id)}
                                            />
                                          </CardContent>
                                        </Card>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>

                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            Selected: {pdfPages.filter(p => p.selected).length} of {pdfPages.length} pages
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPdfPages(pages => pages.map(p => ({ ...p, selected: true })))}
                            >
                              Select All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPdfPages(pages => pages.map(p => ({ ...p, selected: false })))}
                            >
                              Deselect All
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* File Info and Convert Button */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="font-medium">{files[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(files[0].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleOrganize}
                    disabled={uploading}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    {uploading ? (
                      <>
                        <Download className="mr-2 h-4 w-4 animate-spin" />
                        Organizing...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Organize PDF
                      </>
                    )}
                  </Button>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Organizing PDF...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <ProcessingResult
                  downloadUrl={downloadUrl}
                  onDownload={handleDownload}
                  stats={processingStats}
                  filename={`organized_${files[0]?.name}` || 'organized.pdf'}
                />
              </div>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
                  What is PDF Organization?
                </h3>
                <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                  <li>• Content-based page sorting and grouping</li>
                  <li>• Removes blank and duplicate pages</li>
                  <li>• Uses bookmarks for smart reordering</li>
                  <li>• Optimizes document structure and flow</li>
                </ul>
              </div>
              
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                  Tips
                </h3>
                <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                  <li>• Auto organize works best for mixed content PDFs</li>
                  <li>• Bookmark organization requires existing bookmarks</li>
                  <li>• Blank page removal is great for scanned documents</li>
                  <li>• Always keep a backup of important documents</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}