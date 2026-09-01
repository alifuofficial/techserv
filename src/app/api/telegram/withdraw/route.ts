import { NextResponse } from "next/server";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { WithdrawalService } from "@/lib/withdrawal-service";
import { getSystemSetting } from "@/modules/settings/settings-service";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const minWithdrawal = parseFloat(await getSystemSetting("withdrawal_min_amount", "100")) || 100;
    const maxDailyWithdrawal = parseFloat(await getSystemSetting("withdrawal_max_daily_amount", "25000")) || 25000;
    const methodsRaw = await getSystemSetting("withdrawal_methods", "");

    let methods = [
      { id: "TELEBIRR", name: "Telebirr Mobile Money", shortCode: "TB", enabled: true, color: "blue" },
      { id: "CBE", name: "Commercial Bank of Ethiopia (CBE)", shortCode: "CBE", enabled: true, color: "purple" },
      { id: "BOA", name: "Bank of Abyssinia", shortCode: "BOA", enabled: true, color: "amber" },
      { id: "AWASH", name: "Awash Bank", shortCode: "AWASH", enabled: true, color: "emerald" },
    ];

    if (methodsRaw) {
      try {
        const parsed = JSON.parse(methodsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          methods = parsed;
        }
      } catch (e) {}
    }

    // Calculate user's withdrawals in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const past24hWithdrawals = await db.payment.findMany({
      where: {
        userId: user.id,
        provider: { startsWith: "WITHDRAW_" },
        status: { in: ["PENDING", "APPROVED"] },
        createdAt: { gte: oneDayAgo },
      },
      select: { amount: true },
    });

    const todayWithdrawn = past24hWithdrawals.reduce((sum, p) => sum + (p.amount || 0), 0);
    const remainingDailyLimit = Math.max(0, maxDailyWithdrawal - todayWithdrawn);

    const [balanceInfo, withdrawals] = await Promise.all([
      WithdrawalService.getUserBalanceBreakdown(user.id),
      WithdrawalService.getUserWithdrawals(user.id),
    ]);

    return NextResponse.json({
      success: true,
      totalBalance: balanceInfo.totalBalance,
      withdrawableBalance: balanceInfo.withdrawableBalance,
      bonusCredits: balanceInfo.bonusCredits,
      currency: balanceInfo.currency,
      minWithdrawal,
      maxDailyWithdrawal,
      todayWithdrawn,
      remainingDailyLimit,
      methods: methods.filter((m) => m.enabled),
      withdrawals,
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/withdraw error]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch withdrawal info" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, provider, accountName, accountNumber } = body;

    const minWithdrawal = parseFloat(await getSystemSetting("withdrawal_min_amount", "100")) || 100;
    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount < minWithdrawal) {
      return NextResponse.json({ success: false, error: `Minimum withdrawal is ${minWithdrawal} ETB.` }, { status: 400 });
    }

    if (!accountName?.trim() || !accountNumber?.trim()) {
      return NextResponse.json({ success: false, error: "Account name and account number are required." }, { status: 400 });
    }

    const result = await WithdrawalService.requestWithdrawal({
      userId: user.id,
      amount: parsedAmount,
      provider: provider || "TELEBIRR",
      accountName,
      accountNumber,
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully! Funds will be reviewed by admin within 24 hours.",
      ...result,
    });
  } catch (error: any) {
    console.error("[POST /api/telegram/withdraw error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process withdrawal" }, { status: 400 });
  }
}
