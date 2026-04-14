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
                <TMACard delay={i * 0.05} className="mb-4">
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center text-emerald-400 group-active:scale-95 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white mb-0.5 truncate">{service.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-400">
                          From {formatAmount(price)}
                        </span>
                        {service.orderCount > 0 && (
                          <span className="text-[10px] text-slate-500 font-medium bg-white/5 px-1.5 py-0.5 rounded-md">
                            {service.orderCount} Used
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </div>
                </TMACard>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
