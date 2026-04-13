import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    // For security, if user doesn't exist, we still return a success message
    // but don't send an email. This prevents email enumeration.
    if (!user) {
      if (body.step === "check") {
        return NextResponse.json({ hasTelegram: false });
      }
      return NextResponse.json({ 
        success: true, 
        message: "If an account exists with this email, a reset code has been sent." 
      });
    }

    // Step 1: Check availability
    if (body.step === "check") {
      return NextResponse.json({ hasTelegram: !!user.telegramId });
    }

    // Check transport
    const transport = body.transport || "email";

    if (transport === "telegram" && !user.telegramId) {
      return NextResponse.json({ error: "No Telegram account linked to this email." }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store the token
    await (db as any).verificationToken.create({
      data: {
        email,
        token: otp,
        expires,
      },
    });

    // Send the code
    if (transport === "telegram" && user.telegramId) {
      const botTokenSetting = await db.setting.findUnique({ where: { key: "telegram_bot_token" } });
      if (botTokenSetting?.value) {
        const text = `<b>Security Verification</b>\n\nYour MilkyTech.Online password reset code is: <code>${otp}</code>\n\nThis code expires in 10 minutes. If you did not request this, please ignore this message.`;
        await fetch(`https://api.telegram.org/bot${botTokenSetting.value}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: user.telegramId, text, parse_mode: "HTML" }),
        });
      }
    } else {
      await sendPasswordResetEmail(email, otp);
    }

    return NextResponse.json({ 
      success: true, 
      message: transport === "telegram" 
        ? "A reset code has been sent to your Telegram bot." 
        : "If an account exists with this email, a reset code has been sent." 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
