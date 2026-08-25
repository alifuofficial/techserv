import { db } from '@/lib/db';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';

export class DrawService {
  /**
   * Execute the draw for a closed campaign.
   * This generates the snapshot, picks a random winner securely,
   * and finalizes the campaign status.
   */
  static async executeDraw(campaignId: string, adminUserId: string) {
    return await db.$transaction(
      async (tx) => {
        // 1. Verify campaign is ready for drawing
        const campaign = await tx.campaign.findUnique({
          where: { id: campaignId },
        });

        if (!campaign) throw new Error('Campaign not found');
        if (campaign.status !== 'CLOSED') {
          throw new Error('Campaign must be CLOSED before drawing');
        }

        // 2. Transition state to prevent concurrent draws
        await tx.campaign.update({
          where: { id: campaignId },
          data: { status: 'DRAWING' },
        });

        // 3. Fetch all valid entries deterministically ordered
        const validEntries = await tx.entry.findMany({
          where: { campaignId: campaignId, status: 'VALID' },
          orderBy: { entryNumber: 'asc' }, // Must be deterministic
          select: { id: true, userId: true, entryNumber: true },
        });

        if (validEntries.length === 0) {
          throw new Error('No valid entries to draw from');
        }

        // 4. Generate Snapshot Hash (Auditability)
        const entriesString = JSON.stringify(validEntries.map((e) => e.id));
        const snapshotHash = crypto.createHash('sha256').update(entriesString).digest('hex');

        // 5. Generate secure random index
        // crypto.randomInt is cryptographically secure and avoids modulo bias
        const randomIndex = crypto.randomInt(0, validEntries.length);
        const winningEntry = validEntries[randomIndex];
        
        // randomSeed here represents the chosen index for basic auditing. 
        // In a true regulated environment, you'd integrate a VRF (Verifiable Random Function) here.
        const randomSeed = `index:${randomIndex}_count:${validEntries.length}`;

        // 6. Record the Draw
        const draw = await tx.draw.upsert({
          where: { campaignId },
          create: {
            campaignId,
            snapshotHash,
            randomSeed,
            winningEntryId: winningEntry.id,
            status: 'COMPLETED',
            completedAt: new Date(),
          },
          update: {
            snapshotHash,
            randomSeed,
            winningEntryId: winningEntry.id,
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // 7. Complete the Campaign
        await tx.campaign.update({
          where: { id: campaignId },
          data: { status: 'COMPLETED' },
        });

        return { draw, winningEntry };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }
}
