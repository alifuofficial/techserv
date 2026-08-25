import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const { title, slug, description, entryPrice, maxEntries, startsAt, endsAt, status, imageUrl } = data;

    if (!title || !slug || !description || !entryPrice || !maxEntries || !startsAt || !endsAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug exists
    const existing = await db.campaign.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const campaign = await db.campaign.create({
      data: {
        title,
        slug,
        description,
        entryPrice: parseInt(entryPrice, 10),
        maxEntries: parseInt(maxEntries, 10),
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        status: status || "DRAFT",
        imageUrl,
      }
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
