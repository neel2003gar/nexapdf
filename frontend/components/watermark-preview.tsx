'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { RotateCcw, Move, Type, Palette } from 'lucide-react'

interface WatermarkPreviewProps {
  watermarkText: string
  onWatermarkTextChange: (text: string) => void
  position: string
  onPositionChange: (position: string) => void
  opacity: number
  onOpacityChange: (opacity: number) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  color: string
  onColorChange: (color: string) => void
  rotation: number
  onRotationChange: (rotation: number) => void
  xOffset: number
  onXOffsetChange: (offset: number) => void
  yOffset: number
  onYOffsetChange: (offset: number) => void
}

export function WatermarkPreview({
  watermarkText,
  onWatermarkTextChange,
  position,
  onPositionChange,
  opacity,
  onOpacityChange,
  fontSize,
  onFontSizeChange,
  color,
  onColorChange,
  rotation,
  onRotationChange,
  xOffset,
  onXOffsetChange,
  yOffset,
  onYOffsetChange
}: WatermarkPreviewProps) {
  const [isDragging, setIsDragging] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const colorOptions = [
    { value: 'red', label: 'Red', color: '#ef4444' },
    { value: 'blue', label: 'Blue', color: '#3b82f6' },
    { value: 'green', label: 'Green', color: '#10b981' },
    { value: 'black', label: 'Black', color: '#000000' },
    { value: 'gray', label: 'Gray', color: '#6b7280' },
    { value: 'white', label: 'White', color: '#ffffff' },
    { value: 'yellow', label: 'Yellow', color: '#eab308' },
    { value: 'orange', label: 'Orange', color: '#f97316' },
    { value: 'purple', label: 'Purple', color: '#8b5cf6' },
  ]

  const positionOptions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'middle-left', label: 'Middle Left' },
    { value: 'center', label: 'Center' },
    { value: 'middle-right', label: 'Middle Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ]

  // Calculate watermark position for preview
  const getPreviewPosition = () => {
    const baseX = position.includes('left') ? 20 : 
                  position.includes('right') ? 'calc(100% - 20px)' : '50%'
    const baseY = position.includes('top') ? 20 : 
                  position.includes('bottom') ? 'calc(100% - 20px)' : '50%'
    
    return {
      left: typeof baseX === 'string' ? baseX : `${baseX + xOffset}px`,
      top: typeof baseY === 'string' ? baseY : `${baseY + yOffset}px`,
      transform: `translate(${typeof baseX === 'string' ? '-50%' : '0'}, ${typeof baseY === 'string' ? '-50%' : '0'}) rotate(${rotation}deg)`,
    }
  }

  const selectedColor = colorOptions.find(c => c.value === color)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !previewRef.current) return

    const rect = previewRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    onXOffsetChange(Math.round(x))
    onYOffsetChange(Math.round(y))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp)
      return () => document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div className="space-y-6">
      {/* Preview Area */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-2 block">Preview</Label>
        <div 
          ref={previewRef}
          className="relative w-full h-64 bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-move"
          onMouseMove={handleMouseMove}
        >
          {/* Mock PDF content */}
          <div className="absolute inset-4 space-y-2">
            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            <div className="h-2 bg-gray-200 rounded w-3/5"></div>
          </div>
          
          {/* Watermark Preview */}
          {watermarkText && (
            <div
              className="absolute select-none pointer-events-none"
              style={{
                ...getPreviewPosition(),
                fontSize: `${Math.max(fontSize / 3, 12)}px`,
                color: selectedColor?.color || '#6b7280',
                opacity: opacity,
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap'
              }}
              onMouseDown={handleMouseDown}
            >
              {watermarkText}
            </div>
          )}
          
          {/* Drag hint */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 flex items-center gap-1">
            <Move className="w-3 h-3" />
            Drag to position
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Text Content */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="watermark-text" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Watermark Text
            </Label>
            <Input
              id="watermark-text"
              value={watermarkText}
              onChange={(e) => onWatermarkTextChange(e.target.value)}
              placeholder="Enter watermark text"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color
            </Label>
            <RadioGroup value={color} onValueChange={onColorChange} className="grid grid-cols-3 gap-2 mt-2">
              {colorOptions.map((colorOption) => (
                <div key={colorOption.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={colorOption.value} id={colorOption.value} />
                  <Label 
                    htmlFor={colorOption.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div 
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: colorOption.color }}
                    />
                    <span className="text-sm">{colorOption.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Position and Style */}
        <div className="space-y-4">
          <div>
            <Label>Position</Label>
            <select 
              value={position} 
              onChange={(e) => onPositionChange(e.target.value)}
              className="mt-1 w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {positionOptions.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Font Size: {fontSize}px</Label>
            <input
              type="range"
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              min={12}
              max={120}
              step={4}
              className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <Label>Opacity: {Math.round(opacity * 100)}%</Label>
            <input
              type="range"
              value={opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              min={0.1}
              max={1}
              step={0.1}
              className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Rotation: {rotation}°
            </Label>
            <input
              type="range"
              value={rotation}
              onChange={(e) => onRotationChange(Number(e.target.value))}
              min={-180}
              max={180}
              step={15}
              className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Fine Position Controls */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">Fine Position Adjustment</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">X Offset: {xOffset}px</Label>
            <input
              type="range"
              value={xOffset}
              onChange={(e) => onXOffsetChange(Number(e.target.value))}
              min={-100}
              max={100}
              step={5}
              className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <Label className="text-sm">Y Offset: {yOffset}px</Label>
            <input
              type="range"
              value={yOffset}
              onChange={(e) => onYOffsetChange(Number(e.target.value))}
              min={-100}
              max={100}
              step={5}
              className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onXOffsetChange(0)
            onYOffsetChange(0)
          }}
          className="mt-3"
        >
          Reset Position
        </Button>
      </Card>
    </div>
  )
}