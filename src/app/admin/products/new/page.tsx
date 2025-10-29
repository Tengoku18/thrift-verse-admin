'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  createProductSchema,
  type CreateProductInput,
  PRODUCT_CATEGORIES,
} from '@/lib/validations/product'
import { createProduct, getUsers } from '@/actions'
import { Button } from '@/_components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/_components/ui/card'
import { FormInput, FormTextarea, FormSelect } from '@/_components/form'
import { FormImageUpload } from '@/_components/form/FormImageUpload'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const categoryOptions = PRODUCT_CATEGORIES.map((cat) => ({
  value: cat,
  label: cat,
}))

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<Array<{ value: string; label: string }>>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<CreateProductInput>({
    resolver: yupResolver(createProductSchema),
    defaultValues: {
      status: 'available',
      availability_count: 0,
      cover_image: '',
      other_images: [],
    },
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await getUsers()
        const userOptions = data.map((user) => ({
          value: user.id,
          label: `${user.name} (@${user.store_username})`,
        }))
        setUsers(userOptions)
      } catch (error) {
        console.error('Failed to fetch users:', error)
        toast.error('Failed to load users')
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  const onSubmit = async (data: CreateProductInput) => {
    console.log('[Form] Submit started with data:', data)

    // Validate cover image
    if (!data.cover_image) {
      toast.error('Please upload a cover image')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createProduct(data)

      if (result.success) {
        toast.success('Product created successfully!')
        router.push('/admin/products')
      } else {
        toast.error(result.error || 'Failed to create product')
      }
    } catch (error) {
      console.error('[Form] Unexpected error:', error)
      toast.error('An error occurred while creating product')
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
                <Link
                  href="/admin"
                  className="hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <span>/</span>
                <Link
                  href="/admin/products"
                  className="hover:text-primary transition-colors"
                >
                  Products
                </Link>
                <span>/</span>
                <span className="text-primary font-medium">New</span>
              </div>
              <h1 className="font-heading mt-1 text-4xl font-bold text-primary">
                Create New Product
              </h1>
            </div>
            <Button variant="outline" asChild className="shadow-md">
              <Link href="/admin/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
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
                Enter the product details and pricing information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormSelect
                label="Store Owner"
                name="store_id"
                options={users}
                placeholder={loadingUsers ? 'Loading users...' : 'Select store owner'}
                control={control}
                error={errors.store_id}
                required
                disabled={loadingUsers}
                description="Select the user who owns this product"
              />

              <FormInput
                label="Product Title"
                name="title"
                placeholder="Enter product title"
                register={register}
                error={errors.title}
                required
                description="A clear and descriptive title for your product"
              />

              <FormTextarea
                label="Description"
                name="description"
                placeholder="Describe your product..."
                register={register}
                error={errors.description}
                rows={4}
                maxLength={2000}
                description="Detailed description of the product (optional)"
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormSelect
                  label="Category"
                  name="category"
                  options={categoryOptions}
                  placeholder="Select category"
                  control={control}
                  error={errors.category}
                  required
                  description="Product category"
                />

                <FormInput
                  label="Price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  register={register}
                  error={errors.price}
                  required
                  description="Price in USD"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormInput
                  label="Availability Count"
                  name="availability_count"
                  type="number"
                  placeholder="0"
                  register={register}
                  error={errors.availability_count}
                  description="Number of items in stock"
                />

                <FormSelect
                  label="Status"
                  name="status"
                  options={statusOptions}
                  placeholder="Select status"
                  control={control}
                  error={errors.status}
                  required
                  description="Product availability status"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="shadow-lg hover-lift">
            <CardHeader className="bg-gradient-to-r from-accent/5 to-secondary/5">
              <CardTitle className="font-heading text-2xl text-accent">
                Product Images
              </CardTitle>
              <CardDescription className="text-base">
                Upload images to showcase your product.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormImageUpload
                name="cover_image"
                control={control}
                label="Cover Image"
                required
                bucket="products"
                folder="products"
                hint="Main product image (PNG, JPG, GIF up to 5MB)"
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              {/* Show validation errors */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm font-medium text-destructive mb-2">
                    Please fix the following errors:
                  </p>
                  <ul className="list-disc list-inside text-sm text-destructive">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>
                        {field}: {error?.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/products')}
                  disabled={isSubmitting}
                  className="shadow-md"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="shadow-md"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? 'Creating Product...' : 'Create Product'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
