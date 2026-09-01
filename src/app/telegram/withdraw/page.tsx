"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ArrowDownToLine,
  AlertCircle,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Phone,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Loader2,
  Gift,
  HelpCircle,
  Info,
} from "lucide-react";
import { fetchTelegramApi } from "@/lib/telegram-client";

interface WithdrawalItem {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  accountNumber: string;
  accountName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  adminTxId?: string | null;
  rejectionReason?: string | null;
}

export default function WithdrawPage() {
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [withdrawableBalance, setWithdrawableBalance] = useState<number>(0);
  const [bonusCredits, setBonusCredits] = useState<number>(0);
  const [currency, setCurrency] = useState("ETB");
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [provider, setProvider] = useState<"TELEBIRR" | "CBE" | "AWASH" | "BOA">("TELEBIRR");
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchTelegramApi("/api/telegram/withdraw");
      if (res.ok && res.data.success) {
        setTotalBalance(res.data.totalBalance || 0);
        setWithdrawableBalance(res.data.withdrawableBalance || 0);
        setBonusCredits(res.data.bonusCredits || 0);
        setCurrency(res.data.currency || "ETB");
        setWithdrawals(res.data.withdrawals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount < 100) {
      setError("Minimum withdrawal amount is 100 ETB.");
      return;
    }

    if (parsedAmount > withdrawableBalance) {
      if (bonusCredits > 0) {
        setError(
          `Insufficient withdrawable balance. You have ${withdrawableBalance.toFixed(
            2
          )} ETB withdrawable. Your ${bonusCredits.toFixed(
            2
          )} ETB in Daily Spin / Referral bonus credits must be used in games to win withdrawable cash.`
        );
      } else {
        setError(`Insufficient balance. You have ${withdrawableBalance.toFixed(2)} ETB available to withdraw.`);
      }
      return;
    }

    if (!accountName.trim()) {
      setError("Please enter the account holder's full name.");
      return;
    }

    if (!accountNumber.trim()) {
      setError("Please enter your account number or phone number.");
      return;
    }

    setSubmitting(true);

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("medium");
    }

    try {
      const res = await fetchTelegramApi("/api/telegram/withdraw", {
        method: "POST",
        body: JSON.stringify({
          amount: parsedAmount,
          provider,
          accountName: accountName.trim(),
          accountNumber: accountNumber.trim(),
        }),
      });

      if (!res.ok || !res.data.success) {
        throw new Error(res.data?.error || "Withdrawal request failed");
      }

      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred("success");
      }

      setSuccessMessage(res.data.message || "Withdrawal request submitted successfully!");
      setAmount("");
      setAccountName("");
      setAccountNumber("");
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to submit withdrawal.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAmount = (val: number) => {
    setAmount(Math.min(withdrawableBalance, val).toString());
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-white pb-24 selection:bg-emerald-500/30">
      
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-80 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-16 -left-16 w-60 h-60 bg-emerald-500/15 rounded-full blur-[80px]"></div>
        <div className="absolute top-10 -right-16 w-60 h-60 bg-purple-600/10 rounded-full blur-[80px]"></div>
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
              <h1 className="text-xl font-extrabold text-white leading-tight">Withdraw Funds</h1>
              <p className="text-xs text-slate-400 font-medium">Transfer to Telebirr & Banks</p>
            </div>
          </div>
        </div>

        {/* Available Balance Hero Card */}
        <div className="mt-4 rounded-3xl p-6 bg-gradient-to-br from-[#0D1826] via-[#09111C] to-[#060B12] border border-emerald-500/30 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
          <div className="text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <Wallet className="w-3.5 h-3.5" /> Withdrawable Cash Balance
            </div>
            <div className="flex items-baseline justify-center gap-1.5 mt-1">
              <span className="text-4xl font-black font-mono text-white tracking-tight">
                {withdrawableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-emerald-400 font-bold text-base">{currency}</span>
            </div>

            {/* Virtual Bonus Credits Info Chip */}
            {bonusCredits > 0 && (
              <div className="mt-4 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-left gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-300">
                      {bonusCredits.toFixed(2)} ETB Play-Only Bonus
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Earned from Daily Spin & Referrals. Play draws to convert into real cash!
                    </p>
                  </div>
                </div>
                <Link
                  href="/telegram/instant"
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-[10px] font-black uppercase shrink-0 transition-colors"
                >
                  Play
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal Form Card */}
        <div className="bg-[#0E1526] border border-slate-800 rounded-3xl p-5 mt-4 space-y-4 shadow-xl">
          <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" /> Request Payout
          </h2>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4">
            
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Select Payout Channel</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProvider("TELEBIRR")}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    provider === "TELEBIRR"
                      ? "bg-emerald-500/15 border-emerald-500 text-white font-bold"
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold leading-tight">Telebirr</div>
                    <div className="text-[10px] text-slate-400">Mobile Money</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider("CBE")}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    provider === "CBE"
                      ? "bg-purple-500/15 border-purple-500 text-white font-bold"
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold leading-tight">CBE Birr / Bank</div>
                    <div className="text-[10px] text-slate-400">Commercial Bank</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider("AWASH")}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    provider === "AWASH"
                      ? "bg-blue-500/15 border-blue-500 text-white font-bold"
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold leading-tight">Awash Bank</div>
                    <div className="text-[10px] text-slate-400">Direct Bank</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider("BOA")}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    provider === "BOA"
                      ? "bg-amber-500/15 border-amber-500 text-white font-bold"
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold leading-tight">Abyssinia</div>
                    <div className="text-[10px] text-slate-400">BOA Account</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-400">Withdraw Amount (ETB)</label>
                <span className="text-[10px] text-slate-500">Min: 100 ETB</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max={withdrawableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-[#080B14] border border-slate-700 rounded-2xl px-4 py-3.5 text-white text-base font-bold font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  ETB
                </span>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex gap-2 mt-2">
                {[100, 500, 1000, 2000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-bold text-slate-300 font-mono transition-colors"
                  >
                    {val}
                  </button>
                ))}
                {withdrawableBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(Math.floor(withdrawableBalance).toString())}
                    className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[11px] font-bold font-mono transition-colors"
                  >
                    MAX
                  </button>
                )}
              </div>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                Account Holder Full Name *
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Name as registered on account"
                className="w-full bg-[#080B14] border border-slate-700 rounded-2xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Account Number / Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                {provider === "TELEBIRR" ? "Telebirr Phone Number *" : "Bank Account Number *"}
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={provider === "TELEBIRR" ? "0911..." : "1000..."}
                className="w-full bg-[#080B14] border border-slate-700 rounded-2xl px-4 py-3 text-white text-xs font-bold font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || withdrawableBalance < 100}
              className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4 fill-slate-950" />
                  <span>Request Withdrawal</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Recent Withdrawal History */}
        <div className="bg-[#0E1526] border border-slate-800 rounded-3xl p-5 mt-5 space-y-3.5 shadow-xl">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" /> Withdrawal History
          </h3>

          <div className="space-y-2.5">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black text-white font-mono">
                      -{w.amount.toLocaleString()} {w.currency}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.2 rounded">
                      {w.provider}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    To: {w.accountNumber} ({w.accountName})
                  </div>
                  {w.rejectionReason && (
                    <div className="text-[10px] text-red-400 mt-1">
                      Reason: {w.rejectionReason} (Refunded to wallet)
                    </div>
                  )}
                  {w.adminTxId && (
                    <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">
                      Tx: {w.adminTxId}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  {w.status === "PENDING" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Clock className="w-2.5 h-2.5" /> Pending
                    </span>
                  )}
                  {w.status === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Paid
                    </span>
                  )}
                  {w.status === "REJECTED" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                      <XCircle className="w-2.5 h-2.5" /> Rejected
                    </span>
                  )}
                  <div className="text-[9px] text-slate-500 mt-1 font-mono">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}

            {withdrawals.length === 0 && !loading && (
              <p className="text-xs text-slate-500 text-center py-4">No past withdrawal requests.</p>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-4 px-4">
          Withdrawals are verified and processed within 24 hours. Minimum payout is 100 ETB.
        </p>

      </div>
    </div>
  );
}
