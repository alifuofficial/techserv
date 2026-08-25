import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const campaign = await db.campaign.findUnique({
      where: { id: id }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const { title, slug, description, entryPrice, maxEntries, startsAt, endsAt, status, imageUrl } = data;

    const campaign = await db.campaign.update({
      where: { id: id },
      data: {
        title,
        slug,
        description,
        entryPrice: parseInt(entryPrice, 10),
        maxEntries: parseInt(maxEntries, 10),
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        status,
        imageUrl,
      }
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}
