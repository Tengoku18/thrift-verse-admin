import * as yup from 'yup'

export const createUserSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),

  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email address'),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),

  store_username: yup
    .string()
    .required('Store username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .matches(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
    .test('no-spaces', 'Username cannot contain spaces', (value) => !value?.includes(' ')),

  currency: yup
    .string()
    .required('Currency is required')
    .oneOf(['NPR', 'USD', 'EUR', 'GBP', 'INR'], 'Invalid currency'),

  bio: yup
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .nullable()
    .notRequired(),

  profile_image: yup
    .string()
    .url('Must be a valid URL')
    .nullable()
    .notRequired(),
})

export const updateUserSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),

  email: yup
    .string()
    .email('Must be a valid email address'),

  store_username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    // .matches(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
    .test('no-spaces', 'Username cannot contain spaces', (value) => !value || !value.includes(' ')),

  currency: yup
    .string()
    .oneOf(['NPR', 'USD', 'EUR', 'GBP', 'INR'], 'Invalid currency'),

  bio: yup
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .nullable()
    .notRequired(),

  profile_image: yup
    .string()
    .url('Must be a valid URL')
    .nullable()
    .notRequired(),
}).partial()

export type CreateUserInput = yup.InferType<typeof createUserSchema>
export type UpdateUserInput = yup.InferType<typeof updateUserSchema>
