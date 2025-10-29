'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface MultipleImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  label?: string
  error?: string
  hint?: string
  disabled?: boolean
  bucket?: string
  folder?: string
  maxImages?: number
}

export function MultipleImageUpload({
  value = [],
  onChange,
  label,
  error,
  hint,
  disabled,
  bucket = 'products',
  folder = 'products',
  maxImages = 5,
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      // Check if adding these files would exceed max
      if (value.length + acceptedFiles.length > maxImages) {
        setUploadError(`Maximum ${maxImages} images allowed`)
        return
      }

      setUploading(true)
      setUploadError('')

      try {
        const supabase = createClient()
        const uploadedUrls: string[] = []

        // Upload all files
        for (const file of acceptedFiles) {
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            setUploadError('Each file must be less than 5MB')
            continue
          }

          // Generate unique file name
          const fileExt = file.name.split('.').pop()
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
          const filePath = `${folder}/${fileName}`

          // Upload to Supabase Storage
          const { error: uploadError, data } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) {
            // Check for specific bucket error
            if (uploadError.message?.includes('Bucket not found')) {
              throw new Error(
                `Storage bucket not configured. Please check your "${bucket}" bucket in Supabase Dashboard.`
              )
            }
            throw uploadError
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(filePath)

          uploadedUrls.push(publicUrl)
        }

        // Add new URLs to existing ones
        onChange([...value, ...uploadedUrls])
      } catch (err) {
        console.error('Upload error:', err)
        setUploadError(
          err instanceof Error ? err.message : 'Failed to upload image'
        )
      } finally {
        setUploading(false)
      }
    },
    [onChange, bucket, folder, value, maxImages]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: maxImages - value.length,
    disabled: disabled || uploading || value.length >= maxImages,
    multiple: true,
  })

  const handleRemove = (indexToRemove: number) => {
    const newValue = value.filter((_, index) => index !== indexToRemove)
    onChange(newValue)
    setUploadError('')
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => (
            <div key={index} className="relative inline-block">
              <div className="relative h-32 w-full overflow-hidden rounded-lg border-2 border-gray-300">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area - Only show if under max limit */}
      {value.length < maxImages && (
        <div
          {...getRootProps()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors
            ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary'
            }
            ${disabled || uploading ? 'cursor-not-allowed opacity-50' : ''}
            ${error ? 'border-red-500' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                {isDragActive ? (
                  <>
                    <Upload className="h-10 w-10 text-primary" />
                    <p className="text-sm text-primary">Drop images here</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drag and drop images, or click to select
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB each
                    </p>
                    <p className="text-xs text-gray-500">
                      {value.length} of {maxImages} images uploaded
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Hint */}
      {hint && !error && !uploadError && (
        <p className="text-xs text-gray-600">{hint}</p>
      )}

      {/* Error Messages */}
      {(error || uploadError) && (
        <p className="text-xs text-red-600">{error || uploadError}</p>
      )}
    </div>
  )
}
