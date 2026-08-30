import { db } from "@/lib/db";
import { format, subDays } from "date-fns";
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
    db.user.count().catch(() => 0),
    db.campaign.count().catch(() => 0),
    db.campaign.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    db.campaign.count({ where: { status: "COMPLETED" } }).catch(() => 0),
    db.campaign.count({ where: { status: "DRAFT" } }).catch(() => 0),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "APPROVED" },
    }).catch(() => ({ _sum: { amount: 0 } })),
    db.entry.count().catch(() => 0),
    db.campaign.findMany({
      include: {
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }).catch(() => []),
    db.payment.findMany({
      where: { status: "APPROVED" },
      select: {
        amount: true,
        provider: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }).catch(() => []),
    db.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }).catch(() => []),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true },
    }).catch(() => []),
    db.draw.findMany({
      where: { status: "COMPLETED", winningEntryId: { not: null } },
      take: 3,
      orderBy: { completedAt: "desc" },
      include: {
        campaign: { select: { title: true } },
      },
    }).catch(() => []),
  ]);

  const totalRevenue = totalRevenueAgg?._sum?.amount || 0;

  // 1. Calculate Real Revenue Chart (Last 7 days)
  const revenueByDayMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const key = format(d, "MMM d");
    revenueByDayMap.set(key, 0);
  }

  approvedPayments.forEach((p) => {
    try {
      const key = format(new Date(p.createdAt), "MMM d");
      if (revenueByDayMap.has(key)) {
        revenueByDayMap.set(key, (revenueByDayMap.get(key) || 0) + (p.amount || 0));
      }
    } catch (e) {}
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
    providerSums[prov] = (providerSums[prov] || 0) + (p.amount || 0);
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

  // 4. Real Recent Activity Feed (Strict ISO String serialization)
  const activityList: any[] = [];

  recentUsers.forEach((u) => {
    activityList.push({
      type: "USER",
      title: `New user registered: ${u.name || "User"}`,
      subtitle: u.email || `@user_${u.id.slice(-4)}`,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      formattedTime: u.createdAt ? format(new Date(u.createdAt), "MMM d, HH:mm") : "",
    });
  });

  recentPayments.forEach((p) => {
    activityList.push({
      type: "PAYMENT",
      title: `Payment ${(p.status || "APPROVED").toLowerCase()}: ${(p.amount || 0).toLocaleString()} ${p.currency || "ETB"}`,
      subtitle: `${p.provider} (${p.transactionId || "Direct"}) • ${p.user?.name || "User"}`,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      formattedTime: p.createdAt ? format(new Date(p.createdAt), "MMM d, HH:mm") : "",
    });
  });

  recentDraws.forEach((d) => {
    const drawDate = d.completedAt || d.createdAt;
    activityList.push({
      type: "WINNER",
      title: `Winner selected for "${d.campaign?.title || "Campaign"}"`,
      subtitle: `Provably fair draw completed`,
      createdAt: drawDate ? new Date(drawDate).toISOString() : new Date().toISOString(),
      formattedTime: drawDate ? format(new Date(drawDate), "MMM d, HH:mm") : "",
    });
  });

  activityList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const finalActivities = activityList.slice(0, 6);

  // 5. Top Campaigns
  const mappedCampaigns = campaigns.map((c) => {
    let formattedEndsAt = "";
    try {
      formattedEndsAt = c.endsAt ? `Ends ${format(new Date(c.endsAt), "MMM d, yyyy")}` : "";
    } catch (e) {}

    const entriesSold = c._count?.entries || 0;
    const max = c.maxEntries || 1;

    return {
      id: c.id,
      name: c.title,
      time: formattedEndsAt,
      img: c.imageUrl || "",
      sold: entriesSold,
      total: c.maxEntries || 0,
      rev: (c.entryPrice || 0) * entriesSold,
      conv: `${Math.min(100, Math.round((entriesSold / max) * 100))}%`,
      status: c.status,
    };
  });

  const dashboardData = {
    totalUsers: totalUsers || 0,
    totalCampaigns: totalCampaigns || 0,
    activeCampaigns: activeCampaigns || 0,
    totalRevenue: totalRevenue || 0,
    totalTicketsCount: totalTicketsCount || 0,
    revenueData: revenueData || [],
    pieData: pieData || [],
    paymentMethods: paymentMethods || [],
    activities: finalActivities || [],
    campaigns: mappedCampaigns || [],
  };

  return <AdminDashboardClient data={dashboardData} />;
}
