import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { getSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const [campaigns, recentDraws, referralBonusSetting, referralCurrencySetting] = await Promise.all([
      db.campaign.findMany({
        where: {
          status: {
            notIn: ["DRAFT", "draft", "CANCELLED", "cancelled"],
          },
        },
        include: {
          _count: {
            select: { entries: true },
          },
          prizes: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.draw.findMany({
        where: { status: "COMPLETED", winningEntryId: { not: null } },
        include: {
          campaign: {
            include: { prizes: true },
          },
        },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
      getSystemSetting("referral_bonus_amount", "10"),
      getSystemSetting("referral_currency", "ETB"),
    ]);

    const mappedCampaigns = campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      image: c.imageUrl || null,
      prizeTitle: c.prizes?.[0]?.title || c.title,
      prizeValue: c.prizes?.[0]?.value || c.entryPrice * c.maxEntries,
      ticketPrice: c.entryPrice,
      currency: c.currency || "ETB",
      drawDate: c.endsAt,
      maxEntries: c.maxEntries,
      entriesCount: c._count.entries,
      percentage: Math.min(100, Math.round((c._count.entries / (c.maxEntries || 1)) * 100)),
      remainingTickets: Math.max(0, c.maxEntries - c._count.entries),
    }));

    // Find winner details for recent draws
    const recentWinners = await Promise.all(
      recentDraws.map(async (d) => {
        if (!d.winningEntryId) return null;
        const entry = await db.entry.findUnique({
          where: { id: d.winningEntryId },
          include: { user: { select: { name: true, email: true } } },
        });
        if (!entry) return null;
        const prefix = d.campaignId.substring(0, 4).toUpperCase();
        return {
          id: d.id,
          winnerName: entry.user.name || "Lucky Winner",
          prizeTitle: d.campaign.prizes?.[0]?.title || d.campaign.title,
          ticketNumber: `TKT-${prefix}-${entry.entryNumber}`,
          drawDate: d.completedAt?.toISOString() || new Date().toISOString(),
        };
      })
    );

    const validRecentWinners = recentWinners.filter(Boolean);

    const user = await getTelegramUserFromRequest(req);

    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    };

    const referralBonus = parseFloat(referralBonusSetting) || 10;
    const referralCurrency = referralCurrencySetting || "ETB";

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          authenticated: false,
          balance: 0,
          campaigns: mappedCampaigns,
          recentWinners: validRecentWinners,
          ticketsCount: 0,
          winsCount: 0,
          referralBonus,
          referralCurrency,
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
        recentWinners: validRecentWinners,
        ticketsCount: userEntries.length,
        winsCount,
        referralBonus,
        referralCurrency,
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
