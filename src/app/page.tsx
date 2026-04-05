'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Code2,
  TrendingUp,
  Crown,
  CheckCircle2,
  Zap,
  Globe,
  Bot,
  Smartphone,
  Star,
  ShieldCheck,
  ChevronRight,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface Service {
  id: string
  title: string
  slug: string
  shortDescription: string
  icon: string
  pricingType: string
  pricingTiers: string
  isActive: boolean
  orderCount: number
}

interface PricingTier {
  label: string
  duration: string
  price: number
  popular?: boolean
}

function getParsedTiers(tiersJson: string): PricingTier[] {
  try { return JSON.parse(tiersJson || '[]') } catch { return [] }
}

function getLowestPrice(service: Service): number {
  const tiers = getParsedTiers(service.pricingTiers)
  if (tiers.length === 0) return 0
  if (service.pricingType === 'subscription') {
    let cheapest = Infinity
    for (const tier of tiers) {
      const match = tier.duration.match(/(\d+)/)
      if (match) {
        const months = parseInt(match[1])
        if (months > 0) cheapest = Math.min(cheapest, tier.price / months)
      }
    }
    return cheapest === Infinity ? 0 : cheapest
  }
  return Math.min(...tiers.map((t) => t.price))
}

const iconMap: Record<string, React.ElementType> = {
  Zap, Crown, Bot, Globe, Smartphone, TrendingUp, ShieldCheck,
  Code2, Layers, Star,
}

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const stats = [
  { value: '500+', label: 'Happy Clients' },
  { value: '1,200+', label: 'Orders Completed' },
  { value: '99%', label: 'Satisfaction Rate' },
]

const categories = [
  {
    title: 'Web & App Development',
    description: 'Custom websites, mobile apps, and software built specifically for your business needs.',
    icon: Code2,
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'border-blue-100',
  },
  {
    title: 'Digital Subscriptions',
    description: 'Get instant access to premium digital accounts and recurring software subscriptions.',
    icon: Crown,
    color: 'bg-emerald-50 text-emerald-600',
    borderColor: 'border-emerald-100',
  },
  {
    title: 'Social Media Campaigns',
    description: 'Grow your audience fast with our targeted social media promotion and engagement services.',
    icon: TrendingUp,
    color: 'bg-purple-50 text-purple-600',
    borderColor: 'border-purple-100',
  },
]

const perks = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Orders are processed quickly so you can see results immediately.' },
  { icon: CheckCircle2, title: 'High Quality', desc: 'We take pride in delivering top-tier services that meet your goals.' },
  { icon: Star, title: 'Great Support', desc: 'Our friendly team is always here to help answer your questions.' },
  { icon: ShieldCheck, title: 'Secure Checkout', desc: 'Your payments and personal details are always kept safe.' },
]

function ServiceCardSkeleton() {
  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchServices() {
      try {
        const res = await fetch('/api/services')
        if (res.ok && !cancelled) {
          const data: Service[] = await res.json()
          setServices(data.slice(0, 6))
        }
      } catch { /* silent */ } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchServices()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="flex flex-col bg-white">

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-[url('/images/services-light.png')] bg-cover opacity-30 mix-blend-multiply" />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <motion.div initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={reveal} custom={0}>
                <Badge variant="outline" className="px-3 py-1 text-sm bg-white border-primary/20 text-primary shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Your All-in-One Digital Partner
                </Badge>
              </motion.div>

              <motion.h1 variants={reveal} custom={1} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Premium Digital Services, {' '}
                <span className="text-primary">Delivered Instantly</span>
              </motion.h1>

              <motion.p variants={reveal} custom={2} className="text-lg text-slate-600 max-w-lg leading-relaxed">
                Everything you need to grow online. From custom web development to social media campaigns and premium digital subscriptions — we make growing your business easy and fast.
              </motion.p>

              <motion.div variants={reveal} custom={3} className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button size="lg" asChild className="h-12 px-8 text-base shadow-lg shadow-primary/20 rounded-xl">
                  <Link href="/services">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base bg-white rounded-xl">
                  <Link href="/auth/signup">Create Free Account</Link>
                </Button>
              </motion.div>

              <motion.div variants={reveal} custom={4} className="flex items-center gap-8 pt-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="relative h-[480px] w-full rounded-2xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 bg-white">
                <Image src="/images/hero-light.png" alt="Digital Services UI" fill className="object-cover" priority />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* CORE SERVICES */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">What We Offer</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We provide simple, highly effective services to help individuals and businesses thrive in the digital world.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((cat, i) => {
              const CatIcon = cat.icon
              return (
                <motion.div key={cat.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} custom={i}>
                  <Link href="/services" className="block h-full cursor-pointer">
                    <Card className={`h-full border transition-shadow hover:shadow-xl hover:border-primary/20 ${cat.borderColor} bg-white rounded-2xl overflow-hidden`}>
                      <CardContent className="p-8 flex flex-col h-full">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-xl mb-6 ${cat.color}`}>
                          <CatIcon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{cat.title}</h3>
                        <p className="text-slate-600 leading-relaxed mb-6 flex-grow">{cat.description}</p>
                        <div className="inline-flex items-center text-primary font-semibold text-sm group">
                          Explore services <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* POPULAR SERVICES LIST */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Featured Services</h2>
              <p className="text-slate-600">Our most popular solutions, ready to go.</p>
            </div>
            <Button variant="outline" asChild className="rounded-xl bg-white">
              <Link href="/services">View Full Catalog</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
            ) : services.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-100">
                <p className="text-slate-500">More services coming soon!</p>
              </div>
            ) : (
              services.map((service, i) => {
                const IconComp = iconMap[service.icon] || Zap
                const lowest = getLowestPrice(service)
                return (
                  <motion.div key={service.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} custom={i}>
                    <Link href={`/services/${service.slug}`} className="block group">
                      <Card className="rounded-xl border-slate-200 bg-white hover:border-primary/30 hover:shadow-lg transition-all h-full">
                        <CardContent className="p-5 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <IconComp className="h-5 w-5" />
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                              {service.pricingType === 'subscription' ? 'Plan' : 'Order'}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{service.title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{service.shortDescription}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div>
                              <p className="text-xs text-slate-500 mb-0.5">Starting at</p>
                              <p className="text-lg font-bold text-slate-900">
                                ${lowest.toFixed(2)}
                                {service.pricingType === 'subscription' && <span className="text-sm font-normal text-slate-500">/mo</span>}
                              </p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* WHY US WITH IMAGE */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Image */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} custom={0} className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-xl order-2 lg:order-1">
              <Image src="/images/feature-light-v2.png" alt="Growth and Quality" fill className="object-cover" />
            </motion.div>

            {/* Right Content */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="order-1 lg:order-2 space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Why choose us?</h2>
                <p className="text-lg text-slate-600">
                  We focus on delivering high-quality, reliable, and fast digital services so you can focus on what you do best.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {perks.map((perk, i) => {
                  const PerkIcon = perk.icon
                  return (
                    <motion.div key={perk.title} variants={reveal} custom={i + 1}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-3">
                        <PerkIcon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{perk.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{perk.desc}</p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white !m-4 !md:m-8 rounded-3xl relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-primary/20 opacity-20" />
        <div className="relative z-10 container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Ready to boost your digital presence?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Join hundreds of happy clients and gain access to premium web services, campaigns, and subscriptions today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="h-12 px-8 text-base bg-white text-slate-900 hover:bg-slate-100 rounded-xl">
              <Link href="/auth/signup">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base bg-transparent border-white text-white hover:bg-white/10 rounded-xl">
              <Link href="/services">Browse Services</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
