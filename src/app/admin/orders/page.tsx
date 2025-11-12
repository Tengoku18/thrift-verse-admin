'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getOrders, getOrderStats } from '@/actions'
import { Button } from '@/_components/ui/button'
import { Input } from '@/_components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/_components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/_components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/_components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import {
  Search,
  MoreVertical,
  Eye,
  Pencil,
  ShoppingBag,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  DollarSign,
  Copy,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { OrderWithDetails } from '@/types'
import { ORDER_STATUSES } from '@/lib/validations/order'
import { formatPrice } from '@/lib/utils/currency'
import { copyToClipboard } from '@/lib/utils/clipboard'
import Image from 'next/image'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
    totalRevenue: 0,
  })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await getOrders({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      })
      setOrders(data)

      // Fetch stats
      const orderStats = await getOrderStats()
      setStats(orderStats)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const handleSearch = () => {
    fetchOrders()
  }

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders
    const query = searchQuery.toLowerCase()
    return orders.filter(
      (order) =>
        order.order_code?.toLowerCase().includes(query) ||
        order.buyer_name.toLowerCase().includes(query) ||
        order.buyer_email.toLowerCase().includes(query) ||
        order.transaction_code.toLowerCase().includes(query)
    )
  }, [orders, searchQuery])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold text-primary">
              Order Management
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
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
                <span>Orders</span>
              </div>
              <h1 className="font-heading mt-1 text-3xl font-bold text-primary">
                Order Management
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin">Back</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift card-gradient-info border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-white">
                {stats.total}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift card-gradient-warning border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-white">
                {stats.pending}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift card-gradient-success border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Delivered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-white">
                {stats.delivered}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift card-gradient-primary border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-white">
                {formatPrice(stats.totalRevenue, 'NPR')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle className="font-heading text-2xl text-primary">
                All Orders
              </CardTitle>

              {/* Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={statusFilter || 'all'}
                  onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">S.N</TableHead>
                    <TableHead>Order Code</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-muted-foreground">
                          {searchQuery || statusFilter
                            ? 'No orders found matching your filters'
                            : 'No orders found'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order, index) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
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
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {order.product?.cover_image && (
                              <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={order.product.cover_image}
                                  alt={order.product.title || 'Product'}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="max-w-[200px]">
                              <p className="font-medium text-foreground truncate">
                                {order.product?.title || 'Unknown Product'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {order.buyer_name}
                            </p>
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-muted-foreground">
                                {order.buyer_email}
                              </p>
                              <button
                                onClick={() => copyToClipboard(order.buyer_email, 'Email')}
                                className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                title="Copy email"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(order.amount, order.seller?.currency || 'NPR')}
                        </TableCell>
                        <TableCell>
                          {order.quantity}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(order.status)}>
                            {formatStatus(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className="badge-primary">
                              {order.seller?.store_username || 'Unknown'}
                            </Badge>
                            {order.seller?.store_username && (
                              <button
                                onClick={() => copyToClipboard(order.seller!.store_username, 'Store username')}
                                className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                title="Copy store username"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/admin/orders/${order.id}/details`
                                  )
                                }
                                className="cursor-pointer focus:bg-blue-50 focus:text-blue-700"
                              >
                                <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/admin/orders/${order.id}/edit`
                                  )
                                }
                                className="cursor-pointer focus:bg-secondary/10 focus:text-secondary"
                              >
                                <Pencil className="mr-2 h-4 w-4 text-secondary" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter
                      ? 'No orders found matching your filters'
                      : 'No orders found'}
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="hover-lift">
                    <CardContent className="pt-6">
                      <div className="mb-4 flex gap-3">
                        {order.product?.cover_image && (
                          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={order.product.cover_image}
                              alt={order.product.title || 'Product'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {order.product?.title || 'Unknown Product'}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <p className="text-sm text-muted-foreground">
                              Order: {order.order_code || 'N/A'}
                            </p>
                            {order.order_code && (
                              <button
                                onClick={() => copyToClipboard(order.order_code!, 'Order code')}
                                className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                title="Copy order code"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Buyer:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground">
                              {order.buyer_name}
                            </span>
                            <button
                              onClick={() => copyToClipboard(order.buyer_email, 'Email')}
                              className="text-gray-400 hover:text-primary transition-colors"
                              title="Copy email"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-semibold text-foreground">
                            {formatPrice(order.amount, order.seller?.currency || 'NPR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Quantity:
                          </span>
                          <span className="text-foreground">
                            {order.quantity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={getStatusBadgeClass(order.status)}>
                            {formatStatus(order.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            router.push(`/admin/orders/${order.id}/details`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            router.push(`/admin/orders/${order.id}/edit`)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
