'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format, subDays } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts'
import {
  ShoppingCart,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  ArrowUpRight,
  PackageOpen,
  Eye,
  LayoutList,
  Globe,
  Home,
  TrendingUp,
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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface Stats {
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  completedOrders: number
  rejectedOrders: number
  totalRevenue: number
  totalUsers: number
}

interface Order {
  id: string
  status: string
  duration: string
  amount: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  service: {
    id: string
    title: string
    slug: string
  }
}

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ────────────────────────────────────────────
   Status badge helper
   ──────────────────────────────────────────── */
const statusStyles: Record<string, string> = {
  pending:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  approved:
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  completed:
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  rejected:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
}

function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <Badge variant="outline" className={statusStyles[status] || ''}>
      {label}
    </Badge>
  )
}

/* ────────────────────────────────────────────
   Chart Configs
   ──────────────────────────────────────────── */
const statusChartConfig = {
  pending: { label: 'Pending', color: 'oklch(0.75 0.15 85)' },
  approved: { label: 'Approved', color: 'oklch(0.65 0.15 240)' },
  completed: { label: 'Completed', color: 'oklch(0.65 0.17 155)' },
  rejected: { label: 'Rejected', color: 'oklch(0.65 0.2 25)' },
} satisfies ChartConfig

const revenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'oklch(0.65 0.17 155)',
  },
} satisfies ChartConfig

/* ────────────────────────────────────────────
   Generate mock 7-day revenue data
   ──────────────────────────────────────────── */
function generateMockRevenueData(baseRevenue: number) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i)
    const variance = 0.6 + Math.random() * 0.8
    const dailyRevenue = baseRevenue > 0 ? (baseRevenue / 30) * variance : 120 * variance
    return {
      date: format(date, 'MMM d'),
      revenue: Math.round(dailyRevenue * 100) / 100,
    }
  })
}

/* ────────────────────────────────────────────
   Stat Card Component
   ──────────────────────────────────────────── */
function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  badge,
  badgeColor,
  delay,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  badge?: React.ReactNode
  badgeColor?: string
  delay: number
}) {
  return (
    <motion.div variants={fadeUp} transition={{ delay }}>
      <Card className="relative overflow-hidden border-border/60 hover:border-border transition-colors">
        {/* Decorative gradient blob */}
        <div
          className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-[0.04] ${iconColor}`}
        />
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
              >
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground leading-none">{title}</p>
                <p className="text-2xl font-bold tracking-tight mt-1.5">{value}</p>
              </div>
            </div>
            {badge && (
              <div
                className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}
              >
                {badge}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Skeleton Loaders
   ──────────────────────────────────────────── */
function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3.5 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-52" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ────────────────────────────────────────────
   Quick Actions Component
   ──────────────────────────────────────────── */
const quickActions = [
  {
    title: 'Manage Orders',
    description: 'Review and process incoming orders',
    icon: LayoutList,
    href: '/admin/orders',
    accent: 'text-green-600 dark:text-green-400',
    accentBg: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    title: 'View Services',
    description: 'Browse all available services',
    icon: Globe,
    href: '/services',
    accent: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    title: 'Back to Site',
    description: 'Return to the main website',
    icon: Home,
    href: '/',
    accent: 'text-muted-foreground',
    accentBg: 'bg-muted',
  },
]

function QuickActions() {
  return (
    <motion.div variants={fadeUp} transition={{ delay: 0.35 }}>
      <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} className="group">
            <Card className="h-full border-border/60 hover:border-primary/30 transition-all cursor-pointer group-hover:shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.accentBg}`}
                  >
                    <action.icon className={`h-4.5 w-4.5 ${action.accent}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                <div className="mt-3">
                  <p className="font-medium text-sm leading-none">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/orders'),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setRecentOrders(ordersData.slice(0, 5))
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Chart data derived from stats
  const statusChartData = useMemo(
    () => [
      {
        name: 'Pending',
        pending: stats?.pendingOrders ?? 0,
        approved: 0,
        completed: 0,
        rejected: 0,
      },
      {
        name: 'Approved',
        pending: 0,
        approved: stats?.approvedOrders ?? 0,
        completed: 0,
        rejected: 0,
      },
      {
        name: 'Completed',
        pending: 0,
        approved: 0,
        completed: stats?.completedOrders ?? 0,
        rejected: 0,
      },
      {
        name: 'Rejected',
        pending: 0,
        approved: 0,
        completed: 0,
        rejected: stats?.rejectedOrders ?? 0,
      },
    ],
    [stats]
  )

  const revenueData = useMemo(
    () => generateMockRevenueData(stats?.totalRevenue ?? 0),
    [stats?.totalRevenue]
  )

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp} transition={{ delay: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, Admin
        </p>
      </motion.div>

      {/* ── Stats Cards ── */}
      {loading || !stats ? (
        <StatsCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            badge={
              <>
                <TrendingUp className="h-3 w-3" />
                12%
              </>
            }
            badgeColor="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            delay={0.05}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            badge={`${stats.completedOrders} done`}
            badgeColor="bg-primary/10 text-primary"
            delay={0.1}
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={Clock}
            iconBg="bg-yellow-100 dark:bg-yellow-900/30"
            iconColor="text-yellow-600 dark:text-yellow-400"
            badge={
              <>
                <ArrowUpRight className="h-3 w-3" />
                Needs review
              </>
            }
            badgeColor="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            delay={0.15}
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
            badge="Active"
            badgeColor="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            delay={0.2}
          />
        </div>
      )}

      {/* ── Charts Section ── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Orders by Status - Bar Chart */}
          <motion.div variants={scaleIn} transition={{ delay: 0.2 }}>
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Orders by Status</CardTitle>
                <CardDescription>
                  Distribution of orders across statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={statusChartConfig}
                  className="h-[250px] w-full"
                >
                  <BarChart
                    data={statusChartData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'oklch(0.95 0 0 / 0.3)' }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="pending"
                      fill="var(--color-pending)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="approved"
                      fill="var(--color-approved)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="completed"
                      fill="var(--color-completed)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="rejected"
                      fill="var(--color-rejected)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue Overview - Area Chart */}
          <motion.div variants={scaleIn} transition={{ delay: 0.25 }}>
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue Overview</CardTitle>
                <CardDescription>
                  Last 7 days performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={revenueChartConfig}
                  className="h-[250px] w-full"
                >
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--color-revenue)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--color-revenue)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'oklch(0.95 0 0 / 0.3)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* ── Recent Orders Table ── */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <motion.div variants={scaleIn} transition={{ delay: 0.3 }}>
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PackageOpen className="h-4 w-4 text-primary" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription>
                    Latest orders across all users
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/orders">
                    View All
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <PackageOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">No orders yet</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Orders will appear here once customers place them.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-2">Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right pr-2">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="pl-2 font-mono text-xs text-muted-foreground">
                              #{order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">
                                  {order.user?.name || 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {order.user?.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {order.service?.title || '—'}
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              ${order.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={order.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {format(new Date(order.createdAt), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-right pr-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/orders/${order.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-2">
                    {recentOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/admin/orders/${order.id}`}
                        className="block group"
                      >
                        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/60 group-hover:border-primary/30 group-hover:bg-muted/30 transition-all">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm truncate">
                                {order.service?.title || '—'}
                              </p>
                              <StatusBadge status={order.status} />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono">
                                #{order.id.slice(0, 8)}
                              </span>
                              <span className="text-border">·</span>
                              <span className="truncate">
                                {order.user?.name || 'Unknown'}
                              </span>
                              <span className="text-border">·</span>
                              <span>
                                {format(
                                  new Date(order.createdAt),
                                  'MMM d'
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span className="font-semibold text-sm">
                              ${order.amount.toFixed(2)}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Quick Actions ── */}
      <QuickActions />
    </motion.div>
  )
}
