'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MessageCircle,
  Shield,
  Calendar,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { format } from 'date-fns'
import { Zap } from 'lucide-react'

/* ─── Animation ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ─── Info Row ─── */
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm font-medium mt-0.5 truncate">{value || 'Not set'}</p>
      </div>
    </div>
  )
}

export default function AccountPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="p-6 lg:p-8 max-w-3xl space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-4 w-72 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!session) return null

  const user = session.user as Record<string, unknown>
  const firstName = (user.name as string)?.split(' ')[0] || 'User'
  const initial = (user.name as string)?.charAt(0)?.toUpperCase() || 'U'
  const createdAt = user.createdAt ? format(new Date(user.createdAt as string), 'MMM d, yyyy') : 'N/A'

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Account</h1>
        <p className="text-muted-foreground text-sm">Manage your profile and account settings</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-emerald-400 to-teal-400" />
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 rounded-2xl">
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 text-primary text-2xl font-bold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user.name as string}</h2>
                <p className="text-sm text-muted-foreground">{user.email as string}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs gap-1.5">
                    <Shield className="h-3 w-3" />
                    {(user.role as string) === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {createdAt}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Details */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
        <Card className="border-border/50 hover:shadow-lg hover:shadow-black/[0.02] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow icon={User} label="Full Name" value={user.name as string} />
            <Separator />
            <InfoRow icon={Mail} label="Email" value={user.email as string} />
            <Separator />
            <InfoRow icon={Phone} label="Phone" value={(user.phone as string) || ''} />
            <Separator />
            <InfoRow icon={MessageCircle} label="Telegram" value={user.telegram ? `@${user.telegram as string}` : ''} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
        <Card className="border-0 shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-500/5" />
          <CardContent className="relative p-5">
            <h3 className="font-bold text-sm mb-1.5">Need to update your info?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Contact our support team to update your profile information, phone number, or Telegram handle.
            </p>
            <Button size="sm" variant="outline" className="rounded-xl gap-2 text-xs" asChild>
              <Link href="/services">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Contact Support
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
