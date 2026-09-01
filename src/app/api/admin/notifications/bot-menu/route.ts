import { NextResponse } from "next/server";
import { syncBotMenuAndCommands } from "@/lib/telegram-bot-menu";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await syncBotMenuAndCommands();
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to sync Telegram bot menu" },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "✅ Telegram Bot Menu Button ('🎁 Play MilkyTech') and slash commands successfully registered with Telegram!",
      ...result,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/notifications/bot-menu error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync bot menu" },
      { status: 500 }
    );
  }
}
