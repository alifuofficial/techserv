import { NextResponse } from "next/server";
import { getSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      telebirrEnabled,
      telebirrAccountName,
      telebirrAccountNumber,
      telebirrInstructions,
      cbeEnabled,
      cbeAccountName,
      cbeAccountNumber,
      cbeInstructions,
      referralEnabled,
      referralBonusAmount,
      referralCurrency,
      referralCustomText,
      platformName,
      supportEmail,
    ] = await Promise.all([
      getSystemSetting("telebirr_enabled", "true"),
      getSystemSetting("telebirr_account_name", "MilkyTech Online"),
      getSystemSetting("telebirr_account_number", "0911000000"),
      getSystemSetting("telebirr_instructions", "Transfer to the Telebirr number above and upload your transaction receipt."),
      getSystemSetting("cbe_enabled", "true"),
      getSystemSetting("cbe_account_name", "MilkyTech Online PLC"),
      getSystemSetting("cbe_account_number", "1000123456789"),
      getSystemSetting("cbe_instructions", "Transfer to the CBE account number above and upload your transaction receipt."),
      getSystemSetting("referral_enabled", "true"),
      getSystemSetting("referral_bonus_amount", "10"),
      getSystemSetting("referral_currency", "ETB"),
      getSystemSetting("referral_custom_text", "Earn bonus for every friend who joins MilkyTech using your link!"),
      getSystemSetting("platform_name", "MilkyTech"),
      getSystemSetting("support_email", "support@milkytech.online"),
    ]);

    return NextResponse.json(
      {
        success: true,
        settings: {
          telebirr: {
            enabled: telebirrEnabled === "true",
            accountName: telebirrAccountName,
            accountNumber: telebirrAccountNumber,
            instructions: telebirrInstructions,
          },
          cbe: {
            enabled: cbeEnabled === "true",
            accountName: cbeAccountName,
            accountNumber: cbeAccountNumber,
            instructions: cbeInstructions,
          },
          referral: {
            enabled: referralEnabled === "true",
            bonusAmount: parseFloat(referralBonusAmount) || 10,
            currency: referralCurrency,
            customText: referralCustomText,
          },
          platform: {
            name: platformName,
            supportEmail,
          },
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error: any) {
    console.error("[GET /api/settings/public error]", error);
    return NextResponse.json({ success: false, error: "Failed to load public settings" }, { status: 500 });
  }
}
