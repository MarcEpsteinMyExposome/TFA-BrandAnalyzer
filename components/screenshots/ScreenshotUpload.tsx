'use client'

import { useState, useRef, useCallback } from 'react'
import type { PlatformId } from '@/lib/platforms/types'
import type { UploadedImage } from '@/lib/schemas/platform.schema'
import { resizeImage } from '@/lib/images/resize'
import { toBase64 } from '@/lib/images/toBase64'
import ImagePreview from './ImagePreview'

interface ScreenshotUploadProps {
  platformId: PlatformId
  onUpload: (image: UploadedImage) => void
  existingImages: UploadedImage[]
  onRemove: (screenshotIndex: number) => void
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function ScreenshotUpload({
  platformId,
  onUpload,
  existingImages,
  onRemove,
}: ScreenshotUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)

      // Validate type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Please upload a PNG, JPEG, or WebP image.')
        return
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be under 10MB.')
        return
      }

      setIsProcessing(true)
      try {
        const resized = await resizeImage(file)
        const base64 = await toBase64(resized)

        const uploadedImage: UploadedImage = {
          data: base64,
          mimeType: file.type as UploadedImage['mimeType'],
          fileName: file.name,
          fileSize: resized.size,
        }

        onUpload(uploadedImage)
      } catch {
        setError('Failed to process image. Please try again.')
      } finally {
        setIsProcessing(false)
      }
    },
    [onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      for (const file of files) {
        processFile(file)
      }
    },
    [processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      for (const file of files) {
        processFile(file)
      }
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [processFile]
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div>
      {/* Show existing image previews as a grid */}
      {existingImages.length > 0 && (
        <div
          className="mb-3 flex flex-wrap gap-4"
          data-testid={`screenshot-preview-${platformId}`}
        >
          {existingImages.map((image, index) => (
            <ImagePreview
              key={`${image.fileName}-${index}`}
              src={image.data}
              fileName={image.fileName}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      )}

      {/* Show processing state */}
      {isProcessing && (
        <div className="mb-3 flex items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 p-8">
          <div className="text-center">
            <div
              className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
              role="status"
              aria-label="Processing image"
            />
            <p className="text-sm text-gray-500">Processing image...</p>
          </div>
        </div>
      )}

      {/* Upload dropzone - always visible so users can add more */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`cursor-pointer rounded border-2 border-dashed p-8 text-center transition-colors ${
          isDragOver
            ? 'border-gray-500 bg-gray-100'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
        }`}
        aria-label={`Upload screenshot for ${platformId}`}
      >
        <p className="text-sm font-medium text-gray-700">
          Drag &amp; drop {existingImages.length > 0 ? 'more screenshots' : 'a screenshot'} here
        </p>
        <p className="mt-1 text-xs text-gray-500">or click to browse</p>
        <p className="mt-2 text-xs text-gray-500">
          PNG, JPEG, or WebP (max 10MB)
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
        data-testid={`file-input-${platformId}`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
