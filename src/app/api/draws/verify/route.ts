import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateProvablyFairWinner } from "@/lib/provably-fair";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const drawIdOrSlug = searchParams.get("draw") || searchParams.get("id") || searchParams.get("slug");

    // If specific draw requested
    if (drawIdOrSlug) {
      const draw = await db.draw.findFirst({
        where: {
          OR: [
            { id: drawIdOrSlug },
            { campaignId: drawIdOrSlug },
            { campaign: { slug: drawIdOrSlug } },
          ],
          status: "COMPLETED",
        },
        include: {
          campaign: {
            include: {
              prizes: { take: 1 },
            },
          },
          winningEntry: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      });

      if (!draw) {
        return NextResponse.json({ error: "Draw not found or draw is not completed yet" }, { status: 404 });
      }

      const totalEntries = await db.entry.count({
        where: { campaignId: draw.campaignId, status: { in: ["VALID", "WINNER"] } },
      });

      const prefix = draw.campaign.id.substring(0, 4).toUpperCase();
      const ticketNumber = draw.winningEntry
        ? `TKT-${prefix}-${draw.winningEntry.entryNumber}`
        : "N/A";

      const calculation =
        draw.snapshotHash && draw.randomSeed && totalEntries > 0
          ? calculateProvablyFairWinner(draw.snapshotHash, draw.randomSeed, totalEntries)
          : null;

      return NextResponse.json({
        success: true,
        draw: {
          id: draw.id,
          campaignId: draw.campaignId,
          campaignTitle: draw.campaign.title,
          campaignSlug: draw.campaign.slug,
          prizeTitle: draw.campaign.prizes?.[0]?.title || draw.campaign.title,
          prizeValue: draw.campaign.prizes?.[0]?.value || draw.campaign.entryPrice * draw.campaign.maxEntries,
          currency: draw.campaign.currency || "ETB",
          completedAt: draw.completedAt,
          snapshotHash: draw.snapshotHash,
          randomSeed: draw.randomSeed,
          totalEntries,
          winningEntryNumber: draw.winningEntry?.entryNumber || calculation?.winningEntryNumber || 1,
          winningTicketNumber: ticketNumber,
          winnerName: draw.winningEntry?.user?.name || "Lucky Winner",
          calculation,
        },
      });
    }

    // List recent completed draws for easy selection
    const recentDraws = await db.draw.findMany({
      where: { status: "COMPLETED", snapshotHash: { not: null } },
      include: {
        campaign: {
          include: {
            prizes: { take: 1, select: { title: true } },
          },
        },
        winningEntry: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 20,
    });

    const mapped = await Promise.all(
      recentDraws.map(async (d) => {
        const total = await db.entry.count({
          where: { campaignId: d.campaignId, status: { in: ["VALID", "WINNER"] } },
        });

        const prefix = d.campaign.id.substring(0, 4).toUpperCase();
        return {
          id: d.id,
          campaignId: d.campaignId,
          campaignTitle: d.campaign.title,
          prizeTitle: d.campaign.prizes?.[0]?.title || d.campaign.title,
          completedAt: d.completedAt,
          snapshotHash: d.snapshotHash,
          randomSeed: d.randomSeed,
          totalEntries: total,
          winningEntryNumber: d.winningEntry?.entryNumber || 1,
          winningTicketNumber: d.winningEntry ? `TKT-${prefix}-${d.winningEntry.entryNumber}` : "N/A",
          winnerName: d.winningEntry?.user?.name || "Lucky Winner",
        };
      })
    );

    return NextResponse.json({
      success: true,
      recentDraws: mapped,
    });
  } catch (error: any) {
    console.error("[GET /api/draws/verify error]", error);
    return NextResponse.json({ error: error.message || "Failed to verify draw" }, { status: 500 });
  }
}
