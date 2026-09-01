"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  Ticket,
  Wallet,
  Trophy,
  User,
  Sparkles,
  ChevronRight,
  Flame,
  ShieldCheck,
  Zap,
  Gift,
  ArrowUpRight,
  PlusCircle,
  Clock,
  TrendingUp,
  Crown,
  CheckCircle2,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { fetchTelegramApi, getTelegramStartParam } from "@/lib/telegram-client";

interface CampaignItem {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  prizeTitle: string;
  prizeValue: number;
  ticketPrice: number;
  currency: string;
  drawDate: string;
  maxEntries: number;
  entriesCount: number;
  percentage: number;
  remainingTickets: number;
  isCompleted?: boolean;
  isInstant?: boolean;
  status?: string;
  winnerName?: string | null;
  winningTicketNumber?: string | null;
  completedAt?: string | null;
}

interface RecentWinnerItem {
  id: string;
  winnerName: string;
  prizeTitle: string;
  ticketNumber: string;
  drawDate: string;
}

interface DashboardData {
  balance: number;
  campaigns: CampaignItem[];
  recentWinners: RecentWinnerItem[];
  ticketsCount: number;
  winsCount: number;
  referralBonus: number;
  referralCurrency: string;
  user?: { id: string; name: string; email: string };
}

export default function TelegramMiniApp() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "INSTANT" | "OFFICIAL">("ALL");

  const loadDashboard = async () => {
    try {
      const res = await fetchTelegramApi("/api/telegram/dashboard");
      if (res.ok && res.data.success) {
        setDashboardData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const handleFocus = () => {
      loadDashboard();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor("#070A11");
      tg.setBackgroundColor("#070A11");
    }

    if (status === "unauthenticated" && tg && tg.initData) {
      const startParam = getTelegramStartParam();
      signIn("telegram", {
        initData: tg.initData,
        startParam: startParam || undefined,
        redirect: false,
      })
        .then(() => {
          loadDashboard();
        })
        .catch(console.error);
    }

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [status]);

  const userName =
    dashboardData?.user?.name ||
    session?.user?.name ||
    session?.user?.email?.split("@")[0].replace("telegram_", "User ") ||
    "Lucky Player";

  const totalLiveTickets = dashboardData?.ticketsCount || 0;
  const totalWins = dashboardData?.winsCount || 0;
  const referralBonus = dashboardData?.referralBonus || 10;
  const currency = dashboardData?.referralCurrency || "ETB";

  const allCampaigns = dashboardData?.campaigns || [];
  const instantDraws = allCampaigns.filter((c) => c.isInstant);
  const officialCampaigns = allCampaigns.filter((c) => !c.isInstant);

  return (
    <div className="min-h-screen bg-[#070A11] text-white pb-24 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* Background Ambient Cyber Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-96 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-[90px]"></div>
        <div className="absolute top-10 -right-20 w-64 h-64 bg-indigo-600/15 rounded-full blur-[90px]"></div>
      </div>

      <div className="relative z-10">
        
        {/* Top Header / Player Profile Status */}
        <div className="px-5 pt-12 pb-3 flex justify-between items-center sticky top-0 bg-[#070A11]/85 backdrop-blur-xl z-20 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-[#0D1424] rounded-[14px] flex items-center justify-center font-black text-emerald-400 text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#070A11] flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-black fill-black" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> VIP Player
                </span>
              </div>
              <h1 className="text-base font-extrabold text-white leading-tight mt-0.5 truncate max-w-[170px]">
                {userName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/telegram/profile"
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all shadow-inner"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Live Winner Ticker Bar */}
        <div className="px-5 mt-3">
          <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-emerald-500/15 border border-amber-500/30 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-sm">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 overflow-hidden text-xs">
              <p className="text-amber-200 font-bold truncate text-[11px]">
                {dashboardData?.recentWinners?.[0]
                  ? `🎉 ${dashboardData.recentWinners[0].winnerName} won ${dashboardData.recentWinners[0].prizeTitle}!`
                  : "🔥 Live Provably Fair Draws • Real Cash & Gadget Prizes!"}
              </p>
            </div>
            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase shrink-0">
              LIVE
            </span>
          </div>
        </div>

        <div className="px-5 space-y-5 mt-4">
          
          {/* Gamified Luxury Wallet Card */}
          <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#0E3B2E] via-[#0D2922] to-[#091A18] border border-emerald-500/40 shadow-2xl shadow-emerald-950/50">
            {/* Shimmer Light Effects */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none transform translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300/90">
                      Your Vault Balance
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-4xl font-black text-white tracking-tight drop-shadow-sm">
                      {dashboardData?.balance !== undefined ? dashboardData.balance.toFixed(2) : "0.00"}
                    </span>
                    <span className="text-emerald-300 font-extrabold text-sm uppercase tracking-wider">
                      {currency}
                    </span>
                  </div>
                </div>

                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-300 shadow-inner">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/telegram/deposit"
                  className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 text-center"
                >
                  <PlusCircle className="w-4 h-4 fill-slate-950 text-emerald-400" />
                  <span>+ Deposit</span>
                </Link>

                <Link
                  href="/telegram/withdraw"
                  className="bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-white/15 backdrop-blur-md text-center"
                >
                  <span>Withdraw</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </Link>
              </div>
            </div>
          </div>

          {/* High Energy Featured Action Cards (Daily Spin & Instant Mini Draws) */}
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Daily Free Lucky Spin */}
            <Link
              href="/telegram/spin"
              className="bg-gradient-to-br from-[#291A08] via-[#1C1205] to-[#120B02] border border-amber-500/40 hover:border-amber-500/80 rounded-3xl p-4 flex flex-col justify-between relative active:scale-95 transition-all shadow-xl shadow-amber-950/40 group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-400/20 transition-colors"></div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 fill-amber-400" />
                </div>
                <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> FREE
                </span>
              </div>
              <div>
                <span className="text-white font-extrabold text-sm leading-tight block">Daily Lucky Spin</span>
                <span className="text-[10px] text-amber-300/80 font-semibold mt-0.5 block">Win Free ETB Every 24h</span>
              </div>
            </Link>

            {/* 2. Instant Mini Draws */}
            <Link
              href="/telegram/instant"
              className="bg-gradient-to-br from-[#241038] via-[#170B24] to-[#0D0514] border border-purple-500/40 hover:border-purple-500/80 rounded-3xl p-4 flex flex-col justify-between relative active:scale-95 transition-all shadow-xl shadow-purple-950/40 group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-400/20 transition-colors"></div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 fill-purple-400" />
                </div>
                <span className="text-[9px] font-black uppercase text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                  ⚡ FAST
                </span>
              </div>
              <div>
                <span className="text-white font-extrabold text-sm leading-tight block">Instant Mini Draws</span>
                <span className="text-[10px] text-purple-300/80 font-semibold mt-0.5 block">5-Min 100-Ticket Drops</span>
              </div>
            </Link>
          </div>

          {/* Gamified 3-Card Interactive HUD */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Card 1: My Tickets */}
            <Link
              href="/telegram/tickets"
              className="bg-gradient-to-b from-[#111A2E] to-[#0C1220] border border-blue-500/25 hover:border-blue-500/50 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center relative active:scale-95 transition-all shadow-lg shadow-blue-950/30 group"
            >
              <div className="relative mb-2">
                <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-400/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Ticket className="w-5 h-5" />
                </div>
                {totalLiveTickets > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-[#0C1220] shadow-sm">
                    {totalLiveTickets}
                  </span>
                )}
              </div>
              <span className="text-white font-extrabold text-xs leading-tight">My Tickets</span>
              <span className="text-[10px] text-blue-300/80 font-medium mt-0.5">
                {totalLiveTickets > 0 ? `${totalLiveTickets} in Play` : "Enter Draw"}
              </span>
            </Link>

            {/* Card 2: My Wins */}
            <Link
              href="/telegram/wins"
              className="bg-gradient-to-b from-[#241C10] to-[#140F08] border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center relative active:scale-95 transition-all shadow-lg shadow-amber-950/30 group"
            >
              <div className="relative mb-2">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                {totalWins > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-[#140F08] shadow-sm">
                    {totalWins}
                  </span>
                )}
              </div>
              <span className="text-white font-extrabold text-xs leading-tight">My Wins</span>
              <span className="text-[10px] text-amber-300/80 font-medium mt-0.5">
                {totalWins > 0 ? `${totalWins} Prize Won!` : "Vault"}
              </span>
            </Link>

            {/* Card 3: Refer & Earn */}
            <Link
              href="/telegram/referrals"
              className="bg-gradient-to-b from-[#1C142E] to-[#100C1C] border border-purple-500/25 hover:border-purple-500/50 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center relative active:scale-95 transition-all shadow-lg shadow-purple-950/30 group"
            >
              <div className="relative mb-2">
                <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Gift className="w-5 h-5" />
                </div>
                <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full border-2 border-[#100C1C] shadow-sm">
                  +{referralBonus}
                </span>
              </div>
              <span className="text-white font-extrabold text-xs leading-tight">Refer & Earn</span>
              <span className="text-[10px] text-purple-300/80 font-medium mt-0.5">Free Bonus</span>
            </Link>
          </div>

          {/* Section: HOT PRIZE DRAWS with Category Switcher */}
          <div className="pt-2">
            
            {/* Header Title */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" /> Hot Prize Draws
                </h2>
              </div>
              <Link
                href="/telegram/campaigns"
                className="text-emerald-400 text-xs font-bold uppercase tracking-wider hover:text-emerald-300 flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "ALL"
                    ? "bg-white text-slate-950 shadow-md shadow-white/10 scale-[1.02]"
                    : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                <span>All Draws</span>
                <span className="text-[10px] opacity-75">({allCampaigns.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("INSTANT")}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "INSTANT"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25 scale-[1.02]"
                    : "bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20"
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Instant Mini Draws</span>
                <span className="text-[10px] font-black bg-white/20 px-1.5 py-0.2 rounded-full">
                  {instantDraws.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("OFFICIAL")}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "OFFICIAL"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                    : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 fill-current" />
                <span>Official Campaigns</span>
                <span className="text-[10px] font-black bg-white/20 px-1.5 py-0.2 rounded-full">
                  {officialCampaigns.length}
                </span>
              </button>
            </div>

            <div className="space-y-6">

              {/* 1. SEPARATE SECTION: Instant Mini Draws */}
              {(activeTab === "ALL" || activeTab === "INSTANT") && instantDraws.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                        <Zap className="w-4 h-4 fill-purple-400" />
                      </span>
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">
                          ⚡ Instant Mini Draws
                        </h3>
                        <p className="text-[10px] text-purple-300/80 font-medium">
                          5-Min Fast Games • Auto-Draw Upon 100% Sellout
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/telegram/instant"
                      className="text-purple-400 hover:text-purple-300 text-[11px] font-bold flex items-center gap-0.5"
                    >
                      <span>Play Flash</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {instantDraws.map((campaign) => {
                      const isCompleted = campaign.isCompleted || campaign.status === "COMPLETED";

                      return (
                        <Link
                          href={`/telegram/campaigns/${campaign.slug}`}
                          key={campaign.id}
                          className="block bg-gradient-to-r from-[#180F29] via-[#120B20] to-[#0A0713] border border-purple-500/40 hover:border-purple-400 rounded-3xl p-4 active:scale-[0.99] transition-all shadow-xl shadow-purple-950/40 group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

                          <div className="flex items-center gap-3.5">
                            {/* Prize Thumbnail */}
                            <div className="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center shrink-0 border border-purple-500/30 overflow-hidden relative shadow-inner">
                              {campaign.image ? (
                                <img
                                  src={campaign.image}
                                  alt={campaign.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <Zap className="w-8 h-8 text-purple-400" />
                              )}
                              <div className="absolute top-1 left-1 bg-purple-600 text-[9px] font-black text-white px-1.5 py-0.5 rounded-md shadow-md">
                                {campaign.ticketPrice} {campaign.currency}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[9px] font-black text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/40 uppercase tracking-wider flex items-center gap-1">
                                  <Zap className="w-2.5 h-2.5 fill-current" /> 5-MIN FLASH
                                </span>
                                <span className="text-[10px] font-bold text-purple-300">
                                  {campaign.entriesCount}/{campaign.maxEntries} Sold
                                </span>
                              </div>

                              <h3 className="text-white font-extrabold text-sm leading-snug truncate group-hover:text-purple-300 transition-colors">
                                {campaign.title}
                              </h3>

                              <div className="text-xs text-emerald-400 font-bold font-mono mt-0.5">
                                Prize: {campaign.prizeTitle}
                              </div>

                              {/* Progress bar */}
                              <div className="mt-2.5">
                                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-purple-500/20">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
                                    style={{ width: `${Math.min(100, Math.max(8, campaign.percentage))}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                            <span className="text-[11px] font-bold text-purple-300/80">
                              ⚡ Instant Win Drop
                            </span>
                            <div className="inline-flex items-center gap-1 font-bold text-purple-300 group-hover:translate-x-0.5 transition-transform text-xs">
                              <span>Enter 5-Min Draw</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. SEPARATE SECTION: Official Campaigns */}
              {(activeTab === "ALL" || activeTab === "OFFICIAL") && officialCampaigns.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Trophy className="w-4 h-4 fill-emerald-400" />
                      </span>
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">
                          🏆 Official Grand Campaigns
                        </h3>
                        <p className="text-[10px] text-emerald-300/80 font-medium">
                          Major Flagship Prizes & High Value Jackpots
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/telegram/campaigns"
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-0.5"
                    >
                      <span>All Campaigns</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-3.5">
                    {officialCampaigns.map((campaign) => {
                      const isCompleted = campaign.isCompleted || campaign.status === "COMPLETED";

                      if (isCompleted) {
                        return (
                          <Link
                            href={`/telegram/campaigns/${campaign.slug}`}
                            key={campaign.id}
                            className="block bg-gradient-to-r from-[#1E160A] via-[#140F08] to-[#0C0F1A] border border-amber-500/40 hover:border-amber-500/70 rounded-3xl p-4 active:scale-[0.99] transition-all shadow-xl shadow-black/40 group relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                            <div className="flex items-center gap-3.5">
                              <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/40 overflow-hidden relative shadow-inner">
                                {campaign.image ? (
                                  <img
                                    src={campaign.image}
                                    alt={campaign.title}
                                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <Trophy className="w-8 h-8 text-amber-400" />
                                )}
                                <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-1 rounded-lg shadow-md">
                                  <Trophy className="w-3 h-3 fill-slate-950" />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                                    <Trophy className="w-2.5 h-2.5" /> DRAW COMPLETED
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {campaign.drawDate ? new Date(campaign.drawDate).toLocaleDateString() : "Finished"}
                                  </span>
                                </div>

                                <h3 className="text-white font-extrabold text-sm leading-snug truncate group-hover:text-amber-300 transition-colors">
                                  {campaign.title}
                                </h3>

                                <div className="mt-2 bg-[#090C16] border border-amber-500/25 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span className="text-xs font-black text-amber-200 truncate">
                                      {campaign.winnerName || "Winner Selected"}
                                    </span>
                                  </div>
                                  {campaign.winningTicketNumber && (
                                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                                      {campaign.winningTicketNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                              <span className="text-[11px] font-bold text-amber-400/90 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Won: {campaign.prizeTitle}
                              </span>
                              <div className="inline-flex items-center gap-1 font-bold text-amber-300 group-hover:translate-x-0.5 transition-transform text-xs">
                                <span>See Winner Details</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </Link>
                        );
                      }

                      return (
                        <Link
                          href={`/telegram/campaigns/${campaign.slug}`}
                          key={campaign.id}
                          className="block bg-gradient-to-r from-[#0E1526] to-[#0A0F1D] border border-slate-800/80 hover:border-emerald-500/50 rounded-3xl p-4 active:scale-[0.99] transition-all shadow-xl shadow-black/40 group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

                          <div className="flex items-center gap-3.5">
                            <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 overflow-hidden relative shadow-inner">
                              {campaign.image ? (
                                <img
                                  src={campaign.image}
                                  alt={campaign.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <Trophy className="w-8 h-8 text-slate-600" />
                              )}
                              <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-md text-[9px] font-black text-emerald-400 px-1.5 py-0.5 rounded-md border border-white/10">
                                {campaign.ticketPrice} {campaign.currency}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {new Date(campaign.drawDate).toLocaleDateString()}
                                </span>
                                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  {campaign.percentage}% Complete
                                </span>
                              </div>

                              <h3 className="text-white font-extrabold text-sm leading-snug truncate group-hover:text-emerald-300 transition-colors">
                                {campaign.title}
                              </h3>

                              <div className="mt-3">
                                <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-white/5">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                                    style={{ width: `${Math.min(100, Math.max(8, campaign.percentage))}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                            <span className="text-[11px] font-semibold text-slate-400">
                              🎯 Grand Prize Draw
                            </span>
                            <div className="inline-flex items-center gap-1 font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform text-xs">
                              <span>Get Lucky Tickets</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {allCampaigns.length === 0 && (
                <div className="bg-[#0D1424] border border-slate-800 rounded-3xl p-8 text-center space-y-2">
                  <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">No active campaigns yet</p>
                  <p className="text-xs text-slate-500">Check back soon for exciting new prize draws!</p>
                </div>
              )}

            </div>
          </div>

          {/* Trust & Provably Fair Footer Card */}
          <div className="p-4 bg-gradient-to-r from-slate-900/60 to-slate-950/80 rounded-2xl border border-white/5 text-center space-y-1 mt-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Provably Fair Random Draws
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Every winner is cryptographically selected using SHA-256 random seeds.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
