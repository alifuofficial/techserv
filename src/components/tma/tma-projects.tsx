'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Briefcase, 
  ChevronRight, 
  Timer, 
  Activity, 
  ShieldCheck,
  Zap
} from 'lucide-react'
import { TMACard, TMAHeader, TMAStatusBadge } from './tma-components'
import { useSettings } from '@/hooks/use-settings'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'

interface Order {
  id: string
  status: string
  progress: number
  statusMessage: string | null
  createdAt: string
  service: { title: string; icon: string }
}

export function TMAProjects({ projects, loading }: { projects: Order[], loading: boolean }) {
  const { formatAmount } = useSettings()

  return (
    <div className="pb-10">
      <TMAHeader 
        title="Live Projects" 
        subtitle="Real-time progress of your active services" 
      />

      <div className="px-5 space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <TMACard key={i} className="h-48 animate-pulse" />
          ))
        ) : projects.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">No active projects</p>
            <p className="text-[10px] text-slate-600 mt-2 px-10">Approved orders will appear here for progress tracking.</p>
          </div>
        ) : (
          projects.map((project, i) => (
            <Link key={project.id} href={`/dashboard/orders/${project.id}`}>
              <TMACard delay={i * 0.05} className="p-5 mb-4 bg-gradient-to-br from-white/[0.04] to-transparent">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-active:scale-95 transition-transform">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{project.service.title}</h3>
                      <p className="text-[10px] text-slate-500 font-mono tracking-widest">#{project.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <TMAStatusBadge status={project.status} />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Power Level</span>
                    <span className="text-emerald-400">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2 bg-black/40" />
                </div>

                {project.statusMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-4">
                    <p className="text-[11px] font-medium text-emerald-400/80 leading-snug">
                       <Activity className="w-3 h-3 inline mr-2 text-emerald-500" />
                       {project.statusMessage}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Timer className="w-3 h-3 text-slate-600" />
                    <span className="text-[10px] text-slate-500 font-medium">Updated {format(new Date(project.createdAt), 'MMM d')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </div>
              </TMACard>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
