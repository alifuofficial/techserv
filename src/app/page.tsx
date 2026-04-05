'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Globe,
  Bot,
  Smartphone,
  Crown,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Star,
  ChevronRight,
  Layers,
  Cpu,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

/* ─── Types ─── */
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

/* ─── Icon map ─── */
const iconMap: Record<string, React.ElementType> = {
  Zap, Crown, Bot, Globe, Smartphone, TrendingUp, ShieldCheck,
  Code2, Layers, Cpu, Sparkles, Star,
}

/* ─── Animation ─── */
const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

/* ─── Stats ─── */
const stats = [
  { value: '500+', label: 'Happy Clients' },
  { value: '1,200+', label: 'Orders Completed' },
  { value: '6+', label: 'Services Available' },
  { value: '99%', label: 'Satisfaction Rate' },
]

/* ─── Categories for bento ─── */
const categories = [
  {
    title: 'Software Development',
    description: 'Web apps, mobile apps, bots, and custom software built with modern technologies.',
    icon: Code2,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/20',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Digital Subscriptions',
    description: 'Premium subscriptions, channel growth, and account services delivered instantly.',
    icon: Crown,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/20',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Growth & Marketing',
    description: 'Channel promotion, audience building, and engagement optimization.',
    icon: TrendingUp,
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/20',
    badgeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  {
    title: 'Security & Accounts',
    description: 'Account verification, recovery, and advanced security configuration.',
    icon: ShieldCheck,
    color: 'from-sky-500/20 to-blue-500/20',
    borderColor: 'border-sky-500/20',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
]

/* ─── Why choose us ─── */
const perks = [
  { icon: Zap, title: 'Fast Delivery', desc: 'Most services activated within hours of order confirmation.' },
  { icon: CheckCircle2, title: 'Quality Guaranteed', desc: 'Every service is tested and verified before delivery.' },
  { icon: Star, title: 'Top-Rated Support', desc: 'Dedicated support team ready to help you 24/7.' },
  { icon: ShieldCheck, title: 'Secure & Private', desc: 'Your data and transactions are encrypted and protected.' },
]

/* ─── Skeleton ─── */
function ServiceCardSkeleton() {
  return (
    <Card className="group relative overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
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
    <div className="flex flex-col">

      {/* ═══════════════════════════════════════════════════
          HERO — Full viewport, split layout
          ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20" />
          <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-primary/8 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-32 h-80 w-80 rounded-full bg-teal-500/6 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/3 blur-[160px]" />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={reveal} custom={0}>
                <Badge variant="outline" className="px-4 py-1.5 text-sm border-primary/30 bg-primary/5">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Your Digital Service Hub
                </Badge>
              </motion.div>

              <motion.h1
                variants={reveal} custom={1}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]"
              >
                Tech Services,{' '}
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    Simplified
                  </span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-primary/15 rounded-full -z-0" />
                </span>
              </motion.h1>

              <motion.p variants={reveal} custom={2} className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                From software development to digital subscriptions — we deliver premium tech services with speed, quality, and reliability you can count on.
              </motion.p>

              <motion.div variants={reveal} custom={3} className="flex flex-col sm:flex-row gap-4">
                <Button size="xl" asChild className="h-14 px-10 text-base font-semibold shadow-xl shadow-primary/20 rounded-xl">
                  <Link href="/services">
                    Explore Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild className="h-14 px-10 text-base font-semibold rounded-xl">
                  <Link href="/auth/signup">Get Started Free</Link>
                </Button>
              </motion.div>

              {/* Mini stats */}
              <motion.div variants={reveal} custom={4} className="flex gap-8 pt-4">
                {stats.slice(0, 3).map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Floating service cards composition */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.9, ease: [0.25, 0.4, 0.25, 1] }}
              className="hidden lg:block relative"
            >
              <div className="relative w-full max-w-md mx-auto">
                {/* Main card */}
                <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl shadow-black/5 rounded-2xl p-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-emerald-500 h-2" />
                  <div className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                        <Layers className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">All Services</p>
                        <p className="text-sm text-muted-foreground">One platform, endless possibilities</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { icon: Globe, label: 'Web Development', price: 'From $299' },
                        { icon: Smartphone, label: 'Mobile Apps', price: 'From $1,499' },
                        { icon: Bot, label: 'Custom Bots', price: 'From $199' },
                        { icon: Crown, label: 'Premium Subscriptions', price: 'From $15.99/mo' },
                      ].map((item, i) => {
                        const ItemIcon = item.icon
                        return (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + i * 0.1 }}
                            className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                                <ItemIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            <span className="text-xs text-primary font-semibold">{item.price}</span>
                          </motion.div>
                        )
                      })}
                    </div>
                    <Button variant="outline" className="w-full rounded-xl" asChild>
                      <Link href="/services">
                        View All Services
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>

                {/* Floating accent badges */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-6 rounded-2xl bg-primary text-primary-foreground px-4 py-3 shadow-lg shadow-primary/25 flex items-center gap-2 text-sm font-semibold"
                >
                  <Zap className="h-4 w-4" />
                  Instant Delivery
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0], rotate: [0, -1, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-4 -left-6 rounded-2xl bg-card border border-border px-4 py-3 shadow-lg flex items-center gap-2 text-sm font-medium"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  500+ Happy Clients
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CATEGORIES — Bento Grid
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.p variants={reveal} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              What We Offer
            </motion.p>
            <motion.h2 variants={reveal} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Services for Every Need
            </motion.h2>
            <motion.p variants={reveal} custom={2} className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Whether you need custom software, digital subscriptions, or growth services — we&apos;ve got you covered.
            </motion.p>
          </motion.div>

          {/* Bento grid — 2x2 on desktop */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          >
            {categories.map((cat, i) => {
              const CatIcon = cat.icon
              return (
                <motion.div
                  key={cat.title}
                  variants={scaleIn}
                  custom={i}
                  className="group"
                >
                  <Link href="/services" className="block">
                    <Card className={`relative overflow-hidden rounded-2xl border ${cat.borderColor} hover:shadow-lg transition-all duration-500 hover:scale-[1.01]`}>
                      {/* Gradient bg */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <CardContent className="relative p-8 md:p-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <CatIcon className="h-7 w-7 text-primary" />
                          </div>
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{cat.description}</p>
                        <div className="mt-4">
                          <Badge variant="outline" className={`${cat.badgeColor} border-0 text-xs font-medium`}>
                            Multiple services
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURED SERVICES — Horizontal scroll or grid
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-muted/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <motion.p
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={reveal} custom={0}
                className="text-sm font-semibold text-primary uppercase tracking-widest mb-3"
              >
                Featured
              </motion.p>
              <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={reveal} custom={1}
                className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              >
                Popular Services
              </motion.h2>
            </div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={reveal} custom={2}
            >
              <Button variant="outline" asChild className="rounded-xl">
                <Link href="/services">
                  All Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
            ) : services.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-muted-foreground">No services available yet. Check back soon!</p>
              </div>
            ) : (
              services.map((service, i) => {
                const IconComp = iconMap[service.icon] || Zap
                const lowest = getLowestPrice(service)

                return (
                  <motion.div
                    key={service.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-30px' }}
                    variants={scaleIn}
                    custom={i}
                  >
                    <Link href={`/services/${service.slug}`} className="block group">
                      <Card className="group relative overflow-hidden rounded-2xl hover:shadow-lg hover:border-primary/20 transition-all duration-500">
                        {/* Top gradient line */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                              <IconComp className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-medium ${
                                service.pricingType === 'subscription'
                                  ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                  : 'border-amber-500/30 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {service.pricingType === 'subscription' ? 'Recurring' : 'One-Time'}
                            </Badge>
                          </div>

                          <div>
                            <h3 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors">
                              {service.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {service.shortDescription}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">
                                {service.pricingType === 'subscription' ? 'Starting from' : 'Starting at'}
                              </p>
                              <p className="text-lg font-bold text-foreground">
                                ${lowest.toFixed(2)}
                                {service.pricingType === 'subscription' && (
                                  <span className="text-xs font-normal text-muted-foreground">/mo</span>
                                )}
                              </p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
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

      {/* ═══════════════════════════════════════════════════
          STATS — Big numbers section
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="rounded-3xl bg-gradient-to-br from-primary via-emerald-600 to-teal-600 p-12 md:p-16 lg:p-20 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

            <div className="relative z-10">
              <motion.p variants={reveal} custom={0} className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-3">
                Our Track Record
              </motion.p>
              <motion.h2 variants={reveal} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-12 md:mb-16 tracking-tight">
                Numbers That Speak
              </motion.h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                {stats.map((stat, i) => (
                  <motion.div key={stat.label} variants={reveal} custom={i + 2}>
                    <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-2">{stat.value}</p>
                    <p className="text-white/60 text-sm sm:text-base">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WHY CHOOSE US — Simple grid
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-muted/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.p variants={reveal} custom={0} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Why TechServ
            </motion.p>
            <motion.h2 variants={reveal} custom={1} className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Built on Trust & Quality
            </motion.h2>
            <motion.p variants={reveal} custom={2} className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We don&apos;t just deliver services — we build lasting partnerships with our clients.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {perks.map((perk, i) => {
              const PerkIcon = perk.icon
              return (
                <motion.div key={perk.title} variants={reveal} custom={i}>
                  <Card className="rounded-2xl p-6 text-center h-full hover:shadow-md hover:border-primary/20 transition-all duration-300">
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-primary/10 mb-5">
                      <PerkIcon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-base mb-2">{perk.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{perk.desc}</p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA — Clean and bold
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative rounded-3xl border border-border bg-card overflow-hidden"
          >
            {/* Subtle bg gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5 pointer-events-none" />

            <div className="relative z-10 px-8 py-16 sm:px-12 sm:py-20 md:px-20 md:py-24 text-center">
              <motion.div variants={reveal} custom={0} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Ready to start?</span>
              </motion.div>

              <motion.h2 variants={reveal} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 max-w-2xl mx-auto">
                Let&apos;s Build Something{' '}
                <span className="bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
                  Great Together
                </span>
              </motion.h2>

              <motion.p variants={reveal} custom={2} className="text-muted-foreground text-lg max-w-lg mx-auto mb-10">
                Create your free account and get access to all our premium tech services. No credit card required.
              </motion.p>

              <motion.div variants={reveal} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" asChild className="h-14 px-10 text-base font-semibold rounded-xl shadow-xl shadow-primary/20">
                  <Link href="/auth/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild className="h-14 px-10 text-base font-semibold rounded-xl">
                  <Link href="/services">Browse Services</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
