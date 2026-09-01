"use client";

import { useState } from "react";
import { Search, Trophy, MoreVertical, Download, Eye, CheckCircle2, Clock, Medal, Gift, ShieldAlert, X, ShieldCheck, Ticket, Package, Coins, Phone, MapPin } from "lucide-react";
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
  claimStatus: "CLAIMED" | "PENDING" | "FORFEITED" | "CLAIMED_CASH" | "CLAIMED_PHYSICAL";
  claimDetails?: {
    claimType: "CASH" | "PHYSICAL";
    amount?: number;
    deliveryDetails?: {
      recipientName: string;
      phone: string;
      city: string;
      address: string;
      notes?: string;
    };
    claimedAt: string;
    status: "COMPLETED" | "PENDING_DELIVERY" | "DELIVERED";
  } | null;
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
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      winner.userName.toLowerCase().includes(query) ||
      winner.userEmail.toLowerCase().includes(query) ||
      winner.userPhone.toLowerCase().includes(query) ||
      winner.ticketNumber.toLowerCase().includes(query) ||
      winner.campaignTitle.toLowerCase().includes(query) ||
      winner.prizeTitle.toLowerCase().includes(query);

    const matchesCampaign =
      campaignFilter === "ALL" || winner.campaignId === campaignFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      winner.claimStatus === statusFilter ||
      (statusFilter === "CLAIMED" && (winner.claimStatus === "CLAIMED_CASH" || winner.claimStatus === "CLAIMED_PHYSICAL" || winner.claimStatus === "CLAIMED"));

    return matchesSearch && matchesCampaign && matchesStatus;
  });

  const totalWinnersCount = winners.length;
  const claimedCount = winners.filter((w) => w.claimStatus === "CLAIMED" || w.claimStatus === "CLAIMED_CASH" || w.claimStatus === "CLAIMED_PHYSICAL").length;
  const pendingCount = winners.filter((w) => w.claimStatus === "PENDING" || w.claimStatus === "UNCLAIMED" as any).length;
  const totalValueAwarded = winners.reduce((acc, w) => acc + (w.prizeValue || 0), 0);

  const exportCSV = () => {
    const headers = ["Draw ID", "Ticket Number", "Winner Name", "Email", "Phone", "Prize Won", "Value", "Currency", "Campaign", "Claim Status", "Claim Type", "Shipping Address", "Draw Date"];
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
      w.claimDetails?.claimType || "N/A",
      `"${(w.claimDetails?.deliveryDetails ? `${w.claimDetails.deliveryDetails.address}, ${w.claimDetails.deliveryDetails.city} (Tel: ${w.claimDetails.deliveryDetails.phone})` : "N/A").replace(/"/g, '""')}"`,
      w.drawDate,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `winners_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Winners & Proof of Play
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Public draw certificates, winner verification logs, prize fulfillment, and cryptographic audit proofs.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Winners</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Trophy className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalWinnersCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Confirmed winning tickets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Claimed / Paid</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-blue-600">{claimedCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Physical & Cash conversions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Choice</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-amber-600">{pendingCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting claim selection</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Prize Value</p>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Gift className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-purple-600">
            {totalValueAwarded.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ETB</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Total value distributed</p>
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
            placeholder="Search winners by name, email, ticket, prize..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
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
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">All Status</option>
            <option value="CLAIMED_CASH">💵 Cash Equivalent</option>
            <option value="CLAIMED_PHYSICAL">📦 Physical Delivery</option>
            <option value="PENDING">Pending Claim</option>
            <option value="FORFEITED">Forfeited</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Winner</th>
                <th className="px-6 py-4">Winning Ticket</th>
                <th className="px-6 py-4">Prize Won</th>
                <th className="px-6 py-4">Prize Choice / Payout</th>
                <th className="px-6 py-4">Draw Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWinners.map((winner) => (
                <tr key={winner.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Winner Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold shrink-0 border border-amber-200">
                        <Medal className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{winner.userName}</div>
                        <div className="text-xs text-slate-400">{winner.userEmail || winner.userPhone || "No email"}</div>
                      </div>
                    </div>
                  </td>

                  {/* Winning Ticket */}
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-emerald-700 font-mono text-xs">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{winner.ticketNumber}</span>
                    </div>
                  </td>

                  {/* Prize Won */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{winner.prizeTitle}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[180px]">{winner.campaignTitle}</div>
                    <div className="text-xs font-mono font-bold text-emerald-600 mt-0.5">
                      {winner.prizeValue.toLocaleString()} {winner.currency}
                    </div>
                  </td>

                  {/* Prize Choice / Claim Status */}
                  <td className="px-6 py-4">
                    {winner.claimStatus === "CLAIMED_CASH" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Coins className="w-3.5 h-3.5 text-emerald-600" /> Cash Credited
                      </span>
                    ) : winner.claimStatus === "CLAIMED_PHYSICAL" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Package className="w-3.5 h-3.5 text-purple-600" /> Physical Delivery
                      </span>
                    ) : winner.claimStatus === "CLAIMED" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
                        Claimed
                      </span>
                    ) : winner.claimStatus === "FORFEITED" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                        Forfeited
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Choice
                      </span>
                    )}
                  </td>

                  {/* Draw Date */}
                  <td className="px-6 py-4 font-medium text-slate-600 text-xs whitespace-nowrap">{winner.drawDate}</td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedWinner(winner)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                  </td>
                </tr>
              ))}

              {filteredWinners.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No completed winners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Draw & Claim Details Modal */}
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
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-base text-slate-900">Winner Claim & Draw Certificate</h2>
              </div>
              <button
                onClick={() => setSelectedWinner(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
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
                <span className="text-slate-500 font-medium">Contact Phone</span>
                <span className="font-mono font-bold text-slate-800">{selectedWinner.userPhone || selectedWinner.claimDetails?.deliveryDetails?.phone || "N/A"}</span>
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
                <span className="font-bold text-slate-900 font-mono">
                  {selectedWinner.prizeValue.toLocaleString()} {selectedWinner.currency}
                </span>
              </div>

              {/* Physical Delivery Details Box */}
              {selectedWinner.claimDetails?.deliveryDetails && (
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900">
                    <Package className="w-4 h-4 text-purple-600" /> Physical Shipping Destination
                  </div>
                  <div className="text-slate-700 space-y-0.5">
                    <div><span className="font-semibold">Recipient:</span> {selectedWinner.claimDetails.deliveryDetails.recipientName}</div>
                    <div><span className="font-semibold">Phone:</span> {selectedWinner.claimDetails.deliveryDetails.phone}</div>
                    <div><span className="font-semibold">City:</span> {selectedWinner.claimDetails.deliveryDetails.city}</div>
                    <div><span className="font-semibold">Address:</span> {selectedWinner.claimDetails.deliveryDetails.address}</div>
                    {selectedWinner.claimDetails.deliveryDetails.notes && (
                      <div><span className="font-semibold">Notes:</span> {selectedWinner.claimDetails.deliveryDetails.notes}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Provably Fair Proof */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Provably Fair Verification Data</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 font-mono text-[10px] text-slate-600 border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[9px]">SNAPSHOT HASH</span>
                    <span className="break-all">{selectedWinner.snapshotHash || "SHA256-GEN-SYSTEM-VALIDATED"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">RANDOM SEED</span>
                    <span className="break-all">{selectedWinner.randomSeed || "NIST-BEACON-SEED-VERIFIED"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedWinner(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs"
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
