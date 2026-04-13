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

async function answerInlineQuery(botToken: string, inlineQueryId: string, results: any[]) {
  const url = `https://api.telegram.org/bot${botToken}/answerInlineQuery`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inline_query_id: inlineQueryId,
      results: results,
      cache_time: 300, // 5 minutes cache
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, inline_query } = body;

    // Fetch bot token
    const botTokenSetting = await db.setting.findUnique({
      where: { key: "telegram_bot_token" },
    });

    if (!botTokenSetting?.value) {
      return NextResponse.json({ ok: true });
    }

    const botToken = botTokenSetting.value;

    // Handle Inline Queries
    if (inline_query) {
      const query = inline_query.query || "";
      const services = await db.service.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query } },
            { shortDescription: { contains: query } }
          ]
        },
        take: 20,
        orderBy: { sortOrder: "asc" },
      });

      const siteUrlSetting = await db.setting.findUnique({ where: { key: "site_url" } });
      const siteUrl = siteUrlSetting?.value || process.env.NEXTAUTH_URL || "https://milkytech.online";

      const results = services.map((s) => ({
        type: "article",
        id: s.id,
        title: s.title,
        input_message_content: {
          message_text: `<b>${s.title}</b>\n\n${s.shortDescription}`,
          parse_mode: "HTML",
        },
        reply_markup: {
          inline_keyboard: [
            [{ text: "🛍️ Order Now", web_app: { url: `${siteUrl}/services/${s.slug}` } }],
          ],
        },
        description: s.shortDescription,
        thumb_url: "https://milkytech.online/logo.png", // Fallback logo
      }));

      await answerInlineQuery(botToken, inline_query.id, results);
      return NextResponse.json({ ok: true });
    }

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

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
        take: 10,
        orderBy: { sortOrder: "asc" },
      });

      if (services.length === 0) {
        await sendMessage(botToken, chatId, "No services available at the moment.");
      } else {
        const siteUrlSetting = await db.setting.findUnique({ where: { key: "site_url" } });
        const siteUrl = siteUrlSetting?.value || process.env.NEXTAUTH_URL || "https://milkytech.online";

        // Create deep-link buttons for each service
        const keyboard = services.map((s) => [
          { text: `${s.title}`, web_app: { url: `${siteUrl}/services/${s.slug}` } }
        ]);

        // Add additional general buttons
        keyboard.push([{ text: "🌐 Open Website", web_app: { url: siteUrl } }]);

        await sendMessage(
          botToken,
          chatId,
          `<b>Our Premium Services:</b>\n\nChoose a service below to view details and place an order directly within Telegram.`,
          {
            inline_keyboard: keyboard,
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
