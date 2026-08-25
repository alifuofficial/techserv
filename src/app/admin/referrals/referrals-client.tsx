"use client";

import { useState } from "react";
import { Search, Users, MoreVertical, Download, Eye, Link as LinkIcon, DollarSign, TrendingUp, Ban, CheckCircle2, Award } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminReferralsClient({ initialReferrers }: { initialReferrers: any[] }) {
  const [referrers, setReferrers] = useState(initialReferrers);

  const updateStatus = (id: string, newStatus: string) => {
    setReferrers(prev => prev.map(ref => ref.id === id ? { ...ref, status: newStatus } : ref));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Referral Program</h1>
          <p className="text-sm text-slate-500">Monitor affiliate performance, track user acquisition, and manage payouts.</p>
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
            <p className="text-sm font-semibold text-slate-500">Active Affiliates</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Users className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">3,492</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Referred Users</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">14,821</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Commissions</p>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><DollarSign className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">842,500 ETB</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Highest Earner</p>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Award className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">TechZone</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Referrer or Code..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Tiers</option>
            <option>Top Earners</option>
            <option>Standard</option>
          </select>
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Referrer</th>
                <th className="px-6 py-4">Referral Code</th>
                <th className="px-6 py-4">Total Referrals</th>
                <th className="px-6 py-4">Conversion Rate</th>
                <th className="px-6 py-4">Earned Commission</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {referrers.map((ref) => (
                <tr key={ref.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                      {ref.user.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 mb-0.5">{ref.user}</div>
                      <div className="text-xs text-slate-500">{ref.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      <LinkIcon className="w-3 h-3" /> {ref.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{ref.referrals}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{ref.conversion}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{ref.earnings}</td>
                  <td className="px-6 py-4">
                    {ref.status === 'ACTIVE' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">Active</span>}
                    {ref.status === 'SUSPENDED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/60 shadow-sm">Suspended</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                        <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-3 py-2">Affiliate Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3">
                          <Eye className="w-4 h-4" /> View Network
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3">
                          <TrendingUp className="w-4 h-4" /> Adjust Commission
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        {ref.status === 'ACTIVE' ? (
                          <DropdownMenuItem 
                            onClick={() => updateStatus(ref.id, 'SUSPENDED')}
                            className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                          >
                            <Ban className="w-4 h-4" /> Suspend Code
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => updateStatus(ref.id, 'ACTIVE')}
                            className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 text-sm py-2 px-3"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Reactivate Code
                          </DropdownMenuItem>
                        )}
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
          <div>Showing 1 to {referrers.length} of 3,492 affiliates</div>
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
