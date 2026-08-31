"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  FileBarChart,
  PieChart,
  Users,
  ArrowDownToLine,
  RefreshCw,
  Trophy,
  Loader2,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

interface ReportType {
  id: string;
  name: string;
  type: string;
  description: string;
  format: "CSV";
  icon: any;
  color: string;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: "financial",
    name: "Financial Ledger Statement",
    type: "Financial",
    description: "Export all ledger debit/credit transactions, referral rewards, and balances.",
    format: "CSV",
    icon: FileBarChart,
    color: "emerald",
  },
  {
    id: "campaigns",
    name: "Campaign Performance & Sales",
    type: "Sales",
    description: "Ticket sales conversion, gross volume, prize allocations, and merchant stats.",
    format: "CSV",
    icon: PieChart,
    color: "blue",
  },
  {
    id: "users",
    name: "User Growth & Telegram Members",
    type: "Audience",
    description: "Registered profiles, Telegram ID bindings, referral attribution, and balances.",
    format: "CSV",
    icon: Users,
    color: "purple",
  },
  {
    id: "draws",
    name: "Provably Fair Draws & Winners",
    type: "Compliance",
    description: "Winning ticket numbers, snapshot SHA-256 hashes, and random seed records.",
    format: "CSV",
    icon: Trophy,
    color: "amber",
  },
];

export default function AdminReportsClient() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalCampaigns: number;
    totalEntries: number;
    totalPayments: number;
  }>({
    totalUsers: 0,
    totalCampaigns: 0,
    totalEntries: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDownload = async (typeId: string) => {
    setDownloadingId(typeId);
    try {
      const link = document.createElement("a");
      link.href = `/api/admin/reports?type=${typeId}`;
      link.setAttribute("download", `MilkyTech_${typeId}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Failed to export report");
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-emerald-600" /> Real Reports & Data Export
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and download live on-demand financial ledgers, user analytics, and provably fair draw logs.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Database Stats</span>
        </button>
      </div>

      {/* Real Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Registered Users</p>
          <h3 className="text-2xl font-black text-slate-900">{stats.totalUsers}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Live active database profiles</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Campaigns</p>
          <h3 className="text-2xl font-black text-slate-900">{stats.totalCampaigns}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Active & completed grand draws</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tickets Registered</p>
          <h3 className="text-2xl font-black text-slate-900">{stats.totalEntries}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Total entry tickets purchased</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Submissions</p>
          <h3 className="text-2xl font-black text-slate-900">{stats.totalPayments}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Manual deposit verification slips</p>
        </div>
      </div>

      {/* Real Report Exporters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REPORT_TYPES.map((rep) => {
          const Icon = rep.icon;
          const isDownloading = downloadingId === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => handleDownload(rep.id)}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                  rep.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                  rep.color === "blue" ? "bg-blue-50 text-blue-600" :
                  rep.color === "purple" ? "bg-purple-50 text-purple-600" :
                  "bg-amber-50 text-amber-600"
                } group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full uppercase">
                  {rep.format}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{rep.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{rep.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Generating Live CSV...</span>
                    </>
                  ) : (
                    <>
                      <span>Download Full CSV</span>
                      <ArrowDownToLine className="w-4 h-4" />
                    </>
                  )}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">100% Live DB Data</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
