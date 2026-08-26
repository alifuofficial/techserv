'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getTelegramDashboardData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, balance: true }
  });

  const campaigns = await db.campaign.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const ticketsCount = user ? await db.entry.count({
    where: { userId: user.id }
  }) : 0;

  const winsCount = user ? await db.winner.count({
    where: { userId: user.id }
  }) : 0;

  return {
    balance: user?.balance || 0,
    campaigns,
    ticketsCount,
    winsCount
  };
}
