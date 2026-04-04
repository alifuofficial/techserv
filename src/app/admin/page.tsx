'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  DollarSign,
  Users,
  ArrowRight,
  PackageOpen,
  Eye,
  LayoutDashboard,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface Stats {
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  completedOrders: number
  rejectedOrders: number
  totalRevenue: number
  totalUsers: number
}

interface Order {
  id: string
  status: string
  duration: string
  amount: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  service: {
    id: string
    title: string
    slug: string
  }
}

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ────────────────────────────────────────────
   Status badge helper
   ──────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    approved: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  }

  const label = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <Badge variant="outline" className={config[status] || ''}>
      {label}
    </Badge>
  )
}

/* ────────────────────────────────────────────
   Duration label helper
   ──────────────────────────────────────────── */
function durationLabel(d: string) {
  switch (d) {
    case '3months': return '3 Months'
    case '6months': return '6 Months'
    case '1year': return '12 Months'
    default: return d
  }
}

/* ────────────────────────────────────────────
   Skeleton Loaders
   ──────────────────────────────────────────── */
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RecentOrdersSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ────────────────────────────────────────────
   Stat Card Component
   ──────────────────────────────────────────── */
function StatCard({
  title,
  value,
  icon: Icon,
  accent,
  delay,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  accent?: string
  delay: number
}) {
  return (
    <motion.div variants={fadeUp} custom={delay}>
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                accent || 'bg-primary/10 text-primary'
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch stats and recent orders
  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/orders'),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setRecentOrders(ordersData.slice(0, 5))
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
          <motion.div initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-xs">
                Admin Panel
              </Badge>
            </motion.div>
            <motion.div variants={fadeUp} custom={1}>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1.5">
                Manage your service platform
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
          {/* ── Stats Cards ── */}
          {loading || !stats ? (
            <StatsSkeleton />
          ) : (
            <>
              <motion.div
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <StatCard
                  title="Total Orders"
                  value={stats.totalOrders}
                  icon={ShoppingCart}
                  delay={0}
                />
                <StatCard
                  title="Pending Orders"
                  value={stats.pendingOrders}
                  icon={Clock}
                  accent="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                  delay={1}
                />
                <StatCard
                  title="Completed Orders"
                  value={stats.completedOrders}
                  icon={CheckCircle2}
                  accent="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  delay={2}
                />
                <StatCard
                  title="Total Revenue"
                  value={`$${stats.totalRevenue.toFixed(2)}`}
                  icon={DollarSign}
                  delay={3}
                />
              </motion.div>

              {/* Quick stats row */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={4}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Users</p>
                      <p className="text-xl font-bold">{stats.totalUsers}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Approved Orders</p>
                      <p className="text-xl font-bold">{stats.approvedOrders}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rejected Orders</p>
                      <p className="text-xl font-bold">{stats.rejectedOrders}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {/* ── Recent Orders ── */}
          {loading ? (
            <RecentOrdersSkeleton />
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={5}
            >
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                        Recent Orders
                      </CardTitle>
                      <CardDescription>
                        Latest orders across all users
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin/orders">
                        Manage All Orders
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                        <PackageOpen className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-1">No orders yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Orders will appear here once customers place them.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order ID</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Service</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentOrders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                  #{order.id.slice(0, 8)}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{order.user?.name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {order.service.title}
                                </TableCell>
                                <TableCell>{durationLabel(order.duration)}</TableCell>
                                <TableCell className="font-medium">
                                  ${order.amount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={order.status} />
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/admin/orders/${order.id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden space-y-3">
                        {recentOrders.map((order) => (
                          <Link
                            key={order.id}
                            href={`/admin/orders/${order.id}`}
                            className="block"
                          >
                            <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm truncate">
                                    {order.service.title}
                                  </p>
                                  <StatusBadge status={order.status} />
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="font-mono">
                                    #{order.id.slice(0, 8)}
                                  </span>
                                  <span>{order.user?.name || 'Unknown'}</span>
                                  <span>{format(new Date(order.createdAt), 'MMM d')}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <span className="font-semibold text-sm">
                                  ${order.amount.toFixed(2)}
                                </span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
