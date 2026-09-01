import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { broadcastWinnerToChannel, getOfficialTelegramChannel, sendTelegramPhotoOrMessage } from "@/lib/telegram-notifications";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const channelHandle = await getOfficialTelegramChannel();

    // Dispatch a test winner certificate to the channel
    const success = await broadcastWinnerToChannel({
      campaignTitle: "iPhone 17 Pro Max Mega Draw",
      prizeTitle: "Apple iPhone 17 Pro Max 256GB",
      prizeValue: 200000,
      currency: "ETB",
      winnerName: "Abebe Kebede (@abebe_k)",
      ticketNumber: "TKT-IPHO-0142",
      snapshotHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      randomSeed: "NIST-BEACON-LIVE-SEED-99420-AUDITED",
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: `🎉 Test Winner Proof Certificate successfully posted to ${channelHandle}! Check your channel.`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to post to ${channelHandle}. Ensure the bot (@milkytechonlinebot) is added as an Administrator with 'Post Messages' permission in ${channelHandle}.`,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[POST /api/admin/notifications/channel-test error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to post to channel" }, { status: 500 });
  }
}
