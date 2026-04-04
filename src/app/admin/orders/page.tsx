'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  PackageOpen,
  ArrowRight,
  Eye,
  ShoppingCart,
  ListFilter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
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

type StatusFilter = 'all' | 'pending' | 'approved' | 'completed' | 'rejected'

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
   Skeleton Loader
   ──────────────────────────────────────────── */
function TableSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56 mt-1" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop skeleton */}
        <div className="hidden md:block space-y-3">
          <div className="flex gap-4 pb-3 border-b">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8 ml-auto" />
            </div>
          ))}
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // Fetch all orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const url = statusFilter === 'all'
          ? '/api/admin/orders'
          : `/api/admin/orders?status=${statusFilter}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [statusFilter])

  // Filtered orders for counts
  const filteredCount = orders.length

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
          <motion.div initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/admin" className="hover:text-foreground transition-colors">
                  Admin
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">Orders</span>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} custom={1}>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Manage Orders
              </h1>
              <p className="text-muted-foreground mt-1.5">
                {loading ? 'Loading orders...' : `${filteredCount} order${filteredCount !== 1 ? 's' : ''} found`}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Orders list */}
      <section className="py-8 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
          {loading ? (
            <TableSkeleton />
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                    <PackageOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    {statusFilter === 'all'
                      ? "Orders will appear here once customers place them."
                      : `There are no orders with "${statusFilter}" status at the moment.`}
                  </p>
                  {statusFilter !== 'all' && (
                    <Button variant="outline" onClick={() => setStatusFilter('all')}>
                      Show All Orders
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        All Orders
                      </CardTitle>
                      <CardDescription>
                        {filteredCount} order{filteredCount !== 1 ? 's' : ''} total
                        {statusFilter !== 'all' && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {statusFilter}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Status filter tabs - desktop */}
                      <div className="hidden sm:block">
                        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                          <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      {/* Status filter select - mobile */}
                      <div className="sm:hidden">
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                          <SelectTrigger className="w-[140px]">
                            <ListFilter className="h-4 w-4 mr-1" />
                            <SelectValue placeholder="Filter status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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
                        {orders.map((order) => (
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
                                  <span className="ml-1.5">View</span>
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
                    {orders.map((order) => (
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
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                              <span className="font-mono">
                                #{order.id.slice(0, 8)}
                              </span>
                              <span>{order.user?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{durationLabel(order.duration)}</span>
                              <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
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
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
