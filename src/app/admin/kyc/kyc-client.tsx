"use client";

import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  MoreVertical,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  UserCheck,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  RefreshCw,
  X,
  Wallet,
  Ticket,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KycItem {
  id: string;
  userId: string;
  user: string;
  email: string;
  telegramId: string | null;
  type: string;
  date: string;
  risk: "Low" | "Medium" | "High";
  status: "VERIFIED" | "PENDING" | "REJECTED";
  reason: string | null;
  ticketsCount: number;
  paymentsCount: number;
  walletBalance: number;
}

interface KycStats {
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  highRiskCount: number;
  rejectionRate: string;
  totalCount: number;
}

export default function AdminKycClient() {
  const [kycRequests, setKycRequests] = useState<KycItem[]>([]);
  const [stats, setStats] = useState<KycStats>({
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    highRiskCount: 0,
    rejectionRate: "0.0%",
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<KycItem | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchKycData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kyc");
      const data = await res.json();
      if (data.success) {
        setKycRequests(data.data.kycRequests);
        setStats(data.data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycData();
  }, []);

  const updateStatus = async (userId: string, newStatus: "VERIFIED" | "PENDING" | "REJECTED", reason?: string) => {
    setIsUpdating(userId);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newStatus, reason }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setKycRequests((prev) =>
          prev.map((req) =>
            req.userId === userId ? { ...req, status: newStatus, reason: reason || null } : req
          )
        );
        // Refresh full stats
        fetchKycData();
        if (selectedUser && selectedUser.userId === userId) {
          setSelectedUser({ ...selectedUser, status: newStatus, reason: reason || null });
        }
      } else {
        alert(data.error || "Failed to update KYC status");
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating KYC status");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleExportCSV = () => {
    if (kycRequests.length === 0) return;
    const headers = "Reference ID,User Name,Email/Identifier,Telegram ID,Document Type,Risk Level,Date Registered,Status,Tickets Bought,Wallet Balance (ETB)\n";
    const rows = kycRequests
      .map(
        (r) =>
          `"${r.id}","${r.user}","${r.email}","${r.telegramId || 'N/A'}","${r.type}","${r.risk}","${r.date}","${r.status}","${r.ticketsCount}","${r.walletBalance.toFixed(2)}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `MilkyTech_KYC_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRequests = kycRequests.filter((req) => {
    const matchesSearch =
      req.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.telegramId && req.telegramId.includes(searchQuery));

    const matchesType = typeFilter === "ALL" || req.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" /> Real KYC & Identity Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review live registered user accounts, verify Telegram identity deep links, and approve withdrawal permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchKycData}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Reviews</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.pendingCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Requires admin approval</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Users</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><UserCheck className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.verifiedCount}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {stats.totalCount > 0 ? `${((stats.verifiedCount / stats.totalCount) * 100).toFixed(0)}% of total users` : "0%"}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejection Rate</p>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl"><AlertTriangle className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.rejectionRate}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{stats.rejectedCount} accounts rejected</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered</p>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><ShieldAlert className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.totalCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{stats.highRiskCount} high-risk flags</p>
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
            placeholder="Search by Name, Email, or Telegram ID..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">All Document Types</option>
            <option value="Telegram Verified ID">Telegram Verified ID</option>
            <option value="National ID">National ID</option>
            <option value="Passport">Passport</option>
            <option value="Driver's License">Driver&apos;s License</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Reference ID</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading real user records from database...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No KYC requests matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" /> {req.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 mb-0.5 flex items-center gap-1.5">
                        <span>{req.user}</span>
                        {req.telegramId && (
                          <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            TG: {req.telegramId}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{req.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        {req.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {req.risk === "Low" && <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg text-xs border border-emerald-100">Low</span>}
                      {req.risk === "Medium" && <span className="text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg text-xs border border-amber-100">Medium</span>}
                      {req.risk === "High" && <span className="text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-lg text-xs border border-red-100">High</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">{req.date}</td>
                    <td className="px-6 py-4">
                      {req.status === "VERIFIED" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"><CheckCircle2 className="w-3 h-3" /> Verified</span>}
                      {req.status === "PENDING" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 shadow-sm"><Clock className="w-3 h-3" /> Pending Review</span>}
                      {req.status === "REJECTED" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200 shadow-sm"><XCircle className="w-3 h-3" /> Rejected</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            disabled={isUpdating === req.userId}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20"
                          >
                            {isUpdating === req.userId ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <MoreVertical className="w-4 h-4" />}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                          <DropdownMenuLabel className="text-xs text-slate-500 font-bold uppercase tracking-wider px-3 py-2">Verification Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          
                          <DropdownMenuItem 
                            onClick={() => setSelectedUser(req)}
                            className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-xs py-2 px-3 font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Profile & Details
                          </DropdownMenuItem>
                          
                          {req.status !== "VERIFIED" && (
                            <DropdownMenuItem 
                              onClick={() => updateStatus(req.userId, "VERIFIED")}
                              className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 text-xs py-2 px-3 font-semibold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify
                            </DropdownMenuItem>
                          )}
                          
                          {req.status !== "REJECTED" && (
                            <DropdownMenuItem 
                              onClick={() => {
                                const reason = prompt("Enter reason for rejection (optional):");
                                if (reason !== null) {
                                  updateStatus(req.userId, "REJECTED", reason);
                                }
                              }}
                              className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-xs py-2 px-3 font-semibold"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject Verification
                            </DropdownMenuItem>
                          )}
                          
                          {req.status === "REJECTED" && (
                            <DropdownMenuItem 
                              onClick={() => updateStatus(req.userId, "PENDING")}
                              className="cursor-pointer flex items-center gap-2 text-amber-600 focus:bg-amber-50 focus:text-amber-700 text-xs py-2 px-3 font-semibold"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> Reset to Pending
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <div>Showing {filteredRequests.length} of {kycRequests.length} real registered user profiles</div>
        </div>
      </div>

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedUser.user}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedUser.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wallet Balance</span>
                <span className="text-lg font-black text-emerald-600 font-mono">
                  {selectedUser.walletBalance.toFixed(2)} ETB
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tickets Purchased</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {selectedUser.ticketsCount} Tickets
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">User Email / Account:</span>
                <span className="text-slate-900 font-bold">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Telegram User ID:</span>
                <span className="text-blue-600 font-mono font-bold">{selectedUser.telegramId || "Not Linked"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Document Type:</span>
                <span className="text-slate-900 font-bold">{selectedUser.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Registration Date:</span>
                <span className="text-slate-900 font-bold">{selectedUser.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Current Verification Status:</span>
                <span className="font-bold uppercase text-emerald-600">{selectedUser.status}</span>
              </div>
              {selectedUser.reason && (
                <div className="pt-2 border-t border-slate-200 text-red-600">
                  <span className="font-bold">Rejection Reason:</span> {selectedUser.reason}
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              {selectedUser.status !== "VERIFIED" && (
                <button
                  type="button"
                  onClick={() => updateStatus(selectedUser.userId, "VERIFIED")}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Account
                </button>
              )}
              {selectedUser.status !== "REJECTED" && (
                <button
                  type="button"
                  onClick={() => {
                    const reason = prompt("Enter reason for rejection (optional):");
                    if (reason !== null) {
                      updateStatus(selectedUser.userId, "REJECTED", reason);
                    }
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-all"
                >
                  <XCircle className="w-4 h-4" /> Reject Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
