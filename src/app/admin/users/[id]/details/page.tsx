'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserById, deleteUser } from '@/actions'
import { Button } from '@/_components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/_components/ui/dialog'
import { ArrowLeft, Pencil, Trash2, Loader2, User, Mail, Wallet, Calendar, MessageSquare, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

type UserWithEmail = Profile & { email: string | null }

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<UserWithEmail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserById(id)

        if (!userData) {
          toast.error('User not found')
          router.push('/admin/users')
          return
        }

        setUser(userData)
      } catch (error) {
        console.error('Failed to load user:', error)
        toast.error('Failed to load user data')
        router.push('/admin/users')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [id, router])

  const handleDelete = async () => {
    if (!user) return

    setDeleting(true)
    try {
      const result = await deleteUser(user.id)
      if (result.success) {
        toast.success('User deleted successfully!')
        router.push('/admin/users')
      } else {
        toast.error(result.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('An error occurred while deleting user')
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold text-primary">
              User Details
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
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
                <span>Details</span>
              </div>
              <h1 className="font-heading mt-1 text-3xl font-bold text-primary">
                User Details
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin/users">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <Button variant="default" asChild>
                <Link href={`/admin/users/${user.id}/edit`}>
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
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="font-heading text-2xl font-bold text-primary">
                    {user.name}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <Badge variant="secondary" className="text-sm">
                      @{user.store_username}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      {user.currency}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl text-primary">
                Account Information
              </CardTitle>
              <CardDescription>
                Personal and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </p>
                    <p className="mt-1 text-foreground">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email Address
                    </p>
                    <p className="mt-1 text-foreground">
                      {user.email || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Store Username
                    </p>
                    <p className="mt-1 text-foreground">
                      @{user.store_username}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Wallet className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Currency
                    </p>
                    <p className="mt-1 text-foreground">{user.currency}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Joined
                    </p>
                    <p className="mt-1 text-foreground">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="mt-1 text-foreground">
                      {new Date(user.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Bio
                    </p>
                    <p className="mt-1 text-foreground">
                      {user.bio || 'No bio provided'}
                    </p>
                  </div>
                </div>
              </div>

              {user.profile_image && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-start gap-3">
                    <Image className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Profile Image
                      </p>
                      <a
                        href={user.profile_image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-accent hover:underline break-all"
                      >
                        {user.profile_image}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl text-primary">
                Technical Details
              </CardTitle>
              <CardDescription>
                System information and IDs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    User ID
                  </p>
                  <p className="mt-1 font-mono text-sm text-foreground">
                    {user.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {user.name}? This action cannot be
              undone and will remove all user data.
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
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
