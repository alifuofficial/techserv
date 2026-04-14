'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  MessageCircle, 
  LogOut, 
  ChevronRight,
  Sparkles,
  Zap,
  Award,
  Crown
} from 'lucide-react'
import { TMACard, TMAHeader } from './tma-components'
import { calculateXP } from '@/lib/xp'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

interface UserStats {
  name: string
  email: string
  telegram: string | null
  completedOrders: number
  referralCount: number
}

export function TMAProfile({ user }: { user: UserStats }) {
  const { level, currentXP, nextLevelXP, progress, label, color } = calculateXP(
    user.completedOrders,
    user.referralCount
  )

  const menuItems = [
    { icon: MessageCircle, label: 'Telegram Linking', desc: user.telegram ? `@${user.telegram}` : 'Not Linked', color: 'text-blue-400' },
    { icon: Bell, label: 'Notifications', desc: 'Enabled', color: 'text-emerald-400' },
    { icon: Shield, label: 'Privacy & Security', desc: 'Verified', color: 'text-purple-400' },
    { icon: Sparkles, label: 'Theme Preferences', desc: 'Gamified Dark', color: 'text-amber-400' },
  ]

  return (
    <div className="pb-10">
      <TMAHeader 
        title="My Profile" 
        subtitle="Manage your account and view achievements" 
      />

      <div className="px-5 space-y-6">
        {/* Profile Card */}
        <TMACard className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/5">
          <div className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <User className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-slate-900 shadow-xl">
                Lvl {level}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-slate-500 text-xs mb-6">{user.email}</p>

            <div className="bg-black/20 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-emerald-400">{label}</span>
                <span className="text-slate-500">{currentXP} / {nextLevelXP} XP</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-white/5" />
            </div>
          </div>
        </TMACard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <TMACard className="p-4 bg-white/[0.02]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Rank</p>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-white text-sm">Legendary</span>
            </div>
          </TMACard>
          <TMACard className="p-4 bg-white/[0.02]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">XP Bonus</p>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-white text-sm">1.5x Multi</span>
            </div>
          </TMACard>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <TMACard key={i} className="group active:scale-[0.98] transition-all">
              <button className="w-full p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <item.icon className={cn("w-5 h-5", item.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-0.5">{item.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </TMACard>
          ))}
        </div>

        {/* Sign Out */}
        <Button 
          variant="ghost" 
          onClick={() => signOut()}
          className="w-full h-14 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-500 font-bold border border-red-500/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Disconnect Account
        </Button>
      </div>
    </div>
  )
}
