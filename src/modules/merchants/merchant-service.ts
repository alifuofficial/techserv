import { db } from '@/lib/db';
import { CampaignService } from '@/modules/campaigns/campaign-service';

export class MerchantService {
  /**
   * Merchant proposes a new campaign.
   * It is created as a DRAFT and requires Admin approval to become ACTIVE.
   */
  static async proposeCampaign(
    merchantId: string,
    data: Parameters<typeof CampaignService.createCampaign>[0]
  ) {
    // 1. Verify user is a Merchant
    const merchant = await db.user.findUnique({ where: { id: merchantId } });
    if (!merchant || merchant.role !== 'MERCHANT') {
      throw new Error('Unauthorized: Only merchants can propose campaigns');
    }

    // 2. Create the campaign linked to the merchant
    const campaign = await db.campaign.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        entryPrice: data.entryPrice,
        currency: data.currency || 'ETB',
        maxEntries: data.maxEntries,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        status: 'DRAFT', // Always starts as DRAFT
        merchantId: merchantId,
        prizes: data.prizes
          ? {
              create: data.prizes,
            }
          : undefined,
      },
    });

    return campaign;
  }

  /**
   * List all campaigns proposed by a specific merchant.
   */
  static async listMerchantCampaigns(merchantId: string) {
    return db.campaign.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      include: { prizes: true },
    });
  }

  /**
   * Admin approves a merchant's campaign, setting it to ACTIVE.
   */
  static async approveCampaign(campaignId: string) {
    return CampaignService.updateStatus(campaignId, 'ACTIVE');
  }
}
