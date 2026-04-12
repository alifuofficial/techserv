'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Save,
  DollarSign,
  Tag,
  Layers,
  Sparkles,
  BarChart3,
  Plus,
  X,
  Repeat,
  CreditCard,
  Star,
  Zap,
  Crown,
  Bot,
  TrendingUp,
  ShieldCheck,
  Code,
  Smartphone,
  Globe,
  MessageCircle,
  Package,
  Settings,
  Wrench,
  LayersIcon,
  Cpu,
  Wifi,
  Rocket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface PricingTier {
  label: string
  duration: string
  price: number
  popular?: boolean
  description?: string
}

interface ServiceFormData {
  title: string
  slug: string
  shortDescription: string
  longDescription: string
  features: string
  icon: string
  sortOrder: number
  isActive: boolean
}

/* ────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────── */
const SUBSCRIPTION_DURATIONS = [
  { value: '1month', label: '1 Month' },
  { value: '3months', label: '3 Months' },
  { value: '6months', label: '6 Months' },
  { value: '1year', label: '1 Year' },
  { value: '2years', label: '2 Years' },
]

/* ────────────────────────────────────────────
   Icon Options
   ──────────────────────────────────────────── */
const iconOptions = [
  { name: 'Zap', Icon: Zap },
  { name: 'Crown', Icon: Crown },
  { name: 'Bot', Icon: Bot },
  { name: 'TrendingUp', Icon: TrendingUp },
  { name: 'ShieldCheck', Icon: ShieldCheck },
  { name: 'Code', Icon: Code },
  { name: 'Smartphone', Icon: Smartphone },
  { name: 'Globe', Icon: Globe },
  { name: 'MessageCircle', Icon: MessageCircle },
  { name: 'Package', Icon: Package },
  { name: 'Settings', Icon: Settings },
  { name: 'Wrench', Icon: Wrench },
  { name: 'Layers', Icon: LayersIcon },
  { name: 'Cpu', Icon: Cpu },
  { name: 'Wifi', Icon: Wifi },
  { name: 'Rocket', Icon: Rocket },
]

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
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
}

function createEmptyTier(pricingType: string): PricingTier {
  return {
    label: '',
    duration: pricingType === 'one_time' ? 'one_time' : '3months',
    price: 0,
    popular: false,
    description: '',
  }
}

/* ────────────────────────────────────────────
   Tier Editor Component
   ──────────────────────────────────────────── */
function TierEditor({
  tier,
  index,
  pricingType,
  totalTiers,
  onUpdate,
  onRemove,
}: {
  tier: PricingTier
  index: number
  pricingType: string
  totalTiers: number
  onUpdate: (index: number, field: keyof PricingTier, value: string | number | boolean) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="relative rounded-xl border border-border/40 bg-muted/20 p-4 space-y-3">
      {/* Tier header with number + remove */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Tier {index + 1}
        </span>
        {totalTiers > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Remove tier"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Tier inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Label */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input
            placeholder={pricingType === 'subscription' ? 'e.g., 3 Months' : 'e.g., Basic Bot'}
            value={tier.label}
            onChange={(e) => onUpdate(index, 'label', e.target.value)}
            className="h-8 text-sm bg-muted/30 border-border/60 focus-visible:bg-background"
          />
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Duration</Label>
          {pricingType === 'subscription' ? (
            <Select
              value={tier.duration}
              onValueChange={(val) => onUpdate(index, 'duration', val)}
            >
              <SelectTrigger className="h-8 text-sm bg-muted/30 border-border/60 w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value="One-Time"
              disabled
              className="h-8 text-sm bg-muted/50 border-border/60 text-muted-foreground cursor-not-allowed"
            />
          )}
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Price</Label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={tier.price || ''}
              onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)}
              className="h-8 text-sm pl-6 pr-2 bg-muted/30 border-border/60 focus-visible:bg-background tabular-nums"
            />
          </div>
        </div>

        {/* Popular toggle */}
        <div className="flex items-end pb-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Switch
              checked={tier.popular || false}
              onCheckedChange={(checked) => onUpdate(index, 'popular', checked)}
              className="data-[state=checked]:bg-amber-500"
            />
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">Popular</span>
            </div>
          </label>
        </div>
      </div>

      {/* Description (more prominent for one-time) */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          Description {pricingType === 'one_time' && <span className="text-primary">(recommended)</span>}
        </Label>
        <Input
          placeholder={pricingType === 'one_time' ? "What's included in this plan?" : 'Optional description'}
          value={tier.description || ''}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          className="h-8 text-sm bg-muted/30 border-border/60 focus-visible:bg-background"
        />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function CreateServicePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [pricingType, setPricingType] = useState<string>('subscription')
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    createEmptyTier('subscription'),
  ])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormData>({
    defaultValues: {
      title: '',
      slug: '',
      shortDescription: '',
      longDescription: '',
      features: '',
      icon: 'Zap',
      sortOrder: 0,
      isActive: true,
    },
  })

  const title = watch('title')
  const selectedIcon = watch('icon')

  /* ── Auto-generate slug from title ── */
  useEffect(() => {
    const slug = generateSlug(title)
    setValue('slug', slug)
  }, [title, setValue])

  /* ── Tier management ── */
  const addTier = useCallback(() => {
    setPricingTiers((prev) => [...prev, createEmptyTier(pricingType)])
  }, [pricingType])

  const removeTier = useCallback((index: number) => {
    setPricingTiers((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const updateTier = useCallback(
    (index: number, field: keyof PricingTier, value: string | number | boolean) => {
      setPricingTiers((prev) =>
        prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier))
      )
    },
    []
  )

  /* ── Handle pricing type change ── */
  const handlePricingTypeChange = useCallback((newType: string) => {
    setPricingType(newType)
    setPricingTiers([createEmptyTier(newType)])
  }, [])

  /* ── Submit handler ── */
  const onSubmit = useCallback(
    async (data: ServiceFormData) => {
      // Validate tiers
      const validTiers = pricingTiers.filter((t) => t.label.trim() && t.price > 0)
      if (validTiers.length === 0) {
        toast.error('Validation Error', {
          description: 'At least one tier with a label and price is required.',
        })
        return
      }

      setSubmitting(true)
      try {
        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            pricingType,
            pricingTiers: validTiers.map((t) => ({
              label: t.label.trim(),
              duration: pricingType === 'one_time' ? 'one_time' : t.duration,
              price: Number(t.price),
              popular: !!t.popular,
              description: (t.description || '').trim(),
            })),
            sortOrder: Number(data.sortOrder),
          }),
        })

        if (res.ok) {
          toast.success('Service created', {
            description: `"${data.title}" has been created successfully.`,
          })
          router.push('/admin/services')
        } else {
          const result = await res.json()
          toast.error('Failed to create', {
            description: result.error || 'Something went wrong.',
          })
        }
      } catch {
        toast.error('Error', {
          description: 'Failed to create service. Please try again.',
        })
      } finally {
        setSubmitting(false)
      }
    },
    [pricingType, pricingTiers, router]
  )

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/services" className="h-9 w-9 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Save className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">New Service</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Create a new service for your platform</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Form Card ── */}
      <motion.div variants={fadeUp}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* ── Basic Information ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Tag className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-semibold text-sm">Basic Information</span>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Premium Bot License"
                    {...register('title', { required: 'Title is required' })}
                    className="bg-muted/30 border-border/60 focus-visible:bg-background"
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title.message}</p>
                  )}
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="e.g., premium-bot-license"
                    {...register('slug')}
                    className="bg-muted/30 border-border/60 focus-visible:bg-background font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from title. Edit if needed.
                  </p>
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">
                    Short Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="shortDescription"
                    placeholder="A brief description for cards and listings…"
                    rows={2}
                    {...register('shortDescription', {
                      required: 'Short description is required',
                    })}
                    className="resize-none bg-muted/30 border-border/60 focus-visible:bg-background"
                  />
                  {errors.shortDescription && (
                    <p className="text-xs text-destructive">
                      {errors.shortDescription.message}
                    </p>
                  )}
                </div>

                {/* Long Description */}
                <div className="space-y-2">
                  <Label htmlFor="longDescription">Long Description</Label>
                  <Textarea
                    id="longDescription"
                    placeholder="Detailed description for the service page…"
                    rows={4}
                    {...register('longDescription')}
                    className="resize-none bg-muted/30 border-border/60 focus-visible:bg-background"
                  />
                </div>
              </div>

              <Separator className="my-8" />

              {/* ── Icon Selection ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="font-semibold text-sm">Service Icon</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {iconOptions.map(({ name, Icon }) => {
                    const isSelected = selectedIcon === name
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setValue('icon', name)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border/40 bg-muted/30 hover:border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-[10px] leading-tight font-medium truncate w-full text-center">
                          {name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Separator className="my-8" />

              {/* ── Features ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-semibold text-sm">Features</span>
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter features separated by commas, e.g., Auto-update, Premium support, Multi-device"
                    rows={3}
                    {...register('features')}
                    className="resize-none bg-muted/30 border-border/60 focus-visible:bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple features with commas
                  </p>
                </div>
              </div>

              <Separator className="my-8" />

              {/* ── Pricing ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-semibold text-sm">Pricing</span>
                </div>

                {/* Pricing Type Toggle */}
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => handlePricingTypeChange('subscription')}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      pricingType === 'subscription'
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border/40 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50'
                    }`}
                  >
                    <Repeat className="h-4 w-4" />
                    Recurring Subscription
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePricingTypeChange('one_time')}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      pricingType === 'one_time'
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border/40 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    One-Time Payment
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {pricingType === 'subscription'
                    ? 'Customers will be charged periodically for the selected duration.'
                    : 'Customers pay once for the selected plan. No recurring billing.'}
                </p>

                {/* Pricing Tiers Editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Pricing Tiers</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTier}
                      className="h-7 text-xs gap-1.5"
                    >
                      <Plus className="h-3 w-3" />
                      Add Tier
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {pricingTiers.map((tier, index) => (
                      <TierEditor
                        key={index}
                        tier={tier}
                        index={index}
                        pricingType={pricingType}
                        totalTiers={pricingTiers.length}
                        onUpdate={updateTier}
                        onRemove={removeTier}
                      />
                    ))}
                  </div>

                  {pricingTiers.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border/80 py-8 flex flex-col items-center text-center">
                      <p className="text-sm text-muted-foreground">No pricing tiers yet</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addTier}
                        className="mt-2 text-xs gap-1.5"
                      >
                        <Plus className="h-3 w-3" />
                        Add your first tier
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-8" />

              {/* ── Settings ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-slate-500/10 flex items-center justify-center">
                    <BarChart3 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-semibold text-sm">Settings</span>
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
                      {...register('sortOrder', { min: { value: 0, message: 'Must be >= 0' } })}
                      className="bg-muted/30 border-border/60 focus-visible:bg-background tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower values appear first. Default: 0
                    </p>
                  </div>

                  {/* Is Active */}
                  <div className="flex items-start gap-3 pt-1">
                    <Switch
                      checked={watch('isActive')}
                      onCheckedChange={(checked) => setValue('isActive', checked)}
                      id="isActive"
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive" className="cursor-pointer">
                        Active
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Service will be visible to customers when active
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={submitting}
                  className="rounded-xl"
                >
                  <Link href="/admin/services">Cancel</Link>
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-xl">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Service
                    </>
                  )}
                </Button>
              </div>
            </form>
      </motion.div>
    </motion.div>
  )
}
