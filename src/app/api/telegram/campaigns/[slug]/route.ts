import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const campaign = await db.campaign.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { entries: true },
        },
        prizes: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const user = await getTelegramUserFromRequest(req);

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        slug: campaign.slug,
        description: campaign.description,
        image: campaign.imageUrl || null,
        ticketPrice: campaign.entryPrice,
        currency: campaign.currency || "ETB",
        drawDate: campaign.endsAt,
        startsAt: campaign.startsAt,
        maxEntries: campaign.maxEntries,
        entriesCount: campaign._count.entries,
        status: campaign.status,
        prizes: campaign.prizes,
      },
      user: user
        ? {
            id: user.id,
            name: user.name || "",
            balance: user.ledgerAccount?.balance || 0,
          }
        : null,
    });
  } catch (error: any) {
    console.error("[GET /api/telegram/campaigns/[slug] error]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
