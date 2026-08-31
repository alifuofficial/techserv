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
 * Robustly resolves a referrer User from any format of startParam
 * (e.g. "MILKY-529247", "529247", "ref_5460529247", "5460529247", or user ID)
 */
async function resolveReferrerUser(rawStartParam: string) {
  const raw = rawStartParam.trim();
  if (!raw) return null;

  const cleanCode = raw.replace(/^MILKY-/i, "").replace(/^ref_/i, "").trim();

  return await db.user.findFirst({
    where: {
      OR: [
        { referralCode: raw },
        { referralCode: `MILKY-${cleanCode}` },
        { referralCode: { equals: raw, mode: "insensitive" } },
        { referralCode: { equals: `MILKY-${cleanCode}`, mode: "insensitive" } },
        { id: raw },
        { id: { startsWith: cleanCode } },
        {
          identities: {
            some: {
              provider: "telegram",
              OR: [
                { providerId: raw },
                { providerId: cleanCode },
                { providerId: { endsWith: cleanCode } },
              ],
            },
          },
        },
        { email: `telegram_${cleanCode}@milkytech.online` },
      ],
    },
    include: {
      ledgerAccount: true,
    },
  });
}

/**
 * Finds or creates a user from verified Telegram WebApp data.
 * Also handles referral linkage and ledger account initialization.
 */
export async function getOrCreateTelegramUser(initData: string, startParamOverride?: string) {
  const { isValid, user: telegramUser, startParam: initStartParam } = validateTelegramWebAppData(initData);
  if (!isValid || !telegramUser) {
    return null;
  }

  const telegramId = telegramUser.id.toString();
  const email = `telegram_${telegramId}@milkytech.online`;
  const effectiveStartParam = startParamOverride || initStartParam;

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
    let referrer: any = null;

    if (effectiveStartParam) {
      referrer = await resolveReferrerUser(effectiveStartParam);
      if (referrer && referrer.id !== telegramId) {
        referredById = referrer.id;
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

    // Process referral reward check if user was referred
    if (referredById && referrer) {
      try {
        const { checkAndUnlockReferralBonus } = await import("./referral-service");
        await checkAndUnlockReferralBonus(user.id, "IMMEDIATE");
      } catch (refErr) {
        console.error("[Referral Check Error]", refErr);
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
  } else {
    // 3. User exists: check retroactive referral linkage if currently unreferred
    if (!user.referredById && effectiveStartParam) {
      const referrer = await resolveReferrerUser(effectiveStartParam);
      if (referrer && referrer.id !== user.id) {
        try {
          await db.user.update({
            where: { id: user.id },
            data: { referredById: referrer.id },
          });
          user.referredById = referrer.id;

          const [bonusSetting, enabledSetting] = await Promise.all([
            db.systemSetting.findUnique({ where: { key: "referral_bonus_amount" } }),
            db.systemSetting.findUnique({ where: { key: "referral_enabled" } }),
          ]);

          const isEnabled = enabledSetting?.value !== "false";
          const bonusAmount = parseFloat(bonusSetting?.value || "10") || 10;

          if (isEnabled && bonusAmount > 0) {
            const referrerLedger = await db.ledgerAccount.upsert({
              where: { userId: referrer.id },
              create: { userId: referrer.id, balance: bonusAmount, currency: "ETB" },
              update: { balance: { increment: bonusAmount } },
            });

            await db.ledgerTransaction.create({
              data: {
                accountId: referrerLedger.id,
                amount: bonusAmount,
                referenceType: "REFERRAL_REWARD",
                referenceId: user.id,
                description: `Referral reward for inviting ${user.name || "friend"}`,
              },
            });

            const { sendEventNotification } = await import("./telegram-notifications");
            sendEventNotification("REFERRAL_REWARD", referrer.id, {
              user_name: referrer.name || "Member",
              referred_name: user.name || "Friend",
              reward_amount: bonusAmount,
              currency: "ETB",
              new_balance: referrerLedger.balance,
            }).catch(console.error);
          }
        } catch (linkErr) {
          console.error("[Retroactive Referral Link Error]", linkErr);
        }
      }
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
 * 1. Checks `x-telegram-init-data` header + `x-telegram-start-param` header
 * 2. Checks query strings `initData` and `startParam`
 * 3. Falls back to NextAuth getServerSession
 */
export async function getTelegramUserFromRequest(req: Request) {
  try {
    const url = new URL(req.url);

    // Extract start param from headers or query
    const startParamHeader = req.headers.get("x-telegram-start-param");
    const startParamQuery =
      url.searchParams.get("startParam") ||
      url.searchParams.get("startapp") ||
      url.searchParams.get("start_param") ||
      url.searchParams.get("ref");

    const effectiveStartParam = startParamHeader
      ? decodeURIComponent(startParamHeader)
      : startParamQuery || undefined;

    // 1. Check custom Telegram header
    const initDataHeader = req.headers.get("x-telegram-init-data");
    if (initDataHeader) {
      const user = await getOrCreateTelegramUser(initDataHeader, effectiveStartParam);
      if (user) return user;
    }

    // 2. Check URL query params
    const initDataQuery = url.searchParams.get("initData");
    if (initDataQuery) {
      const user = await getOrCreateTelegramUser(initDataQuery, effectiveStartParam);
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
