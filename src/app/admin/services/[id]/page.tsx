'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Save,
  ChevronRight,
  DollarSign,
  Tag,
  Sparkles,
  Layers,
  BarChart3,
  Trash2,
  AlertCircle,
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
import { Skeleton } from '@/components/ui/skeleton'
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
interface ServiceFormData {
  title: string
  slug: string
  shortDescription: string
  longDescription: string
  features: string
  icon: string
  price3m: number
  price6m: number
  price12m: number
  sortOrder: number
  isActive: boolean
}

interface Service extends ServiceFormData {
  id: string
  createdAt: string
  updatedAt: string
  orderCount: number
}

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
   Skeleton Loader
   ──────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-16" />
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Card skeleton */}
      <Skeleton className="h-12 w-64 rounded-lg" />
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function EditServicePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>()

  const selectedIcon = watch('icon')

  /* ── Fetch service ── */
  useEffect(() => {
    let cancelled = false

    async function fetchService() {
      try {
        const res = await fetch(`/api/admin/services/${id}`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setService(data)
          reset({
            title: data.title,
            slug: data.slug,
            shortDescription: data.shortDescription || '',
            longDescription: data.longDescription || '',
            features: data.features || '',
            icon: data.icon || 'Zap',
            price3m: data.price3m,
            price6m: data.price6m,
            price12m: data.price12m,
            sortOrder: data.sortOrder ?? 0,
            isActive: data.isActive ?? true,
          })
        } else if (!cancelled) {
          setNotFound(true)
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchService()

    return () => {
      cancelled = true
    }
  }, [id, reset])

  /* ── Submit handler ── */
  const onSubmit = useCallback(
    async (data: ServiceFormData) => {
      setSubmitting(true)
      try {
        const res = await fetch(`/api/admin/services/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            price3m: Number(data.price3m),
            price6m: Number(data.price6m),
            price12m: Number(data.price12m),
            sortOrder: Number(data.sortOrder),
          }),
        })

        if (res.ok) {
          toast.success('Service updated', {
            description: `"${data.title}" has been updated successfully.`,
          })
          router.push('/admin/services')
        } else {
          const result = await res.json()
          toast.error('Failed to update', {
            description: result.error || 'Something went wrong.',
          })
        }
      } catch {
        toast.error('Error', {
          description: 'Failed to update service. Please try again.',
        })
      } finally {
        setSubmitting(false)
      }
    },
    [id, router]
  )

  /* ── Delete handler ── */
  const handleDelete = useCallback(async () => {
    if (!service || deleting) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Service deleted', {
          description: `"${service.title}" has been removed.`,
        })
        router.push('/admin/services')
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
      setDeleteOpen(false)
    }
  }, [service, deleting, id, router])

  /* ── Loading state ── */
  if (loading) {
    return <DetailSkeleton />
  }

  /* ── Not found state ── */
  if (notFound || !service) {
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
          <h2 className="text-xl font-semibold mb-1.5">Service Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            The service you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button variant="outline" asChild>
            <Link href="/admin/services">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
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
            href="/admin/services"
            className="hover:text-foreground transition-colors"
          >
            Services
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Edit Service</span>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -mr-2">
          <Link href="/admin/services">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Back to Services</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
      </motion.div>

      {/* ── Form Card ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Edit Service</CardTitle>
            <CardDescription>
              Update the details for &quot;{service.title}&quot;.
              {service.orderCount > 0 && (
                <span className="block mt-1 text-amber-600 dark:text-amber-400">
                  This service has {service.orderCount} order
                  {service.orderCount !== 1 ? 's' : ''} and cannot be deleted.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* ── Basic Information ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Basic Information
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
                    URL-friendly identifier. Edit if needed.
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

              <Separator />

              {/* ── Icon Selection ── */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  Service Icon
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {iconOptions.map(({ name, Icon }) => {
                    const isSelected = selectedIcon === name
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setValue('icon', name)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg p-2.5 border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border/60 bg-muted/30 hover:border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground'
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

              <Separator />

              {/* ── Features ── */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Features
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

              <Separator />

              {/* ── Pricing ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Pricing
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      key: 'price3m' as const,
                      label: '3 Months Price',
                      desc: 'Price for 3-month subscription',
                    },
                    {
                      key: 'price6m' as const,
                      label: '6 Months Price',
                      desc: 'Price for 6-month subscription',
                    },
                    {
                      key: 'price12m' as const,
                      label: '12 Months Price',
                      desc: 'Price for 12-month subscription',
                    },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>
                        {field.label} <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          $
                        </span>
                        <Input
                          id={field.key}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...register(field.key, {
                            required: `${field.label} is required`,
                            min: { value: 0, message: 'Price must be at least $0' },
                          })}
                          className="pl-7 bg-muted/30 border-border/60 focus-visible:bg-background tabular-nums"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{field.desc}</p>
                      {errors[field.key] && (
                        <p className="text-xs text-destructive">
                          {errors[field.key]?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* ── Settings ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
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

              <Separator />

              {/* ── Actions ── */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                {/* Delete button (left side on desktop) */}
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => setDeleteOpen(true)}
                    disabled={service.orderCount > 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Service
                    {service.orderCount > 0 && (
                      <span className="ml-2 text-xs opacity-60">
                        ({service.orderCount} orders)
                      </span>
                    )}
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Service</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{service.title}&quot;?
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

                {/* Save / Cancel (right side) */}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={submitting}
                  >
                    <Link href="/admin/services">Cancel</Link>
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
