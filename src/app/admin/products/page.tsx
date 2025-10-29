'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProducts, deleteProduct, getProductStats } from '@/actions'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/_components/ui/dialog'
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
  Trash2,
  Plus,
  Package,
  ShoppingCart,
  AlertCircle,
  Box,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { ProductWithStore } from '@/types'
import { PRODUCT_CATEGORIES } from '@/lib/validations/product'
import Image from 'next/image'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductWithStore[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStore | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    outOfStock: 0,
    totalInventory: 0,
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await getProducts({
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      })
      setProducts(data)

      // Fetch stats
      const productStats = await getProductStats()
      setStats(productStats)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [categoryFilter, statusFilter])

  const handleSearch = () => {
    fetchProducts()
  }

  const handleDeleteClick = (product: ProductWithStore) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return

    setDeleting(true)
    try {
      const result = await deleteProduct(selectedProduct.id)
      if (result.success) {
        toast.success('Product deleted successfully!')
        setIsDeleteModalOpen(false)
        setSelectedProduct(null)
        await fetchProducts()
      } else {
        toast.error(result.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('An error occurred while deleting product')
    } finally {
      setDeleting(false)
    }
  }

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const query = searchQuery.toLowerCase()
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold text-primary">
              Product Management
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
                <span>Products</span>
              </div>
              <h1 className="font-heading mt-1 text-3xl font-bold text-primary">
                Product Management
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin">Back</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
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
                <Package className="h-4 w-4" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-white">
                {stats.total}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift card-gradient-success border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-white">
                {stats.available}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift card-gradient-warning border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-white">
                {stats.outOfStock}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift card-gradient-primary border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                <Box className="h-4 w-4" />
                Total Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-white">
                {stats.totalInventory}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle className="font-heading text-2xl text-primary">
                All Products
              </CardTitle>

              {/* Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={categoryFilter || 'all'}
                  onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter || 'all'}
                  onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
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
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-muted-foreground">
                          {searchQuery || categoryFilter || statusFilter
                            ? 'No products found matching your filters'
                            : 'No products found'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={product.cover_image}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="max-w-[200px]">
                              <p className="font-medium text-foreground truncate">
                                {product.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {product.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              product.availability_count === 0
                                ? 'text-destructive font-medium'
                                : 'text-foreground'
                            }
                          >
                            {product.availability_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.status === 'available'
                                ? 'badge-success'
                                : 'bg-red-500 text-white'
                            }
                          >
                            {product.status === 'available'
                              ? 'Available'
                              : 'Out of Stock'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="badge-primary">
                            {product.store?.store_username || 'Unknown'}
                          </Badge>
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
                                    `/admin/products/${product.id}/details`
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
                                    `/admin/products/${product.id}/edit`
                                  )
                                }
                                className="cursor-pointer focus:bg-secondary/10 focus:text-secondary"
                              >
                                <Pencil className="mr-2 h-4 w-4 text-secondary" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(product)}
                                className="cursor-pointer text-destructive focus:bg-red-50 focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery || categoryFilter || statusFilter
                      ? 'No products found matching your filters'
                      : 'No products found'}
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <Card key={product.id} className="hover-lift">
                    <CardContent className="pt-6">
                      <div className="mb-4 flex gap-3">
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={product.cover_image}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {product.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {product.description || 'No description'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Category:
                          </span>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-semibold text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stock:</span>
                          <span
                            className={
                              product.availability_count === 0
                                ? 'text-destructive font-medium'
                                : 'text-foreground'
                            }
                          >
                            {product.availability_count}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Status:
                          </span>
                          <Badge
                            className={
                              product.status === 'available'
                                ? 'badge-success'
                                : 'bg-red-500 text-white'
                            }
                          >
                            {product.status === 'available'
                              ? 'Available'
                              : 'Out of Stock'}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            router.push(`/admin/products/${product.id}/details`)
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
                            router.push(`/admin/products/${product.id}/edit`)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? `Are you sure you want to delete "${selectedProduct.title}"? This action cannot be undone and will remove all product data.`
                : 'Are you sure you want to delete this product?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
