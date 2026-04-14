'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  ShoppingCart, 
  Users, 
  Settings, 
  Zap,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TMALayoutProps {
  children: React.ReactNode
}

export function TMALayout({ children }: TMALayoutProps) {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Zap, label: 'Services', href: '/services' },
    { icon: ShoppingCart, label: 'Orders', href: '/dashboard/orders' },
    { icon: Users, label: 'Squad', href: '/dashboard/referrals' },
    { icon: Settings, label: 'Profile', href: '/dashboard/settings' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background - subtle emerald grid + radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/[0.07] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-teal-500/[0.05] blur-[120px] rounded-full" />
      </div>

      {/* Main Content */}
      <main className="relative pb-24 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/[0.06]" />
        <nav className="relative flex items-center justify-around px-1 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 min-w-[56px] py-1.5 group"
              >
                <div className={cn(
                  "relative p-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-emerald-400"
                    : "text-white/30 group-hover:text-white/50 group-active:scale-90"
                )}>
                  <item.icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="tma-nav-indicator"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className={cn(
                  "text-[9px] font-bold tracking-wide transition-colors duration-200",
                  isActive ? "text-emerald-400" : "text-white/20 group-hover:text-white/40"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}