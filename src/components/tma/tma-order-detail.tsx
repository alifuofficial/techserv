'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Info,
  DollarSign,
  FileText,
  User,
  MessageCircle,
  XCircle,
  Activity
} from 'lucide-react'
import { TMACard, TMAHeader, TMAStatusBadge } from './tma-components'
import { useSettings } from '@/hooks/use-settings'
import { format } from 'date-fns'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  status: string
  amount: number
  progress: number
  createdAt: string
  updatedAt: string
  statusMessage: string | null
  adminNote: string | null
  service: { title: string; icon: string }
  telegramUsername: string | null
}

export function TMAOrderDetail({ order }: { order: Order }) {
  const { formatAmount } = useSettings()

  const timelineSteps = [
    { label: 'Order Placed', status: 'completed', icon: FileText },
    { label: 'Payment Verified', status: ['approved', 'completed'].includes(order.status) ? 'completed' : 'active', icon: DollarSign },
    { label: 'In Progress', status: order.status === 'completed' ? 'completed' : order.status === 'approved' ? 'active' : 'pending', icon: Activity },
    { label: 'Delivered', status: order.status === 'completed' ? 'completed' : 'pending', icon: CheckCircle2 },
  ]

  return (
    <div className="pb-10">
      <TMAHeader 
        title={`Order Info`} 
        subtitle={`Tracking ID: #${order.id.slice(0, 8).toUpperCase()}`} 
      />

      <div className="px-5 space-y-6">
        {/* Main Status Card */}
        <TMACard className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
          <div className="p-5">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-0.5">{order.service.title}</h3>
                  <TMAStatusBadge status={order.status} />
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>Total Progress</span>
                <span className="text-emerald-400">{order.progress}%</span>
              </div>
              <Progress value={order.progress} className="h-2 bg-black/40" />
            </div>
            
            {order.statusMessage && (
              <div className="mt-4 p-3 rounded-xl bg-black/20 border border-white/5">
                <p className="text-[11px] font-medium text-emerald-400 leading-snug">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse" />
                  {order.statusMessage}
                </p>
              </div>
            )}
          </div>
        </TMACard>

        {/* Timeline */}
        <TMACard className="p-5">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">Fulfillment Timeline</h4>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/5" />
            <div className="space-y-8">
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex gap-4 items-center relative z-10">
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-500",
                    step.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" :
                    step.status === 'active' ? "bg-black border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" :
                    "bg-black border-white/10 text-slate-600"
                  )}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-bold",
                      step.status !== 'pending' ? "text-white" : "text-slate-600"
                    )}>{step.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {step.status === 'completed' ? 'Action Successful' : step.status === 'active' ? 'Currently Active' : 'Waiting for previous steps'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TMACard>

        {/* Details List */}
        <div className="space-y-3">
          <TMACard className="p-4 flex items-center gap-4 bg-white/[0.02]">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pricing</p>
              <p className="font-bold text-white text-sm">{formatAmount(order.amount)}</p>
            </div>
          </TMACard>

          <TMACard className="p-4 flex items-center gap-4 bg-white/[0.02]">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Account</p>
              <p className="font-bold text-white text-sm">@{order.telegramUsername || 'Not Specified'}</p>
            </div>
          </TMACard>
          
          <TMACard className="p-4 flex items-center gap-4 bg-white/[0.02]">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Created On</p>
              <p className="font-bold text-white text-sm">{format(new Date(order.createdAt), 'MMMM d, yyyy')}</p>
            </div>
          </TMACard>
        </div>

        {/* Admin Note */}
        {order.adminNote && (
          <TMACard className="p-5 border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-2 mb-3 text-blue-400 font-bold text-sm">
              <Info className="w-4 h-4" />
              Note from Support
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {order.adminNote}
            </p>
          </TMACard>
        )}
      </div>
    </div>
  )
}
