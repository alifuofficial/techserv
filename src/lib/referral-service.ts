import { db } from "@/lib/db";
import { getSystemSetting } from "@/modules/settings/settings-service";

export async function checkAndUnlockReferralBonus(
  userId: string,
  triggerType: "IMMEDIATE" | "DEPOSIT" | "PURCHASE",
  amount: number = 0
) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        referredBy: {
          include: {
            ledgerAccount: true,
            identities: true,
          },
        },
      },
    });

    if (!user || !user.referredById || !user.referredBy) {
      return { unlocked: false, reason: "No referrer" };
    }

    const referrer = user.referredBy;

    // Check if referral reward for this user has already been credited
    const existingReward = await db.ledgerTransaction.findFirst({
      where: {
        referenceType: "REFERRAL_REWARD",
        referenceId: user.id,
      },
    });

    if (existingReward) {
      return { unlocked: false, reason: "Referral reward already granted" };
    }

    // Read system settings
    const referralEnabled = (await getSystemSetting("referral_enabled", "true")) === "true";
    if (!referralEnabled) {
      return { unlocked: false, reason: "Referral program disabled" };
    }

    const unlockCondition = await getSystemSetting("referral_unlock_condition", "ON_FIRST_DEPOSIT");
    const minDepositReq = parseFloat(await getSystemSetting("referral_min_deposit_amount", "50")) || 50;
    const bonusAmount = parseFloat(await getSystemSetting("referral_bonus_amount", "10")) || 10;
    const currency = await getSystemSetting("referral_currency", "ETB");

    let shouldUnlock = false;

    if (unlockCondition === "IMMEDIATE" && triggerType === "IMMEDIATE") {
      shouldUnlock = true;
    } else if (unlockCondition === "ON_FIRST_DEPOSIT" && triggerType === "DEPOSIT") {
      shouldUnlock = true;
    } else if (unlockCondition === "ON_FIRST_PURCHASE" && triggerType === "PURCHASE") {
      shouldUnlock = true;
    } else if (unlockCondition === "MIN_DEPOSIT_AMOUNT" && triggerType === "DEPOSIT") {
      if (amount >= minDepositReq) {
        shouldUnlock = true;
      }
    }

    if (!shouldUnlock) {
      return { unlocked: false, reason: `Condition '${unlockCondition}' not satisfied by '${triggerType}'` };
    }

    // Execute atomic credit inside transaction
    await db.$transaction(async (tx) => {
      let referrerLedger = referrer.ledgerAccount;
      if (!referrerLedger) {
        referrerLedger = await tx.ledgerAccount.create({
          data: {
            userId: referrer.id,
            balance: 0,
            currency,
          },
        });
      }

      // 1. Credit Referrer Wallet
      await tx.ledgerAccount.update({
        where: { id: referrerLedger.id },
        data: {
          balance: { increment: bonusAmount },
        },
      });

      // 2. Record Ledger Audit Transaction
      await tx.ledgerTransaction.create({
        data: {
          accountId: referrerLedger.id,
          amount: bonusAmount,
          currency,
          referenceType: "REFERRAL_REWARD",
          referenceId: user.id,
          description: `Referral bonus unlocked for invited user (${user.name || user.email || "Friend"})`,
        },
      });
    });

    // Send Telegram Notification to Referrer if Telegram ID exists
    const tgIdentity = referrer.identities.find((i) => i.provider === "telegram");
    if (tgIdentity?.providerId) {
      const botToken = await getSystemSetting("telegram_bot_token", process.env.TELEGRAM_BOT_TOKEN || "");
      if (botToken) {
        const messageText = `🎉 *Referral Reward Unlocked\\!*\n\nYour invited friend *${(user.name || "A friend").replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&")}* just completed their ${
          triggerType === "DEPOSIT" ? "deposit" : "ticket order"
        }\\!\n\n💰 *+${bonusAmount} ${currency}* referral bonus has been credited to your wallet balance\\!`;

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: tgIdentity.providerId,
            text: messageText,
            parse_mode: "MarkdownV2",
          }),
        }).catch((err) => console.error("[Telegram Referral Notify Error]", err));
      }
    }

    console.log(`[Referral Unlocked] Credited +${bonusAmount} ${currency} to ${referrer.id} for user ${user.id}`);
    return { unlocked: true, bonusAmount };
  } catch (error) {
    console.error("[checkAndUnlockReferralBonus error]", error);
    return { unlocked: false, error };
  }
}
