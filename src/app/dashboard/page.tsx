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
  ArrowRight,
  Package,
  Zap,
  TrendingUp,
  Star,
  Wallet,
  BarChart3,
  Users,
  MessageCircle,
  Bell,
  Globe,
  Shield,
  Code,
  Layers,
  Copy,
  Sparkles,
  Inbox,
  XCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'

interface Order {
  id: string
  status: string
  duration: string
  amount: number
  progress: number
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

interface UserStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalSpent: number
  tier: string
  tierProgress: number
  nextTierRequirement: number
  referralCode: string
  referralCount: number
  trends: {
    orders: number
    ordersGrowth: number
    spendingGrowth: number
    newActivity: number
  }
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  pending: { label: 'In Review', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', icon: Clock },
  approved: { label: 'Active', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: Sparkles },
  completed: { label: 'Completed', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
  rejected: { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', icon: XCircle },
}

function StatusPill({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', config.bg, config.text)}>
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  )
}

function serviceIcon(name: string) {
  const map: Record<string, React.ElementType> = {
    Zap, Globe, Shield, Code, Star, Layers, ShoppingCart, Package, Wallet, BarChart3, Bell, TrendingUp,
  }
  const Icon = map[name] || Zap
  return <Icon className="h-5 w-5" />
}

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/40">
            <CardContent className="p-5"><div className="space-y-3"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-16" /></div></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Record<string, string>>({
    account_tier_enabled: 'true',
    referral_system_enabled: 'true',
  })
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const { formatAmount } = useSettings()

  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    async function fetchData() {
      try {
        const [ordersRes, servicesRes, settingsRes, statsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/services?active=true'),
          fetch('/api/settings/public'),
          fetch('/api/user/stats'),
        ])
        if (ordersRes.ok && !cancelled) setOrders(await ordersRes.json())
        if (servicesRes.ok && !cancelled) setServices(await servicesRes.json())
        if (settingsRes.ok && !cancelled) setSettings(await settingsRes.json())
        if (statsRes.ok && !cancelled) setUserStats(await statsRes.json())
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [status])

  if (status === 'loading' || loading) return <DashboardSkeleton />

  const firstName = session?.user?.name?.split(' ')[0] || 'User'
  const totalOrders = userStats?.totalOrders || 0
  const pendingOrders = userStats?.pendingOrders || 0
  const completedOrders = userStats?.completedOrders || 0
  const totalSpent = userStats?.totalSpent || 0
  const recentOrders = orders.slice(0, 5)
  const successRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0

  return (
    <motion.div className="p-4 md:p-6 space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Zap className="h-3 w-3 text-primary" />
              Dashboard
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{firstName}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button className="shrink-0" asChild>
            <Link href="/services">
              <Zap className="h-4 w-4 fill-current mr-1.5" />
              New Order
            </Link>
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <Card className="border-border/40 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold">{totalOrders}</p>
                    {userStats?.trends.ordersGrowth !== undefined && userStats.trends.ordersGrowth !== 0 && (
                      <span className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                        userStats.trends.ordersGrowth >= 0
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      )}>
                        {userStats.trends.ordersGrowth >= 0 ? '+' : ''}{userStats.trends.ordersGrowth}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border/40 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Inbox className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Pending Review</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold">{pendingOrders}</p>
                    {pendingOrders > 0 && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border/40 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Total Spent</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold">{formatAmount(totalSpent)}</p>
                    {userStats?.trends.spendingGrowth !== undefined && userStats.trends.spendingGrowth !== 0 && (
                      <span className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                        userStats.trends.spendingGrowth >= 0
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      )}>
                        {userStats.trends.spendingGrowth >= 0 ? '+' : ''}{userStats.trends.spendingGrowth}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border/40 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Success Rate</p>
                  <p className="text-xl font-bold">{successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="border-border/40 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Recent Orders</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Your latest service requests</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                  <Link href="/dashboard/orders">
                    View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Package className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">No orders yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Browse our services and place your first order.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/services">
                      <Zap className="h-4 w-4 fill-current mr-1.5" />
                      Browse Services
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 text-primary">
                          {serviceIcon(order.service.icon)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-medium text-sm truncate">{order.service.title}</p>
                            <StatusPill status={order.status} />
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-mono text-[10px]">#{order.id.slice(0, 8)}</span>
                            <span className="text-border">·</span>
                            <span>{format(new Date(order.createdAt), 'MMM d')}</span>
                            <span className="text-border">·</span>
                            <span>{order.duration.replace('_', ' ')}</span>
                          </div>
                          {['approved', 'completed'].includes(order.status) && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${order.progress}%` }} />
                              </div>
                              <span className="text-[10px] font-medium text-muted-foreground">{order.progress}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <p className="font-semibold text-sm">{formatAmount(order.amount)}</p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          {settings.account_tier_enabled === 'true' && (
            <motion.div variants={fadeUp}>
              <Card className="border-border/40 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-amber-500" />
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Star className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{userStats?.tier || 'Standard'} Tier</p>
                      <p className="text-[10px] text-muted-foreground">Account level</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Progress to Gold</span>
                      <span>{userStats?.tierProgress || 0}%</span>
                    </div>
                    <Progress value={userStats?.tierProgress || 0} className="h-2" />
                    <p className="text-[10px] text-muted-foreground">
                      {completedOrders}/{userStats?.nextTierRequirement || 10} orders completed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {settings.referral_system_enabled === 'true' && (
            <motion.div variants={fadeUp}>
              <Card className="border-border/40 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Users className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Referrals</p>
                      <p className="text-[10px] text-muted-foreground">{userStats?.referralCount || 0} people referred</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs font-mono font-bold text-center tracking-wider overflow-hidden">
                      {userStats?.referralCode || '-------'}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-lg"
                      onClick={() => {
                        const code = userStats?.referralCode
                        if (code) {
                          navigator.clipboard.writeText(`${window.location.origin}/refer/${code}`)
                          toast.success('Referral link copied!')
                        } else {
                          toast.error('Code not available. Try refreshing.')
                        }
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <Card className="border-border/40 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">All Systems Go</p>
                    <p className="text-[10px] text-muted-foreground">TechServ operational status</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All services running smoothly. Response times are optimal.
                </p>
                <Button variant="ghost" size="sm" className="w-full mt-3 h-8 text-xs justify-center" asChild>
                  <Link href="/services">
                    Browse Services
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {services.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Recommended for You</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Services picked based on your activity</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/services">
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.slice(0, 3).map((service) => {
              const tiers: Array<{ price: number }> = JSON.parse(service.pricingTiers || '[]')
              const startingPrice = tiers.length > 0 ? tiers[0].price : 0
              return (
                <motion.div key={service.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Link href={`/services/${service.slug}`} className="block h-full">
                    <Card className="h-full border-border/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                            {serviceIcon(service.icon)}
                          </div>
                          <Badge variant="secondary" className="text-[9px] font-semibold uppercase tracking-wide">
                            {service.pricingType === 'subscription' ? 'Subscription' : 'One-time'}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{service.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                          {service.shortDescription}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-border/60">
                          {startingPrice > 0 && (
                            <span className="text-sm font-bold">
                              From {formatAmount(startingPrice)}
                            </span>
                          )}
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}