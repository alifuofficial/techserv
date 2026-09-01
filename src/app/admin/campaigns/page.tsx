import { db } from "@/lib/db";
import { getSystemSetting } from "@/modules/settings/settings-service";
import CampaignsClient, { AdminCampaignItem } from "./campaigns-client";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  let campaigns: any[] = [];
  try {
    campaigns = await db.campaign.findMany({
      include: {
        prizes: true,
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Failed to query campaigns:", err);
    campaigns = [];
  }

  const formattedCampaigns: AdminCampaignItem[] = await Promise.all(
    campaigns.map(async (c) => {
      const prizeCost = c.prizes?.[0]?.value || 0;
      let settingCost = 0;
      try {
        settingCost = parseInt(await getSystemSetting(`product_cost_${c.id}`, "0"), 10) || 0;
      } catch (e) {}
      const productCost = prizeCost || settingCost || 0;

      const entriesSold = c._count?.entries || 0;
      const maxEntries = Math.max(1, c.maxEntries || 1);
      const entryPrice = c.entryPrice || 0;
      const targetGross = entryPrice * maxEntries;
      const realizedGross = entryPrice * entriesSold;

      const targetProfit = targetGross - productCost;
      const realizedProfit = realizedGross - productCost;
      const targetRoi = productCost > 0 ? ((targetProfit / productCost) * 100).toFixed(1) : "0.0";
      const progress = Math.min(100, Math.round((entriesSold / maxEntries) * 100));

      let startsAtStr = "";
      try {
        startsAtStr = c.startsAt ? new Date(c.startsAt).toISOString() : new Date().toISOString();
      } catch (e) {
        startsAtStr = new Date().toISOString();
      }

      let endsAtStr = "";
      try {
        endsAtStr = c.endsAt ? new Date(c.endsAt).toISOString() : new Date().toISOString();
      } catch (e) {
        endsAtStr = new Date().toISOString();
      }

      let createdAtStr = "";
      try {
        createdAtStr = c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString();
      } catch (e) {
        createdAtStr = new Date().toISOString();
      }

      return {
        id: c.id,
        title: c.title || "Untitled Campaign",
        slug: c.slug || c.id,
        description: c.description || "",
        entryPrice: entryPrice,
        currency: c.currency || "ETB",
        maxEntries: c.maxEntries || 0,
        entriesSold,
        productCost,
        targetGross,
        realizedGross,
        targetProfit,
        realizedProfit,
        targetRoi,
        progress,
        status: c.status || "DRAFT",
        imageUrl: c.imageUrl || null,
        startsAt: startsAtStr,
        endsAt: endsAtStr,
        createdAt: createdAtStr,
      };
    })
  );

  const totalCampaigns = formattedCampaigns.length;
  const activeCampaigns = formattedCampaigns.filter((c) => c.status === "ACTIVE").length;
  const totalTargetGross = formattedCampaigns.reduce((acc, c) => acc + (c.targetGross || 0), 0);
  const totalRealizedGross = formattedCampaigns.reduce((acc, c) => acc + (c.realizedGross || 0), 0);
  const totalProductCost = formattedCampaigns.reduce((acc, c) => acc + (c.productCost || 0), 0);
  const totalTargetProfit = formattedCampaigns.reduce((acc, c) => acc + (c.targetProfit || 0), 0);
  const totalRealizedProfit = formattedCampaigns.reduce((acc, c) => acc + (c.realizedProfit || 0), 0);

  const stats = {
    totalCampaigns,
    activeCampaigns,
    totalTargetGross,
    totalRealizedGross,
    totalProductCost,
    totalTargetProfit,
    totalRealizedProfit,
  };

  return <CampaignsClient initialCampaigns={formattedCampaigns} stats={stats} />;
}
