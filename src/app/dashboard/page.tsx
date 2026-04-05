'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  Layers,
  ArrowUpRight,
  ChevronRight,
  Activity,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

/* ─── Types ─── */
interface Order {
  id: string
  status: string
  duration: string
  amount: number
  createdAt: string
  service: { id: string; title: string; slug: string; icon: string }
}

/* ─── Animation ─── */
const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

/* ─── Helpers ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-sky-100 text-sky-700 border-sky-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }
  const icons: Record<string, string> = {
    pending: '⏳', approved: '✓', completed: '✅', rejected: '✕',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config[status] || ''}`}>
      <span>{icons[status] || '•'}</span>
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

/* ─── Stat Card ─── */
function StatCard({
  title, value, icon: Icon, gradient, delay,
}: {
  title: string; value: string | number; icon: React.ElementType; gradient: string; delay: number
}) {
  return (
    <motion.div variants={reveal} custom={delay}>
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500`} />
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-3xl font-extrabold tracking-tight mt-1">{value}</p>
            </div>
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── Skeletons ─── */
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-11 rounded-2xl" />
            </div>
            <Skeleton className="h-9 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders')
        if (res.ok && !cancelled) setOrders(await res.json())
      } catch { /* silent */ } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ActivitySkeleton /></div>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  if (!session) return null

  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'approved').length
  const totalSpent = orders.filter(o => o.status === 'completed' || o.status === 'approved').reduce((s, o) => s + o.amount, 0)
  const recentOrders = orders.slice(0, 5)
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-8">
      {/* ─── Welcome Header ─── */}
      <motion.div initial="hidden" animate="visible" className="space-y-1">
        <motion.div variants={reveal} custom={0}>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {session.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your orders today.
          </p>
        </motion.div>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={totalOrders} icon={ShoppingCart} gradient="from-violet-500 to-purple-600" delay={0} />
        <StatCard title="Pending" value={pendingOrders} icon={Clock} gradient="from-amber-500 to-orange-500" delay={1} />
        <StatCard title="Completed" value={completedOrders} icon={CheckCircle2} gradient="from-emerald-500 to-green-600" delay={2} />
        <StatCard title="Total Spent" value={`$${totalSpent.toFixed(2)}`} icon={DollarSign} gradient="from-sky-500 to-blue-600" delay={3} />
      </motion.div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── Recent Activity ─── */}
        <motion.div initial="hidden" animate="visible" variants={scaleIn} custom={4} className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold">Recent Activity</h2>
                  <p className="text-sm text-muted-foreground">Your latest orders</p>
                </div>
                {orders.length > 5 && (
                  <Button variant="ghost" size="sm" className="gap-1 text-sm" asChild>
                    <Link href="/dashboard/orders">
                      View All
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>

              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">No orders yet</h3>
                  <p className="text-sm text-muted-foreground mb-5">Start by browsing our services</p>
                  <Button asChild className="rounded-xl">
                    <Link href="/services">
                      <Zap className="h-4 w-4 mr-2" />
                      Browse Services
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <Link href={`/dashboard/orders/${order.id}`} className="block">
                        <div className="group flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-muted/50 transition-all duration-200">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Activity className="h-4.5 w-4.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold truncate">{order.service.title}</p>
                              <StatusBadge status={order.status} />
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                              <span>{durationLabel(order.duration)}</span>
                              <span>·</span>
                              <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                              <span className="hidden sm:inline">·</span>
                              <span className="hidden sm:inline font-mono">#{order.id.slice(0, 8)}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold">${order.amount.toFixed(2)}</p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Right Sidebar Cards ─── */}
        <div className="space-y-6">
          {/* Completion Rate */}
          <motion.div initial="hidden" animate="visible" variants={scaleIn} custom={5}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Order Completion Rate</h3>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-4xl font-extrabold tracking-tight">{completionRate}%</span>
                  {completionRate > 0 && (
                    <span className="text-sm font-medium text-emerald-600 flex items-center gap-1 mb-1">
                      <TrendingUp className="h-3.5 w-3.5" /> On track
                    </span>
                  )}
                </div>
                <Progress value={completionRate} className="h-2.5" />
                <p className="text-xs text-muted-foreground mt-3">
                  {completedOrders} of {totalOrders} orders completed
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial="hidden" animate="visible" variants={scaleIn} custom={6}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" asChild className="w-full justify-between rounded-xl h-12 px-4 group">
                    <Link href="/services" className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-sm">New Order</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-between rounded-xl h-12 px-4 group">
                    <Link href="/dashboard/orders" className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-sky-600" />
                        </div>
                        <span className="font-medium text-sm">All Orders</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-sky-600 transition-colors" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-between rounded-xl h-12 px-4 group">
                    <Link href="/services" className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Star className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="font-medium text-sm">Explore Services</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro Tip Card */}
          <motion.div initial="hidden" animate="visible" variants={scaleIn} custom={7}>
            <Card className="border-0 shadow-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-500 opacity-[0.06]" />
              <CardContent className="relative p-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-1.5">Need a custom solution?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  We offer custom development services including web apps, mobile apps, and bots tailored to your needs.
                </p>
                <Button size="sm" asChild className="rounded-lg text-xs h-8">
                  <Link href="/services/web-development">Learn More <ArrowRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
