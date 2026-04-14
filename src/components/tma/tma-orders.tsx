'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Package, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { TMACard, TMAHeader, TMAStatusBadge } from './tma-components'
import { useSettings } from '@/hooks/use-settings'
import { format } from 'date-fns'
import { Progress } from '@/components/ui/progress'

interface Order {
  id: string
  status: string
  amount: number
  progress: number
  createdAt: string
  service: { title: string; icon: string }
}

export function TMAOrders({ 
  orders, 
  loading 
}: { 
  orders: Order[], 
  loading: boolean 
}) {
  const { formatAmount } = useSettings()

  return (
    <div className="pb-8">
      <TMAHeader 
        title="My Orders" 
        subtitle="Track your active services and history" 
      />

      <div className="px-5 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <TMACard key={i} className="h-32 animate-pulse" />
          ))
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">No orders found yet</p>
            <Link href="/services" className="text-emerald-400 text-sm font-bold mt-2 block">
              Browse Services
            </Link>
          </div>
        ) : (
          orders.map((order, i) => (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
              <TMACard delay={i * 0.05} className="p-4 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{order.service.title}</h3>
                      <p className="text-[10px] text-slate-500 tabular-nums">
                        #{order.id.slice(0, 8).toUpperCase()} • {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  <TMAStatusBadge status={order.status} />
                </div>

                {['approved', 'completed'].includes(order.status) && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-emerald-400">{order.progress}%</span>
                    </div>
                    <Progress value={order.progress} className="h-1.5 bg-white/5" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                  <span className="text-xs text-slate-400">Total Amount</span>
                  <span className="font-bold text-white">{formatAmount(order.amount)}</span>
                </div>
              </TMACard>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
