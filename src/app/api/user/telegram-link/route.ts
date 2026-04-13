import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { crypto } from "@/lib/crypto"; // Assuming a crypto utility or using crypto.randomUUID()

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    // Generate a secure random token
    // Using a simpler token for easier URLs, but random enough
    const linkToken = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.user.update({
      where: { id: userId },
      data: {
        telegramLinkToken: linkToken,
        telegramLinkExpires: expires,
      },
    });

    const botUsernameSetting = await db.setting.findUnique({ where: { key: "telegram_bot_username" } });
    const botUsername = botUsernameSetting?.value?.replace("@", "") || "milkytechonlinebot";

    return NextResponse.json({ 
      token: linkToken,
      botUsername,
      deepLink: `https://t.me/${botUsername}?start=${linkToken}`
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
