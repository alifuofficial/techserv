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
  Search,
  ExternalLink,
  Share2,
  Copy,
  Users,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

/* ─── Types ─── */
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

/* ─── Animation Variants ─── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

/* ─── Helpers ─── */
function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: 'In Review', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
    approved: { label: 'Active', color: 'bg-sky-500/10 text-sky-600 border-sky-500/20', icon: CheckCircle2 },
    completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: Clock },
  }
  const { label, color, icon: Icon } = config[status as keyof typeof config] || config.pending
  return (
    <Badge variant="outline" className={cn("px-2 py-0 text-[10px] font-bold uppercase tracking-tight gap-1", color)}>
      <Icon className="h-2.5 w-2.5" />
      {label}
    </Badge>
  )
}

function serviceIcon(iconName: string, className: string = "h-5 w-5") {
  const icons: Record<string, React.ElementType> = {
    Zap, Globe, Shield, Code, Star, Layers,
    ShoppingCart, Package, DollarSign, Activity, TrendingUp, Bell,
  }
  const Icon = icons[iconName] || Zap
  return <Icon className={className} />
}

/* ─── Components ─── */

function DashboardHeader({ name }: { name: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase">
          <Activity className="h-4 w-4" />
          Dashboard Overview
        </div>
        <h1 className="text-3xl font-black tracking-tight flex items-baseline gap-2">
          Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600 tracking-tighter">{name}</span>
          <span className="animate-pulse origin-bottom-right">👋</span>
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Here's a snapshot of your services and performance.
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Button variant="outline" className="rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all" asChild>
          <Link href="/dashboard/settings">
             <Shield className="h-4 w-4 mr-2 text-primary" />
             Account Status
          </Link>
        </Button>
        <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2 font-bold px-6" asChild>
          <Link href="/services">
            <Zap className="h-4 w-4 fill-current" />
            New Order
          </Link>
        </Button>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, colorClass, status }: { 
  title: string, value: string | number, icon: any, trend?: string, colorClass: string, status?: string 
}) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all group overflow-hidden relative">
      <div className={cn("absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity", colorClass)}>
        <Icon className="h-full w-full" />
      </div>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black tabular-nums">{value}</h3>
          </div>
          {status && <p className="text-[10px] text-muted-foreground font-medium">{status}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Record<string, string>>({
    account_tier_enabled: 'true',
    referral_system_enabled: 'true'
  })
  const [referralData, setReferralData] = useState<{ referralCode: string, referralCount: number } | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    async function fetchData() {
      try {
        const [ordersRes, servicesRes, settingsRes, referralRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/services?active=true'),
          fetch('/api/settings/public'),
          fetch('/api/user/referrals'),
        ])
        if (ordersRes.ok && !cancelled) setOrders(await ordersRes.json())
        if (servicesRes.ok && !cancelled) setServices(await servicesRes.json())
        if (settingsRes.ok && !cancelled) setSettings(await settingsRes.json())
        if (referralRes.ok && !cancelled) setReferralData(await referralRes.json())
      } catch { /* ignore */ } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="p-6 lg:p-10 space-y-10">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  const firstName = session?.user?.name?.split(' ')[0] || 'User'
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'approved').length
  const totalSpent = orders.filter(o => o.status === 'completed' || o.status === 'approved').reduce((s, o) => s + o.amount, 0)
  const recentOrders = orders.slice(0, 5)
  const successRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10">
      {/* ─── Header ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp as any}>
        <DashboardHeader name={firstName} />
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <motion.div 
        variants={stagger as any} 
        initial="hidden" 
        animate="visible" 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <StatCard 
          title="Active Projects" 
          value={completedOrders} 
          icon={Layers} 
          colorClass="bg-primary/10 text-primary"
          status={`Total ${totalOrders} placed`}
          trend="+2 New"
        />
        <StatCard 
          title="Requests Pending" 
          value={pendingOrders} 
          icon={Clock} 
          colorClass="bg-amber-500/10 text-amber-600"
          status="Awaiting fulfillment"
        />
        <StatCard 
          title="Lifetime Investment" 
          value={`$${totalSpent.toLocaleString()}`} 
          icon={Wallet} 
          colorClass="bg-emerald-500/10 text-emerald-600"
          status="Across all services"
          trend="8% MoM"
        />
        <StatCard 
          title="Project Success" 
          value={`${successRate}%`} 
          icon={BarChart3} 
          colorClass="bg-sky-500/10 text-sky-600"
          status="On-time delivery rate"
        />
      </motion.div>

      {/* ─── Main Content Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Recent Shipments / Activity */}
        <motion.div 
          variants={fadeUp as any} 
          initial="hidden" 
          animate="visible" 
          className="lg:col-span-8 flex flex-col gap-6"
        >
          <Card className="border-border/50 flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">Recent Fulfillment</CardTitle>
                <CardDescription>Status tracking for your latest service requests</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-2 rounded-lg font-bold" asChild>
                <Link href="/dashboard/orders">
                  Full History <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <motion.div variants={fadeUp as any} className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <div className="h-20 w-20 rounded-3xl bg-muted/30 flex items-center justify-center">
                    <Package className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">No orders yet</h3>
                    <p className="text-muted-foreground text-sm max-w-[240px]">Your recent service requests will appear here once you start.</p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order, i) => (
                    <motion.div 
                      key={order.id}
                      variants={scaleIn}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <div className="group relative flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-border hover:bg-muted/30 transition-all duration-300">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                            {serviceIcon(order.service.icon, "h-6 w-6 text-primary")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm truncate">{order.service.title}</h4>
                                <StatusBadge status={order.status} />
                              </div>
                              <span className="text-sm font-black tabular-nums">${order.amount.toFixed(2)}</span>
                            </div>
                            
                            {/* Progress Indicator */}
                            {['approved', 'completed'].includes(order.status) && (
                              <div className="mb-2 space-y-1">
                                <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                                  <span>Fulfillment Progress</span>
                                  <span>{order.progress}%</span>
                                </div>
                                <Progress value={order.progress} className="h-1 bg-primary/20" />
                              </div>
                            )}

                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(order.createdAt), 'MMM d, p')}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-border" />
                              <span className="truncate">{order.duration.replace('_', ' ')}</span>
                              <span className="h-1 w-1 rounded-full bg-border" />
                              <span className="font-mono text-[10px] opacity-60">#{order.id.slice(-6)}</span>
                            </div>
                          </div>
                          <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <ChevronRight className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      </Link>
                      {i < recentOrders.length - 1 && <Separator className="my-1 opacity-50" />}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* RIGHT: Quick Insights */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Progress Card (Conditional Tier) */}
          {settings.account_tier_enabled === 'true' && (
            <motion.div variants={fadeUp as any} initial="hidden" animate="visible">
              <Card className="border-border/50 bg-primary/5 border-primary/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 blur-[60px] -mr-16 -mt-16 rounded-full" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                    Account Tier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-3xl font-black px-0.5 tracking-tighter">
                        {(session?.user as any)?.tier || 'Standard'}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">Next tier at 20 orders</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black italic opacity-20 uppercase">
                        {(session?.user as any)?.tier === 'Gold' ? 'PRO' : 'USER'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>Performance</span>
                      <span>{successRate}%</span>
                    </div>
                    <Progress value={successRate} className="h-2.5 bg-primary/20" />
                  </div>
                  <Button className="w-full h-8 text-xs font-bold rounded-lg border-2 border-primary/20 bg-transparent text-primary hover:bg-primary hover:text-white transition-all shadow-none">
                    View Benefits
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Referral Card (Conditional) */}
          {settings.referral_system_enabled === 'true' && (
            <motion.div variants={fadeUp as any} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
              <Card className="border-border/50 overflow-hidden relative bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Users className="h-4 w-4" />
                    Referral Program
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Referrals</p>
                      <h3 className="text-2xl font-black text-emerald-800 dark:text-emerald-300">{referralData?.referralCount || 0}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                       <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Share & Earn</p>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-white dark:bg-black/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2 text-[11px] font-mono font-black flex items-center justify-center tracking-wider overflow-hidden">
                        {referralData?.referralCode || (session?.user as any)?.referralCode || '-------'}
                      </code>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-10 w-10 shrink-0 rounded-xl border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={() => {
                          const code = referralData?.referralCode || (session?.user as any)?.referralCode
                          if (code) {
                            navigator.clipboard.writeText(`${window.location.origin}/refer/${code}`)
                            toast.success("Link copied! Share it to earn rewards.")
                          } else {
                            toast.error("Code not ready. Try refreshing.")
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 text-emerald-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Support / Contact */}
          <motion.div variants={fadeUp as any} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-6">
             <Card className="border-border/50 overflow-hidden group">
               <CardContent className="p-0">
                  <div className="bg-muted/50 p-5 border-b border-border/50 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                       <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Dedicated Team</h3>
                      <p className="text-xs text-muted-foreground">Priority support available 24/7</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <Button variant="ghost" className="w-full justify-between hover:bg-primary/5 text-primary font-bold group-hover:translate-x-1 transition-transform" asChild>
                       <Link href="/services">
                         Start a Conversation
                         <ArrowUpRight className="h-4 w-4" />
                       </Link>
                    </Button>
                  </div>
               </CardContent>
             </Card>
          </motion.div>

          {/* Upcoming System status / Tip */}
          <motion.div variants={fadeUp as any} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="space-y-6">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200/50">
               <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">TechServ Status</span>
               </div>
               <h4 className="font-bold leading-snug mb-3">All systems operational.</h4>
               <p className="text-[11px] opacity-70 mb-4 leading-relaxed">Service delivery times are optimal. Large campaigns are processing 20% faster today.</p>
               <Separator className="bg-white/20 mb-4" />
               <div className="flex items-center justify-between text-xs font-bold">
                 <span>Latency: 24ms</span>
                 <Bell className="h-4 w-4 opacity-50" />
               </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ─── Bottom Section: Recommendations ─── */}
      {services.length > 0 && (
        <motion.div variants={fadeUp as any} initial="hidden" animate="visible" className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">Recommended for You</h2>
              <p className="text-sm text-muted-foreground font-medium">Handpicked services based on your activity</p>
            </div>
            <Button variant="outline" className="rounded-xl font-bold" asChild>
              <Link href="/services">Explore All <ExternalLink className="h-3 w-3 ml-2" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.slice(0, 3).map((service, i) => (
              <motion.div 
                key={service.id}
                whileHover={{ y: -5 }}
                className="group h-full"
              >
                <Link href={`/services/${service.slug}`} className="h-full block">
                  <Card className="h-full border-border/50 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                          {serviceIcon(service.icon, "h-6 w-6 text-muted-foreground group-hover:text-primary")}
                        </div>
                        <Badge variant="secondary" className="bg-muted/50 text-[9px] font-black uppercase tracking-tighter">
                          {service.pricingType}
                        </Badge>
                      </div>
                      <h4 className="text-lg font-black group-hover:text-primary transition-colors mb-2 tracking-tight">{service.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-2">
                        {service.shortDescription}
                      </p>
                      <div className="flex items-center justify-between group/btn pt-4 border-t border-border/10">
                         <span className="text-sm font-bold text-primary flex items-baseline gap-0.5">
                            Starting at <span className="text-lg font-black">$49</span>
                         </span>
                         <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-white transition-all">
                            <ArrowRight className="h-4 w-4" />
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
