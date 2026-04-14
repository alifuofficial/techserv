'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function TMACard({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-2xl overflow-hidden",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function TMAHeader({ title, subtitle, backHref }: { title: string, subtitle?: string, backHref?: string }) {
  return (
    <div className="px-5 pt-8 pb-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-sm text-slate-400 font-medium">{subtitle}</p>
      )}
    </div>
  )
}

export function TMAStatusBadge({ status }: { status: string }) {
  const config: Record<string, { cls: string, label: string }> = {
    pending: { cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Pending' },
    approved: { cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Processing' },
    completed: { cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Completed' },
    rejected: { cls: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejected' },
  }
  const { cls, label } = config[status.toLowerCase()] || config.pending
  return (
    <span className={cn(
      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
      cls
    )}>
      {label}
    </span>
  )
}
