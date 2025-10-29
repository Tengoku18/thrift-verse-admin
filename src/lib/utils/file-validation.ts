/**
 * Client-side file validation utilities
 * These functions work with File objects in the browser
 */

/**
 * Get file size in MB
 * @param file - The file to check
 * @returns File size in MB
 */
export function getFileSizeInMB(file: File): number {
  return file.size / (1024 * 1024)
}

/**
 * Validate file is an image
 * @param file - The file to validate
 * @returns True if file is an image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Validate file size
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns True if file size is valid
 */
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  return getFileSizeInMB(file) <= maxSizeMB
}
