"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  Phone,
  Building2,
  Download,
  Filter,
  RefreshCw,
  Eye,
  AlertCircle,
  Check,
  X,
  Send,
  Loader2,
} from "lucide-react";

export interface WithdrawalRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  telegramId: string;
  amount: number;
  currency: string;
  provider: string;
  accountName: string;
  accountNumber: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  adminTxId?: string | null;
  rejectionReason?: string | null;
}

interface WithdrawalsClientProps {
  initialWithdrawals: WithdrawalRecord[];
  initialStats: {
    totalPendingCount: number;
    totalPendingAmount: number;
    totalApprovedCount: number;
    totalApprovedAmount: number;
    totalRejectedCount: number;
    totalCount: number;
  };
}

export default function WithdrawalsClient({
  initialWithdrawals = [],
  initialStats,
}: WithdrawalsClientProps) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(initialWithdrawals || []);
  const [stats, setStats] = useState(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [providerFilter, setProviderFilter] = useState("ALL");

  const safeStats = {
    totalPendingCount: stats?.totalPendingCount || 0,
    totalPendingAmount: stats?.totalPendingAmount || 0,
    totalApprovedCount: stats?.totalApprovedCount || 0,
    totalApprovedAmount: stats?.totalApprovedAmount || 0,
    totalRejectedCount: stats?.totalRejectedCount || 0,
    totalCount: stats?.totalCount || 0,
  };

  // Action Modals State
  const [approvingItem, setApprovingItem] = useState<WithdrawalRecord | null>(null);
  const [rejectingItem, setRejectingItem] = useState<WithdrawalRecord | null>(null);
  const [adminTxId, setAdminTxId] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const refreshData = async () => {
    try {
      const res = await fetch("/api/admin/withdrawals");
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.withdrawals || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Approve Withdrawal
  const handleConfirmApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingItem || isProcessing) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE",
          paymentId: approvingItem.id,
          adminTxId: adminTxId.trim() || `TXN-${Date.now()}`,
          note: adminNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to approve withdrawal");
      }

      alert("🎉 Withdrawal marked as APPROVED & notification sent to user!");
      setApprovingItem(null);
      setAdminTxId("");
      setAdminNote("");
      refreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Reject Withdrawal (Auto-refunds wallet balance)
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem || isProcessing) return;

    if (!rejectionReason.trim()) {
      alert("Please specify a rejection reason.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          paymentId: rejectingItem.id,
          rejectionReason: rejectionReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reject withdrawal");
      }

      alert("⚠️ Withdrawal REJECTED and funds automatically REFUNDED to user's wallet!");
      setRejectingItem(null);
      setRejectionReason("");
      refreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredWithdrawals = (withdrawals || []).filter((w) => {
    if (!w) return false;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (w.userName || "").toLowerCase().includes(query) ||
      (w.userEmail || "").toLowerCase().includes(query) ||
      (w.accountName || "").toLowerCase().includes(query) ||
      (w.accountNumber || "").toLowerCase().includes(query) ||
      (w.adminTxId || "").toLowerCase().includes(query);

    const matchesStatus = statusFilter === "ALL" || w.status === statusFilter;
    const matchesProvider = providerFilter === "ALL" || w.provider === providerFilter;

    return matchesSearch && matchesStatus && matchesProvider;
  });

  const exportCSV = () => {
    const headers = ["ID", "User Name", "Email", "Amount", "Currency", "Channel", "Account Name", "Account Number", "Status", "Admin Tx ID", "Rejection Reason", "Requested At"];
    const rows = filteredWithdrawals.map((w) => [
      w.id,
      `"${(w.userName || "").replace(/"/g, '""')}"`,
      w.userEmail || "",
      w.amount || 0,
      w.currency || "ETB",
      w.provider || "",
      `"${(w.accountName || "").replace(/"/g, '""')}"`,
      `"${(w.accountNumber || "").replace(/"/g, '""')}"`,
      w.status,
      w.adminTxId || "",
      `"${(w.rejectionReason || "").replace(/"/g, '""')}"`,
      w.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `withdrawals-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowDownToLine className="w-6 h-6 text-emerald-600" /> Withdrawal Requests Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and process player payouts for Telebirr, CBE Birr, and Bank Accounts with automated ledger refunds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={refreshData}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Pending Requests */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Payouts</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-amber-600">{safeStats.totalPendingCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting admin transfer</p>
        </div>

        {/* Card 2: Total Pending Amount */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Volume</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Wallet className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {safeStats.totalPendingAmount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ETB</span>
          </h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Total pending to payout</p>
        </div>

        {/* Card 3: Approved / Paid Amount */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Paid Out</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600">
            {safeStats.totalApprovedAmount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ETB</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{safeStats.totalApprovedCount} completed transfers</p>
        </div>

        {/* Card 4: Rejected Requests */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected Requests</p>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl"><XCircle className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-red-600">{safeStats.totalRejectedCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Automatically refunded</p>
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
            placeholder="Search by user, account, phone or Tx ID..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved & Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Provider Filter */}
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">All Channels</option>
            <option value="TELEBIRR">Telebirr</option>
            <option value="CBE">CBE Birr / Bank</option>
            <option value="AWASH">Awash Bank</option>
            <option value="BOA">Bank of Abyssinia</option>
          </select>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payout Channel</th>
                <th className="px-6 py-4">Destination Account</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Requested At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWithdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{w.userName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {w.userEmail || (w.telegramId ? `@tg_${w.telegramId}` : `@user_${w.userId.slice(-4)}`)}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 font-mono text-sm">
                      {(w.amount || 0).toLocaleString()} {w.currency || "ETB"}
                    </div>
                  </td>

                  {/* Channel */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">
                      {w.provider === "TELEBIRR" && <Phone className="w-3.5 h-3.5 text-emerald-500" />}
                      {w.provider === "CBE" && <Building2 className="w-3.5 h-3.5 text-purple-500" />}
                      {w.provider === "AWASH" && <Building2 className="w-3.5 h-3.5 text-blue-500" />}
                      {w.provider === "BOA" && <Building2 className="w-3.5 h-3.5 text-amber-500" />}
                      {w.provider}
                    </span>
                  </td>

                  {/* Destination */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-xs">{w.accountName}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{w.accountNumber}</div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    {w.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {w.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    )}
                    {w.status === "REJECTED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-right text-xs text-slate-500 font-mono">
                    {new Date(w.createdAt).toLocaleString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {w.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setApprovingItem(w);
                            setAdminTxId("");
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectingItem(w);
                            setRejectionReason("");
                          }}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 font-mono">
                        {w.adminTxId ? `Tx: ${w.adminTxId}` : w.rejectionReason ? `Reason: ${w.rejectionReason}` : "Finalized"}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 space-y-2">
                    <ArrowDownToLine className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600 text-sm">No withdrawal requests found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {approvingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Approve Payout Transfer
              </h3>
              <button
                onClick={() => setApprovingItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Player:</span>
                <span className="font-bold text-slate-900">{approvingItem.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-emerald-600">{(approvingItem.amount || 0).toLocaleString()} {approvingItem.currency || "ETB"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-slate-900">{approvingItem.provider} • {approvingItem.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Name:</span>
                <span className="font-bold text-slate-900">{approvingItem.accountName}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmApprove} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Bank / Telebirr Transaction ID (Reference) *
                </label>
                <input
                  type="text"
                  required
                  value={adminTxId}
                  onChange={(e) => setAdminTxId(e.target.value)}
                  placeholder="e.g. 78249827398 or TXN-12345"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Optional Admin Note
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Optional internal note"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApprovingItem(null)}
                  className="py-2 px-4 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Confirm & Send Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" /> Reject Withdrawal & Refund Wallet
              </h3>
              <button
                onClick={() => setRejectingItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-red-50 rounded-2xl text-xs space-y-1 border border-red-100">
              <p className="text-red-800 font-semibold">
                Rejecting this request will automatically refund <strong>{(rejectingItem.amount || 0).toLocaleString()} {rejectingItem.currency || "ETB"}</strong> back to {rejectingItem.userName}'s wallet balance.
              </p>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Rejection Reason * (Visible to Player)
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Account name does not match phone number, or invalid account number."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="py-2 px-4 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  <span>Reject & Refund Wallet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
