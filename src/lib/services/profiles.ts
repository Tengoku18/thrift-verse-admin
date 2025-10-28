import { createClient } from '@/lib/supabase/server'
import type { Profile, PaginatedResponse } from '@/types'

/**
 * Get all profiles with optional pagination
 */
export async function getProfiles(params?: {
  limit?: number
  offset?: number
}): Promise<PaginatedResponse<Profile>> {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (params?.limit) {
    query = query.limit(params.limit)
  }

  if (params?.offset) {
    const rangeEnd = params.offset + (params.limit || 10) - 1
    query = query.range(params.offset, rangeEnd)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching profiles:', error)
    throw new Error(error.message)
  }

  return {
    data: data || [],
    count,
  }
}

/**
 * Get a single profile by user ID
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * Get a profile by store username
 */
export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('store_username', username)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * Update a profile
 */
export async function updateProfile(
  id: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error(error.message)
  }

  return data
}

/**
 * Delete a profile (and associated auth user via cascade)
 */
export async function deleteProfile(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from('profiles').delete().eq('id', id)

  if (error) {
    console.error('Error deleting profile:', error)
    throw new Error(error.message)
  }

  return true
}

/**
 * Search profiles by name or store username
 */
export async function searchProfiles(
  query: string,
  params?: { limit?: number }
): Promise<Profile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`name.ilike.%${query}%,store_username.ilike.%${query}%`)
    .limit(params?.limit || 10)

  if (error) {
    console.error('Error searching profiles:', error)
    throw new Error(error.message)
  }

  return data || []
}
