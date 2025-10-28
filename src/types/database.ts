// Database types for Supabase tables

export interface Profile {
  id: string
  name: string
  bio: string | null
  profile_image: string | null
  currency: string
  store_username: string
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number | null
}

// Add more database types as you create more tables
