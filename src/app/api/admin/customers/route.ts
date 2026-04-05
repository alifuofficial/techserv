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

    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        telegram: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { orders: true },
        },
        orders: {
          where: { status: "completed" },
          select: { amount: true },
        },
      },
    });

    // Map to compute totalSpent from completed orders
    const customers = users.map((user) => {
      const { orders, ...rest } = user;
      const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
      return {
        ...rest,
        totalSpent,
      };
    });

    return NextResponse.json(customers);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
