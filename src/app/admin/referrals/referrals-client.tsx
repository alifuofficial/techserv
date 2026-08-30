"use client";

import { useState } from "react";
import {
  Search,
  Users,
  MoreVertical,
  Download,
  Eye,
  Link as LinkIcon,
  DollarSign,
  TrendingUp,
  Ban,
  CheckCircle2,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReferrerItem {
  id: string;
  user: string;
  email: string;
  code: string;
  referrals: number;
  conversion: string;
  earnings: string;
  earningsValue: number;
  status: string;
}

interface ReferralStats {
  activeAffiliates: number;
  totalReferredUsers: number;
  totalCommissions: string;
  topEarner: string;
}

export default function AdminReferralsClient({
  initialReferrers,
  stats,
  currency = "ETB",
}: {
  initialReferrers: ReferrerItem[];
  stats: ReferralStats;
  currency?: string;
}) {
  const [referrers, setReferrers] = useState<ReferrerItem[]>(initialReferrers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const updateStatus = async (id: string, newStatus: string) => {
    setReferrers((prev) =>
      prev.map((ref) => (ref.id === id ? { ...ref, status: newStatus } : ref))
    );
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered referrers
  const filteredReferrers = referrers.filter((ref) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      ref.user.toLowerCase().includes(query) ||
      ref.email.toLowerCase().includes(query) ||
      ref.code.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || ref.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReferrers.length / pageSize) || 1;
  const paginatedReferrers = filteredReferrers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportCSV = () => {
    const headers = ["Referrer,Email,Referral Code,Total Referrals,Earnings,Status\n"];
    const rows = filteredReferrers.map(
      (r) =>
        `"${r.user}","${r.email}","${r.code}",${r.referrals},"${r.earnings}","${r.status}"`
    );
    const blob = new Blob([headers.concat(rows.join("\n")).join("")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `referrals_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Referral Program</h1>
          <p className="text-sm text-slate-500">
            Live monitoring of affiliate invitations, user acquisition, and rewarded commissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Active Affiliates</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {stats.activeAffiliates.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Referred Users</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {stats.totalReferredUsers.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Commissions</p>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {stats.totalCommissions}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Top Earner</p>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 truncate" title={stats.topEarner}>
            {stats.topEarner}
          </h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Referrer, Email, or Code..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended</option>
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
              {paginatedReferrers.map((ref) => (
                <tr key={ref.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                      {ref.user.charAt(0).toUpperCase()}
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
                  <td className="px-6 py-4 font-bold text-slate-900">{ref.referrals} Friends</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{ref.conversion}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{ref.earnings}</td>
                  <td className="px-6 py-4">
                    {ref.status === "ACTIVE" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/60 shadow-sm">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                        <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-3 py-2">
                          Affiliate Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        {ref.status === "ACTIVE" ? (
                          <DropdownMenuItem
                            onClick={() => updateStatus(ref.id, "SUSPENDED")}
                            className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                          >
                            <Ban className="w-4 h-4" /> Suspend Code
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => updateStatus(ref.id, "ACTIVE")}
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

              {filteredReferrers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No affiliates or referrals found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Real Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing{" "}
            <b>{filteredReferrers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</b> to{" "}
            <b>{Math.min(currentPage * pageSize, filteredReferrers.length)}</b> of{" "}
            <b>{filteredReferrers.length}</b> affiliates
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
