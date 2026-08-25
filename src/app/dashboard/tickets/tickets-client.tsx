"use client";

import { useState } from "react";
import Link from "next/link";
import { Ticket, Calendar, Search, ArrowRight, Clock, Trophy, ExternalLink } from "lucide-react";

export default function TicketsClient({ initialTickets }: { initialTickets: any[] }) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredTickets = initialTickets.filter(ticket => {
    const matchesFilter = filter === "ALL" || ticket.status === filter;
    const matchesSearch = ticket.campaign.toLowerCase().includes(search.toLowerCase()) || ticket.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
          <p className="text-sm text-slate-500">Track your active entries and past campaign results.</p>
        </div>
        <Link href="/campaigns" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all">
          <Ticket className="w-4 h-4" /> Get More Tickets
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex bg-slate-50 p-1 rounded-xl w-full md:w-auto border border-slate-100">
          <button 
            onClick={() => setFilter("ALL")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All Tickets
          </button>
          <button 
            onClick={() => setFilter("ACTIVE")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'ACTIVE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Active Draws
          </button>
          <button 
            onClick={() => setFilter("LOST")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'LOST' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Past Results
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tickets or campaigns..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              
              {/* Campaign Image Header */}
              <div className="h-32 relative bg-slate-100 flex items-center justify-center overflow-hidden">
                <img src={ticket.image} alt={ticket.campaign} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-white font-bold leading-tight truncate">{ticket.campaign}</h3>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {ticket.status === 'ACTIVE' ? (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Draw Pending
                    </span>
                  ) : ticket.status === 'WON' ? (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Winner!
                    </span>
                  ) : (
                    <span className="bg-slate-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                      Draw Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Ticket Details */}
              <div className="p-5 flex-1 flex flex-col relative">
                {/* Decorative Ticket Cutouts */}
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#F4F7FB] rounded-full border-b border-r border-slate-200"></div>
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#F4F7FB] rounded-full border-b border-l border-slate-200"></div>
                
                <div className="absolute top-0 left-4 right-4 h-px border-t-2 border-dashed border-slate-200/60 -mt-px"></div>

                <div className="mt-2 space-y-4 flex-1">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ticket Number</p>
                    <p className="font-mono font-bold text-lg text-slate-800 bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-3 inline-block">
                      {ticket.id}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Purchased On</p>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {ticket.purchaseDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Draw Date</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {ticket.drawDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <Link href={`/campaigns`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold transition-colors border border-slate-200">
                    View Campaign <ExternalLink className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Ticket className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No tickets found</h3>
            <p className="text-slate-500 max-w-sm mb-6">You don't have any tickets matching this filter. Browse our active campaigns to enter a draw!</p>
            <Link href="/campaigns" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
              Explore Campaigns
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
