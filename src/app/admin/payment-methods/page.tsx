'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Smartphone,
  Landmark,
  Wallet,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
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

interface PaymentMethod {
  id: string
  name: string
  type: string
  isActive: boolean
  sortOrder: number
  details: string
  instructions: string
  createdAt: string
  updatedAt: string
  _count: {
    invoices: number
  }
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
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const typeConfig: Record<
  string,
  {
    label: string
    icon: React.ElementType
    iconBg: string
    badgeClass: string
  }
> = {
  bank: {
    label: 'Bank',
    icon: Landmark,
    iconBg: 'bg-blue-500/10 text-blue-600',
    badgeClass: 'bg-blue-500/10 text-blue-600',
  },
  mobile_money: {
    label: 'Mobile Money',
    icon: Smartphone,
    iconBg: 'bg-purple-500/10 text-purple-600',
    badgeClass: 'bg-purple-500/10 text-purple-600',
  },
  crypto: {
    label: 'Crypto',
    icon: Wallet,
    iconBg: 'bg-orange-500/10 text-orange-600',
    badgeClass: 'bg-orange-500/10 text-orange-600',
  },
  other: {
    label: 'Other',
    icon: CreditCard,
    iconBg: 'bg-muted text-muted-foreground',
    badgeClass: 'bg-muted text-muted-foreground',
  },
}

function parseDetails(detailsStr: string): Record<string, string> {
  try {
    return JSON.parse(detailsStr || '{}')
  } catch {
    return {}
  }
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <Skeleton className="h-9 w-32" />
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/40 overflow-hidden space-y-4 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-9 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <div className="border-t border-border/40 pt-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-dashed border-border/80 py-16 px-6 flex flex-col items-center text-center"
    >
      <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
        <CreditCard className="h-6 w-6 text-orange-600" />
      </div>
      <h3 className="font-medium text-sm mb-1.5">No payment methods yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        Add your first payment method to start receiving payments from customers.
      </p>
      <Button asChild className="mt-4" size="sm">
        <Link href="/admin/payment-methods/new">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Method
        </Link>
      </Button>
    </motion.div>
  )
}

function PaymentMethodCard({
  method,
  index,
  onToggle,
  onDelete,
}: {
  method: PaymentMethod
  index: number
  onToggle: (m: PaymentMethod) => void
  onDelete: (m: PaymentMethod) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [toggling, setToggling] = useState(false)
  const details = parseDetails(method.details)
  const detailEntries = Object.entries(details)
  const typeConf = typeConfig[method.type] || typeConfig.other

  const isLongInstructions = method.instructions.length > 100
  const displayInstructions = expanded
    ? method.instructions
    : isLongInstructions
      ? method.instructions.slice(0, 100) + '…'
      : method.instructions

  const Icon = typeConf.icon

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div
        className={`rounded-xl border border-border/40 overflow-hidden transition-all hover:shadow-sm ${
          !method.isActive ? 'opacity-60' : ''
        }`}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${typeConf.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-tight truncate">
                  {method.name}
                </h3>
                <Badge
                  variant="secondary"
                  className={`mt-1 text-[10px] px-2 py-0 rounded-md border-0 ${typeConf.badgeClass}`}
                >
                  {typeConf.label}
                </Badge>
              </div>
            </div>
            <Switch
              checked={method.isActive}
              onCheckedChange={() => {
                setToggling(true)
                onToggle(method)
                setTimeout(() => setToggling(false), 500)
              }}
              className={toggling ? 'pointer-events-none' : ''}
            />
          </div>

          {detailEntries.length > 0 && (
            <div className="space-y-1.5">
              {detailEntries.map(([key, value]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="text-muted-foreground text-xs font-medium min-w-[100px] shrink-0">
                    {key}:
                  </span>
                  <span className="font-mono text-xs break-all">{value}</span>
                </div>
              ))}
            </div>
          )}

          {method.instructions && (
            <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
              {displayInstructions}
              {isLongInstructions && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="ml-1 text-primary font-medium hover:underline inline-flex items-center gap-0.5"
                >
                  {expanded ? (
                    <>
                      Show less <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border/40 px-5 py-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {method._count.invoices} invoice{method._count.invoices !== 1 ? 's' : ''} · Sort: {method.sortOrder}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <Link href={`/admin/payment-methods/${method.id}`}>
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(method)}
              disabled={method._count.invoices > 0}
              title={method._count.invoices > 0 ? `Cannot delete (${method._count.invoices} invoices)` : 'Delete'}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchMethods() {
      try {
        const res = await fetch('/api/admin/payment-methods')
        if (res.ok && !cancelled) {
          const data = await res.json()
          setMethods(data)
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchMethods()

    return () => {
      cancelled = true
    }
  }, [])

  const handleToggle = useCallback(
    async (method: PaymentMethod) => {
      if (togglingId) return
      setTogglingId(method.id)
      try {
        const res = await fetch(`/api/admin/payment-methods/${method.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !method.isActive }),
        })
        if (res.ok) {
          setMethods((prev) =>
            prev.map((m) =>
              m.id === method.id ? { ...m, isActive: !m.isActive } : m
            )
          )
          toast.success(method.isActive ? 'Method deactivated' : 'Method activated', {
            description: `"${method.name}" is now ${method.isActive ? 'inactive' : 'active'}.`,
          })
        } else {
          toast.error('Failed to update', {
            description: 'Could not toggle method status.',
          })
        }
      } catch {
        toast.error('Error', {
          description: 'Failed to update method status.',
        })
      } finally {
        setTogglingId(null)
      }
    },
    [togglingId]
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/payment-methods/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setMethods((prev) => prev.filter((m) => m.id !== deleteTarget.id))
        toast.success('Method deleted', {
          description: `"${deleteTarget.name}" has been removed.`,
        })
      } else {
        const data = await res.json()
        toast.error('Failed to delete', {
          description: data.error || 'Something went wrong.',
        })
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to delete payment method.',
      })
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget, deleting])

  const sortedMethods = useMemo(() => {
    return [...methods].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [methods])

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Payment Methods</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading
                ? 'Loading payment methods…'
                : `${methods.length} payment method${methods.length !== 1 ? 's' : ''} configured`}
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/admin/payment-methods/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Method
          </Link>
        </Button>
      </motion.div>

      <motion.div variants={fadeUp}>
        {loading ? (
          <CardsSkeleton />
        ) : sortedMethods.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            {sortedMethods.map((method, index) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                index={index}
                onToggle={handleToggle}
                onDelete={(m) => setDeleteTarget(m)}
              />
            ))}
          </motion.div>
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
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
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