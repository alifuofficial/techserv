'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Users,
  Search,
  DollarSign,
  TrendingUp,
  UserSearch,
  Phone,
  MessageCircle,
  ShoppingCart,
  ArrowRight,
  Calendar,
  Ban,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useSettings } from '@/hooks/use-settings'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Customer {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  telegram: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  orderCount: number
  totalSpent: number
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <Skeleton className="h-9 w-72" />
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/40 overflow-hidden">
          <Skeleton className="h-1 w-full" />
          <div className="p-4">
            <Skeleton className="h-3.5 w-24 mb-2" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden bg-card shadow-sm">
      <div className="p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/40 py-4 last:border-0">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-4 w-16 hidden sm:block" />
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-dashed border-border/80 py-16 px-6 flex flex-col items-center text-center"
    >
      <div className="h-12 w-12 rounded-xl bg-muted/80 flex items-center justify-center mb-4">
        {hasSearch ? (
          <UserSearch className="h-6 w-6 text-muted-foreground" />
        ) : (
          <Users className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-medium text-sm mb-1.5">
        {hasSearch ? 'No customers match your search' : 'No customers yet'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {hasSearch
          ? 'Try adjusting your search terms to find what you\'re looking for.'
          : 'Customers will appear here once they register on the platform.'}
      </p>
    </motion.div>
  )
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [banningId, setBanningId] = useState<string | null>(null)
  const { formatAmount } = useSettings()

  useEffect(() => {
    let cancelled = false

    async function fetchCustomers() {
      try {
        const res = await fetch('/api/admin/customers', { cache: 'no-store' })
        if (res.ok && !cancelled) {
          const data = await res.json()
          setCustomers(data)
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchCustomers()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleToggleBan(customer: Customer) {
    if (customer.role === 'admin') {
      toast.error('Cannot ban admin users')
      return
    }
    
    const action = customer.isActive ? 'ban' : 'unban'
    if (!window.confirm(`Are you sure you want to ${action} ${customer.name}?`)) return

    setBanningId(customer.id)
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: customer.id,
          isActive: !customer.isActive,
        }),
      })

      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? { ...c, isActive: !c.isActive } : c))
        )
        toast.success(`Customer ${customer.isActive ? 'banned' : 'unbanned'} successfully`)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update customer')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setBanningId(null)
    }
  }

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const q = searchQuery.toLowerCase().trim()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    )
  }, [customers, searchQuery])

  const stats = useMemo(() => {
    const totalCustomers = customers.length
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
    const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    return { totalCustomers, totalRevenue, avgOrderValue }
  }, [customers])

  return (
    <motion.div
      className="p-4 md:p-6 space-y-5"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Users className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Customers</h1>
            <p className="text-sm text-muted-foreground">
              {loading
                ? 'Loading…'
                : `${filteredCustomers.length} customer${filteredCustomers.length !== 1 ? 's' : ''}${searchQuery.trim() ? ' found' : ''}`}
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/40 border-border/40 focus-visible:bg-background"
          />
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/40 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
              <div className="p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Total Customers
                </p>
                <p className="text-2xl font-bold tracking-tight mt-1">
                  {stats.totalCustomers}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
              <div className="p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold tracking-tight mt-1 tabular-nums text-primary">
                  {formatAmount(stats.totalRevenue)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-400" />
              <div className="p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold tracking-tight mt-1 tabular-nums">
                  {formatAmount(stats.avgOrderValue)}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div variants={fadeUp}>
        {loading ? (
          <TableSkeleton />
        ) : filteredCustomers.length === 0 ? (
          <EmptyState hasSearch={searchQuery.trim().length > 0} />
        ) : (
          <div className="rounded-xl border border-border/40 shadow-sm overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[280px]">Customer</TableHead>
                    <TableHead>Contact / Source</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const isAdmin = customer.role === 'admin'
                    const isTelegram = customer.email.includes('@telegram.user')
                    const isBanned = customer.isActive === false
                    return (
                      <TableRow key={customer.id} className={`group transition-colors ${isBanned ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-muted/20'}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${isAdmin ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : isBanned ? 'bg-red-500/10 text-red-600' : 'bg-muted text-muted-foreground'}`}>
                              {getInitials(customer.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-bold truncate transition-colors ${isBanned ? 'text-red-600' : 'text-foreground group-hover:text-primary'}`}>
                                  {customer.name}
                                </p>
                                {isAdmin && <Badge variant="secondary" className="px-1.5 py-0 min-w-0 text-[9px] bg-primary/10 text-primary uppercase">Admin</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 min-w-0">
                            {customer.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" /> <span className="truncate">{customer.phone}</span>
                              </div>
                            )}
                            {customer.telegram && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MessageCircle className="h-3 w-3" /> <span className="truncate">@{customer.telegram}</span>
                              </div>
                            )}
                            <Badge variant="outline" className={`mt-1 text-[9px] px-1.5 py-0 uppercase border-dashed ${isTelegram ? 'border-sky-500/50 text-sky-600 bg-sky-500/5' : 'border-emerald-500/50 text-emerald-600 bg-emerald-500/5'}`}>
                              Via {isTelegram ? 'Telegram' : 'Email'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-muted/30 border border-border/50 text-sm font-semibold tabular-nums text-foreground">
                            {customer.orderCount}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">Recorded</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="text-sm font-bold tabular-nums text-primary">
                            {formatAmount(customer.totalSpent)}
                          </p>
                          <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                            <Calendar className="h-3 w-3" />
                            Registered {format(new Date(customer.createdAt), 'MMM yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {isBanned ? (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                              <Ban className="h-3 w-3 mr-1" />
                              Banned
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/customers/${customer.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                            {!isAdmin && (
                              <button
                                onClick={() => handleToggleBan(customer)}
                                disabled={banningId === customer.id}
                                className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
                                  isBanned
                                    ? 'hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600'
                                    : 'hover:bg-red-500/10 text-muted-foreground hover:text-red-600'
                                } disabled:opacity-50`}
                                title={isBanned ? 'Unban user' : 'Ban user'}
                              >
                                {banningId === customer.id ? (
                                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : isBanned ? (
                                  <UserCheck className="h-4 w-4" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}