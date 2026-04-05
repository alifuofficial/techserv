'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Users,
  Search,
  Eye,
  DollarSign,
  TrendingUp,
  UserSearch,
  ArrowRight,
  Phone,
  MessageCircle,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
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

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
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
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/* ────────────────────────────────────────────
   Skeleton Loaders
   ──────────────────────────────────────────── */
function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-9 w-72" />
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/60 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-20 mt-2" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      {/* Header row skeleton */}
      <div className="hidden md:grid grid-cols-[44px_1.5fr_72px_0.7fr_0.7fr_72px_80px_0.7fr_72px] items-center gap-4 px-4 py-3 bg-muted/30 border-b border-border/60">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-14" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-12" />
        <Skeleton className="h-3.5 w-14" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-14 ml-auto" />
      </div>
      {/* Row skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="hidden md:grid grid-cols-[44px_1.5fr_72px_0.7fr_0.7fr_72px_80px_0.7fr_72px] items-center gap-4 px-4 py-3.5 border-b border-border/40 last:border-0"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-16 rounded-md ml-auto" />
        </div>
      ))}
      {/* Mobile card skeletons */}
      <div className="md:hidden divide-y divide-border/40">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Empty State
   ──────────────────────────────────────────── */
function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-lg border border-dashed border-border/80 py-16 px-6 flex flex-col items-center text-center"
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

/* ────────────────────────────────────────────
   Mobile Customer Card
   ──────────────────────────────────────────── */
function MobileCustomerCard({
  customer,
  index,
}: {
  customer: Customer
  index: number
}) {
  const isAdmin = customer.role === 'admin'

  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className="group"
    >
      <Link
        href={`/admin/customers/${customer.id}`}
        className="block rounded-lg border border-border/60 hover:border-primary/25 hover:bg-muted/20 transition-all"
      >
        <div className="p-4 space-y-3">
          {/* Top row: avatar + name + role badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-9 w-9">
                <AvatarFallback
                  className={`text-xs font-semibold ${
                    isAdmin
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight truncate">
                  {customer.name}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {customer.email}
                </p>
              </div>
            </div>
            <Badge
              variant={isAdmin ? 'default' : 'secondary'}
              className="shrink-0 text-[10px] px-2 py-0"
            >
              {customer.role}
            </Badge>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{customer.phone || '—'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{customer.telegram ? `@${customer.telegram}` : '—'}</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingCart className="h-3 w-3" />
              <span>{customer.orderCount}</span>
            </div>
          </div>

          {/* Bottom row: spent + arrow */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Joined {format(new Date(customer.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-primary">
                {formatCurrency(customer.totalSpent)}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  /* ── Fetch customers ── */
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
        // silently handle
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchCustomers()

    return () => {
      cancelled = true
    }
  }, [])

  /* ── Client-side search filter ── */
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const q = searchQuery.toLowerCase().trim()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    )
  }, [customers, searchQuery])

  /* ── Computed stats ── */
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
      {/* ── Page Header ── */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading
              ? 'Loading customers…'
              : `${filteredCustomers.length} customer${filteredCustomers.length !== 1 ? 's' : ''}${searchQuery.trim() ? ' found' : ' total'} · Manage your platform users`}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/40 border-border/60 focus-visible:bg-background"
          />
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div variants={fadeUp}>
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Customers */}
            <div className="rounded-xl border border-border/60 p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Customers
                </p>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight mt-1.5">
                {stats.totalCustomers}
              </p>
            </div>

            {/* Total Revenue */}
            <div className="rounded-xl border border-border/60 p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Revenue
                </p>
                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight mt-1.5 tabular-nums text-primary">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>

            {/* Avg Order Value */}
            <div className="rounded-xl border border-border/60 p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Avg Order Value
                </p>
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight mt-1.5 tabular-nums">
                {formatCurrency(stats.avgOrderValue)}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Table / Content ── */}
      <motion.div variants={fadeUp}>
        {loading ? (
          <TableSkeleton />
        ) : filteredCustomers.length === 0 ? (
          <EmptyState hasSearch={searchQuery.trim().length > 0} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-lg border border-border/60 overflow-hidden"
            >
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/25 hover:bg-muted/25 border-border/60">
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Customer
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                        Role
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Phone
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Telegram
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                        Orders
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                        Total Spent
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Joined
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right pr-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => {
                      const isAdmin = customer.role === 'admin'
                      return (
                        <TableRow
                          key={customer.id}
                          className="border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          {/* Avatar + Name + Email */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback
                                  className={`text-xs font-semibold ${
                                    isAdmin
                                      ? 'bg-primary/10 text-primary'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {getInitials(customer.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium leading-tight truncate">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-muted-foreground leading-tight truncate mt-0.5">
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Role */}
                          <TableCell className="text-center">
                            <Badge
                              variant={isAdmin ? 'default' : 'secondary'}
                              className="text-[10px] px-2 py-0"
                            >
                              {customer.role}
                            </Badge>
                          </TableCell>

                          {/* Phone */}
                          <TableCell>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {customer.phone || '—'}
                            </span>
                          </TableCell>

                          {/* Telegram */}
                          <TableCell>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {customer.telegram ? `@${customer.telegram}` : '—'}
                            </span>
                          </TableCell>

                          {/* Orders */}
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className="tabular-nums font-medium"
                            >
                              {customer.orderCount}
                            </Badge>
                          </TableCell>

                          {/* Total Spent */}
                          <TableCell className="text-right">
                            <span className="text-sm font-semibold tabular-nums text-primary">
                              {formatCurrency(customer.totalSpent)}
                            </span>
                          </TableCell>

                          {/* Joined */}
                          <TableCell>
                            <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
                              {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                            </span>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right pr-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-xs"
                              asChild
                            >
                              <Link href={`/admin/customers/${customer.id}`}>
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border/40">
                {filteredCustomers.map((customer, index) => (
                  <MobileCustomerCard
                    key={customer.id}
                    customer={customer}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  )
}
