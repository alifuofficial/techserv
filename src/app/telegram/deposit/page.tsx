"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Upload, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTelegramApi } from "@/lib/telegram-client";

function DepositForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [amount, setAmount] = useState(searchParams.get("amount") || "");
  const [provider, setProvider] = useState<"TELEBIRR" | "CBE">("TELEBIRR");
  const [txId, setTxId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const amt = searchParams.get("amount");
    if (amt && !amount) {
      setAmount(amt);
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDeposit = async () => {
    if (!amount || Number(amount) < 50) {
      setError("Minimum deposit is 50 ETB.");
      return;
    }
    if (!txId.trim()) {
      setError("Transaction ID (TxID) is required.");
      return;
    }
    if (!screenshot) {
      setError("Payment receipt screenshot is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetchTelegramApi("/api/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          provider,
          txId: txId.trim(),
          senderName: senderName.trim() || undefined,
          screenshot,
        }),
      });

      if (res.ok && res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/telegram");
        }, 2500);
      } else {
        setError(res.data.error || "Deposit failed. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while submitting deposit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="pb-24 px-5 min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Deposit Submitted!</h1>
        <p className="text-slate-400 text-sm text-center mb-8 max-w-xs">
          Your payment receipt has been received and is being verified. Your wallet will be credited shortly.
        </p>
        <Link href="/telegram" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-8 rounded-xl text-sm shadow-lg shadow-emerald-500/20">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 px-5 min-h-screen bg-[#0B0F19] text-white">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/90 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center active:scale-95 transition-transform">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Deposit Funds</h1>
      </div>

      {/* Payment Provider Selector */}
      <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-5 mt-2 space-y-3">
        <h2 className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Select Payment Method</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setProvider("TELEBIRR")}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              provider === "TELEBIRR"
                ? "border-emerald-500 bg-emerald-500/15 text-white ring-2 ring-emerald-500/20"
                : "border-slate-700/60 bg-slate-800/40 text-slate-400"
            }`}
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-2 font-black text-emerald-600 text-[10px]">
              TELE
            </div>
            <p className="text-sm font-bold text-white">Telebirr</p>
            <p className="text-[11px] text-emerald-400 mt-0.5">0911000000</p>
          </button>

          <button
            type="button"
            onClick={() => setProvider("CBE")}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              provider === "CBE"
                ? "border-emerald-500 bg-emerald-500/15 text-white ring-2 ring-emerald-500/20"
                : "border-slate-700/60 bg-slate-800/40 text-slate-400"
            }`}
          >
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mb-2 font-black text-white text-[10px]">
              CBE
            </div>
            <p className="text-sm font-bold text-white">CBE Birr</p>
            <p className="text-[11px] text-purple-300 mt-0.5">1000123456789</p>
          </button>
        </div>

        <div className="p-3 bg-[#0B0F19] border border-slate-800 rounded-xl text-xs text-slate-400">
          Transfer to the account above, then enter the Transaction ID and upload your screenshot below.
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Amount to Deposit (ETB) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 200"
              className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3.5 text-white text-lg font-black focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">ETB</span>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Transaction ID (TxID) <span className="text-red-400">*</span>
          </label>
          <input 
            type="text" 
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            placeholder="e.g. 7ED8912..."
            className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 uppercase font-mono transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Sender Name / Phone (Optional)
          </label>
          <input 
            type="text" 
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Name on Telebirr account"
            className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Payment Receipt Screenshot <span className="text-red-400">*</span>
          </label>
          {screenshot ? (
            <div className="relative w-full h-44 bg-slate-900 rounded-2xl overflow-hidden border border-emerald-500/50">
              <img src={screenshot} alt="Receipt" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={() => setScreenshot("")}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-full border-2 border-dashed border-slate-700 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors relative bg-[#121826]">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-7 h-7 text-emerald-400 mb-1.5" />
              <span className="text-xs text-white font-semibold">Tap to upload receipt screenshot</span>
              <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG up to 5MB</span>
            </div>
          )}
        </div>

        <button 
          type="button"
          onClick={handleDeposit}
          disabled={isSubmitting}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" /> Submit Deposit ({amount || "0"} ETB)
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function DepositPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="text-slate-400 text-sm">Loading deposit...</span>
        </div>
      }
    >
      <DepositForm />
    </Suspense>
  );
}
