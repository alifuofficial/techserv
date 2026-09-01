import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch Top Grand Prize Winners (Users with winning entries)
    const winningEntries = await db.entry.findMany({
      where: { status: "WINNER" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        campaign: {
          include: {
            prizes: { take: 1, select: { title: true, value: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Group winners by user
    const winnerStatsMap = new Map<
      string,
      {
        userId: string;
        name: string;
        totalPrizesWon: number;
        totalValueWon: number;
        prizes: string[];
      }
    >();

    for (const entry of winningEntries) {
      const uid = entry.user.id;
      const prizeTitle = entry.campaign.prizes?.[0]?.title || entry.campaign.title;
      const prizeValue =
        entry.campaign.prizes?.[0]?.value || entry.campaign.entryPrice * entry.campaign.maxEntries || 500;

      const rawName = entry.user.name || "Lucky Player";
      // Mask name for privacy (e.g. "Abebe Kebede" -> "Abebe K.")
      const parts = rawName.trim().split(" ");
      const maskedName =
        parts.length > 1
          ? `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`
          : rawName;

      if (!winnerStatsMap.has(uid)) {
        winnerStatsMap.set(uid, {
          userId: uid,
          name: maskedName,
          totalPrizesWon: 1,
          totalValueWon: prizeValue,
          prizes: [prizeTitle],
        });
      } else {
        const stat = winnerStatsMap.get(uid)!;
        stat.totalPrizesWon += 1;
        stat.totalValueWon += prizeValue;
        if (!stat.prizes.includes(prizeTitle)) {
          stat.prizes.push(prizeTitle);
        }
      }
    }

    const topWinners = Array.from(winnerStatsMap.values())
      .sort((a, b) => b.totalValueWon - a.totalValueWon)
      .slice(0, 15);

    // 2. Fetch Top Referrers
    const topReferrersRaw = await db.user.findMany({
      where: {
        referrals: { some: {} },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { referrals: true },
        },
      },
      orderBy: {
        referrals: {
          _count: "desc",
        },
      },
      take: 15,
    });

    const topReferrers = topReferrersRaw.map((u) => {
      const rawName = u.name || "Super Affiliate";
      const parts = rawName.trim().split(" ");
      const maskedName =
        parts.length > 1
          ? `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`
          : rawName;

      return {
        userId: u.id,
        name: maskedName,
        referralCount: u._count.referrals,
        bonusEarned: u._count.referrals * 10, // 10 ETB per referral
      };
    });

    // 3. Platform Total Stats
    const totalPrizesAwarded = await db.entry.count({ where: { status: "WINNER" } });
    const totalDrawsCompleted = await db.draw.count({ where: { status: "COMPLETED" } });

    return NextResponse.json({
      success: true,
      topWinners,
      topReferrers,
      platformStats: {
        totalPrizesAwarded,
        totalDrawsCompleted,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/leaderboard error]", error);
    return NextResponse.json({ error: error.message || "Failed to load leaderboard" }, { status: 500 });
  }
}
