"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, Trophy, Ticket, Users, Wallet, Gift, Award, Store, 
  ShieldCheck, UserPlus, Bell, FileBarChart, History, Settings,
  Menu, Search, Sun, ExternalLink
} from "lucide-react";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar */}
      <aside 
        className={`${
          isCollapsed ? "w-[80px]" : "w-[260px]"
        } bg-[#0F172A] text-slate-300 flex flex-col hidden lg:flex flex-shrink-0 h-full overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out border-r border-slate-800`}
      >
        {/* Logo */}
        <div className="h-[72px] flex items-center justify-center px-4 mb-2 shrink-0 border-b border-slate-800/50">
          <Link href="/admin" className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 w-full"}`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="font-bold text-white text-lg leading-tight tracking-tight">MilkyTech</div>
                <div className="text-[10px] text-slate-400 font-medium">Admin Portal</div>
              </div>
            )}
          </Link>
        </div>
        
        <div className="px-4 py-4 space-y-1">
          <Link href="/admin" className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} bg-emerald-500/10 text-emerald-400 rounded-xl font-medium transition-all group`}>
            <LayoutDashboard className="w-5 h-5 shrink-0" /> 
            {!isCollapsed && <span>Dashboard</span>}
            {isCollapsed && <span className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity">Dashboard</span>}
          </Link>
        </div>

        <div className="px-4 mb-2 flex-1">
          {!isCollapsed && <h3 className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-3 px-4 transition-opacity">Management</h3>}
          <nav className="space-y-1">
            {[
              { icon: Trophy, label: "Campaigns", href: "/admin/campaigns" },
              { icon: Sparkles, label: "Live Draw Room", href: "/admin/draws" },
              { icon: Ticket, label: "Entries", href: "/admin/entries" },
              { icon: Users, label: "Users", href: "/admin/users" },
              { icon: Wallet, label: "Payments", href: "/admin/payments" },
              { icon: Gift, label: "Prizes", href: "/admin/prizes" },
              { icon: Award, label: "Winners", href: "/admin/winners" },
              { icon: Store, label: "Merchants", href: "/admin/merchants" },
            ].map((item, i) => (
              <Link key={i} href={item.href} className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'} text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group relative`}>
                <item.icon className="w-5 h-5 shrink-0" /> 
                {!isCollapsed && <span>{item.label}</span>}
                {isCollapsed && <span className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity whitespace-nowrap">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="px-4 mt-2 mb-4 shrink-0">
          {!isCollapsed && <h3 className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-3 px-4 transition-opacity">System</h3>}
          <nav className="space-y-1">
            {[
              { icon: ShieldCheck, label: "KYC Verifications", href: "/admin/kyc" },
              { icon: UserPlus, label: "Referrals", href: "/admin/referrals" },
              { icon: Bell, label: "Notifications", href: "/admin/notifications" },
              { icon: FileBarChart, label: "Reports", href: "/admin/reports" },
              { icon: History, label: "Audit Logs", href: "/admin/logs" },
              { icon: Settings, label: "Settings", href: "/admin/settings" },
            ].map((item, i) => (
              <Link key={i} href={item.href} className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'} text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group relative`}>
                <item.icon className="w-5 h-5 shrink-0" /> 
                {!isCollapsed && <span>{item.label}</span>}
                {isCollapsed && <span className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity whitespace-nowrap">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Footer actions */}
        <div className="p-4 mt-auto space-y-4 shrink-0 border-t border-slate-800/50">
          <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'} bg-[#1E293B] rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors border border-slate-700 group relative`}>
            {isCollapsed ? (
               <ExternalLink className="w-5 h-5 text-slate-400" />
            ) : (
              <>
                <div>
                  <div className="text-white">View Platform</div>
                  <div className="text-[10px] text-slate-400">Go to live site →</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </>
            )}
            {isCollapsed && <span className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity whitespace-nowrap">View Platform</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Topbar */}
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10 transition-all">
          <div className="flex items-center gap-4 sm:gap-6 flex-1">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="w-10 h-10 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-600"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-block bg-white border border-slate-200 rounded px-1.5 text-[10px] font-sans font-semibold text-slate-400 shadow-sm">⌘K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button className="w-10 h-10 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors hidden sm:flex">
              <Sun className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800 leading-tight">Admin User</div>
                <div className="text-[11px] text-slate-500 font-medium">Super Admin</div>
              </div>
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#F4F7FB] p-4 sm:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
