import { db } from "@/lib/db";
import PrizesClient, { PrizeItem } from "./prizes-client";

export const dynamic = "force-dynamic";

export default async function AdminPrizesPage() {
  const [prizes, campaigns] = await Promise.all([
    db.prize.findMany({
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
    }),
    db.campaign.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        currency: true,
        entryPrice: true,
        maxEntries: true,
        imageUrl: true,
      },
      orderBy: {
        title: "asc",
      },
    }),
  ]);

  const campaignMap = new Map(campaigns.map((c) => [c.id, c]));
  const coveredCampaignIds = new Set<string>();

  const mappedPrizes: PrizeItem[] = prizes.map((prize) => {
    coveredCampaignIds.add(prize.campaignId);
    return {
      id: prize.id,
      title: prize.title,
      value: prize.value,
      description: prize.description,
      imageUrl: prize.imageUrl || prize.campaign?.imageUrl || null,
      campaignId: prize.campaignId,
      campaignTitle: prize.campaign?.title || "Campaign",
      campaignSlug: prize.campaign?.slug || "",
      campaignStatus: prize.campaign?.status || "ACTIVE",
      currency: prize.campaign?.currency || "ETB",
      createdAt: prize.createdAt.toISOString(),
    };
  });

  // Fallback: If campaigns don't have explicit Prize rows, show default campaign grand prizes
  for (const camp of campaigns) {
    if (!coveredCampaignIds.has(camp.id)) {
      mappedPrizes.push({
        id: `PRZ-${camp.id.substring(0, 6)}`,
        title: camp.title,
        value: camp.entryPrice * camp.maxEntries,
        description: `Grand Prize for ${camp.title}`,
        imageUrl: camp.imageUrl || null,
        campaignId: camp.id,
        campaignTitle: camp.title,
        campaignSlug: camp.slug,
        campaignStatus: camp.status,
        currency: camp.currency || "ETB",
        createdAt: new Date().toISOString(),
      });
    }
  }

  const campaignOptions = campaigns.map((c) => ({
    id: c.id,
    title: c.title,
  }));

  return (
    <PrizesClient
      initialPrizes={mappedPrizes}
      campaigns={campaignOptions}
    />
  );
}
