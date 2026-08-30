"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Ticket,
  Loader2,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  Copy,
  Check,
  Flame,
} from "lucide-react";
import { fetchTelegramApi } from "@/lib/telegram-client";

interface TicketItem {
  id: string;
  entryNumber: number;
  ticketNumber: string;
  campaignId: string;
  campaignTitle: string;
  campaignSlug: string;
  campaignImage: string | null;
  campaignStatus: string;
  entryPrice: number;
  currency: string;
  drawDate: string;
  createdAt: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTelegramApi("/api/telegram/tickets")
      .then((res) => {
        if (res.ok && res.data.success) {
          setTickets(res.data.tickets || []);
        } else {
          setError(res.data.error || "Failed to load tickets");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load tickets");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCopyTicket = (ticketNumber: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ticketNumber);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const activeTickets = tickets.filter(
    (t) => t.campaignStatus !== "COMPLETED" && t.campaignStatus !== "CANCELLED"
  );
  const completedTickets = tickets.filter(
    (t) => t.campaignStatus === "COMPLETED" || t.campaignStatus === "CANCELLED"
  );

  const displayedTickets =
    filter === "ACTIVE"
      ? activeTickets
      : filter === "COMPLETED"
      ? completedTickets
      : tickets;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A11] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 animate-pulse shadow-lg shadow-blue-500/20">
          <Ticket className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span>Loading your tickets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A11] text-white pb-24 selection:bg-blue-500/30">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-80 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-16 -left-16 w-60 h-60 bg-blue-600/15 rounded-full blur-[80px]"></div>
        <div className="absolute top-10 -right-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 px-5">
        
        {/* Sticky Header */}
        <div className="pt-12 pb-4 flex items-center justify-between sticky top-0 bg-[#070A11]/85 backdrop-blur-xl z-20 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link
              href="/telegram"
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-slate-300 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-white leading-tight">My Lucky Tickets</h1>
              <p className="text-xs text-slate-400">
                {activeTickets.length} active entries in play
              </p>
            </div>
          </div>

          <Link
            href="/telegram/campaigns"
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 fill-slate-950 text-emerald-400" />
            <span>Get More</span>
          </Link>
        </div>

        {/* Motivational Winning Odds Booster Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-blue-950/70 border border-blue-500/30 shadow-xl shadow-blue-950/30 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>More Tickets = Higher Winning Odds!</span>
            </h3>
            <p className="text-[11px] text-blue-200/90 leading-snug mt-0.5">
              Each extra ticket increases your probability of being picked as the grand prize winner.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-4">
          {[
            { id: "ALL", label: `All (${tickets.length})` },
            { id: "ACTIVE", label: `In Play (${activeTickets.length})` },
            { id: "COMPLETED", label: `Completed (${completedTickets.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25"
                  : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        <div className="mt-4 space-y-3.5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl">
              {error}
            </div>
          )}

          {displayedTickets.length === 0 ? (
            <div className="bg-[#0D1424] border border-slate-800/80 rounded-3xl p-8 flex flex-col items-center justify-center text-center mt-6 space-y-3 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Ticket className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-white">No Tickets in this Category</h2>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Join live draws to secure your tickets and multiply your chances of winning!
              </p>
              <Link
                href="/telegram/campaigns"
                className="mt-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black py-3 px-6 rounded-2xl flex items-center gap-2 text-xs active:scale-95 transition-all shadow-lg shadow-emerald-500/25"
              >
                <Sparkles className="w-4 h-4" /> Browse Active Draws
              </Link>
            </div>
          ) : (
            displayedTickets.map((ticket) => {
              const isActive = ticket.campaignStatus !== "COMPLETED" && ticket.campaignStatus !== "CANCELLED";
              const isCopied = copiedId === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className="bg-gradient-to-r from-[#0E1526] to-[#0A0F1D] border border-slate-800/80 hover:border-blue-500/40 rounded-3xl p-4 shadow-xl shadow-black/40 relative overflow-hidden transition-all group"
                >
                  {/* Glowing background accent */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex gap-3.5">
                    {/* Prize Thumbnail */}
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl shrink-0 overflow-hidden border border-white/10 relative shadow-inner">
                      {ticket.campaignImage ? (
                        <img
                          src={ticket.campaignImage}
                          alt={ticket.campaignTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600">
                          <Ticket className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Ticket Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isActive
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-slate-700/60 text-slate-300 border border-slate-600/40"
                            }`}
                          >
                            {isActive ? "🟢 In Live Draw" : ticket.campaignStatus}
                          </span>

                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-white font-extrabold text-sm leading-tight truncate mt-1">
                          {ticket.campaignTitle}
                        </h3>
                      </div>

                      {/* Ticket Stub Bar */}
                      <div className="mt-2.5 flex items-center justify-between gap-2 bg-[#060A14] p-2 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Ticket className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-mono text-xs font-black text-cyan-300 truncate">
                            {ticket.ticketNumber}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyTicket(ticket.ticketNumber, ticket.id)}
                          className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                          title="Copy Ticket"
                        >
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  {isActive && (
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Draw: {new Date(ticket.drawDate).toLocaleDateString()}</span>
                      </div>

                      <Link
                        href={`/telegram/campaigns/${ticket.campaignSlug}`}
                        className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 text-xs"
                      >
                        <span>Buy More Tickets</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Provably Fair Badge */}
        <div className="p-4 bg-gradient-to-r from-slate-900/60 to-slate-950/80 rounded-2xl border border-white/5 text-center space-y-1 mt-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Cryptographic Entry Hash
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            All tickets are cryptographically committed to the draw snapshot before random winner selection.
          </p>
        </div>

      </div>
    </div>
  );
}
