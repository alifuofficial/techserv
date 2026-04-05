'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Briefcase,
  Search,
  Eye,
  ArrowRight,
  ChevronDown,
  PackageSearch,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface Order {
  id: string
  status: string
  duration: string
  amount: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  service: {
    id: string
    title: string
    slug: string
  }
  progress: number
}

type ProjectStatusFilter = 'all' | 'approved' | 'completed'

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
} as any

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
} as any

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
function ProjectStatusBadge({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <Badge variant="outline" className="gap-1.5 bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
        <CheckCircle2 className="h-3 w-3" />
        Delivered
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1.5 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
      <Activity className="h-3 w-3 animate-pulse" />
      Active
    </Badge>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <div className="hidden md:grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1.2fr_1fr_60px] items-center gap-4 px-4 py-3 bg-muted/30 border-b border-border/60">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-10 ml-auto" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 md:grid md:grid-cols-[1fr_1.5fr_1.5fr_1fr_1.2fr_1fr_60px] md:items-center gap-4 border-b border-border/40 last:border-0">
           <Skeleton className="h-4 w-16 md:block hidden font-mono" />
           <div className="space-y-1"><Skeleton className="h-3.5 w-24" /><Skeleton className="h-3 w-32" /></div>
           <Skeleton className="h-4 w-32 md:block hidden" />
           <Skeleton className="h-5 w-20 rounded-full md:block hidden" />
           <div className="space-y-1"><Skeleton className="h-1.5 w-full rounded-full" /><Skeleton className="h-3 w-12" /></div>
           <Skeleton className="h-4 w-20 md:block hidden" />
           <Skeleton className="h-8 w-12 rounded-md ml-auto md:block hidden" />
        </div>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────── */
export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchProjects() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/orders')
        if (res.ok && !cancelled) {
          const data = await res.json()
          // Filter only Approved and Completed
          const active = data.filter((o: Order) => ['approved', 'completed'].includes(o.status))
          setProjects(active)
        }
      } catch { /* silent */ } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProjects()
    return () => { cancelled = true }
  }, [])

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || 
        p.id.toLowerCase().includes(q) || 
        p.service?.title?.toLowerCase().includes(q) || 
        p.user?.name?.toLowerCase().includes(q) || 
        p.user?.email?.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [projects, statusFilter, searchQuery])

  return (
    <motion.div className="p-4 md:p-6 space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Active Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage fulfillment and track progress for approved orders.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/40 border-border/60"
          />
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-2 border-b border-border/40 pb-4">
         {[
           { value: 'all', label: 'All Projects', icon: Briefcase },
           { value: 'approved', label: 'In Progress', icon: Clock },
           { value: 'completed', label: 'Completed', icon: CheckCircle2 },
         ].map((tab) => (
           <button
             key={tab.value}
             onClick={() => setStatusFilter(tab.value as ProjectStatusFilter)}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
               statusFilter === tab.value 
                 ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                 : 'text-muted-foreground hover:bg-muted hover:text-foreground'
             }`}
           >
             <tab.icon className="h-4 w-4" />
             {tab.label}
             <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
               statusFilter === tab.value ? 'bg-primary-foreground/20' : 'bg-muted-foreground/10'
             }`}>
               {tab.value === 'all' ? projects.length : projects.filter(p => p.status === tab.value).length}
             </span>
           </button>
         ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        {loading ? (
          <TableSkeleton />
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 py-20 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted/80 flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm mb-1">No projects found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/60">
                  <TableHead className="text-xs font-bold uppercase tracking-wider pl-4">ID</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Project / Customer</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Progress</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider hidden lg:table-cell">Duration</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-right pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((p, i) => (
                  <TableRow key={p.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-4">
                       <span className="font-mono text-[11px] text-muted-foreground">#{p.id.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-0.5">
                          <p className="font-semibold text-sm leading-tight">{p.service.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">{p.user.name}</p>
                       </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                       <ProjectStatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                       <div className="w-full max-w-[140px] space-y-1.5">
                          <p className="text-[11px] font-bold text-primary tabular-nums text-right">{p.progress}%</p>
                          <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-primary transition-all duration-700 ease-out" 
                               style={{ width: `${p.progress}%` }}
                             />
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                       <span className="text-xs text-muted-foreground">{p.duration}</span>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                       <Button variant="ghost" size="sm" asChild className="h-8 group">
                          <Link href={`/admin/orders/${p.id}`}>
                             <Eye className="h-3.5 w-3.5 mr-1.5 group-hover:text-primary transition-colors" />
                             Manage
                          </Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
