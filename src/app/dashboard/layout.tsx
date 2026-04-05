'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowRight,
  LogOut,
  ChevronLeft,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'My Orders', icon: ShoppingCart },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  // Auth guard
  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  if (status === 'loading') return null
  if (!session) return null

  const userInitial = session.user?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="min-h-screen flex">
      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-4 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              T
            </div>
          </Link>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight truncate">
              Tech<span className="text-primary">Serv</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {!collapsed && (
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
              Menu
            </p>
          )}
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Quick action */}
        {!collapsed && (
          <div className="px-3 mb-3">
            <Button asChild className="w-full rounded-xl gap-2 shadow-md shadow-primary/10">
              <Link href="/services">
                <Zap className="h-4 w-4" />
                New Order
                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </Link>
            </Button>
          </div>
        )}

        <Separator className="mx-3" />

        {/* User profile */}
        <div className="p-3">
          {!collapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/60 transition-colors">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.user?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{session.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex h-10 w-full items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hidden lg:flex shadow-sm transition-colors"
        >
          <ChevronLeft className={`h-3 w-3 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* ─── Main Content ─── */}
      <main
        className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'}`}
      >
        {children}
      </main>
    </div>
  )
}
