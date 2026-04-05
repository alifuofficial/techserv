'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Save,
  ChevronRight,
  Plus,
  X,
  Trash2,
  AlertCircle,
  CreditCard,
  Key,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
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

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
function parseDetails(detailsStr: string): Record<string, string> {
  try {
    return JSON.parse(detailsStr || '{}')
  } catch {
    return {}
  }
}

/* ────────────────────────────────────────────
   Skeleton Loader
   ──────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-28" />
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Card skeleton */}
      <Skeleton className="h-12 w-72 rounded-lg" />
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function EditPaymentMethodPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState('bank')
  const [instructions, setInstructions] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [details, setDetails] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' },
  ])

  /* ── Fetch payment method ── */
  useEffect(() => {
    let cancelled = false

    async function fetchMethod() {
      try {
        const res = await fetch(`/api/admin/payment-methods/${id}`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setMethod(data)
          setName(data.name || '')
          setType(data.type || 'bank')
          setInstructions(data.instructions || '')
          setIsActive(data.isActive ?? true)
          setSortOrder(data.sortOrder ?? 0)

          // Parse details into key-value pairs
          const parsed = parseDetails(data.details || '{}')
          const entries = Object.entries(parsed)
          if (entries.length > 0) {
            setDetails(entries.map(([key, value]) => ({ key, value })))
          } else {
            setDetails([{ key: '', value: '' }])
          }
        } else if (!cancelled) {
          setNotFound(true)
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMethod()

    return () => {
      cancelled = true
    }
  }, [id])

  /* ── Detail pair management ── */
  const addDetailPair = useCallback(() => {
    setDetails((prev) => [...prev, { key: '', value: '' }])
  }, [])

  const removeDetailPair = useCallback((index: number) => {
    setDetails((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const updateDetailPair = useCallback((index: number, field: 'key' | 'value', value: string) => {
    setDetails((prev) =>
      prev.map((pair, i) => (i === index ? { ...pair, [field]: value } : pair))
    )
  }, [])

  /* ── Submit handler ── */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!name.trim()) {
        toast.error('Validation Error', {
          description: 'Name is required.',
        })
        return
      }

      // Build details object
      const detailsObj: Record<string, string> = {}
      for (const pair of details) {
        if (pair.key.trim()) {
          detailsObj[pair.key.trim()] = pair.value.trim()
        }
      }

      setSubmitting(true)
      try {
        const res = await fetch(`/api/admin/payment-methods/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            type,
            details: detailsObj,
            instructions,
            isActive,
            sortOrder,
          }),
        })

        if (res.ok) {
          toast.success('Payment method updated', {
            description: `"${name.trim()}" has been updated successfully.`,
          })
          router.push('/admin/payment-methods')
        } else {
          const result = await res.json()
          toast.error('Failed to update', {
            description: result.error || 'Something went wrong.',
          })
        }
      } catch {
        toast.error('Error', {
          description: 'Failed to update payment method. Please try again.',
        })
      } finally {
        setSubmitting(false)
      }
    },
    [name, type, details, instructions, isActive, sortOrder, id, router]
  )

  /* ── Delete handler ── */
  const handleDelete = useCallback(async () => {
    if (!method || deleting) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/payment-methods/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Payment method deleted', {
          description: `"${method.name}" has been removed.`,
        })
        router.push('/admin/payment-methods')
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
      setDeleteOpen(false)
    }
  }, [method, deleting, id, router])

  /* ── Loading state ── */
  if (loading) {
    return <DetailSkeleton />
  }

  /* ── Not found state ── */
  if (notFound || !method) {
    return (
      <div className="p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center text-center py-20"
        >
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
            <AlertCircle className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-1.5">Payment Method Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            The payment method you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button variant="outline" asChild>
            <Link href="/admin/payment-methods">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payment Methods
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* ── Breadcrumb + Back ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/admin/payment-methods"
            className="hover:text-foreground transition-colors"
          >
            Payment Methods
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Edit</span>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -mr-2">
          <Link href="/admin/payment-methods">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Back to Payment Methods</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
      </motion.div>

      {/* ── Form Card ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Edit Payment Method</CardTitle>
            <CardDescription>
              Update the details for &quot;{method.name}&quot;.
              {method._count.invoices > 0 && (
                <span className="block mt-1 text-amber-600 dark:text-amber-400">
                  This method has {method._count.invoices} invoice
                  {method._count.invoices !== 1 ? 's' : ''} and cannot be deleted.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ── Basic Information ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Basic Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Bank of America"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-muted/30 border-border/60 focus-visible:bg-background"
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="h-9 bg-muted/30 border-border/60">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── Account Details (Dynamic Key-Value Pairs) ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    Account Details
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDetailPair}
                    className="h-7 text-xs gap-1.5"
                  >
                    <Plus className="h-3 w-3" />
                    Add Field
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add account details as key-value pairs (e.g., &quot;Account Name&quot; → &quot;TechServ&quot;).
                </p>

                <div className="space-y-3">
                  {details.map((pair, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Field name (e.g., Account Number)"
                        value={pair.key}
                        onChange={(e) => updateDetailPair(index, 'key', e.target.value)}
                        className="flex-1 h-9 text-sm bg-muted/30 border-border/60 focus-visible:bg-background"
                      />
                      <Input
                        placeholder="Value"
                        value={pair.value}
                        onChange={(e) => updateDetailPair(index, 'value', e.target.value)}
                        className="flex-1 h-9 text-sm bg-muted/30 border-border/60 focus-visible:bg-background font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeDetailPair(index)}
                        disabled={details.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* ── Instructions ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Payment Instructions
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Instructions for customers on how to make payment using this method…"
                    rows={4}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="resize-none bg-muted/30 border-border/60 focus-visible:bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    These instructions will be shown to customers when selecting this payment method.
                  </p>
                </div>
              </div>

              <Separator />

              {/* ── Settings ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  Settings
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                      className="bg-muted/30 border-border/60 focus-visible:bg-background tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower values appear first. Default: 0
                    </p>
                  </div>

                  {/* Is Active */}
                  <div className="flex items-start gap-3 pt-1">
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      id="isActive"
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive" className="cursor-pointer">
                        Active
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Payment method will be available to customers when active
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── Actions ── */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                {/* Delete button */}
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => setDeleteOpen(true)}
                    disabled={method._count.invoices > 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Method
                    {method._count.invoices > 0 && (
                      <span className="ml-2 text-xs opacity-60">
                        ({method._count.invoices} invoices)
                      </span>
                    )}
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{method.name}&quot;?
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

                {/* Save / Cancel */}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={submitting}
                  >
                    <Link href="/admin/payment-methods">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
