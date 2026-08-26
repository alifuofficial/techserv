"use client";

import { 
  Users, Trophy, Ticket, Wallet, Calendar, ArrowUpRight, 
  MoreVertical, CheckCircle2, ShieldAlert, CircleDashed, CheckCircle, Database, Phone, HardDrive, Award
} from "lucide-react";
import { 
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart,
  PieChart, Pie, Cell
} from "recharts";

// Dummy Data matching the screenshot exactly
const revenueData = [
  { name: 'May 18', value: 300000 },
  { name: 'May 21', value: 600000 },
  { name: 'May 25', value: 450000 },
  { name: 'May 28', value: 900000 },
  { name: 'Jun 1', value: 750000 },
  { name: 'Jun 4', value: 1300000 },
  { name: 'Jun 8', value: 1100000 },
  { name: 'Jun 11', value: 1600000 },
  { name: 'Jun 16', value: 1400000 },
];

const pieData = [
  { name: 'Active', value: 10, color: '#10B981' },
  { name: 'Ending Soon', value: 5, color: '#F59E0B' },
  { name: 'Upcoming', value: 2, color: '#3B82F6' },
  { name: 'Paused', value: 1, color: '#94A3B8' },
];

const topCampaigns = [
  { name: 'iPhone 17 Pro Max 256GB', time: 'Ends in 5d 08h', img: '/images/iphone.jpg', sold: '2,560', total: '3,000', rev: '256,000 ETB', conv: '85.3%', status: 'Active', statusColor: 'text-emerald-600 bg-emerald-100' },
  { name: 'Tesla Model 3 Standard', time: 'Ends in 12d 22h', img: '/images/hero.jpg', sold: '1,890', total: '2,500', rev: '189,000 ETB', conv: '75.6%', status: 'Active', statusColor: 'text-emerald-600 bg-emerald-100' },
  { name: 'MacBook Pro 16" M4', time: 'Ends in 8d 14h', img: '/images/macbook.jpg', sold: '1,245', total: '2,000', rev: '149,400 ETB', conv: '62.3%', status: 'Ending Soon', statusColor: 'text-amber-600 bg-amber-100' },
  { name: 'PlayStation 5 Bundle', time: 'Ends in 15d 09h', img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=200&auto=format&fit=crop', sold: '980', total: '1,500', rev: '117,600 ETB', conv: '65.3%', status: 'Active', statusColor: 'text-emerald-600 bg-emerald-100' },
  { name: 'Samsung Galaxy S25 Ultra', time: 'Ends in 3d 20h', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=200&auto=format&fit=crop', sold: '756', total: '1,000', rev: '90,720 ETB', conv: '75.6%', status: 'Ending Soon', statusColor: 'text-amber-600 bg-amber-100' },
];

const miniChartData1 = [{v:10},{v:15},{v:8},{v:22},{v:18},{v:30},{v:25},{v:35}];
const miniChartData2 = [{v:30},{v:25},{v:35},{v:15},{v:20},{v:10},{v:28},{v:22}];
const miniChartData3 = [{v:5},{v:12},{v:8},{v:20},{v:15},{v:35},{v:25},{v:40}];
const miniChartData4 = [{v:20},{v:30},{v:25},{v:45},{v:35},{v:50},{v:40},{v:60}];

export default function AdminDashboardClient({ data }: { data: any }) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, Admin! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening with your platform today.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
          <Calendar className="w-4 h-4 text-slate-400" />
          May 18 - Jun 16, 2025
        </button>
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
              <div className="text-2xl font-bold text-slate-900">{data.totalUsers.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-emerald-500 text-xs font-bold flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> 12.5%</span>
              <span className="text-[10px] text-slate-400">from last month</span>
            </div>
            <div className="w-24 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniChartData1}>
                  <Line type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
              <div className="text-2xl font-bold text-slate-900">{data.activeCampaigns}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-emerald-500 text-xs font-bold flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> 4</span>
              <span className="text-[10px] text-slate-400">new this week</span>
            </div>
            <div className="w-24 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniChartData2}>
                  <Line type="monotone" dataKey="v" stroke="#A855F7" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Total Campaigns</div>
              <div className="text-2xl font-bold text-slate-900">{data.totalCampaigns}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-emerald-500 text-xs font-bold flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> 8.1%</span>
              <span className="text-[10px] text-slate-400">vs last month</span>
            </div>
            <div className="w-24 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniChartData3}>
                  <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
              <div className="text-2xl font-bold text-slate-900">{(data.totalRevenue).toLocaleString()}<span className="text-sm text-slate-500 ml-1">ETB</span></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-emerald-500 text-xs font-bold flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> 18.9%</span>
              <span className="text-[10px] text-slate-400">from last month</span>
            </div>
            <div className="w-24 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniChartData4}>
                  <Line type="monotone" dataKey="v" stroke="#F59E0B" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">Revenue Overview</h2>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-slate-900">15,680,350 ETB</span>
                <span className="text-emerald-500 text-sm font-bold flex items-center mb-1"><ArrowUpRight className="w-4 h-4 mr-0.5" /> 18.9% <span className="text-slate-400 font-medium ml-1">vs last month</span></span>
              </div>
            </div>
            <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1.5 focus:outline-none">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 min-h-[250px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(val) => val >= 1000000 ? `${val/1000000}M` : `${val/1000}k`} />
                <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                  formatter={(val: number) => [`${val.toLocaleString()} ETB`, 'Revenue']}
                />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart & Feed Column */}
        <div className="space-y-6">
          {/* Campaign Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-[calc(50%-12px)]">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-slate-900">Campaign Performance</h2>
              <button className="text-emerald-500 text-xs font-semibold hover:text-emerald-600">View All</button>
            </div>
            <div className="flex items-center h-full pb-6">
              <div className="w-1/2 h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900 leading-none">18</span>
                  <span className="text-[10px] text-slate-500 font-medium">Total</span>
                </div>
              </div>
              <div className="w-1/2 pl-4 space-y-3">
                {pieData.map((item, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 ml-4">{item.value} ({Math.round(item.value/18*100)}%)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-[calc(50%-12px)] flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
              <button className="text-emerald-500 text-xs font-semibold hover:text-emerald-600">View All</button>
            </div>
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-500">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-700 leading-tight">New campaign <b>"iPhone 17 Pro Max"</b> created by merchant TechStore</div>
                  <div className="text-[10px] text-slate-400 mt-1">2m ago</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0 text-purple-500">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-700 leading-tight">Payment received<br/><span className="text-emerald-600 font-medium">125 ETB</span> from user @alex_90</div>
                  <div className="text-[10px] text-slate-400 mt-1">5m ago</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-500">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-700 leading-tight">New user registered<br/><span className="text-slate-500">@mike_eth joined the platform</span></div>
                  <div className="text-[10px] text-slate-400 mt-1">12m ago</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-amber-500">
                  <CircleDashed className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-700 leading-tight">Campaign <b>"Tesla Model 3"</b> has ended</div>
                  <div className="text-[10px] text-slate-400 mt-1">25m ago</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-500">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-700 leading-tight">Winner selected<br/><span className="text-slate-500">@sara_won won MacBook Pro</span></div>
                  <div className="text-[10px] text-slate-400 mt-1">1h ago</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-900">Top Performing Campaigns</h2>
            <button className="text-emerald-500 text-xs font-semibold hover:text-emerald-600">View All Campaigns</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-2/5">Campaign</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entries Sold</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(data.campaigns.length > 0 ? data.campaigns : topCampaigns).map((camp: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {camp.img ? (
                          <img src={camp.img} alt={camp.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold border border-slate-200">IMG</div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{camp.name}</div>
                          <div className="text-[10px] text-slate-400">{camp.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-slate-700">{camp.sold?.toLocaleString()} <span className="text-slate-400 font-normal">/ {camp.total?.toLocaleString()}</span></div>
                    </td>
                    <td className="py-4 font-bold text-slate-700">{camp.rev?.toLocaleString()} ETB</td>
                    <td className="py-4 font-semibold text-slate-700">{camp.conv}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${camp.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-100' : 'text-slate-600 bg-slate-100'}`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[11px] text-slate-400">Showing 5 of 18 campaigns</div>
        </div>

        {/* Right side widgets */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-900">Payment Methods</h2>
              <button className="text-emerald-500 text-xs font-semibold hover:text-emerald-600">View All</button>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-500"/> TeleBirr</span>
                  <div className="text-slate-400"><span className="text-slate-700 font-bold">8,250,000 ETB</span> (52.6%)</div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{width: '52.6%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5 text-blue-500"/> CBE Birr</span>
                  <div className="text-slate-400"><span className="text-slate-700 font-bold">4,120,300 ETB</span> (26.3%)</div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{width: '26.3%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-2"><Database className="w-3.5 h-3.5 text-purple-500"/> Bank Transfer</span>
                  <div className="text-slate-400"><span className="text-slate-700 font-bold">2,180,050 ETB</span> (13.9%)</div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{width: '13.9%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-2"><HardDrive className="w-3.5 h-3.5 text-slate-500"/> Other Methods</span>
                  <div className="text-slate-400"><span className="text-slate-700 font-bold">1,130,000 ETB</span> (7.2%)</div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{width: '7.2%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-slate-900">System Health</h2>
              <button className="text-emerald-500 text-xs font-semibold hover:text-emerald-600">View Details</button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Database
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Operational</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Payment Gateway
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Operational</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Telegram Bot
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Operational</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Storage
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Operational</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer text matching screenshot */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-2 pb-6 text-[11px] text-slate-400">
        <p>© 2025 MilkyTech. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Built with <span className="text-red-500">❤️</span> for winners everywhere.
        </p>
      </div>

    </div>
  );
}
