"use client";

import { useState } from "react";
import {
  Gift,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Coins,
  History,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Users,
  Wallet,
} from "lucide-react";
import { SpinPrizeSlice, DEFAULT_SPIN_PRIZES } from "@/lib/daily-spin-service";

interface SpinHistoryItem {
  id: string;
  spinId: string;
  userName: string;
  email: string;
  telegramId: string;
  amount: number;
  description: string;
  timestamp: string;
}

interface SpinAdminClientProps {
  initialSettings: {
    enabled: boolean;
    cooldownHours: number;
    prizes: SpinPrizeSlice[];
  };
  stats: {
    totalSpinsCount: number;
    totalBonusEtbGiven: number;
  };
  initialHistory: SpinHistoryItem[];
}

export default function SpinAdminClient({
  initialSettings,
  stats,
  initialHistory,
}: SpinAdminClientProps) {
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [cooldownHours, setCooldownHours] = useState(initialSettings.cooldownHours);
  const [prizes, setPrizes] = useState<SpinPrizeSlice[]>(initialSettings.prizes || DEFAULT_SPIN_PRIZES);
  const [history, setHistory] = useState<SpinHistoryItem[]>(initialHistory);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Calculate total probability
  const totalWeight = prizes.reduce((acc, p) => acc + (Number(p.weight) || 0), 0);

  const handlePrizeChange = (index: number, field: keyof SpinPrizeSlice, value: any) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    setPrizes(updated);
  };

  const handleAddSlice = () => {
    const newSlice: SpinPrizeSlice = {
      id: `p_${Date.now()}`,
      title: "New Prize",
      type: "BONUS_CREDIT",
      value: 1,
      weight: 10,
      color: "#10B981",
    };
    setPrizes([...prizes, newSlice]);
  };

  const handleDeleteSlice = (index: number) => {
    if (prizes.length <= 2) {
      alert("A wheel must have at least 2 prize slices.");
      return;
    }
    const updated = prizes.filter((_, i) => i !== index);
    setPrizes(updated);
  };

  const handleResetDefaults = () => {
    if (confirm("Reset prize slices to default 6-slice configuration?")) {
      setPrizes(DEFAULT_SPIN_PRIZES);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          cooldownHours,
          prizes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }

      setMessage({ type: "success", text: "Daily Lucky Spin configuration saved successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-500" /> Daily Free Lucky Spin Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure 24-hour player spin rewards, bonus ETB credit amounts, probability weights, and wheel slices.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-70"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Configuration"}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spins Logged</p>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Sparkles className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats.totalSpinsCount.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Player spins executed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Free Bonus Rewarded</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Coins className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600">
            {stats.totalBonusEtbGiven.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ETB</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Credited directly to player wallets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Wheel Slices</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Gift className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-black text-amber-600">{prizes.length} Slices</h3>
          <p className="text-[11px] text-slate-400 mt-1">Total Probability: {totalWeight}%</p>
        </div>
      </div>

      {/* Feature Settings Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">General Settings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Toggle Enabled */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">Enable Daily Free Spin</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Allow all players to claim 1 free spin every cooldown period.</div>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Cooldown Hours */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Cooldown Interval (Hours)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Hours before a player can spin again (Default: 24h).</div>
            </div>
            <input
              type="number"
              min="1"
              max="168"
              value={cooldownHours}
              onChange={(e) => setCooldownHours(parseInt(e.target.value, 10) || 24)}
              className="w-20 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 text-center"
            />
          </div>
        </div>
      </div>

      {/* Prize Slice Builder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Prize Slices & Probability Engine</h2>
            <p className="text-[11px] text-slate-500">Configure slice labels, reward types, bonus values, probability weights, and colors.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleAddSlice}
              className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Slice
            </button>
          </div>
        </div>

        {/* Probability Balance Meter */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span>Total Probability Weight:</span>
            <span className={totalWeight === 100 ? "text-emerald-600 font-mono" : "text-amber-600 font-mono"}>
              {totalWeight}% {totalWeight !== 100 && "(Weights should sum to 100%)"}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${totalWeight === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${Math.min(100, totalWeight)}%` }}
            ></div>
          </div>
        </div>

        {/* Slices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3">Prize Title</th>
                <th className="px-4 py-3">Reward Type</th>
                <th className="px-4 py-3">Bonus Value (ETB)</th>
                <th className="px-4 py-3">Probability (%)</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prizes.map((slice, idx) => (
                <tr key={slice.id || idx} className="hover:bg-slate-50/50">
                  {/* Color Picker */}
                  <td className="px-4 py-3">
                    <input
                      type="color"
                      value={slice.color || "#10B981"}
                      onChange={(e) => handlePrizeChange(idx, "color", e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={slice.title}
                      onChange={(e) => handlePrizeChange(idx, "title", e.target.value)}
                      className="w-full max-w-[160px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <select
                      value={slice.type}
                      onChange={(e) => handlePrizeChange(idx, "type", e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700"
                    >
                      <option value="BONUS_CREDIT">Bonus Credits (Wallet ETB)</option>
                      <option value="FREE_TICKET">Free Raffle Ticket</option>
                      <option value="DISCOUNT">Discount Voucher</option>
                      <option value="NO_PRIZE">No Prize (Try Again)</option>
                    </select>
                  </td>

                  {/* Value */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      value={slice.value}
                      onChange={(e) => handlePrizeChange(idx, "value", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 font-mono text-center"
                    />
                  </td>

                  {/* Weight */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={slice.weight}
                      onChange={(e) => handlePrizeChange(idx, "weight", parseInt(e.target.value, 10) || 0)}
                      className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-emerald-600 font-mono text-center"
                    />
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteSlice(idx)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Slice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Recent Spin History Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" /> Recent Player Spin Winnings Audit
          </h2>
          <span className="text-[11px] text-slate-400 font-semibold">Latest 20 claims</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Reward Won</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Spin Ref</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{h.userName}</div>
                    <div className="text-[10px] text-slate-400">{h.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-700">{h.description}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold font-mono text-emerald-600">+{h.amount} ETB</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                    {h.spinId}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 font-mono text-[11px]">
                    {new Date(h.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}

              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No spin rewards logged yet.
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
