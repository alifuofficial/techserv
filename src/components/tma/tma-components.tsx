'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function TMACard({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function TMAHeader({ title, subtitle, backHref }: { title: string, subtitle?: string, backHref?: string }) {
  return (
    <div className="px-4 pt-8 pb-3">
      <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
      {subtitle && (
        <p className="text-sm text-white/40 font-medium mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}

export function TMAStatusBadge({ status }: { status: string }) {
  const config: Record<string, { cls: string; label: string }> = {
    pending: { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'In Queue' },
    approved: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Active' },
    completed: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Done' },
    rejected: { cls: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Failed' },
  }
  const { cls, label } = config[status.toLowerCase()] || config.pending
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border",
      cls
    )}>
      {label}
    </span>
  )
}