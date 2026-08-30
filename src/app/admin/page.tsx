import { db } from "@/lib/db";
import { format, subDays, startOfDay } from "date-fns";
import AdminDashboardClient from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalCampaigns,
    activeCampaigns,
    completedCampaigns,
    draftCampaigns,
    totalRevenueAgg,
    totalTicketsCount,
    campaigns,
    approvedPayments,
    recentPayments,
    recentUsers,
    recentDraws,
  ] = await Promise.all([
    db.user.count(),
    db.campaign.count(),
    db.campaign.count({ where: { status: "ACTIVE" } }),
    db.campaign.count({ where: { status: "COMPLETED" } }),
    db.campaign.count({ where: { status: "DRAFT" } }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "APPROVED" },
    }),
    db.entry.count(),
    db.campaign.findMany({
      include: {
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.payment.findMany({
      where: { status: "APPROVED" },
      select: {
        amount: true,
        provider: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    db.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    db.draw.findMany({
      where: { status: "COMPLETED", winningEntryId: { not: null } },
      take: 3,
      orderBy: { completedAt: "desc" },
      include: {
        campaign: { select: { title: true } },
      },
    }),
  ]);

  const totalRevenue = totalRevenueAgg._sum.amount || 0;

  // 1. Calculate Real Revenue Chart (Last 7 intervals / days)
  const revenueByDayMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const key = format(d, "MMM d");
    revenueByDayMap.set(key, 0);
  }

  approvedPayments.forEach((p) => {
    const key = format(new Date(p.createdAt), "MMM d");
    if (revenueByDayMap.has(key)) {
      revenueByDayMap.set(key, (revenueByDayMap.get(key) || 0) + p.amount);
    }
  });

  const revenueData = Array.from(revenueByDayMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // 2. Real Campaign Performance Breakdown (Pie Chart)
  const pieData = [
    { name: "Active", value: activeCampaigns, color: "#10B981" },
    { name: "Completed", value: completedCampaigns, color: "#3B82F6" },
    { name: "Draft / Paused", value: draftCampaigns, color: "#94A3B8" },
  ].filter((p) => p.value > 0);

  if (pieData.length === 0) {
    pieData.push({ name: "No Campaigns", value: 1, color: "#94A3B8" });
  }

  // 3. Real Payment Methods Breakdown
  const providerSums: Record<string, number> = {};
  approvedPayments.forEach((p) => {
    const prov = p.provider?.toUpperCase() || "OTHER";
    providerSums[prov] = (providerSums[prov] || 0) + p.amount;
  });

  const totalProvRevenue = Math.max(1, totalRevenue);
  const paymentMethods = [
    {
      name: "Telebirr",
      amount: (providerSums["TELEBIRR"] || 0) + (providerSums["MANUAL_TELEBIRR"] || 0),
      color: "#10B981",
      icon: "telebirr",
    },
    {
      name: "CBE Birr",
      amount: (providerSums["CBE"] || 0) + (providerSums["MANUAL_CBE"] || 0),
      color: "#8B5CF6",
      icon: "cbe",
    },
    {
      name: "MilkyTech Wallet",
      amount: providerSums["WALLET"] || 0,
      color: "#059669",
      icon: "wallet",
    },
  ].map((pm) => ({
    ...pm,
    percentage: Math.round((pm.amount / totalProvRevenue) * 100),
  }));

  // 4. Real Recent Activity Feed
  const activityList: any[] = [];

  recentUsers.forEach((u) => {
    activityList.push({
      type: "USER",
      title: `New user registered: ${u.name || "User"}`,
      subtitle: u.email || `@user_${u.id.slice(-4)}`,
      createdAt: u.createdAt,
    });
  });

  recentPayments.forEach((p) => {
    activityList.push({
      type: "PAYMENT",
      title: `Payment ${p.status.toLowerCase()}: ${p.amount.toLocaleString()} ${p.currency}`,
      subtitle: `${p.provider} (${p.transactionId || "Direct"}) • ${p.user?.name || "User"}`,
      createdAt: p.createdAt,
    });
  });

  recentDraws.forEach((d) => {
    activityList.push({
      type: "WINNER",
      title: `Winner selected for "${d.campaign.title}"`,
      subtitle: `Provably fair draw completed`,
      createdAt: d.completedAt || d.createdAt,
    });
  });

  activityList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const finalActivities = activityList.slice(0, 6);

  // 5. Top Campaigns
  const mappedCampaigns = campaigns.map((c) => ({
    id: c.id,
    name: c.title,
    time: `Ends ${format(new Date(c.endsAt), "MMM d, yyyy")}`,
    img: c.imageUrl || "",
    sold: c._count.entries,
    total: c.maxEntries,
    rev: c.entryPrice * c._count.entries,
    conv: `${Math.min(100, Math.round((c._count.entries / (c.maxEntries || 1)) * 100))}%`,
    status: c.status,
  }));

  const dashboardData = {
    totalUsers,
    totalCampaigns,
    activeCampaigns,
    totalRevenue,
    totalTicketsCount,
    revenueData,
    pieData,
    paymentMethods,
    activities: finalActivities,
    campaigns: mappedCampaigns,
  };

  return <AdminDashboardClient data={dashboardData} />;
}
