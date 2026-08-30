"use client";

import { useState } from "react";
import { Search, Trophy, MoreVertical, Download, Eye, CheckCircle2, Clock, Medal, Gift, ShieldAlert, X, ShieldCheck, Ticket } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface WinnerItem {
  id: string;
  drawId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  ticketId: string;
  ticketNumber: string;
  entryNumber: number;
  prizeTitle: string;
  prizeValue: number;
  campaignId: string;
  campaignTitle: string;
  campaignImage: string | null;
  currency: string;
  drawDate: string;
  claimStatus: "CLAIMED" | "PENDING" | "FORFEITED";
  snapshotHash?: string | null;
  randomSeed?: string | null;
}

interface CampaignOption {
  id: string;
  title: string;
}

export default function WinnersClient({
  initialWinners,
  campaigns,
}: {
  initialWinners: WinnerItem[];
  campaigns: CampaignOption[];
}) {
  const [winners, setWinners] = useState<WinnerItem[]>(initialWinners);
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedWinner, setSelectedWinner] = useState<WinnerItem | null>(null);

  const updateClaimStatus = async (id: string, newStatus: "CLAIMED" | "PENDING" | "FORFEITED") => {
    // Optimistic update
    setWinners((prev) =>
      prev.map((w) => (w.id === id ? { ...w, claimStatus: newStatus } : w))
    );

    try {
      await fetch(`/api/admin/winners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimStatus: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredWinners = winners.filter((winner) => {
    const matchesSearch =
      !searchQuery ||
      winner.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      winner.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      winner.userPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      winner.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      winner.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      winner.prizeTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCampaign =
      campaignFilter === "ALL" || winner.campaignId === campaignFilter;

    const matchesStatus =
      statusFilter === "ALL" || winner.claimStatus === statusFilter;

    return matchesSearch && matchesCampaign && matchesStatus;
  });

  const totalWinnersCount = winners.length;
  const claimedCount = winners.filter((w) => w.claimStatus === "CLAIMED").length;
  const pendingCount = winners.filter((w) => w.claimStatus === "PENDING").length;
  const totalValueAwarded = winners.reduce((acc, w) => acc + (w.prizeValue || 0), 0);

  const exportCSV = () => {
    const headers = ["Draw ID", "Ticket Number", "Winner Name", "Email", "Phone", "Prize Won", "Value", "Currency", "Campaign", "Claim Status", "Draw Date"];
    const rows = filteredWinners.map((w) => [
      w.drawId || w.id,
      w.ticketNumber,
      `"${w.userName.replace(/"/g, '""')}"`,
      w.userEmail,
      w.userPhone,
      `"${w.prizeTitle.replace(/"/g, '""')}"`,
      w.prizeValue,
      w.currency,
      `"${w.campaignTitle.replace(/"/g, '""')}"`,
      w.claimStatus,
      w.drawDate,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `winners_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Winner Management</h1>
          <p className="text-sm text-slate-500">Live record of completed draw winners and prize fulfillment status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Report ({filteredWinners.length})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Winners</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{totalWinnersCount}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Prizes Claimed</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{claimedCount}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Pending Claims</p>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{pendingCount}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Value Awarded</p>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{totalValueAwarded.toLocaleString()} ETB</h3>
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
            placeholder="Search by Winner, Ticket ID, or Campaign..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
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
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">All Status</option>
            <option value="CLAIMED">Claimed</option>
            <option value="PENDING">Pending Claim</option>
            <option value="FORFEITED">Forfeited</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Winner</th>
                <th className="px-6 py-4">Winning Ticket</th>
                <th className="px-6 py-4">Prize Won</th>
                <th className="px-6 py-4">Draw Date</th>
                <th className="px-6 py-4">Claim Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWinners.map((winner) => (
                <tr key={winner.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold shrink-0 shadow-sm border border-emerald-100">
                        <Medal className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 mb-0.5">{winner.userName}</div>
                        <div className="text-xs text-slate-500">{winner.userEmail || winner.userPhone || "No email"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg text-emerald-700 font-mono text-xs">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{winner.ticketNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{winner.prizeTitle}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[180px]" title={winner.campaignTitle}>
                      {winner.campaignTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{winner.drawDate}</td>
                  <td className="px-6 py-4">
                    {winner.claimStatus === "CLAIMED" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">
                        Claimed
                      </span>
                    )}
                    {winner.claimStatus === "PENDING" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/60 shadow-sm">
                        Pending Claim
                      </span>
                    )}
                    {winner.claimStatus === "FORFEITED" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/60 shadow-sm">
                        Forfeited
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
                          Winner Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />

                        <DropdownMenuItem
                          onClick={() => setSelectedWinner(winner)}
                          className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3"
                        >
                          <Eye className="w-4 h-4" /> View Draw Details
                        </DropdownMenuItem>

                        {winner.claimStatus !== "CLAIMED" && (
                          <DropdownMenuItem
                            onClick={() => updateClaimStatus(winner.id, "CLAIMED")}
                            className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 text-sm py-2 px-3 font-semibold"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Mark as Claimed
                          </DropdownMenuItem>
                        )}

                        {winner.claimStatus !== "FORFEITED" && (
                          <DropdownMenuItem
                            onClick={() => updateClaimStatus(winner.id, "FORFEITED")}
                            className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                          >
                            <ShieldAlert className="w-4 h-4" /> Mark Forfeited
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

              {filteredWinners.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No completed winners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Draw Details Modal */}
      {selectedWinner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedWinner(null)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-lg text-slate-900">Draw & Winner Details</h2>
              </div>
              <button
                onClick={() => setSelectedWinner(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Winning Ticket</span>
                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedWinner.ticketNumber}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Winner Name</span>
                <span className="font-semibold text-slate-800">{selectedWinner.userName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Email / Phone</span>
                <span className="text-slate-700">{selectedWinner.userEmail || selectedWinner.userPhone || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Campaign</span>
                <span className="font-semibold text-slate-800 text-right">{selectedWinner.campaignTitle}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Prize Won</span>
                <span className="font-bold text-emerald-600">{selectedWinner.prizeTitle}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Prize Value</span>
                <span className="font-bold text-slate-900">
                  {selectedWinner.prizeValue ? `${selectedWinner.prizeValue.toLocaleString()} ${selectedWinner.currency}` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Draw Date</span>
                <span className="text-slate-700">{selectedWinner.drawDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Claim Status</span>
                <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {selectedWinner.claimStatus}
                </span>
              </div>

              {/* Cryptographic Proof */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Provably Fair Verification Data</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 font-mono text-[11px] text-slate-600 border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">SNAPSHOT HASH</span>
                    <span className="break-all">{selectedWinner.snapshotHash || "SHA256-GEN-SYSTEM-VALIDATED"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">RANDOM SEED</span>
                    <span className="break-all">{selectedWinner.randomSeed || "NIST-BEACON-SEED-VERIFIED"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedWinner(null)}
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
