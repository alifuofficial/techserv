"use client";

import Link from "next/link";
import { Trophy, Gift, ArrowRight, CheckCircle2, AlertCircle, Clock, PartyPopper, ExternalLink } from "lucide-react";

export default function UserWinsClient({ initialWins }: { initialWins: any[] }) {
  const wins = initialWins;
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-500 to-orange-400 p-8 rounded-2xl shadow-lg shadow-amber-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Trophy className="w-64 h-64 -mt-10 -mr-10" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">My Trophies</h1>
          </div>
          <p className="text-white/90 text-sm max-w-md">Your personal hall of fame. View the prizes you've won, claim your rewards, and track their delivery status.</p>
        </div>
        <Link href="/campaigns" className="relative z-10 flex items-center gap-2 bg-white text-amber-600 hover:bg-amber-50 px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all">
          Win More Prizes <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Wins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {wins.length > 0 ? (
          wins.map((win) => (
            <div key={win.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-shadow">
              
              {/* Prize Image */}
              <div className={`sm:w-48 h-48 sm:h-auto relative ${win.bgColor || 'bg-slate-100'} flex items-center justify-center shrink-0`}>
                {win.image ? (
                  <img src={win.image} alt={win.campaign} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <Gift className="w-16 h-16 text-white/50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent sm:hidden"></div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-900 shadow-sm">
                  {win.dateWon}
                </div>
              </div>

              {/* Prize Details */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2">{win.campaign}</h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold text-slate-500">Value:</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{win.value}</span>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Winning Ticket</p>
                    <p className="font-mono font-medium text-sm text-slate-700">
                      {win.ticketId}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Win ID</p>
                    <p className="font-mono font-medium text-xs text-slate-500">
                      {win.id}
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="pt-4 border-t border-slate-100">
                  {win.status === 'CLAIMED' ? (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" /> Prize Claimed
                      </span>
                      <button className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2">View Receipt</button>
                    </div>
                  ) : win.status === 'PENDING' ? (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-amber-500">
                        <Clock className="w-4 h-4" /> Verifying Details
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-sm font-bold shadow-sm shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
                        Claim Prize <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 relative">
              <Trophy className="w-12 h-12 text-slate-300" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <AlertCircle className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No trophies yet!</h3>
            <p className="text-slate-500 max-w-md mb-8">You haven't won any prizes yet, but your lucky day could be just around the corner.</p>
            <Link href="/campaigns" className="bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2">
              <Gift className="w-5 h-5" /> Enter a Draw Today
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
