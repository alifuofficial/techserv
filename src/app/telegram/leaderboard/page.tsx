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
} from "lucide-react";
import Link from "next/link";

export default function TelegramLeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"WINNERS" | "REFERRERS">("WINNERS");
  const [topWinners, setTopWinners] = useState<any[]>([]);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any>({ totalPrizesAwarded: 0, totalDrawsCompleted: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/telegram/leaderboard");
        const data = await res.json();
        if (data.success) {
          setTopWinners(data.topWinners || []);
          setTopReferrers(data.topReferrers || []);
          if (data.platformStats) setPlatformStats(data.platformStats);
        }
      } catch (e) {
        console.error("Failed to load leaderboard:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg shadow-amber-500/30">
          🥇
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg shadow-slate-300/30">
          🥈
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-amber-700/30">
          🥉
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold text-[11px] flex items-center justify-center">
        #{index + 1}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <Link
          href="/telegram"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black">
          <Crown className="w-4 h-4" /> Hall of Fame
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/20 rounded-3xl p-5 text-center space-y-2 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" /> MilkyTech Top Champions
        </div>
        <h1 className="text-xl font-black text-white">Winners Leaderboard</h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Honoring our top grand prize winners and most active community champions!
        </p>

        {/* Mini KPI stats */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-2.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Prizes Won</span>
            <p className="text-sm font-black text-amber-400 mt-0.5">
              {platformStats.totalPrizesAwarded} Verified
            </p>
          </div>
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-2.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Draws Completed</span>
            <p className="text-sm font-black text-emerald-400 mt-0.5">
              {platformStats.totalDrawsCompleted} Certified
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900 border border-white/10 rounded-2xl mt-4">
        <button
          onClick={() => setActiveTab("WINNERS")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "WINNERS"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" /> Top Winners
        </button>

        <button
          onClick={() => setActiveTab("REFERRERS")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "REFERRERS"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Top Referrers
        </button>
      </div>

      {/* Content List */}
      <div className="mt-4 space-y-2.5">
        {isLoading ? (
          <div className="text-center py-10 text-xs text-slate-400">Loading Leaderboard Champions...</div>
        ) : activeTab === "WINNERS" ? (
          topWinners.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No completed draws yet. Be the first winner!</div>
          ) : (
            topWinners.map((winner, idx) => (
              <div
                key={winner.userId}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  idx === 0
                    ? "bg-gradient-to-r from-amber-500/10 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/10"
                    : "bg-slate-900/80 border-white/5"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(idx)}
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-white truncate">{winner.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      {winner.prizes.join(", ") || `${winner.totalPrizesWon} prizes won`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-amber-400">
                    +{winner.totalValueWon.toLocaleString()} ETB
                  </span>
                  <span className="block text-[9px] text-slate-500 uppercase font-bold">
                    {winner.totalPrizesWon} Won
                  </span>
                </div>
              </div>
            ))
          )
        ) : topReferrers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">No referrers yet. Invite friends to take #1!</div>
        ) : (
          topReferrers.map((referrer, idx) => (
            <div
              key={referrer.userId}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                idx === 0
                  ? "bg-gradient-to-r from-purple-500/10 to-slate-900 border-purple-500/40 shadow-lg shadow-purple-500/10"
                  : "bg-slate-900/80 border-white/5"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {getRankBadge(idx)}
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-white truncate">{referrer.name}</h4>
                  <p className="text-[10px] text-purple-400 font-semibold">
                    👥 {referrer.referralCount} Friends Invited
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black text-emerald-400">
                  +{referrer.bonusEarned.toLocaleString()} ETB
                </span>
                <span className="block text-[9px] text-slate-500 uppercase font-bold">Bonus Earned</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
