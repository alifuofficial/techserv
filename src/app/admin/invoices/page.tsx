'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Search,
  FileText,
  CheckCircle2,
  Loader2,
  CreditCard,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/hooks/use-settings'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

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

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
}

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'cancelled', label: 'Cancelled' },
]

const statusPillStyles: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600',
  paid: 'bg-emerald-500/10 text-emerald-600',
  cancelled: 'bg-red-500/10 text-red-600',
}

const statusDotStyles: Record<string, string> = {
  pending: 'bg-amber-500',
  paid: 'bg-emerald-500',
  cancelled: 'bg-red-500',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  cancelled: 'Cancelled',
}

function StatusPill({ status }: { status: string }) {
  const pill = statusPillStyles[status]
  const dot = statusDotStyles[status]
  const label = statusLabels[status]
  if (!pill) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
        {status}
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <Skeleton className="h-9 w-72" />
    </div>
  )
}

function FilterSkeleton() {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-md" />
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 font-mono" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-44" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

function EmptyState({ statusFilter }: { statusFilter: StatusFilter }) {
  const isFiltered = statusFilter !== 'all'
  const title = isFiltered
    ? `No ${statusLabels[statusFilter] || statusFilter} invoices`
    : 'No invoices yet'
  const description = isFiltered
    ? `There are no invoices with "${statusLabels[statusFilter] || statusFilter}" status right now. Try a different filter.`
    : 'Invoices will appear here once orders are placed.'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-dashed border-border/80 py-16 px-6 flex flex-col items-center text-center"
    >
      <div className="h-12 w-12 rounded-xl bg-muted/80 flex items-center justify-center mb-4">
        {isFiltered ? (
          <Search className="h-6 w-6 text-muted-foreground" />
        ) : (
          <FileText className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-medium text-sm mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

function InvoiceCard({
  invoice,
  index,
  onMarkPaid,
  markingPaidId,
  formatAmount,
}: {
  invoice: Invoice
  index: number
  onMarkPaid: (invoice: Invoice) => void
  markingPaidId: string | null
  formatAmount: (amount: number) => string
}) {
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible">
      <Link
        href={`/admin/invoices/${invoice.id}`}
        className="group block rounded-xl border border-border/40 p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">
              {invoice.invoiceNumber}
            </span>
            <StatusPill status={invoice.status} />
          </div>

          <div>
            <p className="text-sm font-medium leading-snug">
              {invoice.user?.name || 'Unknown'}
            </p>
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">
              {invoice.user?.email}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">
              {invoice.order?.service?.title || '—'}
            </span>
            <span className="text-border">·</span>
            <span>{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="h-3 w-3" />
              <span>{invoice.paymentMethod?.name || 'No method'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tabular-nums text-primary">
                {formatAmount(invoice.amount)}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </Link>
      {invoice.status === 'pending' && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
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

export default function AdminInvoicesPage() {
  const { formatAmount } = useSettings()
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchInvoices() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/invoices')
        if (res.ok && !cancelled) {
          const data = await res.json()
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

  const filteredInvoices = useMemo(() => {
    let result = allInvoices

    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.status === statusFilter)
    }

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

  const statusCounts = useMemo(() => {
    const counts = { all: allInvoices.length, pending: 0, paid: 0, cancelled: 0 }
    for (const inv of allInvoices) {
      if (inv.status in counts) {
        counts[inv.status as keyof typeof counts]++
      }
    }
    return counts
  }, [allInvoices])

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
      className="p-4 md:p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FileText className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Invoices</h1>
            <p className="text-sm text-muted-foreground">
              {loading
                ? 'Loading invoices…'
                : `${filteredInvoices.length} invoice${filteredInvoices.length !== 1 ? 's' : ''}${searchQuery.trim() ? ' found' : statusFilter !== 'all' ? ` · ${statusLabels[statusFilter]}` : ' total'}`}
            </p>
          </div>
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

      <motion.div variants={fadeUp} className="flex items-center gap-2">
        {STATUS_OPTIONS.map(({ key, label }) => {
          const isActive = statusFilter === key
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {label}
              {!loading && (
                <span className={`text-xs tabular-nums ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                  {statusCounts[key as keyof typeof statusCounts]}
                </span>
              )}
            </button>
          )
        })}
      </motion.div>

      <motion.div variants={fadeUp}>
        {loading ? (
          <div className="space-y-4">
            <FilterSkeleton />
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState statusFilter={statusFilter} />
        ) : (
          <div className="grid gap-3">
            {filteredInvoices.map((invoice, index) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                index={index}
                onMarkPaid={handleMarkPaid}
                markingPaidId={markingPaidId}
                formatAmount={formatAmount}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}