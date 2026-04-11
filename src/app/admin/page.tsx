'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  ShoppingCart,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  PackageOpen,
  Eye,
  LayoutList,
  Package,
  Settings,
  Home,
  Inbox,
  CheckCircle2,
  XCircle,
  Sparkles,
  Activity,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSettings } from '@/hooks/use-settings'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface Stats {
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  completedOrders: number
  rejectedOrders: number
  totalRevenue: number
  totalUsers: number
  trends: {
    revenue: number
    orders: number
    users: number
  }
  dailyRevenue: Array<{ date: string; revenue: number }>
}

interface Order {
  id: string
  status: string
  duration: string
  amount: number
  createdAt: string
  user: { id: string; name: string; email: string }
  service: { id: string; title: string; slug: string }
  progress: number
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const statusStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', icon: Clock },
  approved: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: Sparkles },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', icon: XCircle },
}

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || statusStyles.pending
  const Icon = style.icon
  return (
    <Badge variant="outline" className={`${style.bg} ${style.text} border-0 gap-1 font-medium`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const chartConfig = {
  revenue: { label: 'Revenue', color: 'oklch(0.65 0.17 155)' },
  pending: { label: 'Pending', color: 'oklch(0.75 0.15 85)' },
  approved: { label: 'Approved', color: 'oklch(0.65 0.15 240)' },
  completed: { label: 'Completed', color: 'oklch(0.65 0.17 155)' },
  rejected: { label: 'Rejected', color: 'oklch(0.65 0.2 25)' },
} satisfies ChartConfig

const STATUS_COLORS = ['#eab308', '#3b82f6', '#22c55e', '#ef4444']

function StatsCardSkeleton() {
  return (
    <Card className="border-border/40">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCardSkeleton() {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[220px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { formatAmount } = useSettings()
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
        if (statsRes.ok) setStats(await statsRes.json())
        if (ordersRes.ok) setRecentOrders((await ordersRes.json()).slice(0, 5))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const pieData = useMemo(() => stats ? [
    { name: 'Pending', value: stats.pendingOrders, color: STATUS_COLORS[0] },
    { name: 'Approved', value: stats.approvedOrders, color: STATUS_COLORS[1] },
    { name: 'Completed', value: stats.completedOrders, color: STATUS_COLORS[2] },
    { name: 'Rejected', value: stats.rejectedOrders, color: STATUS_COLORS[3] },
  ].filter(d => d.value > 0) : [], [stats])

  const revenueData = useMemo(() => stats?.dailyRevenue ?? [], [stats?.dailyRevenue])

  return (
    <motion.div className="p-4 md:p-6 space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="hidden md:flex">
            <Link href="/">
              <Home className="h-3.5 w-3.5 mr-1.5" />
              View Site
            </Link>
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={fadeUp}>
            <Card className="border-border/40 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
              <CardContent className="pt-6 pb-5 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
                      <p className="text-xl font-bold tracking-tight mt-0.5">
                        {formatAmount(stats?.totalRevenue ?? 0)}
                      </p>
                    </div>
                  </div>
                  {stats && (
                    <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                      stats.trends.revenue >= 0
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {stats.trends.revenue >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(stats.trends.revenue)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="border-border/40 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/60" />
              <CardContent className="pt-6 pb-5 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
                      <p className="text-xl font-bold tracking-tight mt-0.5">{stats?.totalOrders ?? 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="border-border/40 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
              <CardContent className="pt-6 pb-5 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Inbox className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Waiting Review</p>
                      <p className="text-xl font-bold tracking-tight mt-0.5">{stats?.pendingOrders ?? 0}</p>
                    </div>
                  </div>
                  {(stats?.pendingOrders ?? 0) > 0 && (
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="border-border/40 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
              <CardContent className="pt-6 pb-5 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Total Users</p>
                      <p className="text-xl font-bold tracking-tight mt-0.5">{stats?.totalUsers ?? 0}</p>
                    </div>
                  </div>
                  {stats && (
                    <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                      stats.trends.users >= 0
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {stats.trends.users >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(stats.trends.users)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            <ChartCardSkeleton />
            <ChartCardSkeleton />
            <ChartCardSkeleton />
          </>
        ) : (
          <>
            <motion.div variants={fadeUp} className="lg:col-span-2">
              <Card className="border-border/40 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Revenue Overview</CardTitle>
                  <CardDescription>Last 7 days performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[220px] w-full">
                    <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.65 0.17 155)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="oklch(0.65 0.17 155)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'oklch(0.45 0 0)' }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'oklch(0.45 0 0)' }} tickFormatter={(v) => `$${v}`} />
                      <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'oklch(0.95 0 0 / 0.4)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="oklch(0.65 0.17 155)" strokeWidth={2} fill="url(#revenueGradient)" />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="border-border/40 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Order Status</CardTitle>
                  <CardDescription>Distribution by status</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ChartContainer config={chartConfig} className="h-[180px] w-full">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                        <span className="text-xs font-medium ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <motion.div variants={fadeUp}>
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Latest orders from customers</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                  <Link href="/admin/orders">
                    View All
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <PackageOpen className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">No orders yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Orders will appear here once customers start placing them.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                          <Package className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {order.service?.title || 'Service'}
                            </p>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="font-mono">{order.id.slice(0, 8)}</span>
                            <span className="text-border">·</span>
                            <span className="truncate">{order.user?.name}</span>
                            <span className="text-border hidden sm:inline">·</span>
                            <span className="hidden sm:inline">
                              {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatAmount(order.amount)}</p>
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${order.progress}%` }} />
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Navigate to key admin areas</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { title: 'Orders', desc: 'Manage orders', icon: LayoutList, href: '/admin/orders', color: 'emerald' },
                { title: 'Services', desc: 'Edit services', icon: Package, href: '/admin/services', color: 'purple' },
                { title: 'Customers', desc: 'View users', icon: Users, href: '/admin/customers', color: 'blue' },
                { title: 'Settings', desc: 'Configure', icon: Settings, href: '/admin/settings', color: 'orange' },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="group">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-${action.color}-500/10`}>
                      <action.icon className={`h-4 w-4 text-${action.color}-600 dark:text-${action.color}-400`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}