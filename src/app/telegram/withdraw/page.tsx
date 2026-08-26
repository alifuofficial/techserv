import Link from "next/link";
import { ChevronLeft, ArrowDownToLine } from "lucide-react";

export default function WithdrawPage() {
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
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Withdraw Amount (ETB)</label>
            <input 
              type="number" 
              placeholder="0.00"
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-4 py-4 text-white text-lg font-bold focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Telebirr Account Number</label>
            <input 
              type="tel" 
              placeholder="0911..."
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          
          <button className="w-full bg-slate-800 text-slate-400 font-bold py-4 rounded-xl cursor-not-allowed mt-2">
            Insufficient Balance
          </button>
        </div>
      </div>
      
      <p className="text-center text-xs text-slate-500 mt-6 px-4">
        Withdrawals are processed within 24 hours. Minimum withdrawal amount is 500 ETB.
      </p>
    </div>
  );
}
