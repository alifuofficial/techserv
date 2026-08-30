"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Gift,
  MoreVertical,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Box,
  TrendingUp,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  DollarSign,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PrizeItem {
  id: string;
  title: string;
  value: number;
  description: string | null;
  imageUrl: string | null;
  campaignId: string;
  campaignTitle: string;
  campaignSlug: string;
  campaignStatus: string;
  currency: string;
  createdAt: string;
}

interface CampaignOption {
  id: string;
  title: string;
}

export default function PrizesClient({
  initialPrizes,
  campaigns,
}: {
  initialPrizes: PrizeItem[];
  campaigns: CampaignOption[];
}) {
  const [prizes, setPrizes] = useState<PrizeItem[]>(initialPrizes);
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<PrizeItem | null>(null);
  const [formData, setFormData] = useState({
    campaignId: campaigns[0]?.id || "",
    title: "",
    value: "",
    description: "",
    imageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const openCreateModal = () => {
    setEditingPrize(null);
    setFormData({
      campaignId: campaigns[0]?.id || "",
      title: "",
      value: "",
      description: "",
      imageUrl: "",
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (prize: PrizeItem) => {
    setEditingPrize(prize);
    setFormData({
      campaignId: prize.campaignId,
      title: prize.title,
      value: prize.value.toString(),
      description: prize.description || "",
      imageUrl: prize.imageUrl || "",
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSavePrize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg("Prize title is required.");
      return;
    }
    if (!formData.campaignId) {
      setErrorMsg("Please select an associated campaign.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      if (editingPrize) {
        // Update
        const res = await fetch(`/api/admin/prizes/${editingPrize.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title.trim(),
            value: Number(formData.value) || 0,
            description: formData.description.trim() || undefined,
            imageUrl: formData.imageUrl.trim() || undefined,
            campaignId: formData.campaignId,
          }),
        });
        const data = await res.json();
        if (data.success && data.prize) {
          setPrizes((prev) =>
            prev.map((p) =>
              p.id === editingPrize.id
                ? {
                    ...p,
                    title: data.prize.title,
                    value: data.prize.value,
                    description: data.prize.description,
                    imageUrl: data.prize.imageUrl,
                    campaignId: data.prize.campaignId,
                    campaignTitle: data.prize.campaign?.title || p.campaignTitle,
                    campaignStatus: data.prize.campaign?.status || p.campaignStatus,
                  }
                : p
            )
          );
          setIsModalOpen(false);
        } else {
          setErrorMsg(data.error || "Failed to update prize");
        }
      } else {
        // Create
        const res = await fetch("/api/admin/prizes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: formData.campaignId,
            title: formData.title.trim(),
            value: Number(formData.value) || 0,
            description: formData.description.trim() || undefined,
            imageUrl: formData.imageUrl.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (data.success && data.prize) {
          const newPrize: PrizeItem = {
            id: data.prize.id,
            title: data.prize.title,
            value: data.prize.value,
            description: data.prize.description,
            imageUrl: data.prize.imageUrl,
            campaignId: data.prize.campaignId,
            campaignTitle: data.prize.campaign?.title || "Campaign",
            campaignSlug: data.prize.campaign?.slug || "",
            campaignStatus: data.prize.campaign?.status || "ACTIVE",
            currency: data.prize.campaign?.currency || "ETB",
            createdAt: data.prize.createdAt || new Date().toISOString(),
          };
          setPrizes((prev) => [newPrize, ...prev]);
          setIsModalOpen(false);
        } else {
          setErrorMsg(data.error || "Failed to create prize");
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePrize = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prize?")) return;

    setPrizes((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/admin/prizes/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPrizes = prizes.filter((prize) => {
    const matchesSearch =
      !searchQuery ||
      prize.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prize.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prize.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCampaign =
      campaignFilter === "ALL" || prize.campaignId === campaignFilter;

    const matchesStatus =
      statusFilter === "ALL" || prize.campaignStatus === statusFilter;

    return matchesSearch && matchesCampaign && matchesStatus;
  });

  const totalPrizesCount = prizes.length;
  const activePrizesValue = prizes
    .filter((p) => p.campaignStatus === "ACTIVE")
    .reduce((acc, p) => acc + (p.value || 0), 0);
  const distributedCount = prizes.filter((p) => p.campaignStatus === "COMPLETED").length;
  const uniqueCampaignsCount = new Set(prizes.map((p) => p.campaignId)).size;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prize Inventory</h1>
          <p className="text-sm text-slate-500">Manage real physical items, gadgets, and cash prizes tied to campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Prize
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Total Prizes</p>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{totalPrizesCount}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Active Prize Pool Value</p>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{activePrizesValue.toLocaleString()} ETB</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Completed / Awarded</p>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{distributedCount}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-500">Campaigns Covered</p>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{uniqueCampaignsCount}</h3>
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
            placeholder="Search prizes by title or campaign..."
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
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Prize Item</th>
                <th className="px-6 py-4">Associated Campaign</th>
                <th className="px-6 py-4">Estimated Value</th>
                <th className="px-6 py-4">Campaign Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrizes.map((prize) => (
                <tr key={prize.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-sm">
                      {prize.imageUrl ? (
                        <img src={prize.imageUrl} alt={prize.title} className="w-full h-full object-cover" />
                      ) : (
                        <Gift className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{prize.title}</div>
                      {prize.description && (
                        <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">{prize.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/campaigns/${prize.campaignSlug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-emerald-600 transition-colors max-w-[200px] truncate"
                    >
                      {prize.campaignTitle} <ExternalLink className="w-3 h-3 shrink-0" />
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {prize.value > 0 ? `${prize.value.toLocaleString()} ${prize.currency}` : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {prize.campaignStatus === "ACTIVE" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">
                        Active
                      </span>
                    )}
                    {prize.campaignStatus === "COMPLETED" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200/60 shadow-sm">
                        Completed
                      </span>
                    )}
                    {prize.campaignStatus === "DRAFT" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/60 shadow-sm">
                        Draft
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
                          Prize Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />

                        <DropdownMenuItem
                          onClick={() => openEditModal(prize)}
                          className="cursor-pointer flex items-center gap-2 text-slate-600 focus:bg-slate-50 focus:text-slate-900 text-sm py-2 px-3"
                        >
                          <Edit3 className="w-4 h-4" /> Edit Prize
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-100" />

                        <DropdownMenuItem
                          onClick={() => deletePrize(prize.id)}
                          className="cursor-pointer flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 text-sm py-2 px-3"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Prize
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

              {filteredPrizes.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No prizes found. Click "Add New Prize" above to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-lg text-slate-900">
                  {editingPrize ? "Edit Prize Item" : "Add New Prize"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSavePrize} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associated Campaign <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.campaignId}
                  onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prize Title / Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. iPhone 17 Pro Max 256GB"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Retail Value (ETB)
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g. 150000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Specifications (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Brand new sealed box with warranty..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingPrize ? (
                    "Save Changes"
                  ) : (
                    "Create Prize"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
