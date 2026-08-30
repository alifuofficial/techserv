"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft, Trophy, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { getTelegramWins } from "../actions";

export default function WinsPage() {
  const { data: session, status } = useSession();
  const [wins, setWins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initData) {
        tg.ready();
        tg.expand();
        signIn("telegram", { initData: tg.initData, redirect: false }).catch(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      getTelegramWins()
        .then((res) => {
          if (res.success) {
            setWins(res.wins || []);
          } else {
            setError(res.error || "Failed to load wins");
          }
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load wins");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 animate-pulse">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading your wins...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-5 min-h-screen bg-[#0B0F19]">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/90 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center active:scale-95 transition-transform">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">My Wins</h1>
      </div>

      <div className="mt-4 space-y-4">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl">
            {error}
          </div>
        )}

        {wins.length === 0 ? (
          <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center mt-6">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20 shadow-inner">
              <Trophy className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No wins yet</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Every ticket is an opportunity. Enter active draws to increase your chances of winning!
            </p>
            <Link
              href="/campaigns"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-sm active:scale-95 transition-transform shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-4 h-4" /> Browse Campaigns
            </Link>
          </div>
        ) : (
          wins.map((win) => (
            <div
              key={win.id}
              className="bg-gradient-to-br from-amber-500/15 via-[#121826] to-[#121826] border border-amber-500/30 rounded-2xl p-4 flex gap-4 shadow-lg shadow-amber-500/5 relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-slate-800 rounded-xl shrink-0 overflow-hidden border border-amber-500/30 relative">
                {win.campaignImage ? (
                  <img src={win.campaignImage} alt={win.campaignTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-400/60 bg-slate-800">
                    <Trophy className="w-8 h-8 opacity-40" />
                  </div>
                )}
                <div className="absolute top-0 right-0 bg-amber-500 w-6 h-6 rounded-bl-xl flex items-center justify-center shadow-md">
                  <Trophy className="w-3.5 h-3.5 text-black font-bold" />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                <div>
                  <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">{win.campaignTitle}</h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="bg-amber-500/20 text-amber-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 tracking-wider uppercase">
                      {win.prizeTitle}
                    </span>
                    <span className="font-mono text-emerald-400 text-xs font-bold">{win.ticketNumber}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-3 text-xs text-slate-400">
                  <span>Won: {new Date(win.wonAt).toLocaleDateString()}</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
