"use client";

import { useState } from "react";
import { Search, Trophy, MoreVertical, Download, Eye, CheckCircle2, Clock, Medal, Gift, ShieldAlert } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialWinners = [
  { id: "WIN-001", user: "Dawit T.", email: "dawit@example.com", ticketId: "MT-847291", prize: "iPhone 17 Pro Max 256GB", campaign: "iPhone 17 Pro Max Giveaway", date: "Aug 21, 2026", status: "PENDING" },
  { id: "WIN-002", user: "Sara M.", email: "sara@example.com", ticketId: "MT-102940", prize: "Toyota SUV 2025", campaign: "Toyota SUV Summer Draw", date: "Aug 15, 2026", status: "CLAIMED" },
  { id: "WIN-003", user: "Henok B.", email: "henok.b@example.com", ticketId: "MT-993821", prize: "MacBook Pro 16\" M4", campaign: "Tech Setup Upgrade", date: "Aug 01, 2026", status: "CLAIMED" },
  { id: "WIN-004", user: "Kaleb Y.", email: "kaleb.y@example.com", ticketId: "MT-558123", prize: "100,000 ETB Cash", campaign: "August Cash Drop", date: "Jul 28, 2026", status: "FORFEITED" },
];

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState(initialWinners);

  const updateStatus = (id: string, newStatus: string) => {
    setWinners(prev => prev.map(winner => winner.id === id ? { ...winner, status: newStatus } : winner));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Winner Management</h1>
          <p className="text-sm text-slate-500">Oversee draw results, verify winners, and track prize claims.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Winners</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Trophy className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">142</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Prizes Claimed</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">128</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Pending Claims</p>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Clock className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">11</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Value Awarded</p>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><Gift className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">4.2M ETB</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by User or Ticket ID..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Campaigns</option>
            <option>iPhone 17 Pro Max</option>
            <option>Toyota SUV</option>
          </select>
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Status</option>
            <option>Claimed</option>
            <option>Pending</option>
            <option>Forfeited</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Winner</th>
                <th className="px-6 py-4">Winning Ticket</th>
                <th className="px-6 py-4">Prize Won</th>
                <th className="px-6 py-4">Draw Date</th>
                <th className="px-6 py-4">Claim Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {winners.map((winner) => (
                <tr key={winner.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold shrink-0 shadow-sm border border-emerald-100">
                      <Medal className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 mb-0.5">{winner.user}</div>
                      <div className="text-xs text-slate-500">{winner.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">{winner.ticketId}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{winner.prize}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[150px]">{winner.campaign}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{winner.date}</td>
                  <td className="px-6 py-4">
                    {winner.status === 'CLAIMED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">Claimed</span>}
                    {winner.status === 'PENDING' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/60 shadow-sm">Pending Claim</span>}
                    {winner.status === 'FORFEITED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/60 shadow-sm">Forfeited</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                        <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-3 py-2">Winner Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3">
                          <Eye className="w-4 h-4" /> View Draw Details
                        </DropdownMenuItem>
                        
                        {winner.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => updateStatus(winner.id, 'CLAIMED')}
                              className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 text-sm py-2 px-3"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Mark as Claimed
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateStatus(winner.id, 'FORFEITED')}
                              className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                            >
                              <ShieldAlert className="w-4 h-4" /> Mark Forfeited
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
