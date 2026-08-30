import { db } from "@/lib/db";
import { format } from "date-fns";
import WinnersClient, { WinnerItem } from "./winners-client";

export const dynamic = "force-dynamic";

export default async function AdminWinnersPage() {
  const [completedDraws, winnerEntries, campaigns] = await Promise.all([
    db.draw.findMany({
      where: {
        OR: [
          { status: "COMPLETED" },
          { winningEntryId: { not: null } },
        ],
      },
      include: {
        campaign: {
          include: {
            prizes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.entry.findMany({
      where: {
        status: "WINNER",
      },
      include: {
        user: true,
        campaign: {
          include: {
            prizes: true,
          },
        },
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
  ]);

  // Fetch winning entry records for draws
  const drawWinningEntryIds = completedDraws
    .map((d) => d.winningEntryId)
    .filter(Boolean) as string[];

  const drawEntries =
    drawWinningEntryIds.length > 0
      ? await db.entry.findMany({
          where: {
            id: { in: drawWinningEntryIds },
          },
          include: {
            user: true,
            campaign: {
              include: {
                prizes: true,
              },
            },
          },
        })
      : [];

  const entryMap = new Map(drawEntries.map((e) => [e.id, e]));

  const winnersList: WinnerItem[] = [];
  const processedEntryIds = new Set<string>();

  for (const draw of completedDraws) {
    if (draw.winningEntryId) {
      const entry = entryMap.get(draw.winningEntryId);
      if (entry) {
        processedEntryIds.add(entry.id);
        const prefix = entry.campaignId.substring(0, 4).toUpperCase();
        const prize = entry.campaign.prizes?.[0];
        const date = draw.completedAt || draw.createdAt;

        winnersList.push({
          id: draw.id,
          drawId: draw.id,
          userId: entry.userId,
          userName: entry.user.name || `User ${entry.userId.slice(-4)}`,
          userEmail: entry.user.email || "",
          userPhone: entry.user.phone || "",
          ticketId: entry.id,
          ticketNumber: `TKT-${prefix}-${entry.entryNumber}`,
          entryNumber: entry.entryNumber,
          prizeTitle: prize?.title || entry.campaign.title,
          prizeValue: prize?.value || entry.campaign.entryPrice * (entry.campaign.maxEntries || 100),
          campaignId: entry.campaignId,
          campaignTitle: entry.campaign.title,
          campaignImage: entry.campaign.imageUrl || prize?.imageUrl || null,
          currency: entry.campaign.currency || "ETB",
          drawDate: format(new Date(date), "MMM d, yyyy, HH:mm"),
          claimStatus: draw.status === "COMPLETED" ? "CLAIMED" : "PENDING",
          snapshotHash: draw.snapshotHash,
          randomSeed: draw.randomSeed,
        });
      }
    }
  }

  // Add any direct winner entries not already in draws
  for (const entry of winnerEntries) {
    if (!processedEntryIds.has(entry.id)) {
      const prefix = entry.campaignId.substring(0, 4).toUpperCase();
      const prize = entry.campaign.prizes?.[0];

      winnersList.push({
        id: entry.id,
        drawId: `DRW-${entry.id.substring(0, 6)}`,
        userId: entry.userId,
        userName: entry.user.name || `User ${entry.userId.slice(-4)}`,
        userEmail: entry.user.email || "",
        userPhone: entry.user.phone || "",
        ticketId: entry.id,
        ticketNumber: `TKT-${prefix}-${entry.entryNumber}`,
        entryNumber: entry.entryNumber,
        prizeTitle: prize?.title || entry.campaign.title,
        prizeValue: prize?.value || entry.campaign.entryPrice * (entry.campaign.maxEntries || 100),
        campaignId: entry.campaignId,
        campaignTitle: entry.campaign.title,
        campaignImage: entry.campaign.imageUrl || prize?.imageUrl || null,
        currency: entry.campaign.currency || "ETB",
        drawDate: format(new Date(entry.createdAt), "MMM d, yyyy, HH:mm"),
        claimStatus: "CLAIMED",
      });
    }
  }

  return (
    <WinnersClient
      initialWinners={winnersList}
      campaigns={campaigns}
    />
  );
}
