'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  StickyNote,
  User,
  ChevronRight,
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
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
    buttonClass: string
    buttonActiveClass: string
  }
> = {
  pending: {
    label: 'Pending',
    badgeClass:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800',
    dotColor: 'bg-yellow-500',
    icon: Clock,
    buttonClass:
      'text-yellow-700 hover:bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:hover:bg-yellow-950/30 dark:border-yellow-800',
    buttonActiveClass:
      'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-950/60 dark:border-yellow-700 dark:text-yellow-200',
  },
  approved: {
    label: 'Approved',
    badgeClass:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    dotColor: 'bg-blue-500',
    icon: CheckCircle,
    buttonClass:
      'text-blue-700 hover:bg-blue-50 border-blue-200 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:border-blue-800',
    buttonActiveClass:
      'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950/60 dark:border-blue-700 dark:text-blue-200',
  },
  completed: {
    label: 'Completed',
    badgeClass:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
    dotColor: 'bg-green-500',
    icon: CheckCircle2,
    buttonClass:
      'text-green-700 hover:bg-green-50 border-green-200 dark:text-green-400 dark:hover:bg-green-950/30 dark:border-green-800',
    buttonActiveClass:
      'bg-green-100 border-green-300 text-green-800 dark:bg-green-950/60 dark:border-green-700 dark:text-green-200',
  },
  rejected: {
    label: 'Rejected',
    badgeClass:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
    dotColor: 'bg-red-500',
    icon: XCircle,
    buttonClass:
      'text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:bg-red-950/30 dark:border-red-800',
    buttonActiveClass:
      'bg-red-100 border-red-300 text-red-800 dark:bg-red-950/60 dark:border-red-700 dark:text-red-200',
  },
}

const statusList = ['pending', 'approved', 'completed', 'rejected']

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
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
   Info Field Component (label on top, value below)
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
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminOrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [noteLoading, setNoteLoading] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const id = params.id as string

  // Fetch order
  useEffect(() => {
    let cancelled = false

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setOrder(data)
          setAdminNote(data.adminNote || '')
        } else if (!cancelled) {
          setNotFound(true)
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOrder()

    return () => {
      cancelled = true
    }
  }, [id])

  // Update status
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
        toast.success('Status updated', {
          description: `Order status changed to ${statusConfig[newStatus]?.label || newStatus}.`,
        })
      } else {
        const data = await res.json()
        toast.error('Failed to update', {
          description: data.error || 'Something went wrong.',
        })
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to update order status. Please try again.',
      })
    } finally {
      setStatusLoading(false)
    }
  }

  // Save note
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
        toast.success('Note saved', {
          description: 'Admin note has been saved successfully.',
        })
      } else {
        toast.error('Failed to save', {
          description: 'Could not save the admin note.',
        })
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to save note. Please try again.',
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
          <h2 className="text-xl font-semibold mb-1.5">Order Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            The order you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button variant="outline" asChild>
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
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* ── 1. Breadcrumb + Back ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/admin"
            className="hover:text-foreground transition-colors"
          >
            Admin
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href="/admin/orders"
            className="hover:text-foreground transition-colors"
          >
            Orders
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">
            #{id.slice(0, 8)}
          </span>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -mr-2">
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Back to Orders</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
      </motion.div>

      {/* ── 2. Order Header ── */}
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
                Order{' '}
                <span className="font-mono text-lg text-muted-foreground">
                  #{id.slice(0, 8)}
                </span>
              </h1>
              <StatusBadge status={order.status} size="lg" />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {order.service.title}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums sm:text-right whitespace-nowrap">
          Created {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
        </p>
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
                  <InfoField label="Service Name" value={order.service.title} />
                  <InfoField label="Duration" value={durationLabel(order.duration)} />
                  <InfoField
                    label="Amount"
                    value={`$${order.amount.toFixed(2)}`}
                    highlight
                  />
                  <InfoField
                    label="Created"
                    value={format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                  />
                  <InfoField
                    label="Last Updated"
                    value={format(new Date(order.updatedAt), 'MMM d, yyyy h:mm a')}
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
                {/* Avatar + name at top */}
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border/60">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {getInitials(order.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">
                      {order.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {order.user.email}
                    </p>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="Full Name" value={order.user.name} />
                  <InfoField label="Email" value={order.user.email} mono />
                  <InfoField
                    label="Phone"
                    value={order.user.phone || undefined}
                  >
                    {order.user.phone ? (
                      <p className="text-sm font-medium">{order.user.phone}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Not provided
                      </p>
                    )}
                  </InfoField>
                  <InfoField
                    label="Telegram"
                    value={order.user.telegram ? `@${order.user.telegram}` : undefined}
                  >
                    {order.user.telegram ? (
                      <p className="text-sm font-medium">@{order.user.telegram}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Not provided
                      </p>
                    )}
                  </InfoField>
                  {order.telegramUsername &&
                    order.telegramUsername !== order.user.telegram && (
                      <InfoField
                        label="Order Telegram"
                        value={
                          order.telegramUsername.startsWith('@')
                            ? order.telegramUsername
                            : `@${order.telegramUsername}`
                        }
                        mono
                      />
                    )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">
          {/* Card 3: Status Management */}
          <motion.div variants={fadeUp}>
            <Card className="border-primary/25 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Status Management
                </CardTitle>
                <CardDescription className="text-xs">
                  Change the current order status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current status indicator */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/50 border border-border/40">
                  <span className="text-xs text-muted-foreground">Current:</span>
                  <StatusBadge status={order.status} />
                </div>

                {/* 2x2 status button grid */}
                <div className="grid grid-cols-2 gap-2">
                  {statusList.map((key) => {
                    const config = statusConfig[key]
                    if (!config) return null
                    const isActive = order.status === key
                    const Icon = config.icon

                    return (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        disabled={isActive || statusLoading}
                        className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg border text-sm font-medium transition-all min-h-[44px] ${
                          isActive
                            ? config.buttonActiveClass
                            : statusLoading
                              ? 'opacity-50 cursor-not-allowed border-border text-muted-foreground'
                              : config.buttonClass
                        }`}
                      >
                        {statusLoading && !isActive ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                        <span>{config.label}</span>
                        {isActive && (
                          <CheckCircle2 className="h-3.5 w-3.5 ml-0.5 opacity-70" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {statusLoading && (
                  <p className="text-[11px] text-muted-foreground text-center animate-pulse">
                    Updating status…
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: Admin Notes */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                  Admin Notes
                </CardTitle>
                <CardDescription className="text-xs">
                  Internal notes for this order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Add internal notes about this order…"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                  className="resize-none text-sm bg-muted/30 border-border/60 focus-visible:bg-background"
                />
                <Button
                  onClick={handleSaveNote}
                  disabled={noteLoading}
                  className="w-full"
                  size="sm"
                >
                  {noteLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-2" />
                      Save Note
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 5: Payment Proof */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Payment Proof
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.screenshot ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        Payment proof received
                      </span>
                    </div>
                    {/* Screenshot image preview */}
                    <div
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-border/60 bg-muted/30"
                      onClick={() => setLightboxOpen(true)}
                    >
                      <img
                        src={order.screenshot.startsWith('/') ? order.screenshot : `/uploads/${order.screenshot}`}
                        alt="Payment proof"
                        className="w-full max-h-48 object-contain bg-muted/20"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/70 rounded-full p-2.5 shadow-lg">
                          <ImageIcon className="h-5 w-5 text-foreground" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] bg-black/60 text-white px-2 py-1 rounded-full">
                          Click to enlarge
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-muted/40">
                    <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground italic">
                      No payment proof uploaded
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Lightbox overlay for full-size screenshot view */}
          {lightboxOpen && order.screenshot && (
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
              onClick={() => setLightboxOpen(false)}
            >
              <div className="relative max-w-4xl max-h-[90vh] w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxOpen(false)
                  }}
                  className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
                <img
                  src={order.screenshot.startsWith('/') ? order.screenshot : `/uploads/${order.screenshot}`}
                  alt="Payment proof full size"
                  className="w-full h-full object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
