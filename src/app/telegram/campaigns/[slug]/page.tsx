"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Trophy,
  Ticket,
  Wallet,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import { fetchTelegramApi } from "@/lib/telegram-client";

export default function TelegramCampaignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [campaign, setCampaign] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [provider, setProvider] = useState<"WALLET" | "MANUAL_TELEBIRR" | "MANUAL_CBE">("WALLET");
  const [txId, setTxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<{ tickets?: string[]; message?: string; pending?: boolean } | null>(null);

  useEffect(() => {
    fetchCampaign();
  }, [slug]);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const res = await fetchTelegramApi(`/api/telegram/campaigns/${slug}`);
      if (res.ok && res.data.success) {
        setCampaign(res.data.campaign);
        setUser(res.data.user);
        if (res.data.user && res.data.user.balance < (res.data.campaign.entryPrice || 0)) {
          setProvider("MANUAL_TELEBIRR");
        }
      } else {
        setError(res.data.error || "Campaign not found");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!campaign) return;
    setError("");

    if (provider !== "WALLET" && !txId.trim()) {
      setError("Please enter your Transaction ID.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetchTelegramApi("/api/telegram/checkout", {
        method: "POST",
        body: JSON.stringify({
          campaignId: campaign.id,
          quantity,
          provider,
          txId: txId.trim() || undefined,
        }),
      });

      if (res.ok && res.data.success) {
        setSuccessData({
          tickets: res.data.tickets,
          message: res.data.message,
          pending: res.data.pending,
        });
      } else {
        setError(res.data.error || "Purchase failed. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError("An unexpected error occurred during purchase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 animate-pulse">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading campaign...</span>
        </div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Campaign Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <Link href="/telegram" className="bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-sm">
          Back to Mini App
        </Link>
      </div>
    );
  }

  const totalPrice = (campaign?.entryPrice || 0) * quantity;
  const userBalance = user?.balance || 0;
  const canAffordWithWallet = userBalance >= totalPrice;

  if (successData) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white p-5 flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 text-emerald-400 shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-black text-white text-center mb-2">
          {successData.pending ? "Deposit Submitted!" : "Tickets Purchased!"}
        </h1>

        <p className="text-slate-400 text-sm text-center mb-6 max-w-xs">
          {successData.message || "Your tickets have been registered for this draw."}
        </p>

        {successData.tickets && successData.tickets.length > 0 && (
          <div className="w-full bg-[#121826] border border-slate-800/80 rounded-2xl p-4 mb-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 text-center">
              Your Lucky Ticket Numbers
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {successData.tickets.map((t) => (
                <span
                  key={t}
                  className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold px-3 py-1 rounded-lg text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="w-full space-y-3">
          <Link
            href="/telegram/tickets"
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20 transition-transform"
          >
            <Ticket className="w-4 h-4" /> View My Tickets
          </Link>
          <Link
            href="/telegram"
            className="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-transform text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 px-5 min-h-screen bg-[#0B0F19] text-white">
      {/* Top Bar */}
      <div className="pt-14 pb-4 flex items-center justify-between sticky top-0 bg-[#0B0F19]/90 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center active:scale-95 transition-transform">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          LIVE DRAW
        </span>
      </div>

      {/* Hero Image */}
      <div className="w-full h-56 bg-slate-800 rounded-3xl overflow-hidden border border-white/5 relative mt-2 shadow-xl">
        {campaign.image ? (
          <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
            <Trophy className="w-16 h-16 opacity-30 mb-2 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400/60">MilkyTech Draws</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-[#0B0F19]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs font-semibold text-white">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ends {new Date(campaign.drawDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="mt-5 space-y-4">
        <div>
          <h1 className="text-2xl font-black text-white leading-tight">{campaign.title}</h1>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-400">{campaign.ticketPrice}</span>
            <span className="text-sm font-bold text-emerald-200">{campaign.currency || "ETB"}</span>
            <span className="text-xs text-slate-400 font-medium ml-1">/ ticket</span>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-[#121826] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Entries Sold</span>
            <span className="text-white font-bold">{campaign.entriesCount} / {campaign.maxEntries}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{ width: `${Math.min(100, Math.max(3, (campaign.entriesCount / (campaign.maxEntries || 1)) * 100))}%` }}
            ></div>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="bg-[#121826] border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Number of Tickets
          </label>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-xl font-black text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(campaign.maxEntries - campaign.entriesCount, q + 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-1.5">
              {[1, 2, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    quantity === num
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700/60"
                  }`}
                >
                  +{num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-[#121826] border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Payment Method
          </label>

          {/* Wallet Option */}
          <button
            type="button"
            onClick={() => setProvider("WALLET")}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              provider === "WALLET"
                ? "bg-emerald-500/15 border-emerald-500/50 text-white"
                : "bg-slate-800/40 border-slate-700/60 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Wallet Balance</p>
                <p className="text-xs text-slate-400">Available: {userBalance.toFixed(2)} ETB</p>
              </div>
            </div>
            {canAffordWithWallet ? (
              <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Ready
              </span>
            ) : (
              <Link
                href="/telegram/deposit"
                className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30"
              >
                Top up
              </Link>
            )}
          </button>

          {/* Telebirr Manual Option */}
          <button
            type="button"
            onClick={() => setProvider("MANUAL_TELEBIRR")}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              provider === "MANUAL_TELEBIRR"
                ? "bg-emerald-500/15 border-emerald-500/50 text-white"
                : "bg-slate-800/40 border-slate-700/60 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center font-black text-emerald-600 text-[10px]">
                TELE
              </div>
              <div>
                <p className="text-sm font-bold text-white">Telebirr (Manual)</p>
                <p className="text-xs text-slate-400">Pay to 0911000000</p>
              </div>
            </div>
            <span className="text-xs text-slate-500">TxID verification</span>
          </button>

          {/* If manual Telebirr, show TxID input */}
          {provider !== "WALLET" && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Telebirr Transaction ID (TxID)
              </label>
              <input
                type="text"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder="e.g. 7ED8912..."
                className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 uppercase font-mono"
              />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Description / Rules */}
        {campaign.description && (
          <div className="bg-[#121826] border border-slate-800/80 rounded-2xl p-4 mt-4">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Details & Rules
            </h3>
            <div
              className="text-slate-300 text-xs leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: campaign.description }}
            />
          </div>
        )}
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-white/5 z-20 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs text-slate-400">Total Price ({quantity}x)</span>
            <p className="text-xl font-black text-white">{totalPrice.toFixed(2)} ETB</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Fair Draw Guaranteed</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBuy}
          disabled={isSubmitting || (provider === "WALLET" && !canAffordWithWallet)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-base shadow-xl shadow-emerald-500/25 transition-all"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : provider === "WALLET" && !canAffordWithWallet ? (
            "Insufficient Wallet Balance"
          ) : (
            <>
              <Ticket className="w-5 h-5" /> Buy {quantity} Ticket{quantity > 1 ? "s" : ""} Now
            </>
          )}
        </button>
      </div>
    </div>
  );
}
