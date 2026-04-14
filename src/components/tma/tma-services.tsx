'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, ChevronRight, Search } from 'lucide-react'
import { TMACard, TMAHeader } from './tma-components'
import { useSettings } from '@/hooks/use-settings'
import * as Icons from 'lucide-react'

interface Service {
  id: string
  title: string
  slug: string
  shortDescription: string
  icon: string
  pricingType: string
  pricingTiers: string
  orderCount: number
}

export function TMAServices({ 
  services, 
  loading, 
  searchQuery, 
  setSearchQuery 
}: { 
  services: Service[], 
  loading: boolean, 
  searchQuery: string, 
  setSearchQuery: (q: string) => void 
}) {
  const { formatAmount } = useSettings()

  const getCheapestPrice = (tiersJson: string) => {
    try {
      const tiers = JSON.parse(tiersJson || '[]')
      if (tiers.length === 0) return 0
      return Math.min(...tiers.map((t: any) => t.price))
    } catch { return 0 }
  }

  return (
    <div className="pb-8">
      <TMAHeader 
        title="Explore Services" 
        subtitle="Power up your presence with our premium tools" 
      />

      {/* Search */}
      <div className="px-5 mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.05] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
          />
        </div>
      </div>

      <div className="px-5 space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <TMACard key={i} className="h-24 animate-pulse" />
          ))
        ) : services.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-500 italic">No services found</p>
          </div>
        ) : (
          services.map((service, i) => {
            const Icon = (Icons as any)[service.icon] || Zap
            const price = getCheapestPrice(service.pricingTiers)

            return (
              <Link key={service.id} href={`/services/${service.slug}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <TMACard delay={i * 0.05} className="group relative overflow-hidden bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all">
                    {/* Subtle Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-5 flex items-center gap-5 relative z-10">
                      {/* Icon Container with Glow */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:border-emerald-500/40 group-hover:scale-110 transition-all duration-300">
                          <Icon className="w-7 h-7" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-white text-base mb-1 truncate group-hover:text-emerald-300 transition-colors">
                          {service.title}
                        </h3>
                        
                        <div className="flex items-center gap-2.5">
                          <div className="bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tight">
                              From {formatAmount(price)}
                            </span>
                          </div>
                          
                          {service.orderCount > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                              <Zap className="w-3 h-3 text-amber-500" />
                              <span>{service.orderCount} Active</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </TMACard>
                </motion.div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
