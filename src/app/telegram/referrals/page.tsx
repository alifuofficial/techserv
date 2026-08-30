"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Gift, Users, Copy, Share2, Check, Loader2 } from "lucide-react";
import { fetchTelegramApi } from "@/lib/telegram-client";

export default function ReferralsPage() {
  const [data, setData] = useState<{
    referralCode?: string;
    referralLink?: string;
    referredCount?: number;
    totalEarned?: number;
    bonusAmount?: number;
    currency?: string;
    customText?: string;
    referredUsers?: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTelegramApi("/api/telegram/referrals")
      .then((res) => {
        if (res.ok && res.data.success) {
          setData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const bonusAmount = data?.bonusAmount || 10;
  const currency = data?.currency || "ETB";
  const referralLink = data?.referralLink || "https://t.me/milkytechonlinebot?start=MILKY-JOIN";
  const referredUsers = data?.referredUsers || [];

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = encodeURIComponent(`🎁 Join MilkyTech and win incredible prizes! Use my link to get lucky tickets & ${bonusAmount} ${currency} bonus:`);
  const shareUrl = encodeURIComponent(referralLink);
  const telegramShareLink = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 animate-pulse">
          <Gift className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading referrals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-5 min-h-screen bg-[#0B0F19]">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/90 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center active:scale-95 transition-transform">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">Refer & Earn</h1>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-3xl p-6 shadow-lg shadow-indigo-500/20 relative overflow-hidden mt-2">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 border border-white/20">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Invite Friends, Get Rewarded</h2>
          <p className="text-indigo-100 text-xs mb-6 max-w-xs leading-relaxed">
            Earn <b>{bonusAmount} {currency}</b> bonus for every friend who joins MilkyTech using your link!
          </p>

          <div className="w-full bg-[#0B0F19]/60 rounded-2xl p-4 flex items-center justify-between border border-white/10 backdrop-blur-sm">
            <div className="text-left w-full pr-2 overflow-hidden">
              <p className="text-indigo-200 text-[10px] uppercase font-bold tracking-wider mb-0.5">Your Referral Link</p>
              <p className="text-white font-mono text-xs truncate w-full">{referralLink}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform shadow-md"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <a
            href={telegramShareLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-3 bg-white text-indigo-700 hover:bg-slate-100 font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md text-sm"
          >
            <Share2 className="w-4 h-4" /> Share on Telegram
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 text-center">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Friends Invited</span>
          <span className="text-2xl font-black text-white mt-1 block">{referredUsers.length}</span>
        </div>
        <div className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 text-center">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Total Rewards</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {(referredUsers.length * bonusAmount).toLocaleString()} {currency}
          </span>
        </div>
      </div>

      {/* Referred Users List */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4">Your Referrals ({referredUsers.length})</h3>
        {referredUsers.length === 0 ? (
          <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20">
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-white font-bold mb-1">No referrals yet</p>
            <p className="text-slate-400 text-xs max-w-xs">
              Share your invite link above with friends or Telegram groups to start earning bonuses.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {referredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{user.name}</p>
                    <p className="text-slate-400 text-xs">Joined {new Date(user.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                  +{user.bonus || bonusAmount} {currency}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
