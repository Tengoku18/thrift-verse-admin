// Database types for Supabase tables

export interface Profile {
  id: string
  name: string
  bio: string | null
  profile_image: string | null
  currency: string
  store_username: string
  address: string
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number | null
}

export type ProductStatus = 'available' | 'out_of_stock'

export interface Product {
  id: string
  store_id: string
  title: string
  description: string | null
  category: string
  price: number
  cover_image: string
  other_images: string[]
  availability_count: number
  status: ProductStatus
  created_at: string
  updated_at: string
}

export interface ProductWithStore extends Product {
  store: Pick<Profile, 'id' | 'name' | 'store_username' | 'currency'> | null
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export interface ShippingAddress {
  street: string
  city: string
  state: string
  country: string
  postal_code: string
}

export interface Order {
  id: string
  order_code: string | null
  seller_id: string
  product_id: string
  quantity: number
  buyer_email: string
  buyer_name: string
  shipping_address: ShippingAddress
  transaction_code: string
  transaction_uuid: string
  amount: number
  payment_method: string
  status: OrderStatus
  created_at: string
  updated_at: string
}

export interface OrderWithDetails extends Order {
  seller: Pick<Profile, 'id' | 'name' | 'store_username' | 'currency'> | null
  product: Pick<Product, 'id' | 'title' | 'cover_image' | 'price'> | null
}

// Add more database types as you create more tables
