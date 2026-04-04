'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  Image as ImageIcon,
  Info,
  Loader2,
  Shield,
  Save,
  CheckCircle,
  CreditCard,
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

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

function durationLabel(d: string) {
  switch (d) {
    case '3months': return '3 Months'
    case '6months': return '6 Months'
    case '1year': return '12 Months'
    default: return d
  }
}

const statusButtons: { value: string; label: string; icon: React.ElementType; className: string; activeClass: string }[] = [
  {
    value: 'pending',
    label: 'Pending',
    icon: Clock,
    className: 'text-yellow-600 hover:bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:hover:bg-yellow-900/20 dark:border-yellow-800',
    activeClass: 'bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600',
  },
  {
    value: 'approved',
    label: 'Approved',
    icon: CheckCircle2,
    className: 'text-blue-600 hover:bg-blue-50 border-blue-200 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:border-blue-800',
    activeClass: 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600',
  },
  {
    value: 'completed',
    label: 'Completed',
    icon: CheckCircle,
    className: 'text-green-600 hover:bg-green-50 border-green-200 dark:text-green-400 dark:hover:bg-green-900/20 dark:border-green-800',
    activeClass: 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    icon: XCircle,
    className: 'text-red-600 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:bg-red-900/20 dark:border-red-800',
    activeClass: 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600',
  },
]

/* ────────────────────────────────────────────
   Skeleton Loader
   ──────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 text-sm">
          <Skeleton className="h-4 w-16" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
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
        <p className="text-sm font-medium mt-0.5 break-all">{value}</p>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [noteLoading, setNoteLoading] = useState(false)
  const [adminNote, setAdminNote] = useState('')

  const id = params.id as string

  // Fetch order
  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
        setAdminNote(data.adminNote || '')
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  // Update status handler
  async function handleStatusChange(newStatus: string) {
    if (!order || newStatus === order.status || statusLoading) return

    setStatusLoading(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote }),
      })

      if (res.ok) {
        const updated = await res.json()
        setOrder(updated)
        toast({
          title: 'Status updated',
          description: `Order status changed to "${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}".`,
        })
      } else {
        const data = await res.json()
        toast({
          title: 'Failed to update',
          description: data.error || 'Something went wrong.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setStatusLoading(false)
    }
  }

  // Save note handler
  async function handleSaveNote() {
    if (!order || noteLoading) return

    setNoteLoading(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      })

      if (res.ok) {
        const updated = await res.json()
        setOrder(updated)
        toast({
          title: 'Note saved',
          description: 'Admin note has been saved successfully.',
        })
      } else {
        toast({
          title: 'Failed to save',
          description: 'Could not save the admin note.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save note. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setNoteLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return <DetailSkeleton />
  }

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
            The order you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
          <motion.div initial="hidden" animate="visible">
            {/* Breadcrumb */}
            <motion.div variants={fadeUp} custom={0} className="mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/admin" className="hover:text-foreground transition-colors">
                  Admin
                </Link>
                <span>/</span>
                <Link href="/admin/orders" className="hover:text-foreground transition-colors">
                  Orders
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">
                  #{id.slice(0, 8)}
                </span>
              </div>
            </motion.div>

            {/* Page header */}
            <motion.div variants={fadeUp} custom={1} className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Order #{id.slice(0, 8)}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {order.service.title} — {order.user.name}
                  </p>
                </div>
              </div>
              <StatusBadge status={order.status} size="lg" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 sm:py-10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left Column: Order Details ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Information Card */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Order Details
                    </CardTitle>
                    <CardDescription>
                      Order #{id} details and information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Separator className="mb-2" />
                    <DetailRow
                      icon={FileText}
                      label="Order ID"
                      value={order.id}
                    />
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

              {/* User Information Card */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={3}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Customer Information
                    </CardTitle>
                    <CardDescription>
                      Order placed by this customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Separator className="mb-2" />
                    <DetailRow
                      icon={Info}
                      label="Name"
                      value={order.user.name}
                    />
                    <DetailRow
                      icon={MessageCircle}
                      label="Email"
                      value={order.user.email}
                    />
                    {order.user.phone ? (
                      <DetailRow
                        icon={MessageCircle}
                        label="Phone"
                        value={order.user.phone}
                      />
                    ) : (
                      <div className="flex items-start gap-3 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm text-muted-foreground mt-0.5 italic">Not provided</p>
                        </div>
                      </div>
                    )}
                    {order.user.telegram ? (
                      <DetailRow
                        icon={MessageCircle}
                        label="Telegram"
                        value={`@${order.user.telegram}`}
                      />
                    ) : (
                      <div className="flex items-start gap-3 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Telegram</p>
                          <p className="text-sm text-muted-foreground mt-0.5 italic">Not provided</p>
                        </div>
                      </div>
                    )}
                    {order.telegramUsername && (
                      <DetailRow
                        icon={MessageCircle}
                        label="Telegram Username (order)"
                        value={order.telegramUsername}
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ── Right Column: Actions & Notes ── */}
            <div className="space-y-6">
              {/* Status Management Card */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={4}
              >
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Status Management
                    </CardTitle>
                    <CardDescription>
                      Change the order status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Current status indicator */}
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Current status:</span>
                        <StatusBadge status={order.status} />
                      </div>

                      {/* Status buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        {statusButtons.map((btn) => {
                          const isActive = order.status === btn.value
                          return (
                            <button
                              key={btn.value}
                              onClick={() => handleStatusChange(btn.value)}
                              disabled={isActive || statusLoading}
                              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                isActive
                                  ? btn.activeClass
                                  : statusLoading
                                    ? 'opacity-50 cursor-not-allowed border-border text-muted-foreground'
                                    : btn.className
                              }`}
                            >
                              {statusLoading && !isActive ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <btn.icon className="h-4 w-4" />
                              )}
                              {btn.label}
                              {isActive && (
                                <CheckCircle className="h-3.5 w-3.5 ml-1" />
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {statusLoading && (
                        <p className="text-xs text-muted-foreground text-center animate-pulse">
                          Updating status...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Admin Notes Card */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={5}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Admin Notes
                    </CardTitle>
                    <CardDescription>
                      Internal notes for this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-note" className="text-xs text-muted-foreground">
                        Note
                      </Label>
                      <Textarea
                        id="admin-note"
                        placeholder="Add internal notes about this order..."
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        rows={4}
                        className="resize-none text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleSaveNote}
                      disabled={noteLoading}
                      className="w-full"
                      size="sm"
                    >
                      {noteLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Note
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Proof Card */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={6}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payment Proof
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {order.screenshot ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            Payment proof received
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                          <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="text-sm text-muted-foreground truncate">
                            {order.screenshot}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground italic">
                          No payment proof uploaded
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Back button */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={7}
          >
            <Button variant="outline" asChild>
              <Link href="/admin/orders">
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
