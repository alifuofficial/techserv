"use client";

import { useState } from "react";
import { Search, Gift, MoreVertical, Plus, Edit3, Trash2, ExternalLink, Box, TrendingUp, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialPrizes = [
  { id: "PRZ-001", title: "iPhone 17 Pro Max 256GB", campaign: "iPhone 17 Pro Max Giveaway", value: "85,000 ETB", status: "ACTIVE", image: "📱" },
  { id: "PRZ-002", title: "Toyota SUV 2025", campaign: "Toyota SUV Summer Draw", value: "3,500,000 ETB", status: "ACTIVE", image: "🚙" },
  { id: "PRZ-003", title: "MacBook Pro 16\" M4", campaign: "Tech Setup Upgrade", value: "120,000 ETB", status: "DRAFT", image: "💻" },
  { id: "PRZ-004", title: "100,000 ETB Cash Prize", campaign: "August Cash Drop", value: "100,000 ETB", status: "DISTRIBUTED", image: "💵" },
  { id: "PRZ-005", title: "PlayStation 5 Pro", campaign: "Gamer's Paradise", value: "45,000 ETB", status: "ACTIVE", image: "🎮" },
];

export default function AdminPrizesPage() {
  const [prizes, setPrizes] = useState(initialPrizes);

  const deletePrize = (id: string) => {
    setPrizes(prev => prev.filter(prize => prize.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prize Inventory</h1>
          <p className="text-sm text-slate-500">Manage all prizes, cash rewards, and physical items tied to campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">
            <Plus className="w-4 h-4" /> Add New Prize
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Prizes</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Gift className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{prizes.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Value (Active)</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">3,630,000 ETB</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Distributed</p>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">12</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Stock Pending</p>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Box className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">1</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search prizes..." 
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
            <option>Active</option>
            <option>Draft</option>
            <option>Distributed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Prize Details</th>
                <th className="px-6 py-4">Prize ID</th>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prizes.map((prize) => (
                <tr key={prize.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200 shadow-sm">
                      {prize.image}
                    </div>
                    <div className="font-bold text-slate-900">{prize.title}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-500">{prize.id}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-emerald-600 cursor-pointer transition-colors">
                      {prize.campaign} <ExternalLink className="w-3 h-3" />
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{prize.value}</td>
                  <td className="px-6 py-4">
                    {prize.status === 'ACTIVE' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/60 shadow-sm">Active</span>}
                    {prize.status === 'DRAFT' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/60 shadow-sm">Draft</span>}
                    {prize.status === 'DISTRIBUTED' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">Distributed</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                        <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-3 py-2">Prize Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3">
                          <Edit3 className="w-4 h-4" /> Edit Prize
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        <DropdownMenuItem 
                          onClick={() => deletePrize(prize.id)}
                          className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Prize
                        </DropdownMenuItem>
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
