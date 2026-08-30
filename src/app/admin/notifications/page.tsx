import { db } from "@/lib/db";
import { DEFAULT_TEMPLATES, NotificationEventType } from "@/lib/telegram-notifications";
import NotificationsClient from "./notifications-client";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  let botInfo: any = null;

  if (botToken) {
    try {
      const botRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const botData = await botRes.json();
      if (botData.ok) {
        botInfo = botData.result;
      }
    } catch (e) {}
  }

  const [telegramIdentitiesCount, campaigns, settings] = await Promise.all([
    db.userIdentity.count({ where: { provider: "telegram" } }).catch(() => 0),
    db.campaign.findMany({
      where: { status: { notIn: ["DRAFT", "CANCELLED"] } },
      select: { id: true, title: true, maxEntries: true },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    db.systemSetting.findMany({
      where: { key: { startsWith: "notify_" } },
    }).catch(() => []),
  ]);

  const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

  const eventKeys = Object.keys(DEFAULT_TEMPLATES) as NotificationEventType[];
  const templates = eventKeys.map((key) => {
    const def = DEFAULT_TEMPLATES[key];
    const customText = settingsMap.get(`notify_template_${key.toLowerCase()}`);
    const enabledVal = settingsMap.get(`notify_enabled_${key.toLowerCase()}`);

    return {
      eventType: def.eventType,
      title: def.title,
      description: def.description,
      templateText: customText || def.defaultTemplate,
      defaultTemplate: def.defaultTemplate,
      enabled: enabledVal !== undefined ? enabledVal === "true" : true,
      availablePlaceholders: def.availablePlaceholders,
    };
  });

  const botData = {
    connected: !!botInfo,
    username: botInfo?.username || "milkytechonlinebot",
    firstName: botInfo?.first_name || "MilkyTech Bot",
    id: botInfo?.id || null,
    totalTelegramUsers: Math.max(telegramIdentitiesCount, 1),
  };

  return (
    <NotificationsClient
      initialBot={botData}
      initialTemplates={templates}
      campaigns={campaigns}
    />
  );
}
