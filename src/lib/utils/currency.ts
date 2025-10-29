/**
 * Currency utility functions for formatting prices with currency symbols
 */

export type Currency = 'NPR' | 'USD' | 'EUR' | 'GBP' | 'INR'

/**
 * Currency symbol mapping
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NPR: 'Rs. ',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
}

/**
 * Currency names for display
 */
export const CURRENCY_NAMES: Record<Currency, string> = {
  NPR: 'Nepali Rupee',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  INR: 'Indian Rupee',
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency as Currency] || currency
}

/**
 * Format price with currency symbol
 * @param price - The numeric price value
 * @param currency - The currency code (NPR, USD, etc.)
 * @param options - Formatting options
 * @returns Formatted price string with currency symbol
 */
export function formatPrice(
  price: number | string,
  currency: string = 'USD',
  options: {
    decimals?: number
    showSymbol?: boolean
    symbolPosition?: 'before' | 'after'
  } = {}
): string {
  const {
    decimals = 2,
    showSymbol = true,
    symbolPosition = 'before',
  } = options

  // Convert to number if string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  // Handle invalid numbers
  if (isNaN(numPrice)) {
    return showSymbol ? `${getCurrencySymbol(currency)}0.00` : '0.00'
  }

  // Format the number with appropriate decimals
  const formattedNumber = numPrice.toFixed(decimals)

  // Return with or without symbol
  if (!showSymbol) {
    return formattedNumber
  }

  const symbol = getCurrencySymbol(currency)

  // Symbol position
  if (symbolPosition === 'after') {
    return `${formattedNumber} ${symbol}`
  }

  // NPR typically has space after Rs.
  if (currency === 'NPR') {
    return `${symbol}${formattedNumber}`
  }

  return `${symbol}${formattedNumber}`
}

/**
 * Format price with locale-aware formatting
 * Uses Intl.NumberFormat for proper locale formatting
 */
export function formatPriceLocale(
  price: number | string,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numPrice)) {
    return formatPrice(0, currency)
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice)
  } catch (error) {
    // Fallback to simple format if locale/currency combo is invalid
    return formatPrice(numPrice, currency)
  }
}

/**
 * Parse price string to number, removing currency symbols
 */
export function parsePrice(priceString: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = priceString.replace(/[^0-9.]/g, '')
  return parseFloat(cleaned) || 0
}
