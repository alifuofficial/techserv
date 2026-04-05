'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  MessageCircle,
  FileText,
  Info,
  ArrowRight,
  ArrowUpRight,
  Copy,
  ExternalLink,
  Zap,
  Globe,
  Shield,
  Code,
  Star,
  Layers,
  Package,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

/* ─── Types ─── */
interface Order {
  id: string
  status: string
  duration: string
  amount: number
  telegramUsername: string | null
  screenshot: string | null
  adminNote: string | null
  createdAt: string
  updatedAt: string
  service: { id: string; title: string; slug: string; icon: string }
  user: { id: string; name: string; email: string; phone: string | null; telegram: string | null }
}

/* ─── Animation ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
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

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { cls: string; icon: React.ElementType }> = {
    pending: { cls: 'bg-amber-50 text-amber-700 ring-amber-200/60', icon: Clock },
    approved: { cls: 'bg-sky-50 text-sky-700 ring-sky-200/60', icon: CheckCircle2 },
    completed: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60', icon: CheckCircle2 },
    rejected: { cls: 'bg-red-50 text-red-700 ring-red-200/60', icon: XCircle },
  }
  const { cls, icon: Icon } = config[status] || config.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function serviceIcon(iconName: string, className: string = "h-5 w-5") {
  const icons: Record<string, React.ElementType> = {
    Zap, Globe, Shield, Code, Star, Layers,
    Package, Activity,
  }
  const Icon = icons[iconName] || Zap
  return <Icon className={className} />
}

/* ─── Order Timeline ─── */
function OrderTimeline({ status }: { status: string }) {
  const steps = [
    { label: 'Order Placed', desc: 'Your order has been submitted', icon: FileText, done: true, failed: false },
    { label: 'Payment Review', desc: 'Verifying your payment proof', icon: DollarSign, active: status === 'pending', done: ['approved', 'completed'].includes(status), failed: false },
    { label: 'Processing', desc: 'Our team is working on your order', icon: Clock, active: status === 'approved', done: status === 'completed', failed: false },
    { label: 'Completed', desc: 'Your service has been delivered', icon: CheckCircle2, active: status === 'completed', done: status === 'completed', failed: status === 'rejected' },
  ]

  return (
    <div className="relative">
      <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
      <div className="space-y-0">
        {steps.map((step, i) => {
          const StepIcon = step.failed ? XCircle : step.done ? CheckCircle2 : step.icon
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
              className="relative flex gap-4 pb-8 last:pb-0"
            >
              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                step.done
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : step.failed
                  ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20'
                  : step.active
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-background border-border/80 text-muted-foreground'
              }`}>
                <StepIcon className="h-4.5 w-4.5" />
              </div>
              <div className="pt-1.5">
                <p className={`text-sm font-semibold transition-colors ${step.active || step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                  {step.failed && <span className="text-red-500 ml-2">(Rejected)</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Info Row ─── */
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

/* ─── Skeleton ─── */
function DetailSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-[250px] rounded-xl" />
          <Skeleton className="h-[150px] rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  const id = params.id as string

  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (res.ok && !cancelled) setOrder(await res.json())
        else if (!cancelled) setNotFound(true)
      } catch { if (!cancelled) setNotFound(true) }
      finally { if (!cancelled) setLoading(false) }
    }
    fetchOrder()
    return () => { cancelled = true }
  }, [status, id])

  if (loading || status === 'loading') return <DetailSkeleton />
  if (!session) return null

  if (notFound || !order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
          <div className="h-16 w-16 rounded-2xl bg-muted/80 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-5 text-sm">This order doesn&apos;t exist or you don&apos;t have access.</p>
          <Button variant="outline" className="rounded-xl gap-2" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      {/* ─── Back + Header ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <Button variant="ghost" size="sm" asChild className="mb-4 gap-1.5 text-muted-foreground hover:text-foreground -ml-2 text-sm">
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>

        {/* Order Header Card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-emerald-400 to-teal-400" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
                  {serviceIcon(order.service.icon, 'h-6 w-6 text-primary')}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-xl font-bold">Order #{id.slice(0, 8)}</h1>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{order.service.title}</span>
                    <span className="text-border">·</span>
                    <span>{durationLabel(order.duration)}</span>
                    <span className="text-border">·</span>
                    <span className="font-semibold text-foreground">${order.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-lg gap-1.5 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(order.id)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy ID'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Timeline (3 cols) */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="lg:col-span-3 space-y-6">
          <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Order Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <OrderTimeline status={order.status} />
            </CardContent>
          </Card>

          {/* Admin Note */}
          {order.adminNote && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
              <Card className="border-primary/20 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary to-emerald-400" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Info className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-primary">Admin Note</h3>
                      <p className="text-[11px] text-muted-foreground">Message from our team</p>
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-4 mt-2">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {order.adminNote}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <InfoRow icon={FileText} label="Service" value={order.service.title} />
                <Separator />
                <InfoRow icon={Clock} label="Duration" value={durationLabel(order.duration)} />
                <Separator />
                <InfoRow icon={DollarSign} label="Amount" value={`$${order.amount.toFixed(2)}`} />
                <Separator />
                <InfoRow icon={Calendar} label="Created" value={format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')} />
                <Separator />
                <InfoRow icon={Calendar} label="Last Updated" value={format(new Date(order.updatedAt), 'MMM d, yyyy h:mm a')} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <InfoRow icon={MessageCircle} label="Telegram" value={order.telegramUsername ? `@${order.telegramUsername}` : 'Not provided'} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Invoice Card */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold">Invoice</h3>
                    <p className="text-[11px] text-muted-foreground">View payment details</p>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs shrink-0" asChild>
                    <Link href="/dashboard/invoices">
                      View
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Need Help Card */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
            <Card className="border-0 shadow-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-500/5" />
              <CardContent className="relative p-5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-1.5">Need help with this order?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Contact our support team if you have any questions about your order status or delivery.
                </p>
                <Button size="sm" variant="outline" className="w-full rounded-xl gap-2 text-xs" asChild>
                  <Link href="/services">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
