import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTelegramUserFromRequest } from "@/lib/telegram-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getTelegramUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Self-healing: Check for any APPROVED payments with missing entries
    const approvedPaymentsWithNoEntries = await db.payment.findMany({
      where: {
        userId: user.id,
        status: "APPROVED",
        entries: { none: {} },
      },
    });

    for (const payment of approvedPaymentsWithNoEntries) {
      const note = payment.adminNote || "";
      let campaignId: string | null = null;
      let qty = 0;

      if (note.includes("CAMPAIGN_CHECKOUT:")) {
        const match = note.match(/CAMPAIGN_CHECKOUT:([^:|]+):(\d+)/);
        if (match) {
          campaignId = match[1];
          qty = parseInt(match[2], 10) || 1;
        }
      } else if (note.toLowerCase().includes("ticket")) {
        const qtyMatch = note.match(/(\d+)\s*ticket/i);
        qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        const activeCamp = await db.campaign.findFirst({
          where: { status: { notIn: ["DRAFT", "CANCELLED"] } },
          orderBy: { createdAt: "desc" },
        });
        if (activeCamp) campaignId = activeCamp.id;
      }

      if (campaignId && qty > 0) {
        const camp = await db.campaign.findUnique({ where: { id: campaignId } });
        if (camp) {
          const lastEntry = await db.entry.findFirst({
            where: { campaignId: camp.id },
            orderBy: { entryNumber: "desc" },
            select: { entryNumber: true },
          });

          let nextNumber = (lastEntry?.entryNumber || 0) + 1;

          for (let i = 0; i < qty; i++) {
            await db.entry.create({
              data: {
                campaignId: camp.id,
                userId: user.id,
                paymentId: payment.id,
                entryNumber: nextNumber++,
              },
            });
          }
        }
      }
    }

    const entries = await db.entry.findMany({
      where: { userId: user.id },
      include: {
        campaign: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const tickets = entries.map((entry) => {
      const prefix = entry.campaignId.substring(0, 4).toUpperCase();
      return {
        id: entry.id,
        entryNumber: entry.entryNumber,
        ticketNumber: `TKT-${prefix}-${entry.entryNumber}`,
        campaignId: entry.campaignId,
        campaignTitle: entry.campaign.title,
        campaignSlug: entry.campaign.slug,
        campaignImage: entry.campaign.imageUrl || null,
        campaignStatus: entry.campaign.status,
        entryPrice: entry.campaign.entryPrice,
        currency: entry.campaign.currency,
        drawDate: entry.campaign.endsAt,
        createdAt: entry.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error("[GET /api/telegram/tickets error]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
