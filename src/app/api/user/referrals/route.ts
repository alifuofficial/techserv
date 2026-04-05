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

    return NextResponse.json({
      referralCode: referralCode,
      referralCount: user._count.referrals || 0,
    });
  } catch (error) {
    console.error("Referral API Error:", error);
    return NextResponse.json({ error: "Failed to fetch referral stats" }, { status: 500 });
  }
}
