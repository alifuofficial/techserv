'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Zap,
  DollarSign,
  Shield,
  MessageCircle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShoppingCart,
  FileText,
  Rocket,
  ChevronRight,
  Sparkles,
  Users,
  Star,
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
import { Separator } from '@/components/ui/separator'

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
  orderCount: number
}

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.15, duration: 0.7, ease: 'easeOut' },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ────────────────────────────────────────────
   Icon map – dynamically render service icons
   ──────────────────────────────────────────── */
const iconMap: Record<string, React.ElementType> = {
  Zap,
  DollarSign,
  Shield,
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
   Sub-components
   ──────────────────────────────────────────── */

/** Skeleton card that matches the service card layout */
function ServiceCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </CardFooter>
    </Card>
  )
}

/* ────────────────────────────────────────────
   Feature data
   ──────────────────────────────────────────── */
const features = [
  {
    icon: Zap,
    title: 'Instant Activation',
    description: 'Get your service activated within hours, not days. Fast and reliable delivery.',
  },
  {
    icon: DollarSign,
    title: 'Competitive Pricing',
    description: 'Best prices for premium services with transparent, no-hidden-cost pricing.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Your transactions are encrypted and safe with industry-standard security.',
  },
  {
    icon: MessageCircle,
    title: '24/7 Support',
    description: 'Round-the-clock customer support via Telegram and email.',
  },
  {
    icon: CheckCircle2,
    title: 'Verified Service',
    description: 'All services are thoroughly tested and guaranteed to work as described.',
  },
  {
    icon: RefreshCw,
    title: 'Easy Refunds',
    description: 'Hassle-free refund process if your service doesn\'t meet expectations.',
  },
]

const steps = [
  {
    step: 1,
    title: 'Choose Your Service',
    description: 'Browse our catalog and select the premium service that fits your needs.',
    icon: ShoppingCart,
  },
  {
    step: 2,
    title: 'Place Your Order',
    description: 'Select your preferred duration, make a secure payment, and provide your details.',
    icon: FileText,
  },
  {
    step: 3,
    title: 'Get Activated',
    description: 'Our team verifies your order and activates your service fast — usually within hours.',
    icon: Rocket,
  },
]

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services')
        if (res.ok) {
          const data: Service[] = await res.json()
          setServices(data.slice(0, 6))
        }
      } catch {
        // silent fail – show empty state
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  return (
    <div className="flex flex-col">
      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section className="relative overflow-hidden grid-pattern">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none" />

        {/* Decorative orbs */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-40 h-60 w-60 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 md:pt-32 md:pb-36">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left – Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-6 text-center lg:text-left"
            >
              <motion.div variants={fadeUp} custom={0}>
                <Badge className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Trusted by 500+ Customers
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
              >
                Premium Tech Services,{' '}
                <span className="text-primary">Delivered Fast</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Get Telegram Premium, custom bots, and more — all at competitive prices with instant activation.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2"
              >
                <Button size="lg" asChild className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25">
                  <Link href="/services">
                    Browse Services
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="h-12 px-8 text-base font-semibold">
                  <Link href="/auth/signup">Sign Up Free</Link>
                </Button>
              </motion.div>

              {/* Social proof mini */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="flex items-center gap-4 justify-center lg:justify-start pt-4"
              >
                <div className="flex -space-x-2">
                  {[
                    'bg-primary',
                    'bg-emerald-500',
                    'bg-teal-500',
                    'bg-green-600',
                  ].map((bg, i) => (
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-full ${bg} border-2 border-background flex items-center justify-center text-[10px] font-bold text-white`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">500+</span> happy customers
                </div>
              </motion.div>
            </motion.div>

            {/* Right – Decorative card preview */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main preview card */}
                <div className="glow-green rounded-2xl bg-card border border-border p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Telegram Premium</p>
                      <p className="text-xs text-muted-foreground">Most Popular</p>
                    </div>
                    <Badge className="ml-auto bg-primary text-primary-foreground">Popular</Badge>
                  </div>
                  <Separator className="mb-4" />
                  <div className="space-y-3">
                    {[
                      'Upgraded upload limits',
                      'Voice-to-text transcription',
                      'Exclusive stickers & emoji',
                      'Premium reactions',
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-foreground">$4.99</span>
                      <span className="text-sm text-muted-foreground">/ 3 months</span>
                    </div>
                    <Button size="sm" className="shadow-md shadow-primary/20">
                      Order Now
                    </Button>
                  </div>
                </div>

                {/* Floating accent cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 shadow-lg shadow-primary/25 flex items-center gap-2 text-sm font-semibold"
                >
                  <Rocket className="h-4 w-4" />
                  Instant
                </motion.div>

                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-3 -left-3 rounded-xl bg-card border border-border px-4 py-2.5 shadow-lg flex items-center gap-2 text-sm font-medium"
                >
                  <Shield className="h-4 w-4 text-primary" />
                  100% Secure
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURES SECTION
          ================================================================ */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-14"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              The <span className="text-primary">TechServ</span> Advantage
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We go above and beyond to make sure you get the best experience with every order.
            </p>
          </motion.div>

          {/* Feature grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} variants={fadeUp} custom={i}>
                  <Card className="h-full group hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="pt-1">
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          POPULAR SERVICES SECTION
          ================================================================ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-14"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              Our Services
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Popular <span className="text-primary">Services</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore our most popular offerings and get started today.
            </p>
          </motion.div>

          {/* Service cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Skeleton state
              Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
            ) : services.length === 0 ? (
              // Empty state
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">No services available at the moment. Check back soon!</p>
              </div>
            ) : (
              services.map((service, i) => {
                const IconComp = iconMap[service.icon] || Zap
                const lowestPrice = Math.min(service.price3m, service.price6m, service.price12m)

                return (
                  <motion.div
                    key={service.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={fadeUp}
                    custom={i}
                  >
                    <Card className="h-full group hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
                      {/* Subtle accent gradient at top */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                            <IconComp className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <CardTitle className="text-lg truncate">{service.title}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {service.shortDescription}
                        </p>
                      </CardContent>

                      <CardFooter className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-xs text-muted-foreground">Starting from</span>
                          <p className="text-lg font-bold text-primary">
                            ${lowestPrice.toFixed(2)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild className="group/btn">
                          <Link href={`/services/${service.slug}`}>
                            Details
                            <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* View all button */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mt-12 text-center"
          >
            <Button variant="outline" size="lg" asChild className="h-11 px-8 text-base">
              <Link href="/services">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS SECTION
          ================================================================ */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Get Started in <span className="text-primary">3 Easy Steps</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Ordering your first service is quick and simple.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />

            {steps.map((step, i) => {
              const StepIcon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeUp}
                  custom={i}
                  className="flex flex-col items-center text-center relative"
                >
                  {/* Step number circle */}
                  <div className="relative mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                      <StepIcon className="h-7 w-7" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary text-xs font-bold text-primary">
                      {step.step}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA SECTION
          ================================================================ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeIn}
            custom={0}
            className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 sm:px-12 sm:py-20 text-center"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none" />
            <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
              <motion.div variants={fadeUp} custom={1}>
                <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  Join 500+ Users
                </Badge>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                custom={2}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary-foreground"
              >
                Ready to Get Started?
              </motion.h2>

              <motion.p
                variants={fadeUp}
                custom={3}
                className="text-lg text-primary-foreground/80 max-w-lg mx-auto leading-relaxed"
              >
                Join hundreds of satisfied customers. Create your free account today and experience premium tech services.
              </motion.p>

              <motion.div variants={fadeUp} custom={4} className="mt-2">
                <Button
                  size="lg"
                  asChild
                  className="h-13 px-10 text-base font-semibold bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/10 transition-all duration-300 hover:scale-[1.02]"
                >
                  <Link href="/auth/signup">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
