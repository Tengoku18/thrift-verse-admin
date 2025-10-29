'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUsers, deleteUser } from '@/actions'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card'
import { Badge } from '@/_components/ui/badge'
import { Search, MoreVertical, Eye, Pencil, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

type User = Profile & { email: string | null }

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, count: totalCount } = await getUsers()
      setUsers(data)
      setCount(totalCount || 0)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    setDeleting(true)
    try {
      const result = await deleteUser(selectedUser.id)
      if (result.success) {
        toast.success('User deleted successfully!')
        setIsDeleteModalOpen(false)
        setSelectedUser(null)
        await fetchUsers()
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

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users

    const query = searchQuery.toLowerCase()
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.store_username.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  const newThisMonth = useMemo(() => {
    return users.filter((u) => {
      const createdAt = new Date(u.created_at)
      const now = new Date()
      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      )
      return createdAt >= oneMonthAgo
    }).length
  }, [users])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold text-primary">
              User Management
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
                <span>Users</span>
              </div>
              <h1 className="font-heading mt-1 text-3xl font-bold text-primary">
                User Management
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin">Back</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/users/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="hover-lift card-gradient-info border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-white">
                {count || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift card-gradient-success border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-white">
                {users.length}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift card-gradient-warning border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                New This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold text-white">
                {newThisMonth}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="font-heading text-2xl text-primary">
                All Users
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
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
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">
                          {searchQuery
                            ? 'No users found matching your search'
                            : 'No users found'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full card-gradient-secondary text-sm font-bold text-white shadow-md">
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {user.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="badge-primary">
                            {user.store_username}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {user.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className="badge-success">{user.currency}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
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
                                    `/admin/users/${user.id}/details`
                                  )
                                }
                                className="cursor-pointer focus:bg-blue-50 focus:text-blue-700"
                              >
                                <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/admin/users/${user.id}/edit`)
                                }
                                className="cursor-pointer focus:bg-secondary/10 focus:text-secondary"
                              >
                                <Pencil className="mr-2 h-4 w-4 text-secondary" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(user)}
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
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? 'No users found matching your search'
                      : 'No users found'}
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <Card key={user.id} className="hover-lift">
                    <CardContent className="pt-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full card-gradient-secondary text-sm font-bold text-white shadow-md">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {user.name}
                          </p>
                          <Badge className="badge-primary mt-1">
                            {user.store_username}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="text-foreground">
                            {user.email || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Currency:
                          </span>
                          <Badge className="badge-success">{user.currency}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Joined:</span>
                          <span className="text-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            router.push(`/admin/users/${user.id}/details`)
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
                            router.push(`/admin/users/${user.id}/edit`)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
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
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              {selectedUser
                ? `Are you sure you want to delete ${selectedUser.name}? This action cannot be undone and will remove all user data.`
                : 'Are you sure you want to delete this user?'}
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
