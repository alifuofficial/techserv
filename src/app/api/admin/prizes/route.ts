import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prizes = await db.prize.findMany({
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            currency: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, prizes });
  } catch (error: any) {
    console.error("[GET /api/admin/prizes error]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch prizes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, title, value, description, imageUrl } = body;

    if (!campaignId || !title) {
      return NextResponse.json({ success: false, error: "Campaign ID and Title are required" }, { status: 400 });
    }

    const prize = await db.prize.create({
      data: {
        campaignId,
        title,
        value: Number(value) || 0,
        description: description || null,
        imageUrl: imageUrl || null,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            currency: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, prize });
  } catch (error: any) {
    console.error("[POST /api/admin/prizes error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create prize" }, { status: 500 });
  }
}
