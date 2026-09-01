import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WithdrawalService } from "@/lib/withdrawal-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";

    const [withdrawals, stats] = await Promise.all([
      WithdrawalService.listWithdrawals(status),
      WithdrawalService.getStats(),
    ]);

    return NextResponse.json({
      success: true,
      withdrawals,
      stats,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/withdrawals error]", error);
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { action, paymentId, adminTxId, note, rejectionReason } = body;

    if (!paymentId || !action) {
      return NextResponse.json({ error: "Payment ID and action are required." }, { status: 400 });
    }

    if (action === "APPROVE") {
      const result = await WithdrawalService.approveWithdrawal(paymentId, adminTxId, note);
      return NextResponse.json({
        success: true,
        message: "Withdrawal approved and marked as paid!",
        withdrawal: result,
      });
    } else if (action === "REJECT") {
      if (!rejectionReason?.trim()) {
        return NextResponse.json({ error: "Rejection reason is required." }, { status: 400 });
      }

      const result = await WithdrawalService.rejectWithdrawal(paymentId, rejectionReason);
      return NextResponse.json({
        success: true,
        message: "Withdrawal rejected and user's wallet balance has been refunded.",
        withdrawal: result,
      });
    } else {
      return NextResponse.json({ error: "Invalid action. Must be APPROVE or REJECT." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[POST /api/admin/withdrawals error]", error);
    return NextResponse.json({ error: error.message || "Failed to process withdrawal" }, { status: 500 });
  }
}
