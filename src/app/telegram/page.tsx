"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Loader2, Ticket, Wallet, Trophy, AlertTriangle, User, Users } from "lucide-react";
import Link from "next/link";
import { fetchTelegramApi } from "@/lib/telegram-client";

export default function TelegramMiniApp() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<{ balance: number; campaigns: any[]; ticketsCount: number; winsCount: number; user?: any } | null>(null);

  const loadDashboard = async () => {
    try {
      const res = await fetchTelegramApi("/api/telegram/dashboard");
      if (res.ok && res.data.success) {
        setDashboardData(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    loadDashboard();

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor("#0B0F19");
      tg.setBackgroundColor("#0B0F19");
    }

    if (status === "unauthenticated" && tg && tg.initData) {
      signIn("telegram", {
        initData: tg.initData,
        redirect: false,
      }).then(() => {
        loadDashboard();
      }).catch(console.error);
    }
  }, [status]);

  const userName =
    dashboardData?.user?.name ||
    session?.user?.name ||
    session?.user?.email?.split("@")[0].replace("telegram_", "User ") ||
    "User";

  return (
    <div className="pb-24">
      {/* Top Bar */}
      <div className="px-5 pt-14 pb-4 flex justify-between items-center sticky top-0 bg-[#0B0F19]/80 backdrop-blur-lg z-10">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Welcome back</p>
          <h1 className="text-xl font-bold text-white mt-0.5">{userName}</h1>
        </div>
        <Link href="/telegram/profile" className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden active:scale-95 transition-transform">
          <User className="w-5 h-5 text-slate-400" />
        </Link>
      </div>

      <div className="px-5 space-y-6 mt-2">
        {/* Wallet Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-lg shadow-emerald-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8 pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Available Balance</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-white">{dashboardData?.balance?.toFixed(2) || "0.00"}</span>
                <span className="text-emerald-200 font-bold text-sm">ETB</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <Link href="/telegram/deposit" className="flex-1 bg-white text-emerald-600 font-bold py-3 px-4 rounded-xl text-sm transition-transform active:scale-95 text-center shadow-md">
              Deposit
            </Link>
            <Link href="/telegram/withdraw" className="flex-1 bg-emerald-700/50 text-white font-bold py-3 px-4 rounded-xl text-sm transition-transform active:scale-95 border border-emerald-400/30 text-center">
              Withdraw
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/telegram/tickets" className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 active:bg-slate-800 transition-colors relative shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center relative">
              <Ticket className="w-6 h-6" />
              {dashboardData && dashboardData.ticketsCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#121826]">
                  {dashboardData.ticketsCount}
                </div>
              )}
            </div>
            <span className="text-white font-medium text-sm text-center leading-tight">My<br/>Tickets</span>
          </Link>
          <Link href="/telegram/wins" className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 active:bg-slate-800 transition-colors relative shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center relative">
              <Trophy className="w-6 h-6" />
              {dashboardData && dashboardData.winsCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#121826]">
                  {dashboardData.winsCount}
                </div>
              )}
            </div>
            <span className="text-white font-medium text-sm text-center leading-tight">My<br/>Wins</span>
          </Link>
          <Link href="/telegram/referrals" className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 active:bg-slate-800 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center leading-tight">Refer<br/>& Earn</span>
          </Link>
        </div>

        {/* Active Campaigns */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-white">Hot Campaigns</h2>
            <Link href="/telegram/campaigns" className="text-emerald-400 text-xs font-bold uppercase tracking-wider hover:underline">
              See All
            </Link>
          </div>
          
          <div className="space-y-3">
            {dashboardData?.campaigns?.map((campaign: any) => (
              <Link href={`/telegram/campaigns/${campaign.slug}`} key={campaign.id} className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 flex items-center gap-4 active:bg-slate-800 transition-colors hover:border-slate-700">
                <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                  {campaign.image ? (
                    <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 text-xs font-bold">IMG</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm leading-tight">{campaign.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-emerald-400 font-bold text-xs">{campaign.ticketPrice} {campaign.currency || "ETB"}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <span className="text-slate-400 text-xs font-medium">
                      {new Date(campaign.drawDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.max(5, (campaign.entriesCount / (campaign.maxEntries || 1)) * 100))}%` }}></div>
                  </div>
                </div>
              </Link>
            ))}
            {dashboardData?.campaigns?.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">No active campaigns at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
