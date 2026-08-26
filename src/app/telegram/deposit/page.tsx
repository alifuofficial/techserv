import Link from "next/link";
import { ChevronLeft, CreditCard, Banknote, ShieldCheck } from "lucide-react";

export default function DepositPage() {
  return (
    <div className="pb-24 px-5">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/80 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Deposit Funds</h1>
      </div>

      <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-6 mt-4">
        <h2 className="text-slate-300 font-medium text-sm mb-4">Select Payment Method</h2>
        
        <div className="space-y-3">
          <div className="border border-emerald-500/50 bg-emerald-500/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">RECOMMENDED</div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
              <span className="text-emerald-500 font-black text-xs">TELEBIRR</span>
            </div>
            <div>
              <h3 className="text-white font-bold">Telebirr</h3>
              <p className="text-emerald-400 text-xs mt-0.5">Instant Deposit</p>
            </div>
          </div>
          
          <div className="border border-slate-700 bg-slate-800/50 rounded-2xl p-4 flex items-center gap-4 opacity-50 cursor-not-allowed">
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
              <Banknote className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">CBE Birr</h3>
              <p className="text-slate-400 text-xs mt-0.5">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Amount (ETB)</label>
          <input 
            type="number" 
            placeholder="Min 100 ETB"
            className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-4 text-white text-lg font-bold focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        
        <button className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Proceed to Pay
        </button>
      </div>
    </div>
  );
}
