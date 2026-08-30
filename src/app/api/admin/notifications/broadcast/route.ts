import { NextResponse } from "next/server";
import { sendBroadcastTelegramMessage } from "@/lib/telegram-notifications";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { target, message, campaignId, userId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: "Broadcast message text cannot be empty" }, { status: 400 });
    }

    if (!["ALL_USERS", "CAMPAIGN_HOLDERS", "SPECIFIC_USER"].includes(target)) {
      return NextResponse.json({ success: false, error: "Invalid broadcast target" }, { status: 400 });
    }

    const result = await sendBroadcastTelegramMessage(target, message.trim(), { campaignId, userId });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/notifications/broadcast error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to broadcast message" }, { status: 500 });
  }
}
