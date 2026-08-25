import { db } from "@/lib/db";
import TicketsClient from "./tickets-client";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function TicketsPage() {
  // Fetch demo user for MVP
  let user = await db.user.findUnique({
    where: { email: 'user@milkytech.online' }
  });

  if (!user) {
    user = await db.user.findFirst({ where: { role: 'USER' }});
  }

  if (!user) {
    return <div>No user found</div>;
  }

  // Fetch all Entries (Tickets) for this user, including Campaign info
  const entries = await db.entry.findMany({
    where: { userId: user.id },
    include: {
      campaign: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Map to the format expected by the client UI
  const mappedTickets = entries.map(entry => {
    return {
      id: entry.ticketNumber || `TKT-${entry.campaignId.substring(0,4).toUpperCase()}-${entry.entryNumber}`,
      campaign: entry.campaign.title,
      slug: entry.campaign.slug,
      image: entry.campaign.imageUrl || "/images/placeholder.jpg", // fallback
      purchaseDate: format(new Date(entry.createdAt), "MMM d, yyyy"),
      status: entry.campaign.status === "COMPLETED" ? "LOST" : "ACTIVE", // Simplification. Real app checks Winners.
      drawDate: format(new Date(entry.campaign.endsAt), "MMM d, yyyy"),
      bgColor: "bg-emerald-500", // Not strictly needed in UI unless used
    };
  });

  return (
    <TicketsClient initialTickets={mappedTickets} />
  );
}
