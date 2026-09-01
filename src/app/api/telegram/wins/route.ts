import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { PrizeClaimService } from "@/lib/prize-claim-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userEntries = await db.entry.findMany({
      where: { userId: user.id },
      select: { id: true, entryNumber: true, campaignId: true },
    });

    if (userEntries.length === 0) {
      return NextResponse.json({ success: true, wins: [] });
    }

    const userEntryIds = userEntries.map((e) => e.id);

    const winningDraws = await db.draw.findMany({
      where: {
        winningEntryId: { in: userEntryIds },
      },
      include: {
        campaign: {
          include: {
            prizes: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    const wins = await Promise.all(
      winningDraws.map(async (draw) => {
        const winningEntry = userEntries.find((e) => e.id === draw.winningEntryId);
        const prefix = (winningEntry ? winningEntry.campaignId : draw.campaignId).substring(0, 4).toUpperCase();
        const ticketNumber = winningEntry ? `TKT-${prefix}-${winningEntry.entryNumber}` : "WINNING TICKET";
        const prize = draw.campaign.prizes?.[0];
        const prizeTitle = prize?.title || draw.campaign.title;
        const prizeValue = prize?.value || (draw.campaign.entryPrice * (draw.campaign.maxEntries || 100));

        // Fetch claim choice
        const claim = await PrizeClaimService.getClaimDetails(draw.id);

        return {
          id: draw.id,
          campaignId: draw.campaignId,
          campaignTitle: draw.campaign.title,
          campaignSlug: draw.campaign.slug,
          campaignImage: draw.campaign.imageUrl || prize?.imageUrl || null,
          ticketNumber,
          prizeTitle,
          prizeValue,
          currency: draw.campaign.currency || "ETB",
          wonAt: (draw.completedAt || draw.createdAt).toISOString(),
          claimStatus: claim ? (claim.claimType === "CASH" ? "CLAIMED_CASH" : "CLAIMED_PHYSICAL") : "UNCLAIMED",
          claimDetails: claim || null,
        };
      })
    );

    return NextResponse.json({ success: true, wins });
  } catch (error: any) {
    console.error("[GET /api/telegram/wins error]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
