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

    const referralCode = user.referralCode || `MILKY-${user.id.substring(0, 6).toUpperCase()}`;
    const referralLink = `https://t.me/milkytechonlinebot?start=${referralCode}`;

    // Find all users who were referred by this user
    // We check both referredById === user.id AND users who joined with this user's referral code or providerId
    const referredUsers = await db.user.findMany({
      where: {
        OR: [
          { referredById: user.id },
          {
            identities: {
              some: {
                user: {
                  referredById: user.id,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedReferredUsers = referredUsers.map((u) => {
      const tgId = (u.email || "").split("@")[0].replace("telegram_", "");
      const displayName = u.name || (tgId ? `User ${tgId}` : "User");
      return {
        id: u.id,
        name: displayName,
        joinedAt: u.createdAt.toISOString(),
        bonus: 10,
      };
    });

    return NextResponse.json({
      success: true,
      referralCode,
      referralLink,
      referredCount: mappedReferredUsers.length,
      totalEarned: mappedReferredUsers.length * 10,
      referredUsers: mappedReferredUsers,
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/referrals error]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
