"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft, Ticket, Loader2, Sparkles } from "lucide-react";
import { getTelegramTickets } from "../actions";

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initData) {
        tg.ready();
        tg.expand();
        signIn("telegram", { initData: tg.initData, redirect: false }).catch(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      getTelegramTickets()
        .then((res) => {
          if (res.success) {
            setTickets(res.tickets || []);
          } else {
            setError(res.error || "Failed to load tickets");
          }
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load tickets");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 animate-pulse">
          <Ticket className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading your tickets...</span>
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
        <h1 className="text-xl font-bold text-white">My Tickets</h1>
      </div>

      <div className="mt-4 space-y-4">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl">
            {error}
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center mt-6">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
              <Ticket className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No tickets yet</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Join active campaigns to get your lucky tickets and win big prizes!
            </p>
            <Link
              href="/campaigns"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-sm active:scale-95 transition-transform shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-4 h-4" /> Browse Campaigns
            </Link>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 flex gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="w-20 h-20 bg-slate-800 rounded-xl shrink-0 overflow-hidden border border-white/5 relative">
                {ticket.campaignImage ? (
                  <img src={ticket.campaignImage} alt={ticket.campaignTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                    <Ticket className="w-8 h-8 opacity-30" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                <div>
                  <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">{ticket.campaignTitle}</h3>
                  <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5">
                    <span>Ticket:</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {ticket.ticketNumber}
                    </span>
                  </p>
                </div>
                <div className="flex justify-between items-end mt-3 text-xs">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      ticket.campaignStatus === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-700/60 text-slate-300 border border-slate-600/40"
                    }`}
                  >
                    {ticket.campaignStatus}
                  </span>
                  <span className="text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
