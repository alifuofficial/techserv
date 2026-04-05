'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import {
  PackageOpen,
  ArrowRight,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowUpRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Zap,
  Globe,
  Shield,
  Code,
  Star,
  Layers,
  ShoppingCart,
  Package,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

/* ─── Types ─── */
interface Order {
  id: string
  status: string
  duration: string
  amount: number
  progress: number
  createdAt: string
  serviceId: string
  service: { id: string; title: string; slug: string; icon: string }
}

import { Progress } from '@/components/ui/progress'

/* ─── Helpers ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { cls: string; icon: React.ElementType }> = {
    pending: { cls: 'bg-amber-50 text-amber-700 ring-amber-200/60', icon: Clock },
    approved: { cls: 'bg-sky-50 text-sky-700 ring-sky-200/60', icon: CheckCircle2 },
    completed: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60', icon: CheckCircle2 },
    rejected: { cls: 'bg-red-50 text-red-700 ring-red-200/60', icon: XCircle },
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
    ShoppingCart, Package, DollarSign, Activity,
  }
  const Icon = icons[iconName] || Zap
  return <Icon className={className} />
}

/* ─── Animation ─── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const filterTabs = [
  { key: 'All', icon: Activity },
  { key: 'Pending', icon: Clock },
  { key: 'Approved', icon: CheckCircle2 },
  { key: 'Completed', icon: CheckCircle2 },
  { key: 'Rejected', icon: XCircle },
] as const
type FilterTab = typeof filterTabs[number]['key']

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All')

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

  const filtered = orders.filter(o => {
    const matchFilter = activeFilter === 'All' || o.status === activeFilter.toLowerCase()
    const matchSearch = o.service.title.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-10 rounded-xl" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-20 rounded-lg" />)}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-6">
      {/* ─── Header ─── */}
      <motion.div variants={fadeUp as any} initial="hidden" animate="visible" className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground text-sm">
          {orders.length} order{orders.length !== 1 ? 's' : ''} total · Track and manage your service orders
        </p>
      </motion.div>

      {/* ─── Search & Filter ─── */}
      <motion.div variants={fadeUp as any} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by service name or order ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-card border-border/60"
            />
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {filterTabs.map(tab => {
            const count = tab.key === 'All'
              ? orders.length
              : orders.filter(o => o.status === tab.key.toLowerCase()).length
            const isActive = activeFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.key}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-primary-foreground/20' : 'bg-muted-foreground/10'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ─── Orders List ─── */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-16 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-5">
                <PackageOpen className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <h2 className="text-xl font-bold mb-2">
                {search || activeFilter !== 'All' ? 'No matching orders' : 'No orders yet'}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                {search || activeFilter !== 'All'
                  ? 'Try adjusting your search or filter criteria.'
                  : "You haven't placed any orders yet. Browse our services to get started!"}
              </p>
              <Button className="rounded-xl gap-2" asChild>
                <Link href="/services">
                  <ArrowRight className="h-4 w-4" />
                  Browse Services
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={stagger as any} initial="hidden" animate="visible" className="space-y-3">
          {filtered.map((order) => (
            <motion.div key={order.id} variants={fadeUp as any}>
              <Link href={`/dashboard/orders/${order.id}`} className="block group">
                <Card className="border border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-4 sm:p-5">
                      {/* Service Icon */}
                      <div className="h-12 w-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
                        {serviceIcon(order.service.icon, 'h-5 w-5 text-primary')}
                      </div>

                      {/* Content */}
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                            <h3 className="font-semibold text-sm truncate">{order.service.title}</h3>
                            <StatusBadge status={order.status} />
                          </div>
                          
                          {/* Progress Indicator */}
                          {['approved', 'completed'].includes(order.status) && (
                            <div className="mb-2 max-w-[200px] space-y-1">
                              <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                                <span>Fulfillment</span>
                                <span>{order.progress}%</span>
                              </div>
                              <Progress value={order.progress} className="h-1 bg-primary/20" />
                            </div>
                          )}

                          <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
                            <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[11px]">
                              #{order.id.slice(0, 8)}
                            </span>
                            <span className="hidden sm:inline text-border">·</span>
                            <span className="hidden sm:inline">{durationLabel(order.duration)}</span>
                            <span className="text-border">·</span>
                            <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>

                      {/* Amount & Arrow */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-base font-bold tabular-nums">${order.amount.toFixed(2)}</p>
                        </div>
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground/50 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-200">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
