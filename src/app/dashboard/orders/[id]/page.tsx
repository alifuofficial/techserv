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
  Copy,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

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
const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
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
  const config: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-sky-100 text-sky-700 border-sky-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }
  const emojis: Record<string, string> = { pending: '⏳', approved: '✓', completed: '✅', rejected: '✕' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border ${config[status] || ''}`}>
      <span>{emojis[status] || '•'}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

/* ─── Timeline ─── */
interface Step { label: string; desc: string; icon: React.ElementType; active: boolean; done: boolean; failed?: boolean }

function OrderTimeline({ status }: { status: string }) {
  const steps: Step[] = [
    { label: 'Order Placed', desc: 'Your order has been submitted', icon: FileText, active: true, done: true },
    { label: 'Payment Review', desc: 'Verifying your payment proof', icon: DollarSign, active: status === 'pending', done: ['approved', 'completed'].includes(status) },
    { label: 'Processing', desc: 'Our team is working on your order', icon: Clock, active: status === 'approved', done: status === 'completed' },
    { label: 'Completed', desc: 'Your service has been delivered', icon: CheckCircle2, active: status === 'completed', done: status === 'completed', failed: status === 'rejected' },
  ]

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border" />

      <div className="space-y-0">
        {steps.map((step, i) => {
          const StepIcon = step.failed ? XCircle : step.done ? CheckCircle2 : step.icon
          return (
            <div key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Circle */}
              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                step.done
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : step.failed
                  ? 'bg-red-500 border-red-500 text-white'
                  : step.active
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-background border-border text-muted-foreground'
              }`}>
                <StepIcon className="h-4.5 w-4.5" />
              </div>

              {/* Content */}
              <div className="pt-1">
                <p className={`text-sm font-semibold ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                  {step.failed && <span className="text-red-500 ml-2">(Rejected)</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </div>
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

/* ─── Skeleton ─── */
function DetailSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-4">
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[100px] rounded-xl" />
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
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-5 text-sm">This order doesn&apos;t exist or you don&apos;t have access.</p>
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/dashboard/orders"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      {/* ─── Back + Header ─── */}
      <motion.div initial="hidden" animate="visible" variants={reveal} custom={0}>
        <Button variant="ghost" size="sm" asChild className="mb-4 gap-1 text-muted-foreground hover:text-foreground -ml-2">
          <Link href="/dashboard/orders"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </Button>

        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-teal-400" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-xl font-bold">Order #{id.slice(0, 8)}</h1>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{order.service.title}</span>
                    <span>·</span>
                    <span>{durationLabel(order.duration)}</span>
                    <span>·</span>
                    <span>${order.amount.toFixed(2)}</span>
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
                {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy ID'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Timeline (3 cols) */}
        <motion.div initial="hidden" animate="visible" variants={scaleIn} custom={1} className="md:col-span-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-base font-bold mb-6">Order Progress</h2>
              <OrderTimeline status={order.status} />
            </CardContent>
          </Card>

          {/* Admin Note */}
          {order.adminNote && (
            <motion.div initial="hidden" animate="visible" variants={reveal} custom={4} className="mt-6">
              <Card className="border-primary/20 shadow-sm overflow-hidden">
                <div className="h-1 bg-primary/40" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-primary">Admin Note</h3>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {order.adminNote}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Details */}
          <motion.div initial="hidden" animate="visible" variants={scaleIn} custom={2}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-base font-bold mb-2">Details</h3>
                <Separator className="mb-1" />
                <InfoRow icon={FileText} label="Service" value={order.service.title} />
                <InfoRow icon={Clock} label="Duration" value={durationLabel(order.duration)} />
                <InfoRow icon={DollarSign} label="Amount" value={`$${order.amount.toFixed(2)}`} />
                <InfoRow icon={Calendar} label="Created" value={format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')} />
                <InfoRow icon={Calendar} label="Updated" value={format(new Date(order.updatedAt), 'MMM d, yyyy h:mm a')} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact */}
          <motion.div initial="hidden" animate="visible" variants={scaleIn} custom={3}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-base font-bold mb-2">Contact</h3>
                <Separator className="mb-1" />
                <InfoRow icon={MessageCircle} label="Telegram" value={order.telegramUsername || 'Not provided'} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick actions */}
          <motion.div initial="hidden" animate="visible" variants={scaleIn} custom={5}>
            <Card className="border-0 shadow-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-500 opacity-[0.05]" />
              <CardContent className="relative p-6">
                <h3 className="text-base font-bold mb-3">Need help?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Contact our support team via Telegram if you have any questions about your order.
                </p>
                <Button size="sm" variant="outline" className="w-full rounded-xl gap-2" asChild>
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
