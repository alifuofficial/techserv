'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  CreditCard,
  User,
  ChevronRight,
  Loader2,
  Clock,
  Printer,
  QrCode,
  Trash2,
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
import { Separator } from '@/components/ui/separator'

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
    phone: string | null
    telegram: string | null
  }
  order: {
    id: string
    duration: string
    amount: number
    status: string
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
    details: string
    instructions: string
  } | null
}

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ────────────────────────────────────────────
   Status Configuration
   ──────────────────────────────────────────── */
const statusConfig: Record<
  string,
  {
    label: string
    badgeClass: string
    dotColor: string
    icon: React.ElementType
  }
> = {
  pending: {
    label: 'Pending',
    badgeClass:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    dotColor: 'bg-amber-500',
    icon: Clock,
  },
  paid: {
    label: 'Paid',
    badgeClass:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
    dotColor: 'bg-red-500',
    icon: XCircle,
  },
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
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

/* ────────────────────────────────────────────
   Status Badge Component
   ──────────────────────────────────────────── */
function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'lg' }) {
  const config = statusConfig[status]
  if (!config) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {status}
      </Badge>
    )
  }

  const sizeClass =
    size === 'lg'
      ? 'text-sm px-3.5 py-1.5 rounded-full'
      : 'text-xs px-2.5 py-0.5 rounded-full'

  return (
    <Badge variant="outline" className={`gap-1.5 ${config.badgeClass} ${sizeClass}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </Badge>
  )
}

/* ────────────────────────────────────────────
   Info Field Component
   ──────────────────────────────────────────── */
function InfoField({
  label,
  value,
  mono = false,
  highlight = false,
  children,
}: {
  label: string
  value?: string
  mono?: boolean
  highlight?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="min-w-0 py-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </p>
      {children || (
        <p
          className={`text-sm leading-snug ${
            mono ? 'font-mono' : 'font-medium'
          } ${highlight ? 'text-lg font-bold text-primary' : 'text-foreground'}`}
        >
          {value || '—'}
        </p>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────
   Skeleton Loader
   ──────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-14" />
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <Skeleton className="h-4 w-16" />
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminInvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const id = params.id as string

  // Fetch invoice
  useEffect(() => {
    let cancelled = false

    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/admin/invoices/${id}`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setInvoice(data)
        } else if (!cancelled) {
          setNotFound(true)
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchInvoice()

    // Generate QR code after invoice loads
    const generateQr = async () => {
      if (!invoice?.invoiceNumber || cancelled) return
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const qrRes = await fetch(`/api/qr?data=${encodeURIComponent(`${origin}/invoice/${invoice.invoiceNumber}`)}&size=180&margin=1`)
        if (qrRes.ok && !cancelled) {
          const qrData = await qrRes.json()
          setQrDataUrl(qrData.qr)
        }
      } catch { /* ignore */ }
    }
    setTimeout(generateQr, 100)

    return () => {
      cancelled = true
    }
  }, [id, invoice?.invoiceNumber])

  // Update status
  async function handleStatusChange(newStatus: string) {
    if (!invoice || newStatus === invoice.status || statusLoading) return

    setStatusLoading(true)
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const updated = await res.json()
        setInvoice(updated)
        toast.success('Status updated', {
          description: `Invoice status changed to ${statusConfig[newStatus]?.label || newStatus}.`,
        })
      } else {
        const data = await res.json()
        toast.error('Failed to update', {
          description: data.error || 'Something went wrong.',
        })
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to update invoice status. Please try again.',
      })
    } finally {
      setStatusLoading(false)
    }
  }

  // Delete invoice
  async function handleDeleteInvoice() {
    if (!window.confirm("Are you sure you want to permanently delete this invoice? This cannot be undone.")) return;
    
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success("Invoice deleted forever.");
        router.push("/admin/invoices");
      } else {
        const data = await res.json();
        toast.error("Failed to delete", { description: data.error || "Something went wrong." });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setStatusLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return <DetailSkeleton />
  }

  // Not found state
  if (notFound || !invoice) {
    return (
      <div className="p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center text-center py-20"
        >
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
            <AlertCircle className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-1.5">Invoice Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            The invoice you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button variant="outline" asChild>
            <Link href="/admin/invoices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* ── 1. Breadcrumb + Back ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Admin
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/admin/invoices" className="hover:text-foreground transition-colors">
            Invoices
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">
            {invoice.invoiceNumber}
          </span>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -mr-2">
          <Link href="/admin/invoices">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Back to Invoices</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
      </motion.div>

      {/* ── 2. Invoice Header ── */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                Invoice{' '}
                <span className="font-mono text-lg text-muted-foreground">
                  {invoice.invoiceNumber}
                </span>
              </h1>
              <StatusBadge status={invoice.status} size="lg" />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {invoice.order?.service?.title || 'Unknown service'}
            </p>
          </div>
        </div>
        <p className="text-2xl font-bold text-primary tabular-nums sm:text-right whitespace-nowrap">
          {formatCurrency(invoice.amount)}
        </p>
      </motion.div>

      {/* QR Code + Print Bar */}
      <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
        {qrDataUrl && (
          <div className="flex items-center gap-3">
            <img
              src={qrDataUrl}
              alt="Invoice QR Code"
              className="h-16 w-16 rounded-lg border border-border/60 bg-white"
            />
            <div>
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <QrCode className="h-3 w-3" />
                Scan to Verify
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Public link: /invoice/{invoice.invoiceNumber}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-lg text-xs ml-auto"
          onClick={() => window.print()}
        >
          <Printer className="h-3.5 w-3.5" />
          Print Invoice
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2 rounded-lg text-xs"
          onClick={handleDeleteInvoice}
          disabled={statusLoading}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Invoice
        </Button>
      </motion.div>

      {/* ── 3. Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Order Details */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="Service" value={invoice.order?.service?.title} />
                  <InfoField label="Duration" value={durationLabel(invoice.order?.duration)} />
                  <InfoField
                    label="Order Amount"
                    value={formatCurrency(invoice.order?.amount)}
                    highlight
                  />
                  <InfoField label="Order Status">
                    <span className={`text-sm font-medium capitalize ${invoice.order?.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                      {invoice.order?.status || '—'}
                    </span>
                  </InfoField>
                  <InfoField
                    label="Created"
                    value={format(new Date(invoice.createdAt), 'MMM d, yyyy h:mm a')}
                  />
                  <InfoField
                    label="Last Updated"
                    value={format(new Date(invoice.updatedAt), 'MMM d, yyyy h:mm a')}
                    mono
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Customer Information */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="Full Name" value={invoice.user?.name} />
                  <InfoField label="Email" value={invoice.user?.email} mono />
                  <InfoField label="Phone" value={invoice.user?.phone || undefined}>
                    {invoice.user?.phone ? (
                      <p className="text-sm font-medium">{invoice.user.phone}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Not provided</p>
                    )}
                  </InfoField>
                  <InfoField label="Telegram" value={invoice.user?.telegram ? `@${invoice.user.telegram}` : undefined}>
                    {invoice.user?.telegram ? (
                      <p className="text-sm font-medium">@{invoice.user.telegram}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Not provided</p>
                    )}
                  </InfoField>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">
          {/* Card 3: Payment Information */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Method */}
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Payment Method
                  </p>
                  {invoice.paymentMethod ? (
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/50 border border-border/40">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{invoice.paymentMethod.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{invoice.paymentMethod.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-muted/40">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="text-sm text-muted-foreground italic">
                        No payment method assigned
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Paid Date */}
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Paid Date
                  </p>
                  {invoice.paidAt ? (
                    <p className="text-sm font-medium tabular-nums">
                      {format(new Date(invoice.paidAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Not yet paid
                    </p>
                  )}
                </div>

                {/* Invoice Status Summary */}
                <Separator />
                <div className="px-3 py-2.5 rounded-lg bg-muted/50 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Current Status</span>
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: Actions */}
          {invoice.status === 'pending' && (
            <motion.div variants={fadeUp}>
              <Card className="border-primary/25 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Invoice Actions
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Update the invoice status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    disabled={statusLoading}
                    onClick={() => handleStatusChange('paid')}
                  >
                    {statusLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    disabled={statusLoading}
                    onClick={() => handleStatusChange('cancelled')}
                  >
                    {statusLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Mark as Cancelled
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
