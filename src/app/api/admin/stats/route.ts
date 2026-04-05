import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { subDays, startOfDay, endOfDay, isWithinInterval, format } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Define periods
    const now = new Date();
    const sevenDaysAgo = subDays(startOfDay(now), 7);
    const fourteenDaysAgo = subDays(startOfDay(now), 14);

    // Run basic counts in parallel
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
      db.order.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
      db.user.count(),
    ]);

    // Fetch orders for trend calculations (last 14 days)
    const recentOrders = await db.order.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
      },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    // Fetch users for trend calculations (last 14 days)
    const recentUsers = await db.user.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
      },
      select: {
        createdAt: true,
      },
    });

    // Calculate Trend Data
    const current7DaysOrders = recentOrders.filter(o => o.createdAt >= sevenDaysAgo);
    const previous7DaysOrders = recentOrders.filter(o => o.createdAt < sevenDaysAgo);

    const current7DaysRevenue = current7DaysOrders
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.amount, 0);
    const previous7DaysRevenue = previous7DaysOrders
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.amount, 0);

    const current7DaysUsers = recentUsers.filter(u => u.createdAt >= sevenDaysAgo).length;
    const previous7DaysUsers = recentUsers.filter(u => u.createdAt < sevenDaysAgo).length;

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const trends = {
      revenue: calculateTrend(current7DaysRevenue, previous7DaysRevenue),
      orders: calculateTrend(current7DaysOrders.length, previous7DaysOrders.length),
      users: calculateTrend(current7DaysUsers, previous7DaysUsers),
    };

    // Generate daily revenue for the chart (last 7 days)
    const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayRevenue = current7DaysOrders
        .filter(o => o.status === "completed" && o.createdAt >= dayStart && o.createdAt <= dayEnd)
        .reduce((sum, o) => sum + o.amount, 0);

      return {
        date: format(date, "MMM d"),
        revenue: dayRevenue,
      };
    });

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      approvedOrders,
      completedOrders,
      rejectedOrders,
      totalRevenue: revenueResult._sum.amount || 0,
      totalUsers,
      trends,
      dailyRevenue,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
