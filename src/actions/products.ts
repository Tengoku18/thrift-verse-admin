'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { Product, ProductWithStore, PaginatedResponse } from '@/types'
import type { CreateProductInput, UpdateProductInput } from '@/lib/validations/product'

/**
 * Get all products with pagination and filtering
 */
export async function getProducts(params?: {
  page?: number
  limit?: number
  category?: string
  status?: string
  search?: string
  store_id?: string
}): Promise<PaginatedResponse<ProductWithStore>> {
  // Use service role client for admin access
  const supabase = createServiceRoleClient()

  const page = params?.page || 1
  const limit = params?.limit || 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('products')
    .select(
      `
      *,
      store:profiles!store_id (
        id,
        name,
        store_username,
        currency
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (params?.category) {
    query = query.eq('category', params.category)
  }

  if (params?.status) {
    query = query.eq('status', params.status)
  }

  if (params?.store_id) {
    query = query.eq('store_id', params.store_id)
  }

  if (params?.search) {
    query = query.or(
      `title.ilike.%${params.search}%,description.ilike.%${params.search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching products:', error)
    throw new Error('Failed to fetch products')
  }

  return {
    data: (data as ProductWithStore[]) || [],
    count: count || 0,
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(
  id: string
): Promise<ProductWithStore | null> {
  // Use service role client for admin access
  const supabase = createServiceRoleClient()

  console.log('Fetching product with ID:', id)

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      store:profiles!store_id (
        id,
        name,
        store_username,
        currency
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return null
  }

  console.log('Product fetched successfully:', data?.id)
  return data as ProductWithStore
}

/**
 * Create a new product
 */
export async function createProduct(
  input: CreateProductInput
): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    // Use both clients: regular for auth, service role for operations
    const authSupabase = await createClient()
    const supabase = createServiceRoleClient()

    // Get current user (admin)
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify the store_id (user) exists
    const { data: storeUser, error: storeError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', input.store_id)
      .single()

    if (storeError || !storeUser) {
      return { success: false, error: 'Invalid store owner selected' }
    }

    // Create product with the selected store_id
    const { data, error } = await supabase
      .from('products')
      .insert({
        store_id: input.store_id,
        title: input.title,
        description: input.description || null,
        category: input.category,
        price: input.price,
        cover_image: input.cover_image,
        other_images: input.other_images || [],
        availability_count: input.availability_count || 0,
        status: input.status || 'available',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Product }
  } catch (error) {
    console.error('Create product error:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

/**
 * Update a product
 */
export async function updateProduct(params: {
  id: string
} & UpdateProductInput): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    // Use both clients: regular for auth, service role for operations
    const authSupabase = await createClient()
    const supabase = createServiceRoleClient()
    const { id, ...updates } = params

    // Get current user (admin)
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingProduct) {
      return { success: false, error: 'Product not found' }
    }

    // If updating store_id, verify the new store exists
    if (updates.store_id) {
      const { data: storeUser, error: storeError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', updates.store_id)
        .single()

      if (storeError || !storeUser) {
        return { success: false, error: 'Invalid store owner selected' }
      }
    }

    // Update product (admin can update any product)
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Product }
  } catch (error) {
    console.error('Update product error:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use both clients: regular for auth, service role for operations
    const authSupabase = await createClient()
    const supabase = createServiceRoleClient()

    // Get current user (admin)
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingProduct) {
      return { success: false, error: 'Product not found' }
    }

    // Delete product (admin can delete any product)
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete product error:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}

/**
 * Get product statistics
 */
export async function getProductStats(storeId?: string) {
  // Use service role client for admin access
  const supabase = createServiceRoleClient()

  let query = supabase
    .from('products')
    .select('id, status, availability_count', { count: 'exact' })

  if (storeId) {
    query = query.eq('store_id', storeId)
  }

  const { data, count } = await query

  const availableCount =
    data?.filter((p) => p.status === 'available').length || 0
  const outOfStockCount =
    data?.filter((p) => p.status === 'out_of_stock').length || 0
  const totalInventory =
    data?.reduce((sum, p) => sum + p.availability_count, 0) || 0

  return {
    total: count || 0,
    available: availableCount,
    outOfStock: outOfStockCount,
    totalInventory,
  }
}
