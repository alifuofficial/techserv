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
  Coins,
  Package,
  ArrowRight,
  CheckCircle2,
  Clock,
  ArrowDownToLine,
  X,
} from "lucide-react";
import { fetchTelegramApi } from "@/lib/telegram-client";

interface WinItem {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignSlug: string;
  campaignImage: string | null;
  ticketNumber: string;
  prizeTitle: string;
  prizeValue: number;
  currency: string;
  wonAt: string;
  claimStatus: "UNCLAIMED" | "CLAIMED_CASH" | "CLAIMED_PHYSICAL";
  claimDetails?: any;
}

export default function WinsPage() {
  const [wins, setWins] = useState<WinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Claim Choice State
  const [claimingWin, setClaimingWin] = useState<WinItem | null>(null);
  const [showPhysicalModal, setShowPhysicalModal] = useState(false);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // Physical Form State
  const [physicalForm, setPhysicalForm] = useState({
    recipientName: "",
    phone: "",
    city: "Addis Ababa",
    address: "",
    notes: "",
  });

  // Success Modal State
  const [claimSuccessModal, setClaimSuccessModal] = useState<{
    type: "CASH" | "PHYSICAL";
    prizeTitle: string;
    amount?: number;
  } | null>(null);

  const loadWins = async () => {
    try {
      const res = await fetchTelegramApi("/api/telegram/wins");
      if (res.ok && res.data.success) {
        setWins(res.data.wins || []);
      } else {
        setError(res.data.error || "Failed to load wins");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load wins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWins();
  }, []);

  // 1. Claim as Cash Equivalent
  const handleClaimCash = async (win: WinItem) => {
    if (isSubmittingClaim) return;

    if (!confirm(`Claim ${win.prizeValue.toLocaleString()} ETB cash equivalent? This will be credited directly to your Wallet Vault for instant withdrawal or playing.`)) {
      return;
    }

    setIsSubmittingClaim(true);
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("heavy");
    }

    try {
      const res = await fetchTelegramApi("/api/telegram/wins/claim", {
        method: "POST",
        body: JSON.stringify({
          drawId: win.id,
          claimType: "CASH",
        }),
      });

      if (!res.ok || !res.data.success) {
        throw new Error(res.data?.error || "Failed to claim cash");
      }

      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred("success");
      }

      setClaimSuccessModal({
        type: "CASH",
        prizeTitle: win.prizeTitle,
        amount: win.prizeValue,
      });

      loadWins();
    } catch (err: any) {
      alert(err.message || "Failed to process claim.");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // 2. Claim as Physical Item Delivery
  const handleClaimPhysical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingWin || isSubmittingClaim) return;

    setIsSubmittingClaim(true);
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("medium");
    }

    try {
      const res = await fetchTelegramApi("/api/telegram/wins/claim", {
        method: "POST",
        body: JSON.stringify({
          drawId: claimingWin.id,
          claimType: "PHYSICAL",
          deliveryDetails: physicalForm,
        }),
      });

      if (!res.ok || !res.data.success) {
        throw new Error(res.data?.error || "Failed to submit delivery request");
      }

      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred("success");
      }

      setShowPhysicalModal(false);
      setClaimSuccessModal({
        type: "PHYSICAL",
        prizeTitle: claimingWin.prizeTitle,
      });

      loadWins();
    } catch (err: any) {
      alert(err.message || "Failed to process delivery claim.");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

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
                {wins.length > 0 ? `🎉 ${wins.length} Prizes Won` : "Prize Claims & History"}
              </p>
            </div>
          </div>

          <Link
            href="/telegram/withdraw"
            className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" /> Withdraw
          </Link>
        </div>

        {/* Hero Stats Card */}
        <div className="mt-4 rounded-3xl p-6 bg-gradient-to-br from-[#2D1F08] via-[#1A1308] to-[#0E0C06] border border-amber-500/40 shadow-2xl shadow-amber-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Winner Rewards Hub
              </span>
              <div className="mt-2">
                <h2 className="text-3xl font-black text-white">{wins.length}</h2>
                <p className="text-xs text-amber-200/80 font-medium mt-0.5">
                  Choose physical delivery or instant cash to wallet!
                </p>
              </div>
            </div>

            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <Trophy className="w-8 h-8 fill-slate-950" />
            </div>
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
                Your lucky moment is right around the corner! Enter ongoing draws or instant flash games to win.
              </p>
              <Link
                href="/telegram/instant"
                className="mt-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black py-3 px-6 rounded-2xl flex items-center gap-2 text-xs active:scale-95 transition-all shadow-lg shadow-purple-500/25"
              >
                <Sparkles className="w-4 h-4" /> Play Instant Mini Draws
              </Link>
            </div>
          ) : (
            wins.map((win) => {
              const isUnclaimed = win.claimStatus === "UNCLAIMED";
              const isClaimedCash = win.claimStatus === "CLAIMED_CASH";
              const isClaimedPhysical = win.claimStatus === "CLAIMED_PHYSICAL";

              return (
                <div
                  key={win.id}
                  className="bg-gradient-to-b from-[#161B2B] to-[#0D1220] border border-amber-500/40 rounded-3xl p-4 shadow-xl shadow-black/40 space-y-4 relative overflow-hidden"
                >
                  <div className="flex gap-3.5">
                    {/* Prize Thumbnail */}
                    <div className="w-20 h-20 bg-slate-900 rounded-2xl shrink-0 overflow-hidden border border-amber-500/40 relative shadow-inner">
                      {win.campaignImage ? (
                        <img
                          src={win.campaignImage}
                          alt={win.campaignTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-500/60 bg-slate-900">
                          <Trophy className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-1 right-1 bg-amber-500 text-slate-900 p-1 rounded-lg shadow-md">
                        <Trophy className="w-3 h-3 fill-slate-900" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                          🏆 GRAND PRIZE
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium font-mono">
                          {new Date(win.wonAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-white font-extrabold text-sm leading-tight truncate">
                        {win.campaignTitle}
                      </h3>

                      <p className="text-amber-300 font-black text-xs mt-0.5 truncate">
                        Prize: {win.prizeTitle}
                      </p>

                      <div className="text-[11px] font-mono text-emerald-400 font-bold mt-1">
                        Value: {win.prizeValue.toLocaleString()} {win.currency}
                      </div>
                    </div>
                  </div>

                  {/* Winning Ticket Info */}
                  <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-white/5 text-xs">
                    <span className="text-slate-400 text-[11px]">Winning Ticket:</span>
                    <span className="font-mono font-black text-emerald-400">{win.ticketNumber}</span>
                  </div>

                  {/* Prize Claim Choice Actions */}
                  {isUnclaimed ? (
                    <div className="bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-amber-950/40 border border-amber-500/30 p-3.5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase">
                        <Gift className="w-4 h-4" /> How would you like to receive your prize?
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Option 1: Cash to Wallet */}
                        <button
                          onClick={() => handleClaimCash(win)}
                          disabled={isSubmittingClaim}
                          className="py-3 px-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase flex flex-col items-center justify-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Coins className="w-4 h-4 fill-slate-950" />
                          <span>💵 Cash to Wallet</span>
                          <span className="text-[9px] font-mono opacity-90">({win.prizeValue.toLocaleString()} ETB)</span>
                        </button>

                        {/* Option 2: Physical Delivery */}
                        <button
                          onClick={() => {
                            setClaimingWin(win);
                            setShowPhysicalModal(true);
                          }}
                          disabled={isSubmittingClaim}
                          className="py-3 px-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-black text-xs uppercase flex flex-col items-center justify-center gap-1 active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Package className="w-4 h-4 text-amber-400" />
                          <span>📦 Physical Delivery</span>
                          <span className="text-[9px] text-slate-400">Doorstep / Pickup</span>
                        </button>
                      </div>
                    </div>
                  ) : isClaimedCash ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div>💵 Claimed as Cash Equivalent</div>
                          <div className="text-[10px] text-emerald-400/80 font-normal">
                            +{win.prizeValue.toLocaleString()} ETB credited to your Wallet Vault.
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/telegram/withdraw"
                        className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] uppercase rounded-xl shadow-sm shrink-0 transition-colors"
                      >
                        Withdraw
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-2xl flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-purple-300 font-bold">
                        <Package className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <div>📦 Physical Delivery Requested</div>
                          <div className="text-[10px] text-purple-300/80 font-normal">
                            Address: {win.claimDetails?.deliveryDetails?.city || "Addis Ababa"} • Status: {win.claimDetails?.status || "Pending Dispatch"}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                        Processing
                      </span>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Provably Fair Badge */}
        <div className="p-4 bg-gradient-to-r from-slate-900/60 to-slate-950/80 rounded-2xl border border-white/5 text-center space-y-1 mt-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <ShieldCheck className="w-4 h-4" /> Cryptographically Guaranteed Wins
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            All winning draws are audited and certified using provably fair SHA-256 blockchain-grade RNG seeds.
          </p>
        </div>

      </div>

      {/* 3. Physical Item Delivery Address Form Modal */}
      {showPhysicalModal && claimingWin && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-gradient-to-b from-[#111A2E] to-[#0A0F1D] border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl shadow-black/80 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white">Physical Prize Delivery</h3>
              </div>
              <button
                onClick={() => setShowPhysicalModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide your delivery contact details for <span className="font-bold text-amber-400">{claimingWin.prizeTitle}</span>:
            </p>

            <form onSubmit={handleClaimPhysical} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={physicalForm.recipientName}
                  onChange={(e) => setPhysicalForm({ ...physicalForm, recipientName: e.target.value })}
                  placeholder="Recipient full name"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={physicalForm.phone}
                  onChange={(e) => setPhysicalForm({ ...physicalForm, phone: e.target.value })}
                  placeholder="0911..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">City / Region *</label>
                <input
                  type="text"
                  required
                  value={physicalForm.city}
                  onChange={(e) => setPhysicalForm({ ...physicalForm, city: e.target.value })}
                  placeholder="e.g. Addis Ababa"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Detailed Street Address / Landmark *</label>
                <textarea
                  required
                  rows={2}
                  value={physicalForm.address}
                  onChange={(e) => setPhysicalForm({ ...physicalForm, address: e.target.value })}
                  placeholder="Subcity, Woreda, Landmark"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPhysicalModal(false)}
                  className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClaim}
                  className="py-2.5 px-5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 rounded-xl font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  {isSubmittingClaim ? "Submitting..." : "Confirm Delivery Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Claim Success Modal */}
      {claimSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-gradient-to-b from-[#111A2E] to-[#0A0F1D] border border-emerald-500/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-emerald-500/20 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <PartyPopper className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                🎉 PRIZE CLAIMED!
              </span>
              <h2 className="text-lg font-black text-white mt-2">
                {claimSuccessModal.type === "CASH" ? "Cash Credited to Wallet!" : "Delivery Order Confirmed!"}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {claimSuccessModal.prizeTitle}
              </p>
              {claimSuccessModal.type === "CASH" ? (
                <p className="text-[11px] text-emerald-400 mt-1 font-bold">
                  +{claimSuccessModal.amount?.toLocaleString()} ETB is now in your Vault. You can withdraw anytime!
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  Our fulfillment team will contact you to dispatch your item.
                </p>
              )}
            </div>

            <div className="pt-2 space-y-2">
              {claimSuccessModal.type === "CASH" && (
                <Link
                  href="/telegram/withdraw"
                  onClick={() => setClaimSuccessModal(null)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Withdraw Cash to Bank / Telebirr</span>
                </Link>
              )}
              <button
                onClick={() => setClaimSuccessModal(null)}
                className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold text-xs transition-colors"
              >
                Close & View Vault
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
