"use client";

import { useState } from "react";
import { 
  Users, Trophy, Ticket, Wallet, Calendar, ArrowUpRight, 
  MoreVertical, CheckCircle2, ShieldAlert, CircleDashed, CheckCircle, Database, Phone, HardDrive, Award, Sparkles,
  DollarSign, TrendingUp, ArrowDownToLine, ShieldCheck, Layers, Flame, Zap, Gift, ChevronRight, PackageCheck
} from "lucide-react";
import Link from "next/link";

// Crash-proof SVG Mini Sparkline
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 32;

  const points = data
    .map((val, idx) => {
      const x = (idx / Math.max(1, data.length - 1)) * width;
      const y = height - (((val - min) / range) * (height - 6)) - 3;
      return `${(x || 0).toFixed(1)},${(y || 0).toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-24 h-8 overflow-visible">
      <polyline
        fill="none"
        stroke={color || "#10B981"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// Crash-proof SVG Revenue Area Chart with hover tooltips
function RevenueAreaChart({ data }: { data: { name: string; value: number }[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
        No revenue data recorded yet.
      </div>
    );
  }

  const values = data.map((d) => d.value || 0);
  const maxVal = Math.max(1000, ...values);
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (((d.value || 0) / maxVal) * (height - paddingY * 2));
    return { x: x || 0, y: y || 0, name: d.name || "", value: d.value || 0 };
  });

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPoints = `${points[0].x.toFixed(1)},${height - paddingY} ${polylinePoints} ${points[points.length - 1].x.toFixed(1)},${height - paddingY}`;

  return (
    <div className="relative w-full h-[250px] flex flex-col justify-between select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = height - paddingY - ratio * (height - paddingY * 2);
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="#E2E8F0"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          );
        })}

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#areaGradient)" />

        {/* Line stroke */}
        <polyline
          fill="none"
          stroke="#10B981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />

        {/* Interactive Dots */}
        {points.map((p, i) => (
          <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === i ? 6 : 4}
              fill="#10B981"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="transition-all"
            />
            {hoveredIdx === i && (
              <g>
                <rect
                  x={p.x - 45}
                  y={Math.max(5, p.y - 45)}
                  width="90"
                  height="34"
                  rx="8"
                  fill="#0F172A"
                  className="shadow-lg"
                />
                <text
                  x={p.x}
                  y={Math.max(5, p.y - 45) + 14}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="sans-serif"
                >
                  {p.name}
                </text>
                <text
                  x={p.x}
                  y={Math.max(5, p.y - 45) + 27}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {p.value.toLocaleString()} ETB
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between px-6 text-[10px] text-slate-400 font-medium">
        {data.map((d, i) => (
          <span key={i}>{d.name}</span>
        ))}
      </div>
    </div>
  );
}

// Crash-proof SVG Status Donut Chart
function StatusDonutChart({ data, total }: { data: { name: string; value: number; color: string }[]; total: number }) {
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {(data || []).map((slice, i) => {
          const percent = total > 0 ? (slice.value || 0) / total : 0;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedPercent * circumference;
          accumulatedPercent += percent;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.color || "#94A3B8"}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900 leading-none">{total || 0}</span>
        <span className="text-[10px] text-slate-500 font-medium mt-0.5">Total</span>
      </div>
    </div>
  );
}

export default function AdminDashboardClient({ data }: { data: any }) {
  const totalCampaignPie = data?.pieData?.reduce((acc: number, item: any) => acc + (item.value || 0), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, Admin! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here&apos;s your live business performance, realized profit, and liquidity overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/withdrawals"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-xl text-xs border border-purple-200 transition-all"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Withdrawals: {data?.pendingWithdrawalCount || 0} Pending</span>
          </Link>

          <Link
            href="/admin/draws"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Live Draw Room
          </Link>
        </div>
      </div>

      {/* EXECUTIVE NET REALIZED PROFIT & VAULT RESERVES DASHBOARD */}
      <div className="bg-gradient-to-br from-[#0B132B] via-[#0E1A38] to-[#070D1F] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Net Realized Profit &amp; Cash Flow Vault</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                  Audited P&amp;L
                </span>
              </div>
              <p className="text-xs text-slate-300/80">Real-time accounting after deducting completed prize costs, paid cash withdrawals, and promo credits.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Net Profit Margin:</span>
            <span className="text-sm font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-xl">
              +{data?.netProfitMarginPercent || 0}%
            </span>
          </div>
        </div>

        {/* 4 Executive Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {/* Metric 1: Realized Net Cash Profit */}
          <div className="bg-white/5 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-4.5 space-y-2 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Net Realized Profit</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {(data?.netRealizedProfit || 0) >= 0 ? "+" : ""}{(data?.netRealizedProfit || 0).toLocaleString()} <span className="text-xs text-emerald-300 font-sans">ETB</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Gross Ticket Sales ({(data?.totalTicketSales || 0).toLocaleString()} ETB) minus Completed Prizes &amp; Payouts
            </p>
          </div>

          {/* Metric 2: Vault Cash Reserves */}
          <div className="bg-white/5 border border-white/10 hover:border-blue-500/40 rounded-2xl p-4.5 space-y-2 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Vault Cash Reserves</span>
              <Wallet className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-blue-400">
              {(data?.platformCashReserve || 0).toLocaleString()} <span className="text-xs text-blue-300 font-sans">ETB</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Real User Deposits ({(data?.totalRevenue || 0).toLocaleString()} ETB) minus Realized Withdrawals Paid Out
            </p>
          </div>

          {/* Metric 3: Paid Out Withdrawals */}
          <div className="bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-2xl p-4.5 space-y-2 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Paid Out Withdrawals</span>
              <ArrowDownToLine className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300">
              {(data?.totalWithdrawalsPaidOut || 0).toLocaleString()} <span className="text-xs text-purple-200 font-sans">ETB</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {data?.pendingWithdrawalCount || 0} pending requests ({(data?.totalWithdrawalsPending || 0).toLocaleString()} ETB in review)
            </p>
          </div>

          {/* Metric 4: Completed Prize Fulfillment Costs */}
          <div className="bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-2xl p-4.5 space-y-2 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Prize Item Costs</span>
              <PackageCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
              {(data?.completedPrizeCostsTotal || 0).toLocaleString()} <span className="text-xs text-amber-300 font-sans">ETB</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Total physical hardware &amp; product costs for verified winners
            </p>
          </div>
        </div>

        {/* Breakdown by Game Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 relative z-10 text-xs">
          {/* Instant Mini Draws */}
          <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-purple-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-400" /> Instant 5-Min Mini Draws
              </span>
              <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded-full">
                {data?.instantStats?.completedCount || 0} Rounds Done
              </span>
            </div>
            <div className="flex justify-between text-slate-300 pt-1">
              <span>Gross Sales:</span>
              <b className="font-mono text-white">{(data?.instantStats?.grossSales || 0).toLocaleString()} ETB</b>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Completed Prizes:</span>
              <b className="font-mono text-amber-400">-{(data?.instantStats?.prizeCosts || 0).toLocaleString()} ETB</b>
            </div>
            <div className="flex justify-between text-slate-200 border-t border-purple-500/20 pt-1 font-bold">
              <span>Realized Profit:</span>
              <span className="font-mono text-emerald-400">+{(data?.instantStats?.netProfit || 0).toLocaleString()} ETB</span>
            </div>
          </div>

          {/* Grand Campaigns */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-emerald-400" /> Official Grand Campaigns
              </span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full">
                {data?.grandStats?.completedCount || 0} Draws Done
              </span>
            </div>
            <div className="flex justify-between text-slate-300 pt-1">
              <span>Gross Sales:</span>
              <b className="font-mono text-white">{(data?.grandStats?.grossSales || 0).toLocaleString()} ETB</b>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Completed Prizes:</span>
              <b className="font-mono text-amber-400">-{(data?.grandStats?.prizeCosts || 0).toLocaleString()} ETB</b>
            </div>
            <div className="flex justify-between text-slate-200 border-t border-emerald-500/20 pt-1 font-bold">
              <span>Realized Profit:</span>
              <span className="font-mono text-emerald-400">+{(data?.grandStats?.netProfit || 0).toLocaleString()} ETB</span>
            </div>
          </div>

          {/* Promotional Bonus Credits */}
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" /> Marketing &amp; Virtual Bonus
              </span>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">Non-Withdrawable</span>
            </div>
            <div className="flex justify-between text-slate-300 pt-1">
              <span>Daily Spin Bonuses:</span>
              <b className="font-mono text-white">{(data?.totalSpinCredits || 0).toLocaleString()} ETB</b>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Referral Credits:</span>
              <b className="font-mono text-white">{(data?.totalReferralCredits || 0).toLocaleString()} ETB</b>
            </div>
            <p className="text-[10px] text-amber-300/80 pt-1 border-t border-amber-500/20">
              Virtual credits act as acquisition incentives to drive real ticket purchases.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Total Users</div>
              <div className="text-2xl font-bold text-slate-900">{(data?.totalUsers || 0).toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-emerald-500 text-xs font-bold flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> Live</span>
              <span className="text-[10px] text-slate-400">registered accounts</span>
            </div>
            <Sparkline data={[10, 15, 12, 22, 18, 30, 25, 35]} color="#10B981" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Active Campaigns</div>
              <div className="text-2xl font-bold text-slate-900">{data?.activeCampaigns || 0}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-purple-600 text-xs font-bold flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> Live Draws</span>
              <span className="text-[10px] text-slate-400">ready for participation</span>
            </div>
            <Sparkline data={[4, 6, 5, 8, 10, 9, 12, 15]} color="#A855F7" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Tickets Sold</div>
              <div className="text-2xl font-bold text-slate-900">{(data?.totalTicketsCount || 0).toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-blue-500 text-xs font-bold flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> {data?.totalCampaigns || 0}</span>
              <span className="text-[10px] text-slate-400">total campaigns</span>
            </div>
            <Sparkline data={[5, 12, 8, 20, 15, 35, 25, 40]} color="#3B82F6" />
          </div>
        </div>

        {/* Card 4: Revenue & Net Profit */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Total Deposits</div>
              <div className="text-2xl font-bold text-slate-900">
                {(data?.totalRevenue || 0).toLocaleString()}<span className="text-sm text-slate-500 ml-1">ETB</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-emerald-600 text-xs font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                Net Profit: {(data?.netRealizedProfit || 0).toLocaleString()} ETB
              </span>
              <span className="text-[10px] text-slate-400">after product &amp; payouts</span>
            </div>
            <Sparkline data={[20, 30, 25, 45, 35, 50, 40, 60]} color="#10B981" />
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">Revenue &amp; Deposit Flow</h2>
              <div className="flex items-end gap-4">
                <div>
                  <span className="text-2xl font-bold text-slate-900">{(data?.totalRevenue || 0).toLocaleString()} ETB</span>
                  <span className="text-xs text-slate-400 ml-1">Deposits</span>
                </div>
                <div className="w-px h-6 bg-slate-200 mb-1"></div>
                <div className="mb-0.5">
                  <span className="text-base font-bold text-emerald-600">
                    {(data?.netRealizedProfit || 0) >= 0 ? "+" : ""}{(data?.netRealizedProfit || 0).toLocaleString()} ETB
                  </span>
                  <span className="text-[11px] text-slate-400 ml-1">Realized Net Profit</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-[250px] w-full mt-2 flex items-center justify-center">
            <RevenueAreaChart data={data?.revenueData || []} />
          </div>
        </div>

        {/* Donut Chart & Feed Column */}
        <div className="space-y-6">
          {/* Campaign Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-slate-900">Campaign Status</h2>
              <Link href="/admin/campaigns" className="text-emerald-500 text-xs font-semibold hover:text-emerald-600">View All</Link>
            </div>
            <div className="flex items-center h-full pb-2 pt-2">
              <div className="w-1/2 flex items-center justify-center">
                <StatusDonutChart data={data?.pieData || []} total={totalCampaignPie} />
              </div>
              <div className="w-1/2 flex flex-col justify-center gap-2 pl-2">
                {(data?.pieData || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-600 truncate max-w-[80px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-4">Payment Methods</h2>
            <div className="space-y-3">
              {(data?.paymentMethods || []).map((method: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: method.color }}>
                      {method.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{method.name}</div>
                      <div className="text-[10px] text-slate-400">{(method.amount || 0).toLocaleString()} ETB</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-600">{method.percentage || 0}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Top Campaigns with Product Cost & Net Margin Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Campaign Profitability &amp; Financial Margins</h2>
            <p className="text-xs text-slate-500">Ticket sales gross, product purchase costs, and realized net margins per campaign.</p>
          </div>
          <Link href="/admin/campaigns" className="text-emerald-500 text-xs font-semibold hover:text-emerald-600 flex items-center gap-1">
            <span>All Campaigns</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Campaign</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Tickets Sold</th>
                <th className="pb-3">Gross Revenue</th>
                <th className="pb-3">Product Cost</th>
                <th className="pb-3 text-right">Realized Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {(data?.campaigns || []).map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-bold text-slate-900 flex items-center gap-2 max-w-[200px] truncate">
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      c.isInstant ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {c.isInstant ? "⚡ Instant 5-Min" : "🏆 Grand"}
                    </span>
                  </td>
                  <td className="py-3 font-mono">
                    {c.sold} / {c.total} ({c.conv})
                  </td>
                  <td className="py-3 font-mono text-slate-900">
                    {(c.rev || 0).toLocaleString()} ETB
                  </td>
                  <td className="py-3 font-mono text-slate-500">
                    {(c.productCost || 0).toLocaleString()} ETB
                  </td>
                  <td className="py-3 text-right font-mono font-bold">
                    <span className={(c.realizedProfit || 0) >= 0 ? "text-emerald-600" : "text-slate-500"}>
                      {(c.realizedProfit || 0) >= 0 ? "+" : ""}{(c.realizedProfit || 0).toLocaleString()} ETB
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
