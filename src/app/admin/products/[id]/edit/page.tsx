'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  updateProductSchema,
  type UpdateProductInput,
  PRODUCT_CATEGORIES,
} from '@/lib/validations/product'
import { getProductById, updateProduct, getUsers } from '@/actions'
import { Button } from '@/_components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/_components/ui/card'
import { FormInput, FormTextarea, FormSelect, FormImageUpload, FormMultipleImageUpload } from '@/_components/form'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCurrencySymbol } from '@/lib/utils/currency'

const categoryOptions = PRODUCT_CATEGORIES.map((cat) => ({
  value: cat,
  label: cat,
}))

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<Array<{ value: string; label: string }>>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [productCurrency, setProductCurrency] = useState<string>('USD')

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(updateProductSchema) as any,
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

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const product = await getProductById(id)

        if (!product) {
          toast.error('Product not found')
          router.push('/admin/products')
          return
        }

        // Set product currency from store owner
        if (product.store?.currency) {
          setProductCurrency(product.store.currency)
        }

        reset({
          store_id: product.store_id,
          title: product.title,
          description: product.description || '',
          category: product.category,
          price: product.price,
          availability_count: product.availability_count,
          status: product.status,
          cover_image: product.cover_image,
          other_images: product.other_images || [],
        })
      } catch (error) {
        console.error('Failed to load product:', error)
        toast.error('Failed to load product data')
        router.push('/admin/products')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, reset, router])

  const onSubmit = async (data: UpdateProductInput) => {
    console.log('[Form] Submit started with data:', data)

    // Validate cover image
    if (!data.cover_image) {
      toast.error('Please upload a cover image')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateProduct({
        id,
        ...data,
      })

      if (result.success) {
        toast.success('Product updated successfully!')
        router.push('/admin/products')
      } else {
        toast.error(result.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('[Form] Unexpected error:', error)
      toast.error('An error occurred while updating product')
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
              Edit Product
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
                <span className="text-primary font-medium">Edit</span>
              </div>
              <h1 className="font-heading mt-1 text-4xl font-bold text-primary">
                Edit Product
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
                Update the product details and pricing information.
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
                disabled={loadingUsers}
                description="Change the store owner for this product"
              />

              <FormInput
                label="Product Title"
                name="title"
                placeholder="Enter product title"
                register={register}
                error={errors.title}
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
                description="Detailed description of the product"
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormSelect
                  label="Category"
                  name="category"
                  options={categoryOptions}
                  placeholder="Select category"
                  control={control}
                  error={errors.category}
                  description="Product category"
                />

                <FormInput
                  label={`Price (${getCurrencySymbol(productCurrency)})`}
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  register={register}
                  error={errors.price}
                  description={`Amount in ${productCurrency}`}
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
                Update product images. Upload new images to replace existing ones.
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

              <FormMultipleImageUpload
                name="other_images"
                control={control}
                label="Additional Images"
                bucket="products"
                folder="products"
                maxImages={5}
                hint="Upload up to 5 additional product images (optional)"
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
                  {isSubmitting ? 'Updating Product...' : 'Update Product'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
