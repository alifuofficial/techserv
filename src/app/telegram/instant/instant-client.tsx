"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
  Sparkles,
  Ticket,
  Wallet,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { fetchTelegramApi } from "@/lib/telegram-client";

interface InstantDrawItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  entryPrice: number;
  currency: string;
  maxEntries: number;
  entriesSold: number;
  remainingTickets: number;
  percentage: number;
  prizeTitle: string;
  prizeValue: number;
  imageUrl?: string;
  endsAt: string;
  status: string;
}

export default function InstantDrawsClient() {
  const [draws, setDraws] = useState<InstantDrawItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [purchaseSuccessModal, setPurchaseSuccessModal] = useState<{
    drawTitle: string;
    ticketCount: number;
    totalAmount: number;
  } | null>(null);

  const loadDraws = async () => {
    try {
      const res = await fetchTelegramApi("/api/telegram/instant");
      if (res.ok && res.data.success) {
        setDraws(res.data.draws || []);
        if (res.data.user?.balance !== undefined) {
          setWalletBalance(res.data.user.balance);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDraws();
    const interval = setInterval(loadDraws, 10000); // Live poll every 10s
    return () => clearInterval(interval);
  }, []);

  // 1-Click Fast Ticket Purchase
  const handleFastBuy = async (draw: InstantDrawItem) => {
    if (purchasingId) return;

    if (walletBalance < draw.entryPrice) {
      const needed = (draw.entryPrice - walletBalance).toFixed(2);
      if (confirm(`Insufficient balance. You need ${needed} ETB more. Go to Deposit page?`)) {
        window.location.href = "/telegram/deposit";
      }
      return;
    }

    setPurchasingId(draw.id);

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("medium");
    }

    try {
      const res = await fetchTelegramApi("/api/telegram/checkout", {
        method: "POST",
        body: JSON.stringify({
          campaignId: draw.id,
          quantity: 1,
          provider: "WALLET",
        }),
      });

      if (!res.ok || !res.data.success) {
        throw new Error(res.data?.error || "Purchase failed");
      }

      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred("success");
      }

      if (res.data.newBalance !== undefined) {
        setWalletBalance(res.data.newBalance);
      }

      setPurchaseSuccessModal({
        drawTitle: draw.title,
        ticketCount: 1,
        totalAmount: draw.entryPrice,
      });

      loadDraws();
    } catch (err: any) {
      alert(err.message || "Failed to purchase ticket.");
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-white pb-24 selection:bg-emerald-500/30">
      
      {/* Ambient Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-96 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500/15 rounded-full blur-[100px]"></div>
        <div className="absolute top-20 -right-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        
        {/* Header */}
        <div className="px-5 pt-12 pb-3 flex justify-between items-center sticky top-0 bg-[#070A11]/85 backdrop-blur-xl z-20 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link
              href="/telegram"
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all shadow-inner"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 inline-flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 fill-purple-400" /> Fast 5-Min Games
                </span>
              </div>
              <h1 className="text-base font-extrabold text-white leading-tight mt-0.5">
                Instant Mini Draws
              </h1>
            </div>
          </div>

          {/* User Vault Balance Badge */}
          <Link
            href="/telegram/deposit"
            className="bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-2xl px-3 py-1.5 flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-300">
              {walletBalance.toFixed(2)} ETB
            </span>
          </Link>
        </div>

        <div className="px-5 space-y-4 mt-4">
          
          {/* Flash Promo Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-purple-950/70 border border-purple-500/40 shadow-xl shadow-purple-950/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/40">
                <Zap className="w-6 h-6 fill-purple-400" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>Instant Auto-Draws</span>
                  <span className="text-[9px] font-black bg-purple-500 text-white px-1.5 py-0.2 rounded-full uppercase">LIVE</span>
                </h3>
                <p className="text-[11px] text-purple-200/90 leading-snug mt-0.5">
                  Draws trigger automatically the instant 100% of tickets sell out!
                </p>
              </div>
            </div>
          </div>

          {/* Active Instant Draws List */}
          <div className="space-y-4 pt-1">
            {draws.map((draw) => {
              const isFull = draw.remainingTickets <= 0;
              const isBuying = purchasingId === draw.id;

              return (
                <div
                  key={draw.id}
                  className="bg-gradient-to-b from-[#0E1526] to-[#0A0F1D] border border-purple-500/30 hover:border-purple-500/60 rounded-3xl p-4 shadow-xl shadow-black/40 relative overflow-hidden transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Prize Thumbnail */}
                    <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 overflow-hidden relative shadow-inner">
                      {draw.imageUrl ? (
                        <img
                          src={draw.imageUrl}
                          alt={draw.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Trophy className="w-8 h-8 text-purple-400" />
                      )}
                      <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-md text-[9px] font-black text-amber-300 px-1.5 py-0.5 rounded border border-white/10">
                        {draw.entryPrice} {draw.currency}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-black text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30 uppercase tracking-wider">
                          ⚡ {draw.maxEntries} TICKETS FLASH
                        </span>
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          {draw.remainingTickets} left
                        </span>
                      </div>

                      <h3 className="text-white font-extrabold text-sm leading-snug truncate">
                        {draw.title}
                      </h3>

                      <p className="text-[11px] text-emerald-400 font-bold mt-0.5 truncate">
                        Prize: {draw.prizeTitle}
                      </p>

                      {/* Live Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                          <span>{draw.entriesSold} / {draw.maxEntries} sold</span>
                          <span className="text-purple-400">{draw.percentage}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${Math.min(100, Math.max(6, draw.percentage))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Buy Action Row */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    <Link
                      href={`/telegram/campaigns/${draw.slug}`}
                      className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-0.5"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleFastBuy(draw)}
                      disabled={isFull || isBuying}
                      className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>
                        {isBuying ? "Purchasing..." : isFull ? "Sold Out / Drawing..." : `1-Click Enter (${draw.entryPrice} ETB)`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}

            {draws.length === 0 && !loading && (
              <div className="bg-[#0D1424] border border-slate-800 rounded-3xl p-8 text-center space-y-2">
                <Zap className="w-10 h-10 text-purple-400 mx-auto" />
                <p className="text-sm font-bold text-slate-300">No active instant draws right now</p>
                <p className="text-xs text-slate-500">Check back in a few minutes or enter standard campaigns!</p>
              </div>
            )}
          </div>

          {/* Daily Spin Banner Link */}
          <Link
            href="/telegram/spin"
            className="block p-4 rounded-3xl bg-gradient-to-r from-amber-950/60 via-orange-950/50 to-amber-950/60 border border-amber-500/30 shadow-lg shadow-amber-950/40 group active:scale-[0.99] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span>🎁 Get Free Bonus from Daily Spin</span>
                  </h4>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    1 Free spin every 24h to win free ETB credits!
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

        </div>
      </div>

      {/* Purchase Success Modal */}
      {purchaseSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-gradient-to-b from-[#111A2E] to-[#0A0F1D] border border-emerald-500/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-emerald-500/20 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                ⚡ TICKET CONFIRMED
              </span>
              <h2 className="text-lg font-black text-white mt-2">
                You're in the Draw!
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {purchaseSuccessModal.drawTitle}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Paid {purchaseSuccessModal.totalAmount} ETB from Vault. Winner selected immediately when full!
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/telegram/tickets"
                onClick={() => setPurchaseSuccessModal(null)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
              >
                <Ticket className="w-4 h-4" />
                <span>View My Tickets</span>
              </Link>
              <button
                onClick={() => setPurchaseSuccessModal(null)}
                className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold text-xs transition-colors"
              >
                Keep Playing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
