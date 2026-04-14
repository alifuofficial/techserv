'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import {
  Zap, CheckCircle2, Upload, X, Loader2, ArrowLeft,
  AlertCircle, CreditCard, Smartphone, Landmark, Wallet,
  MessageCircle, ArrowRight, Star, Shield, Clock, Check,
  Sparkles, Crown, Rocket, Diamond, Gem,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useTelegram } from '@/components/telegram-provider'
import { useSettings } from '@/hooks/use-settings'
import { TMAServiceDetail } from '@/components/tma/tma-service-detail'

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

interface PendingOrder {
  serviceSlug: string
  selectedTier: PricingTier
  selectedPaymentId: string
  telegramUsername: string
  screenshotDataUrl: string | null
  screenshotName: string | null
  autoSubmit?: boolean
}

const PENDING_ORDER_KEY = 'techserv_pending_order'

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

const planIcons: React.ElementType[] = [Sparkles, Crown, Rocket, Diamond, Gem]

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
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
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                currentStep > step.id ? 'bg-emerald-500 text-white' :
                currentStep === step.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' :
                'bg-muted text-muted-foreground'
              }`}
            >
              {currentStep > step.id ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
            </motion.div>
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
  const { isTma } = useTelegram()

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
  const [restoringOrder, setRestoringOrder] = useState(false)

  // Submitting logic (memoized to be used in restoration effect)
  const handleSubmit = useCallback(async (isAuto = false) => {
    if (!service || !selectedTier || !selectedPayment) return

    // If not authenticated, save progress and redirect to signup
    if (status === 'unauthenticated') {
      try {
        setSubmitting(true)
        const pending: PendingOrder = {
          serviceSlug: slug,
          selectedTier,
          selectedPaymentId: selectedPayment.id,
          telegramUsername,
          autoSubmit: true,
          screenshotName: screenshotFile?.name || null,
          screenshotDataUrl: screenshotFile ? await fileToBase64(screenshotFile) : null,
        }
        localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pending))
        
        toast({ 
          title: 'Saving Progress', 
          description: 'Redirecting you to create an account. Your order will resume automatically.' 
        })
        
        router.push(`/auth/signup?callbackUrl=/services/${slug}`)
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to save progress.', variant: 'destructive' })
      } finally {
        setSubmitting(false)
      }
      return
    }

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
        toast({ 
          title: isAuto ? 'Order Automatically Placed!' : 'Order placed!', 
          description: 'Your order has been submitted successfully.' 
        })
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
  }, [service, selectedTier, selectedPayment, status, slug, telegramUsername, screenshotFile, userTelegram, router, toast])

  // Restore pending order after login
  useEffect(() => {
    if (status === 'authenticated' && service && paymentMethods.length > 0) {
      const pendingOrder = localStorage.getItem(PENDING_ORDER_KEY)
      if (pendingOrder) {
        try {
          const pending: PendingOrder = JSON.parse(pendingOrder)
          if (pending.serviceSlug === slug) {
            setRestoringOrder(true)
            localStorage.removeItem(PENDING_ORDER_KEY) // Prevent infinite restore loop
            
            // Restore tier
            const tiers = getParsedTiers(service.pricingTiers)
            const tier = tiers.find(t => t.label === pending.selectedTier.label)
            if (tier) setSelectedTier(tier)
            
            // Restore payment method
            const method = paymentMethods.find(m => m.id === pending.selectedPaymentId)
            if (method) setSelectedPayment(method)
            
            // Restore telegram
            if (pending.telegramUsername) {
              setTelegramUsername(pending.telegramUsername)
            }
            
            // Restore screenshot
            if (pending.screenshotDataUrl && pending.screenshotName) {
              setScreenshotPreview(pending.screenshotDataUrl)
              fetch(pending.screenshotDataUrl)
                .then(res => res.blob())
                .then(blob => {
                  const file = new File([blob], pending.screenshotName!, { type: 'image/png' })
                  setScreenshotFile(file)
                })
            }
            
            // Handle auto-submit
            if (pending.autoSubmit) {
              toast({ 
                title: 'Resuming Order', 
                description: 'We are completing your order now...' 
              })
              // Small timeout to allow state to settle
              setTimeout(() => {
                handleSubmit(true)
              }, 1000)
            } else {
              toast({ 
                title: 'Order Restored', 
                description: 'Your order details have been restored. Please review and confirm.' 
              })
              setStep(4)
              setRestoringOrder(false)
            }
          }
        } catch (e) {
          console.error('Failed to restore pending order:', e)
          localStorage.removeItem(PENDING_ORDER_KEY)
        }
      }
    }
  }, [status, service, slug, paymentMethods, toast, handleSubmit])

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

  if (isTma) {
    return (
      <TMAServiceDetail 
        service={service}
        paymentMethods={paymentMethods}
        userTelegram={userTelegram}
        isSubmitting={submitting}
        onSubmit={async (data) => {
          // Sync state from component
          setSelectedTier(data.tier)
          setTelegramUsername(data.telegramUsername)
          setScreenshotFile(data.screenshot)
          // We need to find the payment method object
          const method = paymentMethods.find(m => m.id === data.paymentMethodId)
          if (method) setSelectedPayment(method)
          
          // Trigger the page's existing handleSubmit logic
          // Note: useEffect and state updates are async, 
          // but handleSubmit uses current refs/state if not careful.
          // Since handleSubmit is a callback, we'll manually call it after a tick 
          // if we want to rely on the updated state, or just call the logic directly.
          
          // For safety in TMA context, we'll wait for state to settle
          setTimeout(() => {
            handleSubmit()
          }, 0)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={isTma ? "/dashboard" : "/services"} 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> 
            {isTma ? "Back to Dashboard" : "Back to Services"}
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{service.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{service.shortDescription}</p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Select Plan */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
                <p className="text-muted-foreground">Select the {isSubscription ? 'subscription duration' : 'package'} that fits your needs</p>
              </div>

              {/* Plan Tabs */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {tiers.map((tier, i) => {
                  const isSelected = selectedTier?.label === tier.label
                  const PlanIcon = planIcons[i % planIcons.length]
                  
                  return (
                    <motion.button
                      key={tier.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedTier(tier)}
                      className={`relative group overflow-hidden rounded-2xl transition-all duration-300 ${
                        isSelected 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {/* Background gradient for selected */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
                      )}
                      
                      {/* Popular badge */}
                      {tier.popular && (
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-b-lg">
                            Popular
                          </div>
                        </div>
                      )}
                      
                      <div className={`p-6 min-w-[160px] ${tier.popular ? 'pt-8' : ''}`}>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <PlanIcon className="h-4 w-4" />
                          </div>
                        </div>
                        
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                          {tier.label}
                        </p>
                        
                        <div className="flex items-baseline justify-center gap-0.5">
                          <span className={`text-2xl font-extrabold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {formatAmount(tier.price).split('.')[0]}
                          </span>
                          {isSubscription && (
                            <span className="text-xs text-muted-foreground">
                              /{tier.duration.includes('month') ? 'mo' : tier.duration.includes('year') ? 'yr' : ''}
                            </span>
                          )}
                        </div>
                        
                        {tier.description && (
                          <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">
                            {tier.description}
                          </p>
                        )}
                        
                        {/* Check indicator */}
                        <div className={`mt-3 flex items-center justify-center transition-all ${
                          isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}>
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Selected Plan Features */}
              {selectedTier && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">{selectedTier.label} Plan Features</h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {formatAmount(selectedTier.price)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedTier.features 
                        ? selectedTier.features.split(',').map(f => f.trim()).filter(Boolean)
                        : service.features.split(',').map(f => f.trim()).filter(Boolean)
                      ).map((feature, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-background/50"
                        >
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <Button 
                onClick={() => selectedTier && setStep(2)} 
                disabled={!selectedTier} 
                className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
              >
                Continue to Payment <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
                <p className="text-muted-foreground">Choose how you'd like to pay</p>
              </div>

              <div className="grid gap-3 mb-8">
                {paymentMethods.map((method, i) => {
                  const Icon = paymentIcons[method.type] || CreditCard
                  const details = parseDetails(method.details)
                  const isSelected = selectedPayment?.id === method.id

                  return (
                    <motion.button
                      key={method.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedPayment(method)}
                      className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                        isSelected 
                          ? 'border-primary bg-gradient-to-br from-primary/5 to-transparent shadow-lg shadow-primary/10' 
                          : 'border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{method.name}</p>
                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">{method.type.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-border/50"
                        >
                          {method.instructions && (
                            <p className="text-xs text-muted-foreground mb-3">{method.instructions}</p>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(details).map(([key, value]) => (
                              <div key={key} className="p-2 rounded-lg bg-muted/50">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{key}</p>
                                <p className="text-sm font-mono font-semibold truncate">{value}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={() => selectedPayment && setStep(3)} disabled={!selectedPayment} className="flex-1 h-12 rounded-xl">
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Details */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Order Details</h2>
                <p className="text-muted-foreground">Provide your contact and payment proof</p>
              </div>

              <div className="space-y-6 mb-8">
                {/* Telegram */}
                {!userTelegram ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Telegram Username</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                      <Input
                        placeholder="your_username"
                        value={telegramUsername.replace('@', '')}
                        onChange={(e) => setTelegramUsername('@' + e.target.value.replace('@', ''))}
                        className="pl-9 h-12 rounded-xl"
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

                {/* Screenshot */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Payment Screenshot</Label>
                  <div
                    className="border-2 border-dashed border-border/60 rounded-2xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer group"
                    onClick={() => document.getElementById('screenshot')?.click()}
                  >
                    <input id="screenshot" type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                    {screenshotPreview ? (
                      <div className="space-y-3">
                        <img src={screenshotPreview} alt="Preview" className="max-h-48 rounded-xl mx-auto shadow-lg" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeScreenshot() }} 
                          className="text-destructive text-sm font-medium hover:underline"
                        >
                          <X className="h-4 w-4 inline mr-1" /> Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="h-14 w-14 rounded-2xl bg-muted mx-auto flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="font-semibold">Click to upload</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                        </div>
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
                  Review Order <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Review & Confirm */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Review Order</h2>
                <p className="text-muted-foreground">Confirm your order details before submitting</p>
              </div>

              <div className="space-y-4 mb-8">
                {/* Order Summary Card */}
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50 p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Order Summary
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-semibold">{service?.title}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="font-semibold">{selectedTier?.label}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="font-semibold">{selectedPayment?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Telegram</span>
                      <span className="font-mono font-semibold">{tgUsername || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Screenshot</span>
                      <span className={`font-semibold ${screenshotFile ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {screenshotFile ? 'Uploaded' : 'Not uploaded'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-2">
                    <span className="font-bold text-lg">Total Amount</span>
                    <span className="text-2xl font-extrabold text-primary">{formatAmount(selectedTier?.price || 0)}</span>
                  </div>
                </div>

                {/* Payment Instructions */}
                {selectedPayment?.instructions && (
                  <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
                    <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Instructions
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedPayment.instructions}</p>
                  </div>
                )}

                {/* Security Notice */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Secure Order</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Your payment will be verified and your order processed within 24 hours.</p>
                    </div>
                  </div>
                </div>
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