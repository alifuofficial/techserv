'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  Zap,
  Bot,
  Code,
  Smartphone,
  Globe,
  Shield,
  DollarSign,
  MessageCircle,
  CheckCircle2,
  RefreshCw,
  ShoppingCart,
  FileText,
  Rocket,
  Sparkles,
  Users,
  Star,
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  ArrowLeft,
  Home,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useToast } from '@/hooks/use-toast'

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
}

type DurationKey = '3months' | '6months' | '1year'

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
}

const slideDown = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.3 },
  },
}

/* ────────────────────────────────────────────
   Icon map
   ──────────────────────────────────────────── */
const iconMap: Record<string, React.ElementType> = {
  Zap,
  Bot,
  Code,
  Smartphone,
  Globe,
  Shield,
  DollarSign,
  MessageCircle,
  CheckCircle2,
  RefreshCw,
  ShoppingCart,
  FileText,
  Rocket,
  Sparkles,
  Users,
  Star,
}

/* ────────────────────────────────────────────
   Pricing data
   ──────────────────────────────────────────── */
interface PricingOption {
  key: DurationKey
  label: string
  duration: string
  popular?: boolean
}

const pricingOptions: PricingOption[] = [
  { key: '3months', label: '3 Months', duration: '3 months' },
  { key: '6months', label: '6 Months', duration: '6 months', popular: true },
  { key: '1year', label: '12 Months', duration: '12 months' },
]

/* ────────────────────────────────────────────
   Skeleton loader
   ──────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 pt-8">
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex items-start gap-4 mb-6">
          <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-full max-w-xl" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <Skeleton className="h-40 w-full mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function ServiceDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<DurationKey | null>(null)
  const [telegramUsername, setTelegramUsername] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch service data
  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(`/api/services/${slug}`)
        if (res.ok) {
          const data: Service = await res.json()
          setService(data)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchService()
  }, [slug])

  // Get price for a duration
  const getPrice = (key: DurationKey): number => {
    if (!service) return 0
    switch (key) {
      case '3months':
        return service.price3m
      case '6months':
        return service.price6m
      case '1year':
        return service.price12m
    }
  }

  // Get monthly price
  const getMonthlyPrice = (key: DurationKey): number => {
    if (!service) return 0
    const months = key === '3months' ? 3 : key === '6months' ? 6 : 12
    return getPrice(key) / months
  }

  // Get savings percentage compared to 3-month plan
  const getSavings = (key: DurationKey): string => {
    if (!service) return ''
    const monthlyBase = service.price3m / 3
    const monthlyTarget = getMonthlyPrice(key)
    if (monthlyTarget >= monthlyBase) return ''
    const savings = Math.round(((monthlyBase - monthlyTarget) / monthlyBase) * 100)
    return `Save ${savings}%`
  }

  // Handle screenshot selection
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (PNG, JPG, etc.)',
        variant: 'destructive',
      })
      return
    }

    setScreenshotFile(file)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  // Remove screenshot
  const removeScreenshot = () => {
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview)
    }
    setScreenshotFile(null)
    setScreenshotPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!service || !selectedDuration) return

    // Validate telegram username
    const tg = telegramUsername.trim()
    if (!tg) {
      toast({
        title: 'Telegram username required',
        description: 'Please enter your Telegram username',
        variant: 'destructive',
      })
      return
    }

    // Auto-add @ prefix if missing
    const formattedTg = tg.startsWith('@') ? tg : `@${tg}`

    try {
      setSubmitting(true)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          duration: selectedDuration,
          telegramUsername: formattedTg,
          screenshot: screenshotFile?.name || null,
        }),
      })

      if (res.ok) {
        toast({
          title: 'Order placed successfully!',
          description: 'Your order has been submitted and is pending review.',
        })
        router.push('/dashboard/orders')
      } else {
        const data = await res.json()
        toast({
          title: 'Failed to place order',
          description: data.error || 'Something went wrong. Please try again.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Parse features from comma-separated string
  const featuresList = service?.features
    ? service.features.split(',').map((f) => f.trim()).filter(Boolean)
    : []

  // ── Loading state ──
  if (loading) {
    return <DetailSkeleton />
  }

  // ── 404 state ──
  if (notFound || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            The service you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/services">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  const IconComp = iconMap[service.icon] || Zap

  return (
    <div className="min-h-screen">
      {/* ================================================================
          BREADCRUMB + HEADER
          ================================================================ */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-6">
          <motion.div
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/">
                        <Home className="h-3.5 w-3.5" />
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/services">Services</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium truncate max-w-[200px] sm:max-w-none">
                      {service.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <IconComp className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {service.title}
                  </h1>
                  <Badge className="bg-primary text-primary-foreground">Active</Badge>
                </div>
                <p className="text-muted-foreground mt-1">{service.shortDescription}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          SERVICE DETAILS + LONG DESCRIPTION
          ================================================================ */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column – Details & Features */}
            <div className="lg:col-span-2 space-y-8">
              {/* Long Description */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={0}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About This Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {service.longDescription ? (
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {service.longDescription}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {service.shortDescription}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Features List */}
              {featuresList.length > 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={1}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Features</CardTitle>
                      <CardDescription>
                        Everything included with your subscription
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {featuresList.map((feature, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className="flex items-start gap-3"
                          >
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right column – Sticky pricing summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                {/* Quick price summary */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={2}
                >
                  <Card className="border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pricingOptions.map((option) => {
                        const price = getPrice(option.key)
                        const monthly = getMonthlyPrice(option.key)
                        const savings = getSavings(option.key)
                        const isSelected = selectedDuration === option.key

                        return (
                          <button
                            key={option.key}
                            onClick={() => setSelectedDuration(option.key)}
                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                              isSelected
                                ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                                : 'border-border hover:border-primary/30 hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{option.label}</p>
                                <p className="text-xs text-muted-foreground">
                                  ${monthly.toFixed(2)}/mo
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">${price.toFixed(2)}</p>
                                {savings && (
                                  <p className="text-xs text-primary font-medium">{savings}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          PRICING SECTION (3 cards)
          ================================================================ */}
      <section className="pb-10 md:pb-14 bg-muted/30 py-10 md:py-14">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Choose Your <span className="text-primary">Plan</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select the subscription duration that works best for you. Longer plans save more!
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {pricingOptions.map((option, i) => {
              const price = getPrice(option.key)
              const monthly = getMonthlyPrice(option.key)
              const savings = getSavings(option.key)
              const isSelected = selectedDuration === option.key

              return (
                <motion.div
                  key={option.key}
                  variants={fadeUp}
                  custom={i}
                >
                  <Card
                    className={`relative h-full transition-all duration-300 cursor-pointer ${
                      option.popular
                        ? 'border-primary glow-green'
                        : 'border-border'
                    } ${
                      isSelected
                        ? 'ring-2 ring-primary shadow-lg shadow-primary/10'
                        : 'hover:border-primary/30 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedDuration(option.key)}
                  >
                    {/* Popular badge */}
                    {option.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground shadow-md shadow-primary/25 px-3">
                          Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className={`text-center ${option.popular ? 'pt-8' : ''}`}>
                      <CardTitle className="text-lg">{option.label}</CardTitle>
                      <CardDescription>{option.duration} subscription</CardDescription>
                    </CardHeader>

                    <CardContent className="text-center space-y-4">
                      {/* Price */}
                      <div>
                        <span className="text-4xl font-extrabold">${price.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          (${monthly.toFixed(2)}/mo)
                        </span>
                      </div>

                      {savings && (
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {savings}
                        </Badge>
                      )}

                      <Separator />

                      {/* Feature hints */}
                      <ul className="space-y-2 text-sm text-left">
                        <li className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          Full access to all features
                        </li>
                        <li className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          {option.duration} validity
                        </li>
                        <li className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          Priority support
                        </li>
                      </ul>
                    </CardContent>

                    <CardFooter>
                      <Button
                        className={`w-full ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : option.popular
                              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                              : ''
                        }`}
                        variant={isSelected || option.popular ? 'default' : 'outline'}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Selected
                          </>
                        ) : (
                          'Select'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          ORDER FORM (appears when duration selected)
          ================================================================ */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto max-w-2xl px-4 sm:px-6">
          <AnimatePresence>
            {selectedDuration && (
              <motion.div
                variants={slideDown}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="border-primary/20 shadow-lg shadow-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Place Your Order</CardTitle>
                        <CardDescription>
                          {pricingOptions.find((o) => o.key === selectedDuration)?.label} plan — ${getPrice(selectedDuration).toFixed(2)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Auth check */}
                    {status === 'loading' ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : !session ? (
                      /* Not logged in state */
                      <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        className="text-center py-8 space-y-4"
                      >
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                          <Shield className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">Please sign in to place an order</p>
                          <p className="text-sm text-muted-foreground">
                            You need an account to track your orders and manage your services.
                          </p>
                        </div>
                        <Button asChild>
                          <Link href="/auth/signin">
                            Sign In
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </motion.div>
                    ) : (
                      /* Order form */
                      <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        className="space-y-5"
                      >
                        {/* Telegram Username */}
                        <div className="space-y-2">
                          <Label htmlFor="telegram">
                            Telegram Username <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              @
                            </span>
                            <Input
                              id="telegram"
                              placeholder="your_username"
                              value={telegramUsername}
                              onChange={(e) => setTelegramUsername(e.target.value)}
                              className="pl-8 h-11"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enter your Telegram username so we can activate your service.
                          </p>
                        </div>

                        {/* Payment Screenshot Upload */}
                        <div className="space-y-2">
                          <Label htmlFor="screenshot">
                            Payment Screenshot
                          </Label>
                          <div
                            className="relative border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/40 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <input
                              ref={fileInputRef}
                              id="screenshot"
                              type="file"
                              accept="image/*"
                              onChange={handleScreenshotChange}
                              className="hidden"
                            />

                            {screenshotPreview ? (
                              <div className="space-y-3">
                                <div className="relative inline-block">
                                  <img
                                    src={screenshotPreview}
                                    alt="Payment screenshot preview"
                                    className="max-h-40 rounded-lg border border-border object-contain mx-auto"
                                  />
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {screenshotFile?.name}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeScreenshot()
                                    }}
                                    className="text-destructive hover:text-destructive/80 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Click to change screenshot
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    Click to upload screenshot
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG or WebP (max 10MB)
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Upload a screenshot of your payment confirmation.
                          </p>
                        </div>

                        {/* Order summary */}
                        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Service</span>
                            <span className="font-medium">{service.title}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium">
                              {pricingOptions.find((o) => o.key === selectedDuration)?.label}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Total</span>
                            <span className="text-xl font-bold text-primary">
                              ${getPrice(selectedDuration).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>

                  {/* Submit button (only when logged in) */}
                  {session && (
                    <CardFooter>
                      <Button
                        className="w-full h-11"
                        onClick={handleSubmit}
                        disabled={submitting || !telegramUsername.trim()}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Order
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
