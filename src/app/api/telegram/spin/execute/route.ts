import { NextResponse } from "next/server";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { DailySpinService } from "@/lib/daily-spin-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await DailySpinService.executeSpin(user.id);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[POST /api/telegram/spin/execute error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute spin" },
      { status: 400 }
    );
  }
}
