import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DailySpinService, SpinPrizeSlice } from "@/lib/daily-spin-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await DailySpinService.getAdminStatsAndHistory();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("[GET /api/admin/spin error]", error);
    return NextResponse.json({ error: "Failed to fetch spin data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { enabled, cooldownHours, prizes } = body;

    if (cooldownHours === undefined || !Array.isArray(prizes)) {
      return NextResponse.json({ error: "Invalid parameters provided" }, { status: 400 });
    }

    // Validate prizes
    for (const p of prizes) {
      if (!p.title || p.weight === undefined || p.value === undefined) {
        return NextResponse.json({ error: "Each prize slice must have a title, weight, and value" }, { status: 400 });
      }
    }

    await DailySpinService.saveSettings({
      enabled: !!enabled,
      cooldownHours: parseInt(cooldownHours, 10) || 24,
      prizes: prizes as SpinPrizeSlice[],
    });

    return NextResponse.json({ success: true, message: "Spin settings saved successfully" });
  } catch (error: any) {
    console.error("[POST /api/admin/spin error]", error);
    return NextResponse.json({ error: "Failed to save spin settings" }, { status: 500 });
  }
}
