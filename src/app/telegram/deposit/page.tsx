"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Upload, CheckCircle2, AlertCircle, X, Loader2, Copy, Check } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

  // Dynamic Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<{
    telebirr: { enabled: boolean; accountName: string; accountNumber: string; instructions: string };
    cbe: { enabled: boolean; accountName: string; accountNumber: string; instructions: string };
  }>({
    telebirr: {
      enabled: true,
      accountName: "MilkyTech Online",
      accountNumber: "0911000000",
      instructions: "Transfer to the Telebirr number above and upload your screenshot receipt.",
    },
    cbe: {
      enabled: true,
      accountName: "MilkyTech Online PLC",
      accountNumber: "1000123456789",
      instructions: "Transfer to the CBE account number above and upload your screenshot receipt.",
    },
  });

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setPaymentSettings({
            telebirr: data.settings.telebirr || paymentSettings.telebirr,
            cbe: data.settings.cbe || paymentSettings.cbe,
          });
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const amt = searchParams.get("amount");
    if (amt && !amount) {
      setAmount(amt);
    }
  }, [searchParams]);

  const handleCopyAccount = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const activePayment = provider === "TELEBIRR" ? paymentSettings.telebirr : paymentSettings.cbe;

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
            <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mb-2 font-black text-[10px]">
              TB
            </div>
            <p className="text-sm font-bold text-white">Telebirr</p>
            <p className="text-[11px] font-mono text-emerald-400 mt-0.5 truncate">
              {paymentSettings.telebirr.accountNumber}
            </p>
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
            <p className="text-[11px] font-mono text-purple-300 mt-0.5 truncate">
              {paymentSettings.cbe.accountNumber}
            </p>
          </button>
        </div>

        {/* Dynamic Account Info Card */}
        <div className="p-4 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Account Name:</span>
            <span className="text-white font-bold">{activePayment.accountName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Account Number:</span>
            <button
              type="button"
              onClick={() => handleCopyAccount(activePayment.accountNumber)}
              className="flex items-center gap-1 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20"
            >
              <span>{activePayment.accountNumber}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            {activePayment.instructions}
          </p>
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
            placeholder="e.g. TB123456789 or CBE-REF-001"
            className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Sender Name (Optional)
          </label>
          <input 
            type="text" 
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Name on bank account"
            className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Payment Receipt Screenshot <span className="text-red-400">*</span>
          </label>
          {screenshot ? (
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-[#121826]">
              <img src={screenshot} alt="Receipt" className="w-full max-h-48 object-cover" />
              <button 
                type="button" 
                onClick={() => setScreenshot("")}
                className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-[#121826] rounded-2xl p-6 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-300">Upload Receipt Screenshot</span>
              <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, or JPEG</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        <button
          type="button"
          onClick={handleDeposit}
          disabled={isSubmitting}
          className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting Deposit...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Submit for Verification</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function DepositPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <DepositForm />
    </Suspense>
  );
}
