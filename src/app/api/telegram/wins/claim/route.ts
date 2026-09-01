import { NextResponse } from "next/server";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";
import { PrizeClaimService } from "@/lib/prize-claim-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { drawId, claimType, deliveryDetails } = body;

    if (!drawId) {
      return NextResponse.json({ success: false, error: "Draw ID is required" }, { status: 400 });
    }

    if (claimType === "CASH") {
      const result = await PrizeClaimService.claimAsCash(user.id, drawId);
      return NextResponse.json({
        success: true,
        message: `🎉 Cash equivalent credited to your wallet! Your new balance is ${result.newBalance.toFixed(2)} ETB.`,
        ...result,
      });
    } else if (claimType === "PHYSICAL") {
      if (!deliveryDetails) {
        return NextResponse.json({ success: false, error: "Delivery details are required for physical prize." }, { status: 400 });
      }

      const result = await PrizeClaimService.claimAsPhysical(user.id, drawId, deliveryDetails);
      return NextResponse.json({
        success: true,
        message: "📦 Physical prize delivery order placed! Our team will contact you for shipment.",
        ...result,
      });
    } else {
      return NextResponse.json({ success: false, error: "Invalid claim type. Must be CASH or PHYSICAL." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[POST /api/telegram/wins/claim error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process prize claim" }, { status: 400 });
  }
}
