import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Send, Facebook, Instagram, Twitter, Heart } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HeaderAuth } from "@/components/header-auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 relative flex items-center justify-center text-emerald-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">MilkyTech</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-emerald-400 text-sm font-medium transition-colors">Home</Link>
            <Link href="/campaigns" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Campaigns</Link>
            <Link href="/winners" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Winners</Link>
            <Link href="/#how-it-works" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">How It Works</Link>
            <Link href="/about" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">About Us</Link>
          </nav>

          {/* Auth Buttons */}
          <HeaderAuth session={session} />
        </div>
      </header>

      <main className="flex-1 bg-white">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#080B12] pt-16 pb-8 border-t border-white/5 text-slate-400">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
            
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="text-emerald-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" y1="22" x2="4" y2="15"></line>
                  </svg>
                </div>
                <span className="text-white font-bold text-xl tracking-tight">MilkyTech</span>
              </Link>
              <p className="text-sm max-w-xs leading-relaxed">
                The most trusted prize platform for everyone. Fair draws, secure payments, and amazing prizes.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 hover:bg-slate-700 transition-colors"><Send className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-600 hover:bg-slate-700 transition-colors"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-pink-500 hover:bg-slate-700 transition-colors"><Instagram className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors"><Twitter className="w-4 h-4" /></a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="/campaigns" className="hover:text-emerald-400 transition-colors">All Campaigns</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link></li>
                <li><Link href="/winners" className="hover:text-emerald-400 transition-colors">Winners</Link></li>
                <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
                <li><Link href="/help" className="hover:text-emerald-400 transition-colors">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/fair-play" className="hover:text-emerald-400 transition-colors">Fair Play Policy</Link></li>
                <li><Link href="/refunds" className="hover:text-emerald-400 transition-colors">Refund Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-emerald-400 transition-colors">Cookies Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Newsletter</h4>
              <p className="text-sm mb-4">Subscribe to get updates on new campaigns and prizes.</p>
              <div className="flex bg-[#121826] rounded-lg p-1 border border-white/5">
                <input type="email" placeholder="Enter your email" className="bg-transparent border-none text-sm px-4 py-2 w-full focus:outline-none text-white" />
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-md transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-sm">
            <p>© 2025 MilkyTech. All rights reserved.</p>
            <p className="flex items-center gap-1 mt-4 md:mt-0">
              Built with <Heart className="w-4 h-4 text-red-500 fill-red-500 mx-1" /> for winners everywhere.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
