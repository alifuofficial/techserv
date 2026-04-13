'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Briefcase,
  Search,
  PackageSearch,
  CheckCircle2,
  Clock,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useSettings } from '@/hooks/use-settings'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden bg-card shadow-sm">
      <div className="p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/40 py-4 last:border-0">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { formatAmount } = useSettings()

  useEffect(() => {
    let cancelled = false
    async function fetchProjects() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/orders', { cache: 'no-store' })
        if (res.ok && !cancelled) {
          const data = await res.json()
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

  async function handleDeleteProject(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to permanently delete this project?")) return;
    
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter(p => p.id !== id));
        toast.success("Project deleted successfully");
      } else {
        toast.error("Failed to delete project");
      }
    } catch {
      toast.error("Network error");
    }
  }

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

  const counts = useMemo(() => ({
    all: projects.length,
    approved: projects.filter(p => p.status === 'approved').length,
    completed: projects.filter(p => p.status === 'completed').length,
  }), [projects])

  const filters: { value: ProjectStatusFilter; label: string; icon: typeof Briefcase }[] = [
    { value: 'all', label: 'All', icon: Briefcase },
    { value: 'approved', label: 'In Progress', icon: Clock },
    { value: 'completed', label: 'Completed', icon: CheckCircle2 },
  ]

  return (
    <motion.div className="p-4 md:p-6 space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Briefcase className="h-4.5 w-4.5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">Manage fulfillment and track progress</p>
          </div>
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

      <motion.div variants={fadeUp} className="flex gap-2">
        {filters.map((f) => {
          const isActive = statusFilter === f.value
          return (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
              <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-primary-foreground/20' : 'bg-muted-foreground/10'
              }`}>
                {counts[f.value]}
              </span>
            </button>
          )
        })}
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
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
          <div className="rounded-xl border border-border/40 shadow-sm overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Project Details</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="w-[200px]">Progress</TableHead>
                    <TableHead className="text-right">Earnings / Date</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((p) => {
                    const isCompleted = p.status === 'completed'
                    return (
                      <TableRow key={p.id} className="group hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/orders/${p.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>
                              {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                                {p.service?.title || 'Unknown Service'}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 truncate uppercase tracking-widest">
                                ID: {p.id.slice(0, 8)} • {isCompleted ? 'Finished' : 'In Work'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{p.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5 w-full pr-4">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-muted-foreground">{p.progress}% Done</span>
                            </div>
                            <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                  isCompleted ? 'bg-emerald-500' : 'bg-primary'
                                }`}
                                style={{ width: `${p.progress}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="text-sm font-bold tabular-nums text-primary">{formatAmount(p.amount)}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">
                            <Clock className="h-3 w-3 inline-block mr-1 mb-0.5" />
                            {p.duration}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2 isolate">
                            <Link href={`/admin/orders/${p.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                              <Search className="h-4 w-4" />
                            </Link>
                            <button onClick={(e) => handleDeleteProject(e, p.id)} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}