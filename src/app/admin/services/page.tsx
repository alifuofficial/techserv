'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Package,
  PackageOpen,
  Crown,
  Bot,
  TrendingUp,
  ShieldCheck,
  Zap,
  Code,
  Smartphone,
  Globe,
  MessageCircle,
  PackageIcon,
  Settings,
  Wrench,
  Layers,
  Cpu,
  Wifi,
  Rocket,
  Loader2,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface Service {
  id: string
  title: string
  slug: string
  shortDescription: string
  longDescription: string
  features: string
  icon: string
  price3m: number
  price6m: number
  price12m: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  orderCount: number
}

/* ────────────────────────────────────────────
   Icon Mapping
   ──────────────────────────────────────────── */
const iconMap: Record<string, React.ElementType> = {
  Zap,
  Crown,
  Bot,
  TrendingUp,
  ShieldCheck,
  Code,
  Smartphone,
  Globe,
  MessageCircle,
  Package: PackageIcon,
  Settings,
  Wrench,
  Layers,
  Cpu,
  Wifi,
  Rocket,
}

function getIcon(name: string): React.ElementType {
  return iconMap[name] || Package
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
function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

/* ────────────────────────────────────────────
   Skeleton Loaders
   ──────────────────────────────────────────── */
function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-44" />
      </div>
      <Skeleton className="h-9 w-36" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      {/* Header row skeleton */}
      <div className="hidden md:grid grid-cols-[48px_1.5fr_0.8fr_0.8fr_0.8fr_80px_90px_100px] items-center gap-4 px-4 py-3 bg-muted/30 border-b border-border/60">
        <Skeleton className="h-3.5 w-10" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-14" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-20" />
      </div>
      {/* Row skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="hidden md:grid grid-cols-[48px_1.5fr_0.8fr_0.8fr_0.8fr_80px_90px_100px] items-center gap-4 px-4 py-3.5 border-b border-border/40 last:border-0"
        >
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-md ml-auto" />
        </div>
      ))}
      {/* Mobile card skeletons */}
      <div className="md:hidden divide-y divide-border/40">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
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
          <PackageOpen className="h-6 w-6 text-muted-foreground" />
        ) : (
          <Package className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-medium text-sm mb-1.5">
        {hasSearch ? 'No services match your search' : 'No services yet'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {hasSearch
          ? 'Try adjusting your search terms to find what you\'re looking for.'
          : 'Get started by creating your first service.'}
      </p>
      {!hasSearch && (
        <Button asChild className="mt-4" size="sm">
          <Link href="/admin/services/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Service
          </Link>
        </Button>
      )}
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Mobile Service Card
   ──────────────────────────────────────────── */
function MobileServiceCard({
  service,
  index,
  onToggle,
  onDelete,
}: {
  service: Service
  index: number
  onToggle: (s: Service) => void
  onDelete: (s: Service) => void
}) {
  const serviceIcon = getIcon(service.icon)

  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className="rounded-lg border border-border/60 hover:border-primary/25 hover:bg-muted/20 transition-all"
    >
      <div className="p-4 space-y-3">
        {/* Top row: icon + title + status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {React.createElement(serviceIcon, { className: 'h-4 w-4' })}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight truncate">
                {service.title}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                /{service.slug}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              service.isActive
                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800 shrink-0'
                : 'bg-muted text-muted-foreground border-border shrink-0'
            }
          >
            {service.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Prices */}
        <div className="flex items-center gap-2">
          {[
            { label: '3mo', price: service.price3m },
            { label: '6mo', price: service.price6m },
            { label: '12mo', price: service.price12m },
          ].map((p) => (
            <div
              key={p.label}
              className="flex-1 rounded-md bg-muted/50 px-2.5 py-1.5 text-center"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {p.label}
              </p>
              <p className="text-xs font-semibold tabular-nums">{formatPrice(p.price)}</p>
            </div>
          ))}
        </div>

        {/* Bottom: orders + actions */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShoppingCart className="h-3 w-3" />
            <span>{service.orderCount} order{service.orderCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onToggle(service)}
              disabled={service.orderCount > 0}
            >
              {service.isActive ? (
                <PowerOff className="h-3 w-3 mr-1" />
              ) : (
                <Power className="h-3 w-3 mr-1" />
              )}
              {service.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
              <Link href={`/admin/services/${service.id}`}>
                <Pencil className="h-3 w-3" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              onClick={() => onDelete(service)}
              disabled={service.orderCount > 0}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

  /* ── Fetch services ── */
  useEffect(() => {
    let cancelled = false

    async function fetchServices() {
      try {
        const res = await fetch('/api/admin/services')
        if (res.ok && !cancelled) {
          const data = await res.json()
          setServices(data)
        }
      } catch {
        // silently handle
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchServices()

    return () => {
      cancelled = true
    }
  }, [])

  /* ── Client-side search filter ── */
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services
    const q = searchQuery.toLowerCase().trim()
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q)
    )
  }, [services, searchQuery])

  /* ── Toggle active status ── */
  const handleToggle = useCallback(async (service: Service) => {
    if (togglingId) return
    setTogglingId(service.id)
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !service.isActive }),
      })
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === service.id ? { ...s, isActive: !s.isActive } : s
          )
        )
        toast.success(service.isActive ? 'Service deactivated' : 'Service activated', {
          description: `"${service.title}" is now ${service.isActive ? 'inactive' : 'active'}.`,
        })
      } else {
        toast.error('Failed to update', {
          description: 'Could not toggle service status.',
        })
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to update service status.',
      })
    } finally {
      setTogglingId(null)
    }
  }, [togglingId])

  /* ── Delete service ── */
  const handleDelete = useCallback(async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/services/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id))
        toast.success('Service deleted', {
          description: `"${deleteTarget.title}" has been removed.`,
        })
      } else {
        const data = await res.json()
        toast.error('Failed to delete', {
          description: data.error || 'Something went wrong.',
        })
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to delete service.',
      })
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget, deleting])

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
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading
              ? 'Loading services…'
              : `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''}${searchQuery.trim() ? ' found' : ' total'}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search services…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/40 border-border/60 focus-visible:bg-background"
            />
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/admin/services/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Service
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* ── Table / Content ── */}
      <motion.div variants={fadeUp}>
        {loading ? (
          <TableSkeleton />
        ) : filteredServices.length === 0 ? (
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
                        Service
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                        3 Months
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                        6 Months
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                        12 Months
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                        Orders
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right pr-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => {
                      const serviceIcon = getIcon(service.icon)
                      const isToggling = togglingId === service.id

                      return (
                        <TableRow
                          key={service.id}
                          className="border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          {/* Icon + Title + Slug */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                {React.createElement(serviceIcon, { className: 'h-4.5 w-4.5' })}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium leading-tight truncate">
                                  {service.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  /{service.slug}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Prices */}
                          <TableCell className="text-right">
                            <span className="text-sm tabular-nums font-medium">
                              {formatPrice(service.price3m)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm tabular-nums font-medium">
                              {formatPrice(service.price6m)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm tabular-nums font-semibold text-primary">
                              {formatPrice(service.price12m)}
                            </span>
                          </TableCell>

                          {/* Orders */}
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className="tabular-nums font-medium"
                            >
                              {service.orderCount}
                            </Badge>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={
                                service.isActive
                                  ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800'
                                  : 'bg-muted text-muted-foreground border-border'
                              }
                            >
                              {service.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right pr-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-xs"
                                onClick={() => handleToggle(service)}
                                disabled={isToggling}
                                title={service.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {isToggling ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : service.isActive ? (
                                  <PowerOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Power className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-xs"
                                asChild
                              >
                                <Link href={`/admin/services/${service.id}`}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2.5 text-xs text-destructive hover:text-destructive"
                                    disabled={service.orderCount > 0}
                                    title={
                                      service.orderCount > 0
                                        ? 'Cannot delete service with orders'
                                        : 'Delete service'
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;{service.title}&quot;?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDelete}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border/40">
                {filteredServices.map((service, index) => (
                  <MobileServiceCard
                    key={service.id}
                    service={service}
                    index={index}
                    onToggle={handleToggle}
                    onDelete={(s) => setDeleteTarget(s)}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* ── Delete Confirmation Dialog (Mobile) ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
