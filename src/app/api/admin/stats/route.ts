import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as string;

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Run all queries in parallel for efficiency
    const [
      totalOrders,
      pendingOrders,
      approvedOrders,
      completedOrders,
      rejectedOrders,
      revenueResult,
      totalUsers,
    ] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: "pending" } }),
      db.order.count({ where: { status: "approved" } }),
      db.order.count({ where: { status: "completed" } }),
      db.order.count({ where: { status: "rejected" } }),
      // Sum amounts for completed orders as revenue
      db.order.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
      db.user.count(),
    ]);

    const totalRevenue = revenueResult._sum.amount || 0;

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      approvedOrders,
      completedOrders,
      rejectedOrders,
      totalRevenue,
      totalUsers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
