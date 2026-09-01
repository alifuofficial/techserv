import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { InstantDrawService, INSTANT_DRAW_PRESETS } from "@/lib/instant-draw-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const activeDraws = await InstantDrawService.listActiveInstantDraws();

    const recentCompleted = await db.campaign.findMany({
      where: {
        slug: { startsWith: "flash-" },
        status: "COMPLETED",
      },
      include: {
        prizes: true,
        draw: true,
        _count: { select: { entries: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      activeDraws,
      recentCompleted,
      presets: INSTANT_DRAW_PRESETS,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/instant-draws error]", error);
    return NextResponse.json({ error: "Failed to fetch instant draws" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      entryPrice,
      maxEntries,
      prizeTitle,
      prizeValue,
      productCost,
      description,
      imageUrl,
      autoRenew,
      presetId,
    } = body;

    let drawData = {
      title,
      entryPrice: parseInt(entryPrice, 10),
      maxEntries: parseInt(maxEntries, 10),
      prizeTitle,
      prizeValue: parseInt(prizeValue, 10),
      productCost: parseInt(productCost, 10) || parseInt(prizeValue, 10),
      description,
      imageUrl,
      autoRenew: !!autoRenew,
    };

    if (presetId) {
      const preset = INSTANT_DRAW_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        drawData = {
          title: preset.name,
          entryPrice: preset.entryPrice,
          maxEntries: preset.maxEntries,
          prizeTitle: preset.prizeTitle,
          prizeValue: preset.prizeValue,
          productCost: preset.productCost,
          description: preset.description,
          imageUrl: preset.imageUrl,
          autoRenew: preset.autoRenew ?? true,
        };
      }
    }

    if (!drawData.title || !drawData.entryPrice || !drawData.maxEntries || !drawData.prizeTitle) {
      return NextResponse.json({ error: "Missing required draw fields" }, { status: 400 });
    }

    const campaign = await InstantDrawService.createInstantDraw(drawData);

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[POST /api/admin/instant-draws error]", error);
    return NextResponse.json({ error: "Failed to create instant draw" }, { status: 500 });
  }
}
