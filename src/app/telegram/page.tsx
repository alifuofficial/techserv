"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Loader2, Ticket, Wallet, Trophy, Activity, ChevronRight, AlertTriangle, User } from "lucide-react";

export default function TelegramMiniApp() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run auth if we are strictly unauthenticated
    if (status === "unauthenticated") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initData) {
        tg.ready();
        tg.expand();
        // Set header color to match our dark theme
        tg.setHeaderColor("#0B0F19");
        tg.setBackgroundColor("#0B0F19");

        signIn("telegram", { 
          initData: tg.initData, 
          redirect: false 
        }).then((res) => {
          if (res?.error) {
            setError(res.error);
          }
        });
      } else {
        // Not opened inside Telegram
        setError("Please open this app inside Telegram.");
      }
    }
  }, [status]);

  if (status === "loading" || (status === "unauthenticated" && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-16 h-16 relative flex items-center justify-center text-emerald-400 animate-pulse">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Authenticating...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    );
  }

  // Telegram User Dashboard
  return (
    <div className="pb-24">
      {/* Top Bar */}
      <div className="px-5 pt-6 pb-4 flex justify-between items-center sticky top-0 bg-[#0B0F19]/80 backdrop-blur-lg z-10">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Welcome back</p>
          <h1 className="text-xl font-bold text-white mt-0.5">{session?.user?.email?.split('@')[0].replace('telegram_', 'User ')}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
          <User className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      <div className="px-5 space-y-6 mt-2">
        {/* Wallet Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-lg shadow-emerald-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8 pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Available Balance</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-white">0.00</span>
                <span className="text-emerald-200 font-bold text-sm">ETB</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <button className="flex-1 bg-white text-emerald-600 font-bold py-3 px-4 rounded-xl text-sm transition-transform active:scale-95">
              Deposit
            </button>
            <button className="flex-1 bg-emerald-700/50 text-white font-bold py-3 px-4 rounded-xl text-sm transition-transform active:scale-95 border border-emerald-400/30">
              Withdraw
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 active:bg-slate-800 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm">Buy Tickets</span>
          </div>
          <div className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 active:bg-slate-800 transition-colors">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm">My Wins</span>
          </div>
        </div>

        {/* Active Campaigns */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-white">Hot Campaigns</h2>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">See All</span>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                  <span className="text-slate-500 text-xs font-bold">IMAGE</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm">iPhone 16 Pro Max</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-emerald-400 font-bold text-xs">250 ETB</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <span className="text-slate-500 text-xs font-medium">Draw in 2 days</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
