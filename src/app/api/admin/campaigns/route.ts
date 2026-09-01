import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyNewCampaignStarted } from "@/lib/telegram-notifications";
import { getSystemSetting, setSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const campaigns = await db.campaign.findMany({
      include: {
        prizes: true,
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedCampaigns = await Promise.all(
      campaigns.map(async (c) => {
        const prizeCost = c.prizes?.[0]?.value || 0;
        const settingCost = parseInt(await getSystemSetting(`product_cost_${c.id}`, "0"), 10) || 0;
        const productCost = prizeCost || settingCost || 0;

        const entriesSold = c._count.entries;
        const maxEntries = c.maxEntries || 1;
        const targetGross = c.entryPrice * maxEntries;
        const realizedGross = c.entryPrice * entriesSold;

        const targetProfit = targetGross - productCost;
        const realizedProfit = realizedGross - productCost;
        const targetRoi = productCost > 0 ? ((targetProfit / productCost) * 100).toFixed(1) : "0.0";
        const progress = Math.min(100, Math.round((entriesSold / maxEntries) * 100));

        return {
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          entryPrice: c.entryPrice,
          currency: c.currency,
          maxEntries: c.maxEntries,
          entriesSold,
          productCost, // Market price / purchase cost of product
          targetGross,
          realizedGross,
          targetProfit,
          realizedProfit,
          targetRoi,
          progress,
          status: c.status,
          imageUrl: c.imageUrl,
          startsAt: c.startsAt,
          endsAt: c.endsAt,
          createdAt: c.createdAt,
        };
      })
    );

    // Summary Analytics
    const totalCampaigns = formattedCampaigns.length;
    const activeCampaigns = formattedCampaigns.filter((c) => c.status === "ACTIVE").length;
    const totalTargetGross = formattedCampaigns.reduce((acc, c) => acc + c.targetGross, 0);
    const totalRealizedGross = formattedCampaigns.reduce((acc, c) => acc + c.realizedGross, 0);
    const totalProductCost = formattedCampaigns.reduce((acc, c) => acc + c.productCost, 0);
    const totalTargetProfit = formattedCampaigns.reduce((acc, c) => acc + c.targetProfit, 0);
    const totalRealizedProfit = formattedCampaigns.reduce((acc, c) => acc + c.realizedProfit, 0);

    return NextResponse.json({
      success: true,
      campaigns: formattedCampaigns,
      stats: {
        totalCampaigns,
        activeCampaigns,
        totalTargetGross,
        totalRealizedGross,
        totalProductCost,
        totalTargetProfit,
        totalRealizedProfit,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch admin campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
      productCost = "0", // Market price / purchase price of the product
      startsAt,
      endsAt,
      status,
      imageUrl,
    } = data;

    if (!title || !slug || !description || !entryPrice || !maxEntries || !startsAt || !endsAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug exists
    const existing = await db.campaign.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists. Please choose a unique URL slug." }, { status: 400 });
    }

    const numericCost = Math.max(0, parseInt(productCost, 10) || 0);

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
        prizes: {
          create: [
            {
              title: title,
              value: numericCost,
              description: `Product Market Price / Cost: ${numericCost} ETB`,
              imageUrl: imageUrl || "",
            },
          ],
        },
      },
    });

    // Store in settings for quick lookup
    if (numericCost > 0) {
      await setSystemSetting(`product_cost_${campaign.id}`, numericCost.toString());
    }

    // If campaign is created with ACTIVE status, broadcast to Telegram users
    if (campaign.status === "ACTIVE") {
      notifyNewCampaignStarted(campaign.id).catch(console.error);
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
