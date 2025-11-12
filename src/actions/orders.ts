'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { Order, OrderWithDetails, PaginatedResponse } from '@/types'
import type { UpdateOrderInput } from '@/lib/validations/order'

/**
 * Get all orders with pagination and filtering
 */
export async function getOrders(params?: {
  page?: number
  limit?: number
  status?: string
  seller_id?: string
  search?: string
}): Promise<PaginatedResponse<OrderWithDetails>> {
  // Use service role client for admin access
  const supabase = createServiceRoleClient()

  const page = params?.page || 1
  const limit = params?.limit || 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('orders')
    .select(
      `
      *,
      seller:profiles!seller_id (
        id,
        name,
        store_username,
        currency
      ),
      product:products!product_id (
        id,
        title,
        cover_image,
        price
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (params?.status) {
    query = query.eq('status', params.status)
  }

  if (params?.seller_id) {
    query = query.eq('seller_id', params.seller_id)
  }

  if (params?.search) {
    query = query.or(
      `order_code.ilike.%${params.search}%,buyer_name.ilike.%${params.search}%,buyer_email.ilike.%${params.search}%,transaction_code.ilike.%${params.search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching orders:', error)
    throw new Error('Failed to fetch orders')
  }

  return {
    data: (data as OrderWithDetails[]) || [],
    count: count || 0,
  }
}

/**
 * Get a single order by ID
 */
export async function getOrderById(
  id: string
): Promise<OrderWithDetails | null> {
  // Use service role client for admin access
  const supabase = createServiceRoleClient()

  console.log('Fetching order with ID:', id)

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      seller:profiles!seller_id (
        id,
        name,
        store_username,
        currency
      ),
      product:products!product_id (
        id,
        title,
        cover_image,
        price
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return null
  }

  console.log('Order fetched successfully:', data?.id)
  return data as OrderWithDetails
}

/**
 * Update an order
 */
export async function updateOrder(params: {
  id: string
} & UpdateOrderInput): Promise<{ success: boolean; data?: Order; error?: string }> {
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

    // Check if order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingOrder) {
      return { success: false, error: 'Order not found' }
    }

    // Update order (admin can update any order)
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Order }
  } catch (error) {
    console.error('Update order error:', error)
    return { success: false, error: 'Failed to update order' }
  }
}

/**
 * Get order statistics
 */
export async function getOrderStats(sellerId?: string) {
  // Use service role client for admin access
  const supabase = createServiceRoleClient()

  let query = supabase
    .from('orders')
    .select('id, status, amount', { count: 'exact' })

  if (sellerId) {
    query = query.eq('seller_id', sellerId)
  }

  const { data, count } = await query

  const pendingCount = data?.filter((o) => o.status === 'pending').length || 0
  const processingCount =
    data?.filter((o) => o.status === 'processing').length || 0
  const shippedCount = data?.filter((o) => o.status === 'shipped').length || 0
  const deliveredCount =
    data?.filter((o) => o.status === 'delivered').length || 0
  const cancelledCount =
    data?.filter((o) => o.status === 'cancelled').length || 0
  const refundedCount = data?.filter((o) => o.status === 'refunded').length || 0

  const totalRevenue = data?.reduce((sum, o) => sum + o.amount, 0) || 0

  return {
    total: count || 0,
    pending: pendingCount,
    processing: processingCount,
    shipped: shippedCount,
    delivered: deliveredCount,
    cancelled: cancelledCount,
    refunded: refundedCount,
    totalRevenue,
  }
}
