'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  bucket?: string
  folder?: string
}

export function ImageUpload({
  value,
  onChange,
  label,
  error,
  hint,
  required,
  disabled,
  bucket = 'products',
  folder = 'products',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setUploading(true)
      setUploadError('')

      try {
        const supabase = createClient()

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setUploadError('File size must be less than 5MB')
          setUploading(false)
          return
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

        onChange(publicUrl)
      } catch (err) {
        console.error('Upload error:', err)
        setUploadError(
          err instanceof Error ? err.message : 'Failed to upload image'
        )
      } finally {
        setUploading(false)
      }
    },
    [onChange, bucket, folder]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    disabled: disabled || uploading,
  })

  const handleRemove = () => {
    onChange('')
    setUploadError('')
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {/* Preview Image */}
        {value && (
          <div className="relative inline-block">
            <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-gray-300">
              <img
                src={value}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Upload Area */}
        {!value && (
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
                      <p className="text-sm text-primary">Drop image here</p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Drag and drop an image, or click to select
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

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
