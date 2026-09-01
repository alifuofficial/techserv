import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyNewCampaignStarted } from "@/lib/telegram-notifications";
import { getSystemSetting, setSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const campaign = await db.campaign.findUnique({
      where: { id },
      include: {
        prizes: true,
        _count: { select: { entries: true } },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const prizeCost = campaign.prizes?.[0]?.value || 0;
    const settingCost = parseInt(await getSystemSetting(`product_cost_${campaign.id}`, "0"), 10) || 0;
    const productCost = prizeCost || settingCost || 0;

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        productCost,
      },
    });
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
    const {
      title,
      slug,
      description,
      entryPrice,
      maxEntries,
      productCost = "0",
      startsAt,
      endsAt,
      status,
      imageUrl,
    } = data;

    const existing = await db.campaign.findUnique({ where: { id }, include: { prizes: true } });
    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const numericCost = Math.max(0, parseInt(productCost, 10) || 0);

    const campaign = await db.campaign.update({
      where: { id },
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
      },
    });

    // Update or create Prize record with the market cost
    if (existing.prizes && existing.prizes.length > 0) {
      await db.prize.update({
        where: { id: existing.prizes[0].id },
        data: {
          title: title,
          value: numericCost,
          description: `Product Market Price / Cost: ${numericCost} ETB`,
          imageUrl: imageUrl || existing.prizes[0].imageUrl,
        },
      });
    } else {
      await db.prize.create({
        data: {
          campaignId: campaign.id,
          title: title,
          value: numericCost,
          description: `Product Market Price / Cost: ${numericCost} ETB`,
          imageUrl: imageUrl || "",
        },
      });
    }

    // Save to SystemSetting
    await setSystemSetting(`product_cost_${campaign.id}`, numericCost.toString());

    // If campaign transitions to ACTIVE, send campaign launch notification
    if (existing?.status !== "ACTIVE" && campaign.status === "ACTIVE") {
      notifyNewCampaignStarted(campaign.id).catch(console.error);
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[PUT /api/admin/campaigns/[id] error]", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}
