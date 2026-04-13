import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

async function sendMessage(botToken: string, chatId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // Fetch bot token
    const botTokenSetting = await db.setting.findUnique({
      where: { key: "telegram_bot_token" },
    });

    if (!botTokenSetting?.value) {
      return NextResponse.json({ ok: true });
    }

    const botToken = botTokenSetting.value;

    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const linkToken = parts.length > 1 ? parts[1] : null;

      if (linkToken) {
        // Find user by token
        const user = await db.user.findFirst({
          where: {
            telegramLinkToken: linkToken,
            telegramLinkExpires: { gt: new Date() },
          },
        });

        if (user) {
          // Link the account
          await db.user.update({
            where: { id: user.id },
            data: {
              telegramId: String(chatId),
              telegramLinkToken: null,
              telegramLinkExpires: null,
            },
          });

          await sendMessage(
            botToken,
            chatId,
            `<b>Account Linked Successfully!</b>\n\nWelcome ${user.name}. You will now receive order updates and OTPs via this bot.`
          );
          return NextResponse.json({ ok: true });
        } else {
          await sendMessage(
            botToken,
            chatId,
            "<b>Invalid or Expired Link</b>\n\nPlease generate a new link from your account settings."
          );
          return NextResponse.json({ ok: true });
        }
      }

      await sendMessage(
        botToken,
        chatId,
        "<b>Welcome to MilkyTech.Online!</b>\n\nWe provide premium tech services including subscriptions, social media campaigns, and custom development.\n\nType /services to see what we offer or visit our website to get started."
      );
    } else if (text === "/services") {
      const services = await db.service.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { sortOrder: "asc" },
      });

      if (services.length === 0) {
        await sendMessage(botToken, chatId, "No services available at the moment.");
      } else {
        const serviceList = services
          .map((s) => `• <b>${s.title}</b>\n  ${s.shortDescription}`)
          .join("\n\n");
        
        const siteUrlSetting = await db.setting.findUnique({ where: { key: "site_url" } });
        const siteUrl = siteUrlSetting?.value || process.env.NEXTAUTH_URL || "";

        await sendMessage(
          botToken,
          chatId,
          `<b>Our Services:</b>\n\n${serviceList}`,
          {
            inline_keyboard: [
              [{ text: "🌐 Visit Website", url: siteUrl }],
              [{ text: "🛍️ Browse Services", url: `${siteUrl}/services` }],
            ],
          }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
