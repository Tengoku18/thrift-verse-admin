'use server'

import { createClient } from './server'

const BUCKET_NAME = 'products'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param folder - Optional folder path within the bucket
 * @returns Upload result with URL or error
 */
export async function uploadFile(
  file: File,
  folder?: string
): Promise<UploadResult> {
  try {
    console.log(`[Storage] Starting upload for file: ${file.name}, size: ${file.size} bytes`)
    const supabase = await createClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    console.log(`[Storage] Uploading to bucket: ${BUCKET_NAME}, path: ${filePath}`)

    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('[Storage] Upload error:', error)
      console.error('[Storage] Error details:', {
        message: error.message,
        statusCode: (error as any).statusCode,
        error: (error as any).error,
      })

      // Check for common errors
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return {
          success: false,
          error: `Bucket "${BUCKET_NAME}" does not exist. Please create it in Supabase Dashboard.`
        }
      }

      return { success: false, error: error.message }
    }

    console.log(`[Storage] Upload successful, getting public URL for: ${data.path}`)

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

    console.log(`[Storage] Public URL generated: ${publicUrl}`)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('[Storage] Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file'
    return { success: false, error: errorMessage }
  }
}

/**
 * Upload multiple files to Supabase Storage
 * @param files - Array of files to upload
 * @param folder - Optional folder path within the bucket
 * @returns Array of upload results
 */
export async function uploadFiles(
  files: File[],
  folder?: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadFile(file, folder))
  return Promise.all(uploadPromises)
}

/**
 * Delete a file from Supabase Storage
 * @param fileUrl - The full URL of the file to delete
 * @returns Success status
 */
export async function deleteFile(fileUrl: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Extract file path from URL
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split(`/${BUCKET_NAME}/`)
    if (pathParts.length < 2) {
      console.error('Invalid file URL')
      return false
    }

    const filePath = pathParts[1]

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Delete multiple files from Supabase Storage
 * @param fileUrls - Array of file URLs to delete
 * @returns Success status
 */
export async function deleteFiles(fileUrls: string[]): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Extract file paths from URLs
    const filePaths = fileUrls
      .map((fileUrl) => {
        try {
          const url = new URL(fileUrl)
          const pathParts = url.pathname.split(`/${BUCKET_NAME}/`)
          return pathParts.length >= 2 ? pathParts[1] : null
        } catch {
          return null
        }
      })
      .filter((path): path is string => path !== null)

    if (filePaths.length === 0) {
      return false
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove(filePaths)

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

