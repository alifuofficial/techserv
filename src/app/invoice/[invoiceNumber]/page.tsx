'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  Printer,
  AlertCircle,
  CreditCard,
  Zap,
  Building2,
  Smartphone,
  Wallet,
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
  order: {
    id: string
    duration: string
    telegramUsername: string | null
    service: { id: string; title: string; slug: string; icon: string }
  }
  user: { id: string; name: string; email: string }
  paymentMethod: {
    id: string
    name: string
    type: string
    details: string
    instructions: string
  } | null
}

/* ─── Helpers ─── */
function durationLabel(d: string) {
  const map: Record<string, string> = {
    '3months': '3 Months', '6months': '6 Months', '1year': '12 Months',
    '1month': '1 Month', 'one_time': 'One-Time',
  }
  return map[d] || d
}

function typeIcon(type: string) {
  const icons: Record<string, React.ElementType> = { bank: Building2, crypto: Zap, mobile: Smartphone, wallet: Wallet, card: CreditCard }
  return icons[type] || CreditCard
}

function parseJsonSafe(jsonStr: string): Record<string, string> {
  try { return JSON.parse(jsonStr) as Record<string, string> } catch { return {} }
}

/* ─── Animation ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

/* ─── Status Config ─── */
const statusConfig: Record<string, { label: string; icon: React.ElementType; bg: string; border: string; text: string; desc: string }> = {
  pending: {
    label: 'Unpaid',
    icon: Clock,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    desc: 'This invoice is awaiting payment. Please complete the payment using one of the methods listed below.',
  },
  paid: {
    label: 'Paid',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    desc: 'This invoice has been paid and confirmed. Thank you for your payment!',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    desc: 'This invoice has been cancelled and is no longer valid.',
  },
}

/* ─── Skeleton ─── */
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   PUBLIC INVOICE PAGE
   ═══════════════════════════════════════════ */
export default function PublicInvoicePage() {
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { formatAmount } = useSettings()

  const invoiceNumber = params.invoiceNumber as string

  useEffect(() => {
    let cancelled = false
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoice/${invoiceNumber}`)
        if (res.ok && !cancelled) setInvoice(await res.json())
        else if (!cancelled) setNotFound(true)
      } catch { if (!cancelled) setNotFound(true) }
      finally { if (!cancelled) setLoading(false) }
    }
    fetchInvoice()
    return () => { cancelled = true }
  }, [invoiceNumber])

  if (loading) return <PageSkeleton />

  if (notFound || !invoice) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h2 className="text-xl font-bold mb-2">Invoice Not Found</h2>
          <p className="text-muted-foreground mb-6 text-sm max-w-sm">
            The invoice you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  const config = statusConfig[invoice.status] || statusConfig.pending
  const StatusIcon = config.icon
  const pmDetails = invoice.paymentMethod ? parseJsonSafe(invoice.paymentMethod.details) : null

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4" id="printable-invoice">
      <motion.div initial="hidden" animate="visible" className="w-full max-w-2xl space-y-6 motion-div-wrapper">
        {/* ─── Invoice Card ─── */}
        <Card className="border-0 shadow-lg overflow-hidden print:shadow-none print:border print:border-border invoice-card">
          {/* Header strip */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-teal-400" />

          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight">TechServ</h1>
                    <p className="text-xs text-muted-foreground">Payment Invoice</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-mono">{invoice.invoiceNumber}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Status Banner */}
            <div className={`rounded-xl p-4 border ${config.bg} ${config.border}`}>
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${config.bg}`}>
                  <StatusIcon className={`h-5 w-5 ${config.text}`} />
                </div>
                <div>
                  <h3 className={`font-bold ${config.text}`}>{config.label}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{config.desc}</p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="text-center py-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Amount Due</p>
              <p className="text-4xl font-extrabold text-primary tabular-nums">
                {formatAmount(invoice.amount)}
              </p>
              {invoice.paidAt && (
                <p className="text-xs text-emerald-600 mt-1">
                  Paid on {format(new Date(invoice.paidAt), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>

            <Separator />

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Service</p>
                <p className="font-semibold mt-1">{invoice.order.service.title}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Duration</p>
                <p className="font-semibold mt-1">{durationLabel(invoice.order.duration)}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Customer</p>
                <p className="font-semibold mt-1">{invoice.user.name}</p>
                <p className="text-xs text-muted-foreground">{invoice.user.email}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Created</p>
                <p className="font-semibold mt-1">{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</p>
              </div>
            </div>

            {/* Payment Method Info */}
            {invoice.paymentMethod && (
              <>
                <Separator />
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Payment Method</p>
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                        {(() => { const TIcon = typeIcon(invoice.paymentMethod.type); return <TIcon className="h-3.5 w-3.5 text-primary" /> })()}
                      </div>
                      <p className="text-sm font-semibold">{invoice.paymentMethod.name}</p>
                    </div>
                    {pmDetails && Object.keys(pmDetails).length > 0 && (
                      <div className="space-y-1 pl-9">
                        {Object.entries(pmDetails).map(([key, val]) => (
                          <div key={key} className="flex justify-between text-xs gap-4">
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-mono font-medium text-right">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="pt-2">
              <Separator />
              <div className="flex items-center justify-between pt-3">
                <p className="text-xs text-muted-foreground">
                  Invoice generated by TechServ
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg text-xs no-print"
                  onClick={() => {
                    window.print()
                  }}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Invoice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          
          @page {
            size: A4;
            margin: 1cm;
          }

          body, html {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
          }

          /* Hide everything by default, then show our container */
          #printable-invoice {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            align-items: flex-start !important;
            justify-content: center !important;
            min-height: 0 !important;
            height: auto !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .motion-div-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }

          .invoice-card {
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: avoid;
            margin: 0 !important;
          }

          .invoice-card :global(.p-6),
          .invoice-card :global(.pb-4),
          .invoice-card :global(.space-y-5) {
            padding: 1rem !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }

          /* Force colors for printing */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  )
}
