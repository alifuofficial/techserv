"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Tag,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { InstantDrawPreset, INSTANT_DRAW_PRESETS } from "@/lib/instant-draw-service";

interface ActiveInstantDraw {
  id: string;
  title: string;
  slug: string;
  description: string;
  entryPrice: number;
  currency: string;
  maxEntries: number;
  entriesSold: number;
  remainingTickets: number;
  percentage: number;
  prizeTitle: string;
  prizeValue: number;
  imageUrl?: string;
  endsAt: string;
  status: string;
}

interface InstantAdminClientProps {
  initialActiveDraws: ActiveInstantDraw[];
  initialCompleted: any[];
  presets: InstantDrawPreset[];
}

export default function InstantAdminClient({
  initialActiveDraws,
  initialCompleted,
  presets,
}: InstantAdminClientProps) {
  const [activeDraws, setActiveDraws] = useState<ActiveInstantDraw[]>(initialActiveDraws);
  const [completedDraws, setCompletedDraws] = useState<any[]>(initialCompleted);
  const [loadingLaunchId, setLoadingLaunchId] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const [customForm, setCustomForm] = useState({
    title: "",
    entryPrice: "20",
    maxEntries: "50",
    prizeTitle: "",
    prizeValue: "800",
    productCost: "800",
    description: "",
    autoRenew: true,
  });

  const refreshData = async () => {
    try {
      const res = await fetch("/api/admin/instant-draws");
      const data = await res.json();
      if (data.success) {
        setActiveDraws(data.activeDraws || []);
        setCompletedDraws(data.recentCompleted || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Launch preset
  const handleLaunchPreset = async (preset: InstantDrawPreset) => {
    setLoadingLaunchId(preset.id);
    try {
      const res = await fetch("/api/admin/instant-draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presetId: preset.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to launch preset");
      }

      alert(`⚡ Successfully launched "${preset.name}"!`);
      refreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingLaunchId(null);
    }
  };

  // Launch custom draw
  const handleCustomLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLaunchId("custom");
    try {
      const res = await fetch("/api/admin/instant-draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to launch custom draw");
      }

      alert("⚡ Custom Instant Mini Draw launched successfully!");
      setShowCustomModal(false);
      refreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingLaunchId(null);
    }
  };

  // Execute Provably Fair Draw manually
  const handleExecuteDraw = async (campaignId: string) => {
    if (!confirm("Are you sure you want to execute this Provably Fair Draw now?")) return;
    setExecutingId(campaignId);

    try {
      const res = await fetch("/api/admin/draws/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to execute draw");
      }

      alert(`🎉 Draw completed! Winner: ${data.winner?.userName} (${data.winner?.ticketNumber})`);
      refreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-600 fill-purple-600" /> Instant Mini Draws & Flash Games
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Launch high-turnover 25–100 ticket instant mini raffles with automated Provably Fair RNG execution upon sellout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Custom Instant Draw
          </button>
          <Link
            href="/admin/draws"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Live Draw Room
          </Link>
        </div>
      </div>

      {/* 1-Click Launch Presets */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> 1-Click Instant Draw Presets
            </h2>
            <p className="text-[11px] text-slate-400">Launch standard high-velocity games immediately.</p>
          </div>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
            Auto-Renew Capable
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    {preset.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {preset.maxEntries} Tickets
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{preset.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Ticket: <span className="text-slate-900 font-bold">{preset.entryPrice} ETB</span> • Prize: <span className="text-emerald-600 font-bold">{preset.prizeValue} ETB</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{preset.description}</p>
              </div>

              <button
                type="button"
                onClick={() => handleLaunchPreset(preset)}
                disabled={loadingLaunchId === preset.id}
                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>{loadingLaunchId === preset.id ? "Launching..." : "⚡ Launch Now"}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Flash Draws Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600 fill-purple-600" /> Active Instant Mini Draws
            </h2>
            <p className="text-[11px] text-slate-400">Live games currently accepting entries in Telegram Mini App.</p>
          </div>
          <button
            onClick={refreshData}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="px-4 py-3">Mini Draw</th>
                <th className="px-4 py-3">Ticket Price</th>
                <th className="px-4 py-3">Sales Progress</th>
                <th className="px-4 py-3">Prize</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeDraws.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{d.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">/{d.slug}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800 font-mono">
                    {d.entryPrice} ETB
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <span>{d.entriesSold} / {d.maxEntries}</span>
                      <span className="text-purple-600">({d.percentage}%)</span>
                    </div>
                    <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${d.percentage}%` }}></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-emerald-600">{d.prizeTitle}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleExecuteDraw(d.id)}
                        disabled={executingId === d.id}
                        className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-[10px] font-bold transition-colors disabled:opacity-50"
                        title="Force RNG Draw"
                      >
                        {executingId === d.id ? "Drawing..." : "Execute RNG"}
                      </button>
                      <Link
                        href={`/admin/campaigns/${d.id}`}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg"
                        title="Edit"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {activeDraws.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No active instant draws. Click a preset above to launch one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recent Completed Instant Mini Draws
          </h2>
          <span className="text-[11px] text-slate-400">Latest 10 auto-drawn games</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="px-4 py-3">Mini Draw</th>
                <th className="px-4 py-3">Prize Won</th>
                <th className="px-4 py-3">Tickets Sold</th>
                <th className="px-4 py-3">Provably Fair Hash</th>
                <th className="px-4 py-3 text-right">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedDraws.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{c.title}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600">
                    {c.prizes?.[0]?.title || c.title}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">
                    {c._count?.entries || c.maxEntries} / {c.maxEntries}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                    {c.draw?.snapshotHash || "SHA-256 Generated"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 font-mono text-[11px]">
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ""}
                  </td>
                </tr>
              ))}

              {completedDraws.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No completed instant draws yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Launch Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" /> Launch Custom Instant Mini Draw
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomLaunch} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Draw Title *</label>
                <input
                  type="text"
                  required
                  value={customForm.title}
                  onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                  placeholder="e.g. 50-Ticket Quick Cash Drop"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Ticket Price (ETB) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={customForm.entryPrice}
                    onChange={(e) => setCustomForm({ ...customForm, entryPrice: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Total Tickets (Max) *</label>
                  <input
                    type="number"
                    required
                    min="2"
                    value={customForm.maxEntries}
                    onChange={(e) => setCustomForm({ ...customForm, maxEntries: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Prize Title *</label>
                <input
                  type="text"
                  required
                  value={customForm.prizeTitle}
                  onChange={(e) => setCustomForm({ ...customForm, prizeTitle: e.target.value })}
                  placeholder="e.g. 1,000 ETB Cash Prize"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-200">
                <input
                  type="checkbox"
                  id="autoRenewCheck"
                  checked={customForm.autoRenew}
                  onChange={(e) => setCustomForm({ ...customForm, autoRenew: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
                <label htmlFor="autoRenewCheck" className="font-bold text-purple-900 cursor-pointer">
                  Auto-Renew Round upon Sellout
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingLaunchId === "custom"}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                >
                  {loadingLaunchId === "custom" ? "Launching..." : "Launch Flash Draw"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
