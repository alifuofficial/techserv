'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  ArrowLeft,
  AlertCircle,
  User,
  Copy,
  Check,
  ChevronRight,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  FileText,
  ExternalLink,
  PackageOpen,
  Eye,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface Order {
  id: string
  status: string
  duration: string
  amount: number
  createdAt: string
  service: {
    id: string
    title: string
    slug: string
  }
}

interface CustomerDetail {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  telegram: string | null
  createdAt: string
  updatedAt: string
  orders: Order[]
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
  { label: string; className: string; dotColor: string }
> = {
  pending: {
    label: 'Pending',
    className:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  approved: {
    label: 'Approved',
    className:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    dotColor: 'bg-blue-500',
  },
  completed: {
    label: 'Completed',
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
}

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
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
function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status]
  if (!config) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {status}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className={`gap-1.5 ${config.className}`}>
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
  icon: Icon,
  mono = false,
  children,
}: {
  label: string
  value?: string
  icon?: React.ElementType
  mono?: boolean
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
          } text-foreground`}
        >
          {value || '—'}
        </p>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────
   Stat Item Component
   ──────────────────────────────────────────── */
function StatItem({
  icon: Icon,
  iconColor,
  label,
  value,
}: {
  icon: React.ElementType
  iconColor: string
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-bold tabular-nums mt-0.5 truncate">{value}</p>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Copy Button Component
   ──────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 p-0 shrink-0"
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </Button>
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
        <Skeleton className="h-4 w-16" />
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Back button skeleton */}
      <Skeleton className="h-8 w-28 rounded-md" />

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminCustomerDetailPage() {
  const params = useParams()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const id = params.id as string

  /* ── Fetch customer ── */
  useEffect(() => {
    let cancelled = false

    async function fetchCustomer() {
      try {
        const res = await fetch(`/api/admin/customers/${id}`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setCustomer(data)
        } else if (!cancelled) {
          setNotFound(true)
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCustomer()

    return () => {
      cancelled = true
    }
  }, [id])

  /* ── Computed stats ── */
  const stats = useMemo(() => {
    if (!customer) return { totalOrders: 0, totalSpent: 0, pendingOrders: 0, completedOrders: 0, avgOrderValue: 0, lastOrderDate: null as string | null }

    const totalOrders = customer.orders.length
    const completedOrders = customer.orders.filter((o) => o.status === 'completed')
    const pendingOrders = customer.orders.filter((o) => o.status === 'pending')
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.amount, 0)
    const avgOrderValue = completedOrders.length > 0 ? totalSpent / completedOrders.length : 0
    const lastOrderDate = customer.orders.length > 0 ? customer.orders[0].createdAt : null

    return { totalOrders, totalSpent, pendingOrders: pendingOrders.length, completedOrders: completedOrders.length, avgOrderValue, lastOrderDate }
  }, [customer])

  // Loading state
  if (loading) {
    return <DetailSkeleton />
  }

  // Not found state
  if (notFound || !customer) {
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
          <h2 className="text-xl font-semibold mb-1.5">Customer Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            The customer you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button variant="outline" asChild>
            <Link href="/admin/customers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  const isAdmin = customer.role === 'admin'

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* ── Breadcrumb + Back ── */}
      <motion.div variants={fadeUp} className="space-y-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/admin"
            className="hover:text-foreground transition-colors"
          >
            Admin
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href="/admin/customers"
            className="hover:text-foreground transition-colors"
          >
            Customers
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[180px]">
            {customer.name}
          </span>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-2">
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Customers
          </Link>
        </Button>
      </motion.div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Customer Profile */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Customer Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Avatar + name + email at top */}
                <div className="flex items-center gap-4 pb-5 mb-5 border-b border-border/60">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback
                      className={`text-lg font-bold ${
                        isAdmin
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg font-bold tracking-tight">
                        {customer.name}
                      </h2>
                      <Badge
                        variant={isAdmin ? 'default' : 'secondary'}
                        className="text-[10px] px-2 py-0"
                      >
                        {customer.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {customer.email}
                    </p>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField
                    label="Phone"
                    value={customer.phone || undefined}
                    icon={Phone}
                  >
                    {customer.phone ? (
                      <p className="text-sm font-medium">{customer.phone}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Not provided</p>
                    )}
                  </InfoField>
                  <InfoField
                    label="Telegram"
                    value={customer.telegram ? `@${customer.telegram}` : undefined}
                    icon={MessageCircle}
                  >
                    {customer.telegram ? (
                      <p className="text-sm font-medium">@{customer.telegram}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Not provided</p>
                    )}
                  </InfoField>
                  <InfoField
                    label="Joined Date"
                    value={format(new Date(customer.createdAt), 'MMM d, yyyy')}
                    icon={Calendar}
                  />
                  <InfoField
                    label="Last Order Date"
                    icon={Clock}
                  >
                    {stats.lastOrderDate ? (
                      <p className="text-sm font-medium">
                        {format(new Date(stats.lastOrderDate), 'MMM d, yyyy')}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No orders yet</p>
                    )}
                  </InfoField>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Customer Orders */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Customer Orders
                </CardTitle>
                <CardDescription className="text-xs">
                  {customer.orders.length} order{customer.orders.length !== 1 ? 's' : ''} placed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customer.orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-10">
                    <div className="h-12 w-12 rounded-xl bg-muted/80 flex items-center justify-center mb-3">
                      <PackageOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium mb-1">No orders yet</p>
                    <p className="text-xs text-muted-foreground">
                      This customer hasn&apos;t placed any orders.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/25 hover:bg-muted/25 border-border/60">
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Order ID
                            </TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Service
                            </TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Duration
                            </TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                              Amount
                            </TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                              Status
                            </TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Date
                            </TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right pr-4">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customer.orders.map((order) => (
                            <TableRow
                              key={order.id}
                              className="border-border/40 hover:bg-muted/30 transition-colors"
                            >
                              <TableCell>
                                <span className="font-mono text-xs text-muted-foreground">
                                  #{order.id.slice(0, 8)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm font-medium truncate max-w-[180px]">
                                  {order.service?.title || '—'}
                                </p>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {durationLabel(order.duration)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-sm font-semibold tabular-nums text-primary">
                                  {formatCurrency(order.amount)}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <StatusBadge status={order.status} />
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
                                  {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                </span>
                              </TableCell>
                              <TableCell className="text-right pr-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2.5 text-xs"
                                  asChild
                                >
                                  <Link href={`/admin/orders/${order.id}`}>
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    View
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-border/40">
                      {customer.orders.map((order) => (
                        <div key={order.id} className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-muted-foreground">
                              #{order.id.slice(0, 8)}
                            </span>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="text-sm font-medium leading-snug">
                            {order.service?.title || '—'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{durationLabel(order.duration)}</span>
                              <span className="text-border">·</span>
                              <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-primary">
                                {formatCurrency(order.amount)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                asChild
                              >
                                <Link href={`/admin/orders/${order.id}`}>
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">
          {/* Card 3: Quick Stats */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <StatItem
                    icon={ShoppingCart}
                    iconColor="bg-primary/10 text-primary"
                    label="Total Orders"
                    value={stats.totalOrders}
                  />
                  <StatItem
                    icon={DollarSign}
                    iconColor="bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400"
                    label="Total Spent"
                    value={formatCurrency(stats.totalSpent)}
                  />
                  <StatItem
                    icon={Clock}
                    iconColor="bg-yellow-100 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400"
                    label="Pending Orders"
                    value={stats.pendingOrders}
                  />
                  <StatItem
                    icon={Check}
                    iconColor="bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400"
                    label="Completed Orders"
                    value={stats.completedOrders}
                  />
                  <StatItem
                    icon={TrendingUp}
                    iconColor="bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                    label="Avg Order Value"
                    value={formatCurrency(stats.avgOrderValue)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: Contact Info */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Email with copy */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-sm font-medium truncate">{customer.email}</p>
                  </div>
                  <CopyButton text={customer.email} />
                </div>

                {/* Phone */}
                {customer.phone && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="text-sm font-medium">{customer.phone}</p>
                    </div>
                    <CopyButton text={customer.phone} />
                  </div>
                )}

                {/* Telegram */}
                {customer.telegram && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
                    <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Telegram
                      </p>
                      <p className="text-sm font-medium">@{customer.telegram}</p>
                    </div>
                    <CopyButton text={`@${customer.telegram}`} />
                  </div>
                )}

                {/* No contact info */}
                {!customer.phone && !customer.telegram && (
                  <p className="text-sm text-muted-foreground italic text-center py-3">
                    No additional contact info provided
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
