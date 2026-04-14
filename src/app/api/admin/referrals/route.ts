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

    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "referralCount";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { referralCode: { contains: search } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          referralCode: true,
          createdAt: true,
          _count: {
            select: {
              referrals: true,
              orders: true,
            },
          },
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
            take: 5,
          },
          orders: {
            where: { status: { in: ["completed", "approved"] } },
            select: { amount: true },
          },
        },
        orderBy:
          sortBy === "referralCount"
            ? { referrals: { _count: sortOrder as "asc" | "desc" } }
            : sortBy === "name"
            ? { name: sortOrder as "asc" | "desc" }
            : { createdAt: sortOrder as "asc" | "desc" },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    const referralData = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      createdAt: user.createdAt.toISOString(),
      referralCount: user._count.referrals,
      orderCount: user._count.orders,
      totalSpent: user.orders.reduce((sum, o) => sum + o.amount, 0),
      recentReferrals: user.referrals.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        createdAt: r.createdAt.toISOString(),
        ordersCount: r._count.orders,
        totalSpent: r.orders.reduce((sum, o) => sum + o.amount, 0),
      })),
    }));

    const totalReferrals = await db.user.count({
      where: { referredById: { not: null } },
    });

    const topReferrers = referralData
      .filter((u) => u.referralCount > 0)
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 5);

    return NextResponse.json({
      users: referralData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalReferrals,
        totalReferrers: referralData.filter((u) => u.referralCount > 0).length,
        topReferrers,
      },
    });
  } catch (error) {
    console.error("Admin Referrals API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral data" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, referralCode } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (referralCode !== undefined) {
      const existing = await db.user.findFirst({
        where: {
          referralCode,
          id: { not: userId },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Referral code already in use" },
          { status: 400 }
        );
      }

      await db.user.update({
        where: { id: userId },
        data: { referralCode },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Referrals PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update referral" },
      { status: 500 }
    );
  }
}
