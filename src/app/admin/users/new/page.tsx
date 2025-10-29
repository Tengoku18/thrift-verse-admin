'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { createUserSchema, type CreateUserInput } from '@/lib/validations/user'
import { createUser } from '@/actions'
import { Button } from '@/_components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { FormInput, FormTextarea, FormSelect } from '@/_components/form'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const currencyOptions = [
  { value: 'NPR', label: 'NPR - Nepali Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'INR', label: 'INR - Indian Rupee' },
]

export default function NewUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: yupResolver(createUserSchema) as any,
    defaultValues: {
      currency: 'NPR',
    },
  })

  const onSubmit = async (data: CreateUserInput) => {
    setIsSubmitting(true)
    try {
      const result = await createUser(data)

      if (result.success) {
        toast.success('User created successfully!')
        router.push('/admin/users')
      } else {
        toast.error(result.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Create user error:', error)
      toast.error('An error occurred while creating user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <span>/</span>
                <Link href="/admin/users" className="hover:text-primary transition-colors">
                  Users
                </Link>
                <span>/</span>
                <span className="text-primary font-medium">New</span>
              </div>
              <h1 className="font-heading mt-1 text-4xl font-bold text-primary">
                Create New User
              </h1>
            </div>
            <Button variant="outline" asChild className="shadow-md">
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
          <Card className="shadow-lg hover-lift">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="font-heading text-2xl text-primary">
                Basic Information
              </CardTitle>
              <CardDescription className="text-base">
                Enter the user's personal details and account information.
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
                  required
                />

                <FormInput
                  label="Store Username"
                  name="store_username"
                  placeholder="e.g., johndoe"
                  register={register}
                  error={errors.store_username}
                  required
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
                required
                description="This will be used for authentication"
              />

              <FormInput
                label="Password"
                name="password"
                type="password"
                placeholder="Enter a strong password"
                register={register}
                error={errors.password}
                required
                description="At least 8 characters with uppercase, lowercase, and numbers"
              />

              <FormSelect
                label="Currency"
                name="currency"
                options={currencyOptions}
                placeholder="Select currency"
                control={control}
                error={errors.currency}
                required
                description="User's preferred currency for transactions"
              />
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card className="shadow-lg hover-lift">
            <CardHeader className="bg-gradient-to-r from-accent/5 to-secondary/5">
              <CardTitle className="font-heading text-2xl text-accent">
                Additional Details
              </CardTitle>
              <CardDescription className="text-base">
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

              <FormInput
                label="Profile Image URL"
                name="profile_image"
                type="url"
                placeholder="https://example.com/image.jpg"
                register={register}
                error={errors.profile_image}
                description="Enter a valid image URL"
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/users')}
                  disabled={isSubmitting}
                  className="shadow-md"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="shadow-md">
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? 'Creating User...' : 'Create User'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
