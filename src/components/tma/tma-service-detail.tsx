'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  ArrowLeft, 
  ChevronRight, 
  Check, 
  CreditCard, 
  MessageCircle, 
  ShieldCheck,
  Upload,
  X,
  Loader2,
  Sparkles
} from 'lucide-react'
import { TMACard, TMAStatusBadge } from './tma-components'
import { useSettings } from '@/hooks/use-settings'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface PricingTier {
  label: string
  duration: string
  price: number
  description?: string
  features?: string
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  details: string
  instructions: string
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export function TMAServiceDetail({ 
  service, 
  paymentMethods,
  onSubmit,
  isSubmitting,
  userTelegram
}: { 
  service: any, 
  paymentMethods: PaymentMethod[],
  onSubmit: (data: any) => Promise<void>,
  isSubmitting: boolean,
  userTelegram: string | null
}) {
  const { formatAmount } = useSettings()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
  const [telegramUsername, setTelegramUsername] = useState(userTelegram || '')
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)

  const tiers = JSON.parse(service.pricingTiers || '[]')
  const totalSteps = 4

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps))
  const handleBack = () => setStep(s => Math.max(s - 1, 1))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid file type', description: 'Please select an image file', variant: 'destructive' })
        return
      }
      setScreenshotFile(file)
      setScreenshotPreview(URL.createObjectURL(file))
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedTier) {
      toast({ title: 'Please select a plan', variant: 'destructive' })
      return
    }
    if (!selectedPayment) {
      toast({ title: 'Please select a payment method', variant: 'destructive' })
      return
    }
    if (!telegramUsername) {
      toast({ title: 'Please enter your Telegram username', variant: 'destructive' })
      return
    }
    if (!screenshotFile) {
      toast({ title: 'Please upload payment proof', variant: 'destructive' })
      return
    }

    try {
      const screenshotBase64 = await fileToBase64(screenshotFile)
      await onSubmit({
        tier: selectedTier,
        paymentMethodId: selectedPayment.id,
        telegramUsername: telegramUsername,
        screenshotBase64: screenshotBase64,
        screenshotName: screenshotFile.name
      })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process screenshot', variant: 'destructive' })
    }
  }

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button onClick={handleBack} className={cn("p-2 rounded-xl bg-white/5", step === 1 && "invisible")}>
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-50">Step {step} of {totalSteps}</h2>
          <div className="flex gap-1 mt-1.5 justify-center">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={cn(
                "h-1 rounded-full transition-all duration-300",
                step === i + 1 ? "w-6 bg-emerald-500" : "w-2 bg-white/10"
              )} />
            ))}
          </div>
        </div>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {step > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 mb-6"
        >
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{service.title}</p>
                <p className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-tight">{selectedTier?.label} Plan</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-white">{formatAmount(selectedTier?.price || 0)}</p>
              <button 
                onClick={() => setStep(1)}
                className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                Change
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Selection */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-5 pt-4"
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">{service.title}</h1>
              <p className="text-slate-400 text-sm">{service.shortDescription}</p>
            </div>

            <div className="space-y-4">
              {tiers.map((tier: PricingTier, i: number) => (
                <button
                  key={tier.label}
                  onClick={() => setSelectedTier(tier)}
                  className="w-full text-left focus:outline-none"
                >
                  <TMACard className={cn(
                    "transition-all duration-300",
                    selectedTier?.label === tier.label ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/[0.05]"
                  )}>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          selectedTier?.label === tier.label ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400"
                        )}>
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{tier.label}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{tier.duration}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-white tabular-nums">{formatAmount(tier.price)}</p>
                      </div>
                    </div>
                  </TMACard>
                </button>
              ))}
            </div>

            <Button 
              disabled={!selectedTier} 
              onClick={handleNext}
              className="w-full mt-8 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-bold"
            >
              Continue to Payment
            </Button>
          </motion.div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-5 pt-4"
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Preferred Payment</h1>
              <p className="text-slate-400 text-sm italic">You've selected the {selectedTier?.label} plan. Choose a payment method to see instructions.</p>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method)}
                  className="w-full text-left focus:outline-none"
                >
                  <TMACard className={cn(
                    "transition-all duration-300",
                    selectedPayment?.id === method.id ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/[0.05]"
                  )}>
                    <div className="p-4 flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        selectedPayment?.id === method.id ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400"
                      )}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{method.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">{method.type}</p>
                      </div>
                      {selectedPayment?.id === method.id && <Check className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </TMACard>
                </button>
              ))}
            </div>

            <Button 
              disabled={!selectedPayment} 
              onClick={handleNext}
              className="w-full mt-8 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-bold"
            >
              Complete Billing Info
            </Button>
          </motion.div>
        )}

        {/* Step 3: Proof */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-5 pt-4"
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Submit Proof</h1>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Please transfer exactly <span className="text-emerald-400 font-bold">{formatAmount(selectedTier?.price || 0)}</span> to the details below:
              </p>
              
              <TMACard className="p-4 bg-emerald-500/10 border-emerald-500/30 mb-6 group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Payment Instructions</span>
                </div>
                
                <p className="text-xs text-slate-200 leading-relaxed font-medium mb-4">
                  {selectedPayment?.instructions || "Please complete the manual payment and upload the receipt screenshot below."}
                </p>

                {selectedPayment?.details && (
                  <div className="grid grid-cols-1 gap-2 pt-2 border-t border-emerald-500/20">
                    {Object.entries(JSON.parse(selectedPayment.details || '{}')).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{key}</span>
                        <span className="text-sm text-white font-mono font-bold select-all">{value as string}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TMACard>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telegram Contact</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                  <input
                    type="text"
                    value={telegramUsername.replace('@', '')}
                    onChange={(e) => setTelegramUsername('@' + e.target.value.replace('@', ''))}
                    className="w-full bg-white/[0.05] border border-white/[0.05] rounded-2xl py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Payment Receipt</label>
                <div 
                  onClick={() => document.getElementById('receipt-upload')?.click()}
                  className="relative h-48 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center gap-3 transition-colors hover:bg-white/[0.04] cursor-pointer"
                >
                  <input id="receipt-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  {screenshotPreview ? (
                    <div className="absolute inset-2 group">
                      <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <X className="text-white w-8 h-8" onClick={(e) => { e.stopPropagation(); setScreenshotPreview(null); setScreenshotFile(null); }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Tap to upload screenshot</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button 
              disabled={!telegramUsername || !screenshotFile} 
              onClick={handleNext}
              className="w-full mt-8 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-bold"
            >
              Review & Confirm
            </Button>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-5 pt-4"
          >
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Final Review</h1>
              <p className="text-slate-400 text-sm">Please verify your order details</p>
            </div>

            <TMACard className="p-5 mb-8 bg-white/[0.02]">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Service</span>
                  <span className="font-bold text-white text-right ml-4">{service.title}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Selected Plan</span>
                  <span className="font-bold text-white">{selectedTier?.label}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Billing Method</span>
                  <span className="font-bold text-white">{selectedPayment?.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
                  <span className="text-lg font-bold text-white">Total Charge</span>
                  <span className="text-xl font-extrabold text-emerald-400 tabular-nums">
                    {formatAmount(selectedTier?.price || 0)}
                  </span>
                </div>
              </div>
            </TMACard>

            <Button 
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-lg shadow-lg shadow-emerald-600/20"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </div>
              ) : (
                "Authorize Order"
              )}
            </Button>
            <p className="text-[10px] text-slate-500 text-center mt-4 px-8 leading-relaxed">
              By authorizing, you confirm that you have completed the payment and provided valid account information.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
