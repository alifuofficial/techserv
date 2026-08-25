import { Trophy, Ticket, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const pastWinners = [
  {
    id: 1,
    campaign: "iPhone 17 Pro Max 256GB",
    winner: "Dawit T.",
    ticket: "MT-48291",
    date: "Aug 18, 2026",
    image: "https://images.unsplash.com/photo-1695048064977-a2f02690d79d?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    campaign: "Toyota SUV 2025",
    winner: "Sara M.",
    ticket: "MT-10294",
    date: "Aug 12, 2026",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    campaign: "MacBook Pro 16\" M4",
    winner: "Henok B.",
    ticket: "MT-99382",
    date: "Aug 05, 2026",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    campaign: "PlayStation 5 Bundle",
    winner: "Betelhem A.",
    ticket: "MT-02941",
    date: "Jul 28, 2026",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 5,
    campaign: "100,000 ETB Cash Prize",
    winner: "Kaleb Y.",
    ticket: "MT-55812",
    date: "Jul 20, 2026",
    image: "https://images.unsplash.com/photo-1580519542036-ed471d170425?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 6,
    campaign: "Samsung Galaxy S25 Ultra",
    winner: "Meron D.",
    ticket: "MT-11938",
    date: "Jul 15, 2026",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop"
  }
];

export default function WinnersPage() {
  return (
    <div className="bg-[#0B0F19] min-h-screen text-slate-300 font-sans selection:bg-emerald-500/30 pb-24">
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 border-b border-white/5 bg-[#080B12]">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-400 mb-6">
            <Trophy className="w-4 h-4" /> Hall of Fame
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
            Meet our latest winners.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Transparency is our core value. Verify all past draws and celebrate the luckiest members of the MilkyTech community.
          </p>
        </div>
      </section>

      {/* Winners Grid */}
      <section className="pt-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastWinners.map((winner) => (
              <div 
                key={winner.id} 
                className="bg-[#121826] rounded-3xl overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-slate-800">
                  <img 
                    src={winner.image} 
                    alt={winner.campaign} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121826] via-transparent to-transparent opacity-80"></div>
                  
                  {/* Verified Badge */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Draw
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                  <div className="text-sm font-medium text-emerald-400 mb-2">Won the</div>
                  <h3 className="text-xl font-bold text-white mb-6 line-clamp-1">{winner.campaign}</h3>
                  
                  <div className="flex items-center gap-4 mb-6 p-4 bg-[#0B0F19] rounded-2xl border border-white/5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Winner</div>
                      <div className="text-lg font-bold text-white leading-none">{winner.winner}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5" /> Winning Ticket
                      </div>
                      <div className="text-sm font-mono text-slate-300 bg-white/5 inline-block px-2 py-0.5 rounded">
                        {winner.ticket}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Draw Date
                      </div>
                      <div className="text-sm text-slate-300 font-medium">
                        {winner.date}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pt-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-br from-[#121826] to-[#080B12] rounded-3xl p-10 md:p-16 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <h2 className="text-3xl font-bold text-white mb-4 relative z-10">You could be next.</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto relative z-10">
              Check out our active campaigns, grab your entry tickets, and secure your chance to join the Hall of Fame!
            </p>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-full font-bold relative z-10 border-none shadow-lg shadow-emerald-500/20" asChild>
              <Link href="/campaigns" className="flex items-center gap-2">
                Browse Active Campaigns <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
