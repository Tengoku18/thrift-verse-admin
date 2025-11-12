import * as yup from 'yup'

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const

export const PAYMENT_METHODS = [
  'credit_card',
  'debit_card',
  'paypal',
  'bank_transfer',
  'cash_on_delivery',
] as const

// Shipping address validation schema
const shippingAddressSchema = yup.object({
  street: yup.string().required('Street is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  country: yup.string().required('Country is required'),
  postal_code: yup.string().required('Postal code is required'),
})

// Update order validation schema (only updateable fields)
export const updateOrderSchema = yup.object({
  status: yup
    .string()
    .oneOf(ORDER_STATUSES as unknown as string[], 'Invalid status')
    .notRequired(),
  shipping_address: shippingAddressSchema.notRequired(),
  buyer_name: yup.string().notRequired(),
  buyer_email: yup.string().email('Invalid email').notRequired(),
})

// TypeScript types inferred from schemas
export type UpdateOrderInput = yup.InferType<typeof updateOrderSchema>
