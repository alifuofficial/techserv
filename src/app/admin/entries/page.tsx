import { db } from "@/lib/db";
import { format } from "date-fns";
import EntriesClient from "./entries-client";

export const dynamic = "force-dynamic";

export default async function AdminEntriesPage() {
  const [entries, campaigns, winningDraws] = await Promise.all([
    db.entry.findMany({
      include: {
        user: true,
        campaign: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.campaign.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: "asc",
      },
    }),
    db.draw.findMany({
      where: {
        status: "COMPLETED",
        winningEntryId: { not: null },
      },
      select: {
        winningEntryId: true,
      },
    }),
  ]);

  const winningSet = new Set(winningDraws.map((d) => d.winningEntryId));

  const mappedEntries = entries.map((entry) => {
    const prefix = entry.campaignId.substring(0, 4).toUpperCase();
    const isWinner = winningSet.has(entry.id);
    const resolvedStatus = isWinner ? "WINNER" : entry.status;

    return {
      id: entry.id,
      entryNumber: entry.entryNumber,
      ticketNumber: `TKT-${prefix}-${entry.entryNumber}`,
      userId: entry.userId,
      userName: entry.user.name || `User ${entry.userId.slice(-4)}`,
      userEmail: entry.user.email || "",
      userPhone: entry.user.phone || "",
      campaignId: entry.campaignId,
      campaignTitle: entry.campaign.title,
      campaignPrice: entry.campaign.entryPrice,
      currency: entry.campaign.currency || "ETB",
      paymentId: entry.paymentId,
      paymentTxId: entry.payment?.transactionId || null,
      paymentProvider: entry.payment?.provider || null,
      status: resolvedStatus,
      createdAt: entry.createdAt.toISOString(),
      formattedDate: format(new Date(entry.createdAt), "MMM d, yyyy, HH:mm"),
    };
  });

  return (
    <EntriesClient
      initialEntries={mappedEntries}
      campaigns={campaigns}
    />
  );
}
