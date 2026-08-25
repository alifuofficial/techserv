"use client";

import { useState } from "react";
import { Search, Store, MoreVertical, Download, Eye, Ban, CheckCircle2, Percent, TrendingUp, ShieldCheck, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialMerchants = [
  { id: "MCH-001", name: "Addis Gadgets", email: "contact@addisgadgets.com", campaigns: 3, revenue: "450,000 ETB", commission: "15%", status: "ACTIVE" },
  { id: "MCH-002", name: "Ethio Motors", email: "sales@ethiomotors.com", campaigns: 1, revenue: "3,500,000 ETB", commission: "10%", status: "ACTIVE" },
  { id: "MCH-003", name: "Shewa Supermarket", email: "promo@shewa.com", campaigns: 0, revenue: "0 ETB", commission: "20%", status: "PENDING" },
  { id: "MCH-004", name: "Tech Zone Addis", email: "techzone@example.com", campaigns: 2, revenue: "120,000 ETB", commission: "15%", status: "SUSPENDED" },
];

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState(initialMerchants);

  const updateStatus = (id: string, newStatus: string) => {
    setMerchants(prev => prev.map(merchant => merchant.id === id ? { ...merchant, status: newStatus } : merchant));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Merchant Management</h1>
          <p className="text-sm text-slate-500">Onboard and manage third-party businesses running campaigns on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">
            <Plus className="w-4 h-4" /> Onboard Merchant
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Merchants</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Store className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">142</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Partner Campaigns</p>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><ShieldCheck className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">56</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Merchant Revenue</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">4.1M ETB</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Avg Commission</p>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Percent className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">14.5%</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Merchant Name..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Merchant Name</th>
                <th className="px-6 py-4">Active Campaigns</th>
                <th className="px-6 py-4">Total Revenue</th>
                <th className="px-6 py-4">Commission Rate</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {merchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold shrink-0 border border-purple-100">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 mb-0.5">{merchant.name}</div>
                      <div className="text-xs text-slate-500">{merchant.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{merchant.campaigns}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{merchant.revenue}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{merchant.commission}</td>
                  <td className="px-6 py-4">
                    {merchant.status === 'ACTIVE' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">Active</span>}
                    {merchant.status === 'PENDING' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/60 shadow-sm">Pending KYC</span>}
                    {merchant.status === 'SUSPENDED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/60 shadow-sm">Suspended</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                        <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-3 py-2">Merchant Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3">
                          <Eye className="w-4 h-4" /> View Dashboard
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3">
                          <Percent className="w-4 h-4" /> Edit Commission
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        {merchant.status !== 'ACTIVE' && (
                          <DropdownMenuItem 
                            onClick={() => updateStatus(merchant.id, 'ACTIVE')}
                            className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 text-sm py-2 px-3"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve Merchant
                          </DropdownMenuItem>
                        )}
                        
                        {merchant.status === 'ACTIVE' && (
                          <DropdownMenuItem 
                            onClick={() => updateStatus(merchant.id, 'SUSPENDED')}
                            className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                          >
                            <Ban className="w-4 h-4" /> Suspend Operations
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
      </div>
    </div>
  );
}
