import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        referrals: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            _count: {
              select: { orders: true },
            },
            orders: {
              where: { status: { in: ["completed", "approved"] } },
              select: { amount: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { referrals: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      await db.user.update({
        where: { id: userId },
        data: { referralCode },
      });
    }

    const referrals = user.referrals.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      createdAt: r.createdAt.toISOString(),
      ordersCount: r._count.orders,
      totalSpent: r.orders.reduce((sum, o) => sum + o.amount, 0),
    }));

    return NextResponse.json({
      referralCode: referralCode,
      referralCount: user._count.referrals || 0,
      referrals,
    });
  } catch (error) {
    console.error("Referral API Error:", error);
    return NextResponse.json({ error: "Failed to fetch referral stats" }, { status: 500 });
  }
}
