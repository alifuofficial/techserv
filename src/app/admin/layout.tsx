'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ────────────────────────────────────────────
   Access Denied Component
   ──────────────────────────────────────────── */
function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="text-center px-4"
      >
        <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          You don&apos;t have permission to access this area. Admin privileges are required.
        </p>
        <Button asChild>
          <Link href="/">Go Back Home</Link>
        </Button>
      </motion.div>
    </div>
  )
}

/* ────────────────────────────────────────────
   Admin Layout Component
   ──────────────────────────────────────────── */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // Not authenticated — redirect will fire
  if (!session) return null

  // Check admin role
  const userRole = (session.user as Record<string, unknown>).role as string
  if (userRole !== 'admin') {
    return <AccessDenied />
  }

  return <>{children}</>
}
