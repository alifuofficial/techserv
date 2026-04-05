'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import {
  Briefcase,
  ArrowRight,
  Search,
  Clock,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Zap,
  Globe,
  Shield,
  Code,
  Star,
  Layers,
  ShoppingCart,
  Package,
  DollarSign,
  MessageSquare,
  Rocket,
  Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

/* ─── Types ─── */
interface Order {
  id: string
  status: string
  duration: string
  amount: number
  progress: number
  statusMessage: string | null
  createdAt: string
  serviceId: string
  service: { id: string; title: string; slug: string; icon: string }
}

/* ─── Helpers ─── */
function serviceIcon(iconName: string, className: string = "h-5 w-5") {
  const icons: Record<string, React.ElementType> = {
    Zap, Globe, Shield, Code, Star, Layers,
    ShoppingCart, Package, DollarSign, Activity, Briefcase
  }
  const Icon = icons[iconName] || Zap
  return <Icon className={className} />
}

/* ─── Animation ─── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
} as any

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
} as any

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    async function fetchProjects() {
      try {
        const res = await fetch('/api/orders')
        if (res.ok && !cancelled) {
          const data = await res.json()
          // Only show 'approved' (Active) or 'completed' (Archive)
          const active = data.filter((o: Order) => ['approved', 'completed'].includes(o.status))
          setProjects(active)
        }
      } catch { /* silent */ } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProjects()
    return () => { cancelled = true }
  }, [status])

  const filtered = projects.filter(o => 
    o.service.title.toLowerCase().includes(search.toLowerCase()) || 
    o.id.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-8">
      {/* ─── Header ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Active Projects</h1>
          <p className="text-muted-foreground text-sm">
            Track real-time progress and milestones of your active services.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card border-border/60"
          />
        </div>
      </motion.div>

      {/* ─── Projects Grid ─── */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-2 border-dashed border-muted bg-transparent">
            <CardContent className="p-16 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-5">
                <Briefcase className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h2 className="text-xl font-bold mb-2">No Active Projects</h2>
              <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                Once your orders are approved, they will appear here as live projects for progress tracking.
              </p>
              <Button className="rounded-xl gap-2" asChild>
                <Link href="/dashboard/orders">
                  View My Orders
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((project) => (
            <motion.div key={project.id} variants={fadeUp}>
              <Card className="h-full border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden bg-gradient-to-br from-card to-muted/5 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                      {serviceIcon(project.service.icon, 'h-6 w-6')}
                    </div>
                    <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className={
                      project.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20'
                        : 'bg-primary/10 text-primary border-primary/20'
                    }>
                      {project.status === 'completed' ? 'Delivered' : 'In Progress'}
                    </Badge>
                  </div>
                  <div className="space-y-1 mt-4">
                    <CardTitle className="text-xl font-bold">{project.service.title}</CardTitle>
                    <CardDescription className="font-mono text-[10px] uppercase tracking-widest">
                      Project #{project.id.slice(0, 8)}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Overall Progress</span>
                        <p className="text-2xl font-black text-primary tabular-nums">{project.progress}%</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                          <Timer className="h-3 w-3" />
                          Updated {format(new Date(project.createdAt), 'MMM d')}
                        </span>
                      </div>
                    </div>
                    <Progress value={project.progress} className="h-2 bg-primary/10" />
                  </div>

                  {/* Latest Milestone */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/40 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Activity className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">Current Milestone</span>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-9">
                      {project.statusMessage || "Project initialization in progress..."}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center gap-2">
                       <MessageSquare className="h-4 w-4 text-muted-foreground" />
                       <span className="text-[11px] text-muted-foreground">Contact Support</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 p-0 px-2 text-[11px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 hover:text-primary" asChild>
                      <Link href={`/dashboard/orders/${project.id}`}>
                        View Details
                        <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
