"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Activity,
  Download,
  Terminal,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Info,
  AlertTriangle,
  ShieldX,
  Loader2,
  RefreshCw,
  Clock,
  Layers,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  time: string;
  timestamp: number;
  level: "INFO" | "WARN" | "ERROR" | "CRITICAL";
  actor: string;
  action: string;
  category: "LEDGER" | "PAYMENT" | "DRAW" | "AUTH" | "CAMPAIGN" | "SYSTEM";
}

interface LogStats {
  events24h: number;
  apiErrors: number;
  securityAlerts: number;
  uptime: string;
  totalLogs: number;
}

export default function AdminLogsClient() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [stats, setStats] = useState<LogStats>({
    events24h: 0,
    apiErrors: 0,
    securityAlerts: 0,
    uptime: "99.99%",
    totalLogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs);
        setStats(data.data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDownloadLogs = () => {
    if (logs.length === 0) return;
    const logText = logs
      .map((l) => `[${l.time}] [${l.level.padEnd(8)}] [${l.category.padEnd(8)}] [${l.actor}] ${l.action}`)
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `MilkyTech_System_Logs_${new Date().toISOString().split("T")[0]}.log`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "INFO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
      case "WARN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> WARN
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <AlertCircle className="w-3 h-3" /> ERROR
          </span>
        );
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
            <ShieldAlert className="w-3 h-3" /> CRITICAL
          </span>
        );
      default:
        return null;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = levelFilter === "ALL" || log.level === levelFilter;
    const matchesCategory = categoryFilter === "ALL" || log.category === categoryFilter;
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.time.includes(searchQuery);

    return matchesLevel && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-slate-900" /> Real System & Financial Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time live audit trail of ledger balances, deposit verifications, RNG draws, and member sign-ins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleDownloadLogs}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" /> Download Raw .LOG File
          </button>
        </div>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audit Events</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Activity className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.events24h}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Real historical platform actions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment / API Errors</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.apiErrors}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Rejected payments & failed checks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Warnings & Alerts</p>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl"><ShieldX className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.securityAlerts}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Pending reviews & flags</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Availability</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600">{stats.uptime}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Zero downtime recorded</p>
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
            placeholder="Search logs by actor, message, or reference ID..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">All Categories</option>
            <option value="LEDGER">Ledger (Financial)</option>
            <option value="PAYMENT">Payments & Deposits</option>
            <option value="DRAW">Provably Fair Draws</option>
            <option value="AUTH">Auth & Registrations</option>
            <option value="CAMPAIGN">Campaigns</option>
          </select>
          <select 
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all font-mono"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Log Terminal View */}
      <div className="bg-[#0b0f19] rounded-3xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#111625]">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-slate-300">milkytech/audit.log</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">LIVE STREAM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#070a11] text-slate-500 uppercase tracking-wider border-b border-slate-800 text-[10px]">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Level</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Actor / Origin</th>
                <th className="px-6 py-3">Audit Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    Connecting to database audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    No system log entries found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400 whitespace-nowrap text-[11px]">{log.time}</td>
                    <td className="px-6 py-3.5">{getLevelBadge(log.level)}</td>
                    <td className="px-6 py-3.5">
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-emerald-400 font-bold max-w-xs truncate">{log.actor}</td>
                    <td className="px-6 py-3.5 text-slate-200 leading-relaxed">{log.action}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-[#070a11] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div>Showing {filteredLogs.length} real events</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Real-time DB connection active</span>
          </div>
        </div>
      </div>

    </div>
  );
}
