import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class CampaignService {
  /**
   * List all campaigns (Admin view)
   */
  static async listAdminCampaigns() {
    return db.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { prizes: true },
    });
  }

  /**
   * List active campaigns for the public UI (Web & Telegram)
   */
  static async listPublicCampaigns() {
    return db.campaign.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'DRAWING', 'COMPLETED'],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: { prizes: true },
    });
  }

  /**
   * Get a campaign by its Slug
   */
  static async getCampaignBySlug(slug: string) {
    return db.campaign.findUnique({
      where: { slug },
      include: { prizes: true },
    });
  }

  /**
   * Create a new Campaign
   */
  static async createCampaign(data: {
    title: string;
    slug: string;
    description: string;
    entryPrice: number;
    currency?: string;
    maxEntries: number;
    startsAt: Date;
    endsAt: Date;
    prizes?: { title: string; value: number; description?: string; imageUrl?: string }[];
  }) {
    return db.campaign.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        entryPrice: data.entryPrice,
        currency: data.currency || 'ETB',
        maxEntries: data.maxEntries,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        status: 'DRAFT',
        prizes: data.prizes
          ? {
              create: data.prizes,
            }
          : undefined,
      },
    });
  }

  /**
   * Update campaign status
   */
  static async updateStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'DRAWING' | 'COMPLETED' | 'CANCELLED') {
    return db.campaign.update({
      where: { id },
      data: { status },
    });
  }
}
