"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Trophy, Ticket, Users, Wallet, Gift, Award, Store, 
  ShieldCheck, UserPlus, Bell, FileBarChart, History, Settings,
  Menu, Search, Sun, ExternalLink, Sparkles, X, Loader2, ChevronRight,
  ArrowRight, Shield, Zap, ArrowDownToLine
} from "lucide-react";

interface SearchResultItem {
  category: string;
  title: string;
  subtitle: string;
  href: string;
}

const NAV_PAGES = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", category: "Overview" },
  { icon: Trophy, label: "Campaigns", href: "/admin/campaigns", category: "Management" },
  { icon: Zap, label: "Instant Mini Draws", href: "/admin/instant-draws", category: "Management" },
  { icon: ArrowDownToLine, label: "Withdrawal Requests", href: "/admin/withdrawals", category: "Management" },
  { icon: Sparkles, label: "Live Draw Room", href: "/admin/draws", category: "Management" },
  { icon: Gift, label: "Daily Lucky Spin", href: "/admin/spin", category: "Management" },
  { icon: Ticket, label: "Entries & Tickets", href: "/admin/entries", category: "Management" },
  { icon: Users, label: "Users Directory", href: "/admin/users", category: "Management" },
  { icon: Wallet, label: "Payments & Verification", href: "/admin/payments", category: "Management" },
  { icon: Gift, label: "Prizes Catalog", href: "/admin/prizes", category: "Management" },
  { icon: Award, label: "Winners & Proofs", href: "/admin/winners", category: "Management" },
  { icon: Store, label: "Merchants", href: "/admin/merchants", category: "Management" },
  { icon: ShieldCheck, label: "KYC Verifications", href: "/admin/kyc", category: "System" },
  { icon: UserPlus, label: "Referrals Program", href: "/admin/referrals", category: "System" },
  { icon: Bell, label: "Notifications & Broadcast", href: "/admin/notifications", category: "System" },
  { icon: FileBarChart, label: "Reports & Exports", href: "/admin/reports", category: "System" },
  { icon: History, label: "Audit Logs", href: "/admin/logs", category: "System" },
  { icon: Settings, label: "Platform Settings", href: "/admin/settings", category: "System" },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [dbResults, setDbResults] = useState<SearchResultItem[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Live database search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setDbResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDb(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setDbResults(data.results || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingDb(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter static pages matching query
  const matchedNavPages = searchQuery.trim()
    ? NAV_PAGES.filter(
        (p) =>
          p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.href.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectResult = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  const navManagement = NAV_PAGES.filter((p) => p.category === "Management");
  const navSystem = NAV_PAGES.filter((p) => p.category === "System");

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR */}
      {/* ========================================================================= */}
      <aside 
        className={`${
          isCollapsed ? "w-[80px]" : "w-[260px]"
        } bg-[#0F172A] text-slate-300 flex flex-col hidden lg:flex flex-shrink-0 h-full overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out border-r border-slate-800`}
      >
        {/* Logo */}
        <div className="h-[72px] flex items-center justify-center px-4 mb-2 shrink-0 border-b border-slate-800/50">
          <Link href="/admin" className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 w-full"}`}>
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="font-bold text-white text-base leading-tight tracking-tight">MilkyTech</div>
                <div className="text-[10px] text-slate-400 font-medium">Admin Portal</div>
              </div>
            )}
          </Link>
        </div>
        
        {/* Dashboard Link */}
        <div className="px-4 py-3 space-y-1">
          <Link 
            href="/admin" 
            className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'} ${
              pathname === "/admin" 
                ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30" 
                : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
            } rounded-xl transition-all group`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" /> 
            {!isCollapsed && <span>Dashboard</span>}
            {isCollapsed && <span className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity whitespace-nowrap">Dashboard</span>}
          </Link>
        </div>

        {/* Management Links */}
        <div className="px-4 mb-2 flex-1">
          {!isCollapsed && <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2 px-3 transition-opacity">Management</h3>}
          <nav className="space-y-1">
            {navManagement.map((item, i) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link 
                  key={i} 
                  href={item.href} 
                  className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2'} text-xs font-semibold rounded-xl transition-all group relative ${
                    isActive 
                      ? "bg-white/10 text-white font-bold border border-white/10 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : ""}`} /> 
                  {!isCollapsed && <span>{item.label}</span>}
                  {isCollapsed && <span className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Links */}
        <div className="px-4 mt-2 mb-4 shrink-0">
          {!isCollapsed && <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2 px-3 transition-opacity">System & Tools</h3>}
          <nav className="space-y-1">
            {navSystem.map((item, i) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link 
                  key={i} 
                  href={item.href} 
                  className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2'} text-xs font-semibold rounded-xl transition-all group relative ${
                    isActive 
                      ? "bg-white/10 text-white font-bold border border-white/10 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : ""}`} /> 
                  {!isCollapsed && <span>{item.label}</span>}
                  {isCollapsed && <span className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Footer actions */}
        <div className="p-4 mt-auto shrink-0 border-t border-slate-800/50">
          <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} bg-[#1E293B] rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors border border-slate-700 group relative`}>
            {isCollapsed ? (
               <ExternalLink className="w-4 h-4 text-slate-400" />
            ) : (
              <>
                <div>
                  <div className="text-white font-bold">View Platform</div>
                  <div className="text-[10px] text-slate-400">Go to live site →</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </>
            )}
            {isCollapsed && <span className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity whitespace-nowrap">View Platform</span>}
          </Link>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE DRAWER OVERLAY & SIDEBAR */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in-50"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0F172A] text-slate-300 flex flex-col lg:hidden transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="h-[72px] flex items-center justify-between px-5 shrink-0 border-b border-slate-800">
          <Link href="/admin" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base leading-tight">MilkyTech</div>
              <div className="text-[10px] text-slate-400 font-medium">Admin Portal</div>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Nav Links */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          <Link 
            href="/admin" 
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              pathname === "/admin" 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> 
            <span>Dashboard</span>
          </Link>

          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-3">Management</h4>
            <nav className="space-y-1">
              {navManagement.map((item, i) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-white/10 text-white font-bold border border-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : ""}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-3">System & Tools</h4>
            <nav className="space-y-1">
              {navSystem.map((item, i) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-white/10 text-white font-bold border border-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : ""}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="p-4 shrink-0 border-t border-slate-800">
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 bg-[#1E293B] rounded-xl text-xs font-bold text-white hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <span>View Public Platform</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Topbar Header */}
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10">
          <div className="flex items-center gap-3 sm:gap-6 flex-1">
            {/* Hamburger Button (Mobile opens Drawer, Desktop toggles collapse) */}
            <button 
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  setIsMobileOpen(true);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }} 
              className="w-10 h-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-95 border border-slate-200/60 lg:border-transparent"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Interactive Search Bar Trigger */}
            <div 
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="relative max-w-md w-full cursor-pointer group"
            >
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                readOnly
                placeholder="Search campaigns, users, payments (⌘K)..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2 text-xs font-semibold text-slate-700 cursor-pointer group-hover:bg-slate-100 group-hover:border-slate-300 transition-all pointer-events-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-block bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-sans font-bold text-slate-400 shadow-sm">⌘K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Mobile Search Icon Button */}
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="w-9 h-9 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center justify-center sm:hidden"
            >
              <Search className="w-4 h-4" />
            </button>

            <Link
              href="/admin/notifications"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors relative"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
            </Link>

            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

            <Link href="/admin/settings" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">Admin Portal</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Super Admin</div>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                AD
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#F4F7FB] p-4 sm:p-8 relative">
          {children}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. GLOBAL SEARCH MODAL (⌘K COMMAND PALETTE) */}
      {/* ========================================================================= */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in-50">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95"
          >
            {/* Input Row */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-emerald-500 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search pages, campaigns, users, or payments..."
                className="flex-1 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {isSearchingDb && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results Body */}
            <div className="overflow-y-auto p-3 space-y-4 max-h-[60vh]">
              
              {/* Matched Nav Pages */}
              {matchedNavPages.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                    Admin Navigation Pages
                  </span>
                  {matchedNavPages.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectResult(item.href)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{item.label}</div>
                            <div className="text-[10px] text-slate-400">{item.href}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Live Database Search Results */}
              {dbResults.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                    Database Matches
                  </span>
                  {dbResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectResult(res.href)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50/50 text-left transition-colors group border border-transparent hover:border-emerald-100"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {res.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{res.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{res.subtitle}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {/* If no search input yet, show quick links */}
              {!searchQuery.trim() && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                    Quick Navigation
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {NAV_PAGES.slice(0, 8).map((p, idx) => {
                      const Icon = p.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectResult(p.href)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                        >
                          <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                          <span className="text-xs font-semibold text-slate-700">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No results found */}
              {searchQuery.trim() && matchedNavPages.length === 0 && dbResults.length === 0 && !isSearchingDb && (
                <div className="p-8 text-center text-slate-400 space-y-1">
                  <Search className="w-6 h-6 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No results found for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-[11px] text-slate-400">Try searching for campaigns, user names, emails, or pages.</p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 px-4">
              <span>Press <kbd className="bg-white border px-1 rounded font-mono">ESC</kbd> to close</span>
              <span>MilkyTech Admin Engine</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
