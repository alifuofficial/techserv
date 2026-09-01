import { NextResponse } from "next/server";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { DailySpinService } from "@/lib/daily-spin-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eligibility = await DailySpinService.getUserEligibility(user.id);

    return NextResponse.json({
      success: true,
      ...eligibility,
      user: {
        id: user.id,
        name: user.name || "Player",
        balance: user.ledgerAccount?.balance || 0,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/spin/status error]", error);
    return NextResponse.json({ error: "Failed to get spin status" }, { status: 500 });
  }
}
