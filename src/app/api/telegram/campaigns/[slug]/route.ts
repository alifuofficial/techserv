import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const campaign = await db.campaign.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { entries: true },
        },
        prizes: true,
        draw: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const isCompleted =
      campaign.status === "COMPLETED" ||
      (campaign.draw && campaign.draw.status === "COMPLETED" && !!campaign.draw.winningEntryId);

    let winnerInfo: {
      name: string;
      ticketNumber: string;
      wonAt: string;
      prizeTitle: string;
      snapshotHash?: string | null;
      randomSeed?: string | null;
    } | null = null;

    if (isCompleted && campaign.draw?.winningEntryId) {
      const entry = await db.entry.findUnique({
        where: { id: campaign.draw.winningEntryId },
        include: { user: { select: { name: true, email: true } } },
      });
      if (entry) {
        const prefix = campaign.id.substring(0, 4).toUpperCase();
        winnerInfo = {
          name: entry.user.name || "Lucky Winner",
          ticketNumber: `TKT-${prefix}-${entry.entryNumber}`,
          wonAt: (campaign.draw.completedAt || campaign.draw.createdAt).toISOString(),
          prizeTitle: campaign.prizes?.[0]?.title || campaign.title,
          snapshotHash: campaign.draw.snapshotHash,
          randomSeed: campaign.draw.randomSeed,
        };
      }
    }

    const user = await getTelegramUserFromRequest(req);

    let freshBalance = 0;
    if (user) {
      const freshLedger = await db.ledgerAccount.findUnique({
        where: { userId: user.id },
      });
      freshBalance = freshLedger?.balance || 0;
    }

    return NextResponse.json(
      {
        success: true,
        campaign: {
          id: campaign.id,
          title: campaign.title,
          slug: campaign.slug,
          description: campaign.description,
          image: campaign.imageUrl || null,
          ticketPrice: campaign.entryPrice,
          currency: campaign.currency || "ETB",
          drawDate: campaign.endsAt,
          startsAt: campaign.startsAt,
          maxEntries: campaign.maxEntries,
          entriesCount: campaign._count.entries,
          status: isCompleted ? "COMPLETED" : campaign.status,
          isCompleted: !!isCompleted,
          prizes: campaign.prizes,
          prizeTitle: campaign.prizes?.[0]?.title || campaign.title,
          winner: winnerInfo,
        },
        user: user
          ? {
              id: user.id,
              name: user.name || "",
              balance: freshBalance,
            }
          : null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error: any) {
    console.error("[GET /api/telegram/campaigns/[slug] error]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
