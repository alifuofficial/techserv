'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Gift,
  Zap,
  Star,
  Trophy,
  ShoppingCart,
  Clock,
  CheckCircle2,
  ChevronRight,
  Share2,
  Copy,
  Sparkles,
  Flame,
  Target,
  Award,
  Wallet,
  Package,
  Crown,
  Medal,
  Heart,
  Settings,
  Bell,
  Swords,
  Shield,
  Rocket,
  Gem,
  FlameKindling,
  CircleDot,
} from 'lucide-react'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/components/telegram-provider'
import { calculateXP } from '@/lib/xp'

interface TMAUserStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalSpent: number
  tier: string
  referralCode: string
  referralCount: number
  hasLinkedTelegram?: boolean
}

interface ReferralData {
  referralCode: string
  referralCount: number
  referrals: Array<{
    id: string
    name: string
    email: string
    createdAt: string
    ordersCount: number
    totalSpent: number
  }>
}

interface TMAOrder {
  id: string
  status: string
  amount: number
  progress: number
  createdAt: string
  service: { title: string; icon: string }
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const pop = {
  hidden: { opacity: 0, scale: 0.85, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } },
}

const slideUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

const tierConfig: Record<number, { gradient: string; shadow: string; icon: typeof Star; label: string; bg: string }> = {
  5: { gradient: 'from-amber-400 via-orange-400 to-yellow-500', shadow: 'shadow-amber-500/40', icon: Crown, label: 'Legendary', bg: 'bg-amber-500' },
  4: { gradient: 'from-purple-500 via-violet-500 to-indigo-500', shadow: 'shadow-purple-500/40', icon: Award, label: 'Elite', bg: 'bg-purple-500' },
  3: { gradient: 'from-blue-500 via-cyan-400 to-sky-500', shadow: 'shadow-blue-500/40', icon: Medal, label: 'Pro', bg: 'bg-blue-500' },
  2: { gradient: 'from-emerald-400 via-green-400 to-teal-500', shadow: 'shadow-emerald-500/40', icon: Star, label: 'Apprentice', bg: 'bg-emerald-500' },
}

function getLevelTier(level: number) {
  if (level >= 50) return tierConfig[5]
  if (level >= 30) return tierConfig[4]
  if (level >= 20) return tierConfig[3]
  if (level >= 10) return tierConfig[2]
  return { gradient: 'from-slate-400 to-slate-500', shadow: '', icon: Sparkles, label: 'Novice', bg: 'bg-slate-500' }
}

function XPRing({ progress, level, label, color }: { progress: number; level: number; label: string; color: string }) {
  const tier = getLevelTier(level)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const ringRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100)
    return () => clearTimeout(timer)
  }, [progress])

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference
  const TierIcon = tier.icon

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg ref={ringRef} className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke="url(#xpGradient)" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn('h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg', tier.gradient, tier.shadow)}>
            <TierIcon className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-2xl font-black text-white tracking-tight">LVL {level}</p>
        <p className={cn('text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent', tier.gradient)}>
          {label}
        </p>
      </div>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, accent }: { icon: typeof Star; label: string; value: string | number; accent: string }) {
  return (
    <motion.div variants={pop} className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center', accent)}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</span>
      </div>
      <p className="text-xl font-black text-white">{value}</p>
    </motion.div>
  )
}

function QuestCard({ icon: Icon, title, subtitle, progress, current, target, gradient, href }: {
  icon: typeof Star; title: string; subtitle: string; progress: number; current: number; target: number; gradient: string; href: string;
}) {
  return (
    <motion.a
      href={href}
      variants={pop}
      whileTap={{ scale: 0.97 }}
      className="block bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 group active:bg-white/[0.06] transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={cn('h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg', gradient)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors">{title}</h4>
          <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>
          {progress > 0 && (
            <div className="mt-2.5">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-white/50 font-medium">{current}/{target}</span>
                <span className="text-emerald-400 font-bold">{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-emerald-400 transition-colors mt-1" />
      </div>
    </motion.a>
  )
}

function MissionCard({ order }: { order: TMAOrder }) {
  const statusTheme: Record<string, { gradient: string; icon: typeof Clock; label: string }> = {
    pending: { gradient: 'from-amber-500 to-orange-500', icon: Clock, label: 'In Queue' },
    approved: { gradient: 'from-blue-500 to-cyan-500', icon: Zap, label: 'Active' },
    completed: { gradient: 'from-emerald-500 to-teal-500', icon: CheckCircle2, label: 'Done' },
    rejected: { gradient: 'from-red-500 to-rose-500', icon: Clock, label: 'Failed' },
  }
  const theme = statusTheme[order.status] || statusTheme.pending
  const StatusIcon = theme.icon

  return (
    <motion.a
      href={`/dashboard/orders/${order.id}`}
      variants={slideUp}
      whileTap={{ scale: 0.97 }}
      className="block bg-white/[0.04] border border-white/[0.06] rounded-xl p-3.5 group active:bg-white/[0.06] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={cn('h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0', theme.gradient)}>
          <StatusIcon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{order.service.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-white/30 text-[10px] font-mono">#{order.id.slice(0, 8)}</span>
            <span className={cn('text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r bg-clip-text text-transparent', theme.gradient)}>
              {theme.label}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-white font-bold text-sm">${order.amount}</p>
          {order.progress > 0 && (
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${order.progress}%` }} />
            </div>
          )}
        </div>
      </div>
    </motion.a>
  )
}

function AchievementNode({ icon: Icon, label, achieved, colorClass }: { icon: typeof Star; label: string; achieved: boolean; colorClass: string }) {
  return (
    <motion.div variants={pop} className="flex flex-col items-center gap-1.5 min-w-[52px]">
      <div className={cn(
        'h-11 w-11 rounded-xl flex items-center justify-center border transition-all',
        achieved
          ? `${colorClass} border-white/10 shadow-lg`
          : 'bg-white/[0.04] border-white/[0.06]'
      )}>
        <Icon className={cn('h-5 w-5', achieved ? 'text-white' : 'text-white/20')} />
      </div>
      <span className={cn('text-[9px] font-bold text-center leading-tight', achieved ? 'text-white/80' : 'text-white/25')}>
        {label}
      </span>
    </motion.div>
  )
}

function SquadCard({ code, count, referrals, onShare, isSharing, codeReady }: {
  code: string; count: number; referrals: ReferralData['referrals']; onShare: () => void; isSharing: boolean; codeReady: boolean;
}) {
  return (
    <motion.div variants={slideUp} className="relative">
      <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-2xl blur-sm opacity-60" />
      <div className="relative bg-white/[0.04] border border-emerald-500/20 rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Swords className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Build Your Squad</h3>
                <p className="text-emerald-400/70 text-xs font-medium">{count} member{count !== 1 ? 's' : ''} recruited</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <FlameKindling className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-black">+{count * 30} XP</span>
            </div>
          </div>

          <div className="bg-black/30 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Referral Code</span>
              <div className="flex items-center gap-2">
                <code className="bg-white/10 px-2.5 py-1 rounded-lg font-mono font-black text-white tracking-widest text-sm">
                  {code || '------'}
                </code>
                <button
                  className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors active:scale-90 disabled:opacity-40 disabled:cursor-wait"
                  disabled={!code}
                  onClick={() => {
                    if (code) {
                      navigator.clipboard.writeText(code)
                      toast.success('Code copied!')
                    }
                  }}
                >
                  <Copy className="h-3.5 w-3.5 text-white/60" />
                </button>
              </div>
            </div>

            <button
              onClick={onShare}
              disabled={isSharing}
              className={cn(
                "w-full h-11 font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all",
                codeReady
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white active:scale-[0.98]"
                  : "bg-white/10 text-white/40 cursor-wait"
              )}
            >
              {isSharing ? (
                <>
                  <motion.div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sharing...
                </>
              ) : !codeReady ? (
                'Loading Code...'
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share & Invite via Telegram
                </>
              )}
            </button>
          </div>

          {referrals && referrals.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {referrals.slice(0, 5).map((ref) => (
                  <div
                    key={ref.id}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-[10px] border-2 border-slate-950"
                    title={ref.name}
                  >
                    {ref.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                ))}
              </div>
              {referrals.length > 5 && (
                <span className="text-white/40 text-xs font-bold">+{referrals.length - 5} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function RankUpCard({ completedOrders }: { completedOrders: number }) {
  const target = 10
  const percent = Math.min((completedOrders / target) * 100, 100)
  return (
    <motion.div variants={slideUp} className="relative">
      <div className="absolute -inset-px bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-sm opacity-60" />
      <div className="relative bg-white/[0.04] border border-amber-500/20 rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-amber-400 to-orange-400" />
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Gem className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">Rank Up to Gold</h3>
                <span className="text-amber-400 text-xs font-bold">{percent}%</span>
              </div>
              <p className="text-white/40 text-xs mt-0.5">Complete {target} orders to become Gold</p>
              <div className="mt-2.5 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="text-white/30 text-[10px] mt-1.5 font-mono">{completedOrders}/{target} orders completed</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function TMADashboard({
  userStats,
  referralData,
  orders,
  sessionUser,
  botUsername = 'milkytechonlinebot',
}: {
  userStats: TMAUserStats | null
  referralData: ReferralData | null
  orders: TMAOrder[]
  sessionUser?: { referralCode?: string }
  botUsername?: string
}) {
  const { webApp, isTma } = useTelegram()
  const [isSharing, setIsSharing] = useState(false)

  const getReferralCode = async (): Promise<string | null> => {
    let code = referralData?.referralCode || userStats?.referralCode || sessionUser?.referralCode
    if (code) return code

    try {
      const res = await fetch('/api/user/referrals')
      if (res.ok) {
        const data = await res.json()
        if (data.referralCode) return data.referralCode
      }
    } catch {}

    try {
      const res = await fetch('/api/user/stats')
      if (res.ok) {
        const data = await res.json()
        if (data.referralCode) return data.referralCode
      }
    } catch {}

    return null
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const code = await getReferralCode()
      if (!code) {
        toast.error('Unable to load referral code. Please try again.')
        return
      }

      const referralLink = `https://t.me/${botUsername}/app?startapp=ref_${code}`
      const shareText = `Join me on MilkyTech.Online and get exclusive tech services! Use my referral code: ${code}`
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`

      if (webApp) {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`
        if (typeof webApp.openTelegramLink === 'function') {
          webApp.openTelegramLink(shareUrl)
        } else {
          window.open(shareUrl, '_blank')
        }
      } else {
        await navigator.clipboard.writeText(referralLink)
        toast.success('Referral link copied! Share it with your friends.')
      }
    } catch (err) {
      console.error('Share error:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  if (!isTma) return null

  const { level, currentXP, nextLevelXP, progress, label, color } = calculateXP(
    userStats?.completedOrders || 0,
    referralData?.referralCount || 0
  )

  const achievements = [
    { icon: Star, label: '1st\nOrder', achieved: (userStats?.totalOrders || 0) >= 1, colorClass: 'bg-gradient-to-br from-amber-500 to-yellow-500' },
    { icon: Trophy, label: '5\nOrders', achieved: (userStats?.totalOrders || 0) >= 5, colorClass: 'bg-gradient-to-br from-orange-500 to-red-500' },
    { icon: Users, label: '1st\nFriend', achieved: (referralData?.referralCount || 0) >= 1, colorClass: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
    { icon: Crown, label: '5\nFriends', achieved: (referralData?.referralCount || 0) >= 5, colorClass: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { icon: Flame, label: '10\nFriends', achieved: (referralData?.referralCount || 0) >= 10, colorClass: 'bg-gradient-to-br from-red-500 to-rose-500' },
    { icon: Heart, label: 'Super\nFan', achieved: (referralData?.referralCount || 0) >= 25, colorClass: 'bg-gradient-to-br from-pink-500 to-fuchsia-500' },
  ]

  return (
    <motion.div className="pb-6" variants={stagger} initial="hidden" animate="visible">
      <AnimatePresence mode="wait">
        <motion.div key="content" className="space-y-5 px-4 pt-4">

          {/* ── HERO: Level Ring ── */}
          <motion.div variants={slideUp} className="flex flex-col items-center pt-2">
            <XPRing progress={progress} level={level} label={label} color={color} />
            <div className="w-full mt-3 px-2">
              <div className="flex items-center justify-between text-[10px] text-white/30 mb-1.5">
                <span className="font-mono">{currentXP} XP</span>
                <span className="font-mono">{nextLevelXP} XP</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <a href="/dashboard/settings" className="h-10 w-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center active:scale-90 transition-transform">
                <Settings className="h-4.5 w-4.5 text-white/50" />
              </a>
              <button className="h-10 w-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center active:scale-90 transition-transform">
                <Bell className="h-4.5 w-4.5 text-white/50" />
              </button>
            </div>
          </motion.div>

          {/* ── STATS ROW ── */}
          <motion.div variants={stagger} className="grid grid-cols-2 gap-3">
            <MiniStat icon={ShoppingCart} label="Orders" value={userStats?.totalOrders || 0} accent="bg-gradient-to-br from-blue-500 to-cyan-500" />
            <MiniStat icon={Users} label="Referrals" value={referralData?.referralCount || 0} accent="bg-gradient-to-br from-emerald-500 to-teal-500" />
            <MiniStat icon={Wallet} label="Spent" value={`$${(userStats?.totalSpent || 0).toFixed(0)}`} accent="bg-gradient-to-br from-violet-500 to-purple-500" />
            <MiniStat icon={Clock} label="Pending" value={userStats?.pendingOrders || 0} accent="bg-gradient-to-br from-amber-500 to-orange-500" />
          </motion.div>

          {/* ── QUEST CARDS ── */}
          <motion.div variants={stagger} className="space-y-3">
            <motion.h3 variants={slideUp} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              Quick Actions
            </motion.h3>
            <QuestCard
              icon={Rocket}
              title="Browse Services"
              subtitle="Explore what you can order"
              progress={0}
              current={0}
              target={1}
              gradient="from-blue-500 to-cyan-500"
              href="/services"
            />
            <QuestCard
              icon={Package}
              title="My Orders"
              subtitle={`${userStats?.totalOrders || 0} total • ${userStats?.pendingOrders || 0} active`}
              progress={userStats?.completedOrders || 0 > 0 ? Math.min(((userStats?.completedOrders || 0) / Math.max(userStats?.totalOrders || 1, 1)) * 100, 100) : 0}
              current={userStats?.completedOrders || 0}
              target={userStats?.totalOrders || 0}
              gradient="from-purple-500 to-pink-500"
              href="/dashboard/orders"
            />
            <QuestCard
              icon={Swords}
              title="Squad Referrals"
              subtitle={`Earn 30 XP per recruit`}
              progress={0}
              current={referralData?.referralCount || 0}
              target={999}
              gradient="from-emerald-500 to-teal-500"
              href="/dashboard/referrals"
            />
          </motion.div>

          {/* ── ACHIEVEMENTS ── */}
          <motion.div variants={slideUp}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Achievements
              </h3>
              <span className="text-[10px] font-bold text-emerald-400/60">
                {achievements.filter(a => a.achieved).length}/{achievements.length}
              </span>
            </div>
            <div className="flex justify-between">
              {achievements.map((achievement, i) => (
                <AchievementNode key={i} {...achievement} />
              ))}
            </div>
          </motion.div>

          {/* ── SQUAD CARD ── */}
          <SquadCard
            code={referralData?.referralCode || userStats?.referralCode || sessionUser?.referralCode || ''}
            count={referralData?.referralCount || userStats?.referralCount || 0}
            referrals={referralData?.referrals || []}
            onShare={handleShare}
            isSharing={isSharing}
            codeReady={!!(referralData?.referralCode || userStats?.referralCode || sessionUser?.referralCode)}
          />

          {/* ── RANK UP CARD ── */}
          <RankUpCard completedOrders={userStats?.completedOrders || 0} />

          {/* ── ACTIVE MISSIONS ── */}
          <motion.div variants={stagger}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Active Missions
              </h3>
              {orders.length > 0 && (
                <a href="/dashboard/orders" className="text-emerald-400 text-xs font-bold flex items-center gap-0.5">
                  All <ChevronRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {orders.length > 0 ? (
              <div className="space-y-2">
                {orders.slice(0, 3).map((order) => (
                  <MissionCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <motion.div variants={slideUp} className="flex flex-col items-center py-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
                  <Package className="h-8 w-8 text-white/15" />
                </div>
                <p className="text-white/40 text-sm font-medium">No missions yet</p>
                <a href="/services" className="mt-3 h-10 px-5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform">
                  <Rocket className="h-4 w-4" />
                  Start First Mission
                </a>
              </motion.div>
            )}
          </motion.div>

          {/* ── TIER BADGE ── */}
          <motion.div variants={slideUp} className="flex justify-center pb-4">
            <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-white/50 text-xs font-bold">{userStats?.tier || 'Standard'} Tier</span>
            </div>
          </motion.div>

        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}