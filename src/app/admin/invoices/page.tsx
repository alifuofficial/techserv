'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Search,
  Eye,
  ArrowRight,
  ChevronDown,
  FileText,
  FileTextIcon,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { Input } from '@/components/ui/input'
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
interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  order: {
    id: string
    duration: string
    service: {
      id: string
      title: string
      icon: string
    }
  }
  paymentMethod: {
    id: string
    name: string
    type: string
  } | null
}

type StatusFilter = 'all' | 'pending' | 'paid' | 'cancelled'

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

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
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    dotColor: 'bg-amber-500',
  },
  paid: {
    label: 'Paid',
    className:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelled',
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
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
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-44" />
      </div>
      <Skeleton className="h-9 w-64" />
    </div>
  )
}

function TabsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-20 rounded-md" />
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      {/* Header row skeleton */}
      <div className="hidden md:grid grid-cols-[1fr_1.2fr_1fr_0.8fr_1fr_0.7fr_0.7fr_80px] items-center gap-4 px-4 py-3 bg-muted/30 border-b border-border/60">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-18" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-12 ml-auto" />
      </div>
      {/* Row skeletons */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="hidden md:grid grid-cols-[1fr_1.2fr_1fr_0.8fr_1fr_0.7fr_0.7fr_80px] items-center gap-4 px-4 py-3.5 border-b border-border/40 last:border-0"
        >
          <Skeleton className="h-4 w-28 font-mono" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-18 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-24 rounded-md ml-auto" />
        </div>
      ))}
      {/* Mobile card skeletons */}
      <div className="md:hidden divide-y divide-border/40">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 font-mono" />
              <Skeleton className="h-5 w-18 rounded-full" />
            </div>
            <Skeleton className="h-4 w-36" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-20" />
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
    ? `No ${statusConfig[statusFilter]?.label || statusFilter} invoices`
    : 'No invoices yet'
  const description = isFiltered
    ? `There are no invoices with "${statusConfig[statusFilter]?.label || statusFilter}" status right now. Try a different filter.`
    : 'Invoices will appear here once orders are placed.'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-lg border border-dashed border-border/80 py-16 px-6 flex flex-col items-center text-center"
    >
      <div className="h-12 w-12 rounded-xl bg-muted/80 flex items-center justify-center mb-4">
        {isFiltered ? (
          <Search className="h-6 w-6 text-muted-foreground" />
        ) : (
          <FileTextIcon className="h-6 w-6 text-muted-foreground" />
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
   Mobile Invoice Card Component
   ──────────────────────────────────────────── */
function MobileInvoiceCard({
  invoice,
  index,
  onMarkPaid,
  markingPaidId,
}: {
  invoice: Invoice
  index: number
  onMarkPaid: (invoice: Invoice) => void
  markingPaidId: string | null
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
        href={`/admin/invoices/${invoice.id}`}
        className="block rounded-lg border border-border/60 hover:border-primary/25 hover:bg-muted/20 transition-all"
      >
        <div className="p-4 space-y-3">
          {/* Top row: Invoice # + Status */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">
              {invoice.invoiceNumber}
            </span>
            <StatusBadge status={invoice.status} />
          </div>

          {/* Customer name */}
          <p className="font-medium text-sm leading-snug">
            {invoice.user?.name || 'Unknown'}
          </p>

          {/* Service + Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground/70">
              {invoice.order?.service?.title || '—'}
            </span>
            <span className="text-border">·</span>
            <span>{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</span>
          </div>

          {/* Bottom row: Payment method + Amount */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {invoice.paymentMethod?.name || 'No method'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-primary">
                {formatAmount(invoice.amount)}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </Link>
      {/* Mark Paid button for pending */}
      {invoice.status === 'pending' && (
        <div className="px-4 pb-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            onClick={(e) => {
              e.preventDefault()
              onMarkPaid(invoice)
            }}
            disabled={markingPaidId === invoice.id}
          >
            {markingPaidId === invoice.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            Mark as Paid
          </Button>
        </div>
      )}
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminInvoicesPage() {
  const { formatAmount } = useSettings()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null)

  /* ── Fetch invoices from API ── */
  useEffect(() => {
    let cancelled = false

    async function fetchInvoices() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/invoices')
        if (res.ok && !cancelled) {
          const data = await res.json()
          setInvoices(data)
          setAllInvoices(data)
        }
      } catch {
        // silently handle
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchInvoices()

    return () => {
      cancelled = true
    }
  }, [])

  /* ── Client-side search + status filter ── */
  const filteredInvoices = useMemo(() => {
    let result = allInvoices

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.status === statusFilter)
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((inv) => {
        const matchesInvoiceNumber = inv.invoiceNumber.toLowerCase().includes(q)
        const matchesCustomerName = inv.user?.name?.toLowerCase().includes(q)
        const matchesCustomerEmail = inv.user?.email?.toLowerCase().includes(q)
        return matchesInvoiceNumber || matchesCustomerName || matchesCustomerEmail
      })
    }

    return result
  }, [allInvoices, statusFilter, searchQuery])

  /* ── Status counts ── */
  const statusCounts = useMemo(() => {
    const counts = { all: allInvoices.length, pending: 0, paid: 0, cancelled: 0 }
    for (const inv of allInvoices) {
      if (inv.status in counts) {
        counts[inv.status as keyof typeof counts]++
      }
    }
    return counts
  }, [allInvoices])

  /* ── Mark as Paid handler ── */
  const handleMarkPaid = useCallback(async (invoice: Invoice) => {
    if (markingPaidId) return
    setMarkingPaidId(invoice.id)
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })
      if (res.ok) {
        const updated = await res.json()
        setAllInvoices((prev) => prev.map((inv) => inv.id === invoice.id ? updated : inv))
        toast.success('Invoice marked as paid', {
          description: `${invoice.invoiceNumber} has been marked as paid.`,
        })
      } else {
        toast.error('Failed to update', {
          description: 'Could not mark invoice as paid.',
        })
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to update invoice status.',
      })
    } finally {
      setMarkingPaidId(null)
    }
  }, [markingPaidId])

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
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading
              ? 'Loading invoices…'
              : `${filteredInvoices.length} invoice${filteredInvoices.length !== 1 ? 's' : ''}${searchQuery.trim() ? ' found' : statusFilter !== 'all' ? ` · ${statusConfig[statusFilter]?.label}` : ' total'}`}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search invoice # or customer…"
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
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all" className="text-sm">
                All
                {!loading && statusCounts.all > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                    {statusCounts.all}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-sm">
                Pending
                {!loading && (
                  <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                    {statusCounts.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="paid" className="text-sm">
                Paid
                {!loading && (
                  <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                    {statusCounts.paid}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-sm">
                Cancelled
                {!loading && (
                  <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                    {statusCounts.cancelled}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile select */}
        <div className="sm:hidden">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full h-9 bg-muted/40 border-border/60">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Invoices ({statusCounts.all})</SelectItem>
              <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
              <SelectItem value="paid">Paid ({statusCounts.paid})</SelectItem>
              <SelectItem value="cancelled">Cancelled ({statusCounts.cancelled})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* ── Invoices Table / Content ── */}
      <motion.div variants={fadeUp}>
        {loading ? (
          <TableSkeleton />
        ) : filteredInvoices.length === 0 ? (
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
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Invoice #
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Customer
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Service
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Payment Method
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
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
                    {filteredInvoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        className="border-border/40 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            {invoice.invoiceNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight truncate">
                              {invoice.user?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground leading-tight truncate mt-0.5">
                              {invoice.user?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {invoice.order?.service?.title || '—'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {formatAmount(invoice.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {invoice.paymentMethod?.name || (
                              <span className="italic">None</span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
                            {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs" asChild>
                              <Link href={`/admin/invoices/${invoice.id}`}>
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View
                              </Link>
                            </Button>
                            {invoice.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                onClick={() => handleMarkPaid(invoice)}
                                disabled={markingPaidId === invoice.id}
                              >
                                {markingPaidId === invoice.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                )}
                                Paid
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border/40">
                {filteredInvoices.map((invoice, index) => (
                  <MobileInvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    index={index}
                    onMarkPaid={handleMarkPaid}
                    markingPaidId={markingPaidId}
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
