"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Ticket, 
  Wallet, 
  Trophy, 
  Settings, 
  Menu, 
  Search, 
  Bell, 
  LogOut,
  ExternalLink,
  Users
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function UserDashboardClient({ children, session }: { children: React.ReactNode, session: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#F4F7FB] overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside 
        className={`${isCollapsed ? 'w-[80px]' : 'w-[260px]'} bg-[#0B0F19] flex flex-col transition-all duration-300 ease-in-out shrink-0 z-20 relative`}
      >
        <div className="h-[72px] flex items-center px-4 shrink-0 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 w-full group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="font-bold text-white text-lg leading-tight tracking-tight">MilkyTech</div>
                <div className="text-[10px] text-slate-400 font-medium">User Dashboard</div>
              </div>
            )}
          </Link>
        </div>
        
        <div className="px-4 py-6 space-y-1 flex-1">
          <nav className="space-y-1.5">
            {[
              { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
              { icon: Ticket, label: "My Tickets", href: "/dashboard/tickets" },
              { icon: Trophy, label: "My Wins", href: "/dashboard/wins" },
              { icon: Wallet, label: "Wallet & Funds", href: "/dashboard/wallet" },
              { icon: Users, label: "Referrals", href: "/dashboard/referrals" },
              { icon: Settings, label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => {
              const isActive = pathname === item.href;
              return (
                <Link key={i} href={item.href} className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-medium transition-all group relative ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  <item.icon className="w-5 h-5 shrink-0" /> 
                  {!isCollapsed && <span>{item.label}</span>}
                  {isCollapsed && <span className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Footer actions */}
        <div className="p-4 mt-auto space-y-4 shrink-0 border-t border-slate-800/50">
          <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'} bg-white/5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors group relative`}>
            {isCollapsed ? (
               <ExternalLink className="w-5 h-5 text-slate-400" />
            ) : (
              <>
                <div className="text-white">View Platform</div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </>
            )}
            {isCollapsed && <span className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity whitespace-nowrap">View Platform</span>}
          </Link>

          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'} bg-red-500/10 rounded-xl text-sm font-medium hover:bg-red-500/20 text-red-400 transition-colors group relative`}
          >
            {isCollapsed ? (
               <LogOut className="w-5 h-5 text-red-400" />
            ) : (
              <>
                <div>Log out</div>
                <LogOut className="w-4 h-4 text-red-400" />
              </>
            )}
            {isCollapsed && <span className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity whitespace-nowrap">Log out</span>}
          </button>
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
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button className="w-10 h-10 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800 leading-tight">{session?.user?.email || "User"}</div>
                <div className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">Verified Member</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200 shadow-sm">
                {(session?.user?.email || "U").charAt(0).toUpperCase()}
              </div>
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
