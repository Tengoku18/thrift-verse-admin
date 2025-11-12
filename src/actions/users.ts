'use server'

import { PaginatedResponse, Profile } from '@/types/database'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import appConfig from '@/config/appConfig'

interface GetUsersParams {
  limit?: number
  offset?: number
}

interface CreateUserParams {
  email: string
  password: string
  name: string
  store_username: string
  currency: string
  bio?: string | null
  profile_image?: string | null
  address: string
}

interface UpdateUserParams {
  id: string
  name?: string
  store_username?: string
  email?: string
  currency?: string
  bio?: string | null
  profile_image?: string | null
  address?: string
}

/**
 * Get all users with optional pagination
 */
export async function getUsers(
  params?: GetUsersParams
): Promise<PaginatedResponse<Profile & { email: string | null }>> {
  try {
    const supabase = await createClient()
    const serviceRoleClient = createServiceRoleClient()

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

    const { data: profiles, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      throw new Error(error.message)
    }

    if (!profiles || profiles.length === 0) {
      return { data: [], count }
    }

    // Fetch emails from auth.users using service role client
    const { data: authUsers, error: authError } =
      await serviceRoleClient.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
      // Return profiles without emails if auth fetch fails
      return { data: profiles.map((p) => ({ ...p, email: null })), count }
    }

    // Create a map of user IDs to emails
    const emailMap = new Map(
      authUsers.users.map((u) => [u.id, u.email || null])
    )

    // Combine profiles with emails
    const usersWithEmails = profiles.map((profile) => ({
      ...profile,
      email: emailMap.get(profile.id) || null,
    }))

    // Filter out admin emails from the list
    const filteredUsers = usersWithEmails.filter((user) => {
      if (!user.email) return true // Keep users without emails
      return !appConfig.adminEmails.includes(user.email.toLowerCase())
    })

    // Adjust count to reflect filtered results
    const filteredCount = count
      ? count - (usersWithEmails.length - filteredUsers.length)
      : filteredUsers.length

    return { data: filteredUsers, count: filteredCount }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    throw error
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(
  id: string
): Promise<(Profile & { email: string | null }) | null> {
  try {
    const supabase = await createClient()
    const serviceRoleClient = createServiceRoleClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching user by ID:', error)
      return null
    }

    // Fetch email from auth.users
    const { data: authUser } = await serviceRoleClient.auth.admin.getUserById(
      id
    )

    return {
      ...profile,
      email: authUser?.user?.email || null,
    }
  } catch (error) {
    console.error('Failed to fetch user by ID:', error)
    return null
  }
}

/**
 * Get a single user by store username
 */
export async function getUserByUsername(
  username: string
): Promise<(Profile & { email: string | null }) | null> {
  try {
    const supabase = await createClient()
    const serviceRoleClient = createServiceRoleClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('store_username', username)
      .single()

    if (error) {
      console.error('Error fetching user by username:', error)
      return null
    }

    // Fetch email from auth.users
    const { data: authUser } = await serviceRoleClient.auth.admin.getUserById(
      profile.id
    )

    return {
      ...profile,
      email: authUser?.user?.email || null,
    }
  } catch (error) {
    console.error('Failed to fetch user by username:', error)
    return null
  }
}

/**
 * Check if a store username is available
 */
export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('store_username', username)
      .maybeSingle()

    if (error) {
      console.error('Error checking username availability:', error)
      // In case of error, assume it's not available to be safe
      return { available: false }
    }

    // Username is available if no profile was found
    return { available: !data }
  } catch (error) {
    console.error('Failed to check username availability:', error)
    return { available: false }
  }
}

/**
 * Create a new user with auth and profile
 */
export async function createUser(params: CreateUserParams) {
  try {
    const serviceRoleClient = createServiceRoleClient()

    // Check if email already exists in auth
    const { data: existingUsers } =
      await serviceRoleClient.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users.find(
      (user) => user.email?.toLowerCase() === params.email.toLowerCase()
    )

    if (existingAuthUser) {
      return { success: false, error: 'A user with this email already exists' }
    }

    // Check if store_username already exists in profiles
    const { data: existingProfile } = await serviceRoleClient
      .from('profiles')
      .select('id')
      .eq('store_username', params.store_username)
      .maybeSingle()

    // If profile exists, check if it has a corresponding auth user
    if (existingProfile) {
      const authUserExists = existingUsers?.users.some(
        (user) => user.id === existingProfile.id
      )

      if (authUserExists) {
        return {
          success: false,
          error: 'This store username is already in use',
        }
      } else {
        // Orphaned profile found - clean it up
        console.log('Cleaning up orphaned profile:', existingProfile.id)
        await serviceRoleClient
          .from('profiles')
          .delete()
          .eq('id', existingProfile.id)
      }
    }

    // Create auth user
    const { data: authData, error: authError } =
      await serviceRoleClient.auth.admin.createUser({
        email: params.email,
        password: params.password,
        email_confirm: true,
      })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' }
    }

    // Check if a profile already exists for this user ID (shouldn't happen, but just in case)
    const { data: existingProfileById } = await serviceRoleClient
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (existingProfileById) {
      console.log('Cleaning up existing profile for user ID:', authData.user.id)
      await serviceRoleClient
        .from('profiles')
        .delete()
        .eq('id', authData.user.id)
    }

    // Create profile
    const { error: profileError } = await serviceRoleClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: params.name,
        store_username: params.store_username,
        currency: params.currency,
        bio: params.bio || null,
        profile_image: params.profile_image || null,
        address: params.address,
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Rollback: delete auth user
      await serviceRoleClient.auth.admin.deleteUser(authData.user.id)

      return {
        success: false,
        error: `Failed to create profile: ${profileError.message}`,
      }
    }

    return { success: true, data: authData.user }
  } catch (error) {
    console.error('Failed to create user:', error)
    return { success: false, error: 'An error occurred while creating user' }
  }
}

/**
 * Update user profile and optionally email
 */
export async function updateUser(params: UpdateUserParams) {
  try {
    const serviceRoleClient = createServiceRoleClient()
    const { id, email, ...profileUpdates } = params

    // Check if store_username is being updated and if it's already taken
    if (profileUpdates.store_username) {
      const { data: existingProfile } = await serviceRoleClient
        .from('profiles')
        .select('id')
        .eq('store_username', profileUpdates.store_username)
        .neq('id', id)
        .maybeSingle()

      if (existingProfile) {
        return {
          success: false,
          error: 'This store username is already in use',
        }
      }
    }

    // Update profile if there are profile fields to update
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await serviceRoleClient
        .from('profiles')
        .update(profileUpdates)
        .eq('id', id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        return { success: false, error: profileError.message }
      }
    }

    // Update email if provided
    if (email) {
      // Check if email is already in use by another user
      const { data: existingUsers } =
        await serviceRoleClient.auth.admin.listUsers()
      const emailInUse = existingUsers?.users.some(
        (user) => user.email?.toLowerCase() === email.toLowerCase() && user.id !== id
      )

      if (emailInUse) {
        return { success: false, error: 'This email is already in use' }
      }

      const { error: authError } =
        await serviceRoleClient.auth.admin.updateUserById(id, { email })

      if (authError) {
        console.error('Error updating user email:', authError)
        return { success: false, error: authError.message }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to update user:', error)
    return { success: false, error: 'An error occurred while updating user' }
  }
}

/**
 * Delete a user (auth and profile)
 */
export async function deleteUser(id: string) {
  try {
    const serviceRoleClient = createServiceRoleClient()

    // Delete auth user (this should cascade to profile if foreign key is set)
    const { error: authError } =
      await serviceRoleClient.auth.admin.deleteUser(id)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return { success: false, error: authError.message }
    }

    // Delete profile (in case cascade doesn't work)
    const { error: profileError } = await serviceRoleClient
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      // Don't return error as auth user is already deleted
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to delete user:', error)
    return { success: false, error: 'An error occurred while deleting user' }
  }
}
