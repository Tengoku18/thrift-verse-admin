'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { updateUserSchema, type UpdateUserInput } from '@/lib/validations/user'
import { getUserById, updateUser } from '@/actions'
import { Button } from '@/_components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { FormInput, FormTextarea, FormSelect } from '@/_components/form'
import { FormImageUpload } from '@/_components/form/FormImageUpload'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const currencyOptions = [
  { value: 'NPR', label: 'NPR - Nepali Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'INR', label: 'INR - Indian Rupee' },
]

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateUserInput>({
    resolver: yupResolver(updateUserSchema) as any,
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUserById(id)

        if (!user) {
          toast.error('User not found')
          router.push('/admin/users')
          return
        }

        reset({
          name: user.name,
          store_username: user.store_username,
          email: user.email || '',
          currency: user.currency,
          bio: user.bio || '',
          profile_image: user.profile_image || '',
        })
      } catch (error) {
        console.error('Failed to load user:', error)
        toast.error('Failed to load user data')
        router.push('/admin/users')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [id, reset, router])

  const onSubmit = async (data: UpdateUserInput) => {
    setIsSubmitting(true)
    try {
      // Remove empty fields
      const updates = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '')
      )

      const result = await updateUser({
        id: id,
        ...updates,
      })

      if (result.success) {
        toast.success('User updated successfully!')
        router.push('/admin/users')
      } else {
        toast.error(result.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Update user error:', error)
      toast.error('An error occurred while updating user')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold text-primary">
              Edit User
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/admin" className="hover:text-primary">
                  Dashboard
                </Link>
                <span>/</span>
                <Link href="/admin/users" className="hover:text-primary">
                  Users
                </Link>
                <span>/</span>
                <span>Edit</span>
              </div>
              <h1 className="font-heading mt-1 text-3xl font-bold text-primary">
                Edit User
              </h1>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl text-primary">
                Basic Information
              </CardTitle>
              <CardDescription>
                Update the user's personal details and account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormInput
                  label="Full Name"
                  name="name"
                  placeholder="Enter full name"
                  register={register}
                  error={errors.name}
                />

                <FormInput
                  label="Store Username"
                  name="store_username"
                  placeholder="e.g., johndoe"
                  register={register}
                  error={errors.store_username}
                  description="Lowercase letters, numbers, and underscores only"
                />
              </div>

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="user@example.com"
                register={register}
                error={errors.email}
                description="Used for authentication"
              />

              <FormSelect
                label="Currency"
                name="currency"
                options={currencyOptions}
                placeholder="Select currency"
                control={control}
                error={errors.currency}
                description="User's preferred currency for transactions"
              />
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl text-primary">
                Additional Details
              </CardTitle>
              <CardDescription>
                Optional information about the user.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormTextarea
                label="Bio"
                name="bio"
                placeholder="Write a short bio..."
                register={register}
                error={errors.bio}
                rows={4}
                maxLength={500}
                description="Maximum 500 characters"
              />

              <FormImageUpload
                name="profile_image"
                control={control}
                label="Profile Image"
                bucket="profiles"
                folder="profiles"
                hint="Upload profile image (PNG, JPG, GIF up to 5MB)"
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/users')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? 'Updating User...' : 'Update User'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
