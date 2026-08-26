import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft, User, LogOut } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="pb-24 px-5">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/80 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Profile</h1>
      </div>

      <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-6 mt-4 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
          <User className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{session?.user?.email?.split('@')[0].replace('telegram_', 'User ')}</h2>
        <p className="text-slate-400 text-sm">{session?.user?.email}</p>
        <span className="mt-3 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-widest">VERIFIED</span>
      </div>

      <div className="mt-8 space-y-4">
        <div className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4">
          <p className="text-slate-400 text-sm mb-1">Telegram ID</p>
          <p className="text-white font-mono">{session?.user?.email?.split('@')[0].replace('telegram_', '')}</p>
        </div>
        <Link href="/api/auth/signout" className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-bold py-4 rounded-2xl active:bg-red-500/20 transition-colors border border-red-500/20 mt-8">
          <LogOut className="w-5 h-5" /> Sign Out
        </Link>
      </div>
    </div>
  );
}
