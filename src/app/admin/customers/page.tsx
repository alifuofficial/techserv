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
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useSettings } from '@/hooks/use-settings'

interface Customer {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  telegram: string | null
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

function CardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/40 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
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
  const { formatAmount } = useSettings()

  useEffect(() => {
    let cancelled = false

    async function fetchCustomers() {
      try {
        const res = await fetch('/api/admin/customers')
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
          <CardSkeleton />
        ) : filteredCustomers.length === 0 ? (
          <EmptyState hasSearch={searchQuery.trim().length > 0} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => {
              const isAdmin = customer.role === 'admin'
              return (
                <motion.div key={customer.id} variants={fadeUp}>
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="block rounded-xl border border-border/40 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                            isAdmin
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {getInitials(customer.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight truncate">
                            {customer.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {customer.email}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            isAdmin
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {customer.role}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{customer.phone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="h-3 w-3" />
                          <span className="truncate">{customer.telegram ? `@${customer.telegram}` : '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShoppingCart className="h-3 w-3" />
                          <span>{customer.orderCount} order{customer.orderCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(customer.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-primary">
                          {formatAmount(customer.totalSpent)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}