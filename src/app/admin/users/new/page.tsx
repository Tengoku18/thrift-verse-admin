'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { createUserSchema, type CreateUserInput } from '@/lib/validations/user'
import { createUser, checkUsernameAvailability } from '@/actions'
import { Button } from '@/_components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { FormInput, FormTextarea, FormSelect } from '@/_components/form'
import { FormImageUpload } from '@/_components/form/FormImageUpload'
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react'
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
  const [usernameInput, setUsernameInput] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: yupResolver(createUserSchema) as any,
    defaultValues: {
      currency: 'NPR',
    },
  })

  // Watch the store_username field
  const storeUsername = watch('store_username')

  // Debounced username availability check
  useEffect(() => {
    if (!storeUsername || storeUsername.length < 3) {
      setUsernameAvailable(null)
      setUsernameInput(storeUsername || '')
      return
    }

    // Update the input value
    setUsernameInput(storeUsername)
    setIsCheckingUsername(true)
    setUsernameAvailable(null)

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(storeUsername)
        setUsernameAvailable(result.available)
      } catch (error) {
        console.error('Error checking username:', error)
        setUsernameAvailable(null)
      } finally {
        setIsCheckingUsername(false)
      }
    }, 500) // 500ms delay

    return () => {
      clearTimeout(timeoutId)
      setIsCheckingUsername(false)
    }
  }, [storeUsername])

  const onSubmit = async (data: CreateUserInput) => {
    // Prevent submission if username is taken
    if (usernameAvailable === false) {
      toast.error('Please choose a different username')
      return
    }

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

                <div className="space-y-2">
                  <FormInput
                    label="Store Username"
                    name="store_username"
                    placeholder="e.g., johndoe"
                    register={register}
                    error={errors.store_username}
                    required
                    description="Lowercase letters, numbers, and underscores only"
                  />
                  {/* Username availability feedback */}
                  {storeUsername && storeUsername.length >= 3 && !errors.store_username && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      {isCheckingUsername && (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                          <span className="text-gray-600">Checking availability...</span>
                        </>
                      )}
                      {!isCheckingUsername && usernameAvailable === true && (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">Username is available</span>
                        </>
                      )}
                      {!isCheckingUsername && usernameAvailable === false && (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-medium">Username is already taken</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
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

              <FormTextarea
                label="Address"
                name="address"
                placeholder="Enter full address..."
                register={register}
                error={errors.address}
                rows={3}
                maxLength={500}
                description="Full address is required (minimum 10 characters)"
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
                <Button
                  type="submit"
                  disabled={isSubmitting || isCheckingUsername || usernameAvailable === false}
                  className="shadow-md"
                >
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
