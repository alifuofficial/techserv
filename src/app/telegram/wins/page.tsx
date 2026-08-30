"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Trophy,
  Loader2,
  Sparkles,
  Award,
  ShieldCheck,
  Flame,
  Gift,
  ExternalLink,
  PartyPopper,
  MessageCircle,
} from "lucide-react";
import { fetchTelegramApi } from "@/lib/telegram-client";

interface WinItem {
  id: string;
  campaignTitle: string;
  campaignSlug: string;
  campaignImage: string | null;
  ticketNumber: string;
  prizeTitle: string;
  wonAt: string;
  status: string;
}

export default function WinsPage() {
  const [wins, setWins] = useState<WinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTelegramApi("/api/telegram/wins")
      .then((res) => {
        if (res.ok && res.data.success) {
          setWins(res.data.wins || []);
        } else {
          setError(res.data.error || "Failed to load wins");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load wins");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A11] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse shadow-lg shadow-amber-500/20">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Loading your winner vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A11] text-white pb-24 selection:bg-amber-500/30">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-80 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-amber-500/15 rounded-full blur-[80px]"></div>
        <div className="absolute top-10 -left-16 w-60 h-60 bg-purple-600/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 px-5">
        
        {/* Sticky Header */}
        <div className="pt-12 pb-4 flex items-center justify-between sticky top-0 bg-[#070A11]/85 backdrop-blur-xl z-20 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link
              href="/telegram"
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-slate-300 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-white leading-tight">My Winning Vault</h1>
              <p className="text-xs text-amber-300/80 font-medium">
                {wins.length > 0 ? `🎉 ${wins.length} Grand Prizes Won` : "Prize Claims & History"}
              </p>
            </div>
          </div>
        </div>

        {/* Hero Celebration / Stats Vault Card */}
        <div className="mt-4 rounded-3xl p-6 bg-gradient-to-br from-[#2D1F08] via-[#1A1308] to-[#0E0C06] border border-amber-500/40 shadow-2xl shadow-amber-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Hall of Champions
              </span>
              <div className="mt-2">
                <h2 className="text-3xl font-black text-white">{wins.length}</h2>
                <p className="text-xs text-amber-200/80 font-medium mt-0.5">
                  {wins.length === 1 ? "Prize Awarded" : "Prizes Awarded"}
                </p>
              </div>
            </div>

            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <Trophy className="w-8 h-8 fill-slate-950" />
            </div>
          </div>
        </div>

        {/* Motivational Odds Tip */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-purple-950/70 border border-purple-500/30 shadow-xl shadow-purple-950/30 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
            <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-extrabold text-white">
              The More Tickets, The More Wins!
            </h3>
            <p className="text-[11px] text-purple-200/90 leading-snug mt-0.5">
              Accumulate more entries in live draws to boost your chances of landing in this vault.
            </p>
          </div>
        </div>

        {/* Wins List */}
        <div className="mt-4 space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl">
              {error}
            </div>
          )}

          {wins.length === 0 ? (
            <div className="bg-[#0D1424] border border-slate-800/80 rounded-3xl p-8 flex flex-col items-center justify-center text-center mt-6 space-y-3 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-white">No Wins Yet</h2>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Your lucky moment is right around the corner! Enter ongoing draws to claim your first grand prize.
              </p>
              <Link
                href="/telegram/campaigns"
                className="mt-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black py-3 px-6 rounded-2xl flex items-center gap-2 text-xs active:scale-95 transition-all shadow-lg shadow-emerald-500/25"
              >
                <Sparkles className="w-4 h-4" /> Enter Live Draws Now
              </Link>
            </div>
          ) : (
            wins.map((win) => (
              <div
                key={win.id}
                className="bg-gradient-to-r from-[#1A140A] via-[#120E06] to-[#0A0F1D] border border-amber-500/40 rounded-3xl p-4 shadow-xl shadow-amber-950/20 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex gap-3.5">
                  {/* Prize Photo with Gold Stamp */}
                  <div className="w-20 h-20 bg-slate-900 rounded-2xl shrink-0 overflow-hidden border border-amber-500/40 relative shadow-inner">
                    {win.campaignImage ? (
                      <img
                        src={win.campaignImage}
                        alt={win.campaignTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-500/60 bg-slate-900">
                        <Trophy className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-1 rounded-lg shadow-md">
                      <Trophy className="w-3 h-3 fill-slate-950" />
                    </div>
                  </div>

                  {/* Win Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                          🏆 GRAND PRIZE
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(win.wonAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-white font-extrabold text-sm leading-tight truncate">
                        {win.campaignTitle}
                      </h3>

                      <p className="text-amber-300 font-black text-xs mt-1">
                        Prize: {win.prizeTitle}
                      </p>
                    </div>

                    {/* Winning Ticket Tag */}
                    <div className="mt-2.5 flex items-center justify-between bg-[#080B14] p-2 rounded-xl border border-amber-500/20">
                      <div className="flex items-center gap-1.5 min-w-0 text-xs">
                        <span className="text-[11px] text-slate-400 font-semibold">Winning Ticket:</span>
                        <span className="font-mono font-black text-emerald-400 truncate">
                          {win.ticketNumber}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claim Prize Action */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Official Verified Winner</span>
                  </div>

                  <a
                    href="https://t.me/milkytechonlinebot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 text-xs bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Contact Support to Claim</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Provably Fair Badge */}
        <div className="p-4 bg-gradient-to-r from-slate-900/60 to-slate-950/80 rounded-2xl border border-white/5 text-center space-y-1 mt-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <ShieldCheck className="w-4 h-4" /> Cryptographically Guaranteed Wins
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            All winning draws are audited and certified using provably fair blockchain-grade RNG seeds.
          </p>
        </div>

      </div>
    </div>
  );
}
