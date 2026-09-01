import { db } from "@/lib/db";
import { getSystemSetting } from "@/modules/settings/settings-service";
import CampaignsClient, { AdminCampaignItem } from "./campaigns-client";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const campaigns = await db.campaign.findMany({
    include: {
      prizes: true,
      _count: {
        select: { entries: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedCampaigns: AdminCampaignItem[] = await Promise.all(
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
        productCost,
        targetGross,
        realizedGross,
        targetProfit,
        realizedProfit,
        targetRoi,
        progress,
        status: c.status,
        imageUrl: c.imageUrl,
        startsAt: c.startsAt.toISOString(),
        endsAt: c.endsAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
      };
    })
  );

  const totalCampaigns = formattedCampaigns.length;
  const activeCampaigns = formattedCampaigns.filter((c) => c.status === "ACTIVE").length;
  const totalTargetGross = formattedCampaigns.reduce((acc, c) => acc + c.targetGross, 0);
  const totalRealizedGross = formattedCampaigns.reduce((acc, c) => acc + c.realizedGross, 0);
  const totalProductCost = formattedCampaigns.reduce((acc, c) => acc + c.productCost, 0);
  const totalTargetProfit = formattedCampaigns.reduce((acc, c) => acc + c.targetProfit, 0);
  const totalRealizedProfit = formattedCampaigns.reduce((acc, c) => acc + c.realizedProfit, 0);

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
