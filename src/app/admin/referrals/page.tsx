'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Copy,
  TrendingUp,
  Award,
  Link2,
  UserPlus,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Edit2,
  Check,
  X,
  ExternalLink,
  Settings,
  Gift,
  Loader2,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'

interface ReferralUser {
  id: string
  name: string
  email: string
  referralCode: string | null
  createdAt: string
  referralCount: number
  orderCount: number
  totalSpent: number
  recentReferrals: Array<{
    id: string
    name: string
    email: string
    createdAt: string
    ordersCount: number
    totalSpent: number
  }>
}

interface ReferralsResponse {
  users: ReferralUser[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
  stats: {
    totalReferrals: number
    totalReferrers: number
    topReferrers: ReferralUser[]
  }
}

interface ReferralSettings {
  referral_system_enabled: string
  referral_reward_amount: string
  referral_invitation_price: string
  referral_min_payout: string
  referral_benefits: string
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

function PageSkeleton() {
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
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  )
}

function EditableCodeCell({ userId, code, onUpdate }: { userId: string; code: string | null; onUpdate: (code: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(code || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!value.trim()) {
      toast.error('Referral code cannot be empty')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/referrals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, referralCode: value.trim().toUpperCase() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      onUpdate(value.trim().toUpperCase())
      setEditing(false)
      toast.success('Referral code updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          className="h-7 w-24 text-xs font-mono"
          maxLength={12}
          autoFocus
        />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave} disabled={saving}>
          <Check className="h-3 w-3 text-emerald-600" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(false); setValue(code || '') }}>
          <X className="h-3 w-3 text-red-500" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <code className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded">
        {code || 'N/A'}
      </code>
      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditing(true)}>
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  )
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<ReferralsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [settings, setSettings] = useState<ReferralSettings>({
    referral_system_enabled: 'true',
    referral_reward_amount: '5',
    referral_invitation_price: '10',
    referral_min_payout: '50',
    referral_benefits: '',
  })
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const { formatAmount } = useSettings()

  const fetchReferrals = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: 'referralCount',
        sortOrder: 'desc',
      })
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/referrals?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchReferrals()
  }, [fetchReferrals])

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        const allSettings = data.settings || []
        setSettings({
          referral_system_enabled: allSettings.find((s: any) => s.key === 'referral_system_enabled')?.value || 'true',
          referral_reward_amount: allSettings.find((s: any) => s.key === 'referral_reward_amount')?.value || '5',
          referral_invitation_price: allSettings.find((s: any) => s.key === 'referral_invitation_price')?.value || '10',
          referral_min_payout: allSettings.find((s: any) => s.key === 'referral_min_payout')?.value || '50',
          referral_benefits: allSettings.find((s: any) => s.key === 'referral_benefits')?.value || '',
        })
      }
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSettingChange = (key: keyof ReferralSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSettingsSave = async () => {
    setSettingsSaving(true)
    try {
      const settingsToSave = [
        { key: 'referral_system_enabled', value: settings.referral_system_enabled },
        { key: 'referral_reward_amount', value: settings.referral_reward_amount },
        { key: 'referral_invitation_price', value: settings.referral_invitation_price },
        { key: 'referral_min_payout', value: settings.referral_min_payout },
        { key: 'referral_benefits', value: settings.referral_benefits },
      ]
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Referral settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchReferrals()
  }

  const handleCodeUpdate = (userId: string, newCode: string) => {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        users: prev.users.map((u) => u.id === userId ? { ...u, referralCode: newCode } : u),
      }
    })
  }

  if (loading && !data) return <PageSkeleton />

  const stats = data?.stats

  return (
    <motion.div className="p-4 md:p-6 space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Users className="h-3 w-3 text-primary" />
              Referrals
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Referral Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage and monitor the referral program
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchReferrals} disabled={loading}>
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
            Refresh
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
                  <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Total Referrals</p>
                  <p className="text-xl font-bold">{stats?.totalReferrals || 0}</p>
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
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Active Referrers</p>
                  <p className="text-xl font-bold">{stats?.totalReferrers || 0}</p>
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
                  <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Top Referrer</p>
                  <p className="text-sm font-bold truncate">
                    {stats?.topReferrers?.[0]?.name || 'None yet'}
                  </p>
                  {stats?.topReferrers?.[0] && (
                    <p className="text-[10px] text-muted-foreground">{stats.topReferrers[0].referralCount} referrals</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {stats?.topReferrers && stats.topReferrers.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Top Referrers</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Users with the most referrals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {stats.topReferrers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40"
                  >
                    <div className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm',
                      index === 0 ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' :
                      index === 1 ? 'bg-slate-300/30 text-slate-600 dark:text-slate-300' :
                      index === 2 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300' :
                      'bg-muted text-muted-foreground'
                    )}>
                      #{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground">{user.referralCount} referrals</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Referral Settings</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Configure how the referral program works</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Enable Referral System</p>
                    <p className="text-xs text-muted-foreground">Allow users to refer others</p>
                  </div>
                </div>
                <Switch
                  checked={settings.referral_system_enabled === 'true'}
                  onCheckedChange={(checked) => handleSettingChange('referral_system_enabled', String(checked))}
                  disabled={settingsLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral_invitation_price" className="text-sm font-medium">Invitation Price</Label>
                <p className="text-xs text-muted-foreground">Shown to users as the price per invitation</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="referral_invitation_price"
                    type="number"
                    value={settings.referral_invitation_price}
                    onChange={(e) => handleSettingChange('referral_invitation_price', e.target.value)}
                    className="w-24"
                    disabled={settingsLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral_reward_amount" className="text-sm font-medium">Reward Amount</Label>
                <p className="text-xs text-muted-foreground">Credit given per successful referral</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="referral_reward_amount"
                    type="number"
                    value={settings.referral_reward_amount}
                    onChange={(e) => handleSettingChange('referral_reward_amount', e.target.value)}
                    className="w-24"
                    disabled={settingsLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral_min_payout" className="text-sm font-medium">Minimum Payout</Label>
                <p className="text-xs text-muted-foreground">Minimum balance to request withdrawal</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="referral_min_payout"
                    type="number"
                    value={settings.referral_min_payout}
                    onChange={(e) => handleSettingChange('referral_min_payout', e.target.value)}
                    className="w-24"
                    disabled={settingsLoading}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="referral_benefits" className="text-sm font-medium">Referral Benefits Description</Label>
                <p className="text-xs text-muted-foreground">Shown to users explaining referral rewards</p>
                <Input
                  id="referral_benefits"
                  value={settings.referral_benefits}
                  onChange={(e) => handleSettingChange('referral_benefits', e.target.value)}
                  placeholder="E.g., Earn $5 for each friend who signs up!"
                  disabled={settingsLoading}
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-end">
              <Button onClick={handleSettingsSave} disabled={settingsSaving || settingsLoading}>
                {settingsSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Link2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">All Users</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Manage referral codes for all users</CardDescription>
                </div>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 pl-8 w-48 text-xs"
                  />
                </div>
                <Button type="submit" variant="outline" size="sm" className="h-8 text-xs">
                  Search
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : data && data.users.length > 0 ? (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {data.users.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div
                        className={cn(
                          'group rounded-xl border border-border/40 transition-colors',
                          expandedUser === user.id ? 'bg-muted/30' : 'hover:bg-muted/20'
                        )}
                      >
                        <div
                          className="flex items-center gap-4 p-4 cursor-pointer"
                          onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                        >
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{user.name}</p>
                              {user.referralCount > 0 && (
                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                  {user.referralCount} referrals
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          <div className="hidden md:flex items-center gap-6 shrink-0">
                            <EditableCodeCell
                              userId={user.id}
                              code={user.referralCode}
                              onUpdate={(code) => handleCodeUpdate(user.id, code)}
                            />
                            <div className="text-right">
                              <p className="text-sm font-semibold">{formatAmount(user.totalSpent)}</p>
                              <p className="text-[10px] text-muted-foreground">{user.orderCount} orders</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(user.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (user.referralCode) {
                                const link = `${window.location.origin}/refer/${user.referralCode}`
                                navigator.clipboard.writeText(link)
                                toast.success('Referral link copied!')
                              }
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {expandedUser === user.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border/40 overflow-hidden"
                          >
                            <div className="p-4 space-y-4">
                              <div className="flex items-center gap-4 md:hidden">
                                <EditableCodeCell
                                  userId={user.id}
                                  code={user.referralCode}
                                  onUpdate={(code) => handleCodeUpdate(user.id, code)}
                                />
                                <div className="text-right ml-auto">
                                  <p className="text-sm font-semibold">{formatAmount(user.totalSpent)}</p>
                                  <p className="text-[10px] text-muted-foreground">{user.orderCount} orders</p>
                                </div>
                              </div>

                              {user.recentReferrals.length > 0 ? (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                    Recent Referrals
                                  </p>
                                  <div className="space-y-1.5">
                                    {user.recentReferrals.map((ref) => (
                                      <div key={ref.id} className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border/30">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                                            {ref.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-medium truncate">{ref.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{format(new Date(ref.createdAt), 'MMM d, yyyy')}</p>
                                          </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                          <p className="text-xs font-semibold">{formatAmount(ref.totalSpent)}</p>
                                          <p className="text-[10px] text-muted-foreground">{ref.ordersCount} orders</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground text-center py-4">No referrals yet</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No users found</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  {search ? 'Try a different search term' : 'Users will appear here once they register'}
                </p>
              </div>
            )}

            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground">
                  Showing {((data.pagination.page - 1) * data.pagination.limit) + 1}-
                  {Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalCount)} of {data.pagination.totalCount}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs font-medium px-2">
                    {data.pagination.page} / {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
