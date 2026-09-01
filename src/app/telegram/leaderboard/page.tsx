"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Users,
  Flame,
  Medal,
  Crown,
  Sparkles,
  ArrowLeft,
  Coins,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Gift,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { fetchTelegramApi } from "@/lib/telegram-client";

export default function TelegramLeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"WINNERS" | "REFERRERS">("WINNERS");
  const [topWinners, setTopWinners] = useState<any[]>([]);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any>({ totalPrizesAwarded: 0, totalDrawsCompleted: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      // Try fetchTelegramApi with fallback
      let data: any = null;
      try {
        const res = await fetchTelegramApi("/api/telegram/leaderboard");
        if (res.ok && res.data) {
          data = res.data;
        }
      } catch (e) {}

      if (!data) {
        const rawRes = await fetch("/api/telegram/leaderboard");
        data = await rawRes.json();
      }

      if (data && data.success) {
        setTopWinners(data.topWinners || []);
        setTopReferrers(data.topReferrers || []);
        if (data.platformStats) setPlatformStats(data.platformStats);
      }
    } catch (e) {
      console.error("Failed to load leaderboard:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (tab: "WINNERS" | "REFERRERS") => {
    setActiveTab(tab);
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
    loadData();
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/40 border border-amber-300 shrink-0">
          🥇
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-slate-300/40 border border-slate-200 shrink-0">
          🥈
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-amber-700/40 border border-amber-600 shrink-0">
          🥉
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-xl bg-slate-800/90 text-slate-400 font-black text-xs flex items-center justify-center border border-white/5 shrink-0">
        #{index + 1}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 pb-24 px-4 pt-4 selection:bg-amber-500/30">
      
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-80 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-16 -left-16 w-60 h-60 bg-amber-500/15 rounded-full blur-[80px]"></div>
        <div className="absolute top-10 -right-16 w-60 h-60 bg-purple-600/15 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <Link
            href="/telegram"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black">
              <Crown className="w-3.5 h-3.5 fill-amber-400" /> Hall of Fame
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-[#1A1208] via-[#120D1A] to-[#0A0E1A] border border-amber-500/30 rounded-3xl p-5 text-center space-y-2 relative overflow-hidden shadow-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-black uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 fill-amber-400" /> MilkyTech Champions
          </div>
          <h1 className="text-xl font-black text-white">Winners Leaderboard</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Honoring top grand prize winners and our most active community champions!
          </p>

          {/* Mini KPI stats */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prizes Won</span>
              <p className="text-sm font-black text-amber-400 mt-0.5">
                {platformStats.totalPrizesAwarded} Verified
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Draws Completed</span>
              <p className="text-sm font-black text-emerald-400 mt-0.5">
                {platformStats.totalDrawsCompleted} Certified
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 p-1.5 bg-[#0E1526] border border-slate-800 rounded-2xl mt-4 shadow-lg">
          <button
            onClick={() => handleTabChange("WINNERS")}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "WINNERS"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Top Winners
          </button>

          <button
            onClick={() => handleTabChange("REFERRERS")}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "REFERRERS"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 scale-[1.02]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Top Referrers
          </button>
        </div>

        {/* Content List */}
        <div className="mt-4 space-y-2.5">
          {isLoading ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-medium">Loading Hall of Fame Champions...</p>
            </div>
          ) : activeTab === "WINNERS" ? (
            topWinners.length === 0 ? (
              <div className="text-center py-10 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
                <Trophy className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
                <h3 className="text-sm font-bold text-white">No winners recorded yet</h3>
                <p className="text-xs text-slate-400">Be the first to enter our live draws and claim #1 on the leaderboard!</p>
                <Link
                  href="/telegram/instant"
                  className="inline-block mt-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase"
                >
                  Play Instant Draw
                </Link>
              </div>
            ) : (
              topWinners.map((winner, idx) => (
                <div
                  key={winner.userId || idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    idx === 0
                      ? "bg-gradient-to-r from-amber-500/15 via-[#16120B] to-[#0E1526] border-amber-500/50 shadow-xl shadow-amber-500/10"
                      : idx === 1
                      ? "bg-gradient-to-r from-slate-300/10 via-[#10141E] to-[#0E1526] border-slate-300/30"
                      : idx === 2
                      ? "bg-gradient-to-r from-amber-700/15 via-[#140F0A] to-[#0E1526] border-amber-700/30"
                      : "bg-[#0E1526] border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getRankBadge(idx)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs text-white truncate">{winner.name}</h4>
                        {idx < 3 && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {Array.isArray(winner.prizes) ? winner.prizes.join(", ") : `${winner.totalPrizesWon} grand prize(s) won`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black font-mono text-amber-400">
                      +{winner.totalValueWon.toLocaleString()} ETB
                    </span>
                    <span className="block text-[9px] text-slate-500 uppercase font-bold mt-0.5">
                      {winner.totalPrizesWon} {winner.totalPrizesWon === 1 ? "Prize" : "Prizes"} Won
                    </span>
                  </div>
                </div>
              ))
            )
          ) : topReferrers.length === 0 ? (
            <div className="text-center py-10 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
              <Users className="w-8 h-8 text-purple-400 mx-auto opacity-60" />
              <h3 className="text-sm font-bold text-white">No referrers yet</h3>
              <p className="text-xs text-slate-400">Share your invite link with friends to earn cash bonuses and take #1!</p>
              <Link
                href="/telegram/referrals"
                className="inline-block mt-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-black uppercase"
              >
                Get Referral Link
              </Link>
            </div>
          ) : (
            topReferrers.map((referrer, idx) => (
              <div
                key={referrer.userId || idx}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  idx === 0
                    ? "bg-gradient-to-r from-purple-500/15 via-[#130E20] to-[#0E1526] border-purple-500/50 shadow-xl shadow-purple-500/10"
                    : idx === 1
                    ? "bg-gradient-to-r from-slate-300/10 via-[#10141E] to-[#0E1526] border-slate-300/30"
                    : idx === 2
                    ? "bg-gradient-to-r from-amber-700/15 via-[#140F0A] to-[#0E1526] border-amber-700/30"
                    : "bg-[#0E1526] border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(idx)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-xs text-white truncate">{referrer.name}</h4>
                      {idx < 3 && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 uppercase">
                          TOP INFLUENCER
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-purple-400 font-semibold mt-0.5">
                      👥 {referrer.referralCount} Friends Invited
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black font-mono text-emerald-400">
                    +{referrer.bonusEarned.toLocaleString()} ETB
                  </span>
                  <span className="block text-[9px] text-slate-500 uppercase font-bold mt-0.5">Bonus Earned</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
