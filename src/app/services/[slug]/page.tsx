'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  Zap, CheckCircle2, ShoppingCart, Upload, X, Loader2, ArrowLeft, Home,
  ChevronRight, AlertCircle, CreditCard, Smartphone, Landmark, Wallet,
  MessageCircle, ArrowRight, Star, Shield, Clock, Copy, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/hooks/use-settings'

interface PricingTier {
  label: string
  duration: string
  price: number
  popular?: boolean
  description?: string
  features?: string
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
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  details: string
  instructions: string
}

function getParsedTiers(tiersJson: string): PricingTier[] {
  try { return JSON.parse(tiersJson || '[]') } catch { return [] }
}

function parseDetails(detailsStr: string): Record<string, string> {
  try { return JSON.parse(detailsStr || '{}') } catch { return {} }
}

const paymentIcons: Record<string, React.ElementType> = {
  bank: Landmark,
  mobile_money: Smartphone,
  crypto: Wallet,
  other: CreditCard,
}

const steps = [
  { id: 1, title: 'Select Plan', icon: Star },
  { id: 2, title: 'Payment', icon: CreditCard },
  { id: 3, title: 'Details', icon: MessageCircle },
  { id: 4, title: 'Confirm', icon: CheckCircle2 },
]

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              currentStep > step.id ? 'bg-emerald-500 text-white' :
              currentStep === step.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' :
              'bg-muted text-muted-foreground'
            }`}>
              {currentStep > step.id ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-6 sm:w-10 h-0.5 mx-1 mb-5 rounded-full transition-all duration-300 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ServiceDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const { formatAmount } = useSettings()

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [userTelegram, setUserTelegram] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
  const [telegramUsername, setTelegramUsername] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [serviceRes, methodsRes] = await Promise.all([
          fetch(`/api/services/${slug}`),
          fetch('/api/payment-methods'),
        ])
        if (serviceRes.ok) {
          const data = await serviceRes.json()
          setService(data)
        }
        if (methodsRes.ok) setPaymentMethods(await methodsRes.json())
        
        if (session?.user?.email) {
          const userRes = await fetch('/api/user/settings')
          if (userRes.ok) {
            const userData = await userRes.json()
            if (userData.telegram) {
              setUserTelegram(userData.telegram)
              setTelegramUsername(userData.telegram)
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug, session])

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please select an image file', variant: 'destructive' })
      return
    }
    setScreenshotFile(file)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  const removeScreenshot = () => {
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview)
    setScreenshotFile(null)
    setScreenshotPreview(null)
  }

  const handleSubmit = async () => {
    if (!service || !selectedTier || !selectedPayment) return
    try {
      setSubmitting(true)
      let screenshotUrl: string | null = null
      if (screenshotFile) {
        const uploadForm = new FormData()
        uploadForm.append('file', screenshotFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadForm })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          screenshotUrl = uploadData.url
        }
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          duration: selectedTier.duration,
          telegramUsername: telegramUsername || userTelegram,
          screenshot: screenshotUrl,
          paymentMethodId: selectedPayment.id,
        }),
      })
      if (res.ok) {
        toast({ title: 'Order placed!', description: 'Your order has been submitted.' })
        router.push('/dashboard/orders')
      } else {
        const data = await res.json()
        toast({ title: 'Failed', description: data.error || 'Please try again.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Please check your connection.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Service Not Found</h2>
          <Button asChild><Link href="/services"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
        </div>
      </div>
    )
  }

  const tiers = getParsedTiers(service.pricingTiers)
  const isSubscription = service.pricingType === 'subscription'
  const tgUsername = (userTelegram || telegramUsername).replace('@', '')

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{service.title}</h1>
              <p className="text-sm text-muted-foreground">{service.shortDescription}</p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Select Plan */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Select Your Plan</h2>
                <p className="text-sm text-muted-foreground">Choose the {isSubscription ? 'subscription duration' : 'package'} that works best for you</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {tiers.map((tier, i) => {
                  const items = tier.features 
                    ? tier.features.split(',').map(f => f.trim()).filter(Boolean)
                    : service.features.split(',').map(f => f.trim()).filter(Boolean).slice(0, 6)
                  const isSelected = selectedTier?.label === tier.label

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedTier(tier)}
                      className={`relative flex flex-col text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg -translate-y-1'
                          : 'border-border/60 bg-card hover:border-primary/40 hover:shadow-md'
                      }`}
                    >
                      {tier.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 shadow-sm whitespace-nowrap">
                          Most Popular
                        </Badge>
                      )}
                      
                      <div className="mb-4">
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                          {tier.label}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold">{formatAmount(tier.price)}</span>
                          {isSubscription && (
                            <span className="text-muted-foreground text-xs font-medium">
                              /{tier.duration.includes('month') ? 'mo' : tier.duration.includes('year') ? 'yr' : tier.duration}
                            </span>
                          )}
                        </div>
                        {tier.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 min-h-[2rem]">
                            {tier.description}
                          </p>
                        )}
                      </div>

                      <Separator className="mb-4 opacity-50" />

                      <div className="flex-1 space-y-3 mb-6">
                        {items.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <div className={`mt-0.5 rounded-full p-0.5 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground/60'}`}>
                              <Check className="h-3 w-3" />
                            </div>
                            <span className={isSelected ? 'font-medium' : 'text-muted-foreground'}>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className={`mt-auto w-full py-2 rounded-xl text-center text-xs font-bold transition-colors ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10'
                      }`}>
                        {isSelected ? 'Selected' : 'Select Plan'}
                      </div>
                    </button>
                  )
                })}
              </div>

              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedTier} 
                className={`w-full h-14 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  selectedTier ? 'shadow-xl shadow-primary/25' : ''
                }`}
              >
                Continue to Payment <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Select Payment Method</h2>
                <p className="text-sm text-muted-foreground">Choose how you'd like to pay</p>
              </div>

              <div className="space-y-3 mb-6">
                {paymentMethods.map((method) => {
                  const Icon = paymentIcons[method.type] || CreditCard
                  const details = parseDetails(method.details)
                  const isSelected = selectedPayment?.id === method.id

                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border/40 bg-card hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{method.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{method.type.replace('_', ' ')}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>

                      {isSelected && method.instructions && (
                        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                          <p className="font-semibold mb-1">Instructions:</p>
                          <p>{method.instructions}</p>
                          {Object.entries(details).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                              <span className="text-muted-foreground">{key}</span>
                              <span className="font-mono font-semibold">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!selectedPayment} className="flex-1 h-12 rounded-xl">
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Details */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Order Details</h2>
                <p className="text-sm text-muted-foreground">Provide your Telegram and payment proof</p>
              </div>

              <div className="space-y-5 mb-6">
                {/* Telegram - only show if not already in profile */}
                {!userTelegram ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Telegram Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <Input
                        placeholder="your_username"
                        value={telegramUsername.replace('@', '')}
                        onChange={(e) => setTelegramUsername('@' + e.target.value.replace('@', ''))}
                        className="pl-8 h-12 rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">We'll use this to deliver your service</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium">Using your Telegram: {tgUsername}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">From your profile</p>
                  </div>
                )}

                {/* Screenshot Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Payment Screenshot</Label>
                  <div
                    className="border-2 border-dashed border-border/60 rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('screenshot')?.click()}
                  >
                    <input id="screenshot" type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                    {screenshotPreview ? (
                      <div className="space-y-2">
                        <img src={screenshotPreview} alt="Preview" className="max-h-40 rounded-lg mx-auto" />
                        <button onClick={(e) => { e.stopPropagation(); removeScreenshot() }} className="text-destructive text-sm">
                          <X className="h-4 w-4 inline mr-1" /> Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG (max 10MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 rounded-xl">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1 h-12 rounded-xl">
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Review & Confirm */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Review Order</h2>
                <p className="text-sm text-muted-foreground">Confirm your order details</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-semibold">{service?.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-semibold">{selectedTier?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-semibold">{selectedPayment?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Telegram</span>
                    <span className="font-mono font-semibold">{tgUsername || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Screenshot</span>
                    <span className={screenshotFile ? 'text-emerald-600' : 'text-amber-600'}>
                      {screenshotFile ? 'Uploaded' : 'Not uploaded'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-primary">{formatAmount(selectedTier?.price || 0)}</span>
                  </div>
                </div>

                {selectedPayment?.instructions && (
                  <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
                    <p className="text-sm font-semibold mb-1">Payment Instructions</p>
                    <p className="text-xs text-muted-foreground">{selectedPayment.instructions}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Place Order'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}