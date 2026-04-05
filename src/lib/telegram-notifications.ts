import { db } from "@/lib/db";

export async function sendTelegramNotification(userId: string, text: string) {
  try {
    const isNotificationsEnabled = await db.setting.findUnique({
      where: { key: "telegram_notifications" },
    });

    if (isNotificationsEnabled?.value !== "true") return;

    const botTokenSetting = await db.setting.findUnique({
      where: { key: "telegram_bot_token" },
    });

    if (!botTokenSetting?.value) return;

    const user = (await db.user.findUnique({
      where: { id: userId },
      select: { telegramId: true },
    })) as { telegramId: string | null } | null;

    if (!user || !user.telegramId) return;

    const url = `https://api.telegram.org/bot${botTokenSetting.value}/sendMessage`;
    
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: user.telegramId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Failed to send telegram notification:", error);
  }
}
