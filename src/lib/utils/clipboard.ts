import toast from 'react-hot-toast'

/**
 * Copy text to clipboard and show a toast notification
 * @param text - The text to copy to clipboard
 * @param label - Optional label to show in the toast (e.g., "Order ID", "Email")
 */
export const copyToClipboard = async (text: string, label?: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
    const message = label ? `${label} copied to clipboard` : 'Copied to clipboard'
    toast.success(message)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    toast.error('Failed to copy to clipboard')
  }
}

/**
 * Base CSS classes for copy icon buttons
 */
export const COPY_BUTTON_CLASSES = 'text-gray-400 hover:text-primary transition-colors cursor-pointer'
