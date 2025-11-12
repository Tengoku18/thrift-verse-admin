'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  updateOrderSchema,
  type UpdateOrderInput,
  ORDER_STATUSES,
} from '@/lib/validations/order'
import { getOrderById, updateOrder } from '@/actions'
import { Button } from '@/_components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/_components/ui/card'
import { FormInput, FormSelect } from '@/_components/form'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const statusOptions = ORDER_STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}))

export default function EditOrderPage({
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
  } = useForm({
    resolver: yupResolver(updateOrderSchema) as any,
  })

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const order = await getOrderById(id)

        if (!order) {
          toast.error('Order not found')
          router.push('/admin/orders')
          return
        }

        reset({
          status: order.status,
          buyer_name: order.buyer_name,
          buyer_email: order.buyer_email,
          shipping_address: order.shipping_address,
        })
      } catch (error) {
        console.error('Failed to load order:', error)
        toast.error('Failed to load order data')
        router.push('/admin/orders')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [id, reset, router])

  const onSubmit = async (data: UpdateOrderInput) => {
    console.log('[Form] Submit started with data:', data)

    setIsSubmitting(true)
    try {
      const result = await updateOrder({
        id,
        ...data,
      })

      if (result.success) {
        toast.success('Order updated successfully!')
        router.push('/admin/orders')
      } else {
        toast.error(result.error || 'Failed to update order')
      }
    } catch (error) {
      console.error('[Form] Unexpected error:', error)
      toast.error('An error occurred while updating order')
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
              Edit Order
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
                  href="/admin/orders"
                  className="hover:text-primary transition-colors"
                >
                  Orders
                </Link>
                <span>/</span>
                <span className="text-primary font-medium">Edit</span>
              </div>
              <h1 className="font-heading mt-1 text-4xl font-bold text-primary">
                Edit Order
              </h1>
            </div>
            <Button variant="outline" asChild className="shadow-md">
              <Link href="/admin/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Status */}
          <Card className="shadow-lg hover-lift">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="font-heading text-2xl text-primary">
                Order Status
              </CardTitle>
              <CardDescription className="text-base">
                Update the order status and delivery information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormSelect
                label="Order Status"
                name="status"
                options={statusOptions}
                placeholder="Select status"
                control={control}
                error={errors.status}
                description="Update order fulfillment status"
              />
            </CardContent>
          </Card>

          {/* Buyer Information */}
          <Card className="shadow-lg hover-lift">
            <CardHeader className="bg-gradient-to-r from-accent/5 to-secondary/5">
              <CardTitle className="font-heading text-2xl text-primary">
                Buyer Information
              </CardTitle>
              <CardDescription className="text-base">
                Update buyer contact information if needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormInput
                label="Buyer Name"
                name="buyer_name"
                placeholder="Enter buyer name"
                register={register}
                error={errors.buyer_name}
                description="Full name of the buyer"
              />

              <FormInput
                label="Buyer Email"
                name="buyer_email"
                type="email"
                placeholder="buyer@example.com"
                register={register}
                error={errors.buyer_email}
                description="Buyer's email address"
              />
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="shadow-lg hover-lift">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardTitle className="font-heading text-2xl text-primary">
                Shipping Address
              </CardTitle>
              <CardDescription className="text-base">
                Update the delivery address if needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormInput
                label="Street Address"
                name="shipping_address.street"
                placeholder="123 Main St"
                register={register}
                error={errors.shipping_address?.street}
                description="Street address for delivery"
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormInput
                  label="City"
                  name="shipping_address.city"
                  placeholder="New York"
                  register={register}
                  error={errors.shipping_address?.city}
                  description="City name"
                />

                <FormInput
                  label="State/Province"
                  name="shipping_address.state"
                  placeholder="NY"
                  register={register}
                  error={errors.shipping_address?.state}
                  description="State or province"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormInput
                  label="Country"
                  name="shipping_address.country"
                  placeholder="United States"
                  register={register}
                  error={errors.shipping_address?.country}
                  description="Country name"
                />

                <FormInput
                  label="Postal Code"
                  name="shipping_address.postal_code"
                  placeholder="10001"
                  register={register}
                  error={errors.shipping_address?.postal_code}
                  description="ZIP or postal code"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/orders')}
              disabled={isSubmitting}
              className="shadow-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="shadow-md min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Order'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
