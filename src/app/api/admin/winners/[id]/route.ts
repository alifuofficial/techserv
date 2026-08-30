import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { claimStatus } = body;

    if (!["CLAIMED", "PENDING", "FORFEITED"].includes(claimStatus)) {
      return NextResponse.json({ error: "Invalid claim status" }, { status: 400 });
    }

    // Try finding Draw by ID or winningEntryId
    const draw = await db.draw.findFirst({
      where: {
        OR: [
          { id },
          { winningEntryId: id },
        ],
      },
    });

    if (draw) {
      const updatedDraw = await db.draw.update({
        where: { id: draw.id },
        data: {
          status: claimStatus === "CLAIMED" ? "COMPLETED" : draw.status,
        },
      });

      if (draw.winningEntryId) {
        await db.entry.update({
          where: { id: draw.winningEntryId },
          data: {
            status: claimStatus === "FORFEITED" ? "VOID" : "WINNER",
          },
        });
      }

      return NextResponse.json({ success: true, draw: updatedDraw });
    }

    // Otherwise update entry directly
    const entry = await db.entry.findUnique({ where: { id } });
    if (entry) {
      await db.entry.update({
        where: { id },
        data: {
          status: claimStatus === "FORFEITED" ? "VOID" : "WINNER",
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Winner record not found" }, { status: 404 });
  } catch (error: any) {
    console.error("[ADMIN_WINNER_PUT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update winner" }, { status: 500 });
  }
}
