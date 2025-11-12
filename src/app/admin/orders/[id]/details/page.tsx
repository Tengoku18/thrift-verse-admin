'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getOrderById } from '@/actions'
import { Button } from '@/_components/ui/button'
import { Badge } from '@/_components/ui/badge'
import {
  ArrowLeft,
  Pencil,
  Loader2,
  Package,
  DollarSign,
  User,
  MapPin,
  CreditCard,
  Receipt,
  Store,
  Calendar,
  ShoppingBag,
  Copy,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils/currency'
import { copyToClipboard } from '@/lib/utils/clipboard'
import type { OrderWithDetails } from '@/types'
import Image from 'next/image'

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderData = await getOrderById(id)

        if (!orderData) {
          toast.error('Order not found')
          router.push('/admin/orders')
          return
        }

        setOrder(orderData)
      } catch (error) {
        console.error('Failed to load order:', error)
        toast.error('Failed to load order data')
        router.push('/admin/orders')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [id, router])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-white'
      case 'processing':
        return 'bg-blue-500 text-white'
      case 'shipped':
        return 'bg-purple-500 text-white'
      case 'delivered':
        return 'badge-success'
      case 'cancelled':
        return 'bg-red-500 text-white'
      case 'refunded':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold text-primary">
              Order Details
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <span>/</span>
                <Link href="/admin/orders" className="hover:text-primary transition-colors">
                  Orders
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">Details</span>
              </div>
              <h1 className="font-heading mt-2 text-3xl font-bold text-gray-900">
                Order {order.order_code || order.id}
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin/orders">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/admin/orders/${order.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Order Overview */}
          <section className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-600 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Order Overview</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Code</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900">
                    {order.order_code || 'N/A'}
                  </p>
                  {order.order_code && (
                    <button
                      onClick={() => copyToClipboard(order.order_code!, 'Order code')}
                      className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                      title="Copy order code"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge className={getStatusBadgeClass(order.status)}>
                  {formatStatus(order.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(order.amount, order.seller?.currency || 'NPR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Quantity</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.quantity}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {order.payment_method.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction Code</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {order.transaction_code}
                  </p>
                  <button
                    onClick={() => copyToClipboard(order.transaction_code, 'Transaction code')}
                    className="text-gray-400 hover:text-primary transition-colors cursor-pointer flex-shrink-0"
                    title="Copy transaction code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Product Information */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
            </div>

            {order.product ? (
              <div className="flex gap-4">
                {order.product.cover_image && (
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                    <Image
                      src={order.product.cover_image}
                      alt={order.product.title || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {order.product.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    Price: {formatPrice(order.product.price, order.seller?.currency || 'NPR')}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Product information not available</p>
            )}
          </section>

          {/* Buyer Information */}
          <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-600 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Buyer Information</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.buyer_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900">
                    {order.buyer_email}
                  </p>
                  <button
                    onClick={() => copyToClipboard(order.buyer_email, 'Email')}
                    className="text-gray-400 hover:text-primary transition-colors"
                    title="Copy email"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-600 rounded-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Street</p>
                <p className="text-lg font-medium text-gray-900">
                  {order.shipping_address.street}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">City</p>
                  <p className="text-lg font-medium text-gray-900">
                    {order.shipping_address.city}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">State</p>
                  <p className="text-lg font-medium text-gray-900">
                    {order.shipping_address.state}
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Country</p>
                  <p className="text-lg font-medium text-gray-900">
                    {order.shipping_address.country}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Postal Code</p>
                  <p className="text-lg font-medium text-gray-900">
                    {order.shipping_address.postal_code}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seller Information */}
          <section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Store className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Seller Information</h2>
            </div>

            {order.seller ? (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Store Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.seller.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Store Username</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-gray-900">
                      @{order.seller.store_username}
                    </p>
                    <button
                      onClick={() => copyToClipboard(order.seller!.store_username, 'Store username')}
                      className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                      title="Copy store username"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Seller information not available</p>
            )}
          </section>

          {/* Transaction Details */}
          <section className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-600 rounded-lg">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction Code</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium text-gray-900 truncate">
                    {order.transaction_code}
                  </p>
                  <button
                    onClick={() => copyToClipboard(order.transaction_code, 'Transaction code')}
                    className="text-gray-400 hover:text-primary transition-colors cursor-pointer flex-shrink-0"
                    title="Copy transaction code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction UUID</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium text-gray-900 truncate">
                    {order.transaction_uuid}
                  </p>
                  <button
                    onClick={() => copyToClipboard(order.transaction_uuid, 'Transaction UUID')}
                    className="text-gray-400 hover:text-primary transition-colors cursor-pointer flex-shrink-0"
                    title="Copy transaction UUID"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Created At</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(order.updated_at)}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
