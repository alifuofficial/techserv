import { db } from "./db";
import { getSystemSetting, setSystemSetting } from "@/modules/settings/settings-service";
import { sendEventNotification } from "./telegram-notifications";

export interface PhysicalDeliveryDetails {
  recipientName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
}

export interface PrizeClaimRecord {
  claimType: "CASH" | "PHYSICAL";
  amount?: number;
  deliveryDetails?: PhysicalDeliveryDetails;
  claimedAt: string;
  status: "COMPLETED" | "PENDING_DELIVERY" | "DELIVERED";
}

export class PrizeClaimService {
  /**
   * Get claim record for a draw/winner
   */
  static async getClaimDetails(drawId: string): Promise<PrizeClaimRecord | null> {
    try {
      const raw = await getSystemSetting(`prize_claim_${drawId}`, "");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  /**
   * Claim Prize as Cash Equivalent (credits wallet balance)
   */
  static async claimAsCash(userId: string, drawId: string) {
    return await db.$transaction(async (tx) => {
      // 1. Fetch draw, campaign, prizes, and winning entry
      const draw = await tx.draw.findUnique({
        where: { id: drawId },
        include: {
          campaign: {
            include: { prizes: true },
          },
        },
      });

      if (!draw) {
        throw new Error("Draw record not found.");
      }

      if (!draw.winningEntryId) {
        throw new Error("Winning entry not found for this draw.");
      }

      const winningEntry = await tx.entry.findUnique({
        where: { id: draw.winningEntryId },
        include: { user: true },
      });

      if (!winningEntry || winningEntry.userId !== userId) {
        throw new Error("You are not the certified winner of this draw.");
      }

      // Check if already claimed
      const existingClaim = await PrizeClaimService.getClaimDetails(drawId);
      if (existingClaim) {
        throw new Error(`This prize has already been claimed as ${existingClaim.claimType}.`);
      }

      // Calculate cash value
      const prize = draw.campaign.prizes?.[0];
      const cashAmount = prize?.value || (draw.campaign.entryPrice * (draw.campaign.maxEntries || 100));

      // 2. Fetch or create ledger account
      let ledger = await tx.ledgerAccount.findUnique({
        where: { userId },
      });

      if (!ledger) {
        ledger = await tx.ledgerAccount.create({
          data: { userId, balance: 0, currency: "ETB" },
        });
      }

      // 3. Increment ledger balance
      const updatedLedger = await tx.ledgerAccount.update({
        where: { id: ledger.id },
        data: {
          balance: { increment: cashAmount },
        },
      });

      // 4. Record ledger transaction
      await tx.ledgerTransaction.create({
        data: {
          accountId: ledger.id,
          amount: cashAmount,
          referenceType: "PRIZE_CASH_EQUIVALENT",
          referenceId: draw.id,
          description: `Cash prize equivalent for winning "${draw.campaign.title}"`,
        },
      });

      // 5. Update draw & entry
      await tx.draw.update({
        where: { id: drawId },
        data: { status: "COMPLETED" },
      });

      // 6. Save claim choice
      const claimRecord: PrizeClaimRecord = {
        claimType: "CASH",
        amount: cashAmount,
        claimedAt: new Date().toISOString(),
        status: "COMPLETED",
      };
      await setSystemSetting(`prize_claim_${drawId}`, JSON.stringify(claimRecord));

      // 7. Notify via Telegram bot
      sendEventNotification(userId, "PRIZE_CLAIMED_CASH", {
        campaign_title: draw.campaign.title,
        prize_title: prize?.title || draw.campaign.title,
        amount: cashAmount,
        new_balance: updatedLedger.balance,
      }).catch(console.error);

      return {
        success: true,
        claim: claimRecord,
        newBalance: updatedLedger.balance,
      };
    });
  }

  /**
   * Claim Prize as Physical Material Delivery
   */
  static async claimAsPhysical(userId: string, drawId: string, details: PhysicalDeliveryDetails) {
    const { recipientName, phone, city, address } = details;

    if (!recipientName?.trim() || !phone?.trim() || !city?.trim() || !address?.trim()) {
      throw new Error("Recipient name, phone, city, and shipping address are all required.");
    }

    // 1. Fetch draw and winning entry
    const draw = await db.draw.findUnique({
      where: { id: drawId },
      include: {
        campaign: {
          include: { prizes: true },
        },
      },
    });

    if (!draw || !draw.winningEntryId) {
      throw new Error("Winning draw not found.");
    }

    const winningEntry = await db.entry.findUnique({
      where: { id: draw.winningEntryId },
    });

    if (!winningEntry || winningEntry.userId !== userId) {
      throw new Error("You are not the certified winner of this draw.");
    }

    // Check if already claimed
    const existingClaim = await PrizeClaimService.getClaimDetails(drawId);
    if (existingClaim) {
      throw new Error(`This prize has already been claimed as ${existingClaim.claimType}.`);
    }

    // 2. Save Physical Claim record
    const claimRecord: PrizeClaimRecord = {
      claimType: "PHYSICAL",
      deliveryDetails: {
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
        notes: details.notes?.trim() || "",
      },
      claimedAt: new Date().toISOString(),
      status: "PENDING_DELIVERY",
    };

    await setSystemSetting(`prize_claim_${drawId}`, JSON.stringify(claimRecord));

    await db.draw.update({
      where: { id: drawId },
      data: { status: "COMPLETED" },
    });

    // 3. Notify user via Telegram
    sendEventNotification(userId, "PRIZE_CLAIMED_PHYSICAL", {
      campaign_title: draw.campaign.title,
      recipient_name: recipientName,
      phone,
      city,
      address,
    }).catch(console.error);

    return {
      success: true,
      claim: claimRecord,
    };
  }

  /**
   * Admin: Update physical delivery status (e.g. DELIVERED)
   */
  static async updateFulfillmentStatus(drawId: string, status: "PENDING_DELIVERY" | "DELIVERED") {
    const existing = await PrizeClaimService.getClaimDetails(drawId);
    if (!existing) {
      throw new Error("Claim record not found.");
    }

    existing.status = status;
    await setSystemSetting(`prize_claim_${drawId}`, JSON.stringify(existing));
    return existing;
  }
}
