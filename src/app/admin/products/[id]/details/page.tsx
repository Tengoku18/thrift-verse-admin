'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProductById, deleteProduct } from '@/actions'
import { Button } from '@/_components/ui/button'
import { Badge } from '@/_components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/_components/ui/dialog'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Package,
  DollarSign,
  Tag,
  Box,
  Store,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { ProductWithStore } from '@/types'
import Image from 'next/image'

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<ProductWithStore | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await getProductById(id)

        if (!productData) {
          toast.error('Product not found')
          router.push('/admin/products')
          return
        }

        setProduct(productData)
      } catch (error) {
        console.error('Failed to load product:', error)
        toast.error('Failed to load product data')
        router.push('/admin/products')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, router])

  const handleDelete = async () => {
    if (!product) return

    setDeleting(true)
    try {
      const result = await deleteProduct(product.id)
      if (result.success) {
        toast.success('Product deleted successfully!')
        router.push('/admin/products')
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold text-primary">
              Product Details
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

  if (!product) {
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
                <Link href="/admin/products" className="hover:text-primary transition-colors">
                  Products
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">Details</span>
              </div>
              <h1 className="font-heading mt-2 text-3xl font-bold text-gray-900">
                {product.title}
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/admin/products/${product.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Product Images and Title/Description Section */}
          <section className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-600 rounded-lg">
                <ImageIcon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Product Overview</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Images */}
              <div className="space-y-4">
                {/* Cover Image */}
                <div className="py-3">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Cover Image
                  </p>
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src={product.cover_image}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Other Images */}
                {product.other_images && product.other_images.length > 0 && (
                  <>
                    <div className="border-t border-slate-200"></div>
                    <div className="py-3">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Additional Images
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {product.other_images.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                          >
                            <Image
                              src={image}
                              alt={`${product.title} - Image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column - Title and Description */}
              <div className="space-y-4">
                {/* Title */}
                <div className="py-3">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {product.title}
                  </h3>
                  <Badge variant="outline" className="text-sm">
                    {product.category}
                  </Badge>
                </div>

                {/* Description */}
                {product.description && (
                  <>
                    <div className="border-t border-slate-200"></div>
                    <div className="py-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Description</h4>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Product Information Section */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
            </div>

            <div className="space-y-0">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-600">Category</p>
                </div>
                <Badge variant="outline" className="text-sm">{product.category}</Badge>
              </div>

              <div className="border-t border-blue-200"></div>

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-gray-600">Price</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              <div className="border-t border-blue-200"></div>

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-600">Stock</p>
                </div>
                <p
                  className={`text-lg font-semibold ${
                    product.availability_count === 0
                      ? 'text-red-600'
                      : 'text-gray-900'
                  }`}
                >
                  {product.availability_count} units
                </p>
              </div>

              <div className="border-t border-blue-200"></div>

              <div className="flex items-center justify-between py-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge
                  className={
                    product.status === 'available'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }
                >
                  {product.status === 'available'
                    ? 'Available'
                    : 'Out of Stock'}
                </Badge>
              </div>
            </div>
          </section>

          {/* Store Information Section */}
          <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Store className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Store Information</h2>
            </div>

            <div className="space-y-0">
              <div className="flex items-center justify-between py-4">
                <p className="text-sm font-medium text-gray-600">Store Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {product.store?.name || 'Unknown'}
                </p>
              </div>

              <div className="border-t border-purple-200"></div>

              <div className="flex items-center justify-between py-4">
                <p className="text-sm font-medium text-gray-600">Username</p>
                <Badge variant="outline" className="text-sm">
                  {product.store?.store_username || 'Unknown'}
                </Badge>
              </div>
            </div>
          </section>

          {/* Timestamps Section */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-600 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Activity Timeline</h2>
            </div>

            <div className="space-y-0">
              <div className="flex items-center justify-between py-4">
                <p className="text-sm font-medium text-gray-600">Created</p>
                <div className="text-right">
                  <p className="text-sm text-gray-900 font-medium">
                    {new Date(product.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(product.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t border-amber-200"></div>

              <div className="flex items-center justify-between py-4">
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <div className="text-right">
                  <p className="text-sm text-gray-900 font-medium">
                    {new Date(product.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(product.updated_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{product.title}&quot;? This action
              cannot be undone and will remove all product data.
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
              onClick={handleDelete}
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
