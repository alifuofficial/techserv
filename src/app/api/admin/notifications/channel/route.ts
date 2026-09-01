import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemSetting, setSystemSetting } from "@/modules/settings/settings-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const channelHandle = await getSystemSetting("telegram_official_channel", "@milkytechonline");
    const autoBroadcastWinners = (await getSystemSetting("telegram_channel_auto_broadcast_winners", "true")) === "true";
    const autoBroadcastCampaigns = (await getSystemSetting("telegram_channel_auto_broadcast_campaigns", "true")) === "true";

    return NextResponse.json({
      success: true,
      channelHandle,
      autoBroadcastWinners,
      autoBroadcastCampaigns,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/notifications/channel error]", error);
    return NextResponse.json({ error: "Failed to fetch channel settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { channelHandle, autoBroadcastWinners, autoBroadcastCampaigns } = body;

    if (channelHandle !== undefined) {
      await setSystemSetting("telegram_official_channel", channelHandle.trim());
    }

    if (autoBroadcastWinners !== undefined) {
      await setSystemSetting("telegram_channel_auto_broadcast_winners", autoBroadcastWinners ? "true" : "false");
    }

    if (autoBroadcastCampaigns !== undefined) {
      await setSystemSetting("telegram_channel_auto_broadcast_campaigns", autoBroadcastCampaigns ? "true" : "false");
    }

    return NextResponse.json({
      success: true,
      message: "Telegram channel settings updated successfully!",
    });
  } catch (error: any) {
    console.error("[POST /api/admin/notifications/channel error]", error);
    return NextResponse.json({ error: error.message || "Failed to update channel settings" }, { status: 500 });
  }
}
