'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSettings } from '@/hooks/use-settings'

interface PricingTier {
  label: string
  duration: string
  price: number
  popular?: boolean
  description?: string
}

interface Service {
  id: string
  title: string
  slug: string
  shortDescription: string
  longDescription: string
  features: string
  icon: string
  pricingType: string
  pricingTiers: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  orderCount: number
}

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

function getParsedTiers(service: Service): PricingTier[] {
  try {
    return JSON.parse(service.pricingTiers || '[]')
  } catch {
    return []
  }
}

function getDisplayPrice(service: Service, formatAmount: (n: number) => string): string {
  const tiers = getParsedTiers(service)
  if (tiers.length === 0) return 'N/A'
  const cheapest = Math.min(...tiers.map(t => t.price))

  if (service.pricingType === 'subscription') {
    const monthlyPrices = tiers.map(t => {
      const monthsMatch = t.duration.match(/(\d+)/)
      const months = monthsMatch ? parseInt(monthsMatch[1]) : 1
      return t.price / months
    })
    const cheapestMonthly = Math.min(...monthlyPrices)
    return `${formatAmount(cheapestMonthly)}/mo`
  }
  return formatAmount(cheapest)
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
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  )
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/40 overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <Skeleton className="h-3.5 w-20" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
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

function ServiceCard({
  service,
  togglingId,
  onToggle,
  onDeleteClick,
  formatAmount,
}: {
  service: Service
  togglingId: string | null
  onToggle: (s: Service) => void
  onDeleteClick: (s: Service) => void
  formatAmount: (n: number) => string
}) {
  const serviceIcon = getIcon(service.icon)
  const isToggling = togglingId === service.id

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-xl border border-border/40 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {React.createElement(serviceIcon, { className: 'h-5 w-5' })}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight truncate">
              {service.title}
            </p>
            <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">
              /{service.slug}
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              service.isActive
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              service.pricingType === 'subscription'
                ? 'bg-blue-500/10 text-blue-600'
                : 'bg-purple-500/10 text-purple-600'
            }`}
          >
            {service.pricingType === 'subscription' ? 'Subscription' : 'One-Time'}
          </span>
          <span className="text-sm font-semibold tabular-nums text-primary">
            From {getDisplayPrice(service, formatAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShoppingCart className="h-3 w-3" />
            <span>{service.orderCount} order{service.orderCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggle(service)}
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
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/admin/services/${service.id}`}>
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDeleteClick(service)}
              disabled={service.orderCount > 0}
              title={
                service.orderCount > 0
                  ? 'Cannot delete service with orders'
                  : 'Delete service'
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { formatAmount } = useSettings()

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
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchServices()

    return () => {
      cancelled = true
    }
  }, [])

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
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Package className="h-4.5 w-4.5 text-purple-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Services</h1>
            <p className="text-sm text-muted-foreground">
              {loading
                ? 'Loading services…'
                : `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''}${searchQuery.trim() ? ' found' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search services…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/40 border-border/40 focus-visible:bg-background"
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

      <motion.div variants={fadeUp}>
        {loading ? (
          <CardGridSkeleton />
        ) : filteredServices.length === 0 ? (
          <EmptyState hasSearch={searchQuery.trim().length > 0} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                togglingId={togglingId}
                onToggle={handleToggle}
                onDeleteClick={(s) => setDeleteTarget(s)}
                formatAmount={formatAmount}
              />
            ))}
          </div>
        )}
      </motion.div>

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