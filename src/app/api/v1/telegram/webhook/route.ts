import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Validate Secret Token if configured in environment
    const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
    if (process.env.TELEGRAM_WEBHOOK_SECRET && secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update = await req.json();

    // 2. Handle /start commands (including deep links)
    if (update.message?.text?.startsWith('/start')) {
      const text = update.message.text.trim();
      const parts = text.split(' ');
      const payload = parts.length > 1 ? parts[1].trim() : null;

      const chatId = update.message.chat.id;
      const firstName = update.message.from?.first_name || 'Player';
      
      let replyText = `👋 <b>Welcome to MilkyTech, ${firstName}!</b> 🎁\n\nTap the button below to launch the Mini App and enter our 100% Provably Fair live draws! 🏆`;

      if (payload) {
        replyText = `👋 <b>Welcome to MilkyTech, ${firstName}!</b> 🎁\n\nYou were invited to join! Tap below to launch your Mini App, claim your welcome rewards, and multiply your winning chances! 🚀`;
      }

      const webAppUrl = payload
        ? `https://milkytech.online/telegram?startapp=${encodeURIComponent(payload)}`
        : 'https://milkytech.online/telegram';

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyText,
            parse_mode: 'HTML',
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
