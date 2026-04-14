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
    { icon: Users, label: 'Refer', href: '/dashboard/referrals' },
    { icon: Settings, label: 'Profile', href: '/dashboard/settings' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Main Content Area */}
      <main className="relative pb-24 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/5" />
        <div className="relative flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="relative group flex flex-col items-center gap-1 min-w-[64px]"
              >
                <div className={cn(
                  "relative p-2 rounded-xl transition-all duration-300",
                  isActive ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                )}>
                  <item.icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div 
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-emerald-500/20 blur-md rounded-xl"
                    />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  isActive ? "text-emerald-400" : "text-slate-500"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-emerald-400 rounded-full"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
