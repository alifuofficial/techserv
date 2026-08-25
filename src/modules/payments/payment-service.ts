import { db } from '@/lib/db';
import { LedgerService } from '@/modules/ledger/ledger-service';
import { EntryService } from '@/modules/entries/entry-service';
import { Prisma } from '@prisma/client';

export class PaymentService {
  /**
   * User submits an offline payment (e.g. Telebirr screenshot + TX ID)
   */
  static async submitOfflinePayment(data: {
    userId: string;
    campaignId: string; // The campaign they want to enter
    amount: number;
    provider: string; // e.g. 'MANUAL_TELEBIRR'
    transactionId: string;
    screenshotUrl: string;
  }) {
    // 1. Verify campaign is still active before accepting payment submission
    const campaign = await db.campaign.findUnique({ where: { id: data.campaignId } });
    if (!campaign || campaign.status !== 'ACTIVE') {
      throw new Error('Campaign is not active or sold out.');
    }

    // 2. Create the pending payment
    return db.payment.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        currency: campaign.currency,
        provider: data.provider,
        transactionId: data.transactionId,
        screenshotUrl: data.screenshotUrl,
        status: 'PENDING',
      },
    });
  }

  /**
   * Admin approves a pending offline payment.
   * This triggers: Ledger Deposit -> Ledger Purchase -> Entry Generation
   */
  static async approvePayment(paymentId: string, campaignId: string, adminNote?: string) {
    // We do this in a massive transaction to ensure financial consistency
    return await db.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment) throw new Error('Payment not found');
      if (payment.status !== 'PENDING') throw new Error('Payment already processed');

      // 1. Mark Payment Approved
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'APPROVED', adminNote },
      });

      // 2. Credit the Ledger (Deposit)
      await LedgerService.recordTransaction(tx, {
        userId: payment.userId,
        amount: payment.amount,
        referenceType: 'PAYMENT_DEPOSIT',
        referenceId: payment.id,
        description: `Deposit via ${payment.provider}`,
      });

      // 3. Attempt to issue the entry
      try {
        // We pass control to EntryService, but since we are already in a tx, 
        // we need a slightly different pattern. For simplicity in this offline flow, 
        // we'll duplicate the maxEntries check here to keep it within this same transaction.
        const campaign = await tx.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign || campaign.status !== 'ACTIVE') throw new Error('Sold out');
        
        const count = await tx.entry.count({ where: { campaignId, status: 'VALID' } });
        if (count >= campaign.maxEntries) throw new Error('Sold out');

        // Debit the Ledger (Purchase)
        await LedgerService.recordTransaction(tx, {
          userId: payment.userId,
          amount: -campaign.entryPrice,
          referenceType: 'ENTRY_PURCHASE',
          referenceId: payment.id, // Or generate an ID first
          description: `Entry purchase for ${campaign.slug}`,
        });

        // Create Entry
        const entry = await tx.entry.create({
          data: {
            campaignId,
            userId: payment.userId,
            paymentId: payment.id,
            entryNumber: count + 1,
            status: 'VALID',
          },
        });

        // Close if sold out
        if (count + 1 === campaign.maxEntries) {
          await tx.campaign.update({
            where: { id: campaignId },
            data: { status: 'CLOSED' },
          });
        }

        return entry;
      } catch (err: any) {
        // If the entry fails (e.g., sold out), the payment is still approved and the 
        // user's ledger keeps the positive balance. They can use it for another campaign.
        // We catch the error so the deposit doesn't rollback.
        console.error('Failed to issue entry after deposit:', err.message);
        return { message: 'Funds deposited, but campaign sold out before entry could be issued.' };
      }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  /**
   * Admin rejects a pending payment
   */
  static async rejectPayment(paymentId: string, adminNote?: string) {
    return db.payment.update({
      where: { id: paymentId },
      data: { status: 'REJECTED', adminNote },
    });
  }
}
