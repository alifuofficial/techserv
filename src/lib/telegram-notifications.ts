import { db } from "@/lib/db";

export type NotificationEventType =
  | "WELCOME_REGISTER"
  | "CAMPAIGN_STARTED"
  | "TICKET_PURCHASE"
  | "DEPOSIT_APPROVED"
  | "DEPOSIT_REJECTED"
  | "WINNER_SELECTED"
  | "REFERRAL_REWARD";

export interface TemplateDefinition {
  eventType: NotificationEventType;
  title: string;
  description: string;
  defaultTemplate: string;
  availablePlaceholders: string[];
}

export const DEFAULT_TEMPLATES: Record<NotificationEventType, TemplateDefinition> = {
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
};

/**
 * Get user's Telegram Chat ID from identities, email or phone
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

    // 1. Check UserIdentity table
    const tgIdentity = user.identities?.find((i) => i.provider === "telegram");
    if (tgIdentity?.providerId) {
      return tgIdentity.providerId;
    }

    // 2. Check if email is formatted as telegram_<id>@milkytech.online
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
 * Dispatch an event-based notification to a user
 */
export async function sendEventNotification(
  eventType: NotificationEventType,
  userId: string,
  variables: Record<string, string | number>
): Promise<boolean> {
  try {
    // 1. Check if event notification is enabled
    const enabledSetting = await db.systemSetting.findUnique({
      where: { key: `notify_enabled_${eventType.toLowerCase()}` },
    });

    const isEnabled = enabledSetting ? enabledSetting.value === "true" : true; // default enabled
    if (!isEnabled) {
      return false;
    }

    // 2. Fetch custom template or fallback to default
    const templateSetting = await db.systemSetting.findUnique({
      where: { key: `notify_template_${eventType.toLowerCase()}` },
    });

    let templateText = templateSetting?.value || DEFAULT_TEMPLATES[eventType]?.defaultTemplate;
    if (!templateText) return false;

    // 3. Find User Telegram Chat ID
    const chatId = await getTelegramChatIdForUser(userId);
    if (!chatId) {
      return false;
    }

    // 4. Substitute placeholders
    for (const [key, val] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      templateText = templateText.split(placeholder).join(String(val ?? ""));
    }

    // 5. Send message
    return await sendDirectTelegramMessage(chatId, templateText);
  } catch (error) {
    console.error(`[sendEventNotification ${eventType} error]`, error);
    return false;
  }
}

/**
 * Automatically notifies all Telegram audience when a new campaign is started
 */
export async function notifyNewCampaignStarted(campaignId: string): Promise<boolean> {
  try {
    const enabledSetting = await db.systemSetting.findUnique({
      where: { key: "notify_enabled_campaign_started" },
    });
    const isEnabled = enabledSetting ? enabledSetting.value === "true" : true;
    if (!isEnabled) return false;

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { prizes: { take: 1 } },
    });

    if (!campaign || campaign.status !== "ACTIVE") return false;

    const templateSetting = await db.systemSetting.findUnique({
      where: { key: "notify_template_campaign_started" },
    });

    let text = templateSetting?.value || DEFAULT_TEMPLATES.CAMPAIGN_STARTED.defaultTemplate;
    const prizeTitle = campaign.prizes?.[0]?.title || campaign.title;
    const drawDate = campaign.endsAt ? new Date(campaign.endsAt).toLocaleDateString() : "TBA";

    text = text
      .split("{campaign_title}").join(campaign.title)
      .split("{prize_title}").join(prizeTitle)
      .split("{ticket_price}").join(String(campaign.entryPrice))
      .split("{currency}").join(campaign.currency || "ETB")
      .split("{draw_date}").join(drawDate)
      .split("{campaign_url}").join(`https://milkytech.online/telegram/campaigns/${campaign.slug}`);

    const broadcastRes = await sendBroadcastTelegramMessage("ALL_USERS", text);
    return broadcastRes.sentCount > 0;
  } catch (e) {
    console.error("[notifyNewCampaignStarted error]", e);
    return false;
  }
}

/**
 * Broadcast message to Telegram audience
 */
export async function sendBroadcastTelegramMessage(
  target: "ALL_USERS" | "CAMPAIGN_HOLDERS" | "SPECIFIC_USER",
  text: string,
  options?: { campaignId?: string; userId?: string }
): Promise<{ totalTargeted: number; sentCount: number; failedCount: number }> {
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
        const tgId = entry.user.identities?.find((i) => i.provider === "telegram")?.providerId ||
          (entry.user.email?.startsWith("telegram_") ? entry.user.email.match(/^telegram_(\d+)@/)?.[1] : null);
        if (tgId) chatIds.add(tgId);
      }
    } else {
      // ALL_USERS
      const users = await db.user.findMany({
        include: { identities: true },
      });

      for (const u of users) {
        const tgId = u.identities?.find((i) => i.provider === "telegram")?.providerId ||
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
      // Respect Telegram API rate limit (30 messages per second)
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
