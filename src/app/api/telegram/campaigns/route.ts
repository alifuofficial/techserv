import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const campaigns = await db.campaign.findMany({
      where: {
        status: {
          notIn: ["DRAFT", "draft", "CANCELLED", "cancelled"],
        },
      },
      include: {
        _count: {
          select: { entries: true },
        },
        prizes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      image: c.imageUrl || null,
      ticketPrice: c.entryPrice,
      currency: c.currency || "ETB",
      drawDate: c.endsAt,
      startsAt: c.startsAt,
      maxEntries: c.maxEntries,
      entriesCount: c._count.entries,
      status: c.status,
      prizes: c.prizes?.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
      })),
    }));

    return NextResponse.json({ success: true, campaigns: mapped });
  } catch (error: any) {
    console.error("[GET /api/telegram/campaigns error]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
