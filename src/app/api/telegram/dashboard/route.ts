import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { getMultipleSystemSettings } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. Parallel fetch: User Auth, Campaigns, Recent Draws, and System Settings in a single concurrent batch
    const [user, campaigns, recentDraws, settings] = await Promise.all([
      getTelegramUserFromRequest(req),
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
          prizes: {
            take: 1,
            select: { title: true, value: true },
          },
          draw: {
            select: {
              status: true,
              winningEntryId: true,
              completedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.draw.findMany({
        where: { status: "COMPLETED", winningEntryId: { not: null } },
        include: {
          campaign: {
            include: {
              prizes: { take: 1, select: { title: true } },
            },
          },
        },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
      getMultipleSystemSettings([
        { key: "referral_bonus_amount", defaultValue: "10" },
        { key: "referral_currency", defaultValue: "ETB" },
      ]),
    ]);

    // 2. Batch-fetch all winning entries in ONE SINGLE QUERY to eliminate N+1 latency
    const winningEntryIds = new Set<string>();
    for (const c of campaigns) {
      if (c.draw?.winningEntryId) winningEntryIds.add(c.draw.winningEntryId);
    }
    for (const d of recentDraws) {
      if (d.winningEntryId) winningEntryIds.add(d.winningEntryId);
    }

    const winningEntriesList =
      winningEntryIds.size > 0
        ? await db.entry.findMany({
            where: { id: { in: Array.from(winningEntryIds) } },
            select: {
              id: true,
              entryNumber: true,
              user: { select: { name: true, email: true } },
            },
          })
        : [];

    const winningEntryMap = new Map(winningEntriesList.map((e) => [e.id, e]));

    // 3. Map campaigns with instant in-memory winner lookups
    const mappedCampaigns = campaigns.map((c) => {
      const isCompleted =
        c.status === "COMPLETED" ||
        (c.draw && c.draw.status === "COMPLETED" && !!c.draw.winningEntryId);

      const isInstant =
        c.slug.startsWith("flash-") ||
        c.slug.startsWith("instant-") ||
        c.title.toLowerCase().includes("instant") ||
        c.title.toLowerCase().includes("flash");

      let winnerName: string | null = null;
      let winningTicketNumber: string | null = null;

      if (isCompleted && c.draw?.winningEntryId) {
        const winningEntry = winningEntryMap.get(c.draw.winningEntryId);
        if (winningEntry) {
          winnerName = winningEntry.user.name || "Lucky Winner";
          const prefix = c.id.substring(0, 4).toUpperCase();
          winningTicketNumber = `TKT-${prefix}-${winningEntry.entryNumber}`;
        }
      }

      return {
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
        isCompleted: !!isCompleted,
        isInstant: !!isInstant,
        status: isCompleted ? "COMPLETED" : c.status,
        winnerName,
        winningTicketNumber,
        completedAt: c.draw?.completedAt?.toISOString() || null,
      };
    });

    // 4. Map recent winners with instant in-memory lookup
    const validRecentWinners = recentDraws
      .map((d) => {
        if (!d.winningEntryId) return null;
        const entry = winningEntryMap.get(d.winningEntryId);
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
      .filter(Boolean);

    const referralBonus = parseFloat(settings.referral_bonus_amount) || 10;
    const referralCurrency = settings.referral_currency || "ETB";

    const headers = {
      "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15",
    };

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

    // 5. Fast user stats queries (single parallel count batch)
    const [ticketsCount, winsCount] = await Promise.all([
      db.entry.count({ where: { userId: user.id } }),
      db.entry.count({ where: { userId: user.id, status: "WINNER" } }),
    ]);

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        balance: user.ledgerAccount?.balance || 0,
        campaigns: mappedCampaigns,
        recentWinners: validRecentWinners,
        ticketsCount,
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
      { status: 500 }
    );
  }
}
