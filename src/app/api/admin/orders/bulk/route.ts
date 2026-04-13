import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No order IDs provided" }, { status: 400 });
    }

    // Delete all specified orders
    // Due to 'onDelete: Cascade' in Prisma schema, related invoices are also deleted.
    const result = await db.order.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${result.count} orders.`,
      count: result.count
    });
  } catch (error: unknown) {
    console.error("Bulk delete error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
