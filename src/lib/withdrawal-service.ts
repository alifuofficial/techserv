import { db } from "./db";
import { sendEventNotification } from "./telegram-notifications";

export interface WithdrawalRequestInput {
  userId: string;
  amount: number;
  provider: "TELEBIRR" | "CBE" | "AWASH" | "BOA" | "OTHER";
  accountName: string;
  accountNumber: string;
}

export class WithdrawalService {
  /**
   * Calculate User's Total Balance, Non-Withdrawable Virtual Bonus Credits, and Withdrawable Cash
   */
  static async getUserBalanceBreakdown(userId: string, txClient: any = db) {
    try {
      const user = await txClient.user.findUnique({
        where: { id: userId },
        include: {
          ledgerAccount: {
            include: {
              transactions: true,
            },
          },
        },
      });

      if (!user || !user.ledgerAccount) {
        return {
          totalBalance: 0,
          withdrawableBalance: 0,
          bonusCredits: 0,
          currency: "ETB",
        };
      }

      const totalBalance = user.ledgerAccount.balance || 0;
      const transactions = user.ledgerAccount.transactions || [];

      // 1. Calculate all virtual bonus credits ever granted
      const VIRTUAL_BONUS_TYPES = [
        "DAILY_SPIN_REWARD",
        "REFERRAL_BONUS",
        "REFERRAL_UNLOCK",
        "SIGNUP_BONUS",
        "BONUS_RECEIVED",
      ];

      const totalBonusCredited = transactions
        .filter((t: any) => VIRTUAL_BONUS_TYPES.includes(t.referenceType) && t.amount > 0)
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      // 2. Calculate all gameplay spend (entries & tickets bought)
      const totalTicketSpend = transactions
        .filter((t: any) => t.referenceType === "ENTRY_PURCHASE" && t.amount < 0)
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

      // 3. Virtual bonus credits used up when playing games
      const bonusSpentOnGames = Math.min(totalBonusCredited, totalTicketSpend);

      // 4. Remaining unspent virtual bonus credits
      const unspentBonusCredits = Math.max(0, totalBonusCredited - bonusSpentOnGames);

      // 5. Withdrawable cash balance cannot exceed total balance minus unspent bonus credits
      const withdrawableBalance = Math.max(0, Math.min(totalBalance, totalBalance - unspentBonusCredits));

      return {
        totalBalance,
        withdrawableBalance,
        bonusCredits: unspentBonusCredits,
        currency: user.ledgerAccount.currency || "ETB",
      };
    } catch (e) {
      console.error("[getUserBalanceBreakdown error]", e);
      return {
        totalBalance: 0,
        withdrawableBalance: 0,
        bonusCredits: 0,
        currency: "ETB",
      };
    }
  }

  /**
   * Request a withdrawal from wallet balance (strictly limited to withdrawable cash balance)
   */
  static async requestWithdrawal(input: WithdrawalRequestInput) {
    const { userId, amount, provider, accountName, accountNumber } = input;

    if (!amount || amount < 100) {
      throw new Error("Minimum withdrawal amount is 100 ETB.");
    }

    if (!accountName?.trim() || !accountNumber?.trim()) {
      throw new Error("Account holder name and account number/phone are required.");
    }

    // Execute interactive transaction to verify withdrawable balance and reserve funds
    return await db.$transaction(async (tx) => {
      const balanceInfo = await WithdrawalService.getUserBalanceBreakdown(userId, tx);

      if (balanceInfo.withdrawableBalance < amount) {
        if (balanceInfo.bonusCredits > 0) {
          throw new Error(
            `Insufficient withdrawable balance. You have ${balanceInfo.withdrawableBalance.toFixed(
              2
            )} ETB withdrawable (${balanceInfo.bonusCredits.toFixed(
              2
            )} ETB is play-only bonus credit from Daily Spin / Referrals which must be used in draws to win real cash).`
          );
        } else {
          throw new Error(
            `Insufficient balance. You have ${balanceInfo.withdrawableBalance.toFixed(2)} ETB withdrawable, but requested ${amount} ETB.`
          );
        }
      }

      // 1. Fetch user & ledger account
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { ledgerAccount: true },
      });

      if (!user || !user.ledgerAccount) {
        throw new Error("User ledger not found.");
      }

      // 2. Deduct amount from ledger account
      const updatedLedger = await tx.ledgerAccount.update({
        where: { id: user.ledgerAccount.id },
        data: {
          balance: { decrement: amount },
        },
      });

      // 3. Create payment record representing withdrawal request
      const provKey = `WITHDRAW_${provider}`;
      const withdrawalPayment = await tx.payment.create({
        data: {
          userId,
          amount,
          currency: "ETB",
          provider: provKey,
          transactionId: `${accountNumber.trim()}_${Date.now()}`,
          status: "PENDING",
          adminNote: JSON.stringify({
            accountName: accountName.trim(),
            accountNumber: accountNumber.trim(),
            provider,
            requestedAt: new Date().toISOString(),
          }),
        },
      });

      // 4. Record ledger transaction
      await tx.ledgerTransaction.create({
        data: {
          accountId: user.ledgerAccount.id,
          amount: -amount,
          referenceType: "WITHDRAWAL_REQUEST",
          referenceId: withdrawalPayment.id,
          description: `Withdrawal request of ${amount} ETB to ${provider} (${accountNumber.trim()})`,
        },
      });

      // 5. Notify user on Telegram
      sendEventNotification(userId, "WITHDRAWAL_REQUESTED", {
        amount,
        currency: "ETB",
        provider,
        account_name: accountName,
        account_number: accountNumber,
        balance_remaining: updatedLedger.balance,
      }).catch(console.error);

      return {
        success: true,
        withdrawal: withdrawalPayment,
        newBalance: updatedLedger.balance,
        withdrawableBalance: Math.max(0, balanceInfo.withdrawableBalance - amount),
      };
    });
  }

  /**
   * List withdrawals with parsed metadata
   */
  static async listWithdrawals(status?: string) {
    try {
      const where: any = {
        provider: { startsWith: "WITHDRAW_" },
      };

      if (status && status !== "ALL") {
        where.status = status;
      }

      const payments = await db.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              telegramId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return (payments || []).map((p) => {
        let meta: any = {};
        try {
          if (p.adminNote?.startsWith("{")) {
            meta = JSON.parse(p.adminNote);
          }
        } catch (e) {}

        const cleanProvider = (p.provider || "").replace("WITHDRAW_", "");

        let createdAtStr = "";
        try {
          createdAtStr = p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString();
        } catch (e) {
          createdAtStr = new Date().toISOString();
        }

        let updatedAtStr = "";
        try {
          updatedAtStr = p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString();
        } catch (e) {
          updatedAtStr = new Date().toISOString();
        }

        return {
          id: p.id,
          userId: p.userId,
          userName: p.user?.name || "User",
          userEmail: p.user?.email || "",
          userPhone: p.user?.phone || "",
          telegramId: p.user?.telegramId || "",
          amount: p.amount || 0,
          currency: p.currency || "ETB",
          provider: cleanProvider || "TELEBIRR",
          accountName: meta.accountName || p.user?.name || "N/A",
          accountNumber: meta.accountNumber || p.transactionId?.split("_")[0] || "N/A",
          rejectionReason: meta.rejectionReason || (p.status === "REJECTED" ? p.adminNote : null),
          adminTxId: meta.adminTxId || (p.status === "APPROVED" ? p.transactionId : null),
          status: p.status || "PENDING",
          createdAt: createdAtStr,
          updatedAt: updatedAtStr,
        };
      });
    } catch (err) {
      console.error("[listWithdrawals error]", err);
      return [];
    }
  }

  /**
   * Get user's own withdrawal history
   */
  static async getUserWithdrawals(userId: string) {
    try {
      const payments = await db.payment.findMany({
        where: {
          userId,
          provider: { startsWith: "WITHDRAW_" },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return (payments || []).map((p) => {
        let meta: any = {};
        try {
          if (p.adminNote?.startsWith("{")) {
            meta = JSON.parse(p.adminNote);
          }
        } catch (e) {}

        const cleanProvider = (p.provider || "").replace("WITHDRAW_", "");

        let createdAtStr = "";
        try {
          createdAtStr = p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString();
        } catch (e) {
          createdAtStr = new Date().toISOString();
        }

        return {
          id: p.id,
          amount: p.amount || 0,
          currency: p.currency || "ETB",
          provider: cleanProvider || "TELEBIRR",
          accountNumber: meta.accountNumber || p.transactionId?.split("_")[0] || "N/A",
          accountName: meta.accountName || "N/A",
          status: p.status || "PENDING",
          createdAt: createdAtStr,
          adminTxId: meta.adminTxId || null,
          rejectionReason: meta.rejectionReason || (p.status === "REJECTED" ? p.adminNote : null),
        };
      });
    } catch (err) {
      console.error("[getUserWithdrawals error]", err);
      return [];
    }
  }

  /**
   * Approve a withdrawal request
   */
  static async approveWithdrawal(paymentId: string, adminTxId?: string, note?: string) {
    return await db.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { user: true },
      });

      if (!payment || !payment.provider.startsWith("WITHDRAW_")) {
        throw new Error("Withdrawal request not found.");
      }

      if (payment.status !== "PENDING") {
        throw new Error(`Withdrawal is already ${payment.status}.`);
      }

      let meta: any = {};
      try {
        if (payment.adminNote?.startsWith("{")) {
          meta = JSON.parse(payment.adminNote);
        }
      } catch (e) {}

      meta.adminTxId = adminTxId || `TXN-${Date.now()}`;
      meta.approvedAt = new Date().toISOString();
      if (note) meta.note = note;

      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "APPROVED",
          transactionId: meta.adminTxId,
          adminNote: JSON.stringify(meta),
        },
      });

      // Send telegram notification to user
      const cleanProvider = payment.provider.replace("WITHDRAW_", "");
      sendEventNotification(payment.userId, "WITHDRAWAL_APPROVED", {
        amount: payment.amount,
        currency: payment.currency,
        provider: cleanProvider,
        account_number: meta.accountNumber || "Your account",
        tx_id: meta.adminTxId,
      }).catch(console.error);

      return updated;
    });
  }

  /**
   * Reject a withdrawal request and atomically refund wallet balance
   */
  static async rejectWithdrawal(paymentId: string, rejectionReason: string) {
    if (!rejectionReason?.trim()) {
      throw new Error("Rejection reason is required.");
    }

    return await db.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          user: {
            include: { ledgerAccount: true },
          },
        },
      });

      if (!payment || !payment.provider.startsWith("WITHDRAW_")) {
        throw new Error("Withdrawal request not found.");
      }

      if (payment.status !== "PENDING") {
        throw new Error(`Withdrawal is already ${payment.status}.`);
      }

      let meta: any = {};
      try {
        if (payment.adminNote?.startsWith("{")) {
          meta = JSON.parse(payment.adminNote);
        }
      } catch (e) {}

      meta.rejectionReason = rejectionReason.trim();
      meta.rejectedAt = new Date().toISOString();

      // 1. Update payment status to REJECTED
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "REJECTED",
          adminNote: JSON.stringify(meta),
        },
      });

      // 2. Refund balance back to user's ledger account
      if (payment.user?.ledgerAccount) {
        await tx.ledgerAccount.update({
          where: { id: payment.user.ledgerAccount.id },
          data: {
            balance: { increment: payment.amount },
          },
        });

        // 3. Record refund transaction in ledger
        await tx.ledgerTransaction.create({
          data: {
            accountId: payment.user.ledgerAccount.id,
            amount: payment.amount,
            referenceType: "WITHDRAWAL_REFUND",
            referenceId: payment.id,
            description: `Refund for rejected withdrawal: ${rejectionReason.trim()}`,
          },
        });
      }

      // 4. Send telegram notification to user
      const cleanProvider = payment.provider.replace("WITHDRAW_", "");
      sendEventNotification(payment.userId, "WITHDRAWAL_REJECTED", {
        amount: payment.amount,
        currency: payment.currency,
        provider: cleanProvider,
        reason: rejectionReason.trim(),
      }).catch(console.error);

      return updated;
    });
  }

  /**
   * Get KPI stats for admin dashboard
   */
  static async getStats() {
    try {
      const withdrawals = await db.payment.findMany({
        where: { provider: { startsWith: "WITHDRAW_" } },
        select: { amount: true, status: true, createdAt: true },
      });

      const pending = withdrawals.filter((w) => w.status === "PENDING");
      const approved = withdrawals.filter((w) => w.status === "APPROVED");
      const rejected = withdrawals.filter((w) => w.status === "REJECTED");

      const totalPendingCount = pending.length;
      const totalPendingAmount = pending.reduce((acc, w) => acc + (w.amount || 0), 0);
      const totalApprovedCount = approved.length;
      const totalApprovedAmount = approved.reduce((acc, w) => acc + (w.amount || 0), 0);
      const totalRejectedCount = rejected.length;

      return {
        totalPendingCount,
        totalPendingAmount,
        totalApprovedCount,
        totalApprovedAmount,
        totalRejectedCount,
        totalCount: withdrawals.length,
      };
    } catch (err) {
      console.error("[getStats error]", err);
      return {
        totalPendingCount: 0,
        totalPendingAmount: 0,
        totalApprovedCount: 0,
        totalApprovedAmount: 0,
        totalRejectedCount: 0,
        totalCount: 0,
      };
    }
  }
}
