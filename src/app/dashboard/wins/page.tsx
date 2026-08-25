import { db } from "@/lib/db";
import UserWinsClient from "./wins-client";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function WinsPage() {
  let user = await db.user.findUnique({
    where: { email: 'user@milkytech.online' }
  });
  if (!user) user = await db.user.findFirst({ where: { role: 'USER' }});
  
  if (!user) return <div>No user found</div>;

  // 1. Get all entries for this user
  const userEntries = await db.entry.findMany({
    where: { userId: user.id },
    select: { id: true, entryNumber: true, campaignId: true }
  });

  const userEntryIds = userEntries.map(e => e.id);

  // 2. Find any COMPLETED Draws where the winningEntryId belongs to this user
  const winningDraws = await db.draw.findMany({
    where: {
      status: 'COMPLETED',
      winningEntryId: { in: userEntryIds }
    },
    include: {
      campaign: true
    }
  });

  const mappedWins = winningDraws.map(draw => {
    // Find the actual winning entry for ticket ID
    const entry = userEntries.find(e => e.id === draw.winningEntryId);
    
    return {
      id: `WIN-${draw.id.substring(0,6).toUpperCase()}`,
      ticketId: entry ? `TKT-${entry.campaignId.substring(0,4).toUpperCase()}-${entry.entryNumber}` : 'UNKNOWN',
      campaign: draw.campaign.title,
      image: draw.campaign.imageUrl || "/images/placeholder.jpg",
      dateWon: draw.completedAt ? format(new Date(draw.completedAt), "MMM d, yyyy") : "Unknown",
      status: "UNCLAIMED", // Default logic for MVP
      value: "Prize", // We don't track exact prize value easily in MVP without checking prizes relation, let's just say "Grand Prize"
      bgColor: "bg-emerald-500",
    };
  });

  return (
    <UserWinsClient initialWins={mappedWins} />
  );
}
