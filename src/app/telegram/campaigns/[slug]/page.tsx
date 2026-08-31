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
  Upload,
  AlertTriangle,
  X,
  Flame,
  Zap,
  TrendingUp,
  Copy,
  Check,
  Crown,
  Lock,
  MessageCircle,
} from "lucide-react";
import { fetchTelegramApi } from "@/lib/telegram-client";

export default function TelegramCampaignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [campaign, setCampaign] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [provider, setProvider] = useState<string>("WALLET");
  const [txId, setTxId] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<{ tickets?: string[]; message?: string; pending?: boolean } | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState<{
    methods?: Array<{
      id: string;
      name: string;
      shortCode: string;
      accountName: string;
      accountNumber: string;
      instructions: string;
      color: string;
    }>;
    telebirr: { accountNumber: string; accountName: string; instructions: string };
    cbe: { accountNumber: string; accountName: string; instructions: string };
  }>({
    telebirr: { accountNumber: "0911000000", accountName: "MilkyTech Online", instructions: "Transfer and upload receipt" },
    cbe: { accountNumber: "1000123456789", accountName: "MilkyTech PLC", instructions: "Transfer and upload receipt" },
  });

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
        if (res.data.paymentSettings) {
          setPaymentSettings(res.data.paymentSettings);
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

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const unitPrice = Number(campaign?.ticketPrice) || 0;
  const currentQuantity = Math.max(1, Number(quantity) || 1);
  const totalPrice = unitPrice * currentQuantity;
  const userBalance = Number(user?.balance) || 0;
  const canAffordWithWallet = userBalance >= totalPrice;
  const deficitAmount = Math.max(0, totalPrice - userBalance);

  const currentMethod =
    provider !== "WALLET"
      ? (paymentSettings.methods || []).find((m) => m.id === provider || m.name === provider) || {
          accountNumber: provider.includes("CBE") ? paymentSettings.cbe.accountNumber : paymentSettings.telebirr.accountNumber,
          accountName: provider.includes("CBE") ? paymentSettings.cbe.accountName : paymentSettings.telebirr.accountName,
          instructions: provider.includes("CBE") ? paymentSettings.cbe.instructions : paymentSettings.telebirr.instructions,
        }
      : null;

  const handleBuy = async () => {
    if (!campaign || campaign.isCompleted) return;
    setError("");

    if (provider !== "WALLET") {
      if (!txId.trim()) {
        setError("Please enter your Transaction ID (TxID).");
        return;
      }
      if (!screenshot) {
        setError("Please upload a screenshot of your payment receipt.");
        return;
      }
    } else {
      if (!canAffordWithWallet) {
        setError(`Insufficient wallet balance. You need ${deficitAmount.toFixed(2)} ETB more to buy ${currentQuantity} ticket(s).`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await fetchTelegramApi("/api/telegram/checkout", {
        method: "POST",
        body: JSON.stringify({
          campaignId: campaign.id,
          quantity: currentQuantity,
          provider,
          txId: txId.trim() || undefined,
          screenshot: screenshot || undefined,
          senderName: senderName.trim() || undefined,
        }),
      });

      if (res.ok && res.data.success) {
        if (typeof res.data.newBalance === "number") {
          setUser((prev: any) => (prev ? { ...prev, balance: res.data.newBalance } : prev));
        } else if (provider === "WALLET") {
          setUser((prev: any) => (prev ? { ...prev, balance: Math.max(0, prev.balance - totalPrice) } : prev));
        }
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
      <div className="min-h-screen bg-[#070A11] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse shadow-lg shadow-emerald-500/20">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Loading prize draw...</span>
        </div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-[#070A11] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black mb-2">Draw Not Found</h2>
        <p className="text-slate-400 text-xs mb-6">{error}</p>
        <Link
          href="/telegram"
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl text-xs"
        >
          Return to Mini App
        </Link>
      </div>
    );
  }

  if (successData) {
    return (
      <div className="min-h-screen bg-[#070A11] text-white p-5 flex flex-col justify-center items-center relative overflow-hidden">
        {/* Background celebration glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center mb-5 text-slate-950 shadow-2xl shadow-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 mb-2">
          {successData.pending ? "VERIFICATION PENDING" : "ENTRIES CONFIRMED"}
        </span>

        <h1 className="text-2xl font-black text-white text-center mb-2">
          {successData.pending ? "Deposit Submitted!" : "You're In The Live Draw!"}
        </h1>

        <p className="text-slate-400 text-xs text-center mb-6 max-w-xs leading-relaxed">
          {successData.message || "Your lucky tickets have been registered for this grand prize draw."}
        </p>

        {successData.tickets && successData.tickets.length > 0 && (
          <div className="w-full bg-[#0E1526] border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mb-3 text-center flex items-center justify-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-cyan-400" />
              <span>Your Registered Ticket Numbers</span>
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto">
              {successData.tickets.map((t) => (
                <span
                  key={t}
                  className="bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-black px-3 py-1.5 rounded-xl text-xs shadow-sm"
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
            className="w-full bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
          >
            <Ticket className="w-4 h-4 fill-slate-950 text-emerald-400" /> View in My Tickets
          </Link>
          <Link
            href="/telegram"
            className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-sm border border-white/10 active:scale-95 transition-all text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = campaign?.isCompleted || campaign?.status === "COMPLETED";
  const winner = campaign?.winner;
  const completionPercentage = Math.min(100, Math.max(8, Math.round((campaign.entriesCount / (campaign.maxEntries || 1)) * 100)));

  return (
    <div className="pb-36 min-h-screen bg-[#070A11] text-white overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* Ambient background lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-80 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-[80px]"></div>
        <div className="absolute top-10 -left-16 w-64 h-64 bg-indigo-600/15 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 px-5">
        
        {/* Sticky Header */}
        <div className="pt-12 pb-3 flex items-center justify-between sticky top-0 bg-[#070A11]/85 backdrop-blur-xl z-20 border-b border-white/5">
          <Link
            href="/telegram"
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          
          {isCompleted ? (
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-full">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                DRAW COMPLETED
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                LIVE GRAND DRAW
              </span>
            </div>
          )}
        </div>

        {/* Hero Prize Showcase Card */}
        <div className={`mt-3 bg-gradient-to-b ${
          isCompleted ? "from-[#1E160A] to-[#0D0F1A] border-amber-500/40" : "from-[#111A2E] to-[#0A0F1D] border-slate-800/80"
        } border rounded-3xl p-4 shadow-2xl relative overflow-hidden`}>
          <div className="w-full h-56 bg-slate-900 rounded-2xl overflow-hidden border border-white/10 relative shadow-inner">
            {campaign.image ? (
              <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                <Trophy className="w-16 h-16 mb-2 text-amber-400/50" />
                <span className="text-xs font-black uppercase tracking-widest text-amber-400/70">Grand Prize</span>
              </div>
            )}

            {/* Price Chip or Completed Chip */}
            {isCompleted ? (
              <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 fill-slate-950" />
                <span>WINNER SELECTED</span>
              </div>
            ) : (
              <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-md flex items-center gap-1">
                <span className="text-emerald-400 font-black text-sm">{unitPrice}</span>
                <span className="text-xs font-bold text-white">{campaign.currency || "ETB"}</span>
                <span className="text-[10px] text-slate-400 font-medium ml-0.5">/ ticket</span>
              </div>
            )}

            {/* Draw Date Badge */}
            <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-md flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isCompleted ? "Draw Finished" : `Ends ${new Date(campaign.drawDate).toLocaleDateString()}`}</span>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-black text-white leading-tight">{campaign.title}</h1>
            <p className="text-xs text-amber-300/90 font-bold mt-1">
              Prize: {campaign.prizeTitle}
            </p>
          </div>
        </div>

        {/* COMPLETED DRAW: WINNER CELEBRATION SHOWCASE */}
        {isCompleted ? (
          <div className="mt-4 space-y-4">
            
            {/* Winner Spotlight Card */}
            <div className="bg-gradient-to-br from-[#2D1F08] via-[#1A1408] to-[#0C0F1A] border border-amber-500/50 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> OFFICIAL WINNER
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {winner?.wonAt ? new Date(winner.wonAt).toLocaleDateString() : "Draw Completed"}
                </span>
              </div>

              {/* Winner Header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/30 shrink-0">
                  <Crown className="w-8 h-8 fill-slate-950" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-amber-200/80 block">Grand Prize Winner:</span>
                  <h2 className="text-lg font-black text-white truncate">
                    {winner?.name || "Lucky Winner"}
                  </h2>
                  <p className="text-xs text-emerald-400 font-bold mt-0.5">
                    Won: {campaign.prizeTitle}
                  </p>
                </div>
              </div>

              {/* Winning Ticket Code Stub */}
              <div className="mt-4 p-3 bg-[#080B14] rounded-2xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Winning Lucky Ticket
                  </span>
                  <span className="font-mono text-sm font-black text-emerald-400">
                    {winner?.ticketNumber || "TKT-WINNER"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(winner?.ticketNumber || "")}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Copy Ticket"
                >
                  {copiedTicket ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Provably Fair Certification Proof */}
              <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Draw Verification:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Provably Fair
                  </span>
                </div>
                {winner?.snapshotHash && (
                  <div className="text-[10px] font-mono text-slate-500 truncate" title={winner.snapshotHash}>
                    Hash: {winner.snapshotHash.substring(0, 24)}...
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Closed Notice */}
            <div className="bg-[#0E1526] border border-slate-800 rounded-3xl p-5 text-center space-y-3">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">This Prize Draw Is Concluded</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Tickets for this campaign are closed. Explore our active live draws to join the next prize raffle!
              </p>
              <Link
                href="/telegram/campaigns"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" /> Explore Other Live Draws
              </Link>
            </div>

          </div>
        ) : (
          /* ACTIVE DRAW: BUY TICKETS FORM */
          <>
            {/* Gamified Winning Odds Multiplier Booster */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-indigo-950/80 border border-indigo-500/30 shadow-xl shadow-indigo-950/30 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-white">Win Probability Multiplier</h3>
                  <span className="text-[9px] font-black bg-indigo-500 text-white px-1.5 py-0.2 rounded-full uppercase">
                    {currentQuantity}x Odds
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200/90 leading-snug mt-0.5">
                  Buying <b>{currentQuantity} ticket{currentQuantity > 1 ? "s" : ""}</b> gives you <b>{currentQuantity} unique numbers</b> in the live random draw!
                </p>
              </div>
            </div>

            {/* Quantity Selector Card */}
            <div className="mt-4 bg-[#0E1526] border border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Ticket Quantity
                </label>
                <span className="text-xs font-bold text-emerald-400">
                  {unitPrice} {campaign.currency || "ETB"} each
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all text-base"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-14 text-center text-2xl font-black text-white font-mono">
                    {currentQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all text-base"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Preset Badges */}
                <div className="flex gap-1.5">
                  {[1, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantity(num)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        currentQuantity === num
                          ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black shadow-md shadow-emerald-500/20 scale-105"
                          : "bg-white/5 text-slate-400 border border-white/10 hover:text-white"
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Automatic Total Calculation Box */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-[#0A161E] to-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Total Price ({currentQuantity} Tickets)
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {totalPrice.toFixed(2)} {campaign.currency || "ETB"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1 rounded-xl border border-emerald-500/30">
                    {currentQuantity} Chance{currentQuantity > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Low Balance Alert */}
            {provider === "WALLET" && !canAffordWithWallet && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-3xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Wallet Balance Low
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Balance: <strong className="text-white">{userBalance.toFixed(2)} ETB</strong>. You need{" "}
                      <strong className="text-amber-400">{deficitAmount.toFixed(2)} ETB</strong> more.
                    </p>
                  </div>
                </div>
                <Link
                  href={`/telegram/deposit?amount=${Math.ceil(deficitAmount)}`}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
                >
                  <Wallet className="w-4 h-4" /> Deposit {Math.ceil(deficitAmount)} ETB to Wallet
                </Link>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="mt-4 bg-[#0E1526] border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Select Payment Method
              </label>

              {/* Option 1: MilkyTech Wallet */}
              <button
                type="button"
                onClick={() => setProvider("WALLET")}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  provider === "WALLET"
                    ? "bg-emerald-500/15 border-emerald-500/60 text-white ring-2 ring-emerald-500/20"
                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">MilkyTech Vault</p>
                    <p className="text-xs text-slate-400">Balance: {userBalance.toFixed(2)} ETB</p>
                  </div>
                </div>
                {canAffordWithWallet ? (
                  <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Instant
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full border border-red-500/30">
                    Low Balance
                  </span>
                )}
              </button>

              {/* Dynamic Bank / Payment Options */}
              {(paymentSettings.methods && paymentSettings.methods.length > 0 ? paymentSettings.methods : [
                {
                  id: "telebirr",
                  name: "Telebirr Direct",
                  shortCode: "TB",
                  accountNumber: paymentSettings.telebirr.accountNumber,
                  accountName: paymentSettings.telebirr.accountName,
                  instructions: paymentSettings.telebirr.instructions,
                  color: "blue",
                },
                {
                  id: "cbe",
                  name: "CBE Birr Transfer",
                  shortCode: "CBE",
                  accountNumber: paymentSettings.cbe.accountNumber,
                  accountName: paymentSettings.cbe.accountName,
                  instructions: paymentSettings.cbe.instructions,
                  color: "purple",
                },
              ]).map((m) => {
                const isSelected = provider === m.id || provider === m.name;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setProvider(m.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-blue-500/15 border-blue-500/60 text-white ring-2 ring-blue-500/20"
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 text-white flex items-center justify-center font-black text-xs uppercase">
                        {m.shortCode || "PAY"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{m.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{m.accountNumber}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Receipt Upload</span>
                  </button>
                );
              })}

              {/* Manual Payment Details & Upload */}
              {provider !== "WALLET" && currentMethod && (
                <div className="pt-3 space-y-3 border-t border-slate-800 mt-3">
                  <div className="p-3.5 bg-[#070A11] rounded-2xl border border-white/5 text-xs text-slate-300 space-y-1">
                    <div>
                      Transfer <b>{totalPrice.toFixed(2)} ETB</b> to{" "}
                      <b className="text-emerald-400 font-mono">{currentMethod.accountNumber}</b>{" "}
                      ({currentMethod.accountName}).
                    </div>
                    <p className="text-[11px] text-slate-400">{currentMethod.instructions}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Transaction ID (TxID) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      placeholder="e.g. 7ED8912... or CBE-REF"
                      className="w-full bg-[#070A11] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Sender Name / Phone (Optional)
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Abebe / 0911..."
                      className="w-full bg-[#070A11] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Payment Receipt Screenshot <span className="text-red-400">*</span>
                    </label>
                    {screenshot ? (
                      <div className="relative w-full h-40 bg-slate-900 rounded-2xl overflow-hidden border border-emerald-500/50">
                        <img src={screenshot} alt="Receipt" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setScreenshot("")}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#070A11]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Upload className="w-6 h-6 text-emerald-400 mb-1" />
                        <span className="text-xs text-slate-300 font-bold">Upload Screenshot Receipt</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG up to 5MB</span>
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error notification */}
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </>
        )}

        {/* Campaign Description & Provably Fair Rules */}
        {campaign.description && (
          <div className="mt-4 bg-[#0E1526] border border-slate-800/80 rounded-3xl p-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Draw Rules & Details
            </h3>
            <div
              className="text-slate-400 text-xs leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: campaign.description }}
            />
          </div>
        )}

        {/* Security badge */}
        <div className="p-4 bg-gradient-to-r from-slate-900/60 to-slate-950/80 rounded-2xl border border-white/5 text-center space-y-1 mt-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Provably Fair Random Selection
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Every ticket number is committed cryptographically with instant Telegram notification.
          </p>
        </div>

      </div>

      {/* Floating Bottom Action Bar (Only on Active campaigns) */}
      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#070A11]/95 backdrop-blur-xl border-t border-white/5 z-30 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total ({currentQuantity}x Tickets)
              </span>
              <p className="text-xl font-black text-emerald-400 leading-tight">
                {totalPrice.toFixed(2)} {campaign.currency || "ETB"}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              <span>{currentQuantity}x Chance</span>
            </div>
          </div>

          {provider === "WALLET" && !canAffordWithWallet ? (
            <Link
              href={`/telegram/deposit?amount=${Math.ceil(deficitAmount)}`}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 active:scale-95 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl shadow-amber-500/25 transition-all text-center"
            >
              <Wallet className="w-4 h-4 fill-slate-950" /> Deposit {Math.ceil(deficitAmount)} ETB to Buy
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleBuy}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl shadow-emerald-500/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Entries...</span>
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4 fill-slate-950" />
                  <span>Get {currentQuantity} Lucky Ticket{currentQuantity > 1 ? "s" : ""}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
