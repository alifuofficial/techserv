'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Users,
  Gift,
  Zap,
  Star,
  Trophy,
  TrendingUp,
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
  ArrowUp,
  Crown,
  Medal,
  Heart,
  Settings,
  Bell,
  Home,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
}

// Removed internal calculateLevel, using lib/xp instead

function LevelBadge({ level }: { level: number }) {
  const getTierStyle = () => {
    if (level >= 50) return { bg: 'bg-gradient-to-br from-amber-400 to-orange-500', icon: Crown, glow: 'shadow-orange-500/50' }
    if (level >= 30) return { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', icon: Award, glow: 'shadow-purple-500/50' }
    if (level >= 20) return { bg: 'bg-gradient-to-br from-blue-500 to-cyan-500', icon: Medal, glow: 'shadow-blue-500/50' }
    if (level >= 10) return { bg: 'bg-gradient-to-br from-emerald-500 to-teal-500', icon: Star, glow: 'shadow-emerald-500/50' }
    return { bg: 'bg-gradient-to-br from-slate-400 to-slate-500', icon: Sparkles, glow: '' }
  }
  
  const { bg, icon: Icon, glow } = getTierStyle()
  
  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'h-16 w-16 rounded-full flex items-center justify-center shadow-lg',
        bg,
        glow && `shadow-lg ${glow}`
      )}
    >
      <Icon className="h-8 w-8 text-white" />
    </motion.div>
  )
}

function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0)
  
  useEffect(() => {
    const duration = 1000
    const start = performance.now()
    const startValue = 0
    
    function animate(currentTime: number) {
      const elapsed = currentTime - start
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(startValue + (value - startValue) * easeOut))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value])
  
  return <span className={className}>{display}</span>
}

function StatCard({ icon: Icon, label, value, color, delay = 0 }: { icon: any; label: string; value: number | string; color: string; delay?: number }) {
  return (
    <motion.div 
      variants={scaleIn}
      transition={{ delay }}
      className="relative overflow-hidden"
    >
      <Card className="border-0 bg-black/20 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center', color)}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter value={typeof value === 'number' ? value : 0} />
              </p>
              <p className="text-xs text-white/60">{label}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ReferralCard({ code, count, referrals, onShare, webApp }: { 
  code: string; 
  count: number; 
  referrals: ReferralData['referrals'];
  onShare: () => void;
  webApp: any;
}) {
  return (
    <motion.div variants={fadeUp} className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl" />
      
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
        
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <Gift className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Invite Friends
                </h3>
                <p className="text-sm text-white/60">{count} friends joined</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-emerald-500/20 px-3 py-1.5 rounded-full">
              <Flame className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">{count * 50} XP</span>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Your Code</span>
              <div className="flex items-center gap-2">
                <code className="bg-white/10 px-3 py-1.5 rounded-lg font-mono font-bold text-white text-lg tracking-wider">
                  {code || '------'}
                </code>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 bg-white/10 hover:bg-white/20"
                  onClick={() => {
                    if (code) {
                      navigator.clipboard.writeText(code)
                      toast.success('Code copied!')
                    }
                  }}
                >
                  <Copy className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
            
            <Button 
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25"
              onClick={onShare}
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share & Invite via Telegram
            </Button>
          </div>
          
          {referrals && referrals.length > 0 && (
            <div className="space-y-2">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Recent Invites</p>
              <div className="flex -space-x-2">
                {referrals.slice(0, 5).map((ref, i) => (
                  <motion.div
                    key={ref.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm border-2 border-black/50"
                    title={ref.name}
                  >
                    {ref.name?.charAt(0)?.toUpperCase() || '?'}
                  </motion.div>
                ))}
                {referrals.length > 5 && (
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-medium border-2 border-black/50">
                    +{referrals.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuickAction({ icon: Icon, label, color, href, delay = 0 }: { icon: any; label: string; color: string; href: string; delay?: number }) {
  return (
    <motion.div variants={scaleIn} transition={{ delay }}>
      <a href={href}>
        <Card className="border-0 bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-all cursor-pointer group">
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center', color)}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium group-hover:text-white">{label}</span>
          </CardContent>
        </Card>
      </a>
    </motion.div>
  )
}

function OrderCard({ order }: { order: TMAOrder }) {
  const statusColors: Record<string, string> = {
    pending: 'from-amber-500 to-orange-500',
    approved: 'from-blue-500 to-cyan-500',
    completed: 'from-emerald-500 to-teal-500',
    rejected: 'from-red-500 to-rose-500',
  }
  
  return (
    <motion.div 
      variants={fadeUp}
      className="bg-black/20 backdrop-blur-sm rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center bg-gradient-to-br', statusColors[order.status] || statusColors.pending)}>
            {order.status === 'completed' ? (
              <CheckCircle2 className="h-4 w-4 text-white" />
            ) : order.status === 'pending' ? (
              <Clock className="h-4 w-4 text-white" />
            ) : (
              <Zap className="h-4 w-4 text-white" />
            )}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{order.service.title}</p>
            <p className="text-white/40 text-xs">#{order.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold">${order.amount}</p>
          <Badge variant="secondary" className="text-[10px] bg-white/10 text-white/80 border-0">
            {order.status}
          </Badge>
        </div>
      </div>
      
      {order.progress > 0 && (
        <div className="space-y-1">
          <Progress value={order.progress} className="h-1.5 bg-white/10" />
          <p className="text-white/40 text-[10px]">{order.progress}% complete</p>
        </div>
      )}
    </motion.div>
  )
}

function AchievementBadge({ icon: Icon, label, achieved, color }: { icon: any; label: string; achieved: boolean; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn(
        'h-12 w-12 rounded-2xl flex items-center justify-center',
        achieved ? color : 'bg-white/10'
      )}>
        <Icon className={cn('h-5 w-5', achieved ? 'text-white' : 'text-white/30')} />
      </div>
      <span className={cn('text-[10px] font-medium', achieved ? 'text-white' : 'text-white/40')}>
        {label}
      </span>
    </div>
  )
}

export default function TMADashboard({ 
  userStats, 
  referralData, 
  orders,
  botUsername = "milkytechonlinebot"
}: { 
  userStats: TMAUserStats | null;
  referralData: ReferralData | null;
  orders: TMAOrder[];
  botUsername?: string;
}) {
  const { webApp, isTma } = useTelegram()



  const handleShare = () => {
    const code = referralData?.referralCode || userStats?.referralCode
    if (!code) {
      toast.error('No referral code available')
      return
    }
    
    // Direct Mini-App Link format: https://t.me/BotUsername/AppName?startapp=xyz
    // Assuming 'app' is the short name, but if we don't know the exact app shortname, 
    // standard bot parameterized links (e.g. t.me/bot?start=...) work, but the prompt asks for miniapp direct.
    // If the shortname is unknown, fallback to the standard mini-app format.
    const link = `https://t.me/${botUsername}/app?startapp=ref_${code}`
    const text = `🎁 Join me on MilkyTech.Online!\n\nUse my referral code to get exclusive rewards:\n\n🔗 Link: ${link}`
    
    if (webApp) {
      try {
        webApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`)
      } catch {
        navigator.clipboard.writeText(link)
        toast.success('Link copied! Share it with friends.')
      }
    } else {
      navigator.clipboard.writeText(link)
      toast.success('Link copied!')
    }
  }

  if (!isTma) return null
  
  const { level, currentXP, nextLevelXP, progress, label, color } = calculateXP(
    userStats?.completedOrders || 0,
    referralData?.referralCount || 0
  )

  const achievements = [
    { icon: Star, label: 'First Order', achieved: (userStats?.totalOrders || 0) >= 1, color: 'bg-amber-500' },
    { icon: Trophy, label: '5 Orders', achieved: (userStats?.totalOrders || 0) >= 5, color: 'bg-orange-500' },
    { icon: Users, label: 'First Friend', achieved: (referralData?.referralCount || 0) >= 1, color: 'bg-emerald-500' },
    { icon: Crown, label: '5 Friends', achieved: (referralData?.referralCount || 0) >= 5, color: 'bg-purple-500' },
    { icon: Flame, label: '10 Friends', achieved: (referralData?.referralCount || 0) >= 10, color: 'bg-red-500' },
    { icon: Heart, label: 'Super Fan', achieved: (referralData?.referralCount || 0) >= 25, color: 'bg-pink-500' },
  ]

  return (
    <motion.div 
      className="pb-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="wait">
        <motion.div key="content" className="space-y-6 p-4 pt-6">
          <motion.div variants={fadeUp} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <LevelBadge level={level} />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Level {level}
                  </h1>
                  <p className="text-sm font-bold text-emerald-400">
                    {label} • {currentXP} XP
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="bg-white/10 h-10 w-10 rounded-2xl group active:scale-95 transition-all">
                  <Bell className="h-5 w-5 text-white" />
                </Button>
                <Button size="icon" variant="ghost" className="bg-white/10 h-10 w-10 rounded-full">
                  <Settings className="h-5 w-5 text-white" />
                </Button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-1.5">
                <Progress value={progress} className="h-2 bg-white/10 rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/40">
                <span>Level {level}</span>
                <span>Level {level + 1}</span>
              </div>
            </motion.div>

            <ReferralCard
              code={referralData?.referralCode || userStats?.referralCode || ''}
              count={referralData?.referralCount || userStats?.referralCount || 0}
              referrals={referralData?.referrals || []}
              onShare={handleShare}
              webApp={webApp}
            />

            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
              <QuickAction icon={ShoppingCart} label="Browse Services" color="bg-gradient-to-br from-blue-500 to-cyan-500" href="/services" delay={0} />
              <QuickAction icon={Package} label="My Orders" color="bg-gradient-to-br from-purple-500 to-pink-500" href="/dashboard/orders" delay={0.1} />
              <QuickAction icon={Users} label="Referrals" color="bg-gradient-to-br from-emerald-500 to-teal-500" href="/dashboard/referrals" delay={0.2} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="border-0 bg-black/20 backdrop-blur-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-400" />
                      Achievements
                    </h3>
                    <span className="text-white/40 text-sm">
                      {achievements.filter(a => a.achieved).length}/{achievements.length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    {achievements.map((achievement, i) => (
                      <AchievementBadge 
                        key={i}
                        {...achievement}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  Recent Orders
                </h3>
                <a href="/dashboard/orders" className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </a>
              </div>
              
              {orders.length > 0 ? (
                <div className="space-y-2">
                  {orders.slice(0, 3).map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <Card className="border-0 bg-black/20 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60 text-sm">No orders yet</p>
                    <a href="/services">
                      <Button className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500">
                        Browse Services
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="border-0 bg-gradient-to-r from-amber-900/40 to-orange-900/40 backdrop-blur-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                      <Target className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">Complete 10 Orders</h3>
                      <p className="text-white/60 text-sm">Become a Gold member</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-white/40 mb-1">
                          <span>{userStats?.completedOrders || 0}/10 orders</span>
                          <span>{Math.min(((userStats?.completedOrders || 0) / 10) * 100, 100)}%</span>
                        </div>
                        <Progress value={Math.min(((userStats?.completedOrders || 0) / 10) * 100, 100)} className="h-1.5 bg-white/10" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
              <StatCard 
                icon={ShoppingCart} 
                label="Total Orders" 
                value={userStats?.totalOrders || 0} 
                color="bg-gradient-to-br from-blue-500 to-cyan-500"
                delay={0}
              />
              <StatCard 
                icon={Users} 
                label="Referrals" 
                value={referralData?.referralCount || 0} 
                color="bg-gradient-to-br from-emerald-500 to-teal-500"
                delay={0.1}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="border-0 bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-xl">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-purple-400" />
                      Quick Stats
                    </h3>
                    <Badge className="bg-purple-500/20 text-purple-300 border-0">
                      {userStats?.tier || 'Standard'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/40 text-xs">Total Spent</p>
                      <p className="text-2xl font-bold text-white">${(userStats?.totalSpent || 0).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Pending</p>
                      <p className="text-2xl font-bold text-amber-400">{userStats?.pendingOrders || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
