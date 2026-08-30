import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const campaigns = await db.campaign.findMany({
      where: {
        status: {
          notIn: ["DRAFT", "CANCELLED"],
        },
      },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
        prizes: true,
        draw: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const enriched = await Promise.all(
      campaigns.map(async (c) => {
        const [validEntries, pendingPayments] = await Promise.all([
          db.entry.findMany({
            where: {
              campaignId: c.id,
              status: "VALID",
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
            orderBy: {
              entryNumber: "asc",
            },
          }),
          db.payment.count({
            where: {
              status: "PENDING",
              adminNote: {
                contains: c.id,
              },
            },
          }),
        ]);

        const prefix = c.id.substring(0, 4).toUpperCase();
        const mappedEntries = validEntries.map((e) => ({
          id: e.id,
          entryNumber: e.entryNumber,
          ticketNumber: `TKT-${prefix}-${e.entryNumber}`,
          userId: e.userId,
          userName: e.user.name || `User ${e.userId.slice(-4)}`,
          userEmail: e.user.email || "",
          userPhone: e.user.phone || "",
        }));

        const isCompleted = c.status === "COMPLETED" || !!c.draw?.winningEntryId;
        const isReady = mappedEntries.length > 0 && pendingPayments === 0 && !isCompleted;

        return {
          id: c.id,
          title: c.title,
          slug: c.slug,
          entryPrice: c.entryPrice,
          currency: c.currency || "ETB",
          maxEntries: c.maxEntries,
          endsAt: c.endsAt,
          status: c.status,
          imageUrl: c.imageUrl,
          prizes: c.prizes,
          validEntriesCount: mappedEntries.length,
          pendingPaymentsCount: pendingPayments,
          isCompleted,
          isReady,
          entries: mappedEntries,
          existingDraw: c.draw,
        };
      })
    );

    return NextResponse.json(
      { success: true, campaigns: enriched },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("[GET /api/admin/draws/ready error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to load draw data" },
      { status: 500 }
    );
  }
}
