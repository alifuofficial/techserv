import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft, Trophy } from "lucide-react";

export default async function WinsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) return null;

  const wins = await db.winner.findMany({
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
        <h1 className="text-xl font-bold text-white">My Wins</h1>
      </div>

      <div className="mt-4 space-y-4">
        {wins.length === 0 ? (
          <div className="bg-[#121826] border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
              <Trophy className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No wins yet</h2>
            <p className="text-slate-400 text-sm">Keep playing to increase your chances!</p>
          </div>
        ) : (
          wins.map((win) => (
            <div key={win.id} className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-4">
              <div className="w-20 h-20 bg-slate-800 rounded-xl shrink-0 overflow-hidden border border-amber-500/30 relative">
                {win.campaign.imageUrl ? (
                  <img src={win.campaign.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">IMG</div>
                )}
                <div className="absolute top-0 right-0 bg-amber-500 w-6 h-6 rounded-bl-xl flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{win.campaign.title}</h3>
                  <p className="text-amber-400 text-xs font-bold mt-1">WON PRIZE</p>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-xs text-slate-400">{new Date(win.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
