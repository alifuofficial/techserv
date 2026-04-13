'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  StickyNote,
  User,
  ChevronRight,
  Activity,
  Briefcase,
  Layers,
  MessageSquare,
  SearchCode,
  Rocket,
  MousePointer2,
  Trash2,
} from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface Order {
  id: string
  status: string
  duration: string
  amount: number
  telegramUsername: string | null
  screenshot: string | null
  adminNote: string | null
  createdAt: string
  updatedAt: string
  service: {
    id: string
    title: string
    slug: string
    shortDescription: string
    icon: string
  }
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    telegram: string | null
    telegramId: string | null
  }
  progress: number
  statusMessage: string | null
}

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
} as any

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
} as any

/* ────────────────────────────────────────────
   Status Configuration
   ──────────────────────────────────────────── */
const statusConfig: Record<
  string,
  {
    label: string
    badgeClass: string
    dotColor: string
    icon: React.ElementType
    buttonClass: string
    buttonActiveClass: string
  }
> = {
  pending: {
    label: 'Pending',
    badgeClass:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800',
    dotColor: 'bg-yellow-500',
    icon: Clock,
    buttonClass: '',
    buttonActiveClass: '',
  },
  approved: {
    label: 'Approved',
    badgeClass:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    dotColor: 'bg-blue-500',
    icon: CheckCircle,
    buttonClass: '',
    buttonActiveClass: '',
  },
  completed: {
    label: 'Completed',
    badgeClass:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
    dotColor: 'bg-green-500',
    icon: CheckCircle2,
    buttonClass: '',
    buttonActiveClass: '',
  },
  rejected: {
    label: 'Rejected',
    badgeClass:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
    dotColor: 'bg-red-500',
    icon: XCircle,
    buttonClass: '',
    buttonActiveClass: '',
  },
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
function durationLabel(d: string) {
  switch (d) {
    case '3months':
      return '3 Months'
    case '6months':
      return '6 Months'
    case '1year':
      return '12 Months'
    default:
      return d
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/* ────────────────────────────────────────────
   Status Badge Component
   ──────────────────────────────────────────── */
function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'lg' }) {
  const config = statusConfig[status]
  if (!config) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {status}
      </Badge>
    )
  }

  const sizeClass =
    size === 'lg'
      ? 'text-sm px-3.5 py-1.5 rounded-full'
      : 'text-xs px-2.5 py-0.5 rounded-full'

  return (
    <Badge variant="outline" className={`gap-1.5 ${config.badgeClass} ${sizeClass}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </Badge>
  )
}

/* ────────────────────────────────────────────
   Info Field Component
   ──────────────────────────────────────────── */
function InfoField({
  label,
  value,
  mono = false,
  highlight = false,
  children,
}: {
  label: string
  value?: string
  mono?: boolean
  highlight?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="min-w-0 py-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </p>
      {children || (
        <p
          className={`text-sm leading-snug ${
            mono ? 'font-mono' : 'font-medium'
          } ${highlight ? 'text-lg font-bold text-primary' : 'text-foreground'}`}
        >
          {value || '—'}
        </p>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────
   Skeleton Loader
   ──────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-14" />
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <Skeleton className="h-4 w-16" />
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { formatAmount } = useSettings()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [noteLoading, setNoteLoading] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const id = params.id as string

  useEffect(() => {
    let cancelled = false
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setOrder(data)
          setAdminNote(data.adminNote || '')
          setProgress(data.progress || 0)
          setStatusMessage(data.statusMessage || '')
        } else if (!cancelled) {
          setNotFound(true)
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrder()
    return () => { cancelled = true }
  }, [id])

  async function handleStatusChange(newStatus: string) {
    if (!order || statusLoading) return
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus, 
          adminNote: newStatus === 'rejected' ? rejectionReason : adminNote,
          progress: newStatus === 'approved' ? 0 : progress,
          statusMessage: newStatus === 'approved' ? 'Project initiated' : statusMessage 
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setOrder(updated)
        toast.success(`Order ${newStatus}`, {
          description: `Status changed to ${newStatus}.`,
        })
      } else {
        const data = await res.json()
        toast.error('Failed to update', { description: data.error || 'Something went wrong.' })
      }
    } catch {
      toast.error('Error', { description: 'Failed to update status.' })
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleUpdateProgress() {
    if (!order || progressLoading) return
    setProgressLoading(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress, statusMessage }),
      })
      if (res.ok) {
        const updated = await res.json()
        setOrder(updated)
        toast.success('Progress pushed to User')
      }
    } catch {
      toast.error('Error updating progress')
    } finally {
      setProgressLoading(false)
    }
  }

  async function handleSaveNote() {
    if (!order || noteLoading) return
    setNoteLoading(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      })
      if (res.ok) {
        const updated = await res.json()
        setOrder(updated)
        toast.success('Internal note saved')
      }
    } finally {
      setNoteLoading(false)
    }
  }

  async function handleInstantComplete() {
    if (!order || statusLoading) return
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'completed',
          progress: 100,
          statusMessage: 'Service Fulfilled! Your project is complete.'
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setOrder(updated)
        setProgress(100)
        setStatusMessage('Service Fulfilled! Your project is complete.')
        toast.success('Project Completed', {
          description: 'The service was fulfilled and archived successfully.',
        })
      }
    } catch {
      toast.error('Error', { description: 'Failed to complete project.' })
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleDeleteOrder() {
    if (!window.confirm("Are you sure you want to permanently delete this record? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Record deleted forever.");
        router.push(isProject ? "/admin/projects" : "/admin/orders");
      } else {
        toast.error("Failed to delete record.");
      }
    } catch {
      toast.error("Network error");
    }
  }

  if (loading) return <DetailSkeleton />
  if (notFound || !order) return (
    <div className="p-20 text-center flex flex-col items-center">
      <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
      <h2 className="text-xl font-bold">Order Not Found</h2>
      <Button variant="link" asChild className="mt-4"><Link href="/admin/orders">Back to Queue</Link></Button>
    </div>
  )

  /* ────────────────────────────────────────────
     Fulfillment Logic
     ──────────────────────────────────────────── */
  type FulfillmentMode = 'PROGRESS' | 'ACTION' | 'CONSULTATION'
  
  const getFulfillmentMode = (slug: string): FulfillmentMode => {
    const s = slug.toLowerCase()
    if (s.includes('telegram-premium') || s.includes('boost') || s.includes('instant')) return 'ACTION'
    if (s.includes('development') || s.includes('design') || s.includes('build')) return 'PROGRESS'
    return 'CONSULTATION'
  }

  const mode = getFulfillmentMode(order.service.slug)
  const isProject = ['approved', 'completed'].includes(order.status)

  return (
    <motion.div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto" variants={container} initial="hidden" animate="visible">
      {/* ── 1. Header Toolbar ── */}
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card border border-border/40 shadow-sm rounded-2xl p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50">
          <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={isProject ? "/admin/projects" : "/admin/orders"} className="hover:text-foreground transition-colors">
            {isProject ? "Projects" : "Order Queue"}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-bold tracking-wider">#{id.slice(0, 8)}</span>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" asChild className="h-9 text-xs font-semibold flex-1 md:flex-none">
            <Link href={isProject ? "/admin/projects" : "/admin/orders"}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteOrder} className="h-9 text-xs font-bold px-3">
            <Trash2 className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Delete Record</span>
          </Button>
        </div>
      </motion.div>

      {/* ── 2. Order Header ── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isProject ? <Briefcase className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">Order <span className="text-muted-foreground/60">#{id.slice(0, 8)}</span></h1>
            <p className="text-xs text-muted-foreground font-medium">{order.service.title}</p>
          </div>
        </div>
        <StatusBadge status={order.status} size="lg" />
      </motion.div>

      {/* ── 3. Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={fadeUp}>
            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader className="pb-4"><CardTitle className="text-sm font-bold flex items-center gap-2">Order Summary</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <InfoField label="Service" value={order.service.title} />
                <InfoField label="Duration" value={durationLabel(order.duration)} />
                <InfoField label="Amount" value={formatAmount(order.amount)} highlight />
                <InfoField label="Timeline" value={format(new Date(order.createdAt), 'MMM d, yyyy')} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader className="pb-4"><CardTitle className="text-sm font-bold flex items-center gap-2">Customer Context</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/5 text-primary text-xs">{getInitials(order.user.name)}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-bold">{order.user.name}</p>
                    <p className="text-[11px] text-muted-foreground">{order.user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <InfoField label="Telegram" value={order.user.telegram ? `@${order.user.telegram}` : 'None'} />
                  <InfoField label="Phone" value={order.user.phone || 'None'} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">
          {!isProject ? (
            <motion.div variants={fadeUp} className="space-y-4">
              <Card className="border-primary/20 shadow-xl shadow-primary/5 overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <CreditCard className="h-3 w-3" /> Decision Point
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {!rejectMode ? (
                    <>
                      <Button onClick={() => handleStatusChange('approved')} disabled={statusLoading} className="w-full h-11 font-bold rounded-xl shadow-lg shadow-primary/20">
                        {statusLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        Accept Payment
                      </Button>
                      <Button variant="outline" onClick={() => setRejectMode(true)} disabled={statusLoading} className="w-full h-11 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-xl border-dashed">
                        Reject with Reason
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Textarea 
                        placeholder="Why is it rejected?" 
                        value={rejectionReason} 
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="text-xs min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" className="flex-1 font-bold" onClick={() => handleStatusChange('rejected')} disabled={!rejectionReason.trim()}>Reject Now</Button>
                        <Button variant="ghost" size="sm" onClick={() => setRejectMode(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Proof</CardTitle></CardHeader>
                <CardContent>
                  {order.screenshot ? (
                    <div className="relative group cursor-pointer bg-muted/20 rounded-xl border border-dashed border-border aspect-square w-full flex items-center justify-center overflow-hidden" onClick={() => setLightboxOpen(true)}>
                      <img src={order.screenshot.startsWith('/') ? order.screenshot : `/uploads/${order.screenshot}`} alt="proof" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><ImageIcon className="text-white h-6 w-6" /></div>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-muted/10 border border-dashed rounded-xl"><p className="text-[10px] text-muted-foreground italic">No proof uploaded</p></div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} className="space-y-6">
              {/* Dynamic Fulfillment Dashboard */}
              <Card className={`overflow-hidden border-none shadow-lg ring-1 ${
                mode === 'PROGRESS' ? 'ring-emerald-500/20' : 
                mode === 'ACTION' ? 'ring-blue-500/20' : 'ring-purple-500/20'
              }`}>
                <div className={`h-1.5 ${
                  mode === 'PROGRESS' ? 'bg-emerald-500' : 
                  mode === 'ACTION' ? 'bg-blue-500' : 'bg-purple-500'
                }`} />
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      {mode === 'PROGRESS' && <Activity className="h-4 w-4 text-emerald-500" />}
                      {mode === 'ACTION' && <Rocket className="h-4 w-4 text-blue-500" />}
                      {mode === 'CONSULTATION' && <MessageSquare className="h-4 w-4 text-purple-500" />}
                      {mode === 'PROGRESS' ? 'Fulfillment Tracker' : mode === 'ACTION' ? 'Fulfillment Center' : 'Consultation Desk'}
                    </CardTitle>
                    <Badge variant="outline" className="text-[9px] font-black tracking-widest px-1.5 opacity-60">
                      {mode}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Mode 1: PROGRESS (Milestones & Slider) */}
                  {mode === 'PROGRESS' && (
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-2xl font-black tabular-nums">{progress}%</span>
                          <Badge variant="outline" className="text-[9px] font-black">{progress === 100 ? 'FINISHED' : 'IN WORK'}</Badge>
                        </div>
                        <Slider value={[progress]} max={100} step={5} onValueChange={(val) => setProgress(val[0])} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Milestone</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {['Design', 'Development', 'Testing', 'Launch'].map(m => (
                            <Button key={m} variant="secondary" size="sm" className="h-7 text-[10px] font-bold" onClick={() => { setStatusMessage(`${m} phase...`); setProgress(m === 'Launch' ? 95 : m === 'Testing' ? 75 : m === 'Development' ? 40 : 20); }}>{m}</Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: ACTION (Instant Fulfillment) */}
                  {mode === 'ACTION' && (
                    <div className="space-y-4">
                      <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 space-y-2">
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Target Account</p>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-bold truncate">{order.telegramUsername || order.user.telegram || 'No Username Provided'}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-[10px] font-bold"
                          onClick={() => {
                            setStatusMessage('Verifying details... please confirm your telegram username.')
                            toast.info('Status updated to request verification')
                          }}
                        >
                          Ask for Confirm
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-[10px] font-bold border-blue-500/50 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
                          onClick={handleInstantComplete}
                          disabled={statusLoading}
                        >
                          {statusLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Rocket className="h-3 w-3 mr-1" />}
                          Instant Fulfill
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Mode 3: CONSULTATION (Q&A Focus) */}
                  {mode === 'CONSULTATION' && (
                    <div className="space-y-4">
                      <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/50 dark:border-purple-900/30">
                        <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Project Status Dial</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Use the update field below to ask for requirements or provide a consultation summary.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" className="h-7 flex-1 text-[10px] font-bold" onClick={() => setStatusMessage('Waiting for customer requirements...')}>Need Info</Button>
                        <Button variant="secondary" size="sm" className="h-7 flex-1 text-[10px] font-bold" onClick={() => setStatusMessage('Analyzing your request... update coming soon.')}>Analyzing</Button>
                        <Button variant="secondary" size="sm" className="h-7 flex-1 text-[10px] font-bold" onClick={() => setStatusMessage('Ready for review. Please check your messages.')}>For Review</Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Status Message</label>
                    <Input value={statusMessage} onChange={(e) => setStatusMessage(e.target.value)} placeholder="What should the user see?" className="h-8 text-xs bg-muted/20" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={handleUpdateProgress} disabled={progressLoading} className={`w-full h-10 font-bold text-xs ring-offset-2 ring-offset-background transition-all ${
                      mode === 'PROGRESS' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10' : 
                      mode === 'ACTION' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/10'
                    }`}>
                      {progressLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Push Changes to Customer App'}
                    </Button>
                    
                    {order.status === 'approved' && (
                      <Button variant="outline" className={`w-full h-9 text-[10px] font-black ${
                        mode === 'PROGRESS' ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50/10' : 
                        mode === 'ACTION' ? 'border-blue-500/30 text-blue-600 hover:bg-blue-50/10' : 'border-purple-500/30 text-purple-600 hover:bg-purple-50/10'
                      }`} onClick={() => handleStatusChange('completed')}>
                        CLOSE & ARCHIVE PROJECT
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><StickyNote className="h-3 w-3" /> Private Notes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="Internal staff notes..." value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className="text-xs resize-none" rows={3} />
                <Button variant="ghost" className="w-full h-7 text-[10px] font-black hover:bg-primary/5" onClick={handleSaveNote}>{noteLoading ? <Loader2 className="animate-spin h-3 w-3" /> : 'SAVE'}</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {lightboxOpen && order.screenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <div className="relative w-full max-w-5xl flex justify-center items-center pointer-events-none">
            <img src={order.screenshot.startsWith('/') ? order.screenshot : `/uploads/${order.screenshot}`} alt="proof" className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl pointer-events-auto" />
          </div>
        </div>
      )}
    </motion.div>
  )
}
