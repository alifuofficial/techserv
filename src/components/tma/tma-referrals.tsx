'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Gift, 
  Share2, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Link2,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react'
import { TMACard, TMAHeader } from './tma-components'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface ReferralData {
  referralCode: string
  referralCount: number
  referrals: Array<{
    id: string
    name: string
    email: string
    createdAt: string
    ordersCount: number
  }>
}

export function TMAReferrals({ 
  data, 
  botUsername, 
  handleShare, 
  handleCopyCode 
}: { 
  data: ReferralData, 
  botUsername: string, 
  handleShare: () => void,
  handleCopyCode: () => void
}) {
  const milestones = [
    { count: 1, label: 'First Step', reward: 'Bronze Badge', achieved: (data?.referralCount || 0) >= 1 },
    { count: 5, label: 'Squad Leader', reward: '5% Off', achieved: (data?.referralCount || 0) >= 5 },
    { count: 10, label: 'Referral Pro', reward: '10% Off', achieved: (data?.referralCount || 0) >= 10 },
    { count: 25, label: 'Ambassador', reward: 'Free Service', achieved: (data?.referralCount || 0) >= 25 },
  ]

  const nextMilestone = milestones.find(m => !m.achieved)
  const progressToNext = nextMilestone
    ? Math.min(Math.round(((data?.referralCount || 0) / nextMilestone.count) * 100), 100)
    : 100

  return (
    <div className="pb-10">
      <TMAHeader 
        title="Invite & Earn" 
        subtitle="Grow our community and unlock exclusive perks" 
      />

      <div className="px-5 space-y-6">
        {/* Main Invite Card */}
        <TMACard className="bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-indigo-500/20">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-xl">
              <Gift className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Referral Program</h2>
            <p className="text-slate-400 text-xs mb-6 px-4">
              Share your magic link with friends via Telegram and get rewards for every new member!
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleShare}
                className="flex-1 h-12 rounded-2xl bg-indigo-500 hover:bg-indigo-600 font-bold"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share on TG
              </Button>
              <Button 
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                className="h-12 w-12 rounded-2xl bg-white/5 border-white/10 group"
              >
                <Copy className="w-4 h-4 text-slate-400 group-active:scale-90 transition-transform" />
              </Button>
            </div>
          </div>
        </TMACard>

        {/* Level Progress */}
        <TMACard className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Program Progress</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              {data?.referralCount || 0} Joined
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-white">{nextMilestone?.label || 'Peak Reached'}</span>
              <span className="text-slate-500">{progressToNext}%</span>
            </div>
            <Progress value={progressToNext} className="h-2 bg-white/5" />
            <p className="text-[10px] text-slate-500 font-medium">
              {nextMilestone 
                ? `${nextMilestone.count - (data?.referralCount || 0)} more needed to unlock ${nextMilestone.reward}` 
                : "You've reached the highest referral tier! Legendary status unlocked."}
            </p>
          </div>
        </TMACard>

        {/* Milestones Grid */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">Reward Tiers</h4>
          <div className="grid grid-cols-2 gap-3">
            {milestones.map((m, i) => (
              <TMACard 
                key={i} 
                className={cn(
                  "p-4 border-dashed",
                  m.achieved ? "bg-emerald-500/5 border-emerald-500/30" : "bg-white/[0.01] border-white/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors",
                  m.achieved ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-600"
                )}>
                  {m.achieved ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <p className={cn("text-xs font-bold", m.achieved ? "text-white" : "text-slate-500")}>{m.label}</p>
                <p className="text-[10px] text-slate-600 font-medium mt-0.5">{m.reward}</p>
              </TMACard>
            ))}
          </div>
        </div>

        {/* Recent Invites */}
        {data?.referrals && data.referrals.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">Recent Referrals</h4>
            <div className="space-y-3">
              {data.referrals.map((ref, i) => (
                <TMACard key={i} className="p-3 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {ref.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{ref.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Joined {ref.createdAt ? (() => {
                          try {
                            const d = new Date(ref.createdAt)
                            return isNaN(d.getTime()) ? 'Recently' : format(d, 'MMM d')
                          } catch { return 'Recently' }
                        })() : 'Recently'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-500 tabular-nums uppercase">+30 XP</p>
                      <p className="text-[10px] text-slate-600 font-medium">{ref.ordersCount} Orders</p>
                    </div>
                  </div>
                </TMACard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
