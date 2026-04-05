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
  Filter,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'

interface Order {
  id: string
  status: string
  duration: string
  amount: number
  createdAt: string
  service: { id: string; title: string; slug: string; icon: string }
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-sky-100 text-sky-700 border-sky-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
}

const statusEmojis: Record<string, string> = {
  pending: '⏳', approved: '✓', completed: '✅', rejected: '✕',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusColors[status] || ''}`}>
      <span>{statusEmojis[status] || '•'}</span>
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

const filterTabs = ['All', 'Pending', 'Approved', 'Completed', 'Rejected'] as const
type FilterTab = typeof filterTabs[number]

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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-72" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-20 rounded-lg" />)}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" className="space-y-1">
        <motion.div variants={reveal} custom={0}>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">
            {orders.length} order{orders.length !== 1 ? 's' : ''} total · Track and manage your service orders
          </p>
        </motion.div>
      </motion.div>

      {/* Search + Filters */}
      <motion.div initial="hidden" animate="visible" variants={reveal} custom={1} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by service name or order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-card border-border/60"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {filterTabs.map(tab => {
            const count = tab === 'All' ? orders.length : orders.filter(o => o.status === tab.toLowerCase()).length
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeFilter === tab
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab}
                <span className={`text-xs ${activeFilter === tab ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-16 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
                <PackageOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">
                {search || activeFilter !== 'All' ? 'No matching orders' : 'No orders yet'}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                {search || activeFilter !== 'All'
                  ? 'Try adjusting your search or filter criteria.'
                  : "You haven't placed any orders yet. Browse our services to get started!"}
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/services">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Browse Services
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial="hidden" animate="visible" className="space-y-3">
          {filtered.map((order, i) => (
            <motion.div key={order.id} variants={scaleIn} custom={i}>
              <Link href={`/dashboard/orders/${order.id}`} className="block group">
                <Card className="border border-border/60 hover:border-primary/20 hover:shadow-md transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-4 sm:p-5">
                      {/* Icon */}
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-semibold text-sm truncate">{order.service.title}</h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center gap-2.5 mt-1.5 text-xs text-muted-foreground flex-wrap">
                          <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded">#{order.id.slice(0, 8)}</span>
                          <span>{durationLabel(order.duration)}</span>
                          <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>

                      {/* Amount + Arrow */}
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-lg font-bold">${order.amount.toFixed(2)}</p>
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
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
