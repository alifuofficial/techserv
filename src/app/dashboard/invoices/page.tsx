'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import {
  FileText,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/* ─── Types ─── */
interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
  order: {
    id: string
    status: string
    duration: string
    service: { id: string; title: string; slug: string; icon: string }
  }
  paymentMethod: { id: string; name: string; type: string } | null
}

type FilterTab = 'all' | 'pending' | 'paid' | 'cancelled'

/* ─── Animation ─── */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ─── Status Badge ─── */
function InvoiceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { cls: string; icon: React.ElementType; label: string }> = {
    pending: {
      cls: 'bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800/40',
      icon: Clock,
      label: 'Pending',
    },
    paid: {
      cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800/40',
      icon: CheckCircle2,
      label: 'Paid',
    },
    cancelled: {
      cls: 'bg-red-50 text-red-700 ring-red-200/60 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800/40',
      icon: XCircle,
      label: 'Cancelled',
    },
  }
  const { cls, icon: Icon, label } = config[status] || config.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

/* ─── Skeleton ─── */
function ListSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

/* ─── Service Icon ─── */
function serviceIcon(iconName: string, className: string = 'h-4 w-4') {
  const icons: Record<string, React.ElementType> = {
    Zap, Wallet, Globe, Code, Star, Layers, Package,
  }
  const Icon = icons[iconName] || Zap
  return <Icon className={className} />
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function InvoicesPage() {
  const { data: session, status: authStatus } = useSession()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  useEffect(() => {
    if (authStatus !== 'authenticated') return
    let cancelled = false
    async function fetchInvoices() {
      try {
        const res = await fetch('/api/invoices')
        if (res.ok && !cancelled) setInvoices(await res.json())
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false) }
    }
    fetchInvoices()
    return () => { cancelled = true }
  }, [authStatus])

  const counts = useMemo(() => ({
    all: invoices.length,
    pending: invoices.filter((i) => i.status === 'pending').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    cancelled: invoices.filter((i) => i.status === 'cancelled').length,
  }), [invoices])

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return invoices
    return invoices.filter((i) => i.status === activeFilter)
  }, [invoices, activeFilter])

  if (loading || authStatus === 'loading') return <ListSkeleton />
  if (!session) return null

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ─── Header ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
            <p className="text-sm text-muted-foreground">
              {counts.all} total invoice{counts.all !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── Filter Tabs ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-2">
        {/* Desktop tabs */}
        <div className="hidden sm:flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs tabular-nums ${
                activeFilter === tab.key ? 'text-primary font-semibold' : 'text-muted-foreground/70'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile select */}
        <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterTab)}>
          <SelectTrigger className="sm:hidden w-40 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.key} value={tab.key}>
                {tab.label} ({counts[tab.key]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* ─── Invoice List ─── */}
      {!loading && filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="h-16 w-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-5">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {activeFilter === 'all' ? 'No invoices yet' : `No ${activeFilter} invoices`}
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            {activeFilter === 'all'
              ? 'Your payment invoices will appear here after placing an order.'
              : `You don't have any ${activeFilter} invoices.`}
          </p>
          {activeFilter === 'all' && (
            <Button className="rounded-xl gap-2" asChild>
              <Link href="/services">
                <Zap className="h-4 w-4" />
                Browse Services
              </Link>
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filtered.map((invoice) => (
            <motion.div key={invoice.id} variants={fadeUp}>
              <Link href={`/dashboard/invoices/${invoice.id}`}>
                <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] hover:border-primary/20 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          {serviceIcon(invoice.order.service.icon, 'h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {invoice.order.service.title}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {invoice.invoiceNumber}
                          </p>
                        </div>
                      </div>
                      <InvoiceStatusBadge status={invoice.status} />
                    </div>

                    <div className="flex items-end justify-between mt-2">
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-primary tabular-nums">
                          ${invoice.amount.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</span>
                          {invoice.paymentMethod && (
                            <>
                              <span className="text-border">·</span>
                              <span>{invoice.paymentMethod.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
