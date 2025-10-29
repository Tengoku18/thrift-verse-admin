import * as yup from 'yup'

// Common categories - you can expand this list
export const PRODUCT_CATEGORIES = [
  'Clothing',
  'Electronics',
  'Furniture',
  'Books',
  'Toys',
  'Sports',
  'Home & Garden',
  'Beauty & Health',
  'Automotive',
  'Other',
] as const

export const PRODUCT_STATUSES = ['available', 'out_of_stock'] as const

// Create product validation schema
export const createProductSchema = yup.object({
  store_id: yup
    .string()
    .required('Store owner is required')
    .uuid('Invalid store owner ID'),
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: yup
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .nullable(),
  category: yup
    .string()
    .required('Category is required')
    .oneOf(PRODUCT_CATEGORIES as unknown as string[], 'Invalid category'),
  price: yup
    .number()
    .required('Price is required')
    .positive('Price must be a positive number')
    .min(0, 'Price must be greater than or equal to 0')
    .max(999999.99, 'Price is too high'),
  cover_image: yup
    .string()
    .required('Cover image is required')
    .url('Cover image must be a valid URL'),
  other_images: yup
    .array()
    .of(yup.string().url('Each image must be a valid URL'))
    .optional()
    .default([]),
  availability_count: yup
    .number()
    .integer('Availability count must be an integer')
    .min(0, 'Availability count cannot be negative')
    .default(0),
  status: yup
    .string()
    .required('Status is required')
    .oneOf(PRODUCT_STATUSES as unknown as string[], 'Invalid status')
    .default('available'),
})

// Update product validation schema (all fields optional)
export const updateProductSchema = yup.object({
  store_id: yup.string().uuid('Invalid store owner ID').notRequired(),
  title: yup
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .notRequired(),
  description: yup
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .nullable()
    .notRequired(),
  category: yup
    .string()
    .oneOf(PRODUCT_CATEGORIES as unknown as string[], 'Invalid category')
    .notRequired(),
  price: yup
    .number()
    .positive('Price must be a positive number')
    .min(0, 'Price must be greater than or equal to 0')
    .max(999999.99, 'Price is too high')
    .notRequired(),
  cover_image: yup.string().url('Cover image must be a valid URL').notRequired(),
  other_images: yup
    .array()
    .of(yup.string().url('Each image must be a valid URL'))
    .notRequired(),
  availability_count: yup
    .number()
    .integer('Availability count must be an integer')
    .min(0, 'Availability count cannot be negative')
    .notRequired(),
  status: yup
    .string()
    .oneOf(PRODUCT_STATUSES as unknown as string[], 'Invalid status')
    .notRequired(),
})

// TypeScript types inferred from schemas
export type CreateProductInput = yup.InferType<typeof createProductSchema>
export type UpdateProductInput = yup.InferType<typeof updateProductSchema>
