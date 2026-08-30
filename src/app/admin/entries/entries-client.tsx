"use client";

import { useState } from "react";
import { Search, Ticket, MoreVertical, Download, Eye, RotateCcw, Trash2, CheckCircle2, Trophy, DollarSign, Layers, X, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EntryItem {
  id: string;
  entryNumber: number;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  campaignId: string;
  campaignTitle: string;
  campaignPrice: number;
  currency: string;
  paymentId: string | null;
  paymentTxId: string | null;
  paymentProvider: string | null;
  status: string;
  createdAt: string;
  formattedDate: string;
}

interface CampaignOption {
  id: string;
  title: string;
}

export default function EntriesClient({
  initialEntries,
  campaigns,
}: {
  initialEntries: EntryItem[];
  campaigns: CampaignOption[];
}) {
  const [entries, setEntries] = useState<EntryItem[]>(initialEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<EntryItem | null>(null);
  const pageSize = 25;

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );

    try {
      await fetch(`/api/admin/entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticket entry?")) return;

    setEntries((prev) => prev.filter((e) => e.id !== id));

    try {
      await fetch(`/api/admin/entries/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.userPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.paymentTxId && entry.paymentTxId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCampaign =
      campaignFilter === "ALL" || entry.campaignId === campaignFilter;

    const matchesStatus =
      statusFilter === "ALL" || entry.status === statusFilter;

    return matchesSearch && matchesCampaign && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalTickets = entries.length;
  const validTickets = entries.filter((e) => e.status === "VALID").length;
  const winningTickets = entries.filter((e) => e.status === "WINNER").length;
  const totalRevenue = entries.reduce((acc, e) => acc + (e.campaignPrice || 0), 0);

  const exportCSV = () => {
    const headers = ["Ticket ID", "Entry #", "User Name", "Email", "Phone", "Campaign", "Price", "Currency", "TxID", "Provider", "Status", "Date"];
    const rows = filteredEntries.map((e) => [
      e.ticketNumber,
      e.entryNumber,
      `"${e.userName.replace(/"/g, '""')}"`,
      e.userEmail,
      e.userPhone,
      `"${e.campaignTitle.replace(/"/g, '""')}"`,
      e.campaignPrice,
      e.currency,
      e.paymentTxId || "N/A",
      e.paymentProvider || "N/A",
      e.status,
      e.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `entries_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaign Entries & Tickets</h1>
          <p className="text-sm text-slate-500">Live record of all lucky tickets generated across campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV ({filteredEntries.length})
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Entries Sold</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{totalTickets.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Valid Tickets</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{validTickets.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Winning Entries</p>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{winningTickets.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Ticket Revenue</p>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{totalRevenue.toLocaleString()} ETB</h3>
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
            placeholder="Search Ticket, User, Campaign, or TxID..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={campaignFilter}
            onChange={(e) => {
              setCampaignFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">All Campaigns ({campaigns.length})</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">All Status</option>
            <option value="VALID">Valid</option>
            <option value="WINNER">Winner</option>
            <option value="REFUNDED">Refunded</option>
            <option value="VOID">Void</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Ticket Number</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Payment TxID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 text-emerald-700 font-mono">
                        {entry.ticketNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 mb-0.5">{entry.userName}</div>
                    <div className="text-xs text-slate-500">{entry.userEmail || entry.userPhone || "No email"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 max-w-[200px] truncate" title={entry.campaignTitle}>
                      {entry.campaignTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {entry.campaignPrice.toLocaleString()} {entry.currency}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 max-w-[140px] truncate">
                      {entry.paymentTxId || "Direct"}
                    </div>
                    {entry.paymentProvider && (
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">
                        {entry.paymentProvider}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">{entry.formattedDate}</td>
                  <td className="px-6 py-4">
                    {entry.status === "VALID" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/60 shadow-sm">
                        Valid
                      </span>
                    )}
                    {entry.status === "WINNER" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">
                        🏆 Winner
                      </span>
                    )}
                    {entry.status === "REFUNDED" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/60 shadow-sm">
                        Refunded
                      </span>
                    )}
                    {entry.status === "VOID" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/60 shadow-sm">
                        Void
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-lg rounded-xl">
                        <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-3 py-2">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />

                        <DropdownMenuItem
                          onClick={() => setSelectedEntry(entry)}
                          className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3"
                        >
                          <Eye className="w-4 h-4" /> View Details
                        </DropdownMenuItem>

                        {entry.status !== "WINNER" && (
                          <DropdownMenuItem
                            onClick={() => updateStatus(entry.id, "WINNER")}
                            className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 text-sm py-2 px-3 font-semibold"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Mark as Winner
                          </DropdownMenuItem>
                        )}

                        {entry.status === "VALID" && (
                          <DropdownMenuItem
                            onClick={() => updateStatus(entry.id, "REFUNDED")}
                            className="cursor-pointer flex items-center gap-2 text-amber-600 focus:bg-amber-50 focus:text-amber-700 text-sm py-2 px-3"
                          >
                            <RotateCcw className="w-4 h-4" /> Issue Refund
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem
                          onClick={() => deleteEntry(entry.id)}
                          className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Entry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No entries found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing {filteredEntries.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredEntries.length)} of {filteredEntries.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Prev
            </button>
            <span className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg font-bold shadow-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-lg text-slate-900">Ticket Details</h2>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Ticket Number</span>
                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedEntry.ticketNumber}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Campaign</span>
                <span className="font-semibold text-slate-800 text-right">{selectedEntry.campaignTitle}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">User Name</span>
                <span className="font-semibold text-slate-800">{selectedEntry.userName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">User Email</span>
                <span className="text-slate-700">{selectedEntry.userEmail || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">User Phone</span>
                <span className="text-slate-700">{selectedEntry.userPhone || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Price</span>
                <span className="font-bold text-slate-900">
                  {selectedEntry.campaignPrice} {selectedEntry.currency}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Payment TxID</span>
                <span className="font-mono text-xs text-slate-800">{selectedEntry.paymentTxId || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Payment Provider</span>
                <span className="font-bold text-xs uppercase text-slate-800">{selectedEntry.paymentProvider || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Purchased Date</span>
                <span className="text-slate-700">{selectedEntry.formattedDate}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {selectedEntry.status}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
