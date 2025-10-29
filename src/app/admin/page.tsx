import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/_components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/_components/ui/card'
import { logoutAction } from '@/actions'
import { Users, Settings, LayoutDashboard, ChevronRight, Package } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  async function handleLogout() {
    'use server'
    await logoutAction()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-5xl font-bold text-primary">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {/* Welcome back, {user.email} */}
            </p>
          </div>
          <form action={handleLogout}>
            <Button variant="outline" className="shadow-md">Sign Out</Button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin" className="group">
            <Card className="hover-lift transition-all hover:border-primary hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl card-gradient-primary shadow-lg">
                    <LayoutDashboard className="h-7 w-7 text-white" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-2 group-hover:text-primary" />
                </div>
                <CardTitle className="font-heading text-2xl text-primary mt-4">
                  Dashboard
                </CardTitle>
                <CardDescription className="text-base">
                  Overview of your admin panel
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/users" className="group">
            <Card className="hover-lift transition-all hover:border-secondary hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl card-gradient-secondary shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-2 group-hover:text-secondary" />
                </div>
                <CardTitle className="font-heading text-2xl text-secondary mt-4">
                  Users
                </CardTitle>
                <CardDescription className="text-base">
                  Manage user accounts and profiles
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/products" className="group">
            <Card className="hover-lift transition-all hover:border-blue-500 hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl card-gradient-info shadow-lg">
                    <Package className="h-7 w-7 text-white" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-2 group-hover:text-blue-500" />
                </div>
                <CardTitle className="font-heading text-2xl text-blue-600 mt-4">
                  Products
                </CardTitle>
                <CardDescription className="text-base">
                  Manage product listings and inventory
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/settings" className="group">
            <Card className="hover-lift transition-all hover:border-accent hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl card-gradient-accent shadow-lg">
                    <Settings className="h-7 w-7 text-white" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-2 group-hover:text-accent" />
                </div>
                <CardTitle className="font-heading text-2xl text-accent mt-4">
                  Settings
                </CardTitle>
                <CardDescription className="text-base">
                  Configure your application
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
