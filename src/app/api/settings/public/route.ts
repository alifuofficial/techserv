import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: ["telegram_bot_username", "telegram_enabled", "site_name", "account_tier_enabled", "referral_system_enabled", "ease_opacity", "ease_y", "ease_duration", "ease_type"],
        },
      },
    });

    const publicSettings = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(publicSettings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
