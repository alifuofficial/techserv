import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class EntryService {
  /**
   * Safely issue an entry to a user for a campaign.
   * This uses Serializable isolation to prevent race conditions (over-selling).
   */
  static async issueEntry(
    campaignId: string,
    userId: string,
    paymentId: string
  ) {
    return await db.$transaction(
      async (tx) => {
        // 1. Lock campaign row or just fetch to check maxEntries
        const campaign = await tx.campaign.findUnique({
          where: { id: campaignId },
        });

        if (!campaign) throw new Error('Campaign not found');
        if (campaign.status !== 'ACTIVE') throw new Error('Campaign is not active');

        // 2. Count existing valid entries
        const currentEntriesCount = await tx.entry.count({
          where: { campaignId, status: 'VALID' },
        });

        if (currentEntriesCount >= campaign.maxEntries) {
          throw new Error('Campaign is sold out');
        }

        // 3. Issue new entry
        const entryNumber = currentEntriesCount + 1;

        const entry = await tx.entry.create({
          data: {
            campaignId,
            userId,
            paymentId,
            entryNumber,
            status: 'VALID',
          },
        });

        // 4. If this was the last entry, close the campaign immediately
        if (entryNumber === campaign.maxEntries) {
          await tx.campaign.update({
            where: { id: campaignId },
            data: { status: 'CLOSED' },
          });
        }

        return entry;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }

  /**
   * Get all entries for a specific user
   */
  static async getUserEntries(userId: string) {
    return db.entry.findMany({
      where: { userId },
      include: { campaign: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
