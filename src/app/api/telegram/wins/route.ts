import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";

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
        status: "COMPLETED",
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

    const wins = winningDraws.map((draw) => {
      const winningEntry = userEntries.find((e) => e.id === draw.winningEntryId);
      const prefix = (winningEntry ? winningEntry.campaignId : draw.campaignId).substring(0, 4).toUpperCase();
      const ticketNumber = winningEntry ? `TKT-${prefix}-${winningEntry.entryNumber}` : "WINNING TICKET";
      const prizeTitle = draw.campaign.prizes?.[0]?.title || "Grand Prize";

      return {
        id: draw.id,
        campaignTitle: draw.campaign.title,
        campaignSlug: draw.campaign.slug,
        campaignImage: draw.campaign.imageUrl || null,
        ticketNumber,
        prizeTitle,
        wonAt: (draw.completedAt || draw.createdAt).toISOString(),
        status: "CLAIMED",
      };
    });

    return NextResponse.json({ success: true, wins });
  } catch (error: any) {
    console.error("[GET /api/telegram/wins error]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
