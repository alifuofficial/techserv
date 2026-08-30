"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Trophy, Sparkles, Loader2 } from "lucide-react";
import { fetchTelegramApi } from "@/lib/telegram-client";

export default function TelegramCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTelegramApi("/api/telegram/campaigns")
      .then((res) => {
        if (res.ok && res.data.success) {
          setCampaigns(res.data.campaigns || []);
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 animate-pulse">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading campaigns...</span>
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
        <h1 className="text-xl font-bold text-white">Live Campaigns</h1>
      </div>

      <div className="mt-4 space-y-4">
        {campaigns.length === 0 ? (
          <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center mt-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
              <Trophy className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No active campaigns</h2>
            <p className="text-slate-400 text-sm">New campaigns will be published soon. Check back shortly!</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/telegram/campaigns/${campaign.slug}`}
              className="bg-[#121826] border border-slate-800/60 rounded-3xl p-5 block active:bg-slate-800/80 transition-all hover:border-slate-700 shadow-md relative overflow-hidden group"
            >
              <div className="w-full h-44 bg-slate-800 rounded-2xl overflow-hidden border border-white/5 relative mb-4">
                {campaign.image ? (
                  <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Trophy className="w-10 h-10 opacity-30" />
                    <span className="text-xs font-bold uppercase tracking-wider">MilkyTech Draw</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-[#0B0F19]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> LIVE
                </div>
              </div>

              <h2 className="text-white font-bold text-lg leading-tight mb-2">{campaign.title}</h2>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Price</span>
                  <span className="text-emerald-400 font-extrabold text-base">{campaign.ticketPrice} {campaign.currency || "ETB"}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Ends</span>
                  <span className="text-slate-300 text-xs font-semibold">{new Date(campaign.drawDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(3, (campaign.entriesCount / (campaign.maxEntries || 1)) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
