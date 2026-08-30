"use client";

import { useState } from "react";
import { 
  Users, Trophy, Ticket, Wallet, Calendar, ArrowUpRight, 
  MoreVertical, CheckCircle2, ShieldAlert, CircleDashed, CheckCircle, Database, Phone, HardDrive, Award, Sparkles
} from "lucide-react";
import Link from "next/link";

// Crash-proof SVG Mini Sparkline
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 32;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-24 h-8 overflow-visible">
      <polyline
        fill="none"
        stroke={color}
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

  const values = data.map((d) => d.value);
  const maxVal = Math.max(1000, ...values);
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.value / maxVal) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints = `${points[0].x},${height - paddingY} ${polylinePoints} ${points[points.length - 1].x},${height - paddingY}`;

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
          </g>
        ))}
      </svg>

      {/* Hover tooltip */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div
          className="absolute bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100}%`,
          }}
        >
          <div className="font-bold text-emerald-400">{points[hoveredIdx].value.toLocaleString()} ETB</div>
          <div className="text-[10px] text-slate-400">{points[hoveredIdx].name}</div>
        </div>
      )}

      {/* X Axis Labels */}
      <div className="flex justify-between px-6 text-[10px] font-semibold text-slate-400 mt-1">
        {data.map((d, i) => (
          <span key={i}>{d.name}</span>
        ))}
      </div>
    </div>
  );
}

// Crash-proof SVG Donut Chart
function StatusDonutChart({ data, total }: { data: { name: string; value: number; color: string }[]; total: number }) {
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((slice, i) => {
          const percent = total > 0 ? slice.value / total : 0;
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
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900 leading-none">{total}</span>
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
          <p className="text-slate-500 text-sm mt-1">Here's what's happening with your platform today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/draws"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Live Draw Room
          </Link>
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

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-slate-900">
                {(data?.totalRevenue || 0).toLocaleString()}<span className="text-sm text-slate-500 ml-1">ETB</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-emerald-500 text-xs font-bold flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> Approved</span>
              <span className="text-[10px] text-slate-400">verified payments</span>
            </div>
            <Sparkline data={[20, 30, 25, 45, 35, 50, 40, 60]} color="#F59E0B" />
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">Revenue Overview</h2>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-slate-900">{(data?.totalRevenue || 0).toLocaleString()} ETB</span>
                <span className="text-emerald-500 text-sm font-bold flex items-center mb-1">
                  <ArrowUpRight className="w-4 h-4 mr-0.5" /> Live Verified
                </span>
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
              <div className="w-1/2 pl-4 space-y-2">
                {data?.pieData?.map((item: any, i: number) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 ml-4">
                      {item.value} ({Math.round(((item.value || 0) / Math.max(1, totalCampaignPie)) * 100)}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-base font-bold text-slate-900">Recent Live Activity</h2>
            </div>
            <div className="space-y-3.5 overflow-y-auto custom-scrollbar pr-1 max-h-[220px]">
              {data?.activities?.map((act: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    act.type === 'USER' ? 'bg-blue-50 text-blue-500' :
                    act.type === 'PAYMENT' ? 'bg-emerald-50 text-emerald-500' : 'bg-purple-50 text-purple-500'
                  }`}>
                    {act.type === 'USER' && <Users className="w-4 h-4" />}
                    {act.type === 'PAYMENT' && <Wallet className="w-4 h-4" />}
                    {act.type === 'WINNER' && <Award className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 leading-snug truncate">{act.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{act.subtitle} {act.formattedTime ? `• ${act.formattedTime}` : ""}</div>
                  </div>
                </div>
              ))}

              {(!data?.activities || data.activities.length === 0) && (
                <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real Top Performing Campaigns Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-900">Active & Recent Campaigns</h2>
            <Link href="/admin/campaigns" className="text-emerald-500 text-xs font-semibold hover:text-emerald-600">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-2/5">Campaign</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entries Sold</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data?.campaigns?.map((camp: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {camp.img ? (
                          <img src={camp.img} alt={camp.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold border border-emerald-100">
                            <Trophy className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate max-w-[180px]">{camp.name}</div>
                          <div className="text-[10px] text-slate-400">{camp.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-slate-700">{(camp.sold || 0).toLocaleString()} <span className="text-slate-400 font-normal">/ {(camp.total || 0).toLocaleString()}</span></div>
                    </td>
                    <td className="py-4 font-bold text-slate-700">{(camp.rev || 0).toLocaleString()} ETB</td>
                    <td className="py-4 font-semibold text-slate-700">{camp.conv}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        camp.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-100' :
                        camp.status === 'COMPLETED' ? 'text-blue-600 bg-blue-100' : 'text-slate-600 bg-slate-100'
                      }`}>
                        {camp.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {(!data?.campaigns || data.campaigns.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">No campaigns found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Payment Methods Breakdown */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-900">Payment Breakdown</h2>
              <Link href="/admin/payments" className="text-emerald-500 text-xs font-semibold hover:text-emerald-600">View All</Link>
            </div>
            
            <div className="space-y-5">
              {data?.paymentMethods?.map((pm: any, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      {pm.icon === "telebirr" && <Phone className="w-3.5 h-3.5 text-emerald-500" />}
                      {pm.icon === "cbe" && <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />}
                      {pm.icon === "wallet" && <Wallet className="w-3.5 h-3.5 text-emerald-600" />}
                      {pm.name}
                    </span>
                    <div className="text-slate-400">
                      <span className="text-slate-700 font-bold">{(pm.amount || 0).toLocaleString()} ETB</span> ({pm.percentage || 0}%)
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(2, pm.percentage || 0)}%`, backgroundColor: pm.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900">System Status</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> PostgreSQL Database
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Operational</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Telegram Mini App & Bot
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Operational</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Provably Fair RNG
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Operational</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 text-[11px] text-slate-400 border-t border-slate-200/60">
        <p>© {new Date().getFullYear()} MilkyTech. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0 font-medium">
          MilkyTech Platform Portal
        </p>
      </div>

    </div>
  );
}
