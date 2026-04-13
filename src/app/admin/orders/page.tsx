'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  ShoppingCart,
  Search,
  PackageSearch,
  ArrowRight,
  Package,
  Trash2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

const statusPill: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-600',
  },
  approved: {
    label: 'Approved',
    className: 'bg-blue-500/10 text-blue-600',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/10 text-emerald-600',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/10 text-red-600',
  },
}

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

// OrderCard eliminated in favor of Table Row inline

function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-9 w-64" />
    </div>
  )
}

function TabsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-24 rounded-full" />
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden bg-card shadow-sm">
      <div className="p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/40 py-4 last:border-0">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ statusFilter }: { statusFilter: StatusFilter }) {
  const isFiltered = statusFilter !== 'all'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl bg-muted py-16 px-6 flex flex-col items-center text-center"
    >
      <div className="h-12 w-12 rounded-xl bg-muted-foreground/10 flex items-center justify-center mb-4">
        {isFiltered ? (
          <PackageSearch className="h-6 w-6 text-muted-foreground" />
        ) : (
          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-medium text-sm mb-1.5">
        {isFiltered
          ? `No ${statusPill[statusFilter]?.label || statusFilter} orders`
          : 'No orders yet'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {isFiltered
          ? `There are no orders with "${statusPill[statusFilter]?.label || statusFilter}" status right now. Try a different filter.`
          : 'Orders will appear here once customers start placing them.'}
      </p>
    </motion.div>
  )
}

export default function AdminOrdersPage() {
  const { formatAmount } = useSettings()
  const [orders, setOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  // Clear selections when filter changes
  useEffect(() => {
    setSelectedIds([])
  }, [statusFilter, searchQuery])

  useEffect(() => {
    let cancelled = false

    async function fetchOrders() {
      setLoading(true)
      try {
        const url =
          statusFilter === 'all'
            ? '/api/admin/orders'
            : `/api/admin/orders?status=${statusFilter}`
        const res = await fetch(url, { cache: 'no-store' })
        if (res.ok && !cancelled) {
          const data = await res.json()
          const nonProjects = data.filter(
            (o: Order) => !['approved', 'completed'].includes(o.status)
          )
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

  async function handleDeleteOrder(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to permanently delete this order?")) return;
    
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders((prev) => prev.filter(o => o.id !== id));
        setAllOrders((prev) => prev.filter(o => o.id !== id));
        setSelectedIds((prev) => prev.filter(selectedId => selectedId !== id));
        toast.success("Order deleted successfully");
      } else {
        toast.error("Failed to delete order");
      }
    } catch {
      toast.error("Network error");
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} order(s)?`)) return;

    setIsDeletingBulk(true);
    try {
      const res = await fetch('/api/admin/orders/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setOrders((prev) => prev.filter(o => !selectedIds.includes(o.id)));
        setAllOrders((prev) => prev.filter(o => !selectedIds.includes(o.id)));
        toast.success(`Successfully deleted ${selectedIds.length} order(s)`);
        setSelectedIds([]);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete orders");
      }
    } catch {
      toast.error("Network error occurred during bulk deletion.");
    } finally {
      setIsDeletingBulk(false);
    }
  }

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

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredOrders.map(o => o.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const pendingCount = allOrders.filter((o) => o.status === 'pending').length
  const rejectedCount = allOrders.filter((o) => o.status === 'rejected').length

  const tabs: { value: StatusFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: allOrders.length },
    { value: 'pending', label: 'Pending', count: pendingCount },
    { value: 'rejected', label: 'Rejected', count: rejectedCount },
  ]

  return (
    <motion.div
      className="p-4 md:p-6 space-y-5"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Orders
            </h1>
            <p className="text-sm text-muted-foreground">
              Review pending and rejected orders
            </p>
          </div>
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

      <motion.div variants={fadeUp} className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value)
              setSearchQuery('')
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 h-8 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs tabular-nums ${
                statusFilter === tab.value
                  ? 'text-primary-foreground/70'
                  : 'text-muted-foreground'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

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
              className="rounded-xl border border-border/40 shadow-sm overflow-hidden bg-card"
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[40px] px-4 text-center">
                        <Checkbox 
                          checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead className="w-[300px]">Order Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Amount / Date</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order, index) => {
                      const pill = statusPill[order.status]
                      const isSelected = selectedIds.includes(order.id)
                      
                      return (
                        <TableRow 
                          key={order.id} 
                          className={`group hover:bg-muted/20 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                          onClick={(e) => {
                            // Prevent row click if clicking checkbox or buttons
                            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.checkbox-wrap')) return;
                            window.location.href = `/admin/orders/${order.id}`;
                          }}
                        >
                          <TableCell className="px-4 text-center">
                            <div className="checkbox-wrap inline-flex items-center" onClick={(e) => e.stopPropagation()}>
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => toggleSelect(order.id)}
                                aria-label={`Select order ${order.id}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Package className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                                  {order.service?.title || 'Unknown Service'}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate uppercase tracking-widest">
                                  ID: {order.id.slice(0, 8)} • {durationLabel(order.duration)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{order.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground truncate">{order.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {pill && (
                              <Badge variant="outline" className={`px-2 py-0.5 text-xs font-semibold ${pill.className} border-transparent`}>
                                {pill.label}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <p className="text-sm font-bold tabular-nums text-primary">{formatAmount(order.amount)}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">
                              {format(new Date(order.createdAt), 'MMM d, yyyy')}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2 isolate">
                              <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                              <button onClick={(e) => handleDeleteOrder(e, order.id)} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-foreground py-3 px-6 rounded-full shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-background/20 flex items-center justify-center text-background text-xs font-bold">
                {selectedIds.length}
              </div>
              <span className="text-background text-sm font-medium">Selected</span>
            </div>
            
            <div className="w-px h-6 bg-background/20" />
            
            <button
              onClick={() => setSelectedIds([])}
              className="text-background/80 hover:text-background text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="flex items-center gap-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {isDeletingBulk ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}