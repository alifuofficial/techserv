"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  Tag,
  Sparkles,
  Edit,
  ExternalLink,
  ChevronRight,
  Calculator,
  CheckCircle2,
  Clock,
  Archive,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export interface AdminCampaignItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  entryPrice: number;
  currency: string;
  maxEntries: number;
  entriesSold: number;
  productCost: number; // Market price / purchase cost of product
  targetGross: number;
  realizedGross: number;
  targetProfit: number;
  realizedProfit: number;
  targetRoi: string;
  progress: number;
  status: string;
  imageUrl?: string | null;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

interface CampaignsClientProps {
  initialCampaigns: AdminCampaignItem[];
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalTargetGross: number;
    totalRealizedGross: number;
    totalProductCost: number;
    totalTargetProfit: number;
    totalRealizedProfit: number;
  };
}

export default function CampaignsClient({ initialCampaigns = [], stats }: CampaignsClientProps) {
  const [campaigns, setCampaigns] = useState<AdminCampaignItem[]>(initialCampaigns || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const safeStats = {
    totalCampaigns: stats?.totalCampaigns || 0,
    activeCampaigns: stats?.activeCampaigns || 0,
    totalTargetGross: stats?.totalTargetGross || 0,
    totalRealizedGross: stats?.totalRealizedGross || 0,
    totalProductCost: stats?.totalProductCost || 0,
    totalTargetProfit: stats?.totalTargetProfit || 0,
    totalRealizedProfit: stats?.totalRealizedProfit || 0,
  };

  const filteredCampaigns = (campaigns || []).filter((c) => {
    if (!c) return false;
    const title = (c.title || "").toLowerCase();
    const slug = (c.slug || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = title.includes(query) || slug.includes(query);
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-emerald-600" /> Campaigns & Profit Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track prize draws, product market acquisition costs, gross ticket revenues, and net profit margins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/draws"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> Live Draw Room
          </Link>
          <Link
            href="/admin/campaigns/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Campaign
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Active Campaigns */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Campaigns</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Trophy className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {safeStats.activeCampaigns} <span className="text-xs text-slate-400 font-normal">/ {safeStats.totalCampaigns} Total</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Live active ticket raffles</p>
        </div>

        {/* Card 2: Total Target Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Gross Volume</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><DollarSign className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {safeStats.totalTargetGross.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ETB</span>
          </h3>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">
            Realized: {safeStats.totalRealizedGross.toLocaleString()} ETB
          </p>
        </div>

        {/* Card 3: Total Product Market Cost */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Product Costs</p>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Tag className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-rose-600">
            {safeStats.totalProductCost.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ETB</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Total product acquisition costs</p>
        </div>

        {/* Card 4: Projected Net Profit */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projected Net Profit</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600">
            {safeStats.totalTargetProfit >= 0 ? "+" : ""}{safeStats.totalTargetProfit.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ETB</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Realized Net: <span className={safeStats.totalRealizedProfit >= 0 ? "text-emerald-600 font-bold" : "text-slate-600 font-bold"}>
              {safeStats.totalRealizedProfit >= 0 ? "+" : ""}{safeStats.totalRealizedProfit.toLocaleString()} ETB
            </span>
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by title or slug..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Live)</option>
            <option value="DRAWING">Drawing (Ready for RNG)</option>
            <option value="COMPLETED">Completed (Finalized)</option>
            <option value="DRAFT">Draft (Hidden)</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Prize Campaign</th>
                <th className="px-6 py-4">Product Cost (Market Price)</th>
                <th className="px-6 py-4">Ticket Goal & Target Gross</th>
                <th className="px-6 py-4">Live Sold & Realized</th>
                <th className="px-6 py-4">Net Profit & ROI</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400 space-y-2">
                    <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600 text-sm">No campaigns match your search</p>
                    <p className="text-xs text-slate-400">Try adjusting your search query or create a new campaign.</p>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => {
                  const productCost = c.productCost || 0;
                  const targetGross = c.targetGross || 0;
                  const realizedGross = c.realizedGross || 0;
                  const targetProfit = c.targetProfit || 0;
                  const realizedProfit = c.realizedProfit || 0;
                  const entriesSold = c.entriesSold || 0;
                  const maxEntries = c.maxEntries || 0;
                  const entryPrice = c.entryPrice || 0;
                  const progress = c.progress || 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Title & Image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          {c.imageUrl ? (
                            <img src={c.imageUrl} alt={c.title} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 border border-emerald-100">
                              <Trophy className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate max-w-[200px]">{c.title}</div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>/{c.slug}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Product Cost (Market Price) */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-rose-600 font-mono text-sm">
                          {productCost > 0 ? `${productCost.toLocaleString()} ETB` : "0 ETB"}
                        </div>
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                          Asset Cost
                        </span>
                      </td>

                      {/* Ticket Price & Target Gross */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 font-mono text-sm">
                          {targetGross.toLocaleString()} ETB
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {maxEntries.toLocaleString()} tix × {entryPrice} ETB
                        </div>
                      </td>

                      {/* Live Sold & Progress */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono">{entriesSold.toLocaleString()}</span>
                          <span className="text-xs text-slate-400">/ {maxEntries.toLocaleString()}</span>
                          <span className="text-[11px] font-bold text-emerald-600">({progress}%)</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {realizedGross.toLocaleString()} ETB Realized
                        </div>
                        <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                      </td>

                      {/* Net Profit & ROI */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold text-sm ${targetProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {targetProfit >= 0 ? "+" : ""}{targetProfit.toLocaleString()} ETB
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                            {c.targetRoi || "0.0"}% ROI
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Live Net: <span className={realizedProfit >= 0 ? "text-emerald-600 font-bold font-mono" : "text-slate-500 font-mono"}>
                            {realizedProfit >= 0 ? "+" : ""}{realizedProfit.toLocaleString()} ETB
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 text-center">
                        {c.status === "ACTIVE" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            Active
                          </span>
                        )}
                        {c.status === "DRAWING" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200 animate-pulse">
                            Drawing
                          </span>
                        )}
                        {c.status === "COMPLETED" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
                            Completed
                          </span>
                        )}
                        {c.status === "DRAFT" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Draft
                          </span>
                        )}
                        {c.status === "CANCELLED" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/campaigns/${c.id}`}
                            className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition-colors"
                            title="Edit Campaign"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {c.status === "ACTIVE" || c.status === "DRAWING" ? (
                            <Link
                              href="/admin/draws"
                              className="p-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl transition-colors"
                              title="Go to Live Draw Room"
                            >
                              <Sparkles className="w-4 h-4" />
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <div>Showing {filteredCampaigns.length} of {campaigns.length} campaigns</div>
          <div className="text-[11px] text-slate-400">Market costs & profits are strictly hidden from public player views</div>
        </div>
      </div>

    </div>
  );
}
