import { NextResponse } from "next/server";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { WithdrawalService } from "@/lib/withdrawal-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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

    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount < 100) {
      return NextResponse.json({ success: false, error: "Minimum withdrawal is 100 ETB." }, { status: 400 });
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
