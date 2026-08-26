import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft, Ticket } from "lucide-react";
import Image from "next/image";

export default async function TicketsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) return null;

  const entries = await db.entry.findMany({
    where: { userId: user.id },
    include: { campaign: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="pb-24 px-5">
      <div className="pt-14 pb-6 flex items-center gap-4 sticky top-0 bg-[#0B0F19]/80 backdrop-blur-lg z-10">
        <Link href="/telegram" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">My Tickets</h1>
      </div>

      <div className="mt-4 space-y-4">
        {entries.length === 0 ? (
          <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
              <Ticket className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No tickets yet</h2>
            <p className="text-slate-400 text-sm">Join a campaign to get your first ticket!</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-[#121826] border border-slate-800/60 rounded-2xl p-4 flex gap-4">
              <div className="w-20 h-20 bg-slate-800 rounded-xl shrink-0 overflow-hidden border border-white/5 relative">
                {entry.campaign.imageUrl ? (
                  <img src={entry.campaign.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">IMG</div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{entry.campaign.title}</h3>
                  <p className="text-slate-400 text-xs mt-1">Ticket: <span className="font-mono text-emerald-400 font-bold">{entry.ticketNumber}</span></p>
                </div>
                <div className="flex justify-between items-end">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${entry.campaign.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                    {entry.campaign.status}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
