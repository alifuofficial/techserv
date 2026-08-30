import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const entries = await db.entry.findMany({
      where: { userId: user.id },
      include: {
        campaign: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const tickets = entries.map((entry) => {
      const prefix = entry.campaignId.substring(0, 4).toUpperCase();
      return {
        id: entry.id,
        entryNumber: entry.entryNumber,
        ticketNumber: `TKT-${prefix}-${entry.entryNumber}`,
        campaignId: entry.campaignId,
        campaignTitle: entry.campaign.title,
        campaignSlug: entry.campaign.slug,
        campaignImage: entry.campaign.imageUrl || null,
        campaignStatus: entry.campaign.status,
        entryPrice: entry.campaign.entryPrice,
        currency: entry.campaign.currency,
        drawDate: entry.campaign.endsAt,
        createdAt: entry.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error("[GET /api/telegram/tickets error]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
