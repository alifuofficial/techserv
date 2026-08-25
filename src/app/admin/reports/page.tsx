"use client";

import { useState } from "react";
import { Search, FileText, Download, Filter, FileBarChart, PieChart, Users, ArrowDownToLine, RefreshCw, FileCheck, Calendar, Activity } from "lucide-react";

const recentReports = [
  { id: "REP-9921", name: "August Financial Summary", type: "Financial", date: "Aug 21, 2026", format: "CSV", status: "READY", size: "1.2 MB" },
  { id: "REP-8831", name: "iPhone 17 Campaign ROI", type: "Campaign", date: "Aug 20, 2026", format: "PDF", status: "READY", size: "4.5 MB" },
  { id: "REP-4421", name: "Q3 User Acquisition", type: "Analytics", date: "Aug 15, 2026", format: "CSV", status: "READY", size: "890 KB" },
  { id: "REP-1102", name: "Failed Payments Log", type: "System", date: "Aug 14, 2026", format: "XLSX", status: "PROCESSING", size: "--" },
  { id: "REP-0991", name: "KYC Rejection Audit", type: "Compliance", date: "Aug 10, 2026", format: "PDF", status: "READY", size: "2.1 MB" },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState(recentReports);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReports([
        { id: `REP-${Math.floor(Math.random() * 10000)}`, name: "Custom Platform Export", type: "Custom", date: "Just now", format: "CSV", status: "READY", size: "540 KB" },
        ...reports
      ]);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Generate financial statements, campaign performance, and compliance reports.</p>
        </div>
      </div>

      {/* Report Generators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors group cursor-pointer" onClick={handleGenerate}>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <FileBarChart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-1">Financial Report</h3>
          <p className="text-sm text-slate-500 mb-4">Export ledger transactions, total revenue, and merchant commissions.</p>
          <button className="text-emerald-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            Generate CSV <ArrowDownToLine className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors group cursor-pointer" onClick={handleGenerate}>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <PieChart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-1">Campaign ROI</h3>
          <p className="text-sm text-slate-500 mb-4">Analyze ticket sales, conversion rates, and prize distribution costs.</p>
          <button className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            Generate PDF <ArrowDownToLine className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 transition-colors group cursor-pointer" onClick={handleGenerate}>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-1">User Acquisition</h3>
          <p className="text-sm text-slate-500 mb-4">Export active users, KYC statuses, and referral network performance.</p>
          <button className="text-purple-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            Generate XLSX <ArrowDownToLine className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center mt-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search report history..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Types</option>
            <option>Financial</option>
            <option>Campaign</option>
            <option>Compliance</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> Advanced Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-slate-900">Recent Reports</h2>
          {isGenerating && (
            <span className="flex items-center gap-2 text-sm text-emerald-600 font-medium animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" /> Generating new report...
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Report Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Generated On</th>
                <th className="px-6 py-4">Format</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div className="font-bold text-slate-900">{report.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{report.date}</td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-500">{report.format}</td>
                  <td className="px-6 py-4 text-slate-500">{report.size}</td>
                  <td className="px-6 py-4">
                    {report.status === 'READY' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm"><FileCheck className="w-3 h-3" /> Ready</span>}
                    {report.status === 'PROCESSING' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/60 shadow-sm"><RefreshCw className="w-3 h-3 animate-spin" /> Processing</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      disabled={report.status !== 'READY'}
                      className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors border border-slate-100 hover:border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                    </button>
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
