"use client";

import { useState } from "react";
import { Search, Ticket, MoreVertical, Download, Eye, RotateCcw, Trash2, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialEntries = [
  { id: "MT-847291", user: "Dawit T.", email: "dawit@example.com", campaign: "iPhone 17 Pro Max 256GB", date: "Aug 20, 2026", price: "100 ETB", status: "VALID" },
  { id: "MT-10294", user: "Sara M.", email: "sara@example.com", campaign: "Toyota SUV 2025", date: "Aug 19, 2026", price: "500 ETB", status: "VALID" },
  { id: "MT-99382", user: "Henok B.", email: "henok@example.com", campaign: "MacBook Pro 16\" M4", date: "Aug 18, 2026", price: "150 ETB", status: "REFUNDED" },
  { id: "MT-02941", user: "Betelhem A.", email: "beti@example.com", campaign: "PlayStation 5 Bundle", date: "Aug 17, 2026", price: "50 ETB", status: "VALID" },
  { id: "MT-55812", user: "Kaleb Y.", email: "kaleb.y@example.com", campaign: "100,000 ETB Cash Prize", date: "Aug 15, 2026", price: "200 ETB", status: "WINNER" },
  { id: "MT-11938", user: "Meron D.", email: "meron99@example.com", campaign: "Samsung Galaxy S25 Ultra", date: "Aug 14, 2026", price: "100 ETB", status: "VALID" },
];

export default function AdminEntriesPage() {
  const [entries, setEntries] = useState(initialEntries);

  const updateStatus = (id: string, newStatus: string) => {
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, status: newStatus } : entry));
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Entries & Tickets</h1>
          <p className="text-sm text-slate-500">Manage all tickets purchased by users across active campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Ticket ID or Email..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Campaigns</option>
            <option>iPhone 17 Pro Max</option>
            <option>Toyota SUV 2025</option>
          </select>
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Status</option>
            <option>Valid</option>
            <option>Winner</option>
            <option>Refunded</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-emerald-500 opacity-70" /> {entry.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 mb-0.5">{entry.user}</div>
                    <div className="text-xs text-slate-500">{entry.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{entry.campaign}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{entry.price}</td>
                  <td className="px-6 py-4">
                    {entry.status === 'VALID' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/60 shadow-sm">Valid</span>}
                    {entry.status === 'WINNER' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">Winner</span>}
                    {entry.status === 'REFUNDED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/60 shadow-sm">Refunded</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                        <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-3 py-2">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3">
                          <Eye className="w-4 h-4" /> View Details
                        </DropdownMenuItem>
                        
                        {entry.status !== 'WINNER' && (
                          <DropdownMenuItem 
                            onClick={() => updateStatus(entry.id, 'WINNER')}
                            className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 text-sm py-2 px-3"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Mark as Winner
                          </DropdownMenuItem>
                        )}
                        
                        {entry.status === 'VALID' && (
                          <DropdownMenuItem 
                            onClick={() => updateStatus(entry.id, 'REFUNDED')}
                            className="cursor-pointer flex items-center gap-2 text-amber-600 focus:bg-amber-50 focus:text-amber-700 text-sm py-2 px-3"
                          >
                            <RotateCcw className="w-4 h-4" /> Issue Refund
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem 
                          onClick={() => deleteEntry(entry.id)}
                          className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Entry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>Showing 1 to {entries.length} of 12,543 entries</div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors" disabled>Prev</button>
            <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-500/20">1</button>
            <button className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">2</button>
            <button className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">3</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
