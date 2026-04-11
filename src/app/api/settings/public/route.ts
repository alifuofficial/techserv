import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: [
            "site_name", "site_description", "site_email", "currency", "currency_symbol", 
            "telegram_enabled", "telegram_bot_username", "maintenance_mode",
            "account_tier_enabled", "referral_system_enabled", "registration_enabled",
            "tier_benefits_standard", "tier_benefits_gold", "referral_benefits",
          ],
        },
      },
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsMap);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
