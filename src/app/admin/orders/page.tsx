'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Package,
  Search,
  Eye,
  ArrowRight,
  ChevronDown,
  PackageSearch,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  progress: number
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'completed' | 'rejected'

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
} as any

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
} as any

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ────────────────────────────────────────────
   Status config
   ──────────────────────────────────────────── */
const statusConfig: Record<
  string,
  { label: string; className: string; dotColor: string }
> = {
  pending: {
    label: 'Pending',
    className:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  approved: {
    label: 'Approved',
    className:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    dotColor: 'bg-blue-500',
  },
  completed: {
    label: 'Completed',
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
function durationLabel(d: string) {
  switch (d) {
    case '3months':
      return '3 Months'
    case '6months':
      return '6 Months'
    case '1year':
      return '12 Months'
    default:
      return d
  }
}

// formatCurrency is now provided via useSettings().formatAmount

/* ────────────────────────────────────────────
   Status Badge Component
   ──────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status]
  if (!config) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {status}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className={`gap-1.5 ${config.className}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </Badge>
  )
}

/* ────────────────────────────────────────────
   Skeleton Loaders
   ──────────────────────────────────────────── */
function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-44" />
      </div>
      <Skeleton className="h-9 w-64" />
    </div>
  )
}

function TabsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-20 rounded-md" />
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      {/* Header row skeleton */}
      <div className="hidden md:grid grid-cols-[40px_1fr_1.2fr_1fr_0.8fr_0.8fr_0.8fr_1fr_0.8fr_70px] items-center gap-4 px-4 py-3 bg-muted/30 border-b border-border/60">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-18" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-12 ml-auto" />
      </div>
      {/* Row skeletons */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="hidden md:grid grid-cols-[40px_1fr_1.2fr_1fr_0.8fr_0.8fr_0.8fr_1fr_0.8fr_70px] items-center gap-4 px-4 py-3.5 border-b border-border/40 last:border-0"
        >
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-16 font-mono" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-md ml-auto" />
        </div>
      ))}
      {/* Mobile card skeletons */}
      <div className="md:hidden divide-y divide-border/40">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 font-mono" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4.5 w-36" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Empty State Component
   ──────────────────────────────────────────── */
function EmptyState({ statusFilter }: { statusFilter: StatusFilter }) {
  const isFiltered = statusFilter !== 'all'
  const title = isFiltered
    ? `No ${statusConfig[statusFilter]?.label || statusFilter} orders`
    : 'No orders yet'
  const description = isFiltered
    ? `There are no orders with "${statusConfig[statusFilter]?.label || statusFilter}" status right now. Try a different filter.`
    : 'Orders will appear here once customers start placing them.'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-lg border border-dashed border-border/80 py-16 px-6 flex flex-col items-center text-center"
    >
      <div className="h-12 w-12 rounded-xl bg-muted/80 flex items-center justify-center mb-4">
        {isFiltered ? (
          <PackageSearch className="h-6 w-6 text-muted-foreground" />
        ) : (
          <Package className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-medium text-sm mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Mobile Order Card Component
   ──────────────────────────────────────────── */
function MobileOrderCard({
  order,
  index,
  formatAmount,
}: {
  order: Order
  index: number
  formatAmount: (amount: number) => string
}) {
  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className="group"
    >
      <Link
        href={`/admin/orders/${order.id}`}
        className="block rounded-lg border border-border/60 hover:border-primary/25 hover:bg-muted/20 transition-all"
      >
        <div className="p-4 space-y-3">
          {/* Top row: ID + Status */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">
              #{order.id.slice(0, 8)}
            </span>
            <StatusBadge status={order.status} />
          </div>

          {/* Service name */}
          <p className="font-medium text-sm leading-snug">
            {order.service?.title || '—'}
          </p>

          {/* Customer + meta */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground/70">
              {order.user?.name || 'Unknown'}
            </span>
            <span className="text-border">·</span>
            <span className="truncate max-w-[140px]">{order.user?.email}</span>
          </div>

          {/* Bottom row: Duration + Date + Amount */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
              <span>{durationLabel(order.duration)}</span>
              <span className="text-border">·</span>
              <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
            </div>
            {/* Mobile Progress Bar */}
            <div className="flex items-center gap-2 flex-1 max-w-[80px]">
              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${order.progress}%` }} 
                />
              </div>
              <span className="text-[10px] font-medium">{order.progress}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-primary">
                {formatAmount(order.amount)}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminOrdersPage() {
  const { formatAmount } = useSettings()
  const [orders, setOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  /* ── Fetch orders from API ── */
  useEffect(() => {
    let cancelled = false

    async function fetchOrders() {
      setLoading(true)
      setSelectedIds(new Set())
      try {
        const url =
          statusFilter === 'all'
            ? '/api/admin/orders'
            : `/api/admin/orders?status=${statusFilter}`
        const res = await fetch(url)
        if (res.ok && !cancelled) {
          const data = await res.json()
          // Only show 'pending' and 'rejected' here (or 'all' non-projects)
          const nonProjects = data.filter((o: Order) => !['approved', 'completed'].includes(o.status))
          setOrders(nonProjects)
          setAllOrders(nonProjects)
        }
      } catch {
        // silently handle
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()

    return () => {
      cancelled = true
    }
  }, [statusFilter])

  /* ── Client-side search filter ── */
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders
    const q = searchQuery.toLowerCase().trim()
    return orders.filter((order) => {
      const matchesId = order.id.toLowerCase().includes(q)
      const matchesService = order.service?.title?.toLowerCase().includes(q)
      const matchesName = order.user?.name?.toLowerCase().includes(q)
      const matchesEmail = order.user?.email?.toLowerCase().includes(q)
      return matchesId || matchesService || matchesName || matchesEmail
    })
  }, [orders, searchQuery])

  /* ── Checkbox handling (visual only) ── */
  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)))
    }
  }, [filteredOrders, selectedIds.size])

  const allSelected =
    filteredOrders.length > 0 && selectedIds.size === filteredOrders.length
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < filteredOrders.length

  return (
    <motion.div
      className="p-4 md:p-6 space-y-5"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* ── Page Header ── */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Order Queue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage incoming orders and payments (Pending Approval).
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search orders…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/40 border-border/60 focus-visible:bg-background"
          />
        </div>
      </motion.div>

      {/* ── Status Filter Tabs ── */}
      <motion.div variants={fadeUp}>
        {/* Desktop tabs */}
        <div className="hidden sm:block">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StatusFilter)
              setSearchQuery('')
            }}
          >
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all" className="text-sm">
                All Orders
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-sm">
                Pending
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-sm">
                Rejected
              </TabsTrigger>
            </TabsList>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2">
               <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Accepted orders move to:</span>
               <Button size="sm" variant="outline" asChild className="h-7 text-[10px] px-2 rounded-lg gap-1.5 border-primary/20 hover:bg-primary/5">
                  <Link href="/admin/projects">
                     <Briefcase className="h-3 w-3 text-primary" />
                     Projects
                  </Link>
               </Button>
            </div>
          </Tabs>
        </div>

        {/* Mobile select */}
        <div className="sm:hidden">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StatusFilter)
              setSearchQuery('')
            }}
          >
            <SelectTrigger className="w-full h-9 bg-muted/40 border-border/60">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Orders ({allOrders.length})
              </SelectItem>
              <SelectItem value="pending">
                Pending ({allOrders.filter((o) => o.status === 'pending').length})
              </SelectItem>
              <SelectItem value="rejected">
                Rejected ({allOrders.filter((o) => o.status === 'rejected').length})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* ── Orders Table / Content ── */}
      <motion.div variants={fadeUp}>
        {loading ? (
          <TableSkeleton />
        ) : filteredOrders.length === 0 ? (
          <EmptyState statusFilter={statusFilter} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={statusFilter}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-lg border border-border/60 overflow-hidden"
            >
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/25 hover:bg-muted/25 border-border/60">
                      <TableHead className="w-10 pl-4">
                        <Checkbox
                          checked={allSelected}
                          {...(someSelected && { 'data-state': 'indeterminate' })}
                          onCheckedChange={toggleAll}
                          aria-label="Select all orders"
                        />
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Order ID
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Customer
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Service
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Duration
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Progress
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right pr-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order, index) => (
                      <TableRow
                        key={order.id}
                        className="border-border/40 hover:bg-muted/30 data-[state=selected]:bg-primary/5 transition-colors"
                        data-state={selectedIds.has(order.id) ? 'selected' : undefined}
                      >
                        <TableCell className="pl-4">
                          <Checkbox
                            checked={selectedIds.has(order.id)}
                            onCheckedChange={() => toggleRow(order.id)}
                            aria-label={`Select order ${order.id.slice(0, 8)}`}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(0, 8)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight truncate">
                              {order.user?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground leading-tight truncate mt-0.5">
                              {order.user?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {order.service?.title || '—'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {durationLabel(order.duration)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {formatAmount(order.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          <div className="w-24 space-y-1.5">
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-500" 
                                style={{ width: `${order.progress}%` }}
                              />
                            </div>
                            <p className="text-[10px] font-medium text-muted-foreground">
                              {order.progress}% complete
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
                            {format(new Date(order.createdAt), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                            asChild
                          >
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border/40">
                {filteredOrders.map((order, index) => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                    index={index}
                    formatAmount={formatAmount}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  )
}
