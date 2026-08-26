"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Banknote, ShieldCheck, Upload, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [txId, setTxId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDeposit = async () => {
    if (!amount || Number(amount) < 100) {
      setError("Minimum deposit is 100 ETB");
      return;
    }
    if (!txId) {
      setError("Transaction ID is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          provider: "TELEBIRR",
          txId,
          senderName,
          date: new Date().toISOString(),
          screenshot,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Deposit failed");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/telegram");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="pb-24 px-5 min-h-screen flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Deposit Submitted!</h1>
        <p className="text-slate-400 text-center mb-8">Your deposit has been submitted for review. It will be credited to your account shortly.</p>
        <Link href="/telegram" className="bg-slate-800 text-white font-bold py-3 px-8 rounded-xl">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 px-5">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/80 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Deposit Funds</h1>
      </div>

      <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-6 mt-4">
        <h2 className="text-slate-300 font-medium text-sm mb-4">Payment Method</h2>
        
        <div className="border border-emerald-500/50 bg-emerald-500/10 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">SELECTED</div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
            <span className="text-emerald-500 font-black text-xs">TELEBIRR</span>
          </div>
          <div>
            <h3 className="text-white font-bold">Telebirr</h3>
            <p className="text-emerald-400 text-xs mt-0.5">Send funds to 0911000000</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Amount (ETB)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Min 100 ETB"
            className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-4 text-white text-lg font-bold focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Transaction ID</label>
          <input 
            type="text" 
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            placeholder="e.g. 7ED8..."
            className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Sender Name</label>
          <input 
            type="text" 
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Name on Telebirr"
            className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Screenshot (Optional)</label>
          <div className="w-full border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors relative">
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <Upload className="w-6 h-6 text-slate-500 mb-2" />
            <span className="text-sm text-slate-400">{screenshot ? "Image selected" : "Tap to upload receipt"}</span>
          </div>
        </div>

        <button 
          onClick={handleDeposit}
          disabled={isSubmitting}
          className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : <><ShieldCheck className="w-5 h-5" /> Submit Deposit</>}
        </button>
      </div>
    </div>
  );
}
