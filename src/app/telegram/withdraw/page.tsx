"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ArrowDownToLine, AlertCircle } from "lucide-react";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");

  const handleWithdraw = () => {
    if (!amount || Number(amount) < 500) {
      setError("Minimum withdrawal amount is 500 ETB.");
      return;
    }
    if (!account) {
      setError("Account number is required.");
      return;
    }
    
    // Simulate error since they likely have 0 balance for MVP demo
    setError("Insufficient Available Balance to complete this withdrawal.");
  };

  return (
    <div className="pb-24 px-5">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/80 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Withdraw Funds</h1>
      </div>

      <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-6 mt-4">
        <div className="text-center mb-6">
          <p className="text-slate-400 text-sm mb-1">Available to Withdraw</p>
          <div className="flex justify-center items-baseline gap-1">
            <span className="text-4xl font-black text-white">0.00</span>
            <span className="text-emerald-400 font-bold">ETB</span>
          </div>
        </div>

        <div className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0"/> {error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Withdraw Amount (ETB)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Min 500 ETB"
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-4 py-4 text-white text-lg font-bold focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Telebirr Account Number</label>
            <input 
              type="tel" 
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="0911..."
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          
          <button onClick={handleWithdraw} className="w-full bg-slate-800 text-white hover:bg-slate-700 font-bold py-4 rounded-xl mt-2 transition-colors">
            Request Withdrawal
          </button>
        </div>
      </div>
      
      <p className="text-center text-xs text-slate-500 mt-6 px-4">
        Withdrawals are processed within 24 hours. Minimum withdrawal amount is 500 ETB.
      </p>
    </div>
  );
}
