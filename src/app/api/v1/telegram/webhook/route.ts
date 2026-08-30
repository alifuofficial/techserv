import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Validate Secret Token to ensure request comes from Telegram
    const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
    if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update = await req.json();

    // 2. Handle /start commands (including deep links)
    if (update.message?.text?.startsWith('/start')) {
      const parts = update.message.text.split(' ');
      const payload = parts.length > 1 ? parts[1] : null;

      const chatId = update.message.chat.id;
      let replyText = 'Welcome to the Prize Campaign Platform! 🎁\n\nTap the button below to browse active campaigns.';

      // Handle deep links like /start ref_123 or /start campaign_uuid
      if (payload) {
        if (payload.startsWith('ref_')) {
          // Track referral logic
          replyText = `Welcome! You were referred by ${payload.replace('ref_', '')}. 🎁\n\nTap below to enter!`;
        } else if (payload.startsWith('campaign_')) {
          replyText = `Welcome! Tap below to open the campaign. 🎁`;
        }
      }

      const webAppUrl = payload
        ? `https://milkytech.online/telegram?startapp=${encodeURIComponent(payload)}`
        : 'https://milkytech.online/telegram';

      // Send the reply
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyText,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🎁 Open MilkyTech Mini App',
                    web_app: { url: webAppUrl },
                  },
                ],
              ],
            },
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
