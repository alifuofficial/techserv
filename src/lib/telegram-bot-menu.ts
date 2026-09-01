import { getSystemSetting } from "@/modules/settings/settings-service";

export interface BotCommandItem {
  command: string;
  description: string;
}

export const OFFICIAL_BOT_COMMANDS: BotCommandItem[] = [
  { command: "start", description: "🎁 Launch MilkyTech Mini App" },
  { command: "balance", description: "👛 Check Wallet Balance & Cash" },
  { command: "spin", description: "🎡 Daily Free Lucky Spin Wheel" },
  { command: "draws", description: "🎟️ Browse Active Live Prize Draws" },
  { command: "referral", description: "👥 My Invite Link & Earnings" },
  { command: "leaderboard", description: "🏆 Top Winners & Hall of Fame" },
  { command: "channel", description: "📢 Official Telegram Channel" },
  { command: "help", description: "❓ How It Works & Support FAQ" },
];

/**
 * Configure persistent bot menu button and slash command autocompletes with Telegram Bot API
 */
export async function syncBotMenuAndCommands(): Promise<{
  success: boolean;
  commandsUpdated: boolean;
  menuButtonUpdated: boolean;
  error?: string;
}> {
  try {
    const botToken =
      process.env.TELEGRAM_BOT_TOKEN || (await getSystemSetting("telegram_bot_token", ""));

    if (!botToken) {
      return {
        success: false,
        commandsUpdated: false,
        menuButtonUpdated: false,
        error: "TELEGRAM_BOT_TOKEN is not configured.",
      };
    }

    const platformUrl =
      process.env.NEXTAUTH_URL ||
      process.env.APP_URL ||
      "https://milkytech.online";
    const webAppUrl = `${platformUrl.replace(/\/$/, "")}/telegram`;

    // 1. Register Slash Commands (setMyCommands)
    const commandsRes = await fetch(
      `https://api.telegram.org/bot${botToken}/setMyCommands`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commands: OFFICIAL_BOT_COMMANDS,
        }),
      }
    );
    const commandsData = await commandsRes.json();

    // 2. Register Persistent Menu Button (setChatMenuButton)
    const menuRes = await fetch(
      `https://api.telegram.org/bot${botToken}/setChatMenuButton`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menu_button: {
            type: "web_app",
            text: "🎁 Play MilkyTech",
            web_app: {
              url: webAppUrl,
            },
          },
        }),
      }
    );
    const menuData = await menuRes.json();

    return {
      success: commandsData.ok === true && menuData.ok === true,
      commandsUpdated: commandsData.ok === true,
      menuButtonUpdated: menuData.ok === true,
      error:
        commandsData.description ||
        menuData.description ||
        (commandsData.ok && menuData.ok ? undefined : "Failed to sync Telegram bot menu"),
    };
  } catch (error: any) {
    console.error("[syncBotMenuAndCommands error]", error);
    return {
      success: false,
      commandsUpdated: false,
      menuButtonUpdated: false,
      error: error.message || "Network error syncing Telegram Bot menu",
    };
  }
}
