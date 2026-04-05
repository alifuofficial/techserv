'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Package,
  Zap,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Activity,
  Star,
  Wallet,
  BarChart3,
  Bell,
  Globe,
  Shield,
  Code,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

/* ─── Types ─── */
interface Order {
  id: string
  status: string
  duration: string
  amount: number
  createdAt: string
  service: { id: string; title: string; slug: string; icon: string }
}

interface Service {
  id: string
  title: string
  slug: string
  shortDescription: string
  icon: string
  pricingType: string
  pricingTiers: string
}

/* ─── Animation Variants ─── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const slideIn = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ─── Helpers ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { cls: string; icon: React.ElementType }> = {
    pending: { cls: 'bg-amber-50 text-amber-700 ring-amber-200/60', icon: Clock },
    approved: { cls: 'bg-sky-50 text-sky-700 ring-sky-200/60', icon: CheckCircle2 },
    completed: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60', icon: CheckCircle2 },
    rejected: { cls: 'bg-red-50 text-red-700 ring-red-200/60', icon: Clock },
  }
  const { cls, icon: Icon } = config[status] || config.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${cls}`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function durationLabel(d: string) {
  const map: Record<string, string> = {
    '3months': '3 Months', '6months': '6 Months', '1year': '12 Months',
    '1month': '1 Month', 'one_time': 'One-Time',
  }
  return map[d] || d
}

function serviceIcon(iconName: string, className: string = "h-5 w-5") {
  const icons: Record<string, React.ElementType> = {
    Zap, Globe, Shield, Code, Star, Layers,
    ShoppingCart, Package, DollarSign, Activity, TrendingUp, Bell,
  }
  const Icon = icons[iconName] || Zap
  return <Icon className={className} />
}

/* ─── Welcome Banner ─── */
function WelcomeBanner({ name }: { name: string }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-emerald-600 p-6 sm:p-8 text-white"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-medium text-white/80">{greeting}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {name}!
            </h1>
            <p className="text-white/70 text-sm max-w-md">
              Track your orders, explore new services, and manage your account all in one place.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button className="bg-white text-primary hover:bg-white/90 gap-2 rounded-xl shadow-lg shadow-black/10 font-semibold" asChild>
              <Link href="/services">
                <Zap className="h-4 w-4" />
                Browse Services
              </Link>
            </Button>
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 gap-2 rounded-xl border border-white/20" asChild>
              <Link href="/dashboard/orders">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">My Orders</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Stat Card ─── */
function StatCard({
  title, value, icon: Icon, color, subtitle,
}: {
  title: string; value: string | number; icon: React.ElementType
  color: string; subtitle?: string
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-300 border-border/50">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-2xl font-extrabold tracking-tight">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
        {/* Bottom gradient accent */}
        <div className={`h-0.5 w-full bg-gradient-to-r ${color} opacity-60 group-hover:opacity-100 transition-opacity`} />
      </Card>
    </motion.div>
  )
}

/* ─── Mini Order Row ─── */
function MiniOrderRow({ order, index }: { order: Order; index: number }) {
  return (
    <motion.div variants={slideIn} custom={index}>
      <Link href={`/dashboard/orders/${order.id}`} className="block">
        <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200">
          <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
            {serviceIcon(order.service.icon, 'h-4.5 w-4.5 text-primary')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate">{order.service.title}</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span>{durationLabel(order.duration)}</span>
              <span className="text-border">·</span>
              <span>{format(new Date(order.createdAt), 'MMM d')}</span>
              <span className="hidden sm:inline text-border">·</span>
              <span className="hidden sm:inline font-mono text-[11px]">#{order.id.slice(0, 8)}</span>
            </div>
          </div>
          <div className="text-right shrink-0 flex items-center gap-2">
            <p className="text-sm font-bold tabular-nums">${order.amount.toFixed(2)}</p>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary shrink-0 transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Skeletons ─── */
function PageSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-5 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2"><CardContent className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-14" />
            </div>
          ))}
        </CardContent></Card>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    async function fetchData() {
      try {
        const [ordersRes, servicesRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/services?active=true'),
        ])
        if (ordersRes.ok && !cancelled) setOrders(await ordersRes.json())
        if (servicesRes.ok && !cancelled) setServices(await servicesRes.json())
      } catch { /* silent */ } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [status])

  if (status === 'loading' || loading) return <PageSkeleton />
  if (!session) return null

  const firstName = session.user?.name?.split(' ')[0] || 'User'
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'approved').length
  const totalSpent = orders.filter(o => o.status === 'completed' || o.status === 'approved').reduce((s, o) => s + o.amount, 0)
  const recentOrders = orders.slice(0, 5)
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0

  // Pick 3 random services for recommendations (exclude already ordered service IDs)
  const orderedServiceIds = new Set(orders.map(o => o.serviceId))
  const recommendedServices = services
    .filter(s => !orderedServiceIds.has(s.id))
    .slice(0, 3)
  const fallbackServices = services.slice(0, 3)
  const displayServices = recommendedServices.length > 0 ? recommendedServices : fallbackServices

  // Monthly spending calculation (last 6 months)
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const monthlySpending: { month: string; amount: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    const monthStr = format(d, 'MMM')
    const spent = orders
      .filter(o => {
        const oDate = new Date(o.createdAt)
        return oDate >= d && oDate <= monthEnd && (o.status === 'completed' || o.status === 'approved')
      })
      .reduce((s, o) => s + o.amount, 0)
    monthlySpending.push({ month: monthStr, amount: spent })
  }
  const maxMonthlySpend = Math.max(...monthlySpending.map(m => m.amount), 1)

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* ─── Welcome Banner ─── */}
      <motion.div variants={stagger} initial="hidden" animate="visible">
        <WelcomeBanner name={firstName} />
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          color="bg-violet-100 text-violet-600"
          subtitle={`${completedOrders} completed`}
        />
        <StatCard
          title="Pending"
          value={pendingOrders}
          icon={Clock}
          color="bg-amber-100 text-amber-600"
          subtitle={pendingOrders > 0 ? 'Awaiting review' : 'All clear!'}
        />
        <StatCard
          title="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          icon={Wallet}
          color="bg-emerald-100 text-emerald-600"
          subtitle="Lifetime spending"
        />
        <StatCard
          title="Success Rate"
          value={`${completionRate}%`}
          icon={BarChart3}
          color="bg-sky-100 text-sky-600"
          subtitle={`${completedOrders} of ${totalOrders} orders`}
        />
      </motion.div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── Left: Recent Activity ─── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Your latest service orders</p>
                </div>
                {orders.length > 5 && (
                  <Button variant="ghost" size="sm" className="gap-1 text-sm -mr-2" asChild>
                    <Link href="/dashboard/orders">
                      View All
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="font-semibold mb-1">No orders yet</h3>
                  <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                    You haven&apos;t placed any orders yet. Browse our services to get started!
                  </p>
                  <Button className="rounded-xl gap-2" asChild>
                    <Link href="/services">
                      <Zap className="h-4 w-4" />
                      Browse Services
                    </Link>
                  </Button>
                </div>
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-0.5">
                  {recentOrders.map((order, i) => (
                    <MiniOrderRow key={order.id} order={order} index={i} />
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Right Sidebar ─── */}
        <div className="space-y-6">

          {/* Completion Rate Card */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">Completion Rate</h3>
                  {completionRate >= 80 && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      On Track
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-extrabold tracking-tight">{completionRate}<span className="text-lg text-muted-foreground">%</span></span>
                </div>
                <Progress value={completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2.5">
                  {completedOrders} of {totalOrders} orders completed
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Spending Trend */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
            <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-muted-foreground">Spending Trend</h3>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                {/* Mini bar chart */}
                <div className="flex items-end justify-between gap-2 h-20">
                  {monthlySpending.map((m, i) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max((m.amount / maxMonthlySpend) * 56, 4)}px` }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full rounded-md bg-gradient-to-t from-primary/80 to-primary/40 min-h-[4px]"
                      />
                      <span className="text-[10px] text-muted-foreground font-medium">{m.month}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Last 6 months · <span className="font-semibold text-foreground">${totalSpent.toFixed(2)} total</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { href: '/services', icon: Zap, label: 'Place New Order', color: 'text-primary', bg: 'bg-primary/8' },
                    { href: '/dashboard/orders', icon: ShoppingCart, label: 'View All Orders', color: 'text-sky-600', bg: 'bg-sky-500/8' },
                    { href: '/dashboard/account', icon: Layers, label: 'Account Settings', color: 'text-amber-600', bg: 'bg-amber-500/8' },
                  ].map((item) => (
                    <Link key={item.href + item.label} href={item.href}>
                      <div className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200">
                        <div className={`h-9 w-9 rounded-lg ${item.bg} flex items-center justify-center`}>
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ─── Recommended Services ─── */}
      {displayServices.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
          <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Recommended for You
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Services you might like</p>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-sm -mr-2" asChild>
                  <Link href="/services">
                    All Services
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayServices.map((service) => {
                  let tiers: Array<{ label: string; duration: string; price: number }> = []
                  try { tiers = JSON.parse(service.pricingTiers) } catch {}
                  const startPrice = tiers.length > 0 ? tiers[0].price : 0

                  return (
                    <Link key={service.id} href={`/services/${service.slug}`} className="block group">
                      <div className="relative rounded-xl border border-border/50 p-4 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
                            {serviceIcon(service.icon, 'h-5 w-5 text-primary')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                              {service.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {service.shortDescription}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {startPrice > 0 && (
                                <span className="text-sm font-bold text-primary">
                                  ${startPrice.toFixed(2)}
                                </span>
                              )}
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {service.pricingType === 'subscription' ? 'Recurring' : 'One-Time'}
                              </Badge>
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors mt-1" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
