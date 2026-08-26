import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft, Gift, Users } from "lucide-react";
import ReferralClient from "./referral-client";

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  
  // Create a placeholder referral code for now based on user id
  const referralCode = `MILKY-${session?.user?.id?.substring(0,6).toUpperCase()}`;
  const referralLink = `https://t.me/milkytechonlinebot?start=${referralCode}`;
  
  return (
    <div className="pb-24 px-5">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/80 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Refer & Earn</h1>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-lg relative overflow-hidden mt-4">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Invite Friends, Get Rewarded</h2>
          <p className="text-indigo-100 text-sm mb-6">Earn 10 ETB for every friend who joins and plays their first campaign.</p>
          
          <ReferralClient referralLink={referralLink} />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4">Your Referrals</h3>
        <div className="bg-[#121826] border border-slate-800/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-white font-bold mb-1">No referrals yet</p>
          <p className="text-slate-400 text-sm">Share your link to start earning!</p>
        </div>
      </div>
    </div>
  );
}
