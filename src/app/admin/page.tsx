'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { format, subDays } from 'date-fns'
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
  ResponsiveContainer,
  Tooltip,
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
  Zap,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Crown,
  Bell,
  Timer,
  Target,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
}

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

const statusStyles: Record<string, { bg: string; text: string; border: string; icon: React.ElementType; gradient: string }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', icon: Clock, gradient: 'from-amber-500 to-orange-500' },
  approved: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', icon: Sparkles, gradient: 'from-blue-500 to-cyan-500' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20', icon: XCircle, gradient: 'from-red-500 to-rose-500' },
}

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--primary)' },
} satisfies ChartConfig

const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444']

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  
  useEffect(() => {
    if (!inView) return
    const duration = 1500
    const startTime = performance.now()
    const startValue = 0
    
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (value - startValue) * easeOut
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [inView, value])
  
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || statusStyles.pending
  const Icon = style.icon
  return (
    <Badge variant="outline" className={`${style.bg} ${style.text} ${style.border} border gap-1 font-medium backdrop-blur-sm`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function MetricCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    </div>
  )
}

function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl">
      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-5 w-16" />
    </div>
  )
}

function GlowingOrb({ className }: { className: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-30 animate-pulse ${className}`} />
  )
}

export default function AdminDashboardPage() {
  const { formatAmount } = useSettings()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d'>('7d')

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/orders'),
        ])
        if (statsRes.ok) setStats(await statsRes.json())
        if (ordersRes.ok) setRecentOrders((await ordersRes.json()).slice(0, 6))
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

  const quickActions = [
    { title: 'Orders', desc: 'Review orders', icon: LayoutList, href: '/admin/orders', color: 'from-blue-500 to-cyan-500' },
    { title: 'Services', desc: 'Manage services', icon: Package, href: '/admin/services', color: 'from-purple-500 to-pink-500' },
    { title: 'Customers', desc: 'View users', icon: Users, href: '/admin/customers', color: 'from-orange-500 to-amber-500' },
    { title: 'Invoices', desc: 'Payments', icon: CreditCard, href: '/admin/invoices', color: 'from-emerald-500 to-teal-500' },
  ]

  const todayOrders = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return recentOrders.filter(o => new Date(o.createdAt) >= today).length
  }, [recentOrders])

  return (
    <motion.div
      className="p-4 md:p-6 lg:p-8 space-y-6 relative overflow-hidden"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* Background decorative elements */}
      <GlowingOrb className="h-96 w-96 bg-primary/20 -top-48 -right-48" />
      <GlowingOrb className="h-64 w-64 bg-blue-500/10 top-1/4 -left-32" />
      
      {/* Header */}
      <motion.div variants={fadeUp} className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25"
              >
                <Zap className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Dashboard Overview
                </h1>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live</span>
            </motion.div>
            
            <Button variant="outline" size="sm" asChild className="group bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background">
              <Link href="/">
                <Home className="h-3.5 w-3.5 mr-1.5" />
                View Site
                <ArrowUpRight className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Metrics Grid */}
      <motion.div variants={fadeUp} className="relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Card */}
            <motion.div variants={slideIn} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center backdrop-blur-sm">
                      <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {stats && (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        stats.trends.revenue >= 0
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {stats.trends.revenue >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(stats.trends.revenue)}%
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold tracking-tight mt-1">
                      {formatAmount(stats?.totalRevenue ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Orders Card */}
            <motion.div variants={slideIn} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <div className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center backdrop-blur-sm">
                      <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <Timer className="h-3 w-3" />
                      {todayOrders} today
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold tracking-tight mt-1">
                      <AnimatedNumber value={stats?.totalOrders ?? 0} />
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pending Card */}
            <motion.div variants={slideIn} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                <div className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center backdrop-blur-sm">
                      <Inbox className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    {(stats?.pendingOrders ?? 0) > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-xs font-medium text-amber-600 dark:text-amber-400"
                      >
                        <Bell className="h-3 w-3" />
                        Needs attention
                      </motion.div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Waiting Review
                    </p>
                    <p className="text-2xl font-bold tracking-tight mt-1">
                      <AnimatedNumber value={stats?.pendingOrders ?? 0} />
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Users Card */}
            <motion.div variants={slideIn} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                <div className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm">
                      <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    {stats && (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        stats.trends.users >= 0
                          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {stats.trends.users >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(stats.trends.users)}%
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total Customers
                    </p>
                    <p className="text-2xl font-bold tracking-tight mt-1">
                      <AnimatedNumber value={stats?.totalUsers ?? 0} />
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={fadeUp} className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* Revenue Chart */}
              <motion.div 
                variants={slideIn}
                className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent" />
                <div className="relative p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Revenue Overview</h3>
                        <p className="text-xs text-muted-foreground">Last 7 days performance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
                      {(['7d', '30d'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setSelectedPeriod(p)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            selectedPeriod === p
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {p === '7d' ? '7 Days' : '30 Days'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ChartContainer config={chartConfig} className="h-[220px] w-full">
                    <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradientFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                      <XAxis 
                        dataKey="date" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        tickMargin={8}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                        tickFormatter={(v) => `$${v}`}
                        width={45}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />} 
                        cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2.5} 
                        fill="url(#revenueGradientFill)" 
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </motion.div>

              {/* Order Status Pie Chart */}
              <motion.div 
                variants={slideIn}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-transparent" />
                <div className="relative p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">Order Status</h3>
                      <p className="text-xs text-muted-foreground">Distribution breakdown</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <ChartContainer config={chartConfig} className="h-[160px] w-full">
                      <PieChart>
                        <Pie 
                          data={pieData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={45} 
                          outerRadius={65} 
                          paddingAngle={3} 
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ChartContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                    {pieData.map((item) => (
                      <motion.div 
                        key={item.name} 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + pieData.indexOf(item) * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                        <span className="text-xs font-semibold ml-auto tabular-nums">{item.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      {/* Bottom Row - Recent Orders & Quick Actions */}
      <motion.div variants={fadeUp} className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Orders */}
          <motion.div 
            variants={slideIn}
            className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between p-5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Recent Activity</h3>
                    <p className="text-xs text-muted-foreground">Latest orders from customers</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="group text-muted-foreground hover:text-foreground">
                  <Link href="/admin/orders">
                    View All
                    <ChevronRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </div>
              
              <div className="px-5 pb-5">
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => <OrderRowSkeleton key={i} />)}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 relative">
                      <PackageOpen className="h-8 w-8 text-muted-foreground" />
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[10px] font-medium">0</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">No orders yet</h3>
                    <p className="text-xs text-muted-foreground text-center max-w-xs">
                      Orders will appear here once customers start placing them.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {recentOrders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="group flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 relative">
                              <Package className="h-5 w-5 text-primary" />
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-background border-2 flex items-center justify-center"
                                style={{ borderColor: STATUS_COLORS[['pending', 'approved', 'completed', 'rejected'].indexOf(order.status) as number] || '#888' }}
                              >
                                {order.progress > 0 && (
                                  <span className="text-[8px] font-bold">{order.progress}%</span>
                                )}
                              </motion.div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                  {order.service?.title || 'Service'}
                                </p>
                                <StatusBadge status={order.status} />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span className="font-mono text-[11px] bg-muted/50 px-1.5 py-0.5 rounded">{order.id.slice(0, 8)}</span>
                                <span className="text-border">·</span>
                                <span className="truncate">{order.user?.name}</span>
                                <span className="text-border hidden sm:inline">·</span>
                                <span className="hidden sm:inline">{format(new Date(order.createdAt), 'MMM d, h:mm a')}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <p className="font-bold text-sm">{formatAmount(order.amount)}</p>
                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                                  <motion.div 
                                    className="h-full bg-primary rounded-full" 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${order.progress}%` }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                  />
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            variants={slideIn}
            className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/3 via-transparent to-transparent" />
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Quick Actions</h3>
                  <p className="text-xs text-muted-foreground">Navigate to key areas</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={action.href}
                      className="group flex flex-col items-start gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all relative overflow-hidden"
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${action.color}`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs truncate">{action.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{action.desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border/50">
                <Link
                  href="/admin/settings"
                  className="group flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Settings className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-xs">Settings</p>
                      <p className="text-[10px] text-muted-foreground">Configure app</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}