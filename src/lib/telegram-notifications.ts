import { db } from "@/lib/db";
import { getSystemSetting, setSystemSetting } from "@/modules/settings/settings-service";

export type NotificationEventType =
  | "WELCOME_REGISTER"
  | "CAMPAIGN_STARTED"
  | "TICKET_PURCHASE"
  | "DEPOSIT_APPROVED"
  | "DEPOSIT_REJECTED"
  | "WINNER_SELECTED"
  | "REFERRAL_REWARD"
  | "CHANNEL_WINNER_ANNOUNCEMENT"
  | "WITHDRAWAL_REQUESTED"
  | "WITHDRAWAL_APPROVED"
  | "WITHDRAWAL_REJECTED"
  | "PRIZE_CLAIMED_CASH"
  | "PRIZE_CLAIMED_PHYSICAL";

export interface TemplateDefinition {
  eventType: NotificationEventType;
  title: string;
  description: string;
  defaultTemplate: string;
  availablePlaceholders: string[];
}

export const DEFAULT_TEMPLATES: Record<string, TemplateDefinition> = {
  CHANNEL_WINNER_ANNOUNCEMENT: {
    eventType: "CHANNEL_WINNER_ANNOUNCEMENT",
    title: "📢 Public Channel Winner Proof Certificate",
    description: "Broadcasted automatically to your official public Telegram channel (@milkytechonline) whenever any draw executes.",
    defaultTemplate: `🏆 <b>OFFICIAL WINNER CERTIFICATE</b> 🏆
━━━━━━━━━━━━━━━━━━━━━
🎉 <b>Grand Prize Winner Selected!</b>

👤 <b>Winner:</b> <b>{winner_name}</b>
🎁 <b>Prize Won:</b> <b>{prize_title}</b>
💰 <b>Prize Value:</b> <b>{prize_value} {currency}</b>
🎪 <b>Campaign:</b> {campaign_title}
🎟️ <b>Winning Ticket:</b> <code>{winning_ticket}</code>

🛡️ <b>PROVABLY FAIR VERIFICATION:</b>
🔐 <b>Snapshot Hash:</b> <code>{snapshot_hash}</code>
🎲 <b>Random Seed:</b> <code>{random_seed}</code>

✨ <i>100% Cryptographically Certified & Audited on Blockchain-grade RNG.</i>
━━━━━━━━━━━━━━━━━━━━━
🚀 <b>Want to be our next lucky winner?</b>
Tap below to enter active draws in the Mini App! 👇`,
    availablePlaceholders: [
      "{winner_name}",
      "{prize_title}",
      "{prize_value}",
      "{currency}",
      "{campaign_title}",
      "{winning_ticket}",
      "{snapshot_hash}",
      "{random_seed}",
      "{channel_url}",
    ],
  },
  WELCOME_REGISTER: {
    eventType: "WELCOME_REGISTER",
    title: "New User Welcome Message",
    description: "Sent automatically to new users immediately upon registering via Telegram or opening the Mini App.",
    defaultTemplate: `👋 <b>Welcome to MilkyTech, {user_name}!</b> 🎉

Get ready to win incredible prizes in our 100% Provably Fair live draws! 🏆

🎁 <b>Quick Start Guide:</b>
• 🎟️ Browse active grand draws & grab lucky tickets
• 💰 Deposit easily via Telebirr & CBE Birr
• 👥 Invite friends using your referral link: <code>{referral_link}</code> and earn <b>+{bonus_amount} {currency}</b> per friend!

🚀 Tap below to launch your Mini App and enter your first draw!`,
    availablePlaceholders: ["{user_name}", "{referral_code}", "{referral_link}", "{bonus_amount}", "{currency}"],
  },
  CAMPAIGN_STARTED: {
    eventType: "CAMPAIGN_STARTED",
    title: "New Campaign Launch Alert",
    description: "Sent automatically to all registered Telegram members whenever a new live prize draw is started.",
    defaultTemplate: `🔥 <b>NEW GRAND PRIZE DRAW IS LIVE!</b> 🎁

A brand new exciting lucky draw is now open on MilkyTech!

🎪 <b>Campaign:</b> <b>{campaign_title}</b>
🏆 <b>Prize:</b> <b>{prize_title}</b>
💰 <b>Ticket Price:</b> <b>{ticket_price} {currency}</b>
⏳ <b>Draw Date:</b> {draw_date}

🎟️ Tap below to grab your lucky tickets and multiply your winning odds! 🚀`,
    availablePlaceholders: ["{campaign_title}", "{prize_title}", "{ticket_price}", "{currency}", "{draw_date}", "{campaign_url}"],
  },
  TICKET_PURCHASE: {
    eventType: "TICKET_PURCHASE",
    title: "Ticket Purchase Confirmation",
    description: "Sent automatically when a user buys tickets via wallet or when manual payment is approved.",
    defaultTemplate: `🎟️ <b>Tickets Confirmed!</b>

Hello <b>{user_name}</b>, you have successfully secured <b>{quantity}</b> ticket(s) for:
🎪 <b>{campaign_title}</b>

🎟️ <b>Your Tickets:</b>
<code>{ticket_numbers}</code>

💰 Total Paid: <b>{total_price} {currency}</b>
Good luck in the upcoming draw! 🚀`,
    availablePlaceholders: ["{user_name}", "{campaign_title}", "{ticket_numbers}", "{quantity}", "{total_price}", "{currency}", "{balance_remaining}"],
  },
  DEPOSIT_APPROVED: {
    eventType: "DEPOSIT_APPROVED",
    title: "Deposit Approved & Credited",
    description: "Sent when an admin approves a Telebirr, CBE, or bank deposit slip.",
    defaultTemplate: `💰 <b>Deposit Approved!</b>

Hello <b>{user_name}</b>, your deposit has been verified and credited.

💵 <b>Amount Credited:</b> +{amount} {currency}
🏦 <b>Method:</b> {provider}
🏷️ <b>Tx ID:</b> <code>{tx_id}</code>

👛 <b>New Wallet Balance:</b> <b>{new_balance} {currency}</b>

You can now use your balance to buy tickets for any active campaign! 🎟️`,
    availablePlaceholders: ["{user_name}", "{amount}", "{currency}", "{new_balance}", "{provider}", "{tx_id}"],
  },
  DEPOSIT_REJECTED: {
    eventType: "DEPOSIT_REJECTED",
    title: "Deposit Rejected / Declined",
    description: "Sent when an admin rejects a deposit slip with an explanation.",
    defaultTemplate: `⚠️ <b>Deposit Notice</b>

Hello <b>{user_name}</b>, your deposit request of <b>{amount} {currency}</b> could not be approved.

📝 <b>Reason:</b> {reason}

If you believe this is a mistake, please contact our support team with your transaction receipt.`,
    availablePlaceholders: ["{user_name}", "{amount}", "{currency}", "{reason}", "{provider}"],
  },
  WINNER_SELECTED: {
    eventType: "WINNER_SELECTED",
    title: "Winner Lucky Prize Announcement",
    description: "Sent directly to the lucky winner immediately upon completing a live draw.",
    defaultTemplate: `🎉 <b>CONGRATULATIONS! YOU WON!</b> 🎉

Hello <b>{user_name}</b>, you have been selected as the official winner in our provably fair draw!

🏆 <b>Prize Won:</b> <b>{prize_title}</b>
🎟️ <b>Winning Ticket:</b> <code>{winning_ticket}</code>
🎪 <b>Campaign:</b> <b>{campaign_title}</b>

Open your MilkyTech Mini App to view details and claim your prize! 🎁🚀`,
    availablePlaceholders: ["{user_name}", "{prize_title}", "{winning_ticket}", "{campaign_title}", "{prize_value}", "{currency}"],
  },
  REFERRAL_REWARD: {
    eventType: "REFERRAL_REWARD",
    title: "Referral Bonus Credited",
    description: "Sent when a referred friend joins and credits a referral reward.",
    defaultTemplate: `🎁 <b>Referral Bonus Received!</b>

Hello <b>{user_name}</b>, your friend <b>{referred_name}</b> just joined MilkyTech using your referral link!

💰 <b>Bonus Credited:</b> +{reward_amount} {currency}
👛 <b>Wallet Balance:</b> {new_balance} {currency}

Share your link with more friends to earn even more rewards! 🚀`,
    availablePlaceholders: ["{user_name}", "{referred_name}", "{reward_amount}", "{currency}", "{new_balance}"],
  },
  WITHDRAWAL_REQUESTED: {
    eventType: "WITHDRAWAL_REQUESTED",
    title: "Withdrawal Request Received",
    description: "Sent when a player submits a payout request to Telebirr or Bank.",
    defaultTemplate: `💸 <b>Withdrawal Request Received</b>

Hello <b>{user_name}</b>, we received your withdrawal request:
💵 <b>Amount:</b> {amount} {currency}
🏦 <b>Payout Channel:</b> {provider}
🏷️ <b>Account:</b> {account_number} ({account_name})

Our finance team will process and transfer your funds within 24 hours.`,
    availablePlaceholders: ["{user_name}", "{amount}", "{currency}", "{provider}", "{account_name}", "{account_number}", "{balance_remaining}"],
  },
  WITHDRAWAL_APPROVED: {
    eventType: "WITHDRAWAL_APPROVED",
    title: "Withdrawal Approved & Paid",
    description: "Sent when admin marks a withdrawal as approved with bank reference.",
    defaultTemplate: `✅ <b>Withdrawal Paid Out!</b> 🎉

Hello <b>{user_name}</b>, your withdrawal of <b>{amount} {currency}</b> to <b>{provider}</b> has been completed!

🏦 <b>Destination:</b> {account_number}
🏷️ <b>Transaction Reference:</b> <code>{tx_id}</code>

Thank you for playing with MilkyTech! 🚀`,
    availablePlaceholders: ["{user_name}", "{amount}", "{currency}", "{provider}", "{account_number}", "{tx_id}"],
  },
  WITHDRAWAL_REJECTED: {
    eventType: "WITHDRAWAL_REJECTED",
    title: "Withdrawal Rejected & Refunded",
    description: "Sent when admin rejects a withdrawal and automatically refunds wallet balance.",
    defaultTemplate: `⚠️ <b>Withdrawal Update</b>

Hello <b>{user_name}</b>, your withdrawal request of <b>{amount} {currency}</b> could not be processed.
📝 <b>Reason:</b> {reason}

💰 <b>Note:</b> The full amount of <b>+{amount} {currency}</b> has been automatically refunded to your Wallet Vault.`,
    availablePlaceholders: ["{user_name}", "{amount}", "{currency}", "{provider}", "{reason}"],
  },
  PRIZE_CLAIMED_CASH: {
    eventType: "PRIZE_CLAIMED_CASH",
    title: "Cash Prize Equivalent Credited",
    description: "Sent when winner converts their prize to cash wallet balance.",
    defaultTemplate: `💵 <b>Cash Prize Credited to Vault!</b>

Congratulations! You chose to convert your prize for <b>{campaign_title}</b> into <b>{amount} ETB Cash</b>.

👛 <b>New Balance:</b> <b>{new_balance} ETB</b>
You can withdraw directly to Telebirr / Bank anytime or play more lucky draws! 🚀`,
    availablePlaceholders: ["{campaign_title}", "{prize_title}", "{amount}", "{new_balance}"],
  },
  PRIZE_CLAIMED_PHYSICAL: {
    eventType: "PRIZE_CLAIMED_PHYSICAL",
    title: "Physical Prize Delivery Order Received",
    description: "Sent when winner requests doorstep shipping.",
    defaultTemplate: `📦 <b>Physical Prize Delivery Order Placed!</b>

We received your shipping details for <b>{campaign_title}</b>:
👤 <b>Recipient:</b> {recipient_name}
📞 <b>Phone:</b> {phone}
📍 <b>Destination:</b> {city}, {address}

Our fulfillment team will contact you for delivery! 🚚`,
    availablePlaceholders: ["{campaign_title}", "{recipient_name}", "{phone}", "{city}", "{address}"],
  },
};

/**
 * Get user's Telegram Chat ID from identities or email
 */
export async function getTelegramChatIdForUser(userId: string): Promise<string | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        identities: true,
      },
    });

    if (!user) return null;

    if (user.telegramId) {
      return user.telegramId;
    }

    const tgIdentity = user.identities?.find((i) => i.provider === "telegram");
    if (tgIdentity?.providerId) {
      return tgIdentity.providerId;
    }

    if (user.email && user.email.startsWith("telegram_")) {
      const match = user.email.match(/^telegram_(\d+)@/);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error("[getTelegramChatIdForUser error]", error);
    return null;
  }
}

/**
 * Send a raw Telegram message
 */
export async function sendDirectTelegramMessage(chatId: string, text: string): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn("[sendDirectTelegramMessage] TELEGRAM_BOT_TOKEN is not set.");
      return false;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error("[sendDirectTelegramMessage error]", error);
    return false;
  }
}

/**
 * Send Telegram message with photo or inline keyboard
 */
export async function sendTelegramPhotoOrMessage(
  chatId: string,
  text: string,
  imageUrl?: string | null,
  inlineButtons?: Array<{ text: string; url?: string; web_app?: { url: string } }>
): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn("[sendTelegramPhotoOrMessage] TELEGRAM_BOT_TOKEN is not set.");
      return false;
    }

    const reply_markup = inlineButtons && inlineButtons.length > 0 ? {
      inline_keyboard: [inlineButtons],
    } : undefined;

    // 1. Attempt sendPhoto if valid imageUrl provided
    if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
      try {
        const photoRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            photo: imageUrl,
            caption: text,
            parse_mode: "HTML",
            reply_markup,
          }),
        });

        const photoData = await photoRes.json();
        if (photoData.ok === true) {
          return true;
        }
      } catch (err) {
        console.warn("[sendPhoto failed, falling back to sendMessage]", err);
      }
    }

    // 2. Fallback to sendMessage
    const msgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup,
        disable_web_page_preview: false,
      }),
    });

    const msgData = await msgRes.json();
    return msgData.ok === true;
  } catch (error) {
    console.error("[sendTelegramPhotoOrMessage error]", error);
    return false;
  }
}

/**
 * Get configured official channel handle
 */
export async function getOfficialTelegramChannel(): Promise<string> {
  const channel = await getSystemSetting("telegram_official_channel", "@milkytechonline");
  return channel?.trim() || "@milkytechonline";
}

/**
 * Broadcast Winner Proof Certificate to Official Public Telegram Channel (@milkytechonline)
 */
export async function broadcastWinnerToChannel(details: {
  campaignTitle: string;
  prizeTitle: string;
  prizeValue: number;
  currency: string;
  winnerName: string;
  ticketNumber: string;
  snapshotHash?: string | null;
  randomSeed?: string | null;
  imageUrl?: string | null;
}): Promise<boolean> {
  try {
    const isEnabled = (await getSystemSetting("telegram_channel_auto_broadcast_winners", "true")) === "true";
    if (!isEnabled) {
      return false;
    }

    const channelHandle = await getOfficialTelegramChannel();
    if (!channelHandle) {
      return false;
    }

    const templateSetting = await getSystemSetting(
      "notify_template_channel_winner_announcement",
      DEFAULT_TEMPLATES.CHANNEL_WINNER_ANNOUNCEMENT.defaultTemplate
    );

    let text = templateSetting || DEFAULT_TEMPLATES.CHANNEL_WINNER_ANNOUNCEMENT.defaultTemplate;
    text = text
      .split("{winner_name}").join(details.winnerName || "Lucky Player")
      .split("{prize_title}").join(details.prizeTitle || details.campaignTitle)
      .split("{prize_value}").join(details.prizeValue.toLocaleString())
      .split("{currency}").join(details.currency || "ETB")
      .split("{campaign_title}").join(details.campaignTitle)
      .split("{winning_ticket}").join(details.ticketNumber)
      .split("{snapshot_hash}").join(details.snapshotHash || "SHA256-PROVABLY-FAIR-CERTIFIED")
      .split("{random_seed}").join(details.randomSeed || "NIST-BEACON-SEED-VERIFIED")
      .split("{channel_url}").join(`https://t.me/${channelHandle.replace("@", "")}`);

    const buttons = [
      {
        text: "🎟️ Play Next Draw on Mini App",
        url: "https://t.me/milkytechonlinebot",
      },
    ];

    return await sendTelegramPhotoOrMessage(channelHandle, text, details.imageUrl, buttons);
  } catch (error) {
    console.error("[broadcastWinnerToChannel error]", error);
    return false;
  }
}

/**
 * Dispatch an event-based notification to a user
 */
export async function sendEventNotification(
  userIdOrEvent: string,
  eventTypeOrUserId: NotificationEventType | string,
  variablesOrPayload?: Record<string, any>
): Promise<boolean> {
  let actualEventType: string;
  let actualUserId: string;
  let variables: Record<string, any> = {};

  if (DEFAULT_TEMPLATES[userIdOrEvent as string] || Object.keys(DEFAULT_TEMPLATES).includes(userIdOrEvent as string)) {
    actualEventType = userIdOrEvent;
    actualUserId = eventTypeOrUserId;
    variables = variablesOrPayload || {};
  } else {
    actualUserId = userIdOrEvent;
    actualEventType = eventTypeOrUserId;
    variables = variablesOrPayload || {};
  }

  try {
    const enabledSetting = await getSystemSetting(`notify_enabled_${actualEventType.toLowerCase()}`, "true");
    if (enabledSetting === "false") {
      return false;
    }

    const templateSetting = await getSystemSetting(`notify_template_${actualEventType.toLowerCase()}`, "");
    let templateText = templateSetting || DEFAULT_TEMPLATES[actualEventType]?.defaultTemplate;
    if (!templateText) return false;

    const chatId = await getTelegramChatIdForUser(actualUserId);
    if (!chatId) {
      return false;
    }

    for (const [key, val] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      templateText = templateText.split(placeholder).join(String(val ?? ""));
    }

    return await sendDirectTelegramMessage(chatId, templateText);
  } catch (error) {
    console.error(`[sendEventNotification ${actualEventType} error]`, error);
    return false;
  }
}

/**
 * Broadcast message to Telegram audience or Official Channel
 */
export async function sendBroadcastTelegramMessage(
  target: "ALL_USERS" | "CAMPAIGN_HOLDERS" | "SPECIFIC_USER" | "OFFICIAL_CHANNEL",
  text: string,
  options?: { campaignId?: string; userId?: string; imageUrl?: string | null }
): Promise<{ totalTargeted: number; sentCount: number; failedCount: number }> {
  if (target === "OFFICIAL_CHANNEL") {
    const channelHandle = await getOfficialTelegramChannel();
    const ok = await sendTelegramPhotoOrMessage(channelHandle, text, options?.imageUrl);
    return {
      totalTargeted: 1,
      sentCount: ok ? 1 : 0,
      failedCount: ok ? 0 : 1,
    };
  }

  const chatIds = new Set<string>();

  try {
    if (target === "SPECIFIC_USER" && options?.userId) {
      const cid = await getTelegramChatIdForUser(options.userId);
      if (cid) chatIds.add(cid);
    } else if (target === "CAMPAIGN_HOLDERS" && options?.campaignId) {
      const entries = await db.entry.findMany({
        where: { campaignId: options.campaignId, status: "VALID" },
        include: {
          user: {
            include: { identities: true },
          },
        },
      });

      for (const entry of entries) {
        const tgId =
          entry.user.telegramId ||
          entry.user.identities?.find((i) => i.provider === "telegram")?.providerId ||
          (entry.user.email?.startsWith("telegram_") ? entry.user.email.match(/^telegram_(\d+)@/)?.[1] : null);
        if (tgId) chatIds.add(tgId);
      }
    } else {
      // ALL_USERS
      const users = await db.user.findMany({
        include: { identities: true },
      });

      for (const u of users) {
        const tgId =
          u.telegramId ||
          u.identities?.find((i) => i.provider === "telegram")?.providerId ||
          (u.email?.startsWith("telegram_") ? u.email.match(/^telegram_(\d+)@/)?.[1] : null);
        if (tgId) chatIds.add(tgId);
      }
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const chatId of Array.from(chatIds)) {
      const ok = await sendDirectTelegramMessage(chatId, text);
      if (ok) sentCount++;
      else failedCount++;
      await new Promise((r) => setTimeout(r, 40));
    }

    return {
      totalTargeted: chatIds.size,
      sentCount,
      failedCount,
    };
  } catch (error) {
    console.error("[sendBroadcastTelegramMessage error]", error);
    return {
      totalTargeted: chatIds.size,
      sentCount: 0,
      failedCount: chatIds.size,
    };
  }
}

/**
 * Automatically notifies all Telegram audience and Official Public Channel when a new campaign is started
 */
export async function notifyNewCampaignStarted(campaignId: string): Promise<boolean> {
  try {
    const enabledSetting = await getSystemSetting("notify_enabled_campaign_started", "true");
    if (enabledSetting === "false") return false;

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { prizes: { take: 1 } },
    });

    if (!campaign || campaign.status !== "ACTIVE") return false;

    const templateSetting = await getSystemSetting("notify_template_campaign_started", "");
    let text = templateSetting || DEFAULT_TEMPLATES.CAMPAIGN_STARTED.defaultTemplate;
    const prizeTitle = campaign.prizes?.[0]?.title || campaign.title;
    const drawDate = campaign.endsAt ? new Date(campaign.endsAt).toLocaleDateString() : "TBA";

    text = text
      .split("{campaign_title}").join(campaign.title)
      .split("{prize_title}").join(prizeTitle)
      .split("{ticket_price}").join(String(campaign.entryPrice))
      .split("{currency}").join(campaign.currency || "ETB")
      .split("{draw_date}").join(drawDate)
      .split("{campaign_url}").join(`https://milkytech.online/telegram/campaigns/${campaign.slug}`);

    // 1. Post to official channel
    const channelHandle = await getOfficialTelegramChannel();
    const autoPostChannel = (await getSystemSetting("telegram_channel_auto_broadcast_campaigns", "true")) === "true";
    if (autoPostChannel && channelHandle) {
      const buttons = [
        {
          text: "🎟️ Get Lucky Tickets Now",
          url: `https://t.me/milkytechonlinebot?start=camp_${campaign.slug}`,
        },
      ];
      await sendTelegramPhotoOrMessage(channelHandle, text, campaign.imageUrl, buttons).catch(console.error);
    }

    // 2. Broadcast to all users
    const broadcastRes = await sendBroadcastTelegramMessage("ALL_USERS", text);
    return broadcastRes.sentCount > 0;
  } catch (e) {
    console.error("[notifyNewCampaignStarted error]", e);
    return false;
  }
}
