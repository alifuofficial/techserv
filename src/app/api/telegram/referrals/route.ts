import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { getSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const [bonusAmountSetting, currencySetting, customTextSetting, botUsernameSetting] = await Promise.all([
      getSystemSetting("referral_bonus_amount", "10"),
      getSystemSetting("referral_currency", "ETB"),
      getSystemSetting("referral_custom_text", "Earn bonus for every friend who joins MilkyTech using your link!"),
      getSystemSetting("telegram_bot_username", "milkytechonlinebot"),
    ]);

    const bonusAmount = parseFloat(bonusAmountSetting) || 10;
    const currency = currencySetting || "ETB";
    const botUsername = botUsernameSetting || "milkytechonlinebot";

    const referralCode = user.referralCode || `MILKY-${user.id.substring(0, 6).toUpperCase()}`;
    const referralLink = `https://t.me/${botUsername}?start=${referralCode}`;

    // Find all users who were referred by this user
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
        bonus: bonusAmount,
      };
    });

    return NextResponse.json({
      success: true,
      referralCode,
      referralLink,
      bonusAmount,
      currency,
      customText: customTextSetting,
      referredCount: mappedReferredUsers.length,
      totalEarned: mappedReferredUsers.length * bonusAmount,
      referredUsers: mappedReferredUsers,
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/referrals error]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
