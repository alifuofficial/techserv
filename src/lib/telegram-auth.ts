import * as crypto from "crypto";
import { db } from "./db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

/**
 * Validates the Telegram initData string using the bot token HMAC SHA256 algorithm.
 */
export function validateTelegramWebAppData(telegramInitData: string): { isValid: boolean; user?: any; startParam?: string } {
  try {
    if (!telegramInitData) {
      return { isValid: false };
    }

    const initData = new URLSearchParams(telegramInitData);
    const hash = initData.get("hash");

    if (!hash) {
      return { isValid: false };
    }

    initData.delete("hash");

    const keys = Array.from(initData.keys()).sort();
    const dataCheckString = keys.map((key) => `${key}=${initData.get(key)}`).join("\n");

    const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (calculatedHash === hash) {
      const userStr = initData.get("user");
      const startParam = initData.get("start_param") || undefined;
      return {
        isValid: true,
        user: userStr ? JSON.parse(userStr) : null,
        startParam,
      };
    }

    return { isValid: false };
  } catch (error) {
    console.error("[validateTelegramWebAppData error]", error);
    return { isValid: false };
  }
}

/**
 * Finds or creates a user from verified Telegram WebApp data.
 * Also handles referral linkage and ledger account initialization.
 */
export async function getOrCreateTelegramUser(initData: string) {
  const { isValid, user: telegramUser, startParam } = validateTelegramWebAppData(initData);
  if (!isValid || !telegramUser) {
    return null;
  }

  const telegramId = telegramUser.id.toString();
  const email = `telegram_${telegramId}@milkytech.online`;

  // 1. Look for existing user by email or by identity
  let user = await db.user.findFirst({
    where: {
      OR: [
        { email },
        {
          identities: {
            some: {
              provider: "telegram",
              providerId: telegramId,
            },
          },
        },
      ],
    },
    include: {
      ledgerAccount: true,
    },
  });

  // 2. If user doesn't exist, create user and handle referral
  if (!user) {
    let referredById: string | null = null;
    if (startParam) {
      const refCode = startParam.replace("MILKY-", "").replace("ref_", "").trim();
      if (refCode) {
        const referrer = await db.user.findFirst({
          where: {
            OR: [
              { referralCode: startParam },
              { referralCode: `MILKY-${refCode}` },
              { id: { startsWith: refCode } },
              {
                identities: {
                  some: {
                    provider: "telegram",
                    providerId: refCode,
                  },
                },
              },
            ],
          },
        });
        if (referrer) {
          referredById = referrer.id;
        }
      }
    }

    const fullName = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ") || `User ${telegramId}`;

    user = await db.user.create({
      data: {
        name: fullName,
        email,
        role: "USER",
        password: "",
        referredById,
        referralCode: `MILKY-${telegramId.slice(-6).toUpperCase()}`,
        identities: {
          create: {
            provider: "telegram",
            providerId: telegramId,
          },
        },
      },
      include: {
        ledgerAccount: true,
      },
    });

    // Create ledger account
    const ledger = await db.ledgerAccount.create({
      data: {
        userId: user.id,
        balance: 0,
        currency: "ETB",
      },
    });

    user.ledgerAccount = ledger;

    // Process referral reward if user was referred
    if (referredById) {
      try {
        const [bonusSetting, enabledSetting] = await Promise.all([
          db.systemSetting.findUnique({ where: { key: "referral_bonus_amount" } }),
          db.systemSetting.findUnique({ where: { key: "referral_enabled" } }),
        ]);

        const isEnabled = enabledSetting?.value !== "false";
        const bonusAmount = parseFloat(bonusSetting?.value || "10") || 10;

        if (isEnabled && bonusAmount > 0) {
          const referrerLedger = await db.ledgerAccount.upsert({
            where: { userId: referredById },
            create: { userId: referredById, balance: bonusAmount, currency: "ETB" },
            update: { balance: { increment: bonusAmount } },
          });

          await db.ledgerTransaction.create({
            data: {
              accountId: referrerLedger.id,
              amount: bonusAmount,
              referenceType: "REFERRAL_REWARD",
              referenceId: user.id,
              description: `Referral reward for inviting ${fullName}`,
            },
          });

          const referrerUser = await db.user.findUnique({ where: { id: referredById } });

          // Send automated Telegram notification to referrer
          const { sendEventNotification } = await import("./telegram-notifications");
          sendEventNotification("REFERRAL_REWARD", referredById, {
            user_name: referrerUser?.name || "Member",
            referred_name: fullName,
            reward_amount: bonusAmount,
            currency: "ETB",
            new_balance: referrerLedger.balance,
          }).catch(console.error);
        }
      } catch (refErr) {
        console.error("[Referral Reward Credit Error]", refErr);
      }
    }

    // Send Welcome Message to the newly registered user
    try {
      const { sendEventNotification } = await import("./telegram-notifications");
      const { getSystemSetting } = await import("@/modules/settings/settings-service");
      const botUsername = (await getSystemSetting("telegram_bot_username", "milkytechonlinebot")) || "milkytechonlinebot";
      const referralBonusSetting = await getSystemSetting("referral_bonus_amount", "10");
      const referralCurrencySetting = await getSystemSetting("referral_currency", "ETB");
      const referralLink = `https://t.me/${botUsername}?start=${user.referralCode || `MILKY-${telegramId.slice(-6).toUpperCase()}`}`;

      sendEventNotification("WELCOME_REGISTER", user.id, {
        user_name: fullName,
        referral_code: user.referralCode || `MILKY-${telegramId.slice(-6).toUpperCase()}`,
        referral_link: referralLink,
        bonus_amount: referralBonusSetting,
        currency: referralCurrencySetting,
      }).catch(console.error);
    } catch (welcomeErr) {
      console.error("[Welcome Notification Error]", welcomeErr);
    }
    // Ensure ledger account exists
    if (!user.ledgerAccount) {
      const ledger = await db.ledgerAccount.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          balance: 0,
          currency: "ETB",
        },
      });
      user.ledgerAccount = ledger;
    }

    // Ensure referralCode exists
    if (!user.referralCode) {
      await db.user.update({
        where: { id: user.id },
        data: {
          referralCode: `MILKY-${telegramId.slice(-6).toUpperCase()}`,
        },
      });
      user.referralCode = `MILKY-${telegramId.slice(-6).toUpperCase()}`;
    }
  }

  return user;
}

/**
 * Extracts and authenticates a user from an incoming HTTP Request:
 * 1. Checks `x-telegram-init-data` header
 * 2. Checks query string `initData`
 * 3. Falls back to NextAuth getServerSession
 */
export async function getTelegramUserFromRequest(req: Request) {
  try {
    // 1. Check custom Telegram header
    const initDataHeader = req.headers.get("x-telegram-init-data");
    if (initDataHeader) {
      const user = await getOrCreateTelegramUser(initDataHeader);
      if (user) return user;
    }

    // 2. Check URL query params
    const url = new URL(req.url);
    const initDataQuery = url.searchParams.get("initData");
    if (initDataQuery) {
      const user = await getOrCreateTelegramUser(initDataQuery);
      if (user) return user;
    }

    // 3. Fallback to NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const userId = (session.user as any)?.id;
      const email = session.user.email;

      if (userId) {
        const user = await db.user.findUnique({
          where: { id: userId },
          include: { ledgerAccount: true },
        });
        if (user) return user;
      }

      if (email) {
        const user = await db.user.findUnique({
          where: { email },
          include: { ledgerAccount: true },
        });
        if (user) return user;
      }
    }

    return null;
  } catch (error) {
    console.error("[getTelegramUserFromRequest error]", error);
    return null;
  }
}
