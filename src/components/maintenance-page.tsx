"use client";

import { motion } from "framer-motion";
import { Hammer, Cog, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MaintenancePage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center grid-pattern relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl w-full px-6 text-center space-y-8"
      >
        <div className="inline-flex items-center gap-3 group mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <span className="text-3xl font-black tracking-tighter">
            Milky<span className="text-primary italic">Tech</span>
          </span>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest">
            <Hammer className="h-3 w-3" />
            Under Maintenance
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
            We&apos;re polishing <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500 italic">the future.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto font-medium">
            Our systems are currently undergoing scheduled improvements to bring you a faster, more reliable service experience. We&apos;ll be back shortly!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button variant="outline" className="h-12 px-8 rounded-2xl border-2 font-black gap-2 group" asChild>
            <Link href="https://t.me/milkytech_online" target="_blank">
              Join Updates
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="ghost" className="h-12 px-8 rounded-2xl font-bold text-muted-foreground gap-2" asChild>
            <Link href="/auth/signin">
              <ShieldCheck className="h-4 w-4" />
              Admin Access
            </Link>
          </Button>
        </div>

        <div className="pt-12 flex items-center justify-center gap-8">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center animate-spin-slow">
              <Cog className="h-5 w-5 text-muted-foreground opacity-40" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-tighter">Core Tasks</span>
          </div>
          <div className="flex flex-col items-center">
             <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-tighter">API Status</span>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
