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
  AlertCircle,
  Calendar,
  DollarSign,
  MessageCircle,
  FileText,
  Image as ImageIcon,
  Info,
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
  service: {
    id: string
    title: string
    slug: string
    shortDescription: string
    icon: string
  }
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    telegram: string | null
  }
}

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ────────────────────────────────────────────
   Status helpers
   ──────────────────────────────────────────── */
function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'lg' }) {
  const config: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    approved: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  }

  const label = status.charAt(0).toUpperCase() + status.slice(1)
  const sizeClass = size === 'lg'
    ? 'text-sm px-3 py-1'
    : 'text-xs px-2 py-0.5'

  return (
    <Badge variant="outline" className={`${config[status] || ''} ${sizeClass}`}>
      {label}
    </Badge>
  )
}

function statusIcon(status: string) {
  switch (status) {
    case 'pending': return Clock
    case 'approved': return Info
    case 'completed': return Info
    case 'rejected': return AlertCircle
    default: return Info
  }
}

function durationLabel(d: string) {
  switch (d) {
    case '3months': return '3 Months'
    case '6months': return '6 Months'
    case '1year': return '12 Months'
    default: return d
  }
}

/* ────────────────────────────────────────────
   Skeleton Loader
   ──────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 text-sm">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Title skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 rounded-full" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Detail Row Component
   ──────────────────────────────────────────── */
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value}</p>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const id = params.id as string

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Fetch order
  useEffect(() => {
    if (status !== 'authenticated') return

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data)
        } else if (res.status === 404) {
          setNotFound(true)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [status, id])

  // Auth loading
  if (status === 'loading' || loading) {
    return <DetailSkeleton />
  }

  if (!session) return null

  // Not found state
  if (notFound || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  const StatusIcon = statusIcon(order.status)

  return (
    <div className="min-h-screen">
      <section className="border-b bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
          <motion.div initial="hidden" animate="visible">
            {/* Breadcrumb */}
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <span>/</span>
                <Link href="/dashboard/orders" className="hover:text-foreground transition-colors">
                  Orders
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">
                  #{id.slice(0, 8)}
                </span>
              </div>
            </motion.div>

            {/* Header */}
            <motion.div variants={fadeUp} custom={1} className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Order #{id.slice(0, 8)}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {order.service.title}
                </p>
              </div>
              <StatusBadge status={order.status} size="lg" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
          {/* Pending notice */}
          {order.status === 'pending' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Order Under Review
                    </p>
                    <p className="text-xs text-yellow-700/80 dark:text-yellow-400/70">
                      Your order is being reviewed by our team. We&apos;ll notify you once it&apos;s been processed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Order details cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Information */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Separator className="mb-2" />
                  <DetailRow
                    icon={FileText}
                    label="Service"
                    value={order.service.title}
                  />
                  <DetailRow
                    icon={Clock}
                    label="Duration"
                    value={durationLabel(order.duration)}
                  />
                  <DetailRow
                    icon={DollarSign}
                    label="Amount"
                    value={`$${order.amount.toFixed(2)}`}
                  />
                  <DetailRow
                    icon={Calendar}
                    label="Created"
                    value={format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                  />
                  <DetailRow
                    icon={Calendar}
                    label="Last Updated"
                    value={format(new Date(order.updatedAt), 'MMM d, yyyy h:mm a')}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact & Additional Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Contact & Files
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Separator className="mb-2" />
                  {order.telegramUsername ? (
                    <DetailRow
                      icon={MessageCircle}
                      label="Telegram Username"
                      value={order.telegramUsername}
                    />
                  ) : (
                    <div className="flex items-start gap-3 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Telegram Username</p>
                        <p className="text-sm text-muted-foreground mt-0.5 italic">Not provided</p>
                      </div>
                    </div>
                  )}

                  <DetailRow
                    icon={FileText}
                    label="Screenshot"
                    value={order.screenshot || 'Not provided'}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Admin Note */}
          {order.adminNote && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={5}
            >
              <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Admin Note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {order.adminNote}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Screenshot preview */}
          {order.screenshot && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={6}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Payment Screenshot
                  </CardTitle>
                  <CardDescription>
                    {order.screenshot}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border overflow-hidden bg-muted/30 p-4 flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">{order.screenshot}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Back button */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={7}
          >
            <Button variant="outline" asChild>
              <Link href="/dashboard/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
