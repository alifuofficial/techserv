import { NextResponse } from "next/server";
import { getSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export interface PublicPaymentMethod {
  id: string;
  name: string;
  shortCode: string;
  category: "MOBILE_MONEY" | "BANK_TRANSFER";
  accountName: string;
  accountNumber: string;
  instructions: string;
  enabled: boolean;
  color: string;
}

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
      customPaymentMethodsRaw,
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
      getSystemSetting("custom_payment_methods", ""),
      getSystemSetting("referral_enabled", "true"),
      getSystemSetting("referral_bonus_amount", "10"),
      getSystemSetting("referral_currency", "ETB"),
      getSystemSetting("referral_custom_text", "Earn bonus for every friend who joins MilkyTech using your link!"),
      getSystemSetting("platform_name", "MilkyTech"),
      getSystemSetting("support_email", "support@milkytech.online"),
    ]);

    let methods: PublicPaymentMethod[] = [];
    if (customPaymentMethodsRaw) {
      try {
        methods = JSON.parse(customPaymentMethodsRaw);
      } catch (e) {
        methods = [];
      }
    }

    if (!methods || methods.length === 0) {
      methods = [
        {
          id: "telebirr",
          name: "Telebirr Direct",
          shortCode: "TB",
          category: "MOBILE_MONEY",
          accountName: telebirrAccountName,
          accountNumber: telebirrAccountNumber,
          instructions: telebirrInstructions,
          enabled: telebirrEnabled === "true",
          color: "blue",
        },
        {
          id: "cbe",
          name: "Commercial Bank of Ethiopia (CBE)",
          shortCode: "CBE",
          category: "BANK_TRANSFER",
          accountName: cbeAccountName,
          accountNumber: cbeAccountNumber,
          instructions: cbeInstructions,
          enabled: cbeEnabled === "true",
          color: "purple",
        },
      ];
    }

    // Filter only enabled methods for public users
    const activeMethods = methods.filter((m) => m.enabled);

    return NextResponse.json(
      {
        success: true,
        settings: {
          paymentMethods: activeMethods,
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
