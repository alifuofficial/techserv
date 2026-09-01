import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DailySpinService } from "@/lib/daily-spin-service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await DailySpinService.dispatchSpinReminders();

    return NextResponse.json({
      success: true,
      result,
      message: `Dispatched ${result.remindedCount} reminders (${result.totalEligible} total eligible users).`,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/spin/remind error]", error);
    return NextResponse.json({ error: error.message || "Failed to dispatch reminders" }, { status: 500 });
  }
}
