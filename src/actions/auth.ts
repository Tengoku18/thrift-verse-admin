'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import appConfig from '@/config/appConfig'

// Allowed admin emails from config
const ADMIN_EMAILS = appConfig.adminEmails

export async function loginAction(email: string, password: string) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return {
        success: false,
        error: 'Server configuration error. Please contact administrator.',
      }
    }

    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required',
      }
    }

    // Check if email is in the allowed admin emails list
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return {
        success: false,
        error: 'Access denied. You do not have admin privileges.',
      }
    }

    const supabase = await createClient()

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    if (!data.user) {
      console.error('No user data returned from Supabase')
      return {
        success: false,
        error: 'Authentication failed',
      }
    }

    // Double-check the authenticated user's email is in the admin emails list
    if (!data.user.email || !ADMIN_EMAILS.includes(data.user.email.toLowerCase())) {
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'Access denied. You do not have admin privileges.',
      }
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during login',
    }
  }
}

export async function logoutAction() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: 'Failed to sign out',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      error: 'An error occurred during logout',
    }
  }
}

export async function redirectToAdmin() {
  redirect('/admin')
}

export async function redirectToLogin() {
  redirect('/login')
}
