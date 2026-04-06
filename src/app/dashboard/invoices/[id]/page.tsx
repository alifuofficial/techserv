'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  FileText,
  Info,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Zap,
  MessageCircle,
  ExternalLink,
  Printer,
  QrCode,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useSettings } from '@/hooks/use-settings'

/* ─── Types ─── */
interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
  updatedAt: string
  order: {
    id: string
    status: string
    duration: string
    telegramUsername: string | null
    service: { id: string; title: string; slug: string; icon: string }
  }
  paymentMethod: {
    id: string
    name: string
    type: string
    details: string
    instructions: string
  } | null
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  details: string
  instructions: string
}

/* ─── Animation ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ─── Helpers ─── */
function durationLabel(d: string) {
  const map: Record<string, string> = {
    '3months': '3 Months', '6months': '6 Months', '1year': '12 Months',
    '1month': '1 Month', 'one_time': 'One-Time',
  }
  return map[d] || d
}

function parseJsonSafe(jsonStr: string): Record<string, string> {
  try {
    return JSON.parse(jsonStr) as Record<string, string>
  } catch {
    return {}
  }
}

function typeIcon(type: string) {
  const icons: Record<string, React.ElementType> = {
    bank: Building2,
    crypto: Zap,
    mobile: Smartphone,
    wallet: Wallet,
    card: CreditCard,
  }
  return icons[type] || CreditCard
}

/* ─── Status Badge ─── */
function InvoiceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { cls: string; icon: React.ElementType }> = {
    pending: {
      cls: 'bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800/40',
      icon: Clock,
    },
    paid: {
      cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800/40',
      icon: CheckCircle2,
    },
    cancelled: {
      cls: 'bg-red-50 text-red-700 ring-red-200/60 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800/40',
      icon: XCircle,
    },
  }
  const { cls, icon: Icon } = config[status] || config.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

/* ─── Info Field ─── */
function InfoField({ icon: Icon, label, value, mono }: { icon: React.ElementType; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-sm font-medium mt-0.5 ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</p>
      </div>
    </div>
  )
}

/* ─── Skeleton ─── */
function DetailSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-[140px] rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-[250px] rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function InvoiceDetailPage() {
  const params = useParams()
  const { data: session, status: authStatus } = useSession()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const { formatAmount } = useSettings()

  const id = params.id as string

  useEffect(() => {
    if (authStatus !== 'authenticated') return
    let cancelled = false
    async function fetchData() {
      try {
        const res = await fetch(`/api/invoices/${id}`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setInvoice(data)
          // Fetch payment methods if status is pending
          if (data.status === 'pending') {
            const pmRes = await fetch('/api/payment-methods')
            if (pmRes.ok && !cancelled) setPaymentMethods(await pmRes.json())
          }
          // Generate QR code
          const origin = typeof window !== 'undefined' ? window.location.origin : ''
          const qrRes = await fetch(`/api/qr?data=${encodeURIComponent(`${origin}/invoice/${data.invoiceNumber}`)}&size=180&margin=1`)
          if (qrRes.ok && !cancelled) {
            const qrData = await qrRes.json()
            setQrDataUrl(qrData.qr)
          }
        } else if (!cancelled) {
          setNotFound(true)
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [authStatus, id])

  if (loading || authStatus === 'loading') return <DetailSkeleton />
  if (!session) return null

  if (notFound || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
          <div className="h-16 w-16 rounded-2xl bg-muted/80 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h2 className="text-xl font-bold mb-2">Invoice Not Found</h2>
          <p className="text-muted-foreground mb-5 text-sm">This invoice doesn&apos;t exist or you don&apos;t have access.</p>
          <Button variant="outline" className="rounded-xl gap-2" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  const pmDetails = invoice.paymentMethod ? parseJsonSafe(invoice.paymentMethod.details) : null

  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      {/* ─── Back + Header ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <Button variant="ghost" size="sm" asChild className="mb-4 gap-1.5 text-muted-foreground hover:text-foreground -ml-2 text-sm">
          <Link href="/dashboard/invoices">
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>

        {/* Invoice Header Card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-emerald-400 to-teal-400" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-2xl font-bold font-mono tracking-tight">
                    {invoice.invoiceNumber}
                  </h1>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Created {format(new Date(invoice.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  {invoice.paidAt && (
                    <>
                      <span className="text-border">·</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Paid {format(new Date(invoice.paidAt), 'MMM d, yyyy h:mm a')}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary tabular-nums">
                  {formatAmount(invoice.amount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Amount</p>
              </div>
            </div>

            {/* QR Code + Print Actions */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/40">
              {qrDataUrl && (
                <div className="flex items-center gap-3">
                  <img
                    src={qrDataUrl}
                    alt="Invoice QR Code"
                    className="h-20 w-20 rounded-lg border border-border/60 bg-white"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <QrCode className="h-3 w-3" />
                      Scan to Verify
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      Scan to view invoice status
                    </p>
                  </div>
                </div>
              )}
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg text-xs"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Two Column Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3) — Order Details */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="lg:col-span-2">
          <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoField icon={Zap} label="Service" value={invoice.order.service.title} />
              <Separator />
              <InfoField icon={Clock} label="Duration" value={durationLabel(invoice.order.duration)} />
              <Separator />
              <InfoField icon={DollarSign} label="Amount" value={formatAmount(invoice.amount)} mono />
              <Separator />
              <InfoField icon={AlertCircle} label="Order Status" value={invoice.order.status.charAt(0).toUpperCase() + invoice.order.status.slice(1)} />
              {invoice.order.telegramUsername && (
                <>
                  <Separator />
                  <InfoField icon={MessageCircle} label="Telegram Username" value={`@${invoice.order.telegramUsername}`} mono />
                </>
              )}
              <div className="pt-4 mt-2">
                <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs" asChild>
                  <Link href={`/dashboard/orders/${invoice.order.id}`}>
                    View Order
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right (1/3) — Payment Info */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-4">
          <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {invoice.paymentMethod ? (
                <>
                  <InfoField icon={typeIcon(invoice.paymentMethod.type)} label="Payment Method" value={invoice.paymentMethod.name} />
                  <Separator />
                  <div className="py-2.5">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Method Details</p>
                    <div className="space-y-1.5">
                      {Object.entries(pmDetails || {}).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium font-mono text-xs">{val}</span>
                        </div>
                      ))}
                      {(!pmDetails || Object.keys(pmDetails).length === 0) && (
                        <p className="text-xs text-muted-foreground italic">No details available</p>
                      )}
                    </div>
                  </div>
                  {invoice.paymentMethod.instructions && (
                    <>
                      <Separator />
                      <div className="py-2.5">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Instructions</p>
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                          {invoice.paymentMethod.instructions}
                        </p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic py-2">Payment method not specified</p>
              )}

              {/* Status Notice */}
              <div className="mt-4">
                {invoice.status === 'pending' && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Awaiting Payment</p>
                      <p className="text-[11px] text-amber-600/80 dark:text-amber-500/70 mt-0.5">
                        Your payment confirmation is pending review.
                      </p>
                    </div>
                  </div>
                )}
                {invoice.status === 'paid' && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Payment Confirmed</p>
                      {invoice.paidAt && (
                        <p className="text-[11px] text-emerald-600/80 dark:text-emerald-500/70 mt-0.5">
                          Confirmed on {format(new Date(invoice.paidAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {invoice.status === 'cancelled' && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400">Payment Cancelled</p>
                      <p className="text-[11px] text-red-600/80 dark:text-red-500/70 mt-0.5">
                        This invoice has been cancelled.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── How to Pay Section (only for pending) ─── */}
      {invoice.status === 'pending' && paymentMethods.length > 0 && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Card className="border-primary/20 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary to-emerald-400" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                How to Pay
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Choose one of the payment methods below and follow the instructions.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((pm) => {
                  const details = parseJsonSafe(pm.details)
                  const TypeIcon = typeIcon(pm.type)
                  return (
                    <div
                      key={pm.id}
                      className="rounded-xl border border-border/60 p-4 hover:border-primary/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <TypeIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{pm.name}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md mt-0.5">
                            {pm.type}
                          </Badge>
                        </div>
                      </div>

                      {Object.keys(details).length > 0 && (
                        <div className="bg-muted/40 rounded-lg p-3 mb-3 space-y-1.5">
                          {Object.entries(details).map(([key, val]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="font-mono font-medium">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {pm.instructions && (
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                          {pm.instructions}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Note */}
              <div className="flex items-start gap-2.5 mt-5 p-3 rounded-xl bg-muted/40">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    After payment, upload your screenshot on the{' '}
                    <Link
                      href={`/dashboard/orders/${invoice.order.id}`}
                      className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
                    >
                      order page
                    </Link>{' '}
                    so our team can verify your payment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  )
}
