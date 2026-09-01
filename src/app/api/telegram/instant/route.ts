import { NextResponse } from "next/server";
import { InstantDrawService } from "@/lib/instant-draw-service";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);
    const draws = await InstantDrawService.listActiveInstantDraws();

    return NextResponse.json({
      success: true,
      draws,
      user: user
        ? {
            id: user.id,
            name: user.name || "Player",
            balance: user.ledgerAccount?.balance || 0,
          }
        : null,
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/instant error]", error);
    return NextResponse.json({ error: "Failed to fetch instant draws" }, { status: 500 });
  }
}
