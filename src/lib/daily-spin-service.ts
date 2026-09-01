import { db } from "@/lib/db";
import { getSystemSetting, setSystemSetting } from "@/modules/settings/settings-service";
import * as crypto from "crypto";
import { Prisma } from "@prisma/client";
import { sendEventNotification } from "@/lib/telegram-notifications";

export interface SpinPrizeSlice {
  id: string;
  title: string;
  type: "BONUS_CREDIT" | "FREE_TICKET" | "DISCOUNT" | "NO_PRIZE";
  value: number; // In ETB (e.g. 1, 2, 5, 10)
  weight: number; // Probability weight percentage (e.g. 30 for 30%)
  color: string; // Hex color for the wheel slice
  icon?: string;
}

export const DEFAULT_SPIN_PRIZES: SpinPrizeSlice[] = [
  { id: "p1", title: "1 ETB Bonus", type: "BONUS_CREDIT", value: 1, weight: 35, color: "#10B981", icon: "coins" },
  { id: "p2", title: "2 ETB Bonus", type: "BONUS_CREDIT", value: 2, weight: 25, color: "#3B82F6", icon: "wallet" },
  { id: "p3", title: "5 ETB Bonus", type: "BONUS_CREDIT", value: 5, weight: 10, color: "#8B5CF6", icon: "sparkles" },
  { id: "p4", title: "Free Flash Ticket", type: "FREE_TICKET", value: 1, weight: 5, color: "#EC4899", icon: "ticket" },
  { id: "p5", title: "10% Ticket Voucher", type: "DISCOUNT", value: 10, weight: 5, color: "#F59E0B", icon: "percent" },
  { id: "p6", title: "Better Luck Tomorrow", type: "NO_PRIZE", value: 0, weight: 20, color: "#64748B", icon: "smile" },
];

export class DailySpinService {
  /**
   * Get all spin settings from database
   */
  static async getSettings() {
    const enabled = (await getSystemSetting("daily_spin_enabled", "true")) === "true";
    const cooldownHours = parseInt(await getSystemSetting("daily_spin_cooldown_hours", "24"), 10) || 24;
    const prizesRaw = await getSystemSetting("daily_spin_prizes", "");

    let prizes: SpinPrizeSlice[] = DEFAULT_SPIN_PRIZES;
    if (prizesRaw) {
      try {
        const parsed = JSON.parse(prizesRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          prizes = parsed;
        }
      } catch (e) {
        console.error("Failed to parse daily_spin_prizes JSON:", e);
      }
    }

    return { enabled, cooldownHours, prizes };
  }

  /**
   * Save spin settings
   */
  static async saveSettings(data: {
    enabled: boolean;
    cooldownHours: number;
    prizes: SpinPrizeSlice[];
  }) {
    await setSystemSetting("daily_spin_enabled", data.enabled ? "true" : "false");
    await setSystemSetting("daily_spin_cooldown_hours", Math.max(1, data.cooldownHours).toString());
    await setSystemSetting("daily_spin_prizes", JSON.stringify(data.prizes));
  }

  /**
   * Check user eligibility and cooldown
   */
  static async getUserEligibility(userId: string) {
    const { enabled, cooldownHours, prizes } = await this.getSettings();

    if (!enabled) {
      return {
        enabled: false,
        eligible: false,
        cooldownHours,
        nextSpinInSeconds: 0,
        lastSpinAt: null,
        prizes,
      };
    }

    // Query the latest spin transaction or setting timestamp
    const lastSpinTx = await db.ledgerTransaction.findFirst({
      where: {
        account: { userId },
        referenceType: "DAILY_SPIN_REWARD",
      },
      orderBy: { createdAt: "desc" },
    });

    // Also check zero-reward spin logs in settings
    const lastZeroSpinSetting = await getSystemSetting(`last_spin_${userId}`, "");
    const lastZeroSpinDate = lastZeroSpinSetting ? new Date(lastZeroSpinSetting) : null;

    let lastSpinTime: Date | null = null;
    if (lastSpinTx && lastZeroSpinDate) {
      lastSpinTime = lastSpinTx.createdAt > lastZeroSpinDate ? lastSpinTx.createdAt : lastZeroSpinDate;
    } else if (lastSpinTx) {
      lastSpinTime = lastSpinTx.createdAt;
    } else if (lastZeroSpinDate) {
      lastSpinTime = lastZeroSpinDate;
    }

    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    const now = Date.now();

    if (!lastSpinTime) {
      return {
        enabled: true,
        eligible: true,
        cooldownHours,
        nextSpinInSeconds: 0,
        lastSpinAt: null,
        prizes,
      };
    }

    const elapsedMs = now - lastSpinTime.getTime();
    if (elapsedMs >= cooldownMs) {
      return {
        enabled: true,
        eligible: true,
        cooldownHours,
        nextSpinInSeconds: 0,
        lastSpinAt: lastSpinTime.toISOString(),
        prizes,
      };
    }

    const remainingSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
    return {
      enabled: true,
      eligible: false,
      cooldownHours,
      nextSpinInSeconds: remainingSeconds,
      lastSpinAt: lastSpinTime.toISOString(),
      prizes,
    };
  }

  /**
   * Execute Lucky Spin with Provably Fair Weighted RNG
   */
  static async executeSpin(userId: string) {
    const eligibility = await this.getUserEligibility(userId);
    if (!eligibility.enabled) {
      throw new Error("Daily Lucky Spin is currently disabled.");
    }
    if (!eligibility.eligible) {
      const hours = Math.floor(eligibility.nextSpinInSeconds / 3600);
      const minutes = Math.floor((eligibility.nextSpinInSeconds % 3600) / 60);
      throw new Error(`You have already spun today. Next free spin in ${hours}h ${minutes}m.`);
    }

    const prizes = eligibility.prizes;
    if (!prizes || prizes.length === 0) {
      throw new Error("No prizes configured for Lucky Spin.");
    }

    // 1. Calculate total weight
    const totalWeight = prizes.reduce((acc, p) => acc + Math.max(0, p.weight), 0);
    if (totalWeight <= 0) {
      throw new Error("Invalid prize probability configuration.");
    }

    // 2. Cryptographically secure random pick
    const randomVal = crypto.randomInt(0, totalWeight);
    let cumulative = 0;
    let selectedIndex = 0;
    let selectedPrize: SpinPrizeSlice = prizes[0];

    for (let i = 0; i < prizes.length; i++) {
      cumulative += Math.max(0, prizes[i].weight);
      if (randomVal < cumulative) {
        selectedIndex = i;
        selectedPrize = prizes[i];
        break;
      }
    }

    const spinId = `SPIN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const now = new Date();

    // 3. Atomically Credit Ledger Account if Bonus Credits Won
    let newBalance = 0;
    if (selectedPrize.type === "BONUS_CREDIT" && selectedPrize.value > 0) {
      await db.$transaction(
        async (tx) => {
          let ledgerAccount = await tx.ledgerAccount.findUnique({
            where: { userId },
          });

          if (!ledgerAccount) {
            ledgerAccount = await tx.ledgerAccount.create({
              data: {
                userId,
                balance: 0,
                currency: "ETB",
              },
            });
          }

          // Credit balance
          const updated = await tx.ledgerAccount.update({
            where: { id: ledgerAccount.id },
            data: {
              balance: { increment: selectedPrize.value },
            },
          });

          // Create ledger transaction audit
          await tx.ledgerTransaction.create({
            data: {
              accountId: ledgerAccount.id,
              amount: selectedPrize.value,
              referenceType: "DAILY_SPIN_REWARD",
              referenceId: spinId,
              description: `Daily Lucky Spin Prize: ${selectedPrize.title}`,
            },
          });

          newBalance = updated.balance;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );
    } else {
      const acc = await db.ledgerAccount.findUnique({ where: { userId } });
      newBalance = acc?.balance || 0;
    }

    // 4. Save timestamp to track cooldown
    await setSystemSetting(`last_spin_${userId}`, now.toISOString());

    // 5. Send Telegram Bot Notification
    try {
      const user = await db.user.findUnique({ where: { id: userId }, include: { identities: true } });
      if (user && selectedPrize.value > 0) {
        sendEventNotification("BONUS_RECEIVED", userId, {
          user_name: user.name || `Player`,
          bonus_amount: selectedPrize.value,
          currency: "ETB",
          reason: `Daily Free Lucky Spin (${selectedPrize.title})`,
        }).catch(console.error);
      }
    } catch (e) {
      console.error("[Daily Spin Telegram Notify Error]", e);
    }

    return {
      success: true,
      spinId,
      prize: selectedPrize,
      sliceIndex: selectedIndex,
      newBalance,
      spunAt: now.toISOString(),
    };
  }

  /**
   * Get live stats & recent spin history for Admin
   */
  static async getAdminStatsAndHistory() {
    const settings = await this.getSettings();

    // Query recent spin ledger transactions
    const spinTransactions = await db.ledgerTransaction.findMany({
      where: { referenceType: "DAILY_SPIN_REWARD" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        account: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                identities: true,
              },
            },
          },
        },
      },
    });

    const totalBonusSum = await db.ledgerTransaction.aggregate({
      where: { referenceType: "DAILY_SPIN_REWARD" },
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalSpinsCount = totalBonusSum._count.id || 0;
    const totalBonusEtbGiven = totalBonusSum._sum.amount || 0;

    const formattedHistory = spinTransactions.map((tx) => {
      const tgIdentity = tx.account.user.identities.find((i) => i.provider === "telegram");
      return {
        id: tx.id,
        spinId: tx.referenceId,
        userName: tx.account.user.name || "Player",
        email: tx.account.user.email || "N/A",
        telegramId: tgIdentity?.providerId || "",
        amount: tx.amount,
        description: tx.description || "Daily Spin Reward",
        timestamp: tx.createdAt.toISOString(),
      };
    });

    return {
      settings,
      stats: {
        totalSpinsCount,
        totalBonusEtbGiven,
      },
      history: formattedHistory,
    };
  }
}
