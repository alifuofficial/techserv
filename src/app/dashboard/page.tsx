import Link from "next/link";
import { Ticket, Trophy, Wallet, ArrowRight, ExternalLink, Flame, Calendar, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function UserDashboardPage() {
  // Fetch demo user for MVP
  let user = await db.user.findUnique({
    where: { email: 'user@milkytech.online' }
  });
  if (!user) user = await db.user.findFirst({ where: { role: 'USER' }});
  
  if (!user) return <div>No user found</div>;

  const [ledger, ticketsCount, recentEntries, hotCampaigns] = await Promise.all([
    db.ledgerAccount.findUnique({ where: { userId: user.id } }),
    db.entry.count({ where: { userId: user.id } }), // Can filter by status='ACTIVE' if implemented
    db.entry.findMany({
      where: { userId: user.id },
      include: { campaign: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    }),
    db.campaign.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 2
    })
  ]);

  const balance = ledger?.balance || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Welcome & Notice */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to your Dashboard! 🎉</h1>
          <p className="text-slate-500 text-sm mt-1">Here you can track your purchased tickets, active campaigns, and ledger balance.</p>
        </div>
        <Link href="/campaigns" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all">
          Browse Campaigns <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/tickets" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-emerald-200 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Tickets</p>
            <h3 className="text-2xl font-bold text-slate-900">{ticketsCount}</h3>
          </div>
        </Link>
        
        <Link href="/dashboard/wins" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-purple-200 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Prizes Won</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>
        </Link>

        <Link href="/dashboard/wallet" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-emerald-200 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-500">Wallet Balance</p>
            <h3 className="text-2xl font-bold text-slate-900">{balance.toLocaleString()} ETB</h3>
          </div>
          <div className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">Top Up</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-900">Recent Tickets</h2>
            <Link href="/dashboard/tickets" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</Link>
          </div>
          
          {recentEntries.length > 0 ? (
            <div className="flex-1 flex flex-col p-6 gap-4">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                    <img src={entry.campaign.imageUrl || "/images/placeholder.jpg"} alt="Campaign" className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{entry.campaign.title}</h4>
                    <p className="text-xs font-mono text-slate-500 bg-white border border-slate-200 rounded px-1.5 py-0.5 inline-block mt-1">
                      TKT-{entry.campaignId.substring(0,4).toUpperCase()}-{entry.entryNumber}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-1">
                      <Clock className="w-3 h-3" /> Active
                    </span>
                    <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" /> {format(new Date(entry.createdAt), "MMM d")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-700 mb-1">No active tickets yet</p>
              <p className="text-sm mb-4">You haven't participated in any campaigns.</p>
              <Link href="/campaigns" className="text-sm font-bold text-emerald-500 hover:text-emerald-600 underline underline-offset-4">Find a campaign to enter</Link>
            </div>
          )}
        </div>

        {/* Hot Campaigns Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-900 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> Hot Right Now</h2>
          </div>
          <div className="p-4 space-y-4">
            
            {hotCampaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.slug}`} className="block group">
                <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 mb-3 flex items-center justify-center">
                  <img src={campaign.imageUrl || "/images/placeholder.jpg"} alt={campaign.title} className="object-cover w-full h-full mix-blend-multiply transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-3">
                    <p className="text-white font-bold text-sm leading-tight">{campaign.title}</p>
                    <p className="text-emerald-300 text-xs font-medium">{campaign.entryPrice.toLocaleString()} {campaign.currency} / Entry</p>
                  </div>
                </div>
              </Link>
            ))}

            {hotCampaigns.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">No active campaigns right now.</p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
