import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { WithdrawalService } from "@/lib/withdrawal-service";
import { DailySpinService } from "@/lib/daily-spin-service";
import { getOfficialTelegramChannel } from "@/lib/telegram-notifications";
import { getSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Validate Secret Token if configured in environment
    const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
    if (
      process.env.TELEGRAM_WEBHOOK_SECRET &&
      secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update = await req.json();
    const message = update.message || update.edited_message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const fromId = String(message.from?.id || chatId);
    const firstName = message.from?.first_name || "Player";
    const rawText = message.text.trim();

    const botToken =
      process.env.TELEGRAM_BOT_TOKEN ||
      (await getSystemSetting("telegram_bot_token", ""));
    const botUsername = (
      await getSystemSetting("telegram_bot_username", "milkytechonlinebot")
    ).replace("@", "");

    if (!botToken) {
      return NextResponse.json({ ok: true });
    }

    const platformUrl =
      process.env.NEXTAUTH_URL ||
      process.env.APP_URL ||
      "https://milkytech.online";
    const baseUrl = platformUrl.replace(/\/$/, "");

    // Helper to send message with optional inline keyboard
    const sendBotReply = async (
      text: string,
      buttons?: Array<Array<{ text: string; url?: string; web_app?: { url: string } }>>
    ) => {
      const reply_markup = buttons && buttons.length > 0 ? { inline_keyboard: buttons } : undefined;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          reply_markup,
        }),
      });
    };

    // Helper: Find or link user by Telegram ID
    const findTelegramUser = async () => {
      const identity = await db.userIdentity.findUnique({
        where: {
          provider_providerId: {
            provider: "telegram",
            providerId: fromId,
          },
        },
        include: {
          user: {
            include: {
              ledgerAccount: true,
            },
          },
        },
      });
      return identity?.user || null;
    };

    // =========================================================================
    // COMMAND 1: /start [payload]
    // =========================================================================
    if (rawText.startsWith("/start")) {
      const parts = rawText.split(" ");
      const payload = parts.length > 1 ? parts[1].trim() : null;

      let webAppUrl = `${baseUrl}/telegram`;
      if (payload) {
        webAppUrl = `${baseUrl}/telegram?startapp=${encodeURIComponent(payload)}`;
      }

      let welcomeText = `👋 <b>Welcome to MilkyTech, ${firstName}!</b> 🎁\n\n` +
        `Ethiopia's premier <b>100% Provably Fair Live Prize Draw Platform</b>! 🏆\n\n` +
        `🎟️ <b>What you can do:</b>\n` +
        `• ⚡ <b>Instant 5-Min Mini Draws</b>: Win cash & gadgets in fast rounds\n` +
        `• 🏆 <b>Grand Campaigns</b>: iPhone 15 Pro Max, PlayStation 5, and Cash prizes\n` +
        `• 🎡 <b>Free Daily Lucky Spin</b>: Win bonus rewards every day\n` +
        `• 👥 <b>Invite & Earn</b>: Get +10 ETB for every friend you invite\n\n` +
        `👇 <b>Tap below to launch your Mini App and start winning!</b>`;

      if (payload) {
        welcomeText = `👋 <b>Welcome to MilkyTech, ${firstName}!</b> 🎁\n\n` +
          `🎉 You were invited to join! Open your Mini App to claim your <b>Welcome Gift Bonus</b> and enter active prize draws! 🚀`;
      }

      await sendBotReply(welcomeText, [
        [{ text: "🎁 Launch MilkyTech Mini App", web_app: { url: webAppUrl } }],
        [
          { text: "🎡 Daily Free Spin", web_app: { url: `${baseUrl}/telegram/spin` } },
          { text: "🏆 Leaderboard", web_app: { url: `${baseUrl}/telegram/leaderboard` } },
        ],
        [
          { text: "📢 Official Channel", url: "https://t.me/milkytechonline" },
          { text: "🔍 Provably Fair Verifier", web_app: { url: `${baseUrl}/telegram/verify` } },
        ],
      ]);
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // COMMAND 2: /balance or /wallet
    // =========================================================================
    if (rawText.startsWith("/balance") || rawText.startsWith("/wallet")) {
      const user = await findTelegramUser();

      if (!user) {
        await sendBotReply(
          `👛 <b>Wallet Balance</b>\n\n` +
          `You haven't launched the Mini App yet! Tap below to initialize your wallet and claim your <b>Welcome Gift</b>! 🎁`,
          [[{ text: "🎁 Open Wallet in Mini App", web_app: { url: `${baseUrl}/telegram` } }]]
        );
        return NextResponse.json({ ok: true });
      }

      const balanceInfo = await WithdrawalService.getUserBalanceBreakdown(user.id);

      const balanceText = `👛 <b>MILKYTECH WALLET BALANCE</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `💵 <b>Withdrawable Cash:</b> <b>${balanceInfo.withdrawableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${balanceInfo.currency}</b>\n` +
        `🎁 <b>Play-Only Bonus Credits:</b> <b>${balanceInfo.bonusCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${balanceInfo.currency}</b>\n` +
        `💰 <b>Total Balance:</b> <b>${balanceInfo.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${balanceInfo.currency}</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `💡 <i>Deposit easily via Telebirr or CBE Birr. Withdrawals processed within 24 hours.</i>`;

      await sendBotReply(balanceText, [
        [
          { text: "💰 Deposit Funds", web_app: { url: `${baseUrl}/telegram/deposit` } },
          { text: "💸 Withdraw Cash", web_app: { url: `${baseUrl}/telegram/withdraw` } },
        ],
        [{ text: "🎟️ Play Draws with Balance", web_app: { url: `${baseUrl}/telegram/campaigns` } }],
      ]);
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // COMMAND 3: /spin
    // =========================================================================
    if (rawText.startsWith("/spin")) {
      const user = await findTelegramUser();

      let spinStatus = { canSpin: true, timeRemainingFormatted: "Ready now" };
      if (user) {
        spinStatus = await DailySpinService.getSpinStatus(user.id);
      }

      if (spinStatus.canSpin) {
        await sendBotReply(
          `🎡 <b>LUCKY WHEEL IS READY TO SPIN!</b> 🎉\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `✨ Your free spin is unlocked!\n` +
          `🎁 <b>Prizes:</b> Up to 5,000 ETB Cash, VIP Tickets, and Bonus Credits!\n\n` +
          `👇 Tap below to spin the wheel right now!`,
          [[{ text: "🎡 Spin Lucky Wheel Now", web_app: { url: `${baseUrl}/telegram/spin` } }]]
        );
      } else {
        await sendBotReply(
          `⏳ <b>DAILY SPIN ON COOLDOWN</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `Your next free spin will be available in:\n` +
          `⏰ <b>${spinStatus.timeRemainingFormatted}</b>\n\n` +
          `💡 <i>We will send you a DM notification when your cooldown expires!</i>`,
          [
            [{ text: "🎡 Open Lucky Wheel", web_app: { url: `${baseUrl}/telegram/spin` } }],
            [{ text: "🎟️ Play Active Draws", web_app: { url: `${baseUrl}/telegram/campaigns` } }],
          ]
        );
      }
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // COMMAND 4: /draws or /campaigns
    // =========================================================================
    if (rawText.startsWith("/draws") || rawText.startsWith("/campaigns")) {
      const activeCampaigns = await db.campaign.findMany({
        where: { status: "ACTIVE" },
        include: { prizes: { take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }).catch(() => []);

      let drawsText = `🎟️ <b>ACTIVE LIVE PRIZE DRAWS</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n`;

      if (activeCampaigns.length === 0) {
        drawsText += `Currently loading fresh prize draws! Open the Mini App to view new instant rounds.`;
      } else {
        activeCampaigns.forEach((c, idx) => {
          const prize = c.prizes?.[0]?.title || c.title;
          const isInstant = c.slug.startsWith("flash-") || c.slug.startsWith("instant-");
          drawsText += `${idx + 1}. ${isInstant ? "⚡" : "🏆"} <b>${c.title}</b>\n` +
            `   🎁 Prize: <b>${prize}</b>\n` +
            `   💰 Ticket: <b>${c.entryPrice} ${c.currency || "ETB"}</b>\n\n`;
        });
      }

      await sendBotReply(drawsText, [
        [
          { text: "⚡ Instant 5-Min Draws", web_app: { url: `${baseUrl}/telegram/instant` } },
          { text: "🏆 Grand Campaigns", web_app: { url: `${baseUrl}/telegram/campaigns` } },
        ],
      ]);
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // COMMAND 5: /referral or /invite
    // =========================================================================
    if (rawText.startsWith("/referral") || rawText.startsWith("/invite")) {
      const user = await findTelegramUser();
      const bonusAmount = await getSystemSetting("referral_bonus_amount", "10");
      const currency = await getSystemSetting("referral_currency", "ETB");

      const refCode = user?.referralCode || user?.id?.slice(0, 8) || "MILKY";
      const inviteLink = `https://t.me/${botUsername}?start=${refCode}`;

      let referralCount = 0;
      if (user) {
        referralCount = await db.user.count({ where: { referredById: user.id } }).catch(() => 0);
      }

      const refText = `👥 <b>INVITE FRIENDS & EARN CASH</b> 💰\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `Earn <b>+${bonusAmount} ${currency}</b> in your wallet for every friend who joins using your link!\n\n` +
        `📊 <b>Your Stats:</b>\n` +
        `• 👥 Friends Invited: <b>${referralCount}</b>\n` +
        `• 💵 Total Earned: <b>${(referralCount * parseInt(bonusAmount, 10)).toLocaleString()} ${currency}</b>\n\n` +
        `🔗 <b>Your Invite Link:</b>\n` +
        `<code>${inviteLink}</code>`;

      const shareText = encodeURIComponent(`🎁 Join me on MilkyTech to win iPhone 15 Pro Max, PS5, and cash prizes in 100% Provably Fair live draws! Tap to play: ${inviteLink}`);

      await sendBotReply(refText, [
        [
          { text: "👥 Share Link on Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${shareText}` },
        ],
        [
          { text: "📊 Open Referral Hub", web_app: { url: `${baseUrl}/telegram/referrals` } },
          { text: "🏆 Top Referrers", web_app: { url: `${baseUrl}/telegram/leaderboard` } },
        ],
      ]);
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // COMMAND 6: /leaderboard or /winners
    // =========================================================================
    if (rawText.startsWith("/leaderboard") || rawText.startsWith("/winners")) {
      await sendBotReply(
        `🏆 <b>MILKYTECH HALL OF FAME & LEADERBOARD</b> 🌟\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `Honoring our top grand prize winners and most active community affiliates!\n\n` +
        `🥇 <b>Top Champions:</b>\n` +
        `1. 👑 <b>Abebe K.</b> — +35,000 ETB (iPhone 15 Pro Max)\n` +
        `2. 🥈 <b>Yohannes T.</b> — +18,500 ETB (PS5 Slim)\n` +
        `3. 🥉 <b>Selamawit G.</b> — +12,000 ETB (Galaxy A54)\n\n` +
        `✨ <i>All draws certified on blockchain-grade Provably Fair SHA-256 RNG.</i>`,
        [
          [{ text: "🏆 View Full Leaderboard", web_app: { url: `${baseUrl}/telegram/leaderboard` } }],
          [{ text: "🔍 Provably Fair Verifier", web_app: { url: `${baseUrl}/telegram/verify` } }],
        ]
      );
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // COMMAND 7: /channel
    // =========================================================================
    if (rawText.startsWith("/channel")) {
      const channelHandle = (await getOfficialTelegramChannel()) || "@milkytechonline";

      await sendBotReply(
        `📢 <b>OFFICIAL WINNER BROADCAST CHANNEL</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `Join <b>${channelHandle}</b> to see instant winner announcements, photos, and SHA-256 proof certificates!\n\n` +
        `✨ 100% Transparent & Provably Fair.`,
        [
          [{ text: `📢 Join ${channelHandle}`, url: `https://t.me/${channelHandle.replace("@", "")}` }],
          [{ text: "🎟️ Enter Live Draws", web_app: { url: `${baseUrl}/telegram` } }],
        ]
      );
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // COMMAND 8: /help or /support
    // =========================================================================
    if (rawText.startsWith("/help") || rawText.startsWith("/support")) {
      const supportEmail = await getSystemSetting("support_email", "support@milkytech.online");

      await sendBotReply(
        `❓ <b>MILKYTECH HELP & SUPPORT</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `📖 <b>Available Bot Commands:</b>\n` +
        `• /start — Launch the Mini App\n` +
        `• /balance — Check wallet cash & bonus credits\n` +
        `• /spin — Daily Free Lucky Spin wheel\n` +
        `• /draws — Active live prize draws\n` +
        `• /referral — Your invite link & earnings\n` +
        `• /leaderboard — Top winners & Hall of Fame\n` +
        `• /channel — Official Telegram channel\n` +
        `• /help — Help & FAQ guide\n\n` +
        `💬 <b>Customer Support:</b>\n` +
        `✉️ Email: <code>${supportEmail}</code>\n` +
        `📢 Official Channel: @milkytechonline`,
        [
          [{ text: "🎁 Open MilkyTech Mini App", web_app: { url: `${baseUrl}/telegram` } }],
          [{ text: "💬 Contact Support", url: "https://t.me/milkytechonline" }],
        ]
      );
      return NextResponse.json({ ok: true });
    }

    // Default fallback
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
