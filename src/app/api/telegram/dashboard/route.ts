import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const campaigns = await db.campaign.findMany({
      where: {
        status: {
          notIn: ["DRAFT", "draft", "CANCELLED", "cancelled"],
        },
      },
      include: {
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const mappedCampaigns = campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      image: c.imageUrl || null,
      ticketPrice: c.entryPrice,
      currency: c.currency || "ETB",
      drawDate: c.endsAt,
      maxEntries: c.maxEntries,
      entriesCount: c._count.entries,
    }));

    const user = await getTelegramUserFromRequest(req);

    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    };

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          authenticated: false,
          balance: 0,
          campaigns: mappedCampaigns,
          ticketsCount: 0,
          winsCount: 0,
          user: null,
        },
        { headers }
      );
    }

    // Always fetch fresh ledger balance directly from database
    const freshLedger = await db.ledgerAccount.findUnique({
      where: { userId: user.id },
    });

    const userEntries = await db.entry.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    const userEntryIds = userEntries.map((e) => e.id);

    const winsCount =
      userEntryIds.length > 0
        ? await db.draw.count({
            where: {
              status: "COMPLETED",
              winningEntryId: { in: userEntryIds },
            },
          })
        : 0;

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        balance: freshLedger?.balance || 0,
        campaigns: mappedCampaigns,
        ticketsCount: userEntries.length,
        winsCount,
        user: {
          id: user.id,
          name: user.name || "",
          email: user.email || "",
        },
      },
      { headers }
    );
  } catch (error: any) {
    console.error("[GET /api/telegram/dashboard error]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
