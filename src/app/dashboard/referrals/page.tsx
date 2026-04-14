'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Users,
  Copy,
  Share2,
  Gift,
  TrendingUp,
  CheckCircle2,
  Clock,
  Link2,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useTelegram } from '@/components/telegram-provider'
import { TMAReferrals } from '@/components/tma/tma-referrals'

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

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

function ReferralsSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/40">
            <CardContent className="p-5"><div className="space-y-3"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-16" /></div></CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  )
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [botUsername, setBotUsername] = useState('milkytechonlinebot')
  const { isTma, webApp } = useTelegram()

  useEffect(() => {
    let cancelled = false
    async function fetchReferrals() {
      try {
        const res = await fetch('/api/user/referrals')
        if (res.ok && !cancelled) {
          const json = await res.json()
          setData(json)
        }

        const settingsRes = await fetch('/api/settings/public')
        if (settingsRes.ok && !cancelled) {
          const settings = await settingsRes.json()
          if (settings.telegram_bot_username) {
            setBotUsername(settings.telegram_bot_username.replace('@', ''))
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchReferrals()
    return () => { cancelled = true }
  }, [])

  if (loading) return <ReferralsSkeleton />

  const referralLink = typeof window !== 'undefined' && data?.referralCode
    ? `${window.location.origin}/refer/${data.referralCode}`
    : ''

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
      toast.success('Referral link copied!')
    }
  }

  const handleCopyCode = () => {
    if (data?.referralCode) {
      navigator.clipboard.writeText(data.referralCode)
      toast.success('Referral code copied!')
    }
  }

  const handleShare = async () => {
    if (!data?.referralCode) {
      toast.error('No referral code found. Please refresh and try again.')
      return
    }
    
    const code = data.referralCode
    const shareLink = `${window.location.origin}/refer/${code}`
    const shareText = `Join me on MilkyTech.Online! Use my referral code to get exclusive rewards: ${code}`
    
    if (isTma && webApp) {
      try {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareText)}`
        
        if (typeof webApp.openTelegramLink === 'function') {
          webApp.openTelegramLink(shareUrl)
        } else if (typeof window !== 'undefined') {
          window.open(shareUrl, '_blank')
        } else {
          handleCopyLink()
        }
        return
      } catch {
        handleCopyLink()
        return
      }
    }
    
    if (navigator.share && referralLink) {
      try {
        await navigator.share({
          title: 'Join MilkyTech.Online',
          text: 'Check out MilkyTech.Online - Premium Tech Services!',
          url: referralLink,
        })
      } catch {
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const milestones = [
    { count: 1, label: 'First Referral', reward: 'Bronze Badge', achieved: (data?.referralCount || 0) >= 1 },
    { count: 5, label: '5 Referrals', reward: '5% Discount', achieved: (data?.referralCount || 0) >= 5 },
    { count: 10, label: '10 Referrals', reward: '10% Discount', achieved: (data?.referralCount || 0) >= 10 },
    { count: 25, label: '25 Referrals', reward: 'Gold Status', achieved: (data?.referralCount || 0) >= 25 },
  ]

  const nextMilestone = milestones.find(m => !m.achieved)
  const progressToNext = nextMilestone
    ? Math.min(Math.round(((data?.referralCount || 0) / nextMilestone.count) * 100), 100)
    : 100

  if (isTma) {
    return (
      <TMAReferrals 
        data={data as any} 
        botUsername={botUsername}
        handleShare={handleShare}
        handleCopyCode={handleCopyCode}
      />
    )
  }

  return (
    <motion.div className="p-4 md:p-6 space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Users className="h-3 w-3 text-primary" />
              Referrals
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Referral Program</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Share your unique link and earn rewards when friends sign up
            </p>
          </div>
          <Button className="shrink-0" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1.5" />
            Share Link
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={fadeUp}>
          <Card className="border-border/40 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Total Referrals</p>
                  <p className="text-xl font-bold">{data?.referralCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border/40 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Milestones Reached</p>
                  <p className="text-xl font-bold">{milestones.filter(m => m.achieved).length}/{milestones.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="border-border/40 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Next Reward</p>
                  <p className="text-sm font-bold">{nextMilestone?.reward || 'All Unlocked!'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        <Card className="border-border/40 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Link2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Your Referral Link</CardTitle>
                <CardDescription className="text-xs mt-0.5">Share this link with friends to earn rewards</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isTma ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 text-center">
                  <Gift className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <h3 className="font-bold text-lg mb-1">Invite Friends & Earn Rewards</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your link with friends via Telegram and earn rewards when they join!
                  </p>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleShare}
                    size="lg"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share via Telegram
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-muted-foreground">Your Code:</span>
                  <code className="bg-muted px-3 py-1 rounded-lg font-mono font-bold">
                    {data?.referralCode || '...'}
                  </code>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex gap-2">
                  <div className="flex-1 bg-muted rounded-lg px-4 py-2.5 font-mono text-sm truncate border border-border/60">
                    {referralLink || 'Loading...'}
                  </div>
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-lg" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCopyCode} className="flex-1 sm:flex-none">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Code: {data?.referralCode || '...'}
                  </Button>
                  <Button size="sm" onClick={handleShare} className="flex-1 sm:flex-none">
                    <Share2 className="h-3.5 w-3.5 mr-1.5" />
                    Share
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {nextMilestone && (
        <motion.div variants={fadeUp}>
          <Card className="border-border/40">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Progress to {nextMilestone.label}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {data?.referralCount || 0}/{nextMilestone.count}
                </Badge>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {nextMilestone.count - (data?.referralCount || 0)} more referrals to unlock <span className="font-medium text-foreground">{nextMilestone.reward}</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base">Rewards Milestones</CardTitle>
                <CardDescription className="text-xs mt-0.5">Unlock rewards as you refer more friends</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.count}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border transition-colors',
                    milestone.achieved
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border/40 bg-muted/20'
                  )}
                >
                  <div className={cn(
                    'h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
                    milestone.achieved ? 'bg-emerald-500/20' : 'bg-muted'
                  )}>
                    {milestone.achieved ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="h-4.5 w-4.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      'text-sm font-medium',
                      milestone.achieved ? 'text-emerald-700 dark:text-emerald-300' : ''
                    )}>
                      {milestone.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{milestone.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {data?.referrals && data.referrals.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {isTma ? 'People You Invited' : 'Your Referrals'}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {isTma ? `${data.referrals.length} friend${data.referrals.length !== 1 ? 's' : ''} joined using your link` : 'People who signed up using your link'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {data.referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className={cn(
                      'flex items-center justify-between p-3.5 rounded-xl',
                      isTma ? 'bg-muted/50' : 'bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                        {referral.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{referral.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{format(new Date(referral.createdAt), 'MMM d, yyyy')}</span>
                          <span className="text-border">·</span>
                          <span>{referral.ordersCount || 0} orders</span>
                        </div>
                      </div>
                    </div>
                    {isTma ? (
                      <Badge variant="secondary" className="text-xs">
                        Joined
                      </Badge>
                    ) : (
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-semibold">${(referral.totalSpent || 0).toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">total spent</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
