'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Save,
  ChevronRight,
  Plus,
  X,
  CreditCard,
  Key,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
   Main Page Component
   ──────────────────────────────────────────── */
export default function CreatePaymentMethodPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('bank')
  const [instructions, setInstructions] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [details, setDetails] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' },
  ])

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

      // Build details object, filter out empty keys
      const detailsObj: Record<string, string> = {}
      for (const pair of details) {
        if (pair.key.trim()) {
          detailsObj[pair.key.trim()] = pair.value.trim()
        }
      }

      setSubmitting(true)
      try {
        const res = await fetch('/api/admin/payment-methods', {
          method: 'POST',
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
          toast.success('Payment method created', {
            description: `"${name.trim()}" has been created successfully.`,
          })
          router.push('/admin/payment-methods')
        } else {
          const result = await res.json()
          toast.error('Failed to create', {
            description: result.error || 'Something went wrong.',
          })
        }
      } catch {
        toast.error('Error', {
          description: 'Failed to create payment method. Please try again.',
        })
      } finally {
        setSubmitting(false)
      }
    },
    [name, type, details, instructions, isActive, sortOrder, router]
  )

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
          <span className="text-foreground font-medium">New</span>
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
            <CardTitle className="text-lg font-semibold">Create Payment Method</CardTitle>
            <CardDescription>
              Add a new payment method for customers to use when paying for services.
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
                  Add account details as key-value pairs (e.g., &quot;Account Name&quot; → &quot;MilkyTech.Online&quot;).
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
              <div className="flex items-center justify-end gap-3 pt-2">
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
                      Creating…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Method
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
