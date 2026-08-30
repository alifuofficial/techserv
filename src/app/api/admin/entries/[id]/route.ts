import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["VALID", "REFUNDED", "VOID", "WINNER"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await db.entry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, entry: updated });
  } catch (error: any) {
    console.error("[ADMIN_ENTRY_PUT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await db.entry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Entry deleted" });
  } catch (error: any) {
    console.error("[ADMIN_ENTRY_DELETE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to delete entry" }, { status: 500 });
  }
}
