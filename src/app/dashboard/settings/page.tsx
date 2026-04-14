'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Settings,
  User,
  Lock,
  Phone,
  MessageCircle,
  Mail,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { useTelegram } from '@/components/telegram-provider'
import { TMAProfile } from '@/components/tma/tma-profile'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

/* ─── Types ─── */
interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  telegram: string | null
  createdAt: string
  completedOrders: number
  referralCount: number
}

/* ─── Animation ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ─── Skeleton ─── */
function PageSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-[280px] rounded-xl" />
      <Skeleton className="h-[320px] rounded-xl" />
    </div>
  )
}

/* ═══════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════ */
export default function SettingsPage() {
  const { data: session, status: authStatus } = useSession()

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  // Deletion state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch profile
  useEffect(() => {
    if (authStatus !== 'authenticated') return
    let cancelled = false
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/settings')
        if (res.ok && !cancelled) {
          const data = await res.json()
          setProfile(data)
          setName(data.name || '')
          setPhone(data.phone || '')
          setTelegram(data.telegram || '')
        }
      } catch { 
        if (!cancelled) {
          toast.error('Failed to load profile')
        }
      } finally {
        if (!cancelled) setProfileLoaded(true)
      }
    }
    fetchProfile()
    return () => { cancelled = true }
  }, [authStatus])

  // Save profile
  async function handleSaveProfile() {
    if (profileSaving) return
    setProfileSaving(true)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, telegram }),
      })
      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        toast.success('Profile updated', { description: 'Your profile has been saved successfully.' })
      } else {
        const data = await res.json()
        toast.error('Failed to update', { description: data.error || 'Something went wrong.' })
      }
    } catch {
      toast.error('Error', { description: 'Failed to save profile. Please try again.' })
    } finally {
      setProfileSaving(false)
    }
  }

  // Change password
  async function handleChangePassword() {
    if (passwordSaving) return

    if (!currentPassword) {
      toast.error('Current password required', { description: 'Please enter your current password.' })
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password too short', { description: 'New password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords don\'t match', { description: 'New password and confirmation must match.' })
      return
    }

    setPasswordSaving(true)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        toast.success('Password changed', { description: 'Your password has been updated successfully.' })
      } else {
        const data = await res.json()
        toast.error('Failed to change password', { description: data.error || 'Something went wrong.' })
      }
    } catch {
      toast.error('Error', { description: 'Failed to change password. Please try again.' })
    } finally {
      setPasswordSaving(false)
    }
  }

  // Delete account
  async function handleDeleteAccount() {
    if (deleting) return
    setDeleting(true)
    try {
      const res = await fetch('/api/user/account/delete', {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Account marked for deletion', { description: 'You will be logged out. You have 30 days to recover your account.' })
        setTimeout(() => {
          window.location.href = '/auth/signin'
        }, 2000)
      } else {
        const data = await res.json()
        toast.error('Failed to delete account', { description: data.error || 'Something went wrong.' })
      }
    } catch {
      toast.error('Error', { description: 'Failed to initiate deletion. Please try again.' })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const { isTma } = useTelegram()

  if (authStatus === 'loading' || !profileLoaded) return <PageSkeleton />
  if (!session) return null

  if (isTma) {
    return <TMAProfile user={profile as any} />
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      {/* ─── Header ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Account & Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile and account preferences
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── Profile Hero ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-teal-400" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 rounded-2xl ring-4 ring-muted">
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 text-primary text-3xl font-bold">
                  {name.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-2xl font-extrabold tracking-tight">{name}</h2>
                  <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 px-2.5 py-0.5 rounded-full bg-primary/8 text-primary border-primary/10 font-bold text-[10px] uppercase tracking-wider">
                    {(session.user as any).role === 'admin' ? 'Administrator' : 'Verified Client'}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-medium">{profile?.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-primary/60" />
                    Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', d: 'numeric', year: 'numeric' }) : 'Recently'}
                  </div>
                  <div className="h-1 w-1 rounded-full bg-border md:block hidden" />
                  <div className="flex items-center gap-1.5 font-medium">
                    <Shield className="h-3.5 w-3.5 text-emerald-500/60" />
                    Account Status: <span className="text-emerald-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Profile Information ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Profile Information</CardTitle>
                <CardDescription className="text-xs">
                  Update your personal details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={profile?.email || ''}
                  className="pl-10 bg-muted/50"
                  disabled
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {/* Telegram */}
            <div className="space-y-2">
              <Label htmlFor="telegram" className="text-sm font-medium">
                Telegram Username
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  @
                </span>
                <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telegram"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="pl-8 pr-10"
                  placeholder="your_username"
                />
              </div>
            </div>

            <Separator />

            <Button
              onClick={handleSaveProfile}
              disabled={profileSaving || !name.trim()}
              className="w-full"
            >
              {profileSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Change Password ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Lock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Change Password</CardTitle>
                <CardDescription className="text-xs">
                  Update your account password
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium">
                Current Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && newPassword.length < 6 && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  Password must be at least 6 characters
                </p>
              )}
              {newPassword.length >= 6 && (
                <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Password strength: sufficient
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <Separator />

            <Button
              onClick={handleChangePassword}
              disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
              variant="outline"
              className="w-full"
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Danger Zone ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
        <Card className="border-red-200 bg-red-50/30 dark:border-red-900/30 dark:bg-red-950/10 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Danger Zone</CardTitle>
                <CardDescription className="text-xs text-red-600/70 dark:text-red-400/70">
                  Critical actions for your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-200 bg-white/50 dark:border-red-900/50 dark:bg-black/20">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Delete Account</h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  Once initiated, your account will be hidden and scheduled for permanent removal. 
                  You can restore it by logging in within the next 30 days.
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)}
                className="shrink-0 bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Deletion Confirmation Dialog ─── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-3xl border-border/40 max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Account Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed pt-2">
              Are you sure you want to delete your account? You will be logged out immediately. 
              Your data will be held for <span className="font-bold text-foreground">30 days</span>, during which you can reverse this by simply logging back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-2xl border-border/60">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={deleting}
              className="rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Yes, Delete My Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
