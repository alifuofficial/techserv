import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { subDays, startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Define periods for MoM comparison
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);
    const startOfCurrentMonth = startOfMonth(now);
    const startOf7DaysAgo = subDays(now, 7);

    // Basic stats
    const [
      userData,
      totalOrders,
      pendingOrders,
      completedOrdersCount,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          tier: true,
          referralCode: true,
          telegramId: true,
          _count: {
            select: { referrals: true },
          },
        },
      }),
      db.order.count({ where: { userId } }),
      db.order.count({ where: { userId, status: "pending" } }),
      db.order.count({ where: { userId, status: { in: ["completed", "approved"] } } }),
      db.order.aggregate({
        where: { userId, status: { in: ["completed", "approved"] } },
        _sum: { amount: true },
      }),
      db.order.findMany({
        where: { userId, createdAt: { gte: sixtyDaysAgo } },
        select: { amount: true, createdAt: true, status: true },
      }),
    ]);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Trend Calculations (Month over Month)
    const current30DaysOrders = recentOrders.filter(o => o.createdAt >= thirtyDaysAgo);
    const previous30DaysOrders = recentOrders.filter(o => o.createdAt >= sixtyDaysAgo && o.createdAt < thirtyDaysAgo);

    const current30DaysSpent = current30DaysOrders
      .filter(o => ["completed", "approved"].includes(o.status))
      .reduce((sum, o) => sum + o.amount, 0);
    const previous30DaysSpent = previous30DaysOrders
      .filter(o => ["completed", "approved"].includes(o.status))
      .reduce((sum, o) => sum + o.amount, 0);

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const trends = {
      orders: current30DaysOrders.length,
      ordersGrowth: calculateTrend(current30DaysOrders.length, previous30DaysOrders.length),
      spendingGrowth: calculateTrend(current30DaysSpent, previous30DaysSpent),
      newActivity: current30DaysOrders.filter(o => o.createdAt >= startOf7DaysAgo).length,
    };

    // Tier Progress
    const tierRequirement = 10; // 10 orders for Gold
    const tierProgress = Math.min(Math.round((completedOrdersCount / tierRequirement) * 100), 100);

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      completedOrders: completedOrdersCount,
      totalSpent: revenueResult._sum.amount || 0,
      tier: userData.tier,
      tierProgress,
      nextTierRequirement: tierRequirement,
      referralCode: userData.referralCode,
      referralCount: userData._count.referrals,
      hasLinkedTelegram: !!userData.telegramId,
      trends,
    });
  } catch (error) {
    console.error("User Stats API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
