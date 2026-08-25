"use client";

import { useState } from "react";
import { Search, Activity, Download, Filter, Terminal, AlertCircle, ShieldAlert, CheckCircle2, Info, AlertTriangle, ShieldX } from "lucide-react";

const initialLogs = [
  { id: "LOG-09281", time: "2026-08-21 14:10:02", level: "INFO", actor: "admin@milkytech.online", action: "Generated Campaign ROI Report (PDF)" },
  { id: "LOG-09280", time: "2026-08-21 13:45:12", level: "WARN", actor: "System", action: "High traffic spike detected on /campaigns" },
  { id: "LOG-09279", time: "2026-08-21 12:30:45", level: "ERROR", actor: "192.168.1.45", action: "Failed payment callback from Telebirr API (Timeout)" },
  { id: "LOG-09278", time: "2026-08-21 11:15:00", level: "CRITICAL", actor: "10.0.0.8", action: "Multiple failed login attempts for admin account (Blocked)" },
  { id: "LOG-09277", time: "2026-08-21 09:00:21", level: "INFO", actor: "kaleb.y@example.com", action: "User KYC submitted (National ID)" },
  { id: "LOG-09276", time: "2026-08-21 08:30:14", level: "INFO", actor: "System", action: "Daily database backup completed successfully" },
  { id: "LOG-09275", time: "2026-08-20 23:45:00", level: "WARN", actor: "System", action: "Ledger imbalance detected and auto-corrected (Tx: 99812)" },
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState(initialLogs);
  const [filter, setFilter] = useState("ALL");

  const filteredLogs = filter === "ALL" ? logs : logs.filter(log => log.level === filter);

  const getLevelBadge = (level: string) => {
    switch(level) {
      case 'INFO': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/60"><Info className="w-3 h-3" /> INFO</span>;
      case 'WARN': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/60"><AlertTriangle className="w-3 h-3" /> WARN</span>;
      case 'ERROR': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-red-50 text-red-600 border border-red-200/60"><AlertCircle className="w-3 h-3" /> ERROR</span>;
      case 'CRITICAL': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200/60 animate-pulse"><ShieldAlert className="w-3 h-3" /> CRITICAL</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System & Audit Logs</h1>
          <p className="text-sm text-slate-500">Monitor admin actions, system events, API errors, and security alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 transition-all">
            <Download className="w-4 h-4" /> Download Raw Logs
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Events (24h)</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Activity className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">14,209</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">API Errors</p>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">23</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Security Alerts</p>
            <div className="p-2 bg-red-50 text-red-500 rounded-lg"><ShieldX className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 text-red-600">2</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Uptime</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">99.99%</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search logs by IP, actor, or message..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-mono"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all font-mono"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> Date Range
          </button>
        </div>
      </div>

      {/* Log Terminal / Table */}
      <div className="bg-[#0f172a] rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-400">system/tail.log - Live</span>
          <div className="ml-auto flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Level</th>
                <th className="px-6 py-3">Actor / IP</th>
                <th className="px-6 py-3">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-3 text-slate-400 whitespace-nowrap">{log.time}</td>
                  <td className="px-6 py-3">{getLevelBadge(log.level)}</td>
                  <td className="px-6 py-3 text-emerald-400/80">{log.actor}</td>
                  <td className="px-6 py-3 text-slate-300 w-full">{log.action}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No logs matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
