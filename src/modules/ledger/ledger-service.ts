import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class LedgerService {
  /**
   * Ensure a ledger account exists for the user.
   */
  static async getOrCreateAccount(userId: string, tx: Prisma.TransactionClient = db) {
    let account = await tx.ledgerAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      account = await tx.ledgerAccount.create({
        data: { userId, balance: 0, currency: 'ETB' },
      });
    }
    return account;
  }

  /**
   * Record a financial transaction and update balance.
   * MUST be called within a Prisma transaction to ensure consistency.
   */
  static async recordTransaction(
    tx: Prisma.TransactionClient,
    data: {
      userId: string;
      amount: number; // Positive for credit, negative for debit
      referenceType: 'PAYMENT_DEPOSIT' | 'ENTRY_PURCHASE' | 'REFUND';
      referenceId: string;
      description?: string;
    }
  ) {
    const account = await this.getOrCreateAccount(data.userId, tx);

    // 1. Create immutable transaction record
    await tx.ledgerTransaction.create({
      data: {
        accountId: account.id,
        amount: data.amount,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        description: data.description,
      },
    });

    // 2. Update cached balance
    const updatedAccount = await tx.ledgerAccount.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: data.amount,
        },
      },
    });

    return updatedAccount;
  }
}
