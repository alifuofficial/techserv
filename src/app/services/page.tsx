'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  ChevronRight,
  Search,
  PackageOpen,
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
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

/* ────────────────────────────────────────────
   Icon map – dynamically render service icons
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
   Skeleton component
   ──────────────────────────────────────────── */
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
   Main Page Component
   ──────────────────────────────────────────── */
export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services')
        if (res.ok) {
          const data: Service[] = await res.json()
          setServices(data)
        }
      } catch {
        // silent fail – show empty state
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      {/* ================================================================
          PAGE HEADER
          ================================================================ */}
      <section className="relative overflow-hidden grid-pattern">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none" />

        {/* Decorative orbs */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-40 h-60 w-60 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-14 md:pt-28 md:pb-18">
          <motion.div
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                <Zap className="h-3.5 w-3.5 mr-1" />
                Service Catalog
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4"
            >
              Our <span className="text-primary">Services</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Choose from our range of premium tech services
            </motion.p>

            {/* Search bar */}
            <motion.div variants={fadeUp} custom={3} className="mt-8 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-card/80 border-border/50 backdrop-blur-sm"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          SERVICES GRID
          ================================================================ */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {loading ? (
            /* Skeleton loading state */
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}>
                  <ServiceCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : filteredServices.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                <PackageOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No services found' : 'No services available'}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {searchQuery
                  ? `No services matching "${searchQuery}". Try a different search term.`
                  : 'No services are available at the moment. Check back soon!'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              <motion.p className="text-sm text-muted-foreground mb-6">
                Showing {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
              </motion.p>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredServices.map((service, i) => {
                  const IconComp = iconMap[service.icon] || Zap
                  // Calculate cheapest monthly price
                  const monthlyPrices = [
                    service.price3m / 3,
                    service.price6m / 6,
                    service.price12m / 12,
                  ]
                  const cheapestMonthly = Math.min(...monthlyPrices)

                  return (
                    <motion.div
                      key={service.id}
                      variants={fadeUp}
                      custom={i}
                    >
                      <Card className="h-full group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
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
                            {service.orderCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-xs bg-primary/10 text-primary border-primary/20"
                              >
                                {service.orderCount} {service.orderCount === 1 ? 'order' : 'orders'}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="flex-1">
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                            {service.shortDescription}
                          </p>
                        </CardContent>

                        <CardFooter className="flex items-center justify-between mt-auto pt-0">
                          <div>
                            <span className="text-xs text-muted-foreground">Starting from</span>
                            <p className="text-lg font-bold text-primary">
                              ${cheapestMonthly.toFixed(2)}
                              <span className="text-xs font-normal text-muted-foreground">/mo</span>
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild className="group/btn">
                            <Link href={`/services/${service.slug}`}>
                              View Details
                              <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
