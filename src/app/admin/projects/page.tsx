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
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useSettings } from '@/hooks/use-settings'

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

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="flex items-center gap-4 text-xs">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
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
        const res = await fetch('/api/admin/orders')
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
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 py-20 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted/80 flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm mb-1">No projects found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProjects.map((p) => {
              const isCompleted = p.status === 'completed'
              return (
                <Link
                  key={p.id}
                  href={`/admin/orders/${p.id}`}
                  className="block rounded-xl border border-border/40 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-tight truncate">{p.service.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.user.name}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-blue-500/10 text-blue-600'
                    }`}>
                      {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                      {isCompleted ? 'Delivered' : 'Active'}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium tabular-nums">{p.progress}%</span>
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

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {p.duration}
                    </span>
                    <span className="font-medium text-foreground">{formatAmount(p.amount)}</span>
                    <span className="ml-auto">{format(new Date(p.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}